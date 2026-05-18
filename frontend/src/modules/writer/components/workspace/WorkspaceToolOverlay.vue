<template>
  <Transition name="tool-overlay">
    <div v-if="visible" class="tool-overlay" @click.self="handleClose">
      <div class="tool-overlay__container">
        <!-- 顶部横条 -->
        <header class="tool-overlay__header">
          <div class="header-title">
            <QyIcon :name="currentToolIcon" :size="20" />
            <span>{{ currentToolName }}</span>
          </div>
          <div class="header-actions">
            <QyGhostButton size="small" @click="handleClose">
              <QyIcon name="Close" :size="16" />
              关闭 (Esc)
            </QyGhostButton>
          </div>
        </header>

        <section
          v-if="hasWorkflowContextSummary"
          class="tool-overlay__context"
          data-testid="tool-overlay-context"
        >
          <span class="tool-overlay__context-label">工具参考</span>
          <div class="tool-overlay__context-summary" aria-label="当前工具可见上下文">
            <span
              v-for="part in contextSummaryParts"
              :key="part"
              class="tool-overlay__context-part"
            >
              {{ part }}
            </span>
          </div>
          <button class="tool-overlay__context-ai" type="button" @click="handleSendContextToAI">
            交给 AI
          </button>
        </section>

        <!-- 主体区域：侧边栏 + 内容 -->
        <div class="tool-overlay__body">
          <!-- 侧边栏切换器 -->
          <ToolSidebar :active-tool="activeTool" @tool-change="handleToolChange" />

          <!-- 工具内容区 -->
          <div class="tool-overlay__content">
            <KeepAlive>
              <component
                :is="toolComponentMap[activeTool]"
                :project-id="projectId"
                :chapter-id="chapterId"
                :chapter-title="chapterTitle"
                :chapters="chapters"
                :workflow-context="workflowContext"
                :active-entities="activeEntities"
                :scene-stage="sceneStage"
                v-bind="currentToolExtraProps"
                @update:active-category="
                  (category: EncyclopediaCategory) => handleAssetsCategoryChange(category)
                "
                @switch-tool="(toolId: ToolType) => handleToolChange(toolId)"
                @focus-graph-asset="handleGraphAssetFocus"
                @graph-focus-consumed="handleGraphFocusConsumed"
                @status-change="(chips: string[]) => emit('status-change', chips)"
                @open-graph="(chapterId: string) => emit('open-graph', chapterId)"
                @jump-to-chapter="(chapterId: string) => emit('jump-to-chapter', chapterId)"
                @create-structure-plan="(payload: any) => emit('create-structure-plan', payload)"
                @trigger-ai-action="(payload: any) => emit('trigger-ai-action', payload)"
              />
            </KeepAlive>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, markRaw, ref, watch, type Component } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import QyGhostButton from '@/design-system/components/basic/QyGhostButton/QyGhostButton.vue'
import ToolSidebar from './tool-overlay/ToolSidebar.vue'
import { useToolOverlay, type ToolType } from '@/modules/writer/composables/useToolOverlay'
import type { EncyclopediaCategory, GraphFocusTarget } from '@/modules/writer/composables/types'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import {
  buildActiveEntityTypeSummary,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
import type {
  WriterStructurePlanPayload,
  WriterWorkflowActionRequest,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import { buildWriterToolAIHandoff } from '@/modules/writer/utils/writerToolAIHandoff'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'

const createAsyncToolView = (loader: () => Promise<Component>) =>
  defineAsyncComponent({
    loader,
    delay: 0,
    suspensible: false,
  })

const StructureStageView = createAsyncToolView(
  () =>
    import('@/modules/writer/components/workspace/structure/StructureStageView.vue').then(
      (module) => module.default,
    ),
)
const EncyclopediaView = createAsyncToolView(
  () => import('@/modules/writer/views/EncyclopediaView.vue').then((module) => module.default),
)
const CharacterGraphView = createAsyncToolView(
  () => import('@/modules/writer/views/CharacterGraphView.vue').then((module) => module.default),
)
const TimelineOutlineView = createAsyncToolView(
  () => import('@/modules/writer/views/TimelineOutlineView.vue').then((module) => module.default),
)
const StoryBranchView = createAsyncToolView(
  () => import('@/modules/writer/views/StoryBranchView.vue').then((module) => module.default),
)

// =======================
// Props 定义
// =======================
interface Props {
  /** 是否显示覆盖层 */
  visible: boolean
  /** 当前激活的工具 */
  activeTool: ToolType
  /** 当前项目 ID */
  projectId: string
  /** 当前章节 ID */
  chapterId: string
  /** 当前章节标题 */
  chapterTitle: string
  /** 章节列表 */
  chapters: SidebarChapterSummary[]
  /** 工作流上下文（可选） */
  workflowContext?: WriterWorkflowContext
  /** 活跃实体列表（可选） */
  activeEntities?: ActiveEntitySummary[]
  /** 当前场景/节拍摘要，只读透传给聚合工具 */
  sceneStage?: WriterSceneStageState | null
}

const props = defineProps<Props>()

// =======================
// Emits 定义
// =======================
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'tool-change', toolId: ToolType): void
  (e: 'status-change', chips: string[]): void
  (e: 'open-graph', chapterId: string): void
  (e: 'jump-to-chapter', chapterId: string): void
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
}>()

// =======================
// 工具信息
// =======================
const { getToolName, getToolIcon, context: overlayContext } = useToolOverlay()

const currentToolName = computed(() => getToolName(props.activeTool))
const currentToolIcon = computed(() => getToolIcon(props.activeTool))
const assetsActiveCategory = ref<EncyclopediaCategory>('characters')
const relationsFocusedAsset = ref<GraphFocusTarget | null>(null)
const effectiveChapterTitle = computed(
  () => props.chapterTitle || props.workflowContext?.chapterTitle || '',
)
const activeEntityTypeSummary = computed(() => buildActiveEntityTypeSummary(props.activeEntities))
const contextSummaryParts = computed(() => {
  const parts: string[] = []
  if (effectiveChapterTitle.value) {
    parts.push(`章节：${effectiveChapterTitle.value}`)
  }
  if (props.workflowContext?.scopeLabel) {
    parts.push(`场景：${props.workflowContext.scopeLabel}`)
  }
  if (props.sceneStage?.coverageLabel || props.sceneStage?.beatTitle || props.sceneStage?.goal) {
    const sceneSummary = [
      props.sceneStage.beatTitle ? `节拍：${props.sceneStage.beatTitle}` : '',
      props.sceneStage.coverageLabel ? `覆盖：${props.sceneStage.coverageLabel}` : '',
    ].filter(Boolean).join(' · ')
    parts.push(sceneSummary || '节拍：待填写')
  }
  if (activeEntityTypeSummary.value.total > 0) {
    const entitySummary = activeEntityTypeSummary.value.items
      .map((item) => `${item.typeLabel}${item.count}`)
      .join(' / ')
    parts.push(`设定：${entitySummary}`)
  }
  return parts
})
const hasWorkflowContextSummary = computed(() =>
  Boolean(
    effectiveChapterTitle.value ||
    props.workflowContext?.scopeLabel ||
    props.sceneStage?.coverageLabel ||
    props.sceneStage?.beatTitle ||
    props.sceneStage?.goal ||
    activeEntityTypeSummary.value.total,
  ),
)
const currentToolExtraProps = computed(() =>
  props.activeTool === 'assets'
    ? {
        embedded: true,
        activeCategory: assetsActiveCategory.value,
        selectedAssetId: overlayContext.value?.assetId,
      }
    : props.activeTool === 'relations'
      ? {
          focusedAsset: relationsFocusedAsset.value,
        }
      : {},
)

// =======================
// 工具组件映射
// =======================
const toolComponentMap: Record<ToolType, unknown> = {
  structure: markRaw(StructureStageView),
  assets: markRaw(EncyclopediaView),
  relations: markRaw(CharacterGraphView),
  timeline: markRaw(TimelineOutlineView),
  branches: markRaw(StoryBranchView),
}

// =======================
// 事件处理
// =======================
const handleClose = () => {
  emit('close')
}

const handleToolChange = (toolId: ToolType) => {
  if (toolId !== 'relations') {
    relationsFocusedAsset.value = null
  }
  emit('tool-change', toolId)
}

const handleAssetsCategoryChange = (category: EncyclopediaCategory) => {
  assetsActiveCategory.value = category
}

const handleGraphAssetFocus = (target: GraphFocusTarget) => {
  relationsFocusedAsset.value = target
}

const handleGraphFocusConsumed = () => {
  relationsFocusedAsset.value = null
}

const handleSendContextToAI = () => {
  emit('trigger-ai-action', buildWriterToolAIHandoff({
    toolLabel: currentToolName.value,
    title: `${currentToolName.value}上下文`,
    focusLines: [
      props.sceneStage?.beatTitle ? `当前拍：${props.sceneStage.beatTitle}` : '',
      props.sceneStage?.goal ? `节拍目标：${props.sceneStage.goal}` : '',
      props.sceneStage?.doneCondition ? `完成条件：${props.sceneStage.doneCondition}` : '',
    ],
    workflowContext: props.workflowContext,
    activeEntities: props.activeEntities,
    instructions: '基于当前章节、场景和设定摘要给出当前工具相关建议，只指出最值得处理的一项。',
  }))
}

watch(
  () => [props.activeTool, overlayContext.value?.assetsCategory, overlayContext.value?.focusedAsset] as const,
  ([toolId, assetsCategory, focusedAsset]) => {
    if (toolId === 'assets' && assetsCategory) {
      assetsActiveCategory.value = assetsCategory
    }
    if (toolId === 'relations') {
      relationsFocusedAsset.value = focusedAsset || relationsFocusedAsset.value
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.tool-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  &__container {
    width: 100%;
    height: 100%;
    max-width: 1600px;
    background: var(--editor-bg-surface);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  }

  &__header {
    height: 52px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: var(--editor-bg-elevated);
    border-bottom: 1px solid var(--editor-border);

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--editor-text-primary);
      font-size: 15px;
      font-weight: 600;
    }
  }

  &__body {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }

  &__context {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 38px;
    padding: 6px 20px;
    border-bottom: 1px solid var(--editor-border);
    background: var(--editor-bg-elevated);
  }

  &__context-label {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 700;
    color: var(--editor-text-secondary);
  }

  &__context-summary {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 10px;
    min-width: 0;
    overflow: hidden;
  }

  &__context-part {
    min-width: 0;
    max-width: 32%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--editor-text-secondary);
    font-size: 12px;
    line-height: 1.2;

    &::before {
      content: '';
      display: inline-block;
      width: 3px;
      height: 3px;
      margin: 0 7px 2px 0;
      border-radius: 999px;
      background: var(--editor-border-strong, var(--editor-border));
    }
  }

  &__context-ai {
    flex-shrink: 0;
    border: 1px solid var(--editor-border);
    border-radius: 999px;
    padding: 4px 10px;
    background: var(--editor-bg-surface);
    color: var(--editor-text-secondary);
    font-size: 12px;
    line-height: 1.2;
    cursor: pointer;

    &:hover {
      border-color: var(--editor-accent);
      color: var(--editor-accent);
      background: var(--editor-accent-soft);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    overflow: auto;
    background: var(--editor-bg-surface);
  }
}

// 过渡动画
.tool-overlay-enter-active,
.tool-overlay-leave-active {
  transition: opacity 0.2s ease;

  .tool-overlay__container {
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }
}

.tool-overlay-enter-from,
.tool-overlay-leave-to {
  opacity: 0;

  .tool-overlay__container {
    transform: scale(0.95);
    opacity: 0;
  }
}

@media (max-width: 960px) {
  .tool-overlay {
    &__context {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }

    &__context-summary {
      flex-wrap: wrap;
    }

    &__context-part {
      max-width: 100%;
    }
  }
}
</style>
