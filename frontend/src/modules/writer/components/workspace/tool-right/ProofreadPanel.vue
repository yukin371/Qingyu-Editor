<template>
  <div class="proofread-panel">
    <header class="proofread-panel__header">
      <div class="proofread-panel__title">
        <h3>校对</h3>
        <span>{{ panelSummary }}</span>
      </div>
      <div class="proofread-panel__actions">
        <button
          type="button"
          class="proofread-panel__primary"
          :disabled="isRunning || !hasSourceText"
          @click="runProofread"
        >
          {{ isRunning && runMode === 'system' ? '校对中…' : '系统' }}
        </button>
        <button
          type="button"
          class="proofread-panel__secondary"
          :disabled="isRunning || !hasSourceText"
          @click="runAIProofread"
        >
          {{ isAIRunning ? '审校中…' : 'AI 深审' }}
        </button>
        <button
          type="button"
          class="proofread-panel__secondary"
          @click="lexiconDialogVisible = true"
        >
          词库
        </button>
      </div>
    </header>

    <div class="proofread-panel__status" :class="{ 'is-warning': Boolean(notice) }">
      <strong>{{ statusTitle }}</strong>
      <span v-if="statusDescription">{{ statusDescription }}</span>
    </div>

    <template v-if="issues.length > 0 && !isRunning">
      <p v-if="notice" class="proofread-panel__notice">{{ notice }}</p>
      <ProofreadIssueGroups
        :grouped-issues="groupedIssues"
        @dismiss="dismissIssue"
        @locate="locateIssue"
        @apply="applyIssue"
        @ignore-term="ignoreTerm"
      />
    </template>

    <ProofreadLexiconDialog
      v-model:visible="lexiconDialogVisible"
      @changed="handleLexiconChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import ProofreadIssueGroups from '@/modules/writer/components/workspace/tool-right/ProofreadIssueGroups.vue'
import ProofreadLexiconDialog from '@/modules/writer/components/workspace/tool-right/ProofreadLexiconDialog.vue'
import { useProofreadPanel, type ProofreadIssue } from '@/modules/writer/composables/useProofreadPanel'

const props = defineProps<{
  sourceText: string
  projectId?: string
  chapterId?: string
  ignoredTerms?: string[]
}>()

const emit = defineEmits<{
  (e: 'issues-change', issues: ProofreadIssue[]): void
  (e: 'locate', issue: ProofreadIssue): void
  (e: 'apply', issue: ProofreadIssue): void
}>()

const {
  isRunning,
  issues,
  hasRun,
  hasSourceText,
  groupedIssues,
  runMode,
  notice,
  dismissIssue,
  ignoreTerm,
  runProofread,
  runAIProofread,
  isAIRunning,
} = useProofreadPanel(toRef(props, 'sourceText'), {
  projectId: toRef(props, 'projectId'),
  chapterId: toRef(props, 'chapterId'),
  ignoredTerms: toRef(props, 'ignoredTerms'),
})
const lexiconDialogVisible = ref(false)
const panelSummary = computed(() =>
  issues.value.length > 0 ? `${issues.value.length} 条` : '本地 / AI',
)
const statusTitle = computed(() => {
  if (!hasSourceText.value) return '无正文'
  if (isRunning.value) return runMode.value === 'ai' ? 'AI 审校中' : '校对中'
  if (issues.value.length > 0) return `${issues.value.length} 条建议`
  return hasRun.value ? '未发现问题' : '未运行'
})
const statusDescription = computed(() => {
  if (!hasSourceText.value) return '写入正文后运行。'
  if (isRunning.value) return '仅生成建议。'
  if (issues.value.length > 0) return ''
  return hasRun.value ? '' : '系统优先。'
})

watch(
  issues,
  (value) => {
    emit('issues-change', value)
  },
  { deep: true, immediate: true },
)

function locateIssue(issueId: string) {
  const issue = issues.value.find((item) => item.id === issueId)
  if (!issue || issue.status !== 'open' || !issue.position) return
  emit('locate', issue)
}

function applyIssue(issueId: string) {
  const issue = issues.value.find((item) => item.id === issueId)
  if (
    !issue ||
    issue.status !== 'open' ||
    !issue.position ||
    !issue.originalText?.trim() ||
    !issue.replacementText?.trim()
  ) {
    return
  }
  emit('apply', issue)
}

function handleLexiconChanged() {
  if (hasRun.value && hasSourceText.value) {
    void runProofread()
  }
}
</script>

<style scoped lang="scss">
.proofread-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 8px 9px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.proofread-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.proofread-panel__title {
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

.proofread-panel__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  flex-wrap: wrap;
}

.proofread-panel__primary,
.proofread-panel__secondary {
  height: 24px;
  padding: 0 7px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.22)) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.proofread-panel__primary {
  border-color: rgba(234, 179, 8, 0.24);
  color: var(--color-warning-700, #a16207);
}

.proofread-panel__secondary {
  border-color: rgba(14, 165, 233, 0.24);
  color: var(--editor-accent, #0284c7);
}

.proofread-panel__status {
  display: grid;
  gap: 1px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid var(--editor-border, #e2e8f0);
  background: color-mix(in srgb, var(--editor-layer-soft, #f8fafc) 70%, transparent);
  color: var(--editor-text-secondary, #475569);

  strong {
    font-size: 12px;
    color: var(--editor-text-primary, #0f172a);
  }

  span {
    font-size: 11px;
    line-height: 1.5;
  }
}

.proofread-panel__status.is-warning {
  border-color: color-mix(in srgb, var(--color-warning-500, #f59e0b) 28%, transparent);
}

.proofread-panel__notice {
  margin: 0;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--color-warning-500, #f59e0b) 28%, transparent);
  background: color-mix(in srgb, var(--color-warning-50, #fffbeb) 86%, transparent);
  color: var(--color-warning-700, #a16207);
  font-size: 11px;
  line-height: 1.5;
}

</style>
