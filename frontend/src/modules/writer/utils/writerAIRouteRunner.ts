import type { ChatMessage } from '@/modules/writer/components/editor/ai/types'
import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'
import type { WriterPromptExecution, WriterPromptIntent } from '@/modules/writer/types/workflow'
import {
  buildGeneralChatHistory,
  resolveGeneralChatReply,
} from './writerAIConversation'
import type { DocumentTargetSelectionPayload } from './writerAIChatMeta'

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

export interface WriterDirectEditRouteRunnerInput {
  instruction: string
  resolveTarget: (instruction: string) => Promise<WriterResolvedDocumentTarget>
  target?: WriterResolvedDocumentTarget
  onUnresolved: (target: WriterResolvedDocumentTarget) => Promise<void>
  onResolved: (target: WriterResolvedDocumentTarget) => Promise<void>
}

export async function runWriterDirectEditRoute({
  instruction,
  resolveTarget,
  target,
  onUnresolved,
  onResolved,
}: WriterDirectEditRouteRunnerInput): Promise<void> {
  const resolvedTarget = target?.status === 'ready' ? target : await resolveTarget(instruction)
  if (resolvedTarget.status !== 'ready' || !resolvedTarget.sourceText?.trim()) {
    await onUnresolved(resolvedTarget)
    return
  }

  await onResolved(resolvedTarget)
}

export interface WriterSelectedDocumentRouteRunnerInput {
  payload: DocumentTargetSelectionPayload
  resolvedTarget: WriterResolvedDocumentTarget
  resolvePromptExecution: (instruction: string, route: 'analysis' | 'edit') => WriterPromptExecution
  onInvalidTarget: (target: WriterResolvedDocumentTarget) => Promise<void>
  onInvalidAnalysisIntent: () => Promise<void>
  onAnalysis: (input: {
    instruction: string
    intent: WriterPromptIntent
    resolvedTarget: WriterResolvedDocumentTarget
  }) => Promise<void>
  onEdit: (input: {
    instruction: string
    intent: WriterPromptIntent | null
    resolvedTarget: WriterResolvedDocumentTarget
  }) => Promise<void>
}

export async function runWriterSelectedDocumentRoute({
  payload,
  resolvedTarget,
  resolvePromptExecution,
  onInvalidTarget,
  onInvalidAnalysisIntent,
  onAnalysis,
  onEdit,
}: WriterSelectedDocumentRouteRunnerInput): Promise<void> {
  if (resolvedTarget.status !== 'ready' || !resolvedTarget.sourceText?.trim()) {
    await onInvalidTarget(resolvedTarget)
    return
  }

  if (payload.route === 'analysis') {
    const promptExecution = resolvePromptExecution(payload.instruction, 'analysis')
    if (!promptExecution.intent) {
      await onInvalidAnalysisIntent()
      return
    }

    await onAnalysis({
      instruction: payload.instruction,
      intent: promptExecution.intent,
      resolvedTarget,
    })
    return
  }

  const promptExecution = resolvePromptExecution(payload.instruction, 'edit')
  await onEdit({
    instruction: payload.instruction,
    intent: promptExecution.intent,
    resolvedTarget,
  })
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
