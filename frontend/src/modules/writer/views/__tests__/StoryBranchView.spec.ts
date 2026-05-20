import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

const selectedNode = {
  id: 'node-1',
  title: '支线转折点',
  category: 'branch-point',
  status: 'draft',
  level: 2,
  x: 0,
  y: 0,
  width: 220,
  height: 80,
  children: [],
  outlineNode: {
    id: 'node-1',
    title: '支线转折点',
    description: '主角决定是否接受任务',
    wordCount: 1200,
    children: [],
  },
}

const loadOutlineTree = vi.fn().mockResolvedValue(undefined)
const setCurrentOutlineNode = vi.fn()

const writerStoreState = {
  currentProjectId: 'project-1',
  outline: {
    tree: [selectedNode.outlineNode],
    loading: false,
  },
  loadOutlineTree,
  setCurrentOutlineNode,
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
      locations: 1,
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

import StoryBranchView from '../StoryBranchView.vue'

describe('StoryBranchView', () => {
  beforeEach(() => {
    writerStoreState.outline.tree = [selectedNode.outlineNode]
    loadOutlineTree.mockClear()
    setCurrentOutlineNode.mockClear()
    localStorage.clear()
    vi.stubGlobal('requestAnimationFrame', () => 0)
  })

  it('分支节点详情应支持交给 AI', async () => {
    const wrapper = mount(StoryBranchView, {
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
          { id: 'char-1', name: '林舟', type: 'character', summary: '迟疑' },
          { id: 'loc-1', name: '城门口', type: 'location' },
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
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div />' },
          SystemStatCard: { template: '<div />' },
        },
      },
    })

    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('角色 1')
    expect(wrapper.text()).toContain('地点 1')
    expect(wrapper.text()).toContain('互动分支')
    expect(wrapper.text()).toContain('轻量模式')
    await wrapper.get('[data-testid="branch-send-to-ai"]').trigger('click')

    const aiEvents = wrapper.emitted('trigger-ai-action') as unknown[][] | undefined
    const aiPayload = aiEvents?.[0]?.[0] as { text?: string } | undefined
    expect(aiPayload).toMatchObject({
      source: 'workspace',
      action: 'add_to_chat',
      title: '互动分支分析：支线转折点',
    })
    expect(aiPayload?.text).toContain('当前章节：第一章')
    expect(aiPayload?.text).toContain(
      '当前活跃实体：角色：林舟（迟疑）；地点：城门口',
    )
    expect(aiPayload?.text).toContain(
      '所属路线：支线转折点',
    )
  })

  it('真实项目没有分支时应支持切换示例分支数据', async () => {
    writerStoreState.outline.tree = [
      {
        id: 'linear-root',
        title: '第一卷',
        description: '线性主线',
        wordCount: 1000,
        order: 0,
        level: 1,
        status: 'writing',
        children: [
          {
            id: 'linear-chapter-1',
            title: '第一章',
            description: '线性推进',
            wordCount: 1000,
            order: 0,
            level: 2,
            status: 'writing',
            children: [],
          },
        ],
      },
    ] as any

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    expect(wrapper.text()).toContain('查看示例')

    await wrapper.get('button').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('返回项目')
    expect(wrapper.text()).toContain('雨夜抉择')
    expect(wrapper.text()).toContain('先救人')
    expect(wrapper.text()).toContain('来自：第一卷 北门雨夜')
    expect(wrapper.text()).toContain('去向：先救人 / 先取钥匙 / 城门再会（汇合）')
    expect(wrapper.text()).toContain('主线')
    expect(wrapper.text()).toContain('活跃支线')
  })

  it('长篇互动分支视图应支持路线定位与节点聚焦', async () => {
    writerStoreState.outline.tree = Array.from({ length: 120 }, (_, index) => ({
      id: `node-${index + 1}`,
      title: `第${index + 1}章节点`,
      description: `第${index + 1}章分支`,
      level: 1,
      order: index,
      status: 'draft',
      wordCount: 0,
      children: [],
    }))

    const wrapper = mount(StoryBranchView, {
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
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div />' },
          SystemStatCard: { template: '<div />' },
        },
      },
    })

    expect(wrapper.text()).toContain('全部路线')
    expect(wrapper.text()).toContain('主线')

    await wrapper.get('.interactive-branch-view__locator input').setValue('第115章节点')
    await wrapper.get('.interactive-branch-view__locator button').trigger('click')

    expect(wrapper.text()).toContain('第115章节点')
    expect(wrapper.get('[data-testid="branch-locate-feedback"]').text()).toContain('命中：第115章节点')
    expect(setCurrentOutlineNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'node-115', title: '第115章节点' }),
    )
  })

  it('节点定位反馈应支持前往路线与清除', async () => {
    writerStoreState.outline.tree = []

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    const demoButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('查看示例'))
    await demoButton!.trigger('click')
    await nextTick()

    await wrapper.get('.interactive-branch-view__locator input').setValue('先取钥匙')
    await wrapper.get('.interactive-branch-view__locator button').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-testid="branch-locate-feedback"]').text()).toContain('命中：先取钥匙')
    await wrapper.get('[data-testid="branch-locate-open-route"]').trigger('click')
    await nextTick()

    expect(wrapper.get('.interactive-branch-view__route-summary').text()).toContain('先取钥匙')

    await wrapper.get('[data-testid="branch-locate-clear"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="branch-locate-feedback"]').exists()).toBe(false)
  })

  it('节点定位未命中时应显示失败反馈', async () => {
    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    await wrapper.get('.interactive-branch-view__locator input').setValue('不存在的分支')
    await wrapper.get('.interactive-branch-view__locator button').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-testid="branch-locate-feedback"]').text()).toContain(
      '未命中：不存在的分支',
    )
  })

  it('默认轻量模式应聚焦局部窗口而非全量顺序流', async () => {
    writerStoreState.outline.tree = [
      {
        id: 'root',
        title: '第一卷',
        description: '长篇主线',
        order: 0,
        level: 1,
        status: 'writing',
        children: Array.from({ length: 18 }, (_, index) => ({
          id: `chapter-${index + 1}`,
          title: `第${index + 1}章`,
          description: `第${index + 1}章内容`,
          order: index,
          level: 2,
          status: 'writing',
          children: [],
        })),
      },
    ] as any

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-10',
        chapterTitle: '第10章',
        chapters: [
          {
            id: 'chapter-10',
            projectId: 'project-1',
            chapterNum: 10,
            title: '第10章',
            wordCount: 2200,
            updatedAt: '2026-04-14T00:00:00.000Z',
            status: 'draft',
            nodeType: 'chapter',
          },
        ],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div />' },
          SystemStatCard: { template: '<div />' },
        },
      },
    })

    const cards = wrapper.findAll('.interactive-flow-card')
    expect(cards.length).toBeLessThan(18)
    expect(wrapper.get('.interactive-branch-view__focus-breadcrumb').text()).toContain('第10章')
    expect(wrapper.get('.interactive-branch-view__route-summary').text()).toContain('聚焦：第10章')
  })

  it('应显示轻量概览条并支持切换到目标分支', async () => {
    writerStoreState.outline.tree = []

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    const demoButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('查看示例'))
    expect(demoButton).toBeTruthy()
    await demoButton!.trigger('click')
    await nextTick()

    expect(wrapper.get('[data-testid="branch-overview"]').text()).toContain('先取钥匙')
    await wrapper.get('[data-testid="branch-overview-project-1-branch-key"]').trigger('click')
    await nextTick()

    expect(wrapper.get('.interactive-branch-view__route-summary').text()).toContain('先取钥匙')
    expect(wrapper.get('.interactive-branch-view__route-summary').text()).toContain('聚焦：先取钥匙')
  })

  it('概览条在大量路线下应默认收束并支持展开更多', async () => {
    writerStoreState.outline.tree = [
      {
        id: 'root',
        title: '第一卷',
        description: '主线',
        order: 0,
        level: 1,
        status: 'writing',
        children: [
          {
            id: 'chapter-1',
            title: '第一章',
            description: '铺垫',
            order: 0,
            level: 2,
            status: 'writing',
            documentId: 'chapter-1',
            children: [
              {
                id: 'choice-1',
                title: '雨夜抉择',
                description: '决定去向',
                order: 0,
                level: 3,
                status: 'writing',
                type: 'choice',
                children: Array.from({ length: 10 }, (_, index) => ({
                  id: `branch-overview-${index + 1}`,
                  title: `概览支线 ${index + 1}`,
                  description: `概览支线描述 ${index + 1}`,
                  order: index,
                  level: 4,
                  status: 'writing',
                  children: [],
                })),
              },
            ],
          },
        ],
      },
    ] as any

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    const overviewText = wrapper.get('[data-testid="branch-overview"]').text()
    expect(overviewText).toContain('其余 5 条')
    expect(overviewText).not.toContain('概览支线 10')

    await wrapper.get('[data-testid="branch-overview-more"]').trigger('click')
    await nextTick()

    const expandedOverviewText = wrapper.get('[data-testid="branch-overview"]').text()
    expect(expandedOverviewText).toContain('概览支线 10')
    expect(expandedOverviewText).toContain('收起概览')
  })

  it('搜索路线时概览条也应只保留命中结果', async () => {
    writerStoreState.outline.tree = []

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    const demoButton = wrapper.findAll('button').find((button) => button.text().includes('查看示例'))
    expect(demoButton).toBeTruthy()
    await demoButton!.trigger('click')
    await nextTick()

    await wrapper.get('input[name="interactive-branch-route-search"]').setValue('先取钥匙')
    await nextTick()

    const overviewText = wrapper.get('[data-testid="branch-overview"]').text()
    expect(overviewText).toContain('先取钥匙')
    expect(overviewText).not.toContain('先救人')
  })

  it('应允许在选中节点下新增本地分支草案', async () => {
    writerStoreState.outline.tree = [
      {
        id: 'linear-root',
        title: '第一卷',
        description: '线性主线',
        wordCount: 1000,
        order: 0,
        level: 1,
        status: 'writing',
        children: [
          {
            id: 'linear-chapter-1',
            title: '第一章',
            description: '线性推进',
            wordCount: 1000,
            order: 0,
            level: 2,
            status: 'writing',
            children: [],
          },
        ],
      },
    ] as any

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    await wrapper.get('button').trigger('click')
    await nextTick()

    const inputs = wrapper.findAll('.interactive-branch-detail__composer input')
    await inputs[0].setValue('新支线试探')
    await inputs[1].setValue('角色先试探对方态度。')
    await wrapper.get('.interactive-branch-detail__composer select').setValue('choice')
    await wrapper.get('[data-testid="branch-add-draft"]').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('新支线试探')
    expect(wrapper.text()).toContain('来自：互动分支示例')
  })

  it('应允许编辑、改挂载并删除本地分支草案', async () => {
    writerStoreState.outline.tree = [
      {
        id: 'linear-root',
        title: '第一卷',
        description: '线性主线',
        wordCount: 1000,
        order: 0,
        level: 1,
        status: 'writing',
        children: [
          {
            id: 'linear-chapter-1',
            title: '第一章',
            description: '线性推进',
            wordCount: 1000,
            order: 0,
            level: 2,
            status: 'writing',
            children: [],
          },
        ],
      },
    ] as any

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    await wrapper.get('button').trigger('click')
    await nextTick()

    const createInputs = wrapper.findAll('.interactive-branch-detail__composer input')
    await createInputs[0].setValue('待整理草案')
    await createInputs[1].setValue('先挂在根节点下。')
    await wrapper.get('[data-testid="branch-add-draft"]').trigger('click')
    await nextTick()

    await wrapper.get('input[name="interactive-branch-draft-edit-title"]').setValue('潜入前置条件')
    await wrapper
      .get('textarea[name="interactive-branch-draft-edit-description"]')
      .setValue('只有拿到暗号后才能进入潜入路线。')
    await wrapper.get('select[name="interactive-branch-draft-edit-type"]').setValue('condition')
    await wrapper.get('select[name="interactive-branch-draft-parent"]').setValue('project-1-branch-rescue')
    await wrapper.get('[data-testid="branch-save-draft"]').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('潜入前置条件')
    expect(wrapper.text()).toContain('只有拿到暗号后才能进入潜入路线。')
    expect(wrapper.text()).toContain('来自：先救人')

    await wrapper.get('[data-testid="branch-delete-draft"]').trigger('click')
    await nextTick()

    expect(wrapper.text()).not.toContain('潜入前置条件')
  })

  it('应按分组展示路线并支持折叠与搜索', async () => {
    writerStoreState.outline.tree = [
      {
        id: 'root',
        title: '第一卷',
        description: '主线',
        order: 0,
        level: 1,
        status: 'writing',
        children: [
          {
            id: 'chapter-1',
            title: '第一章',
            description: '铺垫',
            order: 0,
            level: 2,
            status: 'writing',
            documentId: 'chapter-1',
            children: [
              {
                id: 'choice-1',
                title: '雨夜抉择',
                description: '决定去向',
                order: 0,
                level: 3,
                status: 'writing',
                type: 'choice',
                children: [
                  {
                    id: 'branch-a',
                    title: '先救人',
                    description: '救人线',
                    order: 0,
                    level: 4,
                    status: 'writing',
                    children: [],
                  },
                  {
                    id: 'ending-a',
                    title: '直接离开',
                    description: '提前离场',
                    order: 1,
                    level: 4,
                    status: 'writing',
                    type: 'ending',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as any

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    expect(wrapper.text()).toContain('当前章节相关')
    expect(wrapper.text()).toContain('主线')
    expect(wrapper.text()).toContain('未回收')

    await wrapper.get('[data-testid="route-group-main"]').trigger('click')
    await nextTick()
    expect(wrapper.get('[data-testid="route-group-main"]').text()).toContain('展开')

    await wrapper.get('input[name="interactive-branch-route-search"]').setValue('直接离开')
    await nextTick()

    let routePanelText = wrapper.get('.interactive-branch-view__routes').text()
    expect(routePanelText).toContain('路线1')
    expect(routePanelText).not.toContain('先救人')

    await wrapper.get('[data-testid="route-group-ending"]').trigger('click')
    await nextTick()

    routePanelText = wrapper.get('.interactive-branch-view__routes').text()
    expect(routePanelText).toContain('直接离开')
  })

  it('大量支线时应默认收束路线窗口并支持展开更多', async () => {
    writerStoreState.outline.tree = [
      {
        id: 'root',
        title: '第一卷',
        description: '主线',
        order: 0,
        level: 1,
        status: 'writing',
        children: [
          {
            id: 'chapter-1',
            title: '第一章',
            description: '铺垫',
            order: 0,
            level: 2,
            status: 'writing',
            documentId: 'chapter-1',
            children: [
              {
                id: 'choice-1',
                title: '雨夜抉择',
                description: '决定去向',
                order: 0,
                level: 3,
                status: 'writing',
                type: 'choice',
                children: Array.from({ length: 10 }, (_, index) => ({
                  id: `branch-${index + 1}`,
                  title: `支线 ${index + 1}`,
                  description: `支线描述 ${index + 1}`,
                  order: index,
                  level: 4,
                  status: 'writing',
                  children: [],
                })),
              },
            ],
          },
        ],
      },
    ] as any

    const wrapper = mount(StoryBranchView, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
      },
      global: {
        stubs: {
          QyButton: { template: '<button><slot /></button>' },
          QyIcon: { template: '<span />' },
          Empty: { template: '<div><slot /></div>' },
        },
      },
    })

    await wrapper.get('[data-testid="route-group-ending"]').trigger('click')
    await nextTick()

    const routePanelText = wrapper.get('.interactive-branch-view__routes').text()
    expect(routePanelText).toContain('展开其余 4 条')
    expect(routePanelText).not.toContain('支线 10')

    await wrapper.get('[data-testid="route-group-more-ending"]').trigger('click')
    await nextTick()

    const expandedText = wrapper.get('.interactive-branch-view__routes').text()
    expect(expandedText).toContain('支线 10')
    expect(expandedText).toContain('收起更多')
  })
})
