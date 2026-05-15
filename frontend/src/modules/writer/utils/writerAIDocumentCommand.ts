import type { ChatMessage } from '@/modules/writer/components/editor/ai/types'
import type { WriterAIApplyPayload } from '@/modules/writer/types/workflow'

export interface WriterHandledDocumentCommandResult {
  userMessage: string
  assistantMessage?: string
  assistantMeta?: ChatMessage['meta']
  patchPayload?: WriterAIApplyPayload
}

export function buildHandledDocumentCommandResult(input: {
  fallbackUserMessage: string
  userEcho?: string
  assistantMessage?: string
  assistantMeta?: ChatMessage['meta']
  patchPayload?: WriterAIApplyPayload
}): WriterHandledDocumentCommandResult {
  return {
    userMessage: input.userEcho || input.fallbackUserMessage,
    assistantMessage: input.assistantMessage?.trim() || undefined,
    assistantMeta: input.assistantMeta,
    patchPayload: input.patchPayload,
  }
}
