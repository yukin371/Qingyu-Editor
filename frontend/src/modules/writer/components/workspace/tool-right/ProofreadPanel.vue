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

    <div v-else class="proofread-panel__groups">
      <section
        v-for="group in groupedIssues"
        :key="group.type"
        class="proofread-panel__group"
      >
        <div class="proofread-panel__group-head">
          <h4>{{ group.label }}</h4>
          <span>{{ group.items.length }}</span>
        </div>

        <article
          v-for="issue in group.items"
          :key="issue.id"
          class="proofread-panel__issue"
        >
          <div class="proofread-panel__issue-copy">
            <strong>{{ issue.title }}</strong>
            <p>{{ issue.description }}</p>
            <small v-if="issue.suggestion">{{ issue.suggestion }}</small>
          </div>
          <div class="proofread-panel__issue-actions">
            <button type="button" @click="dismissIssue(issue.id)">忽略</button>
            <button type="button" class="is-primary" @click="dismissIssue(issue.id)">
              {{ issue.type === 'logic' ? '查看' : '修正' }}
            </button>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'

type ProofreadIssueType = 'typo' | 'logic' | 'coherence'

interface ProofreadIssue {
  id: string
  type: ProofreadIssueType
  title: string
  description: string
  suggestion?: string
}

const props = defineProps<{
  sourceText: string
}>()

const isRunning = ref(false)
const issues = ref<ProofreadIssue[]>([])

const hasSourceText = computed(() => props.sourceText.trim().length > 0)

const groupedIssues = computed(() => {
  const labels: Record<ProofreadIssueType, string> = {
    typo: '错别字 / 标点',
    logic: '逻辑冲突',
    coherence: '连贯性',
  }

  return (['typo', 'logic', 'coherence'] as ProofreadIssueType[])
    .map((type) => ({
      type,
      label: labels[type],
      items: issues.value.filter((issue) => issue.type === type),
    }))
    .filter((group) => group.items.length > 0)
})

const buildProofreadIssues = (sourceText: string): ProofreadIssue[] => {
  const text = sourceText.trim()
  if (!text) return []

  const nextIssues: ProofreadIssue[] = []
  const paragraphs = text.split(/\n+/).map((item) => item.trim()).filter(Boolean)

  if (/([。！？])\1{1,}/.test(text) || /\s{2,}/.test(text)) {
    nextIssues.push({
      id: 'typo-repeat',
      type: 'typo',
      title: '检测到重复标点或多余空格',
      description: '正文里存在重复标点或连续空格，建议人工复核并统一格式。',
      suggestion: '可优先检查 “。。/！！/??” 这类连续标点。',
    })
  }

  if (paragraphs.some((paragraph) => paragraph.length < 12)) {
    nextIssues.push({
      id: 'coherence-short',
      type: 'coherence',
      title: '部分段落过短',
      description: '存在信息量较低的短段落，可能会打断叙事节奏。',
      suggestion: '可考虑把相邻段落合并，或补上动作 / 情绪承接句。',
    })
  }

  if (/(昨天|今早).*(明天|次日)/.test(text) || /(明天|次日).*(昨天|今早)/.test(text)) {
    nextIssues.push({
      id: 'logic-time',
      type: 'logic',
      title: '时间线表述可能冲突',
      description: '同一段正文中同时出现前后时间词，建议核对事件先后关系。',
      suggestion: '重点检查跨段落跳时是否缺少过渡。',
    })
  }

  if (nextIssues.length === 0) {
    nextIssues.push({
      id: 'coherence-default',
      type: 'coherence',
      title: '建议复核章节收束',
      description: '自动检查未发现明显格式问题，但章节结尾仍建议人工确认情绪落点。',
      suggestion: '可重点检查结尾是否给出足够的悬念或推进。',
    })
  }

  return nextIssues
}

const dismissIssue = (issueId: string) => {
  issues.value = issues.value.filter((issue) => issue.id !== issueId)
}

const runProofread = async () => {
  if (!hasSourceText.value || isRunning.value) return
  isRunning.value = true
  await new Promise((resolve) => window.setTimeout(resolve, 240))
  issues.value = buildProofreadIssues(props.sourceText)
  isRunning.value = false
}

watch(
  () => props.sourceText,
  () => {
    issues.value = []
    isRunning.value = false
  },
)
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
    radial-gradient(circle at top right, rgba(250, 204, 21, 0.12), transparent 28%),
    linear-gradient(180deg, #fffdf5, #f8fafc 100%);
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
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.proofread-panel__primary,
.proofread-panel__issue-actions button {
  height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.92);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.proofread-panel__primary {
  border-color: rgba(234, 179, 8, 0.24);
  color: #a16207;
}

.proofread-panel__empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.66);
  color: var(--editor-text-secondary, #475569);
}

.proofread-panel__groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow: auto;
}

.proofread-panel__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.proofread-panel__group-head {
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

.proofread-panel__issue {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.82);
}

.proofread-panel__issue-copy {
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

.proofread-panel__issue-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  .is-primary {
    border-color: rgba(234, 179, 8, 0.22);
    color: #a16207;
  }
}
</style>
