import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { AgentResult, AIAgentConfig } from '../../types/agent'

// Mock the agent API
const mockSendIntent = vi.fn()
const mockCreateConversation = vi.fn()
const mockSaveMessage = vi.fn()
const mockListConversations = vi.fn()
const mockGetConversation = vi.fn()
const mockDeleteConversation = vi.fn()
const mockUpdateConversationTitle = vi.fn()

vi.mock('../../api/agent', () => ({
  sendIntent: (...args: any[]) => mockSendIntent(...args),
  createConversation: (...args: any[]) => mockCreateConversation(...args),
  saveMessage: (...args: any[]) => mockSaveMessage(...args),
  listConversations: (...args: any[]) => mockListConversations(...args),
  getConversation: (...args: any[]) => mockGetConversation(...args),
  deleteConversation: (...args: any[]) => mockDeleteConversation(...args),
  updateConversationTitle: (...args: any[]) => mockUpdateConversationTitle(...args),
}))

// Import after mock
import { useAgentStore } from '../agentStore'

const testConfig: AIAgentConfig = {
  provider: 'openai',
  apiKey: 'test-key',
  baseUrl: 'https://api.example.com/v1',
  model: 'gpt-4',
}

describe('agentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // saveMessage 默认返回 resolved promise（store 用 .catch() 调用）
    mockSaveMessage.mockResolvedValue({ id: 'msg_saved' })
    mockCreateConversation.mockResolvedValue({ id: 'conv_001' })
  })

  describe('sendMessage', () => {
    it('adds user message and AI response to conversation', async () => {
      mockSendIntent.mockResolvedValue({
        content: '项目中有1个角色：林雪',
        suggestions: [],
      } as AgentResult)
      mockCreateConversation.mockResolvedValue({ id: 'conv_001' })

      const store = useAgentStore()
      await store.sendMessage('proj_001', '有哪些角色', testConfig)

      // 应该有2条消息：用户 + AI
      expect(store.messages).toHaveLength(2)
      expect(store.messages[0].role).toBe('user')
      expect(store.messages[0].content).toBe('有哪些角色')
      expect(store.messages[1].role).toBe('assistant')
      expect(store.messages[1].content).toBe('项目中有1个角色：林雪')
    })

    it('stores suggestions from AI response', async () => {
      mockSendIntent.mockResolvedValue({
        content: '建议如下',
        suggestions: [
          {
            id: 'sug_001',
            type: 'entity_preview',
            action: 'create',
            targetEntity: 'character',
            targetId: '',
            content: '{"name":"赵衡"}',
            summary: '建议新建角色赵衡',
          },
        ],
      } as AgentResult)
      mockCreateConversation.mockResolvedValue({ id: 'conv_001' })

      const store = useAgentStore()
      await store.sendMessage('proj_001', '设计角色', testConfig)

      // 建议应该存储在 assistant message 和 pending suggestions 中
      expect(store.messages[1].suggestions).toHaveLength(1)
      expect(store.pendingSuggestions).toHaveLength(1)
      expect(store.pendingSuggestions[0].status).toBe('pending')
    })

    it('manages loading state', async () => {
      let resolvePromise: (v: any) => void
      mockSendIntent.mockReturnValue(new Promise(r => { resolvePromise = r }))

      const store = useAgentStore()
      const promise = store.sendMessage('proj_001', '测试', testConfig)

      // 等待 createConversation 完成
      await vi.waitFor(() => expect(store.isLoading).toBe(true))

      resolvePromise!({ content: 'ok', suggestions: [] })
      await promise

      expect(store.isLoading).toBe(false)
    })

    it('handles errors gracefully', async () => {
      mockSendIntent.mockRejectedValue(new Error('AI 服务不可用'))
      mockCreateConversation.mockResolvedValue({ id: 'conv_001' })

      const store = useAgentStore()
      await store.sendMessage('proj_001', '测试', testConfig)

      // 应该添加错误消息到对话
      expect(store.messages).toHaveLength(2)
      expect(store.messages[1].role).toBe('assistant')
      expect(store.messages[1].content).toContain('AI 服务不可用')
      expect(store.isLoading).toBe(false)
    })

    it('auto-creates conversation and persists messages', async () => {
      mockSendIntent.mockResolvedValue({ content: 'ok', suggestions: [] })
      mockCreateConversation.mockResolvedValue({ id: 'conv_new' })

      const store = useAgentStore()
      await store.sendMessage('proj_001', '测试', testConfig)

      // 应该自动创建对话
      expect(mockCreateConversation).toHaveBeenCalledWith('proj_001')
      // 应该持久化用户消息和助手消息
      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(store.currentConversationId).toBe('conv_new')
    })
  })

  describe('suggestions', () => {
    it('acceptSuggestion moves from pending to applied', async () => {
      mockSendIntent.mockResolvedValue({
        content: 'ok',
        suggestions: [{
          id: 'sug_001', type: 'entity_preview', action: 'create',
          targetEntity: 'character', targetId: '', content: '{}', summary: 'test',
        }],
      } as AgentResult)
      mockCreateConversation.mockResolvedValue({ id: 'conv_001' })

      const store = useAgentStore()
      await store.sendMessage('proj_001', 'test', testConfig)

      expect(store.pendingSuggestions).toHaveLength(1)
      store.acceptSuggestion('sug_001')
      expect(store.pendingSuggestions).toHaveLength(0)
    })

    it('rejectSuggestion removes from pending', async () => {
      mockSendIntent.mockResolvedValue({
        content: 'ok',
        suggestions: [{
          id: 'sug_001', type: 'entity_preview', action: 'create',
          targetEntity: 'character', targetId: '', content: '{}', summary: 'test',
        }],
      } as AgentResult)
      mockCreateConversation.mockResolvedValue({ id: 'conv_001' })

      const store = useAgentStore()
      await store.sendMessage('proj_001', 'test', testConfig)

      store.rejectSuggestion('sug_001')
      expect(store.pendingSuggestions).toHaveLength(0)
    })
  })

  describe('clearConversation', () => {
    it('clears all messages and suggestions', async () => {
      mockSendIntent.mockResolvedValue({ content: 'ok', suggestions: [] })
      mockCreateConversation.mockResolvedValue({ id: 'conv_001' })

      const store = useAgentStore()
      await store.sendMessage('proj_001', 'test', testConfig)
      expect(store.messages.length).toBeGreaterThan(0)

      store.clearConversation()
      expect(store.messages).toHaveLength(0)
      expect(store.pendingSuggestions).toHaveLength(0)
      expect(store.currentConversationId).toBeNull()
    })
  })

  describe('conversation persistence', () => {
    it('loadConversationHistory populates conversationList', async () => {
      mockListConversations.mockResolvedValue([
        { id: 'conv_1', title: '角色讨论', updatedAt: '2026-05-31T10:00:00Z' },
        { id: 'conv_2', title: '大纲设计', updatedAt: '2026-05-31T09:00:00Z' },
      ])

      const store = useAgentStore()
      await store.loadConversationHistory('proj_001')

      expect(store.conversationList).toHaveLength(2)
      expect(store.conversationList[0].title).toBe('角色讨论')
    })

    it('loadConversation restores messages from saved conversation', async () => {
      mockGetConversation.mockResolvedValue({
        id: 'conv_1',
        projectId: 'proj_001',
        title: '角色讨论',
        createdAt: '2026-05-31T10:00:00Z',
        updatedAt: '2026-05-31T10:30:00Z',
        messages: [
          { id: 'm1', role: 'user', content: '有哪些角色', timestamp: '2026-05-31T10:00:00Z' },
          { id: 'm2', role: 'assistant', content: '有林雪', timestamp: '2026-05-31T10:01:00Z' },
        ],
      })

      const store = useAgentStore()
      await store.loadConversation('conv_1')

      expect(store.currentConversationId).toBe('conv_1')
      expect(store.messages).toHaveLength(2)
      expect(store.messages[0].role).toBe('user')
      expect(store.messages[1].content).toBe('有林雪')
    })

    it('removeConversation deletes and clears if active', async () => {
      mockDeleteConversation.mockResolvedValue(undefined)
      mockCreateConversation.mockResolvedValue({ id: 'conv_001' })
      mockSendIntent.mockResolvedValue({ content: 'ok', suggestions: [] })

      const store = useAgentStore()
      store.conversationList = [
        { id: 'conv_001', title: 'test', updatedAt: '' },
        { id: 'conv_002', title: 'other', updatedAt: '' },
      ]
      store.currentConversationId = 'conv_001'
      store.messages = [{ id: 'm1', role: 'user', content: 'test', timestamp: 0 }]

      await store.removeConversation('conv_001')

      expect(mockDeleteConversation).toHaveBeenCalledWith('conv_001')
      expect(store.conversationList).toHaveLength(1)
      expect(store.currentConversationId).toBeNull()
      expect(store.messages).toHaveLength(0)
    })
  })
})
