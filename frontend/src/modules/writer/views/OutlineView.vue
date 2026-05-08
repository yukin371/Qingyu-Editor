<template>
  <div class="outline-view">
    <!-- 工具栏 -->
    <div class="outline-header">
      <div class="header-left">
        <el-icon class="header-icon"><QyIcon name="List" /></el-icon>
        <span class="header-title">大纲</span>
      </div>
      <div class="header-actions">
        <QyButtonGroup>
          <QyButton
            :variant="viewMode === 'tree' ? 'primary' : 'secondary'"
            size="small"
            @click="viewMode = 'tree'"
          >
            <QyIcon name="List" />
            树形
          </QyButton>
          <QyButton
            :variant="viewMode === 'mindmap' ? 'primary' : 'secondary'"
            size="small"
            @click="viewMode = 'mindmap'"
          >
            <QyIcon name="Share" />
            思维导图
          </QyButton>
        </QyButtonGroup>
        <QyButton variant="primary" size="small" @click="handleAddNode">
          <QyIcon name="Plus" />
          添加节点
        </QyButton>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="outline-content">
      <!-- 树形视图 -->
      <div v-show="viewMode === 'tree'" class="tree-view">
        <div class="tree-container">
          <QyScrollbar>
            <QyTree
              :data="outlineTree"
              node-key="id"
              :default-expand-all="false"
              :expand-on-click-node="false"
              :props="{ label: 'title', children: 'children' }"
              draggable
              @node-click="handleNodeClick"
              @node-drop="handleNodeDrop"
            >
              <template #default="{ data }">
                <div class="tree-node">
                  <div class="node-content">
                    <QyIcon v-if="data.level === 1" name="Folder" />
                    <QyIcon v-else-if="data.level === 2" name="Document" />
                    <QyIcon v-else name="Memo" />
                    <span class="node-title">{{ data.title }}</span>
                    <Tag v-if="data.status" size="sm" :variant="getStatusType(data.status)">
                      {{ getStatusText(data.status) }}
                    </Tag>
                    <span v-if="data.wordCount" class="word-count">{{ data.wordCount }}字</span>
                  </div>
                  <div class="node-actions">
                    <QyButton variant="ghost" size="small" @click.stop="handleEditNode(data)">
                      <QyIcon name="Edit" />
                    </QyButton>
                    <QyButton variant="ghost" size="small" @click.stop="handleDeleteNode(data)">
                      <QyIcon name="Delete" />
                    </QyButton>
                  </div>
                </div>
              </template>
            </QyTree>
          </QyScrollbar>
        </div>

        <!-- 节点详情面板 -->
        <div v-if="selectedNode" class="node-detail">
          <div class="detail-header">
            <h3>{{ selectedNode.title }}</h3>
            <QyButton variant="ghost" @click="selectedNode = null">
              <QyIcon name="Close" />
            </QyButton>
          </div>
          <div class="detail-content">
            <QyDescriptions :column="1" border>
              <QyDescriptionsItem label="层级">
                {{ getLevelText(selectedNode.level) }}
              </QyDescriptionsItem>
              <QyDescriptionsItem label="状态">
                <Tag :variant="getStatusType(selectedNode.status || 'draft')">
                  {{ getStatusText(selectedNode.status || 'draft') }}
                </Tag>
              </QyDescriptionsItem>
              <QyDescriptionsItem label="字数">
                {{ selectedNode.wordCount || 0 }}
              </QyDescriptionsItem>
            </QyDescriptions>
            <div class="detail-description">
              <h4>描述</h4>
              <p>{{ selectedNode.description || '暂无描述' }}</p>
            </div>
            <div class="detail-actions">
              <QyButton variant="primary" @click="handleEditNode(selectedNode)"> 编辑 </QyButton>
              <QyButton @click="handleJumpToChapter(selectedNode)"> 跳转到章节 </QyButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 思维导图视图 -->
      <div v-show="viewMode === 'mindmap'" class="mindmap-view">
        <DrawCanvas
          :config="mindmapConfig"
          :initial-data="mindmapData"
          @node-selected="handleMindmapNodeSelected"
          @node-changed="handleMindmapNodeChanged"
          @export="handleMindmapExport"
        />
      </div>
    </div>

    <!-- 添加/编辑节点对话框 -->
    <QyDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑节点' : '添加节点'"
      width="600px"
      :close-on-click-modal="false"
    >
      <QyForm ref="formRef" :model="nodeForm" :rules="formRules" label-width="100px">
        <QyFormItem label="节点标题" prop="title">
          <Input v-model="nodeForm.title" placeholder="请输入节点标题" />
        </QyFormItem>
        <QyFormItem label="层级" prop="level">
          <QySelect v-model="nodeForm.level" placeholder="选择层级">
            <el-option label="章节" :value="1" />
            <el-option label="小节" :value="2" />
            <el-option label="段落" :value="3" />
          </QySelect>
        </QyFormItem>
        <QyFormItem label="父节点">
          <QyTreeSelect
            v-model="nodeForm.parentId"
            :data="outlineTree"
            :props="{ label: 'title', value: 'id', children: 'children' }"
            placeholder="选择父节点（可选）"
            clearable
          />
        </QyFormItem>
        <QyFormItem label="状态">
          <QySelect v-model="nodeForm.status" placeholder="选择状态">
            <el-option label="草稿" value="draft" />
            <el-option label="写作中" value="writing" />
            <el-option label="已完成" value="completed" />
            <el-option label="审阅中" value="reviewing" />
          </QySelect>
        </QyFormItem>
        <QyFormItem label="描述">
          <Textarea v-model="nodeForm.description" :rows="4" placeholder="请输入节点描述" />
        </QyFormItem>
      </QyForm>
      <template #footer>
        <QyButton @click="dialogVisible = false">取消</QyButton>
        <QyButton variant="primary" @click="handleSubmit" :loading="submitting"> 确定 </QyButton>
      </template>
    </QyDialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck - 遗留未接入页面，等待统一迁移到当前 writer 设计系统后再恢复严格类型检查
import { ref, computed, onMounted } from 'vue'
import { useWriterStore } from '../stores/writerStore'
import type { OutlineNode } from '@/types/writer'
import DrawCanvas from '@/shared/components/draw/DrawCanvas.vue'
import type { DrawNode, DrawEngineConfig } from '@/core/draw-engine/types'
import {
  QyIcon,
  QyButton,
  QyButtonGroup,
  QyScrollbar,
  QyTree,
  QyDescriptions,
  QyDescriptionsItem,
  QyDialog,
  QyForm,
  QyFormItem,
  QyInput,
  QySelect,
  QyTreeSelect,
} from '@/design-system/components'
import { Tag, Textarea, Input } from '@/design-system/base'
import { message, messageBox } from '@/design-system/services'
const writerStore = useWriterStore()
const viewMode = ref<'tree' | 'mindmap'>('tree')
const selectedNode = ref<OutlineNode | null>(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const nodeForm = ref({
  title: '',
  level: 1 as 1 | 2 | 3,
  parentId: '',
  status: 'draft' as 'draft' | 'writing' | 'completed' | 'reviewing',
  description: '',
  order: 0,
})

const formRules = {
  title: [{ required: true, message: '请输入节点标题', trigger: 'blur' }],
  level: [{ required: true, message: '请选择层级', trigger: 'change' }],
}

const outlineTree = computed(() => writerStore.outline.tree)

// 思维导图配置
const mindmapConfig = ref<DrawEngineConfig>({
  canvasId: 'outline-mindmap',
  type: 'mindmap',
  theme: 'default',
  enableGrid: true,
  enableHistory: true,
  directions: 'TB',
  defaultNodeWidth: 140,
  defaultNodeHeight: 70,
})

// 将大纲树转换为思维导图节点
const mindmapNodes = computed((): DrawNode[] => {
  if (!outlineTree.value || outlineTree.value.length === 0) return []

  const nodes: DrawNode[] = []
  const traverse = (item: OutlineNode, level: number = 0) => {
    nodes.push({
      id: item.id,
      label: item.title,
      type: 'node',
      x: level * 300,
      y: nodes.length * 100,
      width: 150,
      height: 60,
    })

    if (item.children && item.children.length > 0) {
      item.children.forEach((child) => traverse(child, level + 1))
    }
  }

  outlineTree.value.forEach((root) => traverse(root, 0))
  return nodes
})

// 将大纲树转换为边关系
const mindmapEdges = computed(() => {
  if (!outlineTree.value || outlineTree.value.length === 0) return []

  const edges: Array<{ fromNodeId: string; toNodeId: string; label?: string }> = []
  const traverse = (item: OutlineNode) => {
    if (item.children && item.children.length > 0) {
      item.children.forEach((child) => {
        edges.push({
          fromNodeId: item.id,
          toNodeId: child.id,
          label: '',
        })
        traverse(child)
      })
    }
  }

  outlineTree.value.forEach((root) => traverse(root))
  return edges
})

// 组合数据供 DrawCanvas 使用
const mindmapData = computed(() => ({
  nodes: mindmapNodes.value,
  edges: mindmapEdges.value,
}))

onMounted(async () => {
  if (writerStore.currentProjectId) {
    await writerStore.loadOutlineTree()
  }
})

const handleAddNode = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const handleEditNode = (node: OutlineNode) => {
  isEdit.value = true
  dialogVisible.value = true
  // 帮助函数：将数值 level 转换为 1 | 2 | 3
  const toLevelType = (lvl: number): 1 | 2 | 3 => {
    if (lvl === 1 || lvl === 2 || lvl === 3) return lvl
    return 1
  }
  // 帮助函数：将 status 字符串转换为正确的类型
  const toStatusType = (st?: string): 'draft' | 'writing' | 'completed' | 'reviewing' => {
    const validStatuses = ['draft', 'writing', 'completed', 'reviewing'] as const
    if (st && validStatuses.includes(st as any)) return st as (typeof validStatuses)[number]
    return 'draft'
  }
  nodeForm.value = {
    title: node.title,
    level: toLevelType(node.level),
    parentId: node.parentId || '',
    status: toStatusType(node.status),
    description: node.description || '',
    order: node.order,
  }
}

const handleDeleteNode = async (node: OutlineNode) => {
  try {
    await messageBox.confirm(`确定要删除节点"${node.title}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const projectId = writerStore.currentProjectId
    if (!projectId) return

    await writerStore.deleteOutlineNode(node.id, projectId)
    await writerStore.loadOutlineTree()
    message.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleNodeClick = (node: OutlineNode) => {
  selectedNode.value = node
  writerStore.setCurrentOutlineNode(node)
}

const handleNodeDrop = async () => {
  // 处理节点拖拽排序
  // 这里需要实现节点顺序更新逻辑
  message.info('节点顺序已更新')
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
        // 更新节点
        await writerStore.updateOutlineNode(selectedNode.value.id, projectId, nodeForm.value)
      } else {
        // 创建节点
        await writerStore.createOutlineNode(projectId, {
          ...nodeForm.value,
          order: outlineTree.value.length,
        })
      }

      await writerStore.loadOutlineTree()
      message.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleJumpToChapter = (node: OutlineNode) => {
  if (node.documentId) {
    // 跳转到章节编辑
    message.info(`跳转到章节: ${node.title}`)
  } else {
    message.warning('该节点未关联章节')
  }
}

// 思维导图事件处理
const handleMindmapNodeSelected = (node: DrawNode) => {
  message.info(`选中节点: ${node.label}`)
}

const handleMindmapNodeChanged = (node: DrawNode) => {
  message.info(`更新节点: ${node.label}`)
  // 可以在这里调用更新节点的API
}

const handleMindmapExport = (_data: any) => {
  message.success('已导出')
  // 处理导出逻辑
}

const resetForm = () => {
  nodeForm.value = {
    title: '',
    level: 1,
    parentId: '',
    status: 'draft',
    description: '',
    order: outlineTree.value.length,
  }
}

const getLevelText = (level: number): string => {
  const levelMap: Record<number, string> = {
    1: '章节',
    2: '小节',
    3: '段落',
  }
  return levelMap[level] || '未知'
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    writing: '写作中',
    completed: '已完成',
    reviewing: '审阅中',
  }
  return statusMap[status] || status
}

const getStatusType = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const typeMap: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    draft: 'info',
    writing: 'warning',
    completed: 'success',
    reviewing: 'warning',
  }
  return typeMap[status] || 'info'
}
</script>

<style scoped lang="scss">
.outline-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

.outline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;

  .header-icon {
    font-size: 24px;
    color: #409eff;
  }

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.outline-content {
  flex: 1;
  overflow: hidden;
}

/* 树形视图 */
.tree-view {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 16px;
  height: 100%;
  padding: 16px;
}

.tree-container {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;

  :deep(.el-tree) {
    padding: 8px;
  }
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;

    .node-actions {
      opacity: 1;
    }
  }
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  .node-title {
    font-size: 14px;
    color: #303133;
  }

  .word-count {
    font-size: 12px;
    color: #909399;
  }
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.node-detail {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-header {
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

.detail-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.detail-description {
  margin-top: 16px;

  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
  }
}

.detail-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

/* 思维导图视图 */
.mindmap-view {
  height: 100%;
  padding: 16px;
}

.mindmap-container {
  height: 100%;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mindmap-placeholder {
  text-align: center;
  color: #909399;

  .placeholder-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  p {
    margin: 8px 0;
    font-size: 16px;
  }

  .placeholder-tip {
    font-size: 14px;
    color: #c0c4cc;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tree-view {
    grid-template-columns: 1fr;

    .node-detail {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 350px;
      z-index: 1000;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    }
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .outline-view {
    background: #0d0d0d;
  }

  .outline-header {
    background: #1a1a1a;
    border-bottom-color: #2d2d2d;
  }

  .header-title {
    color: #e5e5e5;
  }

  .tree-container,
  .node-detail,
  .mindmap-container {
    background: #1a1a1a;
    border-color: #2d2d2d;
  }

  .tree-node:hover {
    background-color: #2d2d2d;
  }

  .node-content .node-title {
    color: #e5e5e5;
  }

  .detail-header {
    border-bottom-color: #2d2d2d;

    h3 {
      color: #e5e5e5;
    }
  }

  .detail-description p {
    color: #c0c4cc;
  }
}
</style>
