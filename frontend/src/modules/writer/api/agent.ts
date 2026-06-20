import {
  AgentStreamIntent,
  CreateAgentConversation,
  DeleteAgentConversation,
  GetAgentConversation,
  ListAgentConversations,
  SaveAgentMessage,
  UpdateAgentConversationTitle,
} from '../../../../wailsjs/go/main/App'
import { EventsOn } from '../../../../wailsjs/runtime/runtime'
import { agent } from '../../../../wailsjs/go/models'
import type { AIAgentConfig, AgentResult, EditorContext, Suggestion } from '../types/agent'

/**
 * 获取当前 AI Provider 配置
 */
export function getConfig(): AIAgentConfig | null {
  const raw = localStorage.getItem('ai-agent-config')
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      // fall through
    }
  }
  return null
}

/**
 * 流式发送意图给智能体。返回 sessionID；AI 响应通过 handlers 回调推送。
 * 订阅在 onDone 或 onError 后自动清理。
 * conversationId 决定工具结果缓存作用域：同一对话内复用，跨对话互不污染。
 */
export interface StreamHandlers {
  onToken: (delta: string) => void
  onToolStart?: (toolName: string) => void
  onToolEnd?: (toolName: string, ok: boolean, err?: string) => void
  onDone: (result: AgentResult) => void
  onError: (message: string) => void
}

export async function streamIntent(
  conversationId: string,
  projectId: string,
  intent: string,
  editorContext: EditorContext,
  config: AIAgentConfig | null,
  handlers: StreamHandlers,
): Promise<string> {
  const cfg = config || getConfig()
  if (!cfg || (!cfg.apiKey && !cfg.baseUrl)) {
    throw new Error('AI 未配置，请先在设置中配置 AI Provider')
  }

  const sessionID = await AgentStreamIntent(cfg, conversationId, projectId, intent, editorContext)

  // 已知限制：订阅发生在 AgentStreamIntent resolve 之后。Go 端在 resolve 与首个
  // EventsOn 之间发射的事件会被丢弃。MVP 可接受（首个 token 通常需要网络往返），
  // 若未来本地同步工具发射早事件，需重新设计握手。
  const unsubs: Array<() => void> = []
  const cleanup = () => {
    for (const unsub of unsubs) unsub()
  }

  // Wails EventsOn callback receives payload as first positional arg.
  // Filter to our sessionID — ignore payloads from other sessions.
  type TokenPayload = { sessionID: string; delta: string }
  type ToolStartPayload = { sessionID: string; toolName: string }
  type ToolEndPayload = { sessionID: string; toolName: string; ok: boolean; error?: string }
  type DonePayload = { sessionID: string; agentKind: string; result: AgentResult }
  type ErrorPayload = { sessionID: string; message: string }

  unsubs.push(EventsOn('agent:token', (p: TokenPayload) => {
    if (p.sessionID === sessionID) handlers.onToken(p.delta)
  }))

  if (handlers.onToolStart) {
    const cb = handlers.onToolStart
    unsubs.push(EventsOn('agent:tool_start', (p: ToolStartPayload) => {
      if (p.sessionID === sessionID) cb(p.toolName)
    }))
  }
  if (handlers.onToolEnd) {
    const cb = handlers.onToolEnd
    unsubs.push(EventsOn('agent:tool_end', (p: ToolEndPayload) => {
      if (p.sessionID === sessionID) cb(p.toolName, p.ok, p.error)
    }))
  }

  unsubs.push(EventsOn('agent:done', (p: DonePayload) => {
    if (p.sessionID !== sessionID) return
    // 先取消订阅再回调，避免回调内触发的事件二次命中已清理的监听器。
    cleanup()
    handlers.onDone(p.result)
  }))
  unsubs.push(EventsOn('agent:error', (p: ErrorPayload) => {
    if (p.sessionID !== sessionID) return
    cleanup()
    handlers.onError(p.message)
  }))

  return sessionID
}

// --- 对话持久化 API ---

export interface ConversationDTO {
  id: string
  projectId: string
  title: string
  createdAt: string
  updatedAt: string
  messages?: ConversationMessageDTO[]
}

export interface ConversationMessageDTO {
  id: string
  role: string
  content: string
  suggestions?: Suggestion[]
  timestamp: string
}

export async function createConversation(projectId: string): Promise<ConversationDTO> {
  return CreateAgentConversation(projectId) as Promise<ConversationDTO>
}

export async function listConversations(projectId: string): Promise<ConversationDTO[]> {
  return ListAgentConversations(projectId) as Promise<ConversationDTO[]>
}

export async function getConversation(id: string): Promise<ConversationDTO> {
  return GetAgentConversation(id) as Promise<ConversationDTO>
}

export async function deleteConversation(id: string): Promise<void> {
  return DeleteAgentConversation(id)
}

export async function saveMessage(
  conversationId: string,
  msg: { role: string; content: string; suggestions?: Suggestion[]; timestamp: string },
): Promise<ConversationMessageDTO> {
  return SaveAgentMessage(
    conversationId,
    agent.ConversationMessage.createFrom({ ...msg, id: '' }),
  ) as Promise<ConversationMessageDTO>
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  return UpdateAgentConversationTitle(id, title)
}
