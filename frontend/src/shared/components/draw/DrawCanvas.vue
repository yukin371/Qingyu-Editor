<template>
  <div ref="_containerRef" class="flex h-full flex-col bg-white">
    <div
      class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"
    >
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2">
          <QyButton size="sm" variant="secondary" @click="handleAddNode">
            <span class="inline-flex items-center gap-1.5">
              <QyIcon name="Plus" :size="14" />
              添加节点
            </span>
          </QyButton>
          <QyButton
            size="sm"
            :variant="connectingMode ? 'primary' : 'secondary'"
            @click="connectingMode = !connectingMode"
          >
            <span class="inline-flex items-center gap-1.5">
              <QyIcon name="Connection" :size="14" />
              {{ connectingMode ? '已激活' : '连接' }}
            </span>
          </QyButton>
        </div>

        <span class="h-5 w-px bg-slate-200" />

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="draw-toolbar-icon"
            title="放大"
            :disabled="!drawEngine"
            @click="handleZoomIn"
          >
            <QyIcon name="Plus" :size="14" />
          </button>
          <button
            type="button"
            class="draw-toolbar-icon"
            title="缩小"
            :disabled="!drawEngine"
            @click="handleZoomOut"
          >
            <QyIcon name="Minus" :size="14" />
          </button>
          <button
            type="button"
            class="draw-toolbar-icon"
            title="适配屏幕"
            :disabled="!drawEngine"
            @click="fitToScreen"
          >
            <QyIcon name="Expand" :size="14" />
          </button>
        </div>

        <span class="h-5 w-px bg-slate-200" />

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="draw-toolbar-icon"
            title="撤销"
            :disabled="!canUndo"
            @click="undo"
          >
            <QyIcon name="ArrowLeft" :size="14" />
          </button>
          <button
            type="button"
            class="draw-toolbar-icon"
            title="重做"
            :disabled="!canRedo"
            @click="redo"
          >
            <QyIcon name="ArrowRight" :size="14" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <QySelect
          v-model="currentTheme"
          class="w-[120px]"
          size="sm"
          :options="themeOptions"
          placeholder="主题"
          @change="handleThemeChange"
        />

        <span class="h-5 w-px bg-slate-200" />

        <QyDropdown
          :items="exportItems"
          placement="bottom-end"
          trigger="click"
          @select="handleExport"
        >
          <QyButton size="sm" variant="secondary">
            <span class="inline-flex items-center gap-1.5">
              导出
              <QyIcon name="ArrowDown" :size="14" />
            </span>
          </QyButton>
        </QyDropdown>
      </div>
    </div>

    <div ref="canvasWrapperRef" class="relative flex-1 overflow-hidden bg-slate-50">
      <canvas
        ref="canvasRef"
        class="absolute left-0 top-0 cursor-crosshair active:cursor-grabbing"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
        @wheel="handleCanvasWheel"
        @contextmenu.prevent="handleContextMenu"
      />

      <div class="absolute left-0 top-0 origin-top-left transition-transform duration-100 ease-out" :style="getLayerStyle()">
        <div
          v-for="node in nodes"
          :key="node.id"
          class="absolute flex cursor-move select-none flex-col items-center justify-center rounded-md border-2 bg-white transition-all"
          :class="node.id === getSelectedNodeId() ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.45)]' : 'border-blue-500 hover:shadow-[0_2px_12px_rgba(59,130,246,0.3)]'"
          :style="getNodeStyle(node)"
          @mousedown.stop="handleNodeMouseDown(node, $event)"
          @click.stop="handleNodeClick(node)"
          @dblclick.stop="handleEditNode(node)"
        >
          <div class="flex h-full w-full flex-col items-center justify-center px-2">
            <div class="break-words px-1 text-center text-sm font-semibold text-slate-800">
              {{ node.label }}
            </div>
            <div v-if="node.metadata?.subtitle" class="text-center text-xs text-slate-400">
              {{ node.metadata.subtitle }}
            </div>
          </div>
          <div
            v-if="node.id === getSelectedNodeId()"
            class="absolute right-[-60px] top-0 flex gap-1"
          >
            <button type="button" class="draw-node-action" title="编辑" @click.stop="handleEditNode(node)">
              <QyIcon name="Edit" :size="14" />
            </button>
            <button type="button" class="draw-node-action text-rose-500" title="删除" @click.stop="handleDeleteNode(node)">
              <QyIcon name="Delete" :size="14" />
            </button>
          </div>
        </div>
      </div>

      <Transition name="slide-left">
        <aside
          v-if="selectedNode"
          class="absolute bottom-0 right-0 top-0 z-[100] flex w-80 flex-col border-l border-slate-200 bg-white"
        >
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <h3 class="m-0 text-base font-semibold text-slate-800">节点属性</h3>
            <button type="button" class="draw-toolbar-icon" @click="selectedNode = null">
              <QyIcon name="Close" :size="14" />
            </button>
          </div>

          <QyScrollbar class="flex-1">
            <div class="space-y-4 p-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">名称</label>
                <QyInput v-model="nodeForm.label" @input="updateSelectedNode" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">描述</label>
                <QyTextarea
                  v-model="nodeForm.description"
                  :rows="3"
                  @input="updateSelectedNode"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">宽度</label>
                <QyInputNumber v-model="nodeForm.width" @change="updateSelectedNode" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">高度</label>
                <QyInputNumber v-model="nodeForm.height" @change="updateSelectedNode" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">颜色</label>
                <label class="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
                  <input
                    v-model="nodeForm.color"
                    type="color"
                    class="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                    @input="updateSelectedNode"
                    @change="updateSelectedNode"
                  />
                  <span class="text-sm text-slate-500">{{ nodeForm.color }}</span>
                </label>
              </div>
              <QyButton block variant="danger" @click="handleDeleteNode(selectedNode)">
                删除节点
              </QyButton>
            </div>
          </QyScrollbar>
        </aside>
      </Transition>
    </div>

    <QyDialog
      v-model:visible="editDialogVisible"
      title="编辑节点"
      size="lg"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700">节点名称</label>
          <QyInput v-model="editForm.label" placeholder="请输入节点名称" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700">描述</label>
          <QyTextarea
            v-model="editForm.description"
            :rows="3"
            placeholder="请输入节点描述（可选）"
          />
        </div>
      </div>
      <template #footer>
        <QyButton variant="secondary" @click="editDialogVisible = false">取消</QyButton>
        <QyButton variant="primary" @click="confirmEdit">确定</QyButton>
      </template>
    </QyDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  QyButton,
  QyDialog,
  QyDropdown,
  QyIcon,
  QyInput,
  QyInputNumber,
  QyScrollbar,
  QySelect,
  QyTextarea,
  type DropdownItem,
} from '@/design-system/components'
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

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '默认', value: 'default' },
]

const exportItems: DropdownItem[] = [
  { key: 'json', label: 'JSON' },
  { key: 'markdown', label: 'Markdown' },
  { key: 'svg', label: 'SVG' },
]

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
  color: '#ffffff',
})

const editForm = ref({
  label: '',
  description: '',
})

const getSelectedNodeId = (): string | null => {
  if (!drawEngine) return null
  const selected = drawEngine.getSelectedNode()
  return selected?.id || null
}

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

  const rect = canvasWrapperRef.value.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`

  ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  drawEngine = new DrawEngine({
    ...props.config,
    canvasId: 'main-canvas',
    enableHistory: true,
    maxHistorySteps: 50,
  })

  drawEngine.on('nodeCreate', () => {
    nodes.value = drawEngine!.getAllNodes()
    render()
  })

  drawEngine.on('nodeUpdate', (event) => {
    nodes.value = drawEngine!.getAllNodes()
    emit('node-changed', event.node!)
    render()
  })

  drawEngine.on('edgeCreate', () => {
    edges.value = drawEngine!.getAllEdges()
    render()
  })

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
  if (!drawEngine || !props.initialData) return

  props.initialData.nodes.forEach((node) => {
    drawEngine!.createNode(node.label, node.x, node.y, node.metadata)
  })

  props.initialData.edges.forEach((edge) => {
    drawEngine!.createEdge(edge.fromNodeId, edge.toNodeId, edge.label)
  })

  nodes.value = drawEngine.getAllNodes()
  edges.value = drawEngine.getAllEdges()
}

const render = () => {
  if (!canvasRef.value || !ctx || !drawEngine) return

  const rect = canvasRef.value.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  ctx.fillStyle = drawEngine.getTheme().backgroundColor
  ctx.fillRect(0, 0, width, height)

  if (drawEngine.getCanvas().gridEnabled) {
    drawGrid()
  }

  drawEdges()

  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  animationFrameId = requestAnimationFrame(render)
}

const drawGrid = () => {
  if (!ctx || !drawEngine || !canvasRef.value) return

  const gridSize = drawEngine.getCanvas().gridSize || 20
  const theme = drawEngine.getTheme()
  const rect = canvasRef.value.getBoundingClientRect()

  ctx.strokeStyle = theme.gridColor || '#e5e7eb'
  ctx.lineWidth = 0.5

  for (let i = 0; i < rect.width; i += gridSize) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, rect.height)
    ctx.stroke()
  }

  for (let i = 0; i < rect.height; i += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(rect.width, i)
    ctx.stroke()
  }
}

const drawEdges = () => {
  if (!ctx || !drawEngine) return

  const allEdges = drawEngine.getAllEdges()
  const theme = drawEngine.getTheme()

  allEdges.forEach((edge) => {
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
    transform: `translate(${canvas.offsetX}px, ${canvas.offsetY}px) scale(${canvas.zoom})`,
  }
}

const getNodeStyle = (node: DrawNode) => ({
  left: `${node.x}px`,
  top: `${node.y}px`,
  width: `${node.width}px`,
  height: `${node.height}px`,
  backgroundColor: node.color || '#ffffff',
  borderColor: node.borderColor || '#409eff',
})

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
    color: node.color || '#ffffff',
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
  if (!draggedNodeId.value || !drawEngine || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const offsetX = (event.clientX - rect.left) / drawEngine.getCanvas().zoom
  const offsetY = (event.clientY - rect.top) / drawEngine.getCanvas().zoom

  const node = drawEngine.getNode(draggedNodeId.value)
  if (node) {
    drawEngine.updateNode(draggedNodeId.value, {
      x: offsetX - node.width / 2,
      y: offsetY - node.height / 2,
    })
  }
}

const handleCanvasMouseUp = (event: MouseEvent) => {
  if (connectingMode.value && connectFromNodeId.value && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    for (const node of nodes.value) {
      if (
        x >= node.x &&
        x <= node.x + node.width &&
        y >= node.y &&
        y <= node.y + node.height
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
  if (!drawEngine || !canvasRef.value) return

  const factor = event.deltaY > 0 ? 0.9 : 1.1
  const rect = canvasRef.value.getBoundingClientRect()
  drawEngine.zoom(factor, event.clientX - rect.left, event.clientY - rect.top)
}

const handleContextMenu = (_event: MouseEvent) => {}

const handleEditNode = (node: DrawNode) => {
  editingNode.value = node
  editForm.value = {
    label: node.label,
    description: node.description || '',
  }
  editDialogVisible.value = true
}

const confirmEdit = () => {
  if (!editingNode.value || !drawEngine) return
  drawEngine.updateNode(editingNode.value.id, {
    label: editForm.value.label,
    description: editForm.value.description,
  })
  editDialogVisible.value = false
}

const handleDeleteNode = (node: DrawNode) => {
  messageBox
    .confirm('确定要删除该节点吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    .then(() => {
      if (drawEngine) {
        drawEngine.deleteNode(node.id)
        selectedNode.value = null
        nodes.value = drawEngine.getAllNodes()
      }
    })
    .catch(() => {})
}

const updateSelectedNode = () => {
  if (!selectedNode.value || !drawEngine) return
  drawEngine.updateNode(selectedNode.value.id, {
    label: nodeForm.value.label,
    description: nodeForm.value.description,
    width: nodeForm.value.width,
    height: nodeForm.value.height,
    color: nodeForm.value.color,
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
    case 'markdown': {
      const markdown = drawEngine.exportAsMarkdown()
      emit('export', { type: 'markdown', data: markdown })
      message.success('已导出为Markdown')
      break
    }
    case 'svg': {
      const rect = canvasRef.value?.getBoundingClientRect()
      if (rect) {
        const svg = drawEngine.exportAsSVG(rect.width, rect.height)
        emit('export', { type: 'svg', data: svg })
      }
      break
    }
  }
}
</script>

<style scoped>
.draw-toolbar-icon {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  transition: all 0.15s ease;
}

.draw-toolbar-icon:hover:not(:disabled) {
  background: #eff6ff;
  color: #1d4ed8;
}

.draw-toolbar-icon:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.draw-node-action {
  display: inline-flex;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: white;
  color: #64748b;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  transition: all 0.15s ease;
}

.draw-node-action:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}
</style>
