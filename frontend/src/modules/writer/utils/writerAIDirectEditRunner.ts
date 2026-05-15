import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'
import type { WriterPromptIntent } from '@/modules/writer/types/workflow'
import {
  buildDirectEditApplyPayload,
  buildDirectEditLoadingMessage,
  buildDirectEditResultCandidate,
  buildDirectEditUserPrompt,
} from './writerAIDirectEdit'
import { isCrossDocumentTarget } from './writerAIChatMeta'

export interface WriterDirectEditExecutionResult {
  emittedAction: 'continue' | 'expand' | 'rewrite'
  label: string
  generatedText: string
  applyMode: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document'
}

export interface WriterDirectEditRunnerInput {
  instruction: string
  intent: WriterPromptIntent | null
  resolvedTarget: WriterResolvedDocumentTarget
  currentDocumentId?: string | null
  applyMode: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document'
  sourceText: string
  baseInstructions?: string
  requestEdit: (params: {
    sourceText: string
    instruction: string
    intent: WriterPromptIntent | null
    applyMode: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document'
    baseInstructions?: string
  }) => Promise<WriterDirectEditExecutionResult>
  onUserMessage: (message: string) => void | Promise<void>
  onCrossDocumentLoading?: (message: string) => void | Promise<void>
  onEmptyResult: () => void | Promise<void>
  onSuccess: (input: {
    generatedText: string
    resultCandidate: ReturnType<typeof buildDirectEditResultCandidate>
    applyPayload: ReturnType<typeof buildDirectEditApplyPayload>
    isCrossDocument: boolean
  }) => void | Promise<void>
}

export async function runWriterDirectEdit({
  instruction,
  intent,
  resolvedTarget,
  currentDocumentId,
  applyMode,
  sourceText,
  baseInstructions,
  requestEdit,
  onUserMessage,
  onCrossDocumentLoading,
  onEmptyResult,
  onSuccess,
}: WriterDirectEditRunnerInput): Promise<void> {
  const crossDocument = isCrossDocumentTarget(resolvedTarget, currentDocumentId)

  await onUserMessage(buildDirectEditUserPrompt(instruction, resolvedTarget, applyMode))

  if (crossDocument && onCrossDocumentLoading) {
    await onCrossDocumentLoading(buildDirectEditLoadingMessage(resolvedTarget))
  }

  const editResult = await requestEdit({
    sourceText,
    instruction,
    intent,
    applyMode,
    baseInstructions,
  })

  const generatedText = editResult.generatedText
  if (!generatedText.trim()) {
    await onEmptyResult()
    return
  }

  await onSuccess({
    generatedText,
    resultCandidate: buildDirectEditResultCandidate({
      action: editResult.emittedAction,
      label: editResult.label,
      generatedText,
      sourceText,
    }),
    applyPayload: buildDirectEditApplyPayload({
      action: editResult.emittedAction,
      sourceText,
      generatedText,
      applyMode: editResult.applyMode,
      target: resolvedTarget,
    }),
    isCrossDocument: crossDocument,
  })
}
