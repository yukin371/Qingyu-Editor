import type { WriterGenerationAction } from './writerAIGeneration'
import { buildSelectionApplyPayload, buildSelectionResultCandidate, buildSelectionUserPrompt } from './writerAISelection'
import { extractWriterGeneratedText } from './writerAIGeneration'

export interface WriterSelectionRunnerInput {
  action: WriterGenerationAction
  selectedText: string
  instructions?: string
  mergedInstructions?: string
  executeAction: (input: {
    action: WriterGenerationAction
    selectedText: string
    mergedInstructions?: string
  }) => Promise<Record<string, any>>
  onUserMessage: (message: string) => void | Promise<void>
  onEmptyResult: () => void | Promise<void>
  onSuccess: (input: {
    generatedText: string
    resultCandidate: ReturnType<typeof buildSelectionResultCandidate>
    applyPayload: ReturnType<typeof buildSelectionApplyPayload>
  }) => void | Promise<void>
}

export async function runWriterSelectionAction({
  action,
  selectedText,
  instructions,
  mergedInstructions,
  executeAction,
  onUserMessage,
  onEmptyResult,
  onSuccess,
}: WriterSelectionRunnerInput): Promise<void> {
  await onUserMessage(buildSelectionUserPrompt(action, selectedText, instructions))

  const response = await executeAction({
    action,
    selectedText,
    mergedInstructions,
  })

  const generatedText = extractWriterGeneratedText(action, response)
  if (!generatedText) {
    await onEmptyResult()
    return
  }

  await onSuccess({
    generatedText,
    resultCandidate: buildSelectionResultCandidate(action, selectedText, generatedText),
    applyPayload: buildSelectionApplyPayload(action, selectedText, generatedText),
  })
}
