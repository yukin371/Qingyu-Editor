import type { ChatMessage } from '@/modules/writer/components/editor/ai/types'
import type { WriterAIApplyPayload } from '@/modules/writer/types/workflow'
import { buildHandledDocumentCommandResult } from './writerAIDocumentCommand'

export interface WriterDocumentCommandRunnerContext {
  projectId?: string
  currentDocumentId?: string | null
  currentDocumentTitle?: string | null
  currentSourceText?: string | null
}

export interface WriterDocumentCommandRunnerResult {
  handled: boolean
  userEcho?: string
  assistantMessage?: string
  assistantMeta?: ChatMessage['meta']
  patchPayload?: WriterAIApplyPayload
}

export interface WriterDocumentCommandRunnerInput {
  content: string
  context: WriterDocumentCommandRunnerContext
  executeCommand: (
    input: string,
    context: WriterDocumentCommandRunnerContext,
  ) => Promise<WriterDocumentCommandRunnerResult>
  onUserMessage: (message: string) => void | Promise<void>
  onAssistantMessage?: (
    message: string,
    meta?: ChatMessage['meta'],
  ) => void | Promise<void>
  onPatchPayload?: (payload: WriterAIApplyPayload) => void | Promise<void>
}

export async function runWriterDocumentCommand({
  content,
  context,
  executeCommand,
  onUserMessage,
  onAssistantMessage,
  onPatchPayload,
}: WriterDocumentCommandRunnerInput): Promise<boolean> {
  const trimmedContent = content.trim()
  const documentCommand = await executeCommand(trimmedContent, context)
  if (!documentCommand.handled) {
    return false
  }

  const handledCommand = buildHandledDocumentCommandResult({
    fallbackUserMessage: trimmedContent,
    userEcho: documentCommand.userEcho,
    assistantMessage: documentCommand.assistantMessage,
    assistantMeta: documentCommand.assistantMeta,
    patchPayload: documentCommand.patchPayload,
  })

  await onUserMessage(handledCommand.userMessage)

  if (handledCommand.assistantMessage && onAssistantMessage) {
    await onAssistantMessage(handledCommand.assistantMessage, handledCommand.assistantMeta)
  }

  if (handledCommand.patchPayload && onPatchPayload) {
    await onPatchPayload(handledCommand.patchPayload)
  }

  return true
}
