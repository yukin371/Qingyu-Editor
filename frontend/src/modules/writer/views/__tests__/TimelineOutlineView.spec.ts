import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

const loadTimelines = vi.fn().mockResolvedValue(undefined)
const loadTimelineEvents = vi.fn().mockResolvedValue(undefined)
const setCurrentTimeline = vi.fn()

const writerStoreState = {
  currentProjectId: 'project-1',
  timeline: {
    list: [{ id: 'timeline-1', name: '主线', description: '第一卷主线' }],
    events: [
      {
        id: 'event-1',
        title: '亚伯收到劝退任务',
        description: '新的 KPI 任务下发',
        importance: 9,
        eventType: 'mission',
        storyTime: { year: 1, month: 1, day: 1 },
      },
    ],
    currentTimeline: { id: 'timeline-1', name: '主线', description: '第一卷主线' },
  },
  loadTimelines,
  loadTimelineEvents,
  setCurrentTimeline,
}

vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => writerStoreState,
}))

import TimelineOutlineView from '../TimelineOutlineView.vue'

const ElButtonStub = defineComponent({
  name: 'ElButtonStub',
  emits: ['click'],
  setup(_, { emit, slots, attrs }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          onClick: () => emit('click'),
        },
        slots.default?.(),
      )
  },
})

const ElTagStub = defineComponent({
  name: 'ElTagStub',
  setup(_, { slots }) {
    return () => h('span', slots.default?.())
  },
})

describe('TimelineOutlineView', () => {
  beforeEach(() => {
    loadTimelines.mockClear()
    loadTimelineEvents.mockClear()
    setCurrentTimeline.mockClear()
  })

  it('时间线事件应支持交给 AI', async () => {
    const wrapper = mount(TimelineOutlineView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        activeEntities: [
          { id: 'char-1', name: '亚伯', type: 'character', summary: '犹豫' },
          { id: 'item-1', name: '劝退任务书', type: 'item' },
        ],
        workflowContext: {
          signature: 'ctx-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一幕 / 城门口',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
      },
      global: {
        stubs: {
          ElButton: ElButtonStub,
          ElTag: ElTagStub,
          QyIcon: { template: '<span />' },
          Empty: { template: '<div />' },
          SystemStatCard: { template: '<div />' },
        },
      },
    })

    await wrapper.get('[data-testid="timeline-send-to-ai"]').trigger('click')

    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0]).toMatchObject({
      source: 'workspace',
      action: 'add_to_chat',
      title: '时间线事件分析：亚伯收到劝退任务',
    })
    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0].text).toContain('所属时间线：主线')
    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0].text).toContain('当前章节：第一章')
    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0].text).toContain(
      '当前活跃实体：角色：亚伯（犹豫）；物品：劝退任务书',
    )
  })
})
