import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StoryHarnessPanel from '../StoryHarnessPanel.vue'
import { useStoryHarnessStore } from '@/modules/writer/stores/v3/storyHarnessStore'

describe('StoryHarnessPanel', () => {
  it('点击建议队列入口后应打开 Change Request 抽屉', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.hydrateSavedBatch = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: '张三开始怀疑李四。',
        chapterCount: 12,
        scopeLabel: '第一章 / 当前章节',
        activeCharacters: [
          { id: 'char-1', name: '张三', traits: ['热血'], currentState: '怀疑中' },
        ],
        activeRelations: [],
        changeRequests: [
          {
            id: 'cr-1',
            source: 'live',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为怀疑或动摇',
            reason: '这类变化适合先作为 Change Request 预览。',
            evidence: '张三开始怀疑李四。',
            severity: 'focus',
          },
        ],
        handleTriggerIndex: vi.fn().mockResolvedValue(undefined),
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: {
            props: ['modelValue', 'changeRequests', 'handleChangeRequestDecision'],
            template:
              '<div data-testid="story-harness-drawer-stub" :data-open="String(modelValue)" :data-count="changeRequests.length" />',
          },
          StoryHarnessReviewPacketDrawer: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="story-harness-drawer-stub"]').attributes('data-open')).toBe(
      'false',
    )
    await wrapper.get('[data-testid="story-harness-open-change-requests"]').trigger('click')
    expect(wrapper.get('[data-testid="story-harness-drawer-stub"]').attributes('data-open')).toBe(
      'true',
    )
  })

  it('点击审查包入口后应打开 Review Packet 抽屉并传入聚合上下文', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.hydrateSavedBatch = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: '张三开始怀疑李四。',
        chapterCount: 12,
        scopeLabel: '第一章 / 当前章节',
        activeCharacters: [
          { id: 'char-1', name: '张三', traits: ['热血'], currentState: '怀疑中' },
        ],
        activeRelations: [
          { id: 'rel-1', fromName: '张三', toName: '李四', type: '互相试探', strength: 60 },
        ],
        changeRequests: [
          {
            id: 'cr-1',
            source: 'live',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为怀疑或动摇',
            reason: '这类变化适合先作为 Change Request 预览。',
            evidence: '张三开始怀疑李四。',
            severity: 'focus',
          },
        ],
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: true,
          StoryHarnessReviewPacketDrawer: {
            props: [
              'modelValue',
              'chapterTitle',
              'content',
              'activeCharacters',
              'activeRelations',
              'changeRequests',
            ],
            template:
              '<div data-testid="story-harness-review-packet-stub" :data-open="String(modelValue)" :data-title="chapterTitle" :data-content-length="content.length" :data-character-count="activeCharacters.length" :data-relation-count="activeRelations.length" :data-request-count="changeRequests.length" />',
          },
        },
      },
    })

    const drawer = wrapper.get('[data-testid="story-harness-review-packet-stub"]')
    expect(drawer.attributes('data-open')).toBe('false')

    await wrapper.get('[data-testid="story-harness-open-review-packet"]').trigger('click')

    expect(drawer.attributes('data-open')).toBe('true')
    expect(drawer.attributes('data-title')).toBe('第一章')
    expect(drawer.attributes('data-content-length')).toBe('9')
    expect(drawer.attributes('data-character-count')).toBe('1')
    expect(drawer.attributes('data-relation-count')).toBe('1')
    expect(drawer.attributes('data-request-count')).toBe('1')
  })

  it('显示 Workflow Gate 检查点并从 gate 动作打开对应面板', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.hydrateSavedBatch = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: '张三开始怀疑李四。',
        chapterCount: 12,
        activeCharacters: [
          { id: 'char-1', name: '张三', traits: ['热血'], currentState: '怀疑中' },
        ],
        activeRelations: [],
        changeRequests: [
          {
            id: 'cr-1',
            source: 'live',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为怀疑或动摇',
            reason: '这类变化适合先作为 Change Request 预览。',
            evidence: '张三开始怀疑李四。',
            severity: 'focus',
          },
        ],
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: {
            props: ['modelValue'],
            template:
              '<div data-testid="story-harness-drawer-stub" :data-open="String(modelValue)" />',
          },
          StoryHarnessReviewPacketDrawer: {
            props: ['modelValue'],
            template:
              '<div data-testid="story-harness-review-packet-stub" :data-open="String(modelValue)" />',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('门槛')

    expect(wrapper.get('[data-testid="story-harness-workflow-gate-panel"]').text()).toContain(
      '需审查',
    )
    expect(wrapper.get('[data-testid="story-harness-gate-revision"]').text()).toContain('重点建议')

    await wrapper.get('[data-testid="story-harness-gate-open-review-packet"]').trigger('click')
    expect(
      wrapper.get('[data-testid="story-harness-review-packet-stub"]').attributes('data-open'),
    ).toBe('true')

    await wrapper.get('[data-testid="story-harness-gate-open-change-requests"]').trigger('click')
    expect(wrapper.get('[data-testid="story-harness-drawer-stub"]').attributes('data-open')).toBe(
      'true',
    )
  })

  it('点击生成建议按钮后应调用手动索引入口', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const handleTriggerIndex = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: '张三开始怀疑李四。',
        chapterCount: 12,
        changeRequests: [],
        handleTriggerIndex,
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: true,
          StoryHarnessReviewPacketDrawer: true,
        },
      },
    })

    await wrapper.get('[data-testid="story-harness-trigger-index"]').trigger('click')
    expect(handleTriggerIndex).toHaveBeenCalledTimes(1)
  })

  it('点击交给 AI 后应发出标准工作流事件', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.hydrateSavedBatch = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: '张三开始怀疑李四。',
        chapterCount: 12,
        changeRequests: [
          {
            id: 'cr-1',
            source: 'live',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为怀疑或动摇',
            reason: '这类变化适合先作为 Change Request 预览。',
            evidence: '张三开始怀疑李四。',
            severity: 'focus',
          },
        ],
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: true,
          StoryHarnessReviewPacketDrawer: true,
        },
      },
    })

    await wrapper.get('[data-testid="story-harness-send-primary-to-ai"]').trigger('click')

    const aiEvents = wrapper.emitted('trigger-ai-action') as unknown[][] | undefined
    const aiPayload = aiEvents?.[0]?.[0] as { text?: string } | undefined
    expect(aiPayload).toMatchObject({
      source: 'story_harness',
      action: 'add_to_chat',
      title: '角色状态可能需要更新：张三',
      instructions: expect.stringContaining('Change Request'),
    })
    expect(aiPayload?.text).toContain(
      '变更建议：角色状态可能需要更新：张三',
    )
    expect(aiPayload?.text).toContain(
      '证据：张三开始怀疑李四。',
    )
  })

  it('renders simplified header with writing state label', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.hydrateSavedBatch = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: 'test',
        chapterCount: 5,
        changeRequests: [],
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: true,
          StoryHarnessReviewPacketDrawer: true,
        },
      },
    })

    expect(wrapper.text()).toContain('审查')
    expect(wrapper.text()).not.toContain('Phase 1')
  })

  it('在顶部摘要中显示多类型实体统计', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.hydrateSavedBatch = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: '张三在云港找到青铜钥匙，并意识到预言成真。',
        chapterCount: 5,
        entityStats: {
          characters: 2,
          locations: 1,
          items: 1,
          concepts: 1,
        },
        activeCharacters: [{ id: 'char-1', name: '张三', traits: ['谨慎'], currentState: '警惕' }],
        activeRelations: [
          { id: 'rel-1', fromName: '张三', toName: '李四', type: '朋友', strength: 80 },
        ],
        changeRequests: [
          {
            id: 'cr-1',
            source: 'live',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为警惕',
            reason: '正文出现明显情绪变化。',
            severity: 'focus',
          },
        ],
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: true,
          StoryHarnessReviewPacketDrawer: true,
        },
      },
    })

    expect(wrapper.text()).toContain('角色 2')
    expect(wrapper.text()).toContain('地点 1')
    expect(wrapper.text()).toContain('物件 1')
    expect(wrapper.text()).toContain('概念 1')
    expect(wrapper.text()).toContain('关系 1')
    expect(wrapper.text()).toContain('待 1')
  })

  it('renders compressed save batch receipt', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.hydrateSavedBatch = vi.fn().mockResolvedValue(undefined)
    harnessStore.savedBatchReceipt = {
      chapterId: 'chapter-1',
      chapterTitle: '第一章',
      count: 3,
      committedAt: new Date('2026-04-08T14:30:00').getTime(),
    }

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: 'test',
        chapterCount: 5,
        changeRequests: [
          {
            id: 'cr-batch-1',
            source: 'save_batch',
            type: 'state',
            title: '张三状态可能需要更新',
            summary: '从冷静转为愤怒',
            reason: '正文证据显示情绪变化',
            evidence: '张三猛地拍了一下桌子。',
            severity: 'focus',
          },
        ],
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: true,
          StoryHarnessReviewPacketDrawer: true,
        },
      },
    })

    expect(wrapper.text()).toContain('冻结 3 条')
    expect(wrapper.text()).not.toContain('保存回执')
  })

  it('shows compressed empty state when no change requests', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.hydrateSavedBatch = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: 'test',
        chapterCount: 5,
        changeRequests: [],
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: true,
          StoryHarnessReviewPacketDrawer: true,
        },
      },
    })

    expect(wrapper.text()).toContain('保存后自动生成')
    expect(wrapper.text()).not.toContain('当前还没有正式建议')
  })
})
