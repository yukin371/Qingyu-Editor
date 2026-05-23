import { computed, ref, watch, type Ref } from 'vue'
import { proofreadContent, type ReviewIssue } from '@/modules/ai/api/workbench'
import {
  addUserProofreadIgnoredTerm,
  findAllProofreadLexiconMatches,
  getUserProofreadIgnoredTerms,
} from '@/modules/writer/services/proofreadLexicon.service'

export type ProofreadIssueType =
  | 'typo'
  | 'grammar'
  | 'punctuation'
  | 'logic'
  | 'coherence'
  | 'style'
  | 'readability'

export type ProofreadIssueSeverity = 'error' | 'warning' | 'suggestion'
export type ProofreadIssueStatus = 'open' | 'ignored' | 'stale'
export type ProofreadRunMode = 'idle' | 'system' | 'ai' | 'ai_unavailable'

export interface ProofreadIssue {
  id: string
  type: ProofreadIssueType
  severity: ProofreadIssueSeverity
  status: ProofreadIssueStatus
  title: string
  description: string
  suggestion?: string
  replacementText?: string
  originalText?: string
  position?: {
    start: number
    end: number
  }
  source: 'ai' | 'local'
}

interface ProofreadPanelOptions {
  projectId?: Ref<string | undefined>
  chapterId?: Ref<string | undefined>
  ignoredTerms?: Ref<string[] | undefined>
}

const typeLabels: Record<ProofreadIssueType, string> = {
  typo: '错别字 / 标点',
  grammar: '病句',
  punctuation: '标点',
  logic: '逻辑冲突',
  coherence: '连贯性',
  style: '表达',
  readability: '阅读体验',
}

function normalizeIssueType(type?: string): ProofreadIssueType {
  const raw = String(type || '').toLowerCase()
  if (raw.includes('grammar') || raw.includes('语法') || raw.includes('病句')) return 'grammar'
  if (raw.includes('punctuation') || raw.includes('标点')) return 'punctuation'
  if (raw.includes('logic') || raw.includes('逻辑')) return 'logic'
  if (raw.includes('coherence') || raw.includes('连贯')) return 'coherence'
  if (raw.includes('readability') || raw.includes('阅读')) return 'readability'
  if (raw.includes('style') || raw.includes('表达')) return 'style'
  return 'typo'
}

function normalizeSeverity(severity?: string): ProofreadIssueSeverity {
  const raw = String(severity || '').toLowerCase()
  if (['error', 'high', 'critical', '严重'].includes(raw)) return 'error'
  if (['warning', 'medium', 'warn', '中等'].includes(raw)) return 'warning'
  return 'suggestion'
}

function firstSuggestion(issue: ReviewIssue) {
  return issue.suggestionDetails?.[0]?.text || issue.suggestions?.[0] || ''
}

function findPosition(sourceText: string, originalText?: string): ProofreadIssue['position'] | undefined {
  const text = originalText?.trim()
  if (!text) return undefined
  const start = sourceText.indexOf(text)
  return start >= 0 ? { start, end: start + text.length } : undefined
}

function normalizeAIProofreadIssues(sourceText: string, issues: ReviewIssue[]): ProofreadIssue[] {
  return issues
    .map((issue, index) => {
      const type = normalizeIssueType(issue.type || issue.category)
      const originalText = issue.originalText?.trim() || undefined
      const replacementText = firstSuggestion(issue).trim()
      const position =
        issue.position && issue.position.end > issue.position.start
          ? { start: issue.position.start, end: issue.position.end }
          : findPosition(sourceText, originalText)
      return {
        id: issue.id || `ai-proofread-${index + 1}`,
        type,
        severity: normalizeSeverity(issue.severity),
        status: 'open' as const,
        title: typeLabels[type],
        description: issue.message || '检测到可优化项。',
        suggestion: replacementText || undefined,
        replacementText: replacementText || undefined,
        originalText,
        position,
        source: 'ai' as const,
      }
    })
    .filter((issue) => issue.description.trim().length > 0)
}

function createLocalIssue(input: Omit<ProofreadIssue, 'severity' | 'status' | 'source'> & {
  severity?: ProofreadIssueSeverity
}): ProofreadIssue {
  return {
    ...input,
    severity: input.severity || 'warning',
    status: 'open',
    source: 'local',
  }
}

function countMatches(text: string, pattern: string) {
  return (text.match(new RegExp(pattern, 'g')) || []).length
}

function addLocalRegexIssue(
  issues: ProofreadIssue[],
  sourceText: string,
  input: {
    idPrefix: string
    type: ProofreadIssueType
    title: string
    description: string
    suggestion?: string
    severity?: ProofreadIssueSeverity
    pattern: RegExp
  },
) {
  const match = input.pattern.exec(sourceText)
  if (match?.index === undefined) return

  issues.push(
    createLocalIssue({
      id: `${input.idPrefix}-${match.index}`,
      type: input.type,
      title: input.title,
      description: input.description,
      suggestion: input.suggestion,
      severity: input.severity,
      originalText: match[0],
      position: {
        start: match.index,
        end: match.index + match[0].length,
      },
    }),
  )
}

const normalizeIgnoredTerms = (extraTerms: string[] = []) =>
  Array.from(
    new Set(
      [...getUserProofreadIgnoredTerms(), ...extraTerms]
        .map((term) => term.trim())
        .filter(Boolean),
    ),
  )

const buildProofreadIssues = (sourceText: string, ignoredTerms: string[] = []): ProofreadIssue[] => {
  if (!sourceText.trim()) return []

  const nextIssues: ProofreadIssue[] = []
  const paragraphs = sourceText.split(/\n+/).map((item) => item.trim()).filter(Boolean)

  addLocalRegexIssue(nextIssues, sourceText, {
    idPrefix: 'local-repeat-punctuation',
    type: 'punctuation',
    title: '重复标点',
    description: '正文里存在重复标点，建议统一为单个标点。',
    suggestion: '可改为单个标点。',
    severity: 'error',
    pattern: /([。！？!?])\1{1,}/,
  })

  addLocalRegexIssue(nextIssues, sourceText, {
    idPrefix: 'local-repeat-space',
    type: 'typo',
    title: '连续空格',
    description: '正文里存在连续空格，建议统一格式。',
    suggestion: '可改为单个空格或直接删除。',
    pattern: /[^\S\r\n]{2,}/,
  })

  addLocalRegexIssue(nextIssues, sourceText, {
    idPrefix: 'local-repeat-word',
    type: 'typo',
    title: '重复词',
    description: '相邻位置出现重复词，可能是输入时误重复。',
    suggestion: '检查是否需要删除一个重复词。',
    severity: 'error',
    pattern: /([\u4e00-\u9fa5]{1,4})\1/,
  })

  for (const match of findAllProofreadLexiconMatches(sourceText, normalizeIgnoredTerms(ignoredTerms))) {
    const suggestion = match.entry.suggestions[0]
    nextIssues.push(
      createLocalIssue({
        id: `local-lexicon-${match.lexiconId}-${match.start}`,
        type: 'typo',
        title: ['idiom_typo', 'external_idiom'].includes(match.entry.category || '')
          ? '成语错写'
          : '常见错词',
        description: match.entry.message || `检测到常见错词“${match.text}”。`,
        suggestion: suggestion ? `建议改为“${suggestion}”。` : undefined,
        replacementText: suggestion || undefined,
        severity: match.entry.severity,
        originalText: match.text,
        position: {
          start: match.start,
          end: match.end,
        },
      }),
    )
  }

  addLocalRegexIssue(nextIssues, sourceText, {
    idPrefix: 'local-dialogue-punctuation',
    type: 'punctuation',
    title: '对话标点',
    description: '中文对话后直接接提示语时，句末通常使用逗号更自然。',
    suggestion: '可核对是否应改为逗号。',
    pattern: /“[^”]{1,80}[。！？]”[他说她问道]/,
  })

  const openQuoteCount = countMatches(sourceText, '“')
  const closeQuoteCount = countMatches(sourceText, '”')
  if (openQuoteCount !== closeQuoteCount) {
    const index = Math.max(sourceText.lastIndexOf('“'), sourceText.lastIndexOf('”'), 0)
    nextIssues.push(
      createLocalIssue({
        id: `local-unbalanced-quote-${index}`,
        type: 'punctuation',
        title: '引号未闭合',
        description: '中文引号数量不成对，建议检查对话或引用范围。',
        suggestion: '补齐或删除多余的引号。',
        severity: 'error',
        originalText: sourceText[index] || '“”',
        position: { start: index, end: Math.min(index + 1, sourceText.length) },
      }),
    )
  }

  const openBracketCount = countMatches(sourceText, '（')
  const closeBracketCount = countMatches(sourceText, '）')
  if (openBracketCount !== closeBracketCount) {
    const index = Math.max(sourceText.lastIndexOf('（'), sourceText.lastIndexOf('）'), 0)
    nextIssues.push(
      createLocalIssue({
        id: `local-unbalanced-bracket-${index}`,
        type: 'punctuation',
        title: '括号未闭合',
        description: '中文括号数量不成对，建议检查补充说明范围。',
        suggestion: '补齐或删除多余的括号。',
        severity: 'warning',
        originalText: sourceText[index] || '（）',
        position: { start: index, end: Math.min(index + 1, sourceText.length) },
      }),
    )
  }

  const longSentence = sourceText.match(/[^。！？!?]{80,}[。！？!?]/)
  if (longSentence?.index !== undefined) {
    nextIssues.push(
      createLocalIssue({
        id: `local-long-sentence-${longSentence.index}`,
        type: 'readability',
        severity: 'suggestion',
        title: '长句阅读压力',
        description: '存在较长句子，移动端阅读时可能需要拆分节奏。',
        suggestion: '可拆成两个短句，或加入动作 / 停顿承接。',
        originalText: longSentence[0],
        position: {
          start: longSentence.index,
          end: longSentence.index + longSentence[0].length,
        },
      }),
    )
  }

  const longParagraph = paragraphs.find((paragraph) => paragraph.length > 420)
  if (longParagraph) {
    nextIssues.push(
      createLocalIssue({
        id: `local-long-paragraph-${sourceText.indexOf(longParagraph)}`,
        type: 'readability',
        severity: 'suggestion',
        title: '长段落阅读压力',
        description: '段落过长，移动端阅读时容易形成大段文字墙。',
        suggestion: '可按动作、对话或情绪变化拆成多个段落。',
        originalText: longParagraph.slice(0, 80),
        position: findPosition(sourceText, longParagraph.slice(0, 80)),
      }),
    )
  }

  const shortParagraph = paragraphs.find((paragraph) => paragraph.length > 0 && paragraph.length < 12)
  if (shortParagraph) {
    nextIssues.push(
      createLocalIssue({
        id: `local-short-${sourceText.indexOf(shortParagraph)}`,
        type: 'readability',
        severity: 'suggestion',
        title: '短段落节奏',
        description: '存在信息量较低的短段落，可能会打断叙事节奏。',
        suggestion: '可考虑与相邻段落合并，或补上动作 / 情绪承接句。',
        originalText: shortParagraph,
        position: findPosition(sourceText, shortParagraph),
      }),
    )
  }

  const timeConflict = sourceText.match(/(昨天|今早).{0,80}(明天|次日)|(明天|次日).{0,80}(昨天|今早)/)
  if (timeConflict?.index !== undefined) {
    nextIssues.push(
      createLocalIssue({
        id: `local-time-${timeConflict.index}`,
        type: 'logic',
        title: '时间线表述可能冲突',
        description: '同一段附近同时出现前后时间词，建议核对事件先后关系。',
        suggestion: '重点检查跨段落跳时是否缺少过渡。',
        originalText: timeConflict[0],
        position: {
          start: timeConflict.index,
          end: timeConflict.index + timeConflict[0].length,
        },
      }),
    )
  }

  return nextIssues
}

export const useProofreadPanel = (sourceText: Ref<string>, options: ProofreadPanelOptions = {}) => {
  const isRunning = ref(false)
  const isAIRunning = ref(false)
  const issues = ref<ProofreadIssue[]>([])
  const hasRun = ref(false)
  const runMode = ref<ProofreadRunMode>('idle')
  const notice = ref('')
  const hasSourceText = computed(() => sourceText.value.trim().length > 0)

  const openIssues = computed(() => issues.value.filter((issue) => issue.status === 'open'))

  const groupedIssues = computed(() =>
    (Object.keys(typeLabels) as ProofreadIssueType[])
      .map((type) => ({
        type,
        label: typeLabels[type],
        items: issues.value.filter((issue) => issue.type === type),
      }))
      .filter((group) => group.items.length > 0),
  )

  const dismissIssue = (issueId: string) => {
    issues.value = issues.value.map((issue) =>
      issue.id === issueId ? { ...issue, status: 'ignored' } : issue,
    )
  }

  const ignoreTerm = (issueId: string) => {
    const targetIssue = issues.value.find((issue) => issue.id === issueId)
    const term = targetIssue?.originalText?.trim()
    if (!term || targetIssue?.source !== 'local') return

    addUserProofreadIgnoredTerm(term)
    issues.value = issues.value.filter((issue) => issue.originalText?.trim() !== term)
    notice.value = `已将“${term}”加入校对白名单。`
  }

  const runProofread = async () => {
    if (!hasSourceText.value || isRunning.value) return
    isRunning.value = true
    hasRun.value = true
    notice.value = ''
    issues.value = buildProofreadIssues(sourceText.value, options.ignoredTerms?.value ?? [])
    runMode.value = 'system'
    isRunning.value = false
  }

  const runAIProofread = async () => {
    if (!hasSourceText.value || isAIRunning.value) return
    isAIRunning.value = true
    isRunning.value = true
    hasRun.value = true
    notice.value = ''

    try {
      const result = await proofreadContent({
        content: sourceText.value,
        projectId: options.projectId?.value,
        chapterId: options.chapterId?.value,
      })
      issues.value = [
        ...buildProofreadIssues(sourceText.value, options.ignoredTerms?.value ?? []),
        ...normalizeAIProofreadIssues(sourceText.value, result.issues),
      ]
      runMode.value = 'ai'
    } catch (error) {
      console.warn('[useProofreadPanel] AI proofread unavailable:', error)
      issues.value = buildProofreadIssues(sourceText.value, options.ignoredTerms?.value ?? [])
      runMode.value = 'ai_unavailable'
      notice.value = 'AI 深度审校不可用，已保留系统规则校对结果。'
    } finally {
      isRunning.value = false
      isAIRunning.value = false
    }
  }

  watch(sourceText, () => {
    if (!hasRun.value) return
    issues.value = issues.value.map((issue) =>
      issue.status === 'open' ? { ...issue, status: 'stale' } : issue,
    )
    notice.value = '正文已变化，请重新校对。'
    isRunning.value = false
  })

  return {
    isRunning,
    issues,
    openIssues,
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
  }
}
