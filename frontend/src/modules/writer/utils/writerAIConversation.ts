import type { ChatMessage } from '@/modules/writer/components/editor/ai/types'
import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'
import type { DocumentTargetRoute } from './writerAIChatMeta'
import { buildTargetCandidatesMeta } from './writerAIChatMeta'

export interface WriterConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface WriterTargetResolutionResult {
  assistantMessage: string
  assistantMeta?: ChatMessage['meta']
}

export function buildGeneralChatHistory(messages: ChatMessage[]): WriterConversationMessage[] {
  return messages
    .slice(0, -1)
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: message.content,
    }))
}

export function resolveGeneralChatReply(reply?: string | null): string {
  return reply || '抱歉，我没有理解您的问题。'
}

export function buildTargetResolutionResult(
  instruction: string,
  route: DocumentTargetRoute,
  target: WriterResolvedDocumentTarget,
): WriterTargetResolutionResult {
  return {
    assistantMessage: target.assistantMessage || '当前没有可用的目标章节。',
    assistantMeta: buildTargetCandidatesMeta(instruction, route, target),
  }
}
