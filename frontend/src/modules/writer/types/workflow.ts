import type {
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'

export type AIApplyMode =
  | 'replace_selection'
  | 'insert_after_selection'
  | 'append_paragraph'
  | 'replace_document'

export type WriterWorkflowSource = 'selection' | 'story_harness' | 'ai_result' | 'workspace'

export type WriterWorkbenchTab = 'rewrite' | 'summary' | 'review' | 'chat'

export type WriterStructurePlanMode = 'volume' | 'chapter'
export type WriterPromptIntentAction = 'summarize' | 'rewrite' | 'continue' | 'proofread' | 'expand'
export type WriterPromptIntentKind = 'edit' | 'analysis'

export interface WriterPromptIntent {
  action: WriterPromptIntentAction
  confidence: number
  kind: WriterPromptIntentKind
  targetLength?: number
}

export interface WriterPromptExecution {
  route: 'chat' | 'edit' | 'analysis'
  intent: WriterPromptIntent | null
  applyMode?: AIApplyMode
}

export interface WriterWorkflowActionRequest {
  source?: WriterWorkflowSource
  action: string
  text: string
  title?: string
  instructions?: string
  from?: number
  to?: number
  applyMode?: AIApplyMode
}

export interface WriterAIActionTrigger extends WriterWorkflowActionRequest {
  id: number
  context?: WriterWorkflowContext | null
}

export interface WriterAIApplyPayload {
  action: string
  sourceText: string
  generatedText: string
  applyMode?: AIApplyMode
  targetDocumentId?: string
  targetDocumentTitle?: string
}

export interface WriterAIApplyFeedback {
  status: 'idle' | 'success' | 'fallback'
  title: string
  detail: string
  mode?: AIApplyMode
  updatedAt: number
}

export interface WriterWorkflowContext {
  signature: string
  projectId: string
  chapterId: string
  chapterTitle: string
  scopeLabel?: string
  activeCharacters: Array<Pick<StoryHarnessCharacterSummary, 'id' | 'name' | 'currentState'>>
  activeRelations: Array<Pick<StoryHarnessRelationSummary, 'id' | 'fromName' | 'toName' | 'type'>>
  pendingChangeRequests: Array<
    Pick<StoryHarnessChangeRequestPreview, 'id' | 'title' | 'summary' | 'type'>
  >
  pendingChangeRequestCount: number
}

export type WriterResultCandidateSource = 'chat' | 'rewrite' | 'summary' | 'review'

export interface WriterResultCandidate {
  source: WriterResultCandidateSource
  action: string
  title: string
  summary: string
  generatedText: string
  sourceText: string
}

export interface WriterRevisionSeed {
  id: number
  text: string
  instructions?: string
  applyMode?: AIApplyMode
}

export type WriterDraftProposalKind = 'text-draft' | 'chapter-direction'
export type WriterDraftProposalStatus = 'draft' | 'selected' | 'discarded'
export type WriterDraftProposalSource =
  | 'ai-chat'
  | 'rewrite-workbench'
  | 'summary-workbench'
  | 'review-workbench'

export interface WriterDraftProposal {
  id: string
  projectId: string
  chapterId?: string
  source: WriterDraftProposalSource
  kind: WriterDraftProposalKind
  title: string
  summary: string
  content: Record<string, unknown>
  status: WriterDraftProposalStatus
  createdAt: number
  updatedAt: number
}

export interface WriterStructurePlanItem {
  title: string
  summary?: string
  reason?: string
}

export interface WriterStructurePlanPayload {
  mode: WriterStructurePlanMode
  prompt: string
  summary: string
  items: WriterStructurePlanItem[]
}

export function buildWriterWorkflowContextSignature(
  context: Omit<WriterWorkflowContext, 'signature'>,
): string {
  return JSON.stringify({
    projectId: context.projectId,
    chapterId: context.chapterId,
    chapterTitle: context.chapterTitle,
    scopeLabel: context.scopeLabel || '',
    characters: context.activeCharacters.map((character) => ({
      id: character.id,
      state: character.currentState || '',
    })),
    relations: context.activeRelations.map((relation) => relation.id),
    pendingChangeRequests: context.pendingChangeRequests.map((item) => item.id),
  })
}

export function buildWriterWorkflowContextPrompt(
  context: WriterWorkflowContext | null | undefined,
): string {
  if (!context) {
    return ''
  }

  const lines = [
    '当前工作流上下文：',
    context.chapterTitle
      ? `章节：${context.chapterTitle}`
      : context.chapterId
        ? `章节ID：${context.chapterId}`
        : '',
    context.scopeLabel ? `场景作用域：${context.scopeLabel}` : '',
  ]

  if (context.activeCharacters.length > 0) {
    const characterSummary = context.activeCharacters
      .slice(0, 3)
      .map((character) =>
        character.currentState?.trim()
          ? `${character.name}（${character.currentState}）`
          : character.name,
      )
      .join('；')
    lines.push(`活跃角色：${characterSummary}`)
  }

  if (context.activeRelations.length > 0) {
    const relationSummary = context.activeRelations
      .slice(0, 2)
      .map((relation) => `${relation.fromName}-${relation.type}-${relation.toName}`)
      .join('；')
    lines.push(`当前关系：${relationSummary}`)
  }

  if (context.pendingChangeRequestCount > 0) {
    const pendingSummary = context.pendingChangeRequests
      .slice(0, 3)
      .map((item) => item.title)
      .join('；')
    lines.push(
      `待处理建议：${context.pendingChangeRequestCount} 条${
        pendingSummary ? `（${pendingSummary}）` : ''
      }`,
    )
  }

  return lines.filter(Boolean).join('\n')
}

export function resolveWriterWorkflowTab(
  action: string | null | undefined,
): WriterWorkbenchTab | null {
  if (!action) {
    return null
  }

  if (isWriterEditAction(action)) {
    return 'rewrite'
  }

  if (['summary', 'summarize', 'summarize_chapter'].includes(action)) {
    return 'summary'
  }

  if (['proofread', 'review', 'audit'].includes(action)) {
    return 'review'
  }

  if (['chat', 'add_to_chat'].includes(action)) {
    return 'chat'
  }

  return null
}

export function isWriterEditAction(action: string | null | undefined): boolean {
  return !!action && ['continue', 'polish', 'expand', 'rewrite'].includes(action)
}

export function extractWriterTargetLength(text: string): number | undefined {
  const directMatch = text.match(/(?:扩写|扩充|扩展|续写|补充|增加)[^\d]{0,8}(\d{2,5})\s*字/i)
  if (directMatch) {
    return Number(directMatch[1])
  }

  const genericMatch = text.match(/(?:到|至|成文约?|写到|补到)?\s*(\d{2,5})\s*字/i)
  if (!genericMatch) {
    return undefined
  }

  const value = Number(genericMatch[1])
  return Number.isFinite(value) ? value : undefined
}

export function detectWriterPromptIntent(text: string): WriterPromptIntent | null {
  const normalizedText = text.toLowerCase()
  const rules: Array<{
    keywords: string[]
    action: WriterPromptIntentAction
    kind: WriterPromptIntentKind
  }> = [
    {
      keywords: ['总结', '摘要', '概括', '提取要点', '归纳', 'summarize', 'summary', 'summarise'],
      action: 'summarize',
      kind: 'analysis',
    },
    {
      keywords: [
        '扩写',
        '扩充',
        '扩展',
        '补充细节',
        '增加描写',
        '写长一点',
        '写到',
        '补到',
        '补一段',
        '加一段',
        '增加一段',
        '添加一段',
      ],
      action: 'expand',
      kind: 'edit',
    },
    {
      keywords: [
        '改写',
        '重写',
        '换种说法',
        '润色',
        '优化表达',
        '换个写法',
        '改善',
        '修改',
        '更改',
        '调整',
        'rewrite',
        'rephrase',
        'polish',
      ],
      action: 'rewrite',
      kind: 'edit',
    },
    {
      keywords: [
        '续写',
        '继续写',
        '接着写',
        '往下写',
        '继续',
        'continue',
        'keep writing',
        '接下来',
      ],
      action: 'continue',
      kind: 'edit',
    },
    {
      keywords: [
        '校对',
        '检查错误',
        '纠错',
        '错别字',
        '语法检查',
        'proofread',
        'check grammar',
        '拼写',
      ],
      action: 'proofread',
      kind: 'analysis',
    },
  ]

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => normalizedText.includes(keyword))) {
      const targetLength =
        rule.action === 'expand' || rule.action === 'continue'
          ? extractWriterTargetLength(text)
          : undefined
      return {
        action: rule.action,
        kind: rule.kind,
        confidence: 0.9,
        targetLength,
      }
    }
  }

  return null
}

export function resolveWriterEditApplyMode(
  action: WriterPromptIntentAction | 'direct_edit' | 'polish',
  hasSelectionContext: boolean,
): AIApplyMode {
  if (action === 'continue') {
    return hasSelectionContext ? 'insert_after_selection' : 'append_paragraph'
  }

  return hasSelectionContext ? 'replace_selection' : 'replace_document'
}

export function resolveWriterPromptExecution(
  text: string,
  options: {
    interactionMode: 'chat' | 'edit'
    canEditDirectly: boolean
    hasSelectionContext: boolean
  },
): WriterPromptExecution {
  const intent = detectWriterPromptIntent(text)

  if (!intent) {
    if (options.interactionMode === 'edit' && options.canEditDirectly) {
      return {
        route: 'edit',
        intent: null,
        applyMode: resolveWriterEditApplyMode('direct_edit', options.hasSelectionContext),
      }
    }

    return {
      route: 'chat',
      intent: null,
    }
  }

  if (!options.canEditDirectly) {
    return {
      route: 'chat',
      intent,
    }
  }

  if (intent.kind === 'analysis') {
    return {
      route: 'analysis',
      intent,
    }
  }

  return {
    route: 'edit',
    intent,
    applyMode: resolveWriterEditApplyMode(intent.action, options.hasSelectionContext),
  }
}

export function normalizeWriterWorkflowActionRequest(
  payload: WriterWorkflowActionRequest,
): WriterWorkflowActionRequest {
  if (payload.applyMode || !isWriterEditAction(payload.action)) {
    return payload
  }

  const hasSelectionContext =
    typeof payload.from === 'number' &&
    typeof payload.to === 'number' &&
    payload.from !== payload.to

  return {
    ...payload,
    applyMode: resolveWriterEditApplyMode(
      payload.action as 'continue' | 'polish' | 'expand' | 'rewrite',
      hasSelectionContext,
    ),
  }
}

export function buildWriterAIActionTrigger(
  payload: WriterWorkflowActionRequest,
  context?: WriterWorkflowContext | null,
): WriterAIActionTrigger {
  const normalizedPayload = normalizeWriterWorkflowActionRequest(payload)
  return {
    ...normalizedPayload,
    id: Date.now(),
    source: normalizedPayload.source ?? 'workspace',
    context: context ?? null,
  }
}
