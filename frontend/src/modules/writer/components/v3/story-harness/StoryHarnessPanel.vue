<template>
  <aside
    class="story-harness-panel flex h-full min-h-0 w-full flex-col gap-3 overflow-auto p-4"
    data-testid="story-harness-panel"
  >
    <header class="flex items-center justify-between gap-3">
      <h3 class="story-harness-panel__heading text-sm font-semibold">审查</h3>
      <Tag size="sm" variant="primary" effect="light">{{ harnessStore.writingStateLabel }}</Tag>
    </header>

    <section class="flex flex-col gap-3">
      <QyCard
        variant="glass"
        padding="sm"
        shadow="never"
        class="story-harness-panel__card space-y-3 rounded-3xl"
      >
        <div class="space-y-1">
        <p class="story-harness-panel__title text-sm font-medium">
          {{ scopeLabel || chapterTitle || '未声明场景作用域' }}
        </p>
        <p class="story-harness-panel__muted text-xs leading-5">
            {{ harnessStore.chapterProgressLabel }} · {{ harnessStore.draftLength }} 字符
          </p>
        </div>

        <div class="story-harness-panel__muted flex flex-wrap gap-2 text-xs">
          <span
            v-for="chip in summaryChips"
            :key="chip.key"
            class="story-harness-panel__chip rounded-full px-3 py-1"
          >
            {{ chip.label }} {{ chip.count }}
          </span>
        </div>

        <QyButton
          variant="secondary"
          size="sm"
          class="w-full"
          data-testid="story-harness-open-review-packet"
          @click="isReviewPacketDrawerVisible = true"
        >
          审查包预览
        </QyButton>
      </QyCard>

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

    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h4 class="story-harness-panel__heading text-sm font-semibold">建议队列</h4>
        <Tag variant="primary" size="sm">{{ harnessStore.pendingChangeRequestCount }} 待处理</Tag>
      </div>

      <QyCard
        variant="glass"
        padding="sm"
        shadow="never"
        class="story-harness-panel__card space-y-3 rounded-3xl"
      >
        <template v-if="changeRequests.length || hasSavedBatchReceipt">
          <div
            v-if="hasSavedBatchReceipt"
            class="story-harness-panel__receipt flex items-center justify-between gap-3 rounded-xl px-3 py-2"
          >
            <p class="story-harness-panel__secondary text-xs">{{ savedBatchReceiptStatus }}</p>
            <span class="story-harness-panel__muted text-xs">{{ savedBatchReceiptTimestampLabel }}</span>
          </div>

          <div
            v-if="primaryChangeRequest"
            class="story-harness-panel__request rounded-2xl px-3 py-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="story-harness-panel__title text-sm font-medium">{{ primaryChangeRequest?.title }}</p>
                <p class="story-harness-panel__muted mt-1 text-xs leading-5">
                  {{ primaryChangeRequest?.summary }}
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <Tag
                  size="sm"
                  :variant="primaryChangeRequest?.source === 'save_batch' ? 'success' : 'info'"
                  effect="light"
                >
                  {{ primaryChangeRequest?.source === 'save_batch' ? '保存后批次' : '即时预览' }}
                </Tag>
                <Tag
                  size="sm"
                  :variant="primaryChangeRequest?.severity === 'focus' ? 'warning' : 'info'"
                  effect="light"
                >
                  {{ primaryChangeRequest?.severity === 'focus' ? '优先看' : '轻提示' }}
                </Tag>
              </div>
            </div>
            <p class="story-harness-panel__secondary mt-2 text-xs leading-5">{{ primaryChangeRequest?.reason }}</p>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <QyButton
              variant="primary"
              size="sm"
              data-testid="story-harness-trigger-index"
              :loading="isTriggeringIndex"
              @click="handleTriggerIndex"
            >
              生成建议
            </QyButton>
            <QyButton
              variant="secondary"
              size="sm"
              data-testid="story-harness-open-change-requests"
              @click="isChangeRequestDrawerVisible = true"
            >
              查看队列
            </QyButton>
          </div>
          <QyButton
            v-if="primaryChangeRequest"
            variant="secondary"
            size="sm"
            class="w-full"
            data-testid="story-harness-send-primary-to-ai"
            @click="sendPrimaryChangeRequestToAI"
          >
            交给 AI
          </QyButton>
        </template>

        <template v-else>
          <p class="story-harness-panel__muted text-sm leading-6">保存章节后自动生成，或手动触发索引。</p>
          <QyButton
            variant="primary"
            size="sm"
            class="w-full"
            data-testid="story-harness-trigger-index"
            :loading="isTriggeringIndex"
            @click="handleTriggerIndex"
          >
            立即生成建议
          </QyButton>
        </template>
      </QyCard>
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
import { QyButton, QyCard } from '@/design-system/components'
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
    { key: 'items', label: '物品', count: resolvedEntityStats.value.items },
    { key: 'concepts', label: '概念', count: resolvedEntityStats.value.concepts },
    { key: 'relations', label: '关系', count: activeRelations.value.length },
    { key: 'pending', label: '待处理', count: harnessStore.pendingChangeRequestCount },
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

  return `保存于 ${new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(savedBatchReceipt.value.committedAt)}`
})
const savedBatchReceiptStatus = computed(() => {
  if (!savedBatchReceipt.value) {
    return ''
  }

  if (savedBatchReceipt.value.count > 0) {
    return `已冻结 ${savedBatchReceipt.value.count} 条建议`
  }

  return '本次保存未产出建议'
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

<style scoped>
.story-harness-panel {
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 72%, transparent);
}

@media (max-width: 1200px) {
  .story-harness-panel {
    border-left: 0;
    border-top: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 80%, transparent);
  }
}

.story-harness-panel__heading,
.story-harness-panel__title {
  color: var(--editor-text-primary, #0f172a);
}

.story-harness-panel__secondary {
  color: var(--editor-text-secondary, #334155);
}

.story-harness-panel__muted {
  color: var(--editor-text-muted, #64748b);
}

.story-harness-panel__card {
  border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent);
}

.story-harness-panel__chip {
  background: var(--editor-layer-strong, #f1f5f9);
}

.story-harness-panel__receipt {
  background: var(--editor-layer-strong, #f1f5f9);
}

.story-harness-panel__request {
  border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 88%, transparent);
}
</style>
