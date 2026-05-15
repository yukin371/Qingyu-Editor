import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import { buildWriterWorkflowContextPrompt } from '@/modules/writer/types/workflow'

export interface WriterAIContextOptions {
  workflowContext?: WriterWorkflowContext | null
  aiSummaryContextText?: string | null | undefined
}

export function buildWriterAIContextBlock(options: WriterAIContextOptions): string {
  return [
    buildWriterWorkflowContextPrompt(options.workflowContext),
    options.aiSummaryContextText?.trim() || '',
  ]
    .filter((item) => item && item.trim())
    .join('\n\n')
}

export function mergeWriterAIInstructions(
  parts: Array<string | null | undefined>,
  options: WriterAIContextOptions,
): string | undefined {
  const merged = [...parts, buildWriterAIContextBlock(options)]
    .filter((item) => item && item.trim())
    .join('\n\n')

  return merged || undefined
}
