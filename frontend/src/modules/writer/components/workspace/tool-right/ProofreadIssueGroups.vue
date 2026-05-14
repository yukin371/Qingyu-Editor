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
      >
        <div class="proofread-issue-groups__issue-copy">
          <strong>{{ issue.title }}</strong>
          <p>{{ issue.description }}</p>
          <small v-if="issue.suggestion">{{ issue.suggestion }}</small>
        </div>
        <div class="proofread-issue-groups__issue-actions">
          <button type="button" @click="$emit('dismiss', issue.id)">忽略</button>
          <button type="button" class="is-primary" @click="$emit('dismiss', issue.id)">
            {{ issue.type === 'logic' ? '查看' : '修正' }}
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
}>()
</script>

<style scoped lang="scss">
.proofread-issue-groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow: auto;
}

.proofread-issue-groups__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  gap: 14px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.82)) 88%, transparent);
}

.proofread-issue-groups__issue-copy {
  display: grid;
  gap: 6px;

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

.proofread-issue-groups__issue-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  button {
    height: 32px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.92)) 94%, transparent);
    color: var(--editor-text-secondary, #475569);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .is-primary {
    border-color: rgba(234, 179, 8, 0.22);
    color: #a16207;
  }
}
</style>
