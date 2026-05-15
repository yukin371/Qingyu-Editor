import type { ChatContextSnippet } from '@/modules/writer/components/editor/ai/types'
import type {
  WriterPromptExecution,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import { resolveWriterPromptExecution } from '@/modules/writer/types/workflow'
import { buildChatRequestMessage } from './writerAIChatMeta'
import { mergeWriterAIInstructions } from './writerAIContext'

export interface WriterMessageDispatchInput {
  content: string
  selectedContext?: ChatContextSnippet | null
  interactionMode: 'chat' | 'edit'
  canEditDirectly: boolean
  hasSelectionContext: boolean
  workflowContext?: WriterWorkflowContext | null
  aiSummaryContextText?: string | null | undefined
}

export interface WriterMessageDispatchResult {
  promptExecution: WriterPromptExecution
  finalRequestMessage?: string
}

export function buildWriterMessageDispatch(
  input: WriterMessageDispatchInput,
): WriterMessageDispatchResult {
  const promptExecution = resolveWriterPromptExecution(input.content, {
    interactionMode: input.interactionMode,
    canEditDirectly: input.canEditDirectly,
    hasSelectionContext: input.hasSelectionContext,
  })

  if (promptExecution.route === 'edit') {
    return { promptExecution }
  }

  const requestMessage = buildChatRequestMessage(input.content, input.selectedContext)
  return {
    promptExecution,
    finalRequestMessage:
      mergeWriterAIInstructions([requestMessage], {
        workflowContext: input.workflowContext,
        aiSummaryContextText: input.aiSummaryContextText,
      }) || requestMessage,
  }
}
