/** Agent 智能体相关类型定义 */

/** 编辑器上下文，发送给智能体 */
export interface EditorContext {
  currentChapterId: string
  cursorPosition: number
  selectedText: string
  nearbyCharacters: string[]
}

/** AI 建议类型 */
export type SuggestionType = 'text_diff' | 'entity_preview'

/** AI 建议动作 */
export type SuggestionAction = 'create' | 'update' | 'append'

/** AI 建议 */
export interface Suggestion {
  id: string
  type: SuggestionType
  action: SuggestionAction
  targetEntity: string
  targetId: string
  content: string
  originalContent?: string
  summary: string
}

/** 智能体返回结果 */
export interface AgentResult {
  content: string
  suggestions?: Suggestion[]
}

/** AI Provider 配置 */
export interface AIAgentConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
}

/** 对话消息角色 */
export type ChatRole = 'system' | 'user' | 'assistant' | 'tool'

/** 对话消息 */
export interface AgentMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: number
  /** 助手消息可能携带建议 */
  suggestions?: Suggestion[]
  /** 工具调用状态（仅显示用） */
  toolStatus?: string
}

/** 工具调用状态 */
export type ToolCallStatus = 'idle' | 'calling' | 'done' | 'error'

/** 对话会话 */
export interface AgentConversation {
  id: string
  projectId: string
  messages: AgentMessage[]
  createdAt: number
  updatedAt: number
}

/** 建议状态 */
export type SuggestionStatus = 'pending' | 'previewing' | 'accepted' | 'rejected' | 'editing' | 'applied' | 'expired'

/** 带状态的建议 */
export interface ManagedSuggestion extends Suggestion {
  status: SuggestionStatus
}
