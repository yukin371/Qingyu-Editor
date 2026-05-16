import type {
  ChatMessage as BaseChatMessage,
  ChatMessageMeta as BaseChatMessageMeta,
} from '@/composables/useChatHistory'
import type { WriterAIConnectionStatusMeta } from '@/modules/writer/utils/writerAIError'

export interface WriterRetrievalHit {
  documentId: string
  documentTitle?: string
  reason: string
  excerpt?: string
  selected?: boolean
}

export interface WriterRetrievalSummaryMeta {
  kind: 'writer_retrieval_summary'
  status?: 'retrieving' | 'ready' | 'empty'
  statusText: string
  queryLabel?: string
  targetDocumentId?: string
  hits: WriterRetrievalHit[]
}

export interface WriterPlanPreviewMeta {
  kind: 'writer_plan_preview'
  status?: 'planned' | 'needs_confirmation' | 'ready'
  statusText: string
  operationLabel: string
  targetLabel: string
  executionMode: 'direct_apply' | 'confirm_first' | 'plan_only' | string
  requiresConfirmation: boolean
  nextStep?: string
}

export type WriterApplyCheckpointStage =
  | 'planned'
  | 'retrieving'
  | 'generated'
  | 'switching'
  | 'ready_for_review'
  | 'accepted'
  | 'discarded'
  | 'failed'

export interface WriterApplyCheckpointItem {
  stage: WriterApplyCheckpointStage
  label?: string
  status: 'pending' | 'running' | 'done' | 'error'
  detail?: string
}

export interface WriterApplyCheckpointMeta {
  kind: 'writer_apply_checkpoint'
  status: WriterApplyCheckpointStage
  statusText: string
  targetLabel: string
  detail?: string
  stages: WriterApplyCheckpointItem[]
}

export interface WriterContextEvidenceItem {
  label: string
  detail?: string
  source: 'current_document' | 'selection' | 'revision' | 'asset' | 'workflow' | string
}

export interface WriterContextEvidenceMeta {
  kind: 'writer_context_evidence'
  statusText: string
  contextEvidence: WriterContextEvidenceItem[]
}

export interface WriterContextEvidenceCarrier {
  contextEvidence?: WriterContextEvidenceItem[]
}

export type WriterChatMessageMeta =
  | ((BaseChatMessageMeta
      | WriterRetrievalSummaryMeta
      | WriterPlanPreviewMeta
      | WriterApplyCheckpointMeta
      | WriterAIConnectionStatusMeta) &
      WriterContextEvidenceCarrier)
  | WriterContextEvidenceMeta

export type WriterChatMessage = Omit<BaseChatMessage, 'meta'> & {
  meta?: WriterChatMessageMeta
}

export type ChatMessage = WriterChatMessage

/**
 * AI Panel 子组件共享类型定义
 * @module writer/components/editor/ai/types
 */

/**
 * 对话元数据
 */
export interface ConversationMeta {
  id: string
  title: string
  updatedAt: number
}

/**
 * 选中提示状态
 */
export type SelectionNoticeStatus = 'pending' | 'running' | 'done' | 'error'

/**
 * 选中提示信息
 */
export interface SelectionNotice {
  action: string
  actionLabel: string
  text: string
  instructions?: string
  status: SelectionNoticeStatus
  statusText: string
}

/**
 * 聊天上下文片段
 */
export interface ChatContextSnippet {
  text: string
  instructions?: string
  addedAt: number
  kind?: 'selection' | 'revision'
  applyMode?:
    | 'replace_selection'
    | 'insert_after_selection'
    | 'append_paragraph'
    | 'replace_document'
}

/**
 * 快捷操作
 */
export interface QuickAction {
  id: string
  icon: string
  label: string
  prompt: string
}

/**
 * AI 触发动作
 */
export interface ActionTrigger {
  id: number
  action: string
  text: string
  instructions?: string
}

/**
 * AI 输入区域 Props
 */
export interface AIInputAreaProps {
  modelValue: string
  context?: ChatContextSnippet | null
  mode?: 'chat' | 'edit'
  canEdit?: boolean
  disabled?: boolean
  placeholder?: string
  hint?: string
}

/**
 * AI 消息列表 Props
 */
export interface AIChatMessagesProps {
  messages: ChatMessage[]
  typingText?: string
  isTyping?: boolean
}

/**
 * AI 对话工具栏 Props
 */
export interface AIConversationToolbarProps {
  conversationList: ConversationMeta[]
  currentId: string
  disabled?: boolean
}

/**
 * AI 快捷操作 Props
 */
export interface AIQuickActionsProps {
  actions: QuickAction[]
  disabled?: boolean
}
