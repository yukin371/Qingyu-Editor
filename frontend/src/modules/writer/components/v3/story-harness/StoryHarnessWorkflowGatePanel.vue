<template>
  <section
    class="story-harness-gate"
    data-testid="story-harness-workflow-gate-panel"
  >
    <div class="story-harness-gate__head">
      <h4>门槛</h4>
      <Tag size="sm" :variant="gateState.summary.variant" effect="light">
        {{ gateState.summary.label }}
      </Tag>
    </div>

    <p class="story-harness-gate__next" data-testid="story-harness-gate-next-action">
      {{ gateState.nextAction }}
    </p>

    <div class="story-harness-gate__items">
      <div
        v-for="gate in gateState.gates"
        :key="gate.key"
        class="story-harness-gate__item"
        :data-testid="`story-harness-gate-${gate.key}`"
      >
        <span
          class="story-harness-gate__dot"
          :class="gateStatusClassMap[gate.status]"
        />
        <div>
          <strong>{{ gate.title }}</strong>
          <span>{{ gate.text }}</span>
        </div>
      </div>
    </div>

    <div class="story-harness-gate__actions">
      <button
        type="button"
        class="story-harness-gate__button"
        data-testid="story-harness-gate-open-review-packet"
        @click="$emit('open-review-packet')"
      >
        包
      </button>
      <button
        type="button"
        class="story-harness-gate__button"
        data-testid="story-harness-gate-open-change-requests"
        @click="$emit('open-change-requests')"
      >
        队列
      </button>
      <button
        v-if="canTriggerIndex"
        type="button"
        class="story-harness-gate__button"
        data-testid="story-harness-gate-trigger-index"
        :disabled="isTriggeringIndex"
        @click="$emit('trigger-index')"
      >
        {{ isTriggeringIndex ? '刷新中' : '刷新' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

<style scoped lang="scss">
.story-harness-gate {
  display: grid;
  gap: 6px;
  padding: 7px 8px;
  border-radius: 8px;
  border: 1px solid var(--editor-border, #e2e8f0);
  background: color-mix(in srgb, var(--editor-layer-soft, #f8fafc) 70%, transparent);
}

.story-harness-gate__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  h4 {
    margin: 0;
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
  }
}

.story-harness-gate__next {
  margin: 0;
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
  line-height: 1.45;
}

.story-harness-gate__items {
  display: grid;
  gap: 4px;
}

.story-harness-gate__item {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 0;

  > div {
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 5px;
  }

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 11px;
  }

  span:last-child {
    color: var(--editor-text-muted, #64748b);
    font-size: 11px;
    line-height: 1.45;
  }
}

.story-harness-gate__dot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  margin-top: 6px;
  border-radius: 999px;
}

.story-harness-gate__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.story-harness-gate__button {
  height: 24px;
  padding: 0 7px;
  border-radius: 7px;
  border: 1px solid rgba(148, 163, 184, 0.2);
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
</style>
