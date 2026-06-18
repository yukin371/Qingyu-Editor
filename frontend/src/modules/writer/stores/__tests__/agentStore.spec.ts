import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { AgentResult, AIAgentConfig } from '../../types/agent'

// Mock the agent API. streamIntent 接收 handlers 并在内部异步触发 onDone/onError；
// 在测试中我们记录 handlers 以便控制回调时机。
const mockStreamIntent = vi.fn()
const mockCreateConversation = vi.fn()
const mockSaveMessage = vi.fn()
const mockListConversations = vi.fn()
const mockGetConversation = vi.fn()
const mockDeleteConversation = vi.fn()
const mockUpdateConversationTitle = vi.fn()

vi.mock('../../api/agent', () => ({
  streamIntent: (...args: any[]) => mockStreamIntent(...args),
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

/**
 * 让 streamIntent 在被调用时同步触发 onDone（默认）或 onError（rejected=true）。
 * 返回捕获到的 handlers 以便测试精细控制。
 */
function mockStreamImmediateDone(result: AgentResult, opts?: { sessionID?: string; reject?: Error }) {
  mockStreamIntent.mockImplementation((_projectId, _intent, _ctx, _config, handlers: any) => {
    if (opts?.reject) {
      // 模拟 streamIntent 同步阶段抛错
      throw opts.reject
    }
    // 异步触发 onDone，模拟事件到达。用 queueMicrotask 保证 await streamIntent 的 Promise 先 resolve。
    queueMicrotask(() => handlers.onDone(result))
    return Promise.resolve(opts?.sessionID ?? 'sess_test')
  })
}

function mockStreamImmediateError(message: string) {
  mockStreamIntent.mockImplementation((_projectId, _intent, _ctx, _config, handlers: any) => {
    queueMicrotask(() => handlers.onError(message))
    return Promise.resolve('sess_test')
  })
}

describe('agentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockSaveMessage.mockResolvedValue({ id: 'msg_saved' })
    mockCreateConversation.mockResolvedValue({ id: 'conv_001' })
  })

  describe('sendMessage', () => {
    it('streams assistant message then replaces with final content on done', async () => {
      mockStreamImmediateDone({
        content: '项目中有1个角色：林雪',
        suggestions: [],
      })

      const store = useAgentStore()
      await store.sendMessage('proj_001', '有哪些角色', testConfig)

      // 用户 + 助手（流式预创建）= 2 条
      expect(store.messages).toHaveLength(2)
      expect(store.messages[0].role).toBe('user')
      expect(store.messages[0].content).toBe('有哪些角色')
      expect(store.messages[1].role).toBe('assistant')
      // onDone 用完整内容替换流式消息（而非追加）
      expect(store.messages[1].content).toBe('项目中有1个角色：林雪')
      expect(store.streamingMessageId).toBeNull()
      expect(store.isLoading).toBe(false)
    })

    it('stores suggestions from AI response', async () => {
      mockStreamImmediateDone({
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
      })

      const store = useAgentStore()
      await store.sendMessage('proj_001', '设计角色', testConfig)

      // 建议应该挂到 assistant message 与 pending suggestions 中
      expect(store.messages[1].suggestions).toHaveLength(1)
      expect(store.pendingSuggestions).toHaveLength(1)
      expect(store.pendingSuggestions[0].status).toBe('pending')
    })

    it('appends tokens to streaming message content', async () => {
      // 精细控制：先接收 token，再触发 onDone
      let capturedHandlers: any
      mockStreamIntent.mockImplementation((_p, _i, _c, _cfg, handlers: any) => {
        capturedHandlers = handlers
        // 注意：不在此处触发 onDone，留给测试手动控制
        return Promise.resolve('sess_token')
      })

      const store = useAgentStore()
      const p = store.sendMessage('proj_001', '续写', testConfig)

      // sendMessage 内部先 await createConversation 再 await streamIntent，
      // 需要让微任务队列推进，handlers 才会被捕获
      await vi.waitFor(() => expect(capturedHandlers).toBeDefined())

      // 触发几个 token
      capturedHandlers.onToken('第一段')
      capturedHandlers.onToken('第二段')
      expect(store.messages[1].content).toBe('第一段第二段')

      // 然后 onDone 用完整内容替换
      capturedHandlers.onDone({ content: '完整最终内容', suggestions: [] })
      await p

      expect(store.messages[1].content).toBe('完整最终内容')
      expect(store.streamingMessageId).toBeNull()
    })

    it('sets and clears activeToolCall around tool calls', async () => {
      let capturedHandlers: any
      mockStreamIntent.mockImplementation((_p, _i, _c, _cfg, handlers: any) => {
        capturedHandlers = handlers
        return Promise.resolve('sess_tool')
      })

      const store = useAgentStore()
      const p = store.sendMessage('proj_001', '列出角色', testConfig)

      await vi.waitFor(() => expect(capturedHandlers).toBeDefined())

      expect(store.activeToolCall).toBeNull()
      capturedHandlers.onToolStart('list_characters')
      expect(store.activeToolCall).toEqual({ name: 'list_characters', status: 'running' })
      capturedHandlers.onToolEnd('list_characters', true)
      expect(store.activeToolCall).toBeNull()

      capturedHandlers.onDone({ content: 'ok', suggestions: [] })
      await p
    })

    it('handles onError gracefully', async () => {
      mockStreamImmediateError('AI 服务不可用')

      const store = useAgentStore()
      await store.sendMessage('proj_001', '测试', testConfig)

      // 流式消息内容被替换为错误文本
      expect(store.messages).toHaveLength(2)
      expect(store.messages[1].role).toBe('assistant')
      expect(store.messages[1].content).toContain('AI 服务不可用')
      expect(store.isLoading).toBe(false)
      expect(store.streamingMessageId).toBeNull()
      expect(store.activeToolCall).toBeNull()
    })

    it('handles streamIntent sync rejection (e.g. missing config)', async () => {
      mockStreamImmediateDone({ content: 'ok', suggestions: [] }, {
        reject: new Error('AI 未配置，请先在设置中配置 AI Provider'),
      })

      const store = useAgentStore()
      await store.sendMessage('proj_001', '测试', testConfig)

      expect(store.messages[1].content).toContain('AI 未配置')
      expect(store.isLoading).toBe(false)
      expect(store.streamingMessageId).toBeNull()
    })

    it('auto-creates conversation and persists messages', async () => {
      mockStreamImmediateDone({ content: 'ok', suggestions: [] })
      mockCreateConversation.mockResolvedValue({ id: 'conv_new' })

      const store = useAgentStore()
      await store.sendMessage('proj_001', '测试', testConfig)

      expect(mockCreateConversation).toHaveBeenCalledWith('proj_001')
      // 用户消息 + 助手消息各一次
      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(store.currentConversationId).toBe('conv_new')
    })
  })

  describe('suggestions', () => {
    it('acceptSuggestion moves from pending to applied', async () => {
      mockStreamImmediateDone({
        content: 'ok',
        suggestions: [{
          id: 'sug_001', type: 'entity_preview', action: 'create',
          targetEntity: 'character', targetId: '', content: '{}', summary: 'test',
        }],
      })

      const store = useAgentStore()
      await store.sendMessage('proj_001', 'test', testConfig)

      expect(store.pendingSuggestions).toHaveLength(1)
      store.acceptSuggestion('sug_001')
      expect(store.pendingSuggestions).toHaveLength(0)
    })

    it('rejectSuggestion removes from pending', async () => {
      mockStreamImmediateDone({
        content: 'ok',
        suggestions: [{
          id: 'sug_001', type: 'entity_preview', action: 'create',
          targetEntity: 'character', targetId: '', content: '{}', summary: 'test',
        }],
      })

      const store = useAgentStore()
      await store.sendMessage('proj_001', 'test', testConfig)

      store.rejectSuggestion('sug_001')
      expect(store.pendingSuggestions).toHaveLength(0)
    })
  })

  describe('clearConversation', () => {
    it('clears all messages and suggestions', async () => {
      mockStreamImmediateDone({ content: 'ok', suggestions: [] })

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
