import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import WorkspaceLeftPanel from '../WorkspaceLeftPanel.vue'

const mockWriterStore = {
  outline: {
    tree: [],
    loading: false,
  },
}

const mockOutlineTreeState = {
  selectedNodeId: ref(''),
  expandedNodeIds: ref<string[]>([]),
  canMoveUp: ref(false),
  canMoveDown: ref(false),
  toggleNode: vi.fn(),
  selectNode: vi.fn(),
  expandRootNodes: vi.fn(),
}

vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => mockWriterStore,
}))

vi.mock('@/modules/writer/composables/useOutlineTreeState', () => ({
  useOutlineTreeState: () => mockOutlineTreeState,
}))

vi.mock('@/modules/writer/utils/characterGraphDrafts', () => ({
  loadCharacterGraphDraftState: () => ({ chapterGraphs: [] }),
}))

vi.mock('@/modules/writer/utils/writerAssetRefs', () => ({
  WRITER_ASSET_REFS_UPDATED_EVENT: 'qingyu:writer-asset-refs-updated',
  loadWriterAssetRefState: () => ({
    chapterRefs: {},
    volumeRefs: {},
  }),
  buildWriterAssetSummaryByChapterId: () => ({}),
  summarizeWriterAssetRefs: (refs: Array<unknown>) => ({
    total: refs.length,
  }),
}))

function mountPanel(collapsed: boolean) {
  return mount(WorkspaceLeftPanel, {
    props: {
      collapsed,
      isImmersiveMode: false,
      projects: [],
      chapters: [],
      projectId: 'project-1',
      chapterId: 'chapter-1',
    },
    global: {
      stubs: {
        QyIcon: { template: '<span />' },
        ProjectSidebar: {
          emits: ['add-doc', 'add-volume'],
          template: `
            <div>
              <button data-testid="sidebar-add-doc" @click="$emit('add-doc')">add-doc</button>
              <button data-testid="sidebar-add-volume" @click="$emit('add-volume')">add-volume</button>
            </div>
          `,
        },
        OutlineTreePanel: { template: '<div />' },
      },
    },
  })
}

describe('WorkspaceLeftPanel', () => {
  beforeEach(() => {
    mockWriterStore.outline.tree = []
    mockWriterStore.outline.loading = false
    mockOutlineTreeState.selectedNodeId.value = ''
    mockOutlineTreeState.expandedNodeIds.value = []
    mockOutlineTreeState.toggleNode.mockClear()
    mockOutlineTreeState.selectNode.mockClear()
    mockOutlineTreeState.expandRootNodes.mockClear()
  })

  it('折叠态只直出结构舞台与资产总览，专业工具退回展开态', () => {
    const wrapper = mountPanel(true)

    expect(wrapper.find('[title="结构舞台"]').exists()).toBe(true)
    expect(wrapper.find('[title="资产总览"]').exists()).toBe(true)
    expect(wrapper.find('[title="关系图谱"]').exists()).toBe(false)
    expect(wrapper.find('[title="时间线"]').exists()).toBe(false)
    expect(wrapper.find('[title="故事分支"]').exists()).toBe(false)
    expect(wrapper.find('[title="显示左侧边栏"]').exists()).toBe(true)
  })

  it('展开态折叠按钮应明确表达隐藏左侧边栏', () => {
    const wrapper = mountPanel(false)

    expect(wrapper.find('[title="隐藏左侧边栏"]').exists()).toBe(true)
  })

  it('展开态通过工具菜单承接资产与专业工具入口', async () => {
    const wrapper = mountPanel(false)

    expect(wrapper.text()).toContain('结构舞台')
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)

    await wrapper.get('.more-btn').trigger('click')

    expect(wrapper.text()).toContain('资产总览')
    expect(wrapper.text()).toContain('专业工具')
    expect(wrapper.text()).toContain('关系图谱')
    expect(wrapper.text()).toContain('时间线')
    expect(wrapper.text()).toContain('故事分支')

    const relationItem = wrapper.findAll('.dropdown-item')[1]
    await relationItem.trigger('click')

    expect(wrapper.emitted('open-fullscreen-tool')?.[0]).toEqual(['relations'])
  })

  it('透传左栏的新建卷事件', async () => {
    const wrapper = mountPanel(false)

    await wrapper.get('[data-testid="sidebar-add-volume"]').trigger('click')

    expect(wrapper.emitted('add-volume')).toHaveLength(1)
  })
})
