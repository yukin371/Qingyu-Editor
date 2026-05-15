import type {
  ChatContextSnippet,
  ChatMessage,
} from '@/modules/writer/components/editor/ai/types'
import type {
  WriterEditorPlan,
  WriterResolvedDocumentTarget,
} from '@/modules/writer/services/writerDocumentAgent.service'
import type { WriterPromptIntent, WriterResultCandidate } from '@/modules/writer/types/workflow'

export type DocumentTargetRoute = 'edit' | 'analysis'

export interface DocumentTargetSelectionPayload {
  instruction: string
  route: DocumentTargetRoute
  documentId: string
  documentTitle?: string
}

export function buildAnalysisCandidate(
  intent: WriterPromptIntent,
  generatedText: string,
  sourceText: string,
): WriterResultCandidate {
  if (intent.action === 'summarize') {
    return {
      source: 'summary',
      action: 'summary',
      title: '章节方向提案',
      summary: generatedText.slice(0, 72) || '已生成新的摘要结果。',
      generatedText,
      sourceText,
    }
  }

  return {
    source: 'review',
    action: 'proofread',
    title: '审校建议提案',
    summary: generatedText.slice(0, 72) || '已生成新的审校建议。',
    generatedText,
    sourceText,
  }
}

export function buildChatRequestMessage(
  instruction: string,
  context: ChatContextSnippet | null | undefined,
): string {
  if (!context?.text.trim()) {
    return instruction
  }

  const prefix = context.kind === 'revision' ? '参考候选稿' : '参考片段'
  return `${prefix}：${context.text}\n\n用户需求：${instruction}`
}

export function isCrossDocumentTarget(
  target: WriterResolvedDocumentTarget,
  currentDocumentId: string | null | undefined,
): boolean {
  const targetDocumentId = target.targetDocumentId?.trim()
  const currentId = currentDocumentId?.trim() || ''
  return !!targetDocumentId && !!currentId && targetDocumentId !== currentId
}

export function buildTargetCandidatesMeta(
  instruction: string,
  route: DocumentTargetRoute,
  target: WriterResolvedDocumentTarget,
): ChatMessage['meta'] | undefined {
  if (!target.candidates?.length) {
    return undefined
  }

  return {
    kind: 'document_target_candidates',
    status: 'needs_selection',
    statusText: '命中了多个章节',
    requestLabel: target.requestLabel || '目标章节待确认',
    instruction,
    route,
    candidates: target.candidates,
  }
}

export function buildTargetStatusMeta(
  target: WriterResolvedDocumentTarget,
  status: 'loading' | 'switching' | 'ready',
  statusText: string,
  detail?: string,
): ChatMessage['meta'] | undefined {
  const documentLabel = target.targetDocumentTitle?.trim() || target.targetDocumentId?.trim()
  if (!documentLabel) {
    return undefined
  }

  return {
    kind: 'document_target_status',
    status,
    statusText,
    documentLabel: `《${documentLabel}》`,
    detail,
  }
}

export function buildWriterPlanMeta(plan: WriterEditorPlan): ChatMessage['meta'] {
  const targetLabel =
    plan.target.requestLabel ||
    plan.target.targetDocumentTitle ||
    plan.target.targetDocumentId ||
    (plan.mutationMode === 'chapter_create_plan' ? '新章节' : '目标章节')
  const operationLabel =
    plan.mutationMode === 'chapter_create_plan'
      ? '新增章节计划'
      : plan.mutationMode === 'multi_document_plan'
        ? '多章节修改计划'
        : plan.route === 'analysis'
          ? '章节分析计划'
          : '章节编辑计划'
  const executionMode =
    plan.route === 'plan_only'
      ? 'plan_only'
      : plan.requiresConfirmation
        ? 'confirm_first'
        : 'direct_apply'

  return {
    kind: 'writer_plan_preview',
    status: plan.requiresConfirmation ? 'needs_confirmation' : 'planned',
    statusText: plan.requiresConfirmation ? '需要确认' : '已规划',
    operationLabel,
    targetLabel,
    executionMode,
    requiresConfirmation: plan.requiresConfirmation,
    nextStep:
      plan.route === 'plan_only'
        ? '当前不会直接创建章节或批量写入正文；请确认目标和步骤后再生成逐章 diff。'
        : plan.userVisibleSummary,
  }
}

export function buildWriterRetrievalMeta(plan: WriterEditorPlan): ChatMessage['meta'] | undefined {
  if (plan.retrievals.length === 0) {
    return undefined
  }

  return {
    kind: 'writer_retrieval_summary',
    status: 'ready',
    statusText: `已整理 ${plan.retrievals.length} 个上下文`,
    queryLabel: plan.target.requestLabel || '跨文件查找',
    targetDocumentId: plan.target.targetDocumentId,
    hits: plan.retrievals.map((item) => ({
      documentId: item.documentId || item.kind,
      documentTitle: item.documentTitle,
      reason: item.reason || '纳入本次 AI 上下文',
      excerpt: item.excerpt,
      selected: !!plan.target.targetDocumentId && item.documentId === plan.target.targetDocumentId,
    })),
  }
}

export function buildWriterCheckpointMeta(
  target: WriterResolvedDocumentTarget,
  currentDocumentId: string | null | undefined,
  status: 'generated' | 'switching' | 'ready_for_review',
  detail?: string,
): ChatMessage['meta'] {
  const targetLabel =
    target.targetDocumentTitle || target.targetDocumentId || target.requestLabel || '目标章节'
  const isSwitching = status === 'switching'

  return {
    kind: 'writer_apply_checkpoint',
    status,
    statusText: isSwitching ? '切章挂 diff' : '正文 diff 已生成',
    targetLabel: targetLabel.startsWith('《') ? targetLabel : `《${targetLabel}》`,
    detail,
    stages: [
      { stage: 'planned', status: 'done', label: '规划目标' },
      { stage: 'generated', status: 'done', label: '生成正文' },
      {
        stage: 'switching',
        status: isCrossDocumentTarget(target, currentDocumentId)
          ? isSwitching
            ? 'running'
            : 'done'
          : 'pending',
        label: '切换章节',
      },
      {
        stage: 'ready_for_review',
        status: status === 'ready_for_review' ? 'running' : 'pending',
        label: '等待审阅',
      },
    ],
  }
}
