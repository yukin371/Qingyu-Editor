import type { ChatMessage } from '@/modules/writer/components/editor/ai/types'
import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'
import type { WriterPromptIntent } from '@/modules/writer/types/workflow'
import {
  buildGeneralChatHistory,
  resolveGeneralChatReply,
} from './writerAIConversation'

export interface WriterAnalysisRouteRunnerInput {
  instruction: string
  intent: WriterPromptIntent
  resolveTarget: (instruction: string) => Promise<WriterResolvedDocumentTarget>
  onUnresolved: (target: WriterResolvedDocumentTarget) => Promise<void>
  onResolved: (target: WriterResolvedDocumentTarget) => Promise<void>
}

export async function runWriterAnalysisRoute({
  instruction,
  resolveTarget,
  onUnresolved,
  onResolved,
}: WriterAnalysisRouteRunnerInput): Promise<void> {
  const resolvedTarget = await resolveTarget(instruction)
  if (resolvedTarget.status !== 'ready' || !resolvedTarget.sourceText?.trim()) {
    await onUnresolved(resolvedTarget)
    return
  }

  await onResolved(resolvedTarget)
}

export interface WriterGeneralChatRouteRunnerInput {
  finalRequestMessage: string
  messages: ChatMessage[]
  requestChat: (
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
  ) => Promise<{ reply?: string | null }>
  onReply: (replyText: string) => Promise<void> | void
}

export async function runWriterGeneralChatRoute({
  finalRequestMessage,
  messages,
  requestChat,
  onReply,
}: WriterGeneralChatRouteRunnerInput): Promise<void> {
  const history = buildGeneralChatHistory(messages)
  const response = await requestChat(finalRequestMessage, history)
  const replyText = resolveGeneralChatReply(response.reply)
  await onReply(replyText)
}
