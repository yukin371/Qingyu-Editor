import {
  AgentProcessIntent,
  CreateAgentConversation,
  DeleteAgentConversation,
  GetAgentConversation,
  ListAgentConversations,
  SaveAgentMessage,
  UpdateAgentConversationTitle,
} from '../../../../wailsjs/go/main/App'
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
 * 发送意图给智能体
 */
export async function sendIntent(
  projectId: string,
  intent: string,
  editorContext: EditorContext,
  config?: AIAgentConfig,
): Promise<AgentResult> {
  const cfg = config || getConfig()
  if (!cfg || (!cfg.apiKey && !cfg.baseUrl)) {
    throw new Error('AI 未配置，请先在设置中配置 AI Provider')
  }

  const result = await AgentProcessIntent(cfg, projectId, intent, editorContext)
  return result as AgentResult
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
