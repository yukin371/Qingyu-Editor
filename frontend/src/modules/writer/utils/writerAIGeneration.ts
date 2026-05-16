import {
  continueWriting,
  expandText,
  polishText,
  requestWriterAI,
  rewriteText,
} from '@/modules/ai/api'
import type { AIApplyMode, WriterPromptIntent } from '@/modules/writer/types/workflow'
import { buildWriterAIContextPacket, type WriterAIContextOptions } from './writerAIContext'
import {
  buildWriterEditInstructions,
  buildWriterSelectionInstructions,
  type WriterInstructionApplyMode,
} from './writerAIInstructionBuilder'

export type WriterGenerationAction = 'continue' | 'polish' | 'expand' | 'rewrite'

export interface WriterActionExecutionParams {
  projectId: string
  action: WriterGenerationAction
  sourceText: string
  instructions?: string
  targetLength?: number
}

export interface WriterEditExecutionResult {
  emittedAction: 'continue' | 'expand' | 'rewrite'
  label: string
  generatedText: string
  applyMode: AIApplyMode
}

export function resolveWriterActionLabel(action: string): string {
  const actionLabelMap: Record<string, string> = {
    continue: '续写',
    polish: '润色',
    expand: '扩写',
    rewrite: '改写',
  }
  return actionLabelMap[action] || '处理'
}

export function extractWriterGeneratedText(action: string, response: Record<string, any>): string {
  if (action === 'continue') return response.generated_text || ''
  if (action === 'polish') return response.polished_text || response.rewritten_text || ''
  if (action === 'expand') return response.expanded_text || response.rewritten_text || ''
  if (action === 'rewrite') return response.rewritten_text || response.polished_text || ''
  return ''
}

export async function executeWriterTextAction({
  projectId,
  action,
  sourceText,
  instructions,
  targetLength,
}: WriterActionExecutionParams): Promise<Record<string, any>> {
  if (action === 'continue') {
    return continueWriting(projectId, sourceText, targetLength ?? 200, instructions)
  }
  if (action === 'polish') {
    return polishText(projectId, sourceText, instructions)
  }
  if (action === 'expand') {
    return expandText(projectId, sourceText, instructions, targetLength)
  }
  return rewriteText(projectId, sourceText, 'polish', instructions)
}

export async function requestWriterEditIntent(params: {
  projectId: string
  sourceText: string
  intent: WriterPromptIntent | null
  applyMode: AIApplyMode
  mergedInstructions?: string
}): Promise<WriterEditExecutionResult> {
  const action: WriterGenerationAction =
    params.intent?.action === 'continue' || params.intent?.action === 'expand'
      ? params.intent.action
      : 'rewrite'

  const response = await executeWriterTextAction({
    projectId: params.projectId,
    action,
    sourceText: params.sourceText,
    instructions: params.mergedInstructions,
    targetLength: params.intent?.targetLength,
  })

  return {
    emittedAction: action === 'continue' ? 'continue' : action === 'expand' ? 'expand' : 'rewrite',
    label: resolveWriterActionLabel(action),
    generatedText: extractWriterGeneratedText(action, response),
    applyMode: params.applyMode,
  }
}

export async function requestWriterContextualEditIntent(params: {
  projectId: string
  sourceText: string
  instruction: string
  intent: WriterPromptIntent | null
  applyMode: WriterInstructionApplyMode
  baseInstructions?: string
  context: WriterAIContextOptions
}): Promise<WriterEditExecutionResult> {
  const intent =
    params.intent?.action === 'continue' || params.intent?.action === 'expand'
      ? params.intent
      : params.intent
        ? {
            action: 'rewrite' as const,
            confidence: params.intent.confidence,
            kind: 'edit' as const,
          }
        : { action: 'rewrite' as const, confidence: 1, kind: 'edit' as const }
  const action: WriterGenerationAction =
    intent.action === 'continue' || intent.action === 'expand' ? intent.action : 'rewrite'
  const mergedInstructions = buildWriterEditInstructions({
    instruction: params.instruction,
    baseInstructions: params.baseInstructions,
    applyMode: params.applyMode,
    context: params.context,
  })
  const contextPacket = buildWriterAIContextPacket({
    ...params.context,
    projectId: params.projectId,
    currentDocument: params.context.currentDocument || {
      documentId: params.context.workflowContext?.chapterId,
      documentTitle: params.context.workflowContext?.chapterTitle,
      sourceText: params.sourceText,
    },
    target: params.context.target || {
      kind:
        params.applyMode === 'replace_selection' || params.applyMode === 'insert_after_selection'
          ? 'selection'
          : 'current_document',
      documentId:
        params.context.currentDocument?.documentId ||
        params.context.workflowContext?.chapterId ||
        undefined,
      documentTitle:
        params.context.currentDocument?.documentTitle ||
        params.context.workflowContext?.chapterTitle ||
        undefined,
      label: params.applyMode === 'replace_document' ? '本章全文' : undefined,
    },
  })
  const result = await requestWriterAI({
    route: 'single_document_edit',
    mutationMode: 'single_document_diff',
    target: contextPacket.target || {
      kind: 'current_document',
      documentId: contextPacket.currentDocument?.documentId || undefined,
      documentTitle: contextPacket.currentDocument?.documentTitle || undefined,
    },
    context: contextPacket,
    intent: {
      action,
      targetLength: intent.targetLength,
    },
    requiresConfirmation: true,
    userVisibleSummary: mergedInstructions || params.instruction,
  })

  return {
    emittedAction: action === 'continue' ? 'continue' : action === 'expand' ? 'expand' : 'rewrite',
    label: resolveWriterActionLabel(action),
    generatedText: result.generatedText || '',
    applyMode: params.applyMode,
  }
}

export async function requestWriterContextualSelectionAction(params: {
  projectId: string
  action: WriterGenerationAction
  selectedText: string
  instructions?: string
  context: WriterAIContextOptions
}): Promise<Record<string, any>> {
  return executeWriterTextAction({
    projectId: params.projectId,
    action: params.action,
    sourceText: params.selectedText,
    instructions: buildWriterSelectionInstructions({
      instructions: params.instructions,
      context: params.context,
    }),
    targetLength: params.action === 'continue' ? 200 : undefined,
  })
}
