<template>
  <div class="project-workspace workspace" data-testid="workspace" :class="{ 'focus-mode': isFocusMode }">
    <!-- 1. 左侧：项目与文档导航 (使用封装好的组件) -->
    <ProjectSidebar v-show="!isFocusMode" v-model:projectId="currentProjectId" v-model:chapterId="currentChapterId"
      :projects="projects" :chapters="flatChapters" @add-chapter="showCreateDocDialog = true"
      @delete-chapter="handleDeleteChapter" class="workspace-sidebar" />

    <!-- 2. 右侧：主工作区 -->
    <div class="workspace-main">

      <!-- 2.1 顶部导航与工具 -->
      <div class="workspace-header" v-show="!isFocusMode">
        <div class="header-left">
          <span class="workspace-title">项目工作区</span>
          <!-- 标题编辑 -->
          <el-input v-model="documentTitle" class="title-input" placeholder="文档标题" @change="handleTitleSave" />
        </div>

        <div class="header-right">
          <el-button link @click="toggleAISidebar">
            <QyIcon name="MagicStick"  /> AI助手
          </el-button>
          <el-divider direction="vertical" />
          <el-tooltip content="专注模式">
            <el-button link @click="isFocusMode = !isFocusMode">
              <QyIcon name="FullScreen"  />
            </el-button>
          </el-tooltip>
          <el-button link data-testid="settings">项目设置</el-button>
          <el-button type="primary" link @click="handleManualSave">
            <QyIcon name="Select"  /> 保存
          </el-button>
        </div>
      </div>

      <!-- 2.2 编辑器工具栏 -->
      <EditorToolbar v-show="!isFocusMode" :show-preview="showPreview" @command="handleToolbarCommand"
        @togglePreview="showPreview = !showPreview" />

      <!-- 2.3 编辑核心区域 -->
      <div class="editor-wrapper">
        <div class="editor-scroll-container" :class="{ 'dual-view': showPreview }">
          <!-- 输入框 -->
          <div class="edit-pane">
            <textarea ref="editorTextarea" v-model="fileContent" class="native-textarea" placeholder="开始创作..."
              @keydown="handleKeydown" @contextmenu="handleContextMenu" @scroll="handleScrollSync"></textarea>
          </div>

          <!-- Markdown 预览 -->
          <div v-if="showPreview" class="preview-pane markdown-body" ref="previewPane">
            <div v-html="renderedContent"></div>
          </div>
        </div>

        <!-- 底部时间线 (可选) -->
        <div class="timeline-panel" v-if="showTimeline && !isFocusMode">
          <TimelineBar :timeline-id="currentTimelineId" />
        </div>
      </div>

      <!-- 2.4 底部状态栏 -->
      <div class="workspace-footer" v-show="!isFocusMode">
        <div class="footer-left">
          <span class="status-item">字数: {{ wordCount }}</span>
          <span class="status-item save-state" :class="saveStatusClass">
            {{ saveStatusText }}
          </span>
        </div>
        <div class="footer-right">
          <el-button link size="small" @click="showTimeline = !showTimeline">
            <QyIcon name="Clock"  /> {{ showTimeline ? '隐藏时间线' : '时间线' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 3. 辅助组件 -->

    <!-- AI 侧边栏 -->
    <AIAssistantSidebar v-model:visible="aiSidebarVisible" :project-id="currentProjectId" @insert="handleInsertText" />

    <!-- AI 右键菜单 -->
    <AIContextMenu v-if="contextMenu.visible" :visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y"
      :selected-text="contextMenu.selectedText" @action="handleAIAction"
      @update:visible="val => contextMenu.visible = val" />

    <!-- 新建文档对话框 -->
    <el-dialog v-model="showCreateDocDialog" title="新建文档" width="400px">
      <el-form :model="newDocForm">
        <el-form-item label="标题">
          <el-input v-model="newDocForm.title" placeholder="请输入文档标题" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="newDocForm.type">
            <el-option label="章节" value="chapter" />
            <el-option label="卷/分卷" value="volume" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDocDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateDoc">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
// 引入新的 Store 体系
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore' // 假如还需要读取 timeline 等

// 引入组件
import ProjectSidebar from '@/modules/writer/components/ProjectSidebar.vue'
import EditorToolbar from '@/modules/writer/components/EditorToolbar.vue'
import TimelineBar from '@/modules/writer/components/TimelineBar.vue'
import AIAssistantSidebar from '@/modules/writer/components/ai/AIAssistantSidebar.vue'
import AIContextMenu from '@/modules/writer/components/ai/AIContextMenu.vue'

// 工具
import { renderMarkdown } from '@/modules/writer/utils/markdown'
import { formatMarkdown, calculateWordCount } from '@/modules/writer/utils/editor'

// =======================
// 状态初始化
// =======================
const route = useRoute()
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const editorStore = useEditorStore()
const writerStore = useWriterStore() // 用于 Timeline 数据

// UI Flags
const isFocusMode = ref(false)
const showPreview = ref(false)
const showTimeline = ref(false)
const showCreateDocDialog = ref(false)
const aiSidebarVisible = ref(false)

// DOM Refs
const editorTextarea = ref<HTMLTextAreaElement>()
const previewPane = ref<HTMLDivElement>()

// Forms
const newDocForm = ref({ title: '', type: 'chapter' })
const contextMenu = reactive({ visible: false, x: 0, y: 0, selectedText: '' })

// =======================
// 数据绑定 (核心)
// =======================

// 1. 项目 ID
const currentProjectId = computed({
  get: () => projectStore.currentProjectId || (route.params.projectId as string),
  set: (id) => {
    if (id) {
      projectStore.loadDetail(id)
      documentStore.loadTree(id)
    }
  }
})

// 2. 文档 ID (切换文档的核心逻辑)
const currentChapterId = computed({
  get: () => documentStore.currentDocMeta?.id || '',
  set: async (id) => {
    if (!id) return
    // 切换前先保存旧的（虽然 Store 有 debounce，但切换是强制的）
    if (editorStore.isDirty) await editorStore.save()

    await documentStore.selectDocument(id) // 选中树节点
    await editorStore.loadContent(id)      // 加载编辑器内容
  }
})

// 3. 供 Sidebar 使用的数据源
const projects = computed(() => projectStore.projects)
const flatChapters = computed(() => documentStore.flatDocs || []) // 需确保 Store 中有这个 getter 或 state

// 4. 编辑器内容绑定 (双向绑定到 Store，Store 内处理自动保存)
const fileContent = computed({
  get: () => editorStore.content,
  set: (val) => editorStore.setContent(val)
})

const documentTitle = computed({
  get: () => documentStore.currentDocMeta?.title || '',
  set: (val) => {
    if (documentStore.currentDocMeta) {
      documentStore.currentDocMeta.title = val
    }
  }
})

const wordCount = computed(() => calculateWordCount(fileContent.value))
const renderedContent = computed(() => renderMarkdown(fileContent.value))
const currentTimelineId = computed(() => writerStore.timeline.currentTimeline?.id)

// 保存状态显示
const saveStatusText = computed(() => {
  if (editorStore.isSaving) return '保存中...'
  if (editorStore.isDirty) return '未保存'
  return '已保存'
})
const saveStatusClass = computed(() => ({
  'saving': editorStore.isSaving,
  'dirty': editorStore.isDirty
}))

// =======================
// 业务逻辑方法
// =======================

// 初始化
onMounted(async () => {
  const pId = currentProjectId.value
  if (pId) {
    // 并行加载数据
    await Promise.all([
      projectStore.loadDetail(pId),
      documentStore.loadTree(pId)
    ])

    // 如果没有选中章节，且列表不为空，默认选第一个
    if (!currentChapterId.value && flatChapters.value.length > 0) {
      currentChapterId.value = flatChapters.value[0].id
    }
  }
})

// 保存标题 (API)
const handleTitleSave = async () => {
  if (!documentStore.currentDocMeta) return
  try {
    await documentStore.update(documentStore.currentDocMeta.id, { title: documentTitle.value })
    // 刷新左侧树
    await documentStore.loadTree(currentProjectId.value)
  } catch (e) {
    message.error('标题更新失败')
  }
}

// 手动保存内容
const handleManualSave = async () => {
  await editorStore.save()
  message.success('保存成功')
}

// 创建文档
const handleCreateDoc = async () => {
  if (!newDocForm.value.title) return
  try {
    const newDoc = await documentStore.create(currentProjectId.value, {
      title: newDocForm.value.title,
      type: newDocForm.value.type as any,
      projectId: currentProjectId.value
    })

    showCreateDocDialog.value = false
    newDocForm.value.title = ''

    // 自动跳转到新文档
    if (newDoc) {
      currentChapterId.value = newDoc.id
    }
  } catch (e) {
    message.error('创建失败')
  }
}

// 删除文档
const handleDeleteChapter = async (docId: string) => {
  try {
    await messageBox.confirm('确定删除该章节吗？此操作不可恢复', '警告', { type: 'warning' })
    await documentStore.remove(docId)
    // 如果删除的是当前文档，清空编辑器
    if (docId === currentChapterId.value) {
      editorStore.reset() // 需要在 store 中实现 reset
    }
  } catch {
    // cancel
  }
}

// 工具栏命令
const handleToolbarCommand = (cmd: string) => {
  if (!editorTextarea.value) return
  formatMarkdown(cmd, editorTextarea.value)
  editorStore.setContent(editorTextarea.value.value) // 触发 v-model 更新
}

// 滚动同步
const handleScrollSync = (e: Event) => {
  if (!showPreview.value || !previewPane.value) return
  const target = e.target as HTMLTextAreaElement
  const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight)
  const preview = previewPane.value
  preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight)
}

// AI 相关
const toggleAISidebar = () => aiSidebarVisible.value = !aiSidebarVisible.value

const handleContextMenu = (e: MouseEvent) => {
  const ta = editorTextarea.value
  if (!ta) return

  const text = ta.value.substring(ta.selectionStart, ta.selectionEnd)
  if (text) {
    e.preventDefault()
    contextMenu.x = e.clientX
    contextMenu.y = e.clientY
    contextMenu.selectedText = text
    contextMenu.visible = true
  }
}

const handleAIAction = (action: string, text?: string) => {
  contextMenu.visible = false
  aiSidebarVisible.value = true
  // 这里可以调用 AI Store 设置当前模式和文本
  writerStore.setAITool(action as any)
  if (text) writerStore.setSelectedText(text)
}

const handleInsertText = (text: string) => {
  if (!editorTextarea.value) return
  const ta = editorTextarea.value
  const start = ta.selectionStart
  const end = ta.selectionEnd

  const newVal = ta.value.substring(0, start) + text + ta.value.substring(end)
  editorStore.setContent(newVal)

  nextTick(() => {
    ta.focus()
    ta.selectionStart = ta.selectionEnd = start + text.length
  })
}

// 快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    handleManualSave()
  }
  if (e.key === 'Tab') {
    e.preventDefault()
    handleInsertText('  ')
  }
}
</script>

<style scoped lang="scss">
.project-workspace {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--el-bg-color);
  overflow: hidden;

  // 专注模式
  &.focus-mode {

    .workspace-sidebar,
    .workspace-header,
    .workspace-footer {
      display: none;
    }

    .workspace-main {
      width: 100%;
    }

    .editor-scroll-container {
      padding: 0 20%; // 类似 Typora 的阅读模式
    }

    .native-textarea {
      font-size: 18px;
      line-height: 2;
      padding-top: 40px;
    }
  }
}

// 右侧主区域
.workspace-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

// 头部
.workspace-header {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color-overlay);

  .title-input {
    width: 300px;

    :deep(.el-input__wrapper) {
      box-shadow: none;
      font-size: 16px;
      font-weight: bold;
      padding-left: 0;
    }
  }

  .workspace-title {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-right: 12px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

// 编辑器包裹层
.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.editor-scroll-container {
  flex: 1;
  display: flex;
  height: 100%;

  &.dual-view {
    .edit-pane {
      width: 50%;
      border-right: 1px solid var(--el-border-color-light);
    }

    .preview-pane {
      display: block;
      width: 50%;
    }
  }
}

.edit-pane {
  flex: 1;
  height: 100%;
  background-color: var(--el-bg-color);
}

.native-textarea {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  outline: none;
  padding: 20px 30px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  background-color: transparent;
  font-family: 'PingFang SC', 'Microsoft YaHei', monospace;

  &::placeholder {
    color: var(--el-text-color-placeholder);
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-lighter);
    border-radius: 3px;
  }
}

.preview-pane {
  display: none;
  overflow-y: auto;
  padding: 20px 30px;
  background-color: var(--el-fill-color-light);
}

// 时间线面板
.timeline-panel {
  border-top: 1px solid var(--el-border-color-light);
}

// 底部状态栏
.workspace-footer {
  height: 30px;
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-bg-color);

  .save-state {
    margin-left: 10px;

    &.saving {
      color: var(--el-color-warning);
    }

    &.dirty {
      color: var(--el-color-info);
    }
  }
}
</style>
