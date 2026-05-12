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
          <span class="tool-overlay__context-label">当前上下文</span>
          <div class="tool-overlay__context-chips">
            <span v-if="effectiveChapterTitle" class="tool-overlay__context-chip is-neutral">
              章节 {{ effectiveChapterTitle }}
            </span>
            <span
              v-if="workflowContext?.scopeLabel"
              class="tool-overlay__context-chip is-neutral is-scope"
            >
              场景 {{ workflowContext.scopeLabel }}
            </span>
            <span
              v-for="entity in activeEntityPreview.items"
              :key="entity.key"
              class="tool-overlay__context-chip"
              :class="`is-${entity.type}`"
            >
              <span class="tool-overlay__context-chip-type">{{ entity.typeLabel }}</span>
              <strong>{{ entity.name }}</strong>
              <span v-if="entity.summary" class="tool-overlay__context-chip-summary">
                {{ entity.summary }}
              </span>
            </span>
            <span
              v-if="activeEntityPreview.hiddenCount > 0"
              class="tool-overlay__context-chip is-overflow"
            >
              +{{ activeEntityPreview.hiddenCount }}
            </span>
          </div>
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
  buildActiveEntityPreview,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'

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
  (
    e: 'trigger-ai-action',
    payload: {
      source: string
      action: string
      title: string
      text: string
      instructions?: string
    },
  ): void
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
const activeEntityPreview = computed(() => buildActiveEntityPreview(props.activeEntities))
const hasWorkflowContextSummary = computed(() =>
  Boolean(
    effectiveChapterTitle.value ||
    props.workflowContext?.scopeLabel ||
    activeEntityPreview.value.total,
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
    align-items: flex-start;
    gap: 12px;
    padding: 10px 20px;
    border-bottom: 1px solid var(--editor-border);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 255, 0.96));
  }

  &__context-label {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 12px;
    font-weight: 700;
    color: var(--editor-text-secondary);
  }

  &__context-chips {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  &__context-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 5px 10px;
    border-radius: 999px;
    border: 1px solid rgba(72, 94, 144, 0.14);
    background: rgba(248, 251, 255, 0.95);
    color: var(--editor-text-primary);
    font-size: 12px;
    line-height: 1.2;

    strong {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.is-neutral {
      background: rgba(240, 246, 255, 0.96);
      color: #365072;
    }

    &.is-scope {
      border-color: rgba(62, 99, 146, 0.18);
    }

    &.is-character {
      border-color: rgba(70, 110, 196, 0.22);
      background: rgba(238, 244, 255, 0.98);
    }

    &.is-item {
      border-color: rgba(178, 132, 43, 0.22);
      background: rgba(255, 248, 231, 0.98);
    }

    &.is-location {
      border-color: rgba(48, 132, 109, 0.22);
      background: rgba(236, 249, 243, 0.98);
    }

    &.is-organization,
    &.is-concept,
    &.is-foreshadowing {
      border-color: rgba(114, 92, 178, 0.18);
      background: rgba(245, 240, 255, 0.98);
    }

    &.is-overflow {
      background: rgba(241, 244, 249, 0.96);
      color: var(--editor-text-secondary);
    }
  }

  &__context-chip-type {
    font-size: 11px;
    font-weight: 700;
    color: var(--editor-text-secondary);
  }

  &__context-chip-summary {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--editor-text-secondary);
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
      gap: 8px;
    }

    &__context-chip {
      strong,
      .tool-overlay__context-chip-summary {
        max-width: 140px;
      }
    }
  }
}
</style>
