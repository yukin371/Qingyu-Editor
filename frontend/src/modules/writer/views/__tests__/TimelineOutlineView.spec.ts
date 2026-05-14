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
        chapterIds: ['chapter-1'],
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

vi.mock('@/modules/writer/utils/writerAssetRefs', () => ({
  WRITER_ASSET_REFS_UPDATED_EVENT: 'qingyu:writer-asset-refs-updated',
  loadWriterAssetRefState: () => ({
    chapterRefs: {},
    volumeRefs: {},
  }),
  buildWriterAssetSummaryByChapterId: () => ({
    'chapter-1': {
      total: 2,
      characters: 1,
      locations: 0,
      items: 1,
      organizations: 0,
      concepts: 0,
    },
    'chapter-80': {
      total: 1,
      characters: 1,
      locations: 0,
      items: 0,
      organizations: 0,
      concepts: 0,
    },
  }),
  buildWriterAssetSummaryItems: (summary: {
    characters: number
    locations: number
    items: number
    organizations: number
    concepts: number
  }) =>
    [
      summary.characters ? { type: 'character', label: '角色', count: summary.characters } : null,
      summary.locations ? { type: 'location', label: '地点', count: summary.locations } : null,
      summary.items ? { type: 'item', label: '物品', count: summary.items } : null,
      summary.organizations
        ? { type: 'organization', label: '组织', count: summary.organizations }
        : null,
      summary.concepts ? { type: 'concept', label: '概念', count: summary.concepts } : null,
    ].filter(Boolean),
}))

import TimelineOutlineView from '../TimelineOutlineView.vue'

const QyButtonStub = defineComponent({
  name: 'QyButtonStub',
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

const QyTagStub = defineComponent({
  name: 'QyTagStub',
  setup(_, { slots }) {
    return () => h('span', slots.default?.())
  },
})

describe('TimelineOutlineView', () => {
  beforeEach(() => {
    writerStoreState.timeline.events = [
      {
        id: 'event-1',
        title: '亚伯收到劝退任务',
        description: '新的 KPI 任务下发',
        importance: 9,
        eventType: 'mission',
        storyTime: { year: 1, month: 1, day: 1 },
        chapterIds: ['chapter-1'],
      },
    ]
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
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            wordCount: 1200,
            updatedAt: '2026-04-14T00:00:00.000Z',
            status: 'draft',
            nodeType: 'chapter',
          },
        ],
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
          QyButton: QyButtonStub,
          QyTag: QyTagStub,
          QyIcon: { template: '<span />' },
          Empty: { template: '<div />' },
          SystemStatCard: { template: '<div />' },
        },
      },
    })

    expect(wrapper.text()).toContain('角色 1')
    expect(wrapper.text()).toContain('物品 1')
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

  it('长篇事件轴应按 50 事件分段，并只显示当前章节附近窗口', async () => {
    writerStoreState.timeline.events = Array.from({ length: 120 }, (_, index) => ({
      id: `event-${index + 1}`,
      title: `第${index + 1}个事件`,
      description: `第${index + 1}个事件描述`,
      importance: index === 79 ? 9 : 4,
      eventType: 'plot',
      storyTime: { year: 1, month: 1, day: index + 1 },
      chapterIds: index === 79 ? ['chapter-80'] : [`chapter-${index + 1}`],
    }))

    const wrapper = mount(TimelineOutlineView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-80',
        chapterTitle: '第80章',
        chapters: [
          {
            id: 'chapter-80',
            projectId: 'project-1',
            chapterNum: 80,
            title: '第80章',
            wordCount: 1200,
            updatedAt: '2026-04-14T00:00:00.000Z',
            status: 'draft',
            nodeType: 'chapter',
          },
        ],
      },
      global: {
        stubs: {
          QyButton: QyButtonStub,
          QyTag: QyTagStub,
          QyIcon: { template: '<span />' },
          Empty: { template: '<div />' },
          SystemStatCard: { template: '<div />' },
        },
      },
    })

    expect(wrapper.text()).not.toContain('聚焦关键事件与节奏推进')
    expect(wrapper.findAll('.timeline-events__segment').map((segment) => segment.text())).toEqual([
      expect.stringContaining('第 1-50 事件'),
      expect.stringContaining('第 51-100 事件'),
      expect.stringContaining('第 101-120 事件'),
    ])
    expect(wrapper.text()).toContain('#60-#100')
    expect(wrapper.text()).toContain('第60个事件')
    expect(wrapper.text()).toContain('第100个事件')
    expect(wrapper.text()).not.toContain('第59个事件')
    expect(wrapper.text()).not.toContain('第101个事件')

    await wrapper.findAll('.timeline-events__segment')[2].trigger('click')

    expect(wrapper.text()).toContain('#101-#120')
    expect(wrapper.text()).toContain('第101个事件')
    expect(wrapper.text()).toContain('第120个事件')
  })

  it('时间线定位应跳转到命中事件所在区段', async () => {
    writerStoreState.timeline.events = Array.from({ length: 120 }, (_, index) => ({
      id: `event-${index + 1}`,
      title: `第${index + 1}个事件`,
      description: `第${index + 1}个事件描述`,
      importance: 4,
      eventType: 'plot',
      storyTime: { year: 1, month: 1, day: index + 1 },
      chapterIds: [`chapter-${index + 1}`],
    }))

    const wrapper = mount(TimelineOutlineView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第1章',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第1章',
            wordCount: 1200,
            updatedAt: '2026-04-14T00:00:00.000Z',
            status: 'draft',
            nodeType: 'chapter',
          },
        ],
      },
      global: {
        stubs: {
          QyButton: QyButtonStub,
          QyTag: QyTagStub,
          QyIcon: { template: '<span />' },
          Empty: { template: '<div />' },
          SystemStatCard: { template: '<div />' },
        },
      },
    })

    await wrapper.get('.timeline-events__locator input').setValue('第115个事件')
    await wrapper.get('.timeline-events__locator > button').trigger('click')

    expect(wrapper.text()).toContain('#101-#120')
    expect(wrapper.find('.timeline-event.is-selected').text()).toContain('第115个事件')
  })
})
