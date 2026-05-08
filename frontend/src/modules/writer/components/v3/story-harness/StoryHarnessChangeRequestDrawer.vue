<template>
  <QyDrawer
    v-model="drawerVisible"
    title="Change Request 队列"
    direction="rtl"
    size="480px"
    :destroy-on-close="false"
    class="story-harness-change-request-drawer"
  >
    <div class="flex h-full min-h-0 flex-col gap-4">
      <section class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span class="rounded-full bg-slate-100 px-3 py-1">待处理 {{ harnessStore.pendingChangeRequestCount }}</span>
        <span class="rounded-full bg-slate-100 px-3 py-1">优先 {{ focusRequestCount }}</span>
        <span
          v-if="savedBatchReceipt"
          class="rounded-full bg-slate-100 px-3 py-1"
        >
          最近保存 {{ savedBatchReceiptLabel }}
        </span>
      </section>

      <section class="flex flex-wrap items-center gap-2">
        <QyButton
          size="sm"
          :variant="activeFilter === 'pending' ? 'primary' : 'secondary'"
          data-testid="story-harness-filter-pending"
          @click="activeFilter = 'pending'"
        >
          待处理 {{ pendingChangeRequests.length }}
        </QyButton>
        <QyButton
          size="sm"
          :variant="activeFilter === 'resolved' ? 'primary' : 'secondary'"
          data-testid="story-harness-filter-resolved"
          @click="activeFilter = 'resolved'"
        >
          已处理 {{ resolvedChangeRequests.length }}
        </QyButton>
        <QyButton
          size="sm"
          :variant="activeFilter === 'all' ? 'primary' : 'secondary'"
          data-testid="story-harness-filter-all"
          @click="activeFilter = 'all'"
        >
          全部 {{ changeRequests.length }}
        </QyButton>
      </section>

      <section class="min-h-0 flex-1">
        <div v-if="changeRequests.length" class="flex h-full min-h-0 flex-col gap-4 overflow-auto pr-1">
          <div v-if="visiblePendingChangeRequests.length" class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h4 class="text-sm font-semibold text-slate-950">待处理队列</h4>
              <Tag size="sm" variant="warning" effect="light">{{ visiblePendingChangeRequests.length }} 条</Tag>
            </div>
            <QyCard
              v-for="changeRequest in visiblePendingChangeRequests"
              :key="changeRequest.id"
              variant="glass"
              padding="sm"
              shadow="never"
              class="rounded-3xl border border-slate-200/70 bg-white/90"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <Tag
                      size="sm"
                      :variant="changeRequest.source === 'save_batch' ? 'success' : 'info'"
                      effect="light"
                    >
                      {{ sourceLabelMap[changeRequest.source] }}
                    </Tag>
                    <Tag
                      size="sm"
                      :variant="changeRequest.type === 'state' ? 'warning' : changeRequest.type === 'relation' ? 'success' : 'info'"
                      effect="light"
                    >
                      {{ typeLabelMap[changeRequest.type] }}
                    </Tag>
                    <Tag
                      size="sm"
                      :variant="changeRequest.severity === 'focus' ? 'warning' : 'info'"
                      effect="plain"
                    >
                      {{ changeRequest.severity === 'focus' ? '优先处理' : '轻提示' }}
                    </Tag>
                  </div>
                  <p class="mt-3 text-base font-semibold text-slate-950">{{ changeRequest.title }}</p>
                  <p class="mt-2 text-sm leading-6 text-slate-600">{{ changeRequest.summary }}</p>
                </div>
              </div>

              <div class="mt-4 rounded-2xl bg-slate-50 px-3 py-3">
                <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">为何出现</p>
                <p class="mt-2 text-sm leading-6 text-slate-700">{{ changeRequest.reason }}</p>
              </div>

              <div
                v-if="changeRequest.evidence"
                class="mt-3 rounded-2xl bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-100"
              >
                {{ changeRequest.evidence }}
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <QyButton
                  variant="primary"
                  size="sm"
                  :loading="isProcessingDecision(changeRequest.id)"
                  :disabled="isProcessingDecision(changeRequest.id)"
                  :data-testid="`story-harness-accept-${changeRequest.id}`"
                  @click="handleDecision(changeRequest.id, 'accepted')"
                >
                  合并
                </QyButton>
                <QyButton
                  variant="secondary"
                  size="sm"
                  :loading="isProcessingDecision(changeRequest.id)"
                  :disabled="isProcessingDecision(changeRequest.id)"
                  :data-testid="`story-harness-defer-${changeRequest.id}`"
                  @click="handleDecision(changeRequest.id, 'deferred')"
                >
                  稍后处理
                </QyButton>
                <QyButton
                  variant="ghost"
                  size="sm"
                  :loading="isProcessingDecision(changeRequest.id)"
                  :disabled="isProcessingDecision(changeRequest.id)"
                  :data-testid="`story-harness-ignore-${changeRequest.id}`"
                  @click="handleDecision(changeRequest.id, 'ignored')"
                >
                  忽略
                </QyButton>
              </div>
            </QyCard>
          </div>

          <div v-if="visibleResolvedChangeRequests.length" class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h4 class="text-sm font-semibold text-slate-950">已处理记录</h4>
              <Tag size="sm" variant="success" effect="light">{{ visibleResolvedChangeRequests.length }} 条</Tag>
            </div>
            <QyCard
              v-for="changeRequest in visibleResolvedChangeRequests"
              :key="changeRequest.id"
              variant="glass"
              padding="sm"
              shadow="never"
              class="rounded-3xl border border-slate-200/70 bg-slate-50/80"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <Tag
                      size="sm"
                      :variant="changeRequest.source === 'save_batch' ? 'success' : 'info'"
                      effect="light"
                    >
                      {{ sourceLabelMap[changeRequest.source] }}
                    </Tag>
                    <Tag
                      size="sm"
                      :variant="changeRequest.type === 'state' ? 'warning' : changeRequest.type === 'relation' ? 'success' : 'info'"
                      effect="light"
                    >
                      {{ typeLabelMap[changeRequest.type] }}
                    </Tag>
                    <Tag
                      size="sm"
                      :variant="decisionTagTypeMap[getDecision(changeRequest.id)]"
                      effect="plain"
                    >
                      {{ decisionLabelMap[getDecision(changeRequest.id)] }}
                    </Tag>
                  </div>
                  <p class="mt-3 text-base font-semibold text-slate-900">{{ changeRequest.title }}</p>
                  <p class="mt-2 text-sm leading-6 text-slate-600">{{ changeRequest.summary }}</p>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <QyButton
                  variant="secondary"
                  size="sm"
                  :loading="isProcessingDecision(changeRequest.id)"
                  :disabled="isProcessingDecision(changeRequest.id)"
                  :data-testid="`story-harness-reset-${changeRequest.id}`"
                  @click="handleDecision(changeRequest.id, 'pending')"
                >
                  恢复待处理
                </QyButton>
              </div>
            </QyCard>
          </div>

          <QyCard
            v-if="visiblePendingChangeRequests.length === 0 && visibleResolvedChangeRequests.length === 0"
            variant="glass"
            padding="sm"
            shadow="never"
            class="rounded-3xl border border-dashed border-slate-200 bg-white/80"
          >
            <p class="text-sm leading-6 text-slate-700">{{ emptyStateTitle }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ emptyStateDescription }}</p>
          </QyCard>
        </div>

        <QyCard
          v-else
          variant="glass"
          padding="sm"
          shadow="never"
          class="rounded-3xl border border-dashed border-slate-200 bg-white/80"
        >
          <p class="text-sm leading-6 text-slate-700">{{ queueEmptyStateTitle }}</p>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ queueEmptyStateDescription }}</p>
        </QyCard>
      </section>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs leading-5 text-slate-500">当前抽屉已消费正式建议与即时预览，后续再补证据链与全项目视图。</p>
        <QyButton variant="secondary" size="sm" @click="drawerVisible = false">关闭</QyButton>
      </div>
    </template>
  </QyDrawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { QyButton, QyCard, QyDrawer } from '@/design-system/components'
import { Tag } from '@/design-system/base'
import { message } from '@/design-system/services'
import {
  useStoryHarnessStore,
  type StoryHarnessChangeRequestDecision,
  type StoryHarnessChangeRequestPreview,
} from '@/modules/writer/stores/v3/storyHarnessStore'

type StoryHarnessQueueFilter = 'pending' | 'resolved' | 'all'

const props = defineProps<{
  modelValue: boolean
  changeRequests: StoryHarnessChangeRequestPreview[]
  handleChangeRequestDecision?: (
    requestId: string,
    decision: StoryHarnessChangeRequestDecision,
  ) => Promise<boolean>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const harnessStore = useStoryHarnessStore()
const activeFilter = ref<StoryHarnessQueueFilter>('pending')
const processingDecisionIds = ref<Record<string, boolean>>({})
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const focusRequestCount = computed(
  () =>
    props.changeRequests.filter(
      (changeRequest) =>
        changeRequest.severity === 'focus' && harnessStore.getChangeRequestDecision(changeRequest.id) === 'pending',
    ).length,
)
const pendingChangeRequests = computed(() =>
  props.changeRequests.filter(
    (changeRequest) => harnessStore.getChangeRequestDecision(changeRequest.id) === 'pending',
  ),
)
const resolvedChangeRequests = computed(() =>
  props.changeRequests.filter(
    (changeRequest) => harnessStore.getChangeRequestDecision(changeRequest.id) !== 'pending',
  ),
)
const savedBatchReceipt = computed(() => harnessStore.savedBatchReceipt)
const visiblePendingChangeRequests = computed(() =>
  activeFilter.value === 'resolved' ? [] : pendingChangeRequests.value,
)
const visibleResolvedChangeRequests = computed(() =>
  activeFilter.value === 'pending' ? [] : resolvedChangeRequests.value,
)
const emptyStateTitle = computed(() => {
  if (activeFilter.value === 'pending') {
    return '当前没有待处理建议。'
  }
  if (activeFilter.value === 'resolved') {
    return '当前还没有已处理记录。'
  }
  return '当前建议还没有进入处理队列。'
})
const emptyStateDescription = computed(() => {
  if (activeFilter.value === 'pending') {
    return '可以切到“已处理”查看刚刚合并、忽略或延后的记录。'
  }
  if (activeFilter.value === 'resolved') {
    return '继续处理待处理队列后，这里会沉淀作者刚刚做过的决策。'
  }
  return '继续写正文，或者在正文里直接写 `// @角色 状态变化`，宿主会先把它收进这里。'
})
const savedBatchReceiptLabel = computed(() => {
  if (!savedBatchReceipt.value) {
    return ''
  }

  const time = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(savedBatchReceipt.value.committedAt)

  if (savedBatchReceipt.value.count > 0) {
    return `${time} · ${savedBatchReceipt.value.count} 条`
  }

  return `${time} · 无新增建议`
})
const queueEmptyStateTitle = computed(() => {
  if (savedBatchReceipt.value?.count === 0) {
    return '最近一次保存没有生成正式建议。'
  }

  return '当前还没有建议队列。'
})
const queueEmptyStateDescription = computed(() => {
  if (savedBatchReceipt.value?.count === 0) {
    return '继续写正文后，宿主仍会保留即时预览；只有命中规则的内容才会在下一次保存后冻结成正式批次。'
  }

  return '继续写正文，或者在正文里直接写 `// @角色 状态变化`，宿主会先把它收进这里。'
})

const typeLabelMap: Record<StoryHarnessChangeRequestPreview['type'], string> = {
  scene_scope: 'Scene Scope',
  relation: '关系摘要',
  state: '状态变更',
}

const sourceLabelMap: Record<StoryHarnessChangeRequestPreview['source'], string> = {
  live: '即时预览',
  save_batch: '保存后批次',
}

const decisionLabelMap: Record<StoryHarnessChangeRequestDecision, string> = {
  pending: '待处理',
  accepted: '已合并',
  ignored: '已忽略',
  deferred: '稍后处理',
}

const decisionTagTypeMap: Record<StoryHarnessChangeRequestDecision, 'primary' | 'success' | 'warning' | 'info'> = {
  pending: 'info',
  accepted: 'success',
  ignored: 'info',
  deferred: 'warning',
}

const getDecision = (changeRequestId: string) => harnessStore.getChangeRequestDecision(changeRequestId)
const isProcessingDecision = (changeRequestId: string) => Boolean(processingDecisionIds.value[changeRequestId])

const handleDecision = async (
  changeRequestId: string,
  decision: StoryHarnessChangeRequestDecision,
) => {
  if (isProcessingDecision(changeRequestId)) {
    return
  }

  if (props.handleChangeRequestDecision) {
    processingDecisionIds.value = {
      ...processingDecisionIds.value,
      [changeRequestId]: true,
    }

    try {
      const success = await props.handleChangeRequestDecision(changeRequestId, decision)
      if (!success) {
        message.error('变更建议同步失败，请重试')
      }
    } finally {
      processingDecisionIds.value = {
        ...processingDecisionIds.value,
        [changeRequestId]: false,
      }
    }
    return
  }

  harnessStore.setChangeRequestDecision(changeRequestId, decision)
}
</script>
