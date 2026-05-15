import type { ChatMessage } from '@/modules/writer/components/editor/ai/types'
import type { WriterEditorPlan } from '@/modules/writer/services/writerDocumentAgent.service'
import {
  buildPlanOnlyHandledResult,
  shouldHandlePlanOnlyInline,
} from './writerAIChatMeta'

export interface WriterPlanOnlyRunnerInput {
  content: string
  plan: WriterEditorPlan
  onUserMessage: (message: string) => void | Promise<void>
  onAssistantMessage: (
    message: string,
    meta: ChatMessage['meta'],
  ) => void | Promise<void>
}

export async function runWriterPlanOnly(
  input: WriterPlanOnlyRunnerInput,
): Promise<boolean> {
  if (!shouldHandlePlanOnlyInline(input.plan)) {
    return false
  }

  const handledPlan = buildPlanOnlyHandledResult(input.content, input.plan)
  await input.onUserMessage(handledPlan.userMessage)
  await input.onAssistantMessage(handledPlan.assistantMessage, handledPlan.assistantMeta)
  return true
}
