<template>
  <!-- 空状态 - 未选择章节 -->
  <div v-if="!chapterId" class="editor-empty-state">
    <div class="empty-content">
      <QyIcon name="Document" :size="48" class="empty-icon" />
      <h3>请选择章节</h3>
      <p>从左侧目录中选择一个章节开始写作</p>
      <QyGhostButton @click="$emit('add-doc')">
        <QyIcon name="Plus" :size="14" />
        新建章节
      </QyGhostButton>
    </div>
  </div>
  <!-- 写作编辑器 -->
  <div v-else class="workspace-writing-surface" data-testid="workspace-writing-surface">
    <div class="workspace-writing-surface__editor">
      <TipTapEditorView
        v-model="modelContent"
        :project-id="projectId"
        :document-id="chapterId"
        :readonly="false"
        :show-reference-panel="false"
        @selection-action="emit('trigger-ai-action', $event)"
        @save="(contents: unknown[]) => $emit('save', contents)"
        @open-tool-overlay="toolOverlay.open()"
      />
    </div>
  </div>

  <!-- 全屏工具面板 -->
  <WorkspaceToolOverlay
    :visible="toolOverlay.visible.value"
    :active-tool="toolOverlay.activeTool.value"
    :project-id="projectId"
    :chapter-id="overlayChapterId"
    :chapter-title="overlayChapterTitle"
    :chapters="chapters"
    :workflow-context="workflowContext"
    :active-entities="activeEntities"
    @close="toolOverlay.close"
    @tool-change="toolOverlay.switchTool"
    @status-change="emit('status-change', $event)"
    @open-graph="(chapterId: string) => emit('open-graph', chapterId)"
    @jump-to-chapter="(chapterId: string) => emit('jump-to-chapter', chapterId)"
    @trigger-ai-action="handleOverlayTriggerAIAction"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TipTapEditorView from '@/modules/writer/components/editor-new/TipTapEditorView.vue'
import WorkspaceToolOverlay from '@/modules/writer/components/workspace/WorkspaceToolOverlay.vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import QyGhostButton from '@/design-system/components/basic/QyGhostButton/QyGhostButton.vue'
import { useToolOverlay, type ToolType } from '@/modules/writer/composables/useToolOverlay'
import { useWorkspaceShortcuts } from '@/modules/writer/composables/useWorkspaceShortcuts'
import type {
  StoryHarnessChangeRequestDecision,
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import type { WriterWorkflowActionRequest } from '@/modules/writer/types/workflow'
import type {
  EncyclopediaSubView,
  EncyclopediaCategory,
  SidebarChapterSummary,
} from '@/modules/writer/composables/types'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'

// =======================
// Props 定义
// =======================
const props = defineProps<{
  /** 当前激活的工具 */
  activeTool: string
  /** 是否为百科工具 */
  isEncyclopedia: boolean
  /** 百科子视图 */
  subView: EncyclopediaSubView
  /** 百科分类 */
  category: EncyclopediaCategory
  /** 当前项目 ID */
  projectId: string
  /** 当前章节 ID */
  chapterId: string
  /** 当前章节标题 */
  chapterTitle: string
  /** 工具覆盖层章节 ID */
  toolOverlayChapterId?: string
  /** 工具覆盖层章节标题 */
  toolOverlayChapterTitle?: string
  /** 章节列表 */
  chapters: SidebarChapterSummary[]
  /** 编辑器内容 */
  content: string
  /** 当前场景作用域标签 */
  scopeLabel?: string
  /** Context Lens 多类型实体统计 */
  entityStats?: {
    characters: number
    locations: number
    items: number
    concepts: number
  }
  /** 当前场景活跃角色 */
  activeCharacters?: StoryHarnessCharacterSummary[]
  /** 当前场景关系摘要 */
  activeRelations?: StoryHarnessRelationSummary[]
  /** 当前场景变更建议预览 */
  changeRequests?: StoryHarnessChangeRequestPreview[]
  /** 共享工作流上下文 */
  workflowContext?: WriterWorkflowContext
  /** 共享实体摘要 */
  activeEntities?: ActiveEntitySummary[]
  /** 处理变更建议 */
  handleChangeRequestDecision?: (
    requestId: string,
    decision: StoryHarnessChangeRequestDecision,
  ) => Promise<boolean>
  /** 手动触发建议生成 */
  handleTriggerIndex?: () => Promise<void>
  /** 是否正在生成建议 */
  isTriggeringIndex?: boolean
}>()

// =======================
// Emits 定义
// =======================
const emit = defineEmits<{
  /** 更新编辑器内容 */
  (e: 'update:content', value: string): void
  /** 更新百科分类 */
  (e: 'update:category', value: EncyclopediaCategory): void
  /** 保存 */
  (e: 'save', contents: unknown[]): void
  /** 添加文档 */
  (e: 'add-doc'): void
  /** 触发 AI 快捷动作 */
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  /** 从结构舞台跳转章节 */
  (e: 'jump-to-chapter', chapterId: string): void
  /** 从结构舞台打开关系图谱 */
  (e: 'open-graph', chapterId: string): void
  /** 工作区底部状态栏扩展状态 */
  (e: 'status-change', chips: string[]): void
  /** 打开全屏工具 */
  (e: 'open-fullscreen-tool', tool: string): void
  /** 关闭全屏覆盖层 */
  (e: 'close-fullscreen'): void
}>()

// =======================
// Computed
// =======================
/** 编辑器内容双向绑定 */
const modelContent = computed({
  get: () => props.content,
  set: (value: string) => emit('update:content', value),
})

const overlayChapterId = computed(() => props.toolOverlayChapterId ?? props.chapterId)
const overlayChapterTitle = computed(() => props.toolOverlayChapterTitle ?? props.chapterTitle)
const handleOverlayTriggerAIAction = (payload: {
  source: string
  action: string
  title: string
  text: string
  instructions?: string
}) => {
  emit('trigger-ai-action', payload as WriterWorkflowActionRequest)
}

// =======================
// 工具面板状态
// =======================
const toolOverlay = useToolOverlay()
useWorkspaceShortcuts({
  openLatestTool: () => toolOverlay.open(),
  openTool: (tool) => toolOverlay.open(tool),
  closeOverlay: () => toolOverlay.close(),
  isOverlayVisible: () => toolOverlay.visible.value,
})

// 暴露方法给父组件
defineExpose({
  openFullscreenTool: (tool: string) => {
    toolOverlay.open(tool as ToolType)
  },
  closeFullscreen: () => {
    toolOverlay.close()
  },
  openToolOverlay: () => {
    toolOverlay.open()
  },
})
</script>

<style scoped lang="scss">
.editor-empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--editor-radius-lg, 8px);
  background: var(--editor-bg-surface, #f8fafc);
  border: 1px solid var(--editor-border, #e2e8f0);
  padding: 24px;
}

.empty-content {
  text-align: center;
  padding: 40px;
  max-width: 320px;
}

.empty-icon {
  color: var(--editor-text-ghost);
  margin-bottom: 16px;
}

.empty-content h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--editor-text-primary);
}

.empty-content p {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--editor-text-secondary);
  line-height: 1.5;
}

.workspace-writing-surface {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.workspace-writing-surface__editor {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .empty-icon {
    transition: none;
  }
}
</style>
