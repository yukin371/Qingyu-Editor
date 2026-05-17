<template>
  <QyCard
    variant="glass"
    padding="sm"
    shadow="never"
    class="story-harness-gate space-y-3 rounded-3xl"
    data-testid="story-harness-workflow-gate-panel"
  >
    <div class="flex items-center justify-between gap-3">
      <h4 class="story-harness-gate__heading text-sm font-semibold">审查门槛</h4>
      <Tag size="sm" :variant="gateState.summary.variant" effect="light">
        {{ gateState.summary.label }}
      </Tag>
    </div>

    <p class="story-harness-gate__muted text-xs leading-5" data-testid="story-harness-gate-next-action">
      {{ gateState.nextAction }}
    </p>

    <div class="space-y-2">
      <div
        v-for="gate in gateState.gates"
        :key="gate.key"
        class="story-harness-gate__item flex items-start gap-2 rounded-2xl px-3 py-2"
        :data-testid="`story-harness-gate-${gate.key}`"
      >
        <span
          class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          :class="gateStatusClassMap[gate.status]"
        />
        <div class="min-w-0">
          <p class="story-harness-gate__heading text-xs font-medium">{{ gate.title }}</p>
          <p class="story-harness-gate__muted mt-1 text-xs leading-5">{{ gate.text }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
        <QyButton
        variant="secondary"
        size="sm"
        class="w-full"
        data-testid="story-harness-gate-open-review-packet"
        @click="$emit('open-review-packet')"
      >
        审查包
      </QyButton>
      <QyButton
        variant="secondary"
        size="sm"
        class="w-full"
        data-testid="story-harness-gate-open-change-requests"
        @click="$emit('open-change-requests')"
      >
        建议队列
      </QyButton>
    </div>

    <QyButton
      v-if="canTriggerIndex"
      variant="ghost"
      size="sm"
      class="w-full"
      data-testid="story-harness-gate-trigger-index"
      :loading="isTriggeringIndex"
      @click="$emit('trigger-index')"
    >
      刷新建议
    </QyButton>
  </QyCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyButton, QyCard } from '@/design-system/components'
import { Tag } from '@/design-system/base'
import { useStoryHarnessStore } from '@/modules/writer/stores/v3/storyHarnessStore'
import type {
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import {
  buildStoryHarnessWorkflowGateState,
  type StoryHarnessWorkflowGateStatus,
} from './storyHarnessWorkflowGates'

const props = defineProps<{
  chapterId: string
  chapterTitle: string
  content: string
  activeCharacters: StoryHarnessCharacterSummary[]
  activeRelations: StoryHarnessRelationSummary[]
  changeRequests: StoryHarnessChangeRequestPreview[]
  canTriggerIndex?: boolean
  isTriggeringIndex?: boolean
}>()

defineEmits<{
  (e: 'open-review-packet'): void
  (e: 'open-change-requests'): void
  (e: 'trigger-index'): void
}>()

const harnessStore = useStoryHarnessStore()
const gateState = computed(() =>
  buildStoryHarnessWorkflowGateState({
    chapterId: props.chapterId,
    chapterTitle: props.chapterTitle,
    content: props.content,
    activeCharacterCount: props.activeCharacters.length,
    activeRelationCount: props.activeRelations.length,
    changeRequests: props.changeRequests,
    getChangeRequestDecision: harnessStore.getChangeRequestDecision,
  }),
)

const gateStatusClassMap: Record<StoryHarnessWorkflowGateStatus, string> = {
  ready: 'bg-emerald-500',
  attention: 'bg-amber-500',
  missing: 'bg-slate-300',
  info: 'bg-sky-500',
}
</script>

<style scoped>
.story-harness-gate {
  border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent);
}

.story-harness-gate__heading {
  color: var(--editor-text-primary, #0f172a);
}

.story-harness-gate__muted {
  color: var(--editor-text-muted, #64748b);
}

.story-harness-gate__item {
  background: var(--editor-layer-strong, #f1f5f9);
}
</style>
