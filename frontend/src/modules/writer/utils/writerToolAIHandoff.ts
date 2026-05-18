import {
  formatActiveEntitiesPrompt,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
import {
  type WriterWorkflowActionRequest,
  type WriterWorkflowContext,
  type WriterWorkflowSource,
} from '@/modules/writer/types/workflow'

export interface WriterToolAIHandoffOptions {
  source?: WriterWorkflowSource
  toolLabel: string
  title: string
  focusLines?: Array<string | null | undefined>
  workflowContext?: WriterWorkflowContext | null
  activeEntities?: ActiveEntitySummary[] | null
  instructions?: string
}

export function buildWriterToolAIHandoff({
  source = 'workspace',
  toolLabel,
  title,
  focusLines = [],
  workflowContext,
  activeEntities,
  instructions,
}: WriterToolAIHandoffOptions): WriterWorkflowActionRequest {
  const lines = [
    `工具：${toolLabel}`,
    `关注对象：${title}`,
    workflowContext?.chapterTitle ? `当前章节：${workflowContext.chapterTitle}` : '',
    workflowContext?.scopeLabel ? `场景作用域：${workflowContext.scopeLabel}` : '',
    ...focusLines,
    formatActiveEntitiesPrompt(activeEntities, 4),
    buildWorkflowRelationPrompt(workflowContext),
    buildWorkflowPendingPrompt(workflowContext),
  ].filter(Boolean)

  return {
    source,
    action: 'add_to_chat',
    title,
    text: lines.join('\n'),
    instructions:
      instructions || '请基于以上上下文给出最值得处理的一项建议，尽量具体、短一点。',
  }
}

function buildWorkflowRelationPrompt(context: WriterWorkflowContext | null | undefined): string {
  if (!context?.activeRelations.length) {
    return ''
  }

  return `当前关系：${context.activeRelations
    .slice(0, 2)
    .map((relation) => `${relation.fromName}-${relation.type}-${relation.toName}`)
    .join('；')}`
}

function buildWorkflowPendingPrompt(context: WriterWorkflowContext | null | undefined): string {
  if (!context?.pendingChangeRequestCount) {
    return ''
  }

  const pendingSummary = context.pendingChangeRequests
    .slice(0, 3)
    .map((item) => item.title)
    .join('；')

  return `待处理建议：${context.pendingChangeRequestCount} 条${
    pendingSummary ? `（${pendingSummary}）` : ''
  }`
}
