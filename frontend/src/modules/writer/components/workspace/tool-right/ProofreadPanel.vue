<template>
  <div class="proofread-panel">
    <header class="proofread-panel__header">
      <div>
        <h3>校对助手</h3>
        <p>系统规则默认本地运行，AI 只做深度审校。</p>
      </div>
      <div class="proofread-panel__actions">
        <button
          type="button"
          class="proofread-panel__primary"
          :disabled="isRunning || !hasSourceText"
          @click="runProofread"
        >
          {{ isRunning && runMode === 'system' ? '校对中…' : '系统校对' }}
        </button>
        <button
          type="button"
          class="proofread-panel__secondary"
          :disabled="isRunning || !hasSourceText"
          @click="runAIProofread"
        >
          {{ isAIRunning ? '审校中…' : 'AI 深度审校' }}
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

    <div v-if="!hasSourceText" class="proofread-panel__empty">
      <QyIcon name="DocumentChecked" :size="18" />
      <span>当前章节暂无正文</span>
    </div>

    <div v-else-if="issues.length === 0 && !isRunning" class="proofread-panel__empty">
      <QyIcon name="MagicStick" :size="18" />
      <span>{{ hasRun ? '未发现明显问题' : '点击“系统校对”生成本地建议' }}</span>
    </div>

    <div v-else-if="isRunning" class="proofread-panel__empty">
      <QyIcon name="MagicStick" :size="18" />
      <span>正在校对当前章节</span>
    </div>

    <template v-else>
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
import { ref, toRef, watch } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
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
  gap: 16px;
  padding: 14px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.proofread-panel__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;

  h3 {
    margin: 0;
  }

  h3 {
    font-size: 15px;
    color: var(--editor-text-primary, #0f172a);
  }

  p {
    margin: 4px 0 0;
    color: var(--editor-text-secondary, #64748b);
    font-size: 12px;
    line-height: 1.5;
  }
}

.proofread-panel__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.proofread-panel__primary,
.proofread-panel__secondary {
  height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.22)) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
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

.proofread-panel__empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-top: 1px solid var(--editor-border, #e2e8f0);
  color: var(--editor-text-secondary, #475569);
  min-height: 160px;
}

.proofread-panel__notice {
  margin: 0;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--color-warning-500, #f59e0b) 28%, transparent);
  background: color-mix(in srgb, var(--color-warning-50, #fffbeb) 86%, transparent);
  color: var(--color-warning-700, #a16207);
  font-size: 12px;
  line-height: 1.5;
}

</style>
