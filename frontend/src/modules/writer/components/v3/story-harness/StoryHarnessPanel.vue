<template>
  <aside
    class="story-harness-panel"
    data-testid="story-harness-panel"
  >
    <header class="story-harness-panel__header">
      <div class="story-harness-panel__title-block">
        <h3>审查</h3>
        <span>{{ progressMetaLabel }}</span>
      </div>
      <Tag size="sm" variant="primary" effect="light">{{ harnessStore.writingStateLabel }}</Tag>
    </header>

    <section class="story-harness-panel__section">
      <div class="story-harness-panel__block">
        <div class="story-harness-panel__scope-row">
          <strong>{{ scopeLabel || chapterTitle || '未声明场景作用域' }}</strong>
          <button
            type="button"
            class="story-harness-panel__link-btn"
            data-testid="story-harness-open-review-packet"
            @click="isReviewPacketDrawerVisible = true"
          >
            审查包
          </button>
        </div>

        <div class="story-harness-panel__chips">
          <span
            v-for="chip in summaryChips"
            :key="chip.key"
            class="story-harness-panel__chip"
          >
            {{ chip.label }} {{ chip.count }}
          </span>
        </div>
      </div>

      <StoryHarnessWorkflowGatePanel
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :content="content"
        :active-characters="activeCharacters"
        :active-relations="activeRelations"
        :change-requests="changeRequests"
        :can-trigger-index="Boolean(handleTriggerIndex)"
        :is-triggering-index="isTriggeringIndex"
        @open-review-packet="isReviewPacketDrawerVisible = true"
        @open-change-requests="isChangeRequestDrawerVisible = true"
        @trigger-index="handleTriggerIndex"
      />
    </section>

    <section class="story-harness-panel__section">
      <div class="story-harness-panel__section-head">
        <h4>建议</h4>
        <Tag variant="primary" size="sm">{{ harnessStore.pendingChangeRequestCount }}</Tag>
      </div>

      <div class="story-harness-panel__block">
        <template v-if="changeRequests.length || hasSavedBatchReceipt">
          <div
            v-if="hasSavedBatchReceipt"
            class="story-harness-panel__receipt"
          >
            <span>{{ savedBatchReceiptStatus }}</span>
            <time>{{ savedBatchReceiptTimestampLabel }}</time>
          </div>

          <div
            v-if="primaryChangeRequest"
            class="story-harness-panel__request"
          >
            <div class="story-harness-panel__request-head">
              <div>
                <strong>{{ primaryChangeRequest?.title }}</strong>
                <p class="story-harness-panel__request-summary">
                  {{ primaryChangeRequest?.summary }}
                </p>
                <span class="story-harness-panel__meta">
                  {{ primaryChangeRequestMetaLabel }}
                </span>
              </div>
              <Tag
                size="sm"
                :variant="primaryChangeRequest?.severity === 'focus' ? 'warning' : 'info'"
                effect="light"
              >
                {{ primaryChangeRequest?.severity === 'focus' ? '优先' : '提示' }}
              </Tag>
            </div>
            <p
              v-if="primaryChangeRequestReasonPreview"
              class="story-harness-panel__request-reason"
            >
              {{ primaryChangeRequestReasonPreview }}
            </p>
          </div>

          <div class="story-harness-panel__actions">
            <button
              type="button"
              class="story-harness-panel__primary"
              data-testid="story-harness-trigger-index"
              :disabled="isTriggeringIndex"
              @click="handleTriggerIndex"
            >
              {{ isTriggeringIndex ? '生成中' : '生成' }}
            </button>
            <button
              type="button"
              class="story-harness-panel__secondary"
              data-testid="story-harness-open-change-requests"
              @click="isChangeRequestDrawerVisible = true"
            >
              队列
            </button>
            <button
              v-if="primaryChangeRequest"
              type="button"
              class="story-harness-panel__secondary"
              data-testid="story-harness-send-primary-to-ai"
              @click="sendPrimaryChangeRequestToAI"
            >
              交给 AI
            </button>
          </div>
        </template>

        <template v-else>
          <p class="story-harness-panel__empty">保存后自动生成</p>
          <button
            type="button"
            class="story-harness-panel__primary story-harness-panel__primary--full"
            data-testid="story-harness-trigger-index"
            :disabled="isTriggeringIndex"
            @click="handleTriggerIndex"
          >
            {{ isTriggeringIndex ? '生成中' : '生成' }}
          </button>
        </template>
      </div>
    </section>

    <StoryHarnessChangeRequestDrawer
      v-model="isChangeRequestDrawerVisible"
      :change-requests="changeRequests"
      :handle-change-request-decision="handleChangeRequestDecision"
    />
    <StoryHarnessReviewPacketDrawer
      v-model="isReviewPacketDrawerVisible"
      :chapter-id="chapterId"
      :chapter-title="chapterTitle"
      :content="content"
      :scope-label="scopeLabel"
      :entity-stats="resolvedEntityStats"
      :active-characters="activeCharacters"
      :active-relations="activeRelations"
      :change-requests="changeRequests"
    />
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Tag } from '@/design-system/base'
import {
  useStoryHarnessStore,
  type StoryHarnessChangeRequestDecision,
  type StoryHarnessCharacterSummary,
  type StoryHarnessChangeRequestPreview,
  type StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import type { WriterWorkflowActionRequest } from '@/modules/writer/types/workflow'
import StoryHarnessChangeRequestDrawer from './StoryHarnessChangeRequestDrawer.vue'
import StoryHarnessReviewPacketDrawer from './StoryHarnessReviewPacketDrawer.vue'
import StoryHarnessWorkflowGatePanel from './StoryHarnessWorkflowGatePanel.vue'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  content: string
  chapterCount: number
  scopeLabel?: string
  entityStats?: {
    characters: number
    locations: number
    items: number
    concepts: number
  }
  activeCharacters?: StoryHarnessCharacterSummary[]
  activeRelations?: StoryHarnessRelationSummary[]
  changeRequests?: StoryHarnessChangeRequestPreview[]
  handleChangeRequestDecision?: (
    requestId: string,
    decision: StoryHarnessChangeRequestDecision,
  ) => Promise<boolean>
  handleTriggerIndex?: () => Promise<void>
  isTriggeringIndex?: boolean
}>()
const emit = defineEmits<{
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
}>()

const harnessStore = useStoryHarnessStore()
const activeCharacters = computed(() => props.activeCharacters ?? [])
const activeRelations = computed(() => props.activeRelations ?? [])
const changeRequests = computed(() => props.changeRequests ?? [])
const resolvedEntityStats = computed(() => ({
  characters: props.entityStats?.characters ?? activeCharacters.value.length,
  locations: props.entityStats?.locations ?? 0,
  items: props.entityStats?.items ?? 0,
  concepts: props.entityStats?.concepts ?? 0,
}))
const progressMetaLabel = computed(
  () => `${props.chapterCount > 0 ? props.chapterCount : 1} 章 · ${harnessStore.draftLength} 字`,
)
const isChangeRequestDrawerVisible = ref(false)
const isReviewPacketDrawerVisible = ref(false)
const savedBatchChangeRequests = computed(() =>
  changeRequests.value.filter((changeRequest) => changeRequest.source === 'save_batch'),
)
const savedBatchReceipt = computed(() => harnessStore.savedBatchReceipt)
const pendingChangeRequests = computed(() =>
  changeRequests.value.filter(
    (changeRequest) => harnessStore.getChangeRequestDecision(changeRequest.id) === 'pending',
  ),
)
const hasSavedBatchReceipt = computed(() => Boolean(savedBatchReceipt.value))
const summaryChips = computed(() =>
  [
    { key: 'characters', label: '角色', count: resolvedEntityStats.value.characters },
    { key: 'locations', label: '地点', count: resolvedEntityStats.value.locations },
    { key: 'items', label: '物件', count: resolvedEntityStats.value.items },
    { key: 'concepts', label: '概念', count: resolvedEntityStats.value.concepts },
    { key: 'relations', label: '关系', count: activeRelations.value.length },
    { key: 'pending', label: '待', count: harnessStore.pendingChangeRequestCount },
  ].filter((chip) => chip.count > 0),
)
const primaryChangeRequest = computed(
  () =>
    pendingChangeRequests.value.find((changeRequest) => changeRequest.source === 'save_batch') ??
    pendingChangeRequests.value[0] ??
    savedBatchChangeRequests.value[0] ??
    changeRequests.value[0] ??
    null,
)
const savedBatchReceiptTimestampLabel = computed(() => {
  if (!savedBatchReceipt.value) {
    return ''
  }

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(savedBatchReceipt.value.committedAt)
})
const savedBatchReceiptStatus = computed(() => {
  if (!savedBatchReceipt.value) {
    return ''
  }

  if (savedBatchReceipt.value.count > 0) {
    return `冻结 ${savedBatchReceipt.value.count} 条`
  }

  return '无新建议'
})
const primaryChangeRequestMetaLabel = computed(() => {
  const changeRequest = primaryChangeRequest.value
  if (!changeRequest) {
    return ''
  }

  const sourceLabel = changeRequest.source === 'save_batch' ? '保存' : '预览'
  const severityLabel = changeRequest.severity === 'focus' ? '优先' : '提示'
  return `${sourceLabel} · ${severityLabel}`
})
const primaryChangeRequestReasonPreview = computed(() => {
  const reason = primaryChangeRequest.value?.reason?.trim()
  if (!reason) {
    return ''
  }

  return reason
})

const handleTriggerIndex = () => {
  if (!props.handleTriggerIndex) {
    return
  }

  void props.handleTriggerIndex()
}

const buildChangeRequestContextText = (changeRequest: StoryHarnessChangeRequestPreview): string => {
  const lines = [
    `变更建议：${changeRequest.title}`,
    changeRequest.summary ? `摘要：${changeRequest.summary}` : '',
    changeRequest.reason ? `理由：${changeRequest.reason}` : '',
    changeRequest.evidence ? `证据：${changeRequest.evidence}` : '',
  ].filter(Boolean)

  return lines.join('\n')
}

const sendPrimaryChangeRequestToAI = () => {
  const changeRequest = primaryChangeRequest.value
  if (!changeRequest) {
    return
  }

  emit('trigger-ai-action', {
    source: 'story_harness',
    action: 'add_to_chat',
    title: changeRequest.title,
    text: buildChangeRequestContextText(changeRequest),
    instructions: '请基于这条 Change Request 给出可执行的改写建议，优先保持角色状态与关系连续性。',
  })
}

watch(
  () => ({
    projectId: props.projectId,
    chapterId: props.chapterId,
    chapterTitle: props.chapterTitle,
    content: props.content,
    chapterCount: props.chapterCount,
  }),
  (session) => {
    harnessStore.syncSession(session)
  },
  { immediate: true, deep: true },
)

watch(
  () => [props.projectId, props.chapterId] as const,
  ([projectId, chapterId]) => {
    void harnessStore.hydrateSavedBatch(projectId, chapterId)
  },
  { immediate: true },
)

watch(
  () => changeRequests.value.map((changeRequest) => changeRequest.id),
  (changeRequestIds) => {
    harnessStore.syncChangeRequests(changeRequestIds)
  },
  { immediate: true, deep: true },
)
</script>

<style scoped lang="scss">
.story-harness-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  overflow: auto;
  padding: 8px 9px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

@media (max-width: 1200px) {
  .story-harness-panel {
    border-left: 0;
    border-top: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 80%, transparent);
  }
}

.story-harness-panel__header,
.story-harness-panel__section-head,
.story-harness-panel__scope-row,
.story-harness-panel__receipt,
.story-harness-panel__request-head,
.story-harness-panel__actions {
  display: flex;
  align-items: center;
}

.story-harness-panel__header,
.story-harness-panel__section-head,
.story-harness-panel__scope-row,
.story-harness-panel__receipt,
.story-harness-panel__request-head {
  justify-content: space-between;
  gap: 8px;
}

.story-harness-panel__title-block {
  display: grid;
  gap: 2px;
  min-width: 0;

  h3 {
    margin: 0;
    font-size: 14px;
    color: var(--editor-text-primary, #0f172a);
  }

  span {
    color: var(--editor-text-muted, #64748b);
    font-size: 11px;
  }
}

.story-harness-panel__section {
  display: grid;
  gap: 6px;
}

.story-harness-panel__section-head {
  h4 {
    margin: 0;
    font-size: 13px;
    color: var(--editor-text-primary, #0f172a);
  }
}

.story-harness-panel__block {
  display: grid;
  gap: 6px;
  padding: 7px 8px;
  border-radius: 8px;
  border: 1px solid var(--editor-border, #e2e8f0);
  background: color-mix(in srgb, var(--editor-layer-soft, #f8fafc) 70%, transparent);
}

.story-harness-panel__scope-row {
  strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
  }
}

.story-harness-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.story-harness-panel__chip {
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;
  font-weight: 600;
}

.story-harness-panel__receipt {
  padding: 4px 0;
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;

  span {
    font-weight: 700;
  }

  time {
    color: var(--editor-text-muted, #64748b);
  }
}

.story-harness-panel__request {
  display: grid;
  gap: 4px;
  padding: 6px 0;
  border-top: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 80%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 80%, transparent);
}

.story-harness-panel__request-head {
  align-items: flex-start;

  > div {
    min-width: 0;
  }

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
  }
}

.story-harness-panel__meta,
.story-harness-panel__empty {
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
}

.story-harness-panel__empty {
  margin: 0;
  line-height: 1.5;
}

.story-harness-panel__request-summary,
.story-harness-panel__request-reason {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.story-harness-panel__request-summary {
  margin: 1px 0 0;
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
  line-height: 1.45;
  -webkit-line-clamp: 2;
}

.story-harness-panel__request-reason {
  margin: 0;
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;
  line-height: 1.45;
  -webkit-line-clamp: 1;
}

.story-harness-panel__actions {
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 5px;
}

.story-harness-panel__primary,
.story-harness-panel__secondary,
.story-harness-panel__link-btn {
  height: 24px;
  padding: 0 7px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.22)) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }
}

.story-harness-panel__primary {
  border-color: rgba(14, 165, 233, 0.24);
  color: var(--editor-accent, #0284c7);
}

.story-harness-panel__primary--full {
  width: 100%;
}

.story-harness-panel__secondary,
.story-harness-panel__link-btn {
  border-color: rgba(148, 163, 184, 0.2);
}

.story-harness-panel__link-btn {
  flex: 0 0 auto;
}
</style>
