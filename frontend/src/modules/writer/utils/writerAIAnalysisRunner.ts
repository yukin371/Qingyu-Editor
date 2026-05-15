import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'
import type { WriterPromptIntent } from '@/modules/writer/types/workflow'
import { buildAnalysisCandidate } from './writerAIChatMeta'
import {
  resolveWriterAnalysisText,
  type WriterProofreadIssueLike,
} from './writerAIAnalysis'

export interface WriterAnalysisSummaryResult {
  summary?: string
  keyPoints?: string[]
}

export interface WriterAnalysisProofreadResult {
  issues?: WriterProofreadIssueLike[]
}

export interface WriterAnalysisRunnerInput {
  instruction: string
  intent: WriterPromptIntent
  resolvedTarget: WriterResolvedDocumentTarget
  currentDocumentId?: string | null
  projectId: string
  requestProofread: (sourceText: string, projectId: string) => Promise<WriterAnalysisProofreadResult>
  requestSummary: (sourceText: string, projectId: string) => Promise<WriterAnalysisSummaryResult>
  onMissingSource: () => void | Promise<void>
  onUserMessage: (message: string) => void | Promise<void>
  onEmptyResult: () => void | Promise<void>
  onSuccess: (input: {
    generatedText: string
    sourceText: string
    resultCandidate: ReturnType<typeof buildAnalysisCandidate>
    isCrossDocument: boolean
  }) => void | Promise<void>
}

export async function runWriterResolvedAnalysis({
  instruction,
  intent,
  resolvedTarget,
  currentDocumentId,
  projectId,
  requestProofread,
  requestSummary,
  onMissingSource,
  onUserMessage,
  onEmptyResult,
  onSuccess,
}: WriterAnalysisRunnerInput): Promise<void> {
  const sourceText = resolvedTarget.sourceText?.trim() || ''
  if (!sourceText) {
    await onMissingSource()
    return
  }

  await onUserMessage(instruction)

  let generatedText = ''
  if (intent.action === 'proofread') {
    const proofread = await requestProofread(sourceText, projectId)
    generatedText = resolveWriterAnalysisText({
      proofreadIssues: proofread.issues,
    })
  } else {
    const response = await requestSummary(sourceText, projectId)
    generatedText = resolveWriterAnalysisText({
      summary: response.summary,
      keyPoints: response.keyPoints,
    })
  }

  if (!generatedText.trim()) {
    await onEmptyResult()
    return
  }

  await onSuccess({
    generatedText,
    sourceText,
    resultCandidate: buildAnalysisCandidate(intent, generatedText, sourceText),
    isCrossDocument:
      Boolean(resolvedTarget.targetDocumentId) &&
      resolvedTarget.targetDocumentId !== currentDocumentId,
  })
}
