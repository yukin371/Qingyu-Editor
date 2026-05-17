<template>
  <div class="proofread-panel">
    <header class="proofread-panel__header">
      <div>
        <h3>校对助手</h3>
      </div>
      <button
        type="button"
        class="proofread-panel__primary"
        :disabled="isRunning || !hasSourceText"
        @click="runProofread"
      >
        {{ isRunning ? '校对中…' : '开始校对' }}
      </button>
    </header>

    <div v-if="!hasSourceText" class="proofread-panel__empty">
      <QyIcon name="DocumentChecked" :size="18" />
      <span>当前章节暂无正文</span>
    </div>

    <div v-else-if="issues.length === 0 && !isRunning" class="proofread-panel__empty">
      <QyIcon name="MagicStick" :size="18" />
      <span>点击“开始校对”生成建议</span>
    </div>

    <ProofreadIssueGroups v-else :grouped-issues="groupedIssues" @dismiss="dismissIssue" />
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import ProofreadIssueGroups from '@/modules/writer/components/workspace/tool-right/ProofreadIssueGroups.vue'
import { useProofreadPanel } from '@/modules/writer/composables/useProofreadPanel'

const props = defineProps<{
  sourceText: string
}>()

const { isRunning, issues, hasSourceText, groupedIssues, dismissIssue, runProofread } =
  useProofreadPanel(toRef(props, 'sourceText'))
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
}

.proofread-panel__primary {
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

</style>
