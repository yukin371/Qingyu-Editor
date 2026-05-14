import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'

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

vi.mock('@/modules/writer/composables/useOrgTreeLayout', () => ({
  useOrgTreeLayout: () => ({
    flatNodes: { value: [selectedNode] },
    edges: { value: [] },
    contentWidth: { value: 800 },
    contentHeight: { value: 600 },
    isLinearMode: { value: false },
    findNode: (id: string) => (id === selectedNode.id ? selectedNode : null),
  }),
  getCategoryColor: () => '#4d79da',
  getCategoryBgColor: () => '#edf4ff',
  getCategoryLabel: () => '分支点',
  getCategoryIcon: () => 'Branch',
}))

import StoryBranchView from '../StoryBranchView.vue'

const CanvasCoreStub = defineComponent({
  name: 'CanvasCoreStub',
  expose: ['zoomToFit'],
  setup(_, { slots, expose }) {
    expose({ zoomToFit: vi.fn() })
    return () => h('div', [slots.default?.(), slots.toolbar?.(), slots.connections?.()])
  },
})

describe('StoryBranchView', () => {
  beforeEach(() => {
    writerStoreState.outline.tree = [selectedNode.outlineNode]
    loadOutlineTree.mockClear()
    setCurrentOutlineNode.mockClear()
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
          CanvasCore: CanvasCoreStub,
          SystemStatCard: { template: '<div />' },
        },
      },
    })

    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('当前资产')
    expect(wrapper.text()).toContain('角色 1')
    expect(wrapper.text()).toContain('地点 1')
    await wrapper.get('[data-testid="branch-send-to-ai"]').trigger('click')

    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0]).toMatchObject({
      source: 'workspace',
      action: 'add_to_chat',
      title: '故事分支分析：支线转折点',
    })
    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0].text).toContain('当前章节：第一章')
    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0].text).toContain(
      '当前活跃实体：角色：林舟（迟疑）；地点：城门口',
    )
    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0].text).toContain(
      '节点描述：主角决定是否接受任务',
    )
  })

  it('长篇分支视图应按 50 节点分段，并提供定位入口', async () => {
    writerStoreState.outline.tree = Array.from({ length: 120 }, (_, index) => ({
      id: `node-${index + 1}`,
      title: `第${index + 1}章节点`,
      description: `第${index + 1}章分支`,
      level: 1,
      order: index,
      status: 'draft',
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
          CanvasCore: CanvasCoreStub,
          SystemStatCard: { template: '<div />' },
        },
      },
    })

    expect(wrapper.text()).not.toContain('普通小说模式')
    expect(wrapper.findAll('.story-branch-view__segment').map((segment) => segment.text())).toEqual(
      [
        expect.stringContaining('第 1-50 节点'),
        expect.stringContaining('第 51-100 节点'),
        expect.stringContaining('第 101-120 节点'),
      ],
    )

    await wrapper.get('.story-branch-view__locator input').setValue('第115章节点')
    await wrapper.get('.story-branch-view__locator button').trigger('click')

    expect(wrapper.text()).toContain('第 101-120 节点')
    expect(setCurrentOutlineNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'node-115', title: '第115章节点' }),
    )
  })
})
