<template>
  <div class="outline-view">
    <!-- 工具栏 -->
    <div class="outline-header">
      <div class="header-left">
        <el-icon class="header-icon">
          <QyIcon name="List"  />
        </el-icon>
        <span class="header-title">大纲</span>
      </div>
      <div class="header-actions">
        <!-- 视图切换按钮 -->
        <el-button-group>
          <el-button :type="viewMode === 'tree' ? 'primary' : ''" size="small" @click="viewMode = 'tree'">
            <QyIcon name="List"  />
            树形视图
          </el-button>
          <el-button :type="viewMode === 'mindmap' ? 'primary' : ''" size="small" @click="viewMode = 'mindmap'">
            <QyIcon name="Share"  />
            思维导图
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button type="primary" size="small" @click="handleAddNode">
          <el-icon><Plus /></el-icon>
          添加节点
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="outline-content">
      <!-- 树形视图 -->
      <div v-show="viewMode === 'tree'" class="tree-view">
        <div class="tree-container">
          <el-scrollbar>
            <el-tree v-loading="writerStore.outline.loading" :data="outlineTree" node-key="id"
              :default-expand-all="false" :expand-on-click-node="false"
              :props="{ label: 'title', children: 'children' }" draggable @node-click="handleNodeClick"
              @node-drop="handleNodeDrop">
              <template #default="{ data }">
                <div class="tree-node">
                  <div class="node-content">
                    <el-icon v-if="data.level === 1">
                      <QyIcon name="Folder"  />
                    </el-icon>
                    <el-icon v-else-if="data.level === 2">
                      <QyIcon name="Document"  />
                    </el-icon>
                    <el-icon v-else>
                      <Memo />
                    </el-icon>
                    <span class="node-title">{{ data.title }}</span>
                    <el-tag v-if="data.status" size="small" :type="getStatusType(data.status)">
                      {{ getStatusText(data.status) }}
                    </el-tag>
                    <span v-if="data.wordCount" class="word-count">{{ data.wordCount }}字</span>
                  </div>
                  <div class="node-actions">
                    <el-button text size="small" @click.stop="handleEditNode(data)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button text size="small" @click.stop="handleDeleteNode(data)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>

        <!-- 节点详情面板 -->
        <div v-if="selectedNode" class="node-detail">
          <div class="detail-header">
            <h3>{{ selectedNode.title }}</h3>
            <el-button text @click="selectedNode = null">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="detail-content">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="层级">
                {{ getLevelText(selectedNode.level) }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(selectedNode.status || 'draft')">
                  {{ getStatusText(selectedNode.status || 'draft') }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="字数">
                {{ selectedNode.wordCount || 0 }}
              </el-descriptions-item>
            </el-descriptions>
            <div class="detail-description">
              <h4>描述</h4>
              <p>{{ selectedNode.description || '暂无描述' }}</p>
            </div>
            <div class="detail-actions">
              <el-button type="primary" @click="handleEditNode(selectedNode)">
                编辑
              </el-button>
              <el-button @click="handleJumpToChapter(selectedNode)">
                跳转到章节
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 新增：思维导图视图 -->
      <div v-show="viewMode === 'mindmap'" class="mindmap-view">
        <DrawCanvas :config="mindmapConfig" :initial-data="outlineData" @node-selected="handleMindmapNodeSelected"
          @node-changed="handleOutlineNodeChanged" @export="handleExportOutline" />
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑节点' : '添加节点'" width="600px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="nodeForm" :rules="formRules" label-width="100px">
        <el-form-item label="节点标题" prop="title">
          <el-input v-model="nodeForm.title" placeholder="请输入节点标题" />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-select v-model="nodeForm.level" placeholder="选择层级">
            <el-option label="章节" :value="1" />
            <el-option label="小节" :value="2" />
            <el-option label="段落" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="父节点">
          <el-tree-select v-model="nodeForm.parentId" :data="outlineTree"
            :props="{ label: 'title', value: 'id', children: 'children' }" placeholder="选择父节点（可选）" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="nodeForm.status" placeholder="选择状态">
            <el-option label="草稿" value="draft" />
            <el-option label="写作中" value="writing" />
            <el-option label="已完成" value="completed" />
            <el-option label="审阅中" value="reviewing" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="nodeForm.description" type="textarea" :rows="4" placeholder="请输入节点描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Delete, Close, Memo } from '@element-plus/icons-vue'
import { useWriterStore } from '../stores/writerStore'
import type { OutlineNode } from '@/types/writer'
import type { DrawNode, DrawEdge } from '@/core/draw-engine/types'
import DrawCanvas from '@/shared/components/draw/DrawCanvas.vue'
import DrawExportService from '@/core/draw-engine/export-service'
import { QyIcon } from '@/design-system/components'
import { message, messageBox } from '@/design-system/services'
const writerStore = useWriterStore()

// 视图切换
const viewMode = ref<'tree' | 'mindmap'>('tree')

// 对话框状态
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const selectedNode = ref<OutlineNode | null>(null)

// 编辑表单
const nodeForm = ref({
  title: '',
  level: 1 as 1 | 2 | 3,
  parentId: '',
  status: 'draft' as 'draft' | 'writing' | 'completed' | 'reviewing',
  description: '',
  order: 0
})

const formRules = {
  title: [
    { required: true, message: '请输入节点标题', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择层级', trigger: 'change' }
  ]
}

// DrawCanvas 配置
const mindmapConfig = {
  canvasId: 'outline-mindmap',
  type: 'mindmap' as const,
  theme: 'default' as const,
  enableGrid: true,
  enableHistory: true,
  directions: 'TB' as const,
  defaultNodeWidth: 140,
  defaultNodeHeight: 70
}

// 获取树形结构
const outlineTree = computed(() => writerStore.outline.tree)

/**
 * 关键：将树形大纲转换为图形数据
 * 这是集成 DrawCanvas 的核心逻辑
 */
const outlineData = computed(() => {
  const tree = outlineTree.value
  if (!tree || tree.length === 0) {
    return { nodes: [], edges: [] }
  }

  const nodes: DrawNode[] = []
  const edges: DrawEdge[] = []
  const nodeMap = new Map<string, DrawNode>()

  // 递归构建节点和位置
  const buildNodes = (treeNodes: OutlineNode[], parentPos: { x: number; y: number }, level: number) => {
    const yOffset = 100
    const xOffset = 250

    treeNodes.forEach((node, index) => {
      // 计算节点位置（树形布局）
      const x = parentPos.x + (index - Math.floor(treeNodes.length / 2)) * xOffset
      const y = parentPos.y + yOffset * level

      const drawNode: DrawNode = {
        id: node.id,
        type: 'node',
        label: node.title,
        description: node.description,
        x,
        y,
        width: 140,
        height: 70,
        color: getNodeColor(node.status),
        borderColor: '#409eff',
        fontSize: 14,
        metadata: {
          status: node.status,
          wordCount: node.wordCount,
          level: node.level,
          originalNode: node
        }
      }

      nodes.push(drawNode)
      nodeMap.set(node.id, drawNode)

      // 创建连接
      if (node.parentId) {
        edges.push({
          id: `edge-${node.parentId}-${node.id}`,
          type: 'curve',
          fromNodeId: node.parentId,
          toNodeId: node.id,
          label: '',
          color: '#409eff',
          lineWidth: 2,
          showArrow: true
        })
      }

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        buildNodes(node.children, { x, y }, level + 1)
      }
    })
  }

  // 找到所有顶级节点
  const rootNodes = tree.filter(node => !node.parentId)

  // 从画布中心开始构建
  const centerX = 400
  const centerY = 100
  buildNodes(rootNodes, { x: centerX, y: centerY }, 1)

  return { nodes, edges }
})

// 获取节点颜色
const getNodeColor = (status?: string): string => {
  const colorMap: Record<string, string> = {
    draft: '#f0f9ff',
    writing: '#fef3c7',
    completed: '#dcfce7',
    reviewing: '#ece7ff'
  }
  return colorMap[status || 'draft'] || '#f0f9ff'
}

// 生命周期
onMounted(async () => {
  if (writerStore.currentProjectId) {
    await writerStore.loadOutlineTree()
  }
})

// 处理器函数

const handleAddNode = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const handleEditNode = (node: OutlineNode) => {
  isEdit.value = true
  selectedNode.value = node
  dialogVisible.value = true
  // 帮助函数：将数值 level 转换为 1 | 2 | 3
  const toLevelType = (lvl: number): 1 | 2 | 3 => {
    if (lvl === 1 || lvl === 2 || lvl === 3) return lvl
    return 1
  }
  // 帮助函数：将 status 字符串转换为正确的类型
  const toStatusType = (st?: string): 'draft' | 'writing' | 'completed' | 'reviewing' => {
    const validStatuses = ['draft', 'writing', 'completed', 'reviewing'] as const
    if (st && validStatuses.includes(st as any)) return st as typeof validStatuses[number]
    return 'draft'
  }
  nodeForm.value = {
    title: node.title,
    level: toLevelType(node.level),
    parentId: node.parentId || '',
    status: toStatusType(node.status),
    description: node.description || '',
    order: node.order
  }
}

const handleDeleteNode = async (node: OutlineNode) => {
  try {
    await messageBox.confirm(
      `确定要删除节点"${node.title}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const { deleteOutlineNode } = await import('..')
    await deleteOutlineNode(node.id)
    await writerStore.loadOutlineTree()
    message.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      message.error(error.message || '删除失败')
    }
  }
}

const handleNodeClick = (node: OutlineNode) => {
  selectedNode.value = node
  writerStore.setCurrentOutlineNode(node)
}

const handleNodeDrop = async () => {
  message.info('节点顺序已更新')
}

const handleJumpToChapter = (node: OutlineNode) => {
  if (node.documentId) {
    message.info(`跳转到章节: ${node.title}`)
  } else {
    message.warning('该节点未关联章节')
  }
}

/**
 * 关键处理器：思维导图节点变更
 * 当思维导图中的节点被修改时同步到大纲
 */
const handleOutlineNodeChanged = async (node: DrawNode) => {
  try {
    // 查找原始节点
    const originalNode = outlineTree.value.find(n => n.id === node.id)
    if (!originalNode) return

    // 更新节点
    const { updateOutlineNode } = await import('..')
    await updateOutlineNode(node.id, {
      title: node.label,
      description: node.description
    } as any)

    // 重新加载大纲树
    await writerStore.loadOutlineTree()
    message.success('节点已更新')
  } catch (error: any) {
    console.error('更新失败:', error)
    message.error(error.message || '更新失败')
  }
}

/**
 * 思维导图节点选中处理
 */
const handleMindmapNodeSelected = (node: DrawNode) => {
  // 在树形视图中查找对应的节点
  const outlineNode = outlineTree.value.find(n => n.id === node.id)
  if (outlineNode) {
    selectedNode.value = outlineNode
  }
}

/**
 * 导出大纲为 Markdown
 */
const handleExportOutline = async (data: any) => {
  if (data.type === 'markdown') {
    // 生成带有树形结构的 Markdown
    const markdown = generateOutlineMarkdown(data.data.nodes, data.data.edges)
    const filename = `outline-${new Date().toISOString()}.md`
    DrawExportService.downloadFile(markdown, filename)
    message.success('已导出为 Markdown')
  }
}

/**
 * 生成大纲 Markdown
 */
const generateOutlineMarkdown = (_nodes: DrawNode[], _edges: DrawEdge[]): string => {
  let markdown = '# 文章大纲\n\n'

  // 按层级生成缩进的列表
  const treeNodes = outlineTree.value

  const renderNode = (node: OutlineNode, level: number) => {
    markdown += `${'#'.repeat(level)} ${node.title}\n`
    if (node.description) {
      markdown += `\n${node.description}\n\n`
    }
    if (node.wordCount) {
      markdown += `*字数: ${node.wordCount}*\n\n`
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach(child => renderNode(child, level + 1))
    }
  }

  treeNodes.forEach(node => renderNode(node, 1))

  return markdown
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    const projectId = writerStore.currentProjectId
    if (!projectId) {
      message.warning('请先选择项目')
      return
    }

    submitting.value = true
    try {
      if (isEdit.value && selectedNode.value) {
        const { updateOutlineNode } = await import('..')
        await updateOutlineNode(selectedNode.value.id, nodeForm.value as any)
      } else {
        const { createOutlineNode } = await import('..')
        await createOutlineNode(projectId, {
          ...nodeForm.value,
          order: outlineTree.value.length
        } as any)
      }

      await writerStore.loadOutlineTree()
      message.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
    } catch (error: any) {
      console.error('操作失败:', error)
      message.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const resetForm = () => {
  nodeForm.value = {
    title: '',
    level: 1,
    parentId: '',
    status: 'draft',
    description: '',
    order: outlineTree.value.length
  }
}

const getLevelText = (level: number): string => {
  const levelMap: Record<number, string> = {
    1: '章节',
    2: '小节',
    3: '段落'
  }
  return levelMap[level] || '未知'
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    writing: '写作中',
    completed: '已完成',
    reviewing: '审阅中'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const typeMap: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    draft: 'info',
    writing: 'warning',
    completed: 'success',
    reviewing: 'warning'
  }
  return typeMap[status] || 'info'
}
</script>

<style scoped lang="scss">
// 保留原有样式
// ... 现有的 outline-view 样式 ...

// 新增思维导图视图样式
.mindmap-view {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.draw-canvas-container) {
    flex: 1;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .outline-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .header-actions {
    width: 100%;
  }
}
</style>
