<template>
  <div class="proofread-panel">
    <header class="proofread-panel__header">
      <div>
        <p class="proofread-panel__eyebrow">Proofread</p>
        <h3>校对助手</h3>
        <p>先用本地规则做轻量初筛，后续可替换为后端 AI 校对接口。</p>
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
      <span>当前章节还没有正文，先写一点内容再校对。</span>
    </div>

    <div v-else-if="issues.length === 0 && !isRunning" class="proofread-panel__empty">
      <QyIcon name="MagicStick" :size="18" />
      <span>还没有校对结果，点击“开始校对”生成建议。</span>
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
  padding: 18px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--color-warning-400, #facc15) 14%, transparent), transparent 28%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--editor-layer-panel, #fffdf5) 96%, transparent),
      color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 92%, transparent) 100%
    );
}

.proofread-panel__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;

  h3 {
    margin: 0;
  }

  p {
    margin: 8px 0 0;
    color: var(--editor-text-secondary, #475569);
    line-height: 1.6;
  }
}

.proofread-panel__eyebrow {
  margin: 0 0 6px;
  color: var(--color-warning-700, #b45309);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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
  border-radius: 18px;
  border: 1px dashed color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.4)) 76%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 66%, transparent);
  color: var(--editor-text-secondary, #475569);
}

</style>
