import { computed, ref, watch, type Ref } from 'vue'

export type ProofreadIssueType = 'typo' | 'logic' | 'coherence'

export interface ProofreadIssue {
  id: string
  type: ProofreadIssueType
  title: string
  description: string
  suggestion?: string
}

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

export const useProofreadPanel = (sourceText: Ref<string>) => {
  const isRunning = ref(false)
  const issues = ref<ProofreadIssue[]>([])
  const hasSourceText = computed(() => sourceText.value.trim().length > 0)

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

  const dismissIssue = (issueId: string) => {
    issues.value = issues.value.filter((issue) => issue.id !== issueId)
  }

  const runProofread = async () => {
    if (!hasSourceText.value || isRunning.value) return
    isRunning.value = true
    await new Promise((resolve) => window.setTimeout(resolve, 240))
    issues.value = buildProofreadIssues(sourceText.value)
    isRunning.value = false
  }

  watch(sourceText, () => {
    issues.value = []
    isRunning.value = false
  })

  return {
    isRunning,
    issues,
    hasSourceText,
    groupedIssues,
    dismissIssue,
    runProofread,
  }
}
