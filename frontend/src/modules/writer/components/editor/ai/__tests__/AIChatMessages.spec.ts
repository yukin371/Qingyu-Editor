/**
 * AIChatMessages 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AIChatMessages from '../AIChatMessages.vue'
import type { ChatMessage } from '../types'

vi.mock('marked', () => ({
  marked: (content: string) => `<p>${content}</p>`,
}))

vi.mock('@/utils/sanitize', () => ({
  sanitizeMarkdownHtml: (html: string) => html,
}))

// Mock QyIcon
vi.mock('@/design-system/components/basic/QyIcon/QyIcon.vue', () => ({
  default: {
    name: 'QyIcon',
    template: '<span class="qy-icon"><slot /></span>',
  },
}))

// Mock useI18n
vi.mock('@/composables/useI18n', () => ({
  useI18n: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}))

describe('AIChatMessages', () => {
  const buildWrapper = (props: Record<string, unknown>) =>
    mount(AIChatMessages, {
      props,
      global: {
        directives: {
          safeHtml: {
            mounted(el, binding) {
              el.innerHTML = binding.value ?? ''
            },
            updated(el, binding) {
              el.innerHTML = binding.value ?? ''
            },
          },
        },
      },
    })

  it('should show empty state when no messages', () => {
    const wrapper = buildWrapper({ messages: [] })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-text').text()).toContain('开始与AI助手对话')
  })

  it('should render user message correctly', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages })
    expect(wrapper.find('.message-user').exists()).toBe(true)
    expect(wrapper.find('.message-user .message-content').text()).toBe('Hello')
  })

  it('should render AI message correctly', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages })
    expect(wrapper.find('.message-ai').exists()).toBe(true)
    expect(wrapper.find('.message-ai .message-content').html()).toContain('<p>Hi there!</p>')
  })

  it('should show typing indicator when message is typing', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'assistant', content: '', timestamp: Date.now(), typing: true },
    ]
    const wrapper = buildWrapper({ messages, typingText: 'Loading...', isTyping: true })
    expect(wrapper.find('.typing-indicator').exists()).toBe(true)
    expect(wrapper.find('.message-ai .message-content').html()).toContain('<p>Loading...</p>')
  })

  it('should render markdown content for assistant messages', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'assistant', content: '**重点**', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-ai .message-content').html()).toContain('<p>**重点**</p>')
  })

  it('should render structured patch preview card when assistant message carries meta', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '已为第二章生成 patch 预览。',
        timestamp: Date.now(),
        meta: {
          kind: 'document_tool_patch_preview',
          status: 'switching',
          statusText: '正在切换章节并准备正文 diff',
          documentLabel: '第二章（chapter-2）',
          operationType: 'delete_lines',
          blockCount: 1,
          totalLines: 12,
          blocks: [
            {
              header: '变更 1 [delete_lines] 8-10',
              before: ['旧内容一', '旧内容二'],
              after: [],
            },
          ],
        },
      },
    ]

    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-tool-card').exists()).toBe(true)
    expect(wrapper.find('.message-tool-card__title').text()).toBe('第二章（chapter-2）')
    expect(wrapper.find('.message-tool-card__status').text()).toContain('正在切换章节')
    expect(wrapper.find('.message-tool-block__title').text()).toContain('delete_lines')
    expect(wrapper.find('.message-tool-block__panel--before').text()).toContain('旧内容一')
    expect(wrapper.find('.message-tool-block__panel--after').text()).toContain('删除')
  })

  it('should render target candidate card and emit selection', async () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '请从候选章节中选择目标。',
        timestamp: Date.now(),
        meta: {
          kind: 'document_target_candidates',
          status: 'needs_selection',
          statusText: '命中了多个章节',
          requestLabel: '搜索“玉佩”',
          instruction: '找到提到玉佩的章节，并补强伏笔',
          route: 'edit',
          candidates: [
            {
              documentId: 'chapter-2',
              documentTitle: '第二章',
              reason: '命中 2 处“玉佩”',
            },
          ],
        },
      },
    ]

    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-target-candidate').exists()).toBe(true)
    expect(wrapper.find('.message-target-candidate__title').text()).toContain('第二章')

    await wrapper.find('.message-target-candidate').trigger('click')

    expect(wrapper.emitted('select-document-target')?.[0]?.[0]).toEqual({
      instruction: '找到提到玉佩的章节，并补强伏笔',
      route: 'edit',
      documentId: 'chapter-2',
      documentTitle: '第二章',
    })
  })

  it('should render target status card for cross-document progress', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '已提交切章挂 diff。',
        timestamp: Date.now(),
        meta: {
          kind: 'document_target_status',
          status: 'switching',
          statusText: '已提交切章挂 diff',
          documentLabel: '《第二章》',
          detail: '宿主会自动切换到目标章节并展示正文 diff。',
        },
      },
    ]

    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-tool-card__title').text()).toContain('第二章')
    expect(wrapper.find('.message-tool-card__status').text()).toContain('切章挂 diff')
    expect(wrapper.find('.message-tool-card__detail').text()).toContain('宿主会自动切换')
  })

  it('should render writer retrieval summary card', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '已完成跨文件查找。',
        timestamp: Date.now(),
        meta: {
          kind: 'writer_retrieval_summary',
          status: 'ready',
          statusText: '命中 2 个章节',
          queryLabel: '搜索“玉佩”',
          targetDocumentId: 'chapter-2',
          hits: [
            {
              documentId: 'chapter-1',
              documentTitle: '第一章',
              reason: '命中 1 处“玉佩”',
              excerpt: '她第一次看见玉佩。',
            },
            {
              documentId: 'chapter-2',
              documentTitle: '第二章',
              reason: '命中 2 处“玉佩”',
              selected: true,
            },
          ],
        },
      },
    ]

    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-tool-card__title').text()).toContain('玉佩')
    expect(wrapper.findAll('.message-retrieval-hit')).toHaveLength(2)
    expect(wrapper.find('.message-retrieval-hit.is-selected').text()).toContain('第二章')
    expect(wrapper.find('.message-retrieval-hit__excerpt').text()).toContain('第一次看见')
  })

  it('should render writer plan preview card', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '已生成执行计划。',
        timestamp: Date.now(),
        meta: {
          kind: 'writer_plan_preview',
          status: 'needs_confirmation',
          statusText: '需要确认',
          operationLabel: '多章节修改计划',
          targetLabel: '前三章',
          executionMode: 'plan_only',
          requiresConfirmation: true,
          nextStep: '请确认逐章目标后再生成正文 diff。',
        },
      },
    ]

    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-tool-card__title').text()).toContain('多章节修改计划')
    expect(wrapper.find('.message-plan-grid').text()).toContain('前三章')
    expect(wrapper.find('.message-plan-grid').text()).toContain('仅生成计划')
    expect(wrapper.find('.message-tool-card__detail').text()).toContain('逐章目标')
  })

  it('should render writer apply checkpoint card', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '已提交正文 diff。',
        timestamp: Date.now(),
        meta: {
          kind: 'writer_apply_checkpoint',
          status: 'switching',
          statusText: '切章挂 diff',
          targetLabel: '《第二章》',
          detail: '宿主会切换章节并展示可审阅结果。',
          stages: [
            { stage: 'planned', status: 'done' },
            { stage: 'generated', label: '生成正文', status: 'done' },
            { stage: 'switching', status: 'running', detail: '等待宿主切章' },
          ],
        },
      },
    ]

    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-tool-card__title').text()).toContain('第二章')
    expect(wrapper.findAll('.message-checkpoint-item')).toHaveLength(3)
    expect(wrapper.find('.message-checkpoint-item--running').text()).toContain('等待宿主切章')
  })

  it('should render writer connection status card', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: 'AI 服务连接失败，请确认本地 AI 服务已启动。',
        timestamp: Date.now(),
        meta: {
          kind: 'writer_connection_status',
          status: 'offline',
          statusText: '服务未连接',
          targetLabel: 'AI 服务不可用',
          detail: '当前请求已经发出，但本地 AI 服务未启动或无法连接到配置地址。',
        },
      },
    ]

    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-tool-card--offline').exists()).toBe(true)
    expect(wrapper.find('.message-tool-card__title').text()).toContain('AI 服务不可用')
    expect(wrapper.find('.message-tool-card__status').text()).toContain('服务未连接')
    expect(wrapper.find('.message-tool-card__detail').text()).toContain('本地 AI 服务未启动')
  })

  it('should show pending assistant bubble when panel is typing without persisted typing message', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: '继续写', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages, isTyping: true, typingText: '正在思考，请稍候…' })

    expect(wrapper.find('.message-ai-pending').exists()).toBe(true)
    expect(wrapper.find('.message-ai-pending .message-content').html()).toContain(
      '<p>正在思考，请稍候…</p>',
    )
    expect(wrapper.find('.message-ai-pending .message-time').text()).toBe('思考中')
  })

  it('should format recent timestamp as "刚刚"', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Test', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages })
    expect(wrapper.find('.message-time').text()).toBe('刚刚')
  })

  it('should expose scrollToBottom method', () => {
    const wrapper = buildWrapper({ messages: [] })
    expect(typeof wrapper.vm.scrollToBottom).toBe('function')
  })
})
