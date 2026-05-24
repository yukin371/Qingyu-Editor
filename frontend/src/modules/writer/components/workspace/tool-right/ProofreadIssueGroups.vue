<template>
  <div class="proofread-issue-groups">
    <section v-for="group in groupedIssues" :key="group.type" class="proofread-issue-groups__group">
      <div class="proofread-issue-groups__group-head">
        <h4>{{ group.label }}</h4>
        <span>{{ group.items.length }}</span>
      </div>

      <article
        v-for="issue in group.items"
        :key="issue.id"
        class="proofread-issue-groups__issue"
        :class="`proofread-issue-groups__issue--${issue.status}`"
      >
        <div class="proofread-issue-groups__issue-copy">
          <div class="proofread-issue-groups__issue-title">
            <strong>{{ issue.title }}</strong>
            <span :class="`proofread-issue-groups__severity proofread-issue-groups__severity--${issue.severity}`">
              {{ severityText(issue.severity) }}
            </span>
            <span v-if="issue.status !== 'open'" class="proofread-issue-groups__status">
              {{ statusText(issue.status) }}
            </span>
          </div>
          <p>{{ issue.description }}</p>
          <small v-if="issue.originalText">原文 {{ issue.originalText }}</small>
          <small v-if="issue.suggestion">{{ issue.suggestion }}</small>
          <small class="proofread-issue-groups__source">
            {{ issue.source === 'ai' ? 'AI' : '本地' }}
          </small>
        </div>
        <div class="proofread-issue-groups__issue-actions">
          <button
            v-if="canApply(issue)"
            type="button"
            :disabled="issue.status !== 'open'"
            @click="$emit('apply', issue.id)"
          >
            应用
          </button>
          <button
            v-if="issue.position"
            type="button"
            :disabled="issue.status !== 'open'"
            @click="$emit('locate', issue.id)"
          >
            定位
          </button>
          <button
            v-if="canIgnoreTerm(issue)"
            type="button"
            :disabled="issue.status !== 'open'"
            @click="$emit('ignore-term', issue.id)"
          >
            加白
          </button>
          <button type="button" :disabled="issue.status !== 'open'" @click="$emit('dismiss', issue.id)">
            忽略
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ProofreadIssue } from '@/modules/writer/composables/useProofreadPanel'

defineProps<{
  groupedIssues: Array<{
    type: string
    label: string
    items: ProofreadIssue[]
  }>
}>()

defineEmits<{
  (e: 'dismiss', issueId: string): void
  (e: 'locate', issueId: string): void
  (e: 'apply', issueId: string): void
  (e: 'ignore-term', issueId: string): void
}>()

function severityText(severity: ProofreadIssue['severity']) {
  const labels: Record<ProofreadIssue['severity'], string> = {
    error: '必改',
    warning: '建议',
    suggestion: '参考',
  }
  return labels[severity]
}

function statusText(status: ProofreadIssue['status']) {
  const labels: Record<ProofreadIssue['status'], string> = {
    open: '待处理',
    ignored: '已忽略',
    stale: '已过期',
  }
  return labels[status]
}

function canApply(issue: ProofreadIssue) {
  return !!(
    issue.position &&
    issue.originalText?.trim() &&
    issue.replacementText?.trim()
  )
}

function canIgnoreTerm(issue: ProofreadIssue) {
  return !!(issue.source === 'local' && issue.originalText?.trim())
}
</script>

<style scoped lang="scss">
.proofread-issue-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: auto;
}

.proofread-issue-groups__group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.proofread-issue-groups__group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h4,
  span {
    margin: 0;
  }

  h4 {
    font-size: 13px;
  }

  span {
    color: var(--editor-text-secondary, #475569);
    font-size: 12px;
  }
}

.proofread-issue-groups__issue {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 0;
  border-top: 1px solid var(--editor-border, #e2e8f0);
}

.proofread-issue-groups__issue--ignored,
.proofread-issue-groups__issue--stale {
  opacity: 0.62;
}

.proofread-issue-groups__issue-copy {
  display: grid;
  gap: 3px;

  strong,
  p,
  small {
    margin: 0;
  }

  p,
  small {
    color: var(--editor-text-secondary, #475569);
    line-height: 1.5;
  }
}

.proofread-issue-groups__issue-title {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.proofread-issue-groups__severity,
.proofread-issue-groups__status {
  padding: 1px 5px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.proofread-issue-groups__severity--error {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.1);
}

.proofread-issue-groups__severity--warning {
  color: #a16207;
  background: rgba(234, 179, 8, 0.12);
}

.proofread-issue-groups__severity--suggestion,
.proofread-issue-groups__status {
  color: var(--editor-text-secondary, #475569);
  background: color-mix(in srgb, var(--editor-border, #e2e8f0) 54%, transparent);
}

.proofread-issue-groups__source {
  font-weight: 600;
}

.proofread-issue-groups__issue-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;

  button {
    height: 24px;
    padding: 0 7px;
    border-radius: 7px;
    border: 1px solid var(--editor-border, #d9dee6);
    background: transparent;
    color: var(--editor-text-secondary, #475569);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
