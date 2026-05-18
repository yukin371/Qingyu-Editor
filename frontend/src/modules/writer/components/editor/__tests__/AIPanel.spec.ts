import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import AIPanel from '../AIPanel.vue'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import {
  chatWithAI,
  continueWriting,
  expandText,
  requestWriterAI,
  rewriteText,
  summarizeText,
} from '@/modules/ai/api'

const messages = ref<Array<{ role: string; content: string }>>([])
const addMessage = vi.fn()
const clearHistory = vi.fn()
const save = vi.fn()
const load = vi.fn()
const setSessionId = vi.fn()
const mockExecuteWriterDocumentCommand = vi.fn()
const mockListDocuments = vi.fn()
const mockReadDocument = vi.fn()
const mockSearchDocument = vi.fn()

vi.mock('@/composables/useI18n', () => ({
  useI18n: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}))

vi.mock('@/composables/useBreakpoints', () => ({
  useBreakpoints: () => ({
    smaller: () => false,
    between: () => false,
    greaterOrEqual: () => true,
  }),
}))

vi.mock('@/composables/useChatHistory', () => ({
  useChatHistory: () => ({
    messages,
    addMessage,
    clearHistory,
    save,
    load,
    setSessionId,
  }),
}))

vi.mock('@/composables/useTypewriter', () => ({
  useTypewriter: () => ({
    stop: vi.fn(),
  }),
}))

vi.mock('@/modules/ai/api', () => ({
  chatWithAI: vi.fn(),
  continueWriting: vi.fn(),
  polishText: vi.fn(),
  expandText: vi.fn(),
  requestWriterAI: vi.fn(),
  rewriteText: vi.fn(),
  summarizeText: vi.fn(),
  proofreadText: vi.fn(),
}))

vi.mock('@/design-system/services', () => ({
  message: {
    warning: vi.fn(),
  },
}))

vi.mock('@/modules/writer/services/documentToolCommands.service', () => ({
  executeWriterDocumentCommand: (...args: unknown[]) => mockExecuteWriterDocumentCommand(...args),
}))

vi.mock('@/modules/writer/services/documentTools.service', () => ({
  documentToolsService: {
    listDocuments: (...args: unknown[]) => mockListDocuments(...args),
    readDocument: (...args: unknown[]) => mockReadDocument(...args),
    searchDocument: (...args: unknown[]) => mockSearchDocument(...args),
  },
}))

const AIConversationToolbarStub = defineComponent({
  props: {
    currentId: {
      type: String,
      default: 'default',
    },
    conversationList: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:currentId', 'clear', 'create', 'rename', 'delete'],
  template:
    '<div><div data-testid="conversation-toolbar" /><button data-testid="toolbar-clear" @click="$emit(\'clear\')">clear</button></div>',
})

const AISelectionNoticeStub = defineComponent({
  props: {
    notice: {
      type: Object,
      default: null,
    },
  },
  template:
    '<div data-testid="selection-notice">{{ notice ? `${notice.action}:${notice.text}` : "empty" }}</div>',
})

const AIChatMessagesStub = defineComponent({
  emits: ['select-document-target'],
  template: '<div data-testid="chat-messages" />',
  methods: {
    scrollToBottom() {},
  },
})

const AIQuickActionsStub = defineComponent({
  props: {
    actions: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['select'],
  template:
    '<div data-testid="quick-actions"><button v-for="action in actions" :key="action.id" :data-testid="`quick-action-${action.id}`" @click="$emit(\'select\', action)">{{ action.label }}</button></div>',
})

const AIInputAreaStub = defineComponent({
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    context: {
      type: Object,
      default: null,
    },
    targetLabel: {
      type: String,
      default: '',
    },
    targetDetail: {
      type: String,
      default: '',
    },
    contextEvidence: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      default: 'chat',
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'update:mode', 'send', 'clear-context'],
  template:
    '<div><div data-testid="input-target">{{ targetLabel }}</div><div data-testid="input-target-detail">{{ targetDetail }}</div><div data-testid="input-context-evidence">{{ contextEvidence }}</div><div data-testid="input-context">{{ context ? context.text : "empty" }}</div><div data-testid="input-mode">{{ mode }}</div><button data-testid="input-send" @click="$emit(\'send\')">send</button></div>',
})

function buildWorkflowContext(signature: string, chapterId = signature): WriterWorkflowContext {
  return {
    signature,
    projectId: 'project-1',
    chapterId,
    chapterTitle: `章节 ${chapterId}`,
    scopeLabel: `scope-${chapterId}`,
    activeCharacters: [],
    activeRelations: [],
    pendingChangeRequests: [],
    pendingChangeRequestCount: 0,
  }
}

function mountPanel() {
  return mount(AIPanel, {
    props: {
      sessionId: 'project-1',
      sourceText: '',
      workflowContext: buildWorkflowContext('chapter-1'),
      actionTrigger: null,
      aiSummaryContextText: '创作蓝图与资产摘要：\n当前章节资产：角色 2；地点 1',
      aiSceneStageSummary: {
        sceneTitle: '雨夜祠堂',
        beatTitle: '主角救下线人',
        goal: '建立信任',
        conflict: '追兵逼近',
        nextBeatTitle: '黑市脱身',
      },
    },
    global: {
      stubs: {
        AIConversationToolbar: AIConversationToolbarStub,
        AISelectionNotice: AISelectionNoticeStub,
        AIChatMessages: AIChatMessagesStub,
        AIQuickActions: AIQuickActionsStub,
        AIInputArea: AIInputAreaStub,
      },
    },
  })
}

function getFirstApplyGeneratedPayload(wrapper: ReturnType<typeof mountPanel>) {
  return (
    wrapper.emitted('applyGeneratedText') as Array<[Record<string, unknown>]> | undefined
  )?.[0]?.[0]
}

describe('AIPanel', () => {
  beforeEach(() => {
    messages.value = []
    addMessage.mockReset()
    addMessage.mockImplementation(
      (role: string, content: string, typing?: boolean, meta?: Record<string, unknown>) => {
        const message = { role, content, typing, meta }
        messages.value.push(message)
        return message
      },
    )
    clearHistory.mockReset()
    clearHistory.mockImplementation(() => {
      messages.value = []
    })
    save.mockReset()
    load.mockReset()
    setSessionId.mockReset()
    vi.mocked(expandText).mockReset()
    vi.mocked(rewriteText).mockReset()
    vi.mocked(summarizeText).mockReset()
    vi.mocked(chatWithAI).mockReset()
    vi.mocked(requestWriterAI).mockReset()
    vi.mocked(requestWriterAI).mockImplementation(async (plan) => {
      const sourceText = plan.context.currentDocument?.sourceText || ''
      if (plan.mutationMode === 'single_document_diff') {
        const action = plan.intent?.action
        const response =
          action === 'continue'
            ? await continueWriting(
                plan.context.projectId,
                sourceText,
                plan.intent?.targetLength ?? 200,
                plan.userVisibleSummary,
              )
            : action === 'expand'
            ? await expandText(
                plan.context.projectId,
                sourceText,
                plan.userVisibleSummary,
                plan.intent?.targetLength,
              )
            : await rewriteText(
                plan.context.projectId,
                sourceText,
                'polish',
                plan.userVisibleSummary,
              )
        return {
          route: plan.route,
          mutationMode: plan.mutationMode,
          message: '已生成单章候选正文，请交由编辑器 diff 确认。',
          generatedText:
            (response as Record<string, string>).generated_text ||
            (response as Record<string, string>).expanded_text ||
            (response as Record<string, string>).rewritten_text ||
            '',
          requiresConfirmation: true,
          evidence: plan.context.evidence,
        }
      }
      if (plan.route === 'analysis') {
        const response = await summarizeText(sourceText, {
          projectId: plan.context.projectId,
          summaryType: 'detailed',
        })
        return {
          route: plan.route,
          mutationMode: plan.mutationMode,
          message: (response as Record<string, string>).summary || '',
          requiresConfirmation: false,
          evidence: plan.context.evidence,
        }
      }
      const response = await chatWithAI(plan.userVisibleSummary, plan.history || [])
      return {
        route: plan.route,
        mutationMode: plan.mutationMode,
        message: response.reply || '',
        requiresConfirmation: false,
        evidence: plan.context.evidence,
      }
    })
    mockExecuteWriterDocumentCommand.mockReset()
    mockExecuteWriterDocumentCommand.mockResolvedValue({ handled: false })
    mockListDocuments.mockReset()
    mockListDocuments.mockResolvedValue({ documents: [] })
    mockReadDocument.mockReset()
    mockSearchDocument.mockReset()
    localStorage.clear()
  })

  it('clears add_to_chat handoff state when workflow scope changes', async () => {
    const wrapper = mountPanel()

    await wrapper.setProps({
      actionTrigger: {
        id: 1,
        action: 'add_to_chat',
        text: '上一章的重点片段',
        instructions: '保留人物语气',
      },
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toContain('上一章的重点片段')

    await wrapper.setProps({
      workflowContext: buildWorkflowContext('chapter-2'),
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toBe('empty')
  })

  it('clears add_to_chat handoff state when session changes', async () => {
    const wrapper = mountPanel()

    await wrapper.setProps({
      actionTrigger: {
        id: 2,
        action: 'add_to_chat',
        text: '需要带到对话里的旧上下文',
      },
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toContain(
      '需要带到对话里的旧上下文',
    )

    await wrapper.setProps({
      sessionId: 'project-2',
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toBe('empty')
  })

  it('switches to edit mode with revision seed as current context', async () => {
    const wrapper = mountPanel()

    await wrapper.setProps({
      revisionSeed: {
        id: 1,
        text: '待继续修改的候选正文',
        instructions: '再压缩一点，并强化悬念。',
        applyMode: 'replace_document',
      },
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toContain('待继续修改的候选正文')
    expect(wrapper.get('[data-testid="input-mode"]').text()).toBe('edit')
  })

  it('keeps execution status in selection notice for continue action while chat context stays empty', async () => {
    vi.mocked(continueWriting).mockResolvedValue({
      generated_text: '续写后的内容',
    } as never)

    const wrapper = mountPanel()

    await wrapper.setProps({
      actionTrigger: {
        id: 3,
        action: 'continue',
        text: '原始选中文本',
        instructions: '延续当前语气',
      },
    })
    await nextTick()
    await Promise.resolve()
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toContain(
      'continue:原始选中文本',
    )
    expect(wrapper.get('[data-testid="input-context"]').text()).toBe('empty')
  })

  it('directly applies rewritten text when sending an edit instruction with selected context', async () => {
    vi.mocked(rewriteText).mockResolvedValue({
      rewritten_text: '修改后的正文',
    } as never)

    const wrapper = mountPanel()

    await wrapper.setProps({
      actionTrigger: {
        id: 4,
        action: 'add_to_chat',
        text: '原始正文片段',
        instructions: '保留悬疑氛围',
        from: 2,
        to: 6,
      },
    })
    await nextTick()

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '把语气改得更紧张')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()
    await nextTick()

    expect(vi.mocked(rewriteText)).toHaveBeenCalledTimes(1)
  })

  it('supports direct whole-document rewriting when no selection context exists', async () => {
    vi.mocked(rewriteText).mockResolvedValue({
      rewritten_text: '整章重写后的正文',
    } as never)

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前整章正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
        aiSummaryContextText: '创作蓝图与资产摘要：\n当前章节资产：角色 2；地点 1',
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '把这一章改得更紧张')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()
    await nextTick()

    expect(vi.mocked(rewriteText)).toHaveBeenCalledWith(
      'project-1',
      '当前整章正文',
      'polish',
      expect.stringContaining('创作蓝图与资产摘要：'),
    )
    expect(vi.mocked(rewriteText).mock.calls[0]?.[3]).toContain(
      '请直接输出可替换整章正文的完整版本。',
    )
  })

  it('merges summary context into general chat requests', async () => {
    vi.mocked(chatWithAI).mockResolvedValue({
      reply: '收到，我们继续讨论。',
    } as never)

    const wrapper = mountPanel()
    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '聊聊这章的节奏问题')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(vi.mocked(chatWithAI)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(chatWithAI).mock.calls[0]?.[0]).toContain('当前工作流上下文：')
    expect(vi.mocked(chatWithAI).mock.calls[0]?.[0]).toContain('创作蓝图与资产摘要：')
    expect(vi.mocked(chatWithAI).mock.calls[0]?.[0]).toContain('当前章节资产：角色 2；地点 1')
    expect(vi.mocked(chatWithAI).mock.calls[0]?.[0]).toContain('当前场景舞台：')
    expect(vi.mocked(chatWithAI).mock.calls[0]?.[0]).toContain('当前拍：主角救下线人')
    expect(vi.mocked(chatWithAI).mock.calls[0]?.[0]).toContain('聊聊这章的节奏问题')
    expect(vi.mocked(chatWithAI).mock.calls[0]?.[1]).toEqual([])
  })

  it('does not duplicate the current user message in general chat history', async () => {
    vi.mocked(chatWithAI).mockResolvedValue({
      reply: '收到，我们继续讨论。',
    } as never)

    messages.value = [
      { role: 'user', content: '上一轮问题' },
      { role: 'assistant', content: '上一轮回答' },
    ]

    const wrapper = mountPanel()
    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '这章整体给人的感觉怎么样')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(vi.mocked(chatWithAI)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(chatWithAI).mock.calls[0]?.[1]).toEqual([
      { role: 'user', content: '上一轮问题' },
      { role: 'assistant', content: '上一轮回答' },
    ])
  })

  it('emits structured connection status meta when ai service is offline', async () => {
    vi.mocked(chatWithAI).mockRejectedValue({
      message: 'Network Error',
    } as never)

    const wrapper = mountPanel()
    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '这章整体给人的感觉怎么样')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(addMessage).toHaveBeenCalledWith(
      'assistant',
      'AI 服务连接失败，请确认本地 AI 服务已启动。',
      false,
      expect.objectContaining({
        kind: 'writer_connection_status',
        status: 'offline',
        statusText: '服务未连接',
      }),
    )
  })

  it('routes explicit expand-length requests into direct edit diff flow', async () => {
    vi.mocked(expandText).mockResolvedValue({
      expanded_text: '扩写后的整章正文',
    } as never)

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前整章正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '把这一章扩写到300字，增加心理描写')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()
    await nextTick()

    expect(vi.mocked(expandText)).toHaveBeenCalledWith(
      'project-1',
      '当前整章正文',
      expect.stringContaining('把这一章扩写到300字'),
      300,
    )
    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
    expect(vi.mocked(summarizeText)).not.toHaveBeenCalled()
  })

  it('prefers current chapter source over revision candidate when instruction explicitly targets current chapter', async () => {
    vi.mocked(expandText).mockResolvedValue({
      expanded_text: '扩写后的当前章节正文',
    } as never)

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前整章正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
        revisionSeed: {
          id: 99,
          text: '旧候选稿正文',
          instructions: '延续候选稿风格',
          applyMode: 'replace_document',
        },
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '请扩写当前章节，补足心理描写')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()
    await nextTick()

    expect(vi.mocked(expandText)).toHaveBeenCalledWith(
      'project-1',
      '当前整章正文',
      expect.stringContaining('请扩写当前章节'),
      undefined,
    )
  })

  it('shows current chapter target when prompt explicitly targets current chapter over revision', async () => {
    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前整章正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
        revisionSeed: {
          id: 100,
          text: '旧候选稿正文',
          applyMode: 'replace_document',
        },
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '扩写当前章节')
    await nextTick()

    expect(wrapper.get('[data-testid="input-target"]').text()).toContain('本章全文')
    expect(wrapper.get('[data-testid="input-target"]').text()).not.toContain('候选稿')
  })

  it('downgrades multi-chapter edit requests to a plan card without calling edit APIs', async () => {
    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前整章正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '把前三章都改得更快节奏')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
    expect(vi.mocked(expandText)).not.toHaveBeenCalled()
    expect(addMessage).toHaveBeenCalledWith(
      'assistant',
      expect.stringContaining('多章节请求'),
      false,
      expect.objectContaining({
        kind: 'writer_plan_preview',
        executionMode: 'plan_only',
        requiresConfirmation: true,
      }),
    )
  })

  it('plans chapter creation without creating a document or applying正文 diff', async () => {
    const wrapper = mountPanel()

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '新增一章写他们第一次见面')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
    expect(wrapper.emitted('applyGeneratedText')).toBeUndefined()
    expect(addMessage).toHaveBeenCalledWith(
      'assistant',
      expect.stringContaining('新增章节请求'),
      false,
      expect.objectContaining({
        kind: 'writer_plan_preview',
        operationLabel: '新增章节计划',
        executionMode: 'plan_only',
      }),
    )
  })

  it('supports cross-chapter direct editing by resolving target chapter title', async () => {
    mockListDocuments.mockResolvedValue({
      documents: [
        {
          documentId: 'chapter-1',
          title: '第一章',
          level: 0,
          order: 1,
          type: 'chapter',
          wordCount: 0,
        },
        {
          documentId: 'chapter-2',
          title: '雨夜',
          level: 0,
          order: 2,
          type: 'chapter',
          wordCount: 0,
        },
      ],
    })
    mockReadDocument.mockResolvedValue({
      documentId: 'chapter-2',
      version: 1,
      contentType: 'plain_text',
      totalLines: 1,
      lines: [{ line: 1, text: '雨夜章节正文' }],
    })
    vi.mocked(rewriteText).mockResolvedValue({
      rewritten_text: '雨夜章节改写后正文',
    } as never)

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前章节正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '帮我重写《雨夜》这一章的结尾')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()
    await nextTick()

    expect(vi.mocked(rewriteText)).toHaveBeenCalledWith(
      'project-1',
      '雨夜章节正文',
      'polish',
      expect.stringContaining('当前章节：雨夜'),
    )
    expect(vi.mocked(rewriteText).mock.calls[0]?.[3]).toContain('雨夜章节正文')
    expect(vi.mocked(rewriteText).mock.calls[0]?.[3]).not.toContain('当前章节：章节 chapter-1')
    expect(getFirstApplyGeneratedPayload(wrapper)).toMatchObject({
      action: 'rewrite',
      sourceText: '雨夜章节正文',
      generatedText: '雨夜章节改写后正文',
      applyMode: 'replace_document',
      targetDocumentId: 'chapter-2',
      targetDocumentTitle: '雨夜',
    })
    expect(addMessage).toHaveBeenCalledWith(
      'assistant',
      expect.stringContaining('已定位到'),
      false,
      expect.objectContaining({
        kind: 'document_target_status',
        status: 'loading',
      }),
    )
    expect(addMessage).toHaveBeenCalledWith(
      'assistant',
      '雨夜章节改写后正文',
      false,
      expect.objectContaining({
        kind: 'document_target_status',
        status: 'switching',
      }),
    )
    expect(addMessage).toHaveBeenCalledWith(
      'assistant',
      expect.stringContaining('正文 diff'),
      false,
      expect.objectContaining({
        kind: 'writer_apply_checkpoint',
        status: 'switching',
      }),
    )
  })

  it('shows retrieval summary before applying a unique cross-file search edit', async () => {
    mockListDocuments.mockResolvedValue({
      documents: [
        {
          documentId: 'chapter-1',
          title: '第一章',
          level: 0,
          order: 1,
          type: 'chapter',
          wordCount: 0,
        },
        {
          documentId: 'chapter-2',
          title: '第二章',
          level: 0,
          order: 2,
          type: 'chapter',
          wordCount: 0,
        },
      ],
    })
    mockSearchDocument.mockResolvedValueOnce({
      documentId: 'chapter-1',
      query: '玉佩',
      totalMatches: 0,
      matches: [],
    })
    mockSearchDocument.mockResolvedValueOnce({
      documentId: 'chapter-2',
      query: '玉佩',
      totalMatches: 1,
      matches: [{ line: 1, startColumn: 1, endColumn: 2, text: '玉佩', before: [], after: [] }],
    })
    mockReadDocument.mockResolvedValue({
      documentId: 'chapter-2',
      version: 1,
      contentType: 'plain_text',
      totalLines: 1,
      lines: [{ line: 1, text: '第二章正文' }],
    })
    vi.mocked(rewriteText).mockResolvedValue({
      rewritten_text: '第二章补强后正文',
    } as never)

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前章节正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '找到提到玉佩的章节，并补强伏笔')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(addMessage).toHaveBeenCalledWith(
      'assistant',
      expect.stringContaining('跨章节查找'),
      false,
      expect.objectContaining({
        kind: 'writer_retrieval_summary',
        targetDocumentId: 'chapter-2',
      }),
    )
    expect(getFirstApplyGeneratedPayload(wrapper)).toMatchObject({
      targetDocumentId: 'chapter-2',
      generatedText: '第二章补强后正文',
    })
    expect(vi.mocked(rewriteText).mock.calls[0]?.[3]).toContain('当前章节：第二章')
    expect(vi.mocked(rewriteText).mock.calls[0]?.[3]).toContain('第二章正文')
  })

  it('shows candidate selection meta for ambiguous cross-chapter search and resolves chosen chapter', async () => {
    mockListDocuments.mockResolvedValue({
      documents: [
        {
          documentId: 'chapter-1',
          title: '第一章',
          level: 0,
          order: 1,
          type: 'chapter',
          wordCount: 0,
        },
        {
          documentId: 'chapter-2',
          title: '第二章',
          level: 0,
          order: 2,
          type: 'chapter',
          wordCount: 0,
        },
      ],
    })
    mockSearchDocument.mockResolvedValue({
      query: '玉佩',
      totalMatches: 1,
      matches: [{ line: 1, startColumn: 1, endColumn: 2, text: '玉佩', before: [], after: [] }],
    })
    mockReadDocument.mockResolvedValue({
      documentId: 'chapter-2',
      version: 1,
      contentType: 'plain_text',
      totalLines: 1,
      lines: [{ line: 1, text: '第二章正文' }],
    })
    vi.mocked(rewriteText).mockResolvedValue({
      rewritten_text: '第二章改写后正文',
    } as never)

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前章节正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '找到提到玉佩的章节，并补强伏笔')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(addMessage).toHaveBeenCalledWith(
      'assistant',
      expect.stringContaining('命中了多个章节'),
      false,
      expect.objectContaining({
        kind: 'document_target_candidates',
        route: 'edit',
        candidates: [
          expect.objectContaining({
            documentId: 'chapter-1',
          }),
          expect.objectContaining({
            documentId: 'chapter-2',
          }),
        ],
      }),
    )

    wrapper.findComponent(AIChatMessagesStub).vm.$emit('select-document-target', {
      instruction: '找到提到玉佩的章节，并补强伏笔',
      route: 'edit',
      documentId: 'chapter-2',
      documentTitle: '第二章',
    })
    await flushPromises()

    expect(vi.mocked(rewriteText)).toHaveBeenCalledWith(
      'project-1',
      '第二章正文',
      'polish',
      expect.any(String),
    )
    expect(getFirstApplyGeneratedPayload(wrapper)).toMatchObject({
      targetDocumentId: 'chapter-2',
      targetDocumentTitle: '第二章',
      generatedText: '第二章改写后正文',
    })
  })

  it('keeps summarize intent in candidate flow instead of applying正文 diff', async () => {
    vi.mocked(summarizeText).mockResolvedValue({
      summary: '这一章主要呈现双方试探升级。',
      keyPoints: ['张三主动施压'],
    } as never)

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前整章正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '帮我总结一下这一章')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()
    await nextTick()

    expect(vi.mocked(summarizeText)).toHaveBeenCalledWith('当前整章正文', {
      projectId: 'project-1',
      summaryType: 'detailed',
    })
    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
    expect(vi.mocked(expandText)).not.toHaveBeenCalled()
  })

  it('clears current conversation from toolbar action', async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    )
    const wrapper = mountPanel()

    await wrapper.get('[data-testid="toolbar-clear"]').trigger('click')

    expect(clearHistory).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-testid="input-context"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-mode"]').text()).toBe('chat')
  })

  it('intercepts /doc list locally without calling AI', async () => {
    mockExecuteWriterDocumentCommand.mockResolvedValue({
      handled: true,
      userEcho: '/doc list',
      assistantMessage: '当前项目文档：\n- 第一章 [chapter] (chapter-1)',
    })

    const wrapper = mountPanel()
    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '/doc list')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(mockExecuteWriterDocumentCommand).toHaveBeenCalledWith('/doc list', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-1',
      currentDocumentTitle: '章节 chapter-1',
      currentSourceText: '',
    })
    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
    expect(vi.mocked(expandText)).not.toHaveBeenCalled()
    expect(addMessage).toHaveBeenNthCalledWith(
      2,
      'assistant',
      expect.stringContaining('当前项目文档'),
      false,
      undefined,
    )
  })

  it('emits applyGeneratedText when /doc patch returns a document diff payload', async () => {
    mockExecuteWriterDocumentCommand.mockResolvedValue({
      handled: true,
      userEcho: '/doc patch replace 2 => 第二行（改）',
      assistantMessage: '已生成正文 diff 预览',
      patchPayload: {
        action: 'rewrite',
        sourceText: '第一行\n第二行',
        generatedText: '第一行\n第二行（改）',
        applyMode: 'replace_document',
      },
    })

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '第一行\n第二行',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '/doc patch replace 2 => 第二行（改）')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(getFirstApplyGeneratedPayload(wrapper)).toEqual({
      action: 'rewrite',
      sourceText: '第一行\n第二行',
      generatedText: '第一行\n第二行（改）',
      applyMode: 'replace_document',
    })
    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
  })

  it('routes write quick actions into the chapter diff flow', async () => {
    vi.mocked(expandText).mockResolvedValue({
      expanded_text: '补完场景后的正文',
    } as never)

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前整章正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    await wrapper.get('[data-testid="quick-action-scene"]').trigger('click')
    await flushPromises()

    expect(vi.mocked(expandText)).toHaveBeenCalledWith(
      'project-1',
      '当前整章正文',
      expect.stringContaining('补一段场景描写'),
      undefined,
    )
    expect(getFirstApplyGeneratedPayload(wrapper)).toMatchObject({
      action: 'expand',
      sourceText: '当前整章正文',
      generatedText: '补完场景后的正文',
      applyMode: 'replace_document',
    })
  })

  it('keeps review quick actions in chat analysis without applying正文 diff', async () => {
    vi.mocked(chatWithAI).mockResolvedValue({
      reply: '必须修：章末钩子偏弱。',
    } as never)

    const wrapper = mountPanel()

    await wrapper.get('[data-testid="quick-action-chapterReview"]').trigger('click')
    await flushPromises()

    expect(vi.mocked(chatWithAI)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(chatWithAI).mock.calls[0]?.[0]).toContain('回审当前章节')
    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
    expect(vi.mocked(expandText)).not.toHaveBeenCalled()
    expect(wrapper.emitted('applyGeneratedText')).toBeUndefined()
  })
})
