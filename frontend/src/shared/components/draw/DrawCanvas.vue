<template>
  <div class="draw-canvas-container" ref="_containerRef">
    <!-- 工具栏 -->
    <div class="draw-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            size="small"
            :icon="CirclePlus"
            @click="handleAddNode"
            title="添加节点"
          >
            添加节点
          </el-button>
          <el-button
            size="small"
            :icon="Connection"
            @click="connectingMode = !connectingMode"
            :type="connectingMode ? 'primary' : ''"
            title="连接模式"
          >
            {{ connectingMode ? '已激活' : '连接' }}
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-button
            size="small"
            :icon="ZoomIn"
            @click="handleZoomIn"
            :disabled="!drawEngine"
          />
          <el-button
            size="small"
            :icon="ZoomOut"
            @click="handleZoomOut"
            :disabled="!drawEngine"
          />
          <el-button
            size="small"
            :icon="Expand"
            @click="fitToScreen"
            :disabled="!drawEngine"
          />
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-button
            size="small"
            :icon="Back"
            @click="undo"
            :disabled="!canUndo"
          />
          <el-button
            size="small"
            :icon="Right"
            @click="redo"
            :disabled="!canRedo"
          />
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-select v-model="currentTheme" size="small" style="width: 120px;" @change="handleThemeChange">
          <el-option label="浅色" value="light" />
          <el-option label="深色" value="dark" />
          <el-option label="默认" value="default" />
        </el-select>

        <el-divider direction="vertical" />

        <el-dropdown @command="handleExport">
          <el-button size="small">
            导出 <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="json">JSON</el-dropdown-item>
              <el-dropdown-item command="markdown">Markdown</el-dropdown-item>
              <el-dropdown-item command="svg">SVG</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="draw-canvas-wrapper" ref="canvasWrapperRef">
      <canvas
        ref="canvasRef"
        class="draw-canvas"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
        @wheel="handleCanvasWheel"
        @contextmenu.prevent="handleContextMenu"
      />

      <!-- 节点层 -->
      <div class="nodes-layer" :style="getLayerStyle()">
        <div
          v-for="node in nodes"
          :key="node.id"
          class="draw-node"
          :class="{ 'is-selected': node.id === getSelectedNodeId() }"
          :style="getNodeStyle(node)"
          @mousedown.stop="handleNodeMouseDown(node, $event)"
          @click.stop="handleNodeClick(node)"
          @dblclick.stop="handleEditNode(node)"
        >
          <div class="node-content">
            <div class="node-label">{{ node.label }}</div>
            <div v-if="node.metadata?.subtitle" class="node-subtitle">{{ node.metadata.subtitle }}</div>
          </div>
          <div class="node-actions" v-if="node.id === getSelectedNodeId()">
            <el-button text size="small" :icon="Edit" @click.stop="handleEditNode(node)" />
            <el-button text size="small" :icon="Delete" @click.stop="handleDeleteNode(node)" />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <transition name="slide-left">
      <div v-if="selectedNode" class="property-panel">
        <div class="panel-header">
          <h3>节点属性</h3>
          <el-button text :icon="Close" @click="selectedNode = null" />
        </div>
        <el-scrollbar class="panel-content">
          <el-form :model="nodeForm" label-width="80px" size="small">
            <el-form-item label="名称">
              <el-input v-model="nodeForm.label" @input="updateSelectedNode" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="nodeForm.description"
                type="textarea"
                :rows="3"
                @input="updateSelectedNode"
              />
            </el-form-item>
            <el-form-item label="宽度">
              <el-input-number v-model="nodeForm.width" @change="updateSelectedNode" />
            </el-form-item>
            <el-form-item label="高度">
              <el-input-number v-model="nodeForm.height" @change="updateSelectedNode" />
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="nodeForm.color" @change="updateSelectedNode" />
            </el-form-item>
            <el-button type="primary" @click="handleDeleteNode(selectedNode)" style="width: 100%;">
              删除节点
            </el-button>
          </el-form>
        </el-scrollbar>
      </div>
    </transition>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑节点"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="节点名称">
          <el-input v-model="editForm.label" placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入节点描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  CirclePlus,
  Connection,
  ZoomIn,
  ZoomOut,
  Expand,
  Back,
  Right,
  Edit,
  Delete,
  Close
} from '@element-plus/icons-vue'
import DrawEngine from '@/core/draw-engine/draw-engine'
import type { DrawEngineConfig, DrawNode } from '@/core/draw-engine/types'

interface Props {
  config: DrawEngineConfig
  initialData?: {
    nodes: DrawNode[]
    edges: Array<{ fromNodeId: string; toNodeId: string; label?: string }>
  }
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<{
  'node-selected': [node: DrawNode]
  'node-changed': [node: DrawNode]
  'export': [data: any]
}>()

// containerRef 用于模板引用，但这里不直接使用
const canvasWrapperRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

let drawEngine: DrawEngine | null = null
let ctx: CanvasRenderingContext2D | null = null
let animationFrameId: number | null = null

const nodes = ref<DrawNode[]>([])
const edges = ref<any[]>([])
const selectedNode = ref<DrawNode | null>(null)
const connectingMode = ref(false)
const currentTheme = ref('default')
const draggedNodeId = ref<string | null>(null)
const connectFromNodeId = ref<string | null>(null)
const editDialogVisible = ref(false)
const editingNode = ref<DrawNode | null>(null)
const canUndo = ref(false)
const canRedo = ref(false)

const nodeForm = ref({
  label: '',
  description: '',
  width: 120,
  height: 60,
  color: '#ffffff'
})

const editForm = ref({
  label: '',
  description: ''
})

// 获取选中的节点ID
const getSelectedNodeId = (): string | null => {
  if (!drawEngine) return null
  const selected = drawEngine.getSelectedNode()
  return selected?.id || null
}

// 缩放处理
const handleZoomIn = () => {
  if (drawEngine) {
    drawEngine.zoom(1.2)
  }
}

const handleZoomOut = () => {
  if (drawEngine) {
    drawEngine.zoom(0.8)
  }
}

onMounted(async () => {
  await setupCanvas()
  if (props.initialData) {
    loadInitialData()
  }
})

const setupCanvas = async () => {
  if (!canvasWrapperRef.value) return

  const canvas = canvasRef.value
  if (!canvas) return

  // 设置canvas大小
  const rect = canvasWrapperRef.value.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`

  ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  // 初始化绘制引擎
  drawEngine = new DrawEngine({
    ...props.config,
    canvasId: 'main-canvas',
    enableHistory: true,
    maxHistorySteps: 50
  })

  // 监听引擎事件
  drawEngine.on('nodeCreate', () => {
    nodes.value = drawEngine!.getAllNodes()
    render()
  })

  drawEngine.on('nodeUpdate', (e) => {
    nodes.value = drawEngine!.getAllNodes()
    emit('node-changed', e.node!)
    render()
  })

  drawEngine.on('edgeCreate', () => {
    edges.value = drawEngine!.getAllEdges()
    render()
  })

  // 更新撤销/重做状态
  updateHistoryState()

  render()
}

const updateHistoryState = () => {
  if (drawEngine) {
    canUndo.value = drawEngine.canUndo()
    canRedo.value = drawEngine.canRedo()
  }
}

const loadInitialData = () => {
  if (!drawEngine) return
  if (!props.initialData) return

  props.initialData.nodes.forEach(node => {
    drawEngine!.createNode(node.label, node.x, node.y, node.metadata)
  })

  props.initialData.edges.forEach(edge => {
    drawEngine!.createEdge(edge.fromNodeId, edge.toNodeId, edge.label)
  })

  nodes.value = drawEngine.getAllNodes()
  edges.value = drawEngine.getAllEdges()
}

const render = () => {
  if (!canvasRef.value || !ctx) return

  const rect = canvasRef.value.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  // 清空画布
  ctx.fillStyle = drawEngine!.getTheme().backgroundColor
  ctx.fillRect(0, 0, width, height)

  // 绘制网格
  if (drawEngine!.getCanvas().gridEnabled) {
    drawGrid()
  }

  // 绘制连接线
  drawEdges()

  // 触发下一帧
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  animationFrameId = requestAnimationFrame(render)
}

const drawGrid = () => {
  if (!ctx) return
  const canvas = canvasRef.value!
  const gridSize = drawEngine!.getCanvas().gridSize || 20
  const theme = drawEngine!.getTheme()

  ctx.strokeStyle = theme.gridColor || '#e5e7eb'
  ctx.lineWidth = 0.5

  const rect = canvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  for (let i = 0; i < width; i += gridSize) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, height)
    ctx.stroke()
  }

  for (let i = 0; i < height; i += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(width, i)
    ctx.stroke()
  }
}

const drawEdges = () => {
  if (!ctx) return
  const allEdges = drawEngine!.getAllEdges()
  const theme = drawEngine!.getTheme()

  allEdges.forEach(edge => {
    const fromNode = drawEngine!.getNode(edge.fromNodeId)
    const toNode = drawEngine!.getNode(edge.toNodeId)
    if (!fromNode || !toNode) return

    const x1 = fromNode.x + fromNode.width / 2
    const y1 = fromNode.y + fromNode.height / 2
    const x2 = toNode.x + toNode.width / 2
    const y2 = toNode.y + toNode.height / 2

    ctx!.strokeStyle = edge.color || theme.edgeColor
    ctx!.lineWidth = edge.lineWidth || 2
    ctx!.beginPath()
    ctx!.moveTo(x1, y1)
    ctx!.lineTo(x2, y2)
    ctx!.stroke()

    if (edge.showArrow) {
      drawArrow(x2, y2, x1, y1, edge.color || theme.edgeColor)
    }
  })
}

const drawArrow = (toX: number, toY: number, fromX: number, fromY: number, color: string) => {
  if (!ctx) return
  const angle = Math.atan2(toY - fromY, toX - fromX)
  const arrowSize = 15

  const point1X = toX - arrowSize * Math.cos(angle - Math.PI / 6)
  const point1Y = toY - arrowSize * Math.sin(angle - Math.PI / 6)
  const point2X = toX - arrowSize * Math.cos(angle + Math.PI / 6)
  const point2Y = toY - arrowSize * Math.sin(angle + Math.PI / 6)

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(point1X, point1Y)
  ctx.lineTo(point2X, point2Y)
  ctx.closePath()
  ctx.fill()
}

const getLayerStyle = () => {
  const canvas = drawEngine?.getCanvas()
  if (!canvas) return {}
  return {
    transform: `translate(${canvas.offsetX}px, ${canvas.offsetY}px) scale(${canvas.zoom})`
  }
}

const getNodeStyle = (node: DrawNode) => {
  return {
    left: `${node.x}px`,
    top: `${node.y}px`,
    width: `${node.width}px`,
    height: `${node.height}px`,
    backgroundColor: node.color || '#ffffff',
    borderColor: node.borderColor || '#409eff'
  }
}

const handleAddNode = () => {
  if (!drawEngine) return
  const node = drawEngine.createNode('新节点', 100, 100)
  handleNodeClick(node)
}

const handleNodeClick = (node: DrawNode) => {
  drawEngine?.selectNode(node.id)
  selectedNode.value = node
  nodeForm.value = {
    label: node.label,
    description: node.description || '',
    width: node.width,
    height: node.height,
    color: node.color || '#ffffff'
  }
  emit('node-selected', node)
}

const handleNodeMouseDown = (node: DrawNode, _event: MouseEvent) => {
  if (connectingMode.value) {
    connectFromNodeId.value = node.id
    return
  }
  draggedNodeId.value = node.id
}

const handleCanvasMouseDown = () => {
  selectedNode.value = null
}

const handleCanvasMouseMove = (event: MouseEvent) => {
  if (!draggedNodeId.value || !drawEngine) return

  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const offsetX = (event.clientX - rect.left) / drawEngine.getCanvas().zoom
  const offsetY = (event.clientY - rect.top) / drawEngine.getCanvas().zoom

  const node = drawEngine.getNode(draggedNodeId.value)
  if (node) {
    drawEngine.updateNode(draggedNodeId.value, {
      x: offsetX - node.width / 2,
      y: offsetY - node.height / 2
    })
  }
}

const handleCanvasMouseUp = (_event: MouseEvent) => {
  if (connectingMode.value && connectFromNodeId.value) {
    // 尝试连接到目标节点
    const canvas = canvasRef.value!
    const rect = canvas.getBoundingClientRect()
    const x = _event.clientX - rect.left
    const y = _event.clientY - rect.top

    for (const node of nodes.value) {
      const nodeRect = {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height
      }
      if (
        x >= nodeRect.x &&
        x <= nodeRect.x + nodeRect.width &&
        y >= nodeRect.y &&
        y <= nodeRect.y + nodeRect.height
      ) {
        if (node.id !== connectFromNodeId.value) {
          drawEngine?.createEdge(connectFromNodeId.value, node.id)
        }
        break
      }
    }
    connectFromNodeId.value = null
  }

  draggedNodeId.value = null
}

const handleCanvasWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (!drawEngine) return

  const factor = event.deltaY > 0 ? 0.9 : 1.1
  const rect = canvasRef.value!.getBoundingClientRect()
  const centerX = event.clientX - rect.left
  const centerY = event.clientY - rect.top

  drawEngine.zoom(factor, centerX, centerY)
}

const handleContextMenu = (_event: MouseEvent) => {
  // 实现右键菜单
}

const handleEditNode = (node: DrawNode) => {
  editingNode.value = node
  editForm.value = {
    label: node.label,
    description: node.description || ''
  }
  editDialogVisible.value = true
}

const confirmEdit = () => {
  if (!editingNode.value || !drawEngine) return
  drawEngine.updateNode(editingNode.value.id, {
    label: editForm.value.label,
    description: editForm.value.description
  })
  editDialogVisible.value = false
}

const handleDeleteNode = (node: DrawNode) => {
  messageBox.confirm('确定要删除该节点吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    if (drawEngine) {
      drawEngine.deleteNode(node.id)
      selectedNode.value = null
      nodes.value = drawEngine.getAllNodes()
    }
  }).catch(() => {})
}

const updateSelectedNode = () => {
  if (!selectedNode.value || !drawEngine) return
  drawEngine.updateNode(selectedNode.value.id, {
    label: nodeForm.value.label,
    description: nodeForm.value.description,
    width: nodeForm.value.width,
    height: nodeForm.value.height,
    color: nodeForm.value.color
  })
}

const fitToScreen = () => {
  if (!drawEngine || !canvasWrapperRef.value) return
  const rect = canvasWrapperRef.value.getBoundingClientRect()
  drawEngine.fitToScreen(rect.width, rect.height)
}

const undo = () => {
  drawEngine?.undo()
  nodes.value = drawEngine?.getAllNodes() || []
  updateHistoryState()
}

const redo = () => {
  drawEngine?.redo()
  nodes.value = drawEngine?.getAllNodes() || []
  updateHistoryState()
}

const handleThemeChange = () => {
  if (drawEngine) {
    drawEngine.setTheme(currentTheme.value)
    render()
  }
}

const handleExport = (command: string) => {
  if (!drawEngine) return

  switch (command) {
    case 'json':
      emit('export', { type: 'json', data: drawEngine.exportAsJSON() })
      message.success('已复制到剪贴板')
      break
    case 'markdown':
      {
        const md = drawEngine.exportAsMarkdown()
        emit('export', { type: 'markdown', data: md })
        message.success('已导出为Markdown')
      }
      break
    case 'svg':
      {
        const rect = canvasRef.value?.getBoundingClientRect()
        if (rect) {
          const svg = drawEngine.exportAsSVG(rect.width, rect.height)
          emit('export', { type: 'svg', data: svg })
        }
      }
      break
  }
}
</script>

<style scoped lang="scss">
.draw-canvas-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.draw-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e5e7eb;

  .toolbar-left, .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.draw-canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f9fafb;
}

.draw-canvas {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;

  &:active {
    cursor: grabbing;
  }
}

.nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  transition: transform 0.1s ease-out;
}

.draw-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #409eff;
  border-radius: 4px;
  background-color: #ffffff;
  cursor: move;
  user-select: none;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
  }

  &.is-selected {
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.5);
    border-color: #409eff;
  }

  .node-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .node-label {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    text-align: center;
    word-break: break-word;
    padding: 4px;
  }

  .node-subtitle {
    font-size: 12px;
    color: #909399;
    text-align: center;
  }

  .node-actions {
    display: flex;
    gap: 4px;
    position: absolute;
    right: -60px;
    top: 0;
  }
}

.property-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  z-index: 100;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .panel-content {
    flex: 1;
    padding: 16px;
  }
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}
</style>

