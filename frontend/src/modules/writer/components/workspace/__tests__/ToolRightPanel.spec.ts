import { computed, nextTick, ref } from 'vue'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ToolRightPanel from '../ToolRightPanel.vue'

const dividerActive = ref(false)
const startListResize = vi.fn()

vi.mock('@/modules/writer/composables/useToolRightPanel', () => ({
  useToolRightPanel: () => ({
    activeConfig: computed(() => ({ mode: 'split', label: '设定' })),
    showListPanel: computed(() => true),
    listWidth: computed(() => 220),
    isResizingList: dividerActive,
    attachDetailPanel: vi.fn(),
    startListResize,
  }),
}))

vi.mock('@/modules/writer/composables/useWriterAssetCatalog', () => ({
  useWriterAssetCatalog: () => ({
    loading: ref(false),
    categoryOptions: ref([]),
    filteredAssets: ref([]),
    emptyMessage: ref('暂无设定'),
    selectedAsset: ref(null),
    selectedDetailFields: ref([]),
    selectedStateFields: ref([]),
    selectedDataHint: ref(''),
    selectAsset: vi.fn(),
    buildGraphFocusTarget: vi.fn(),
  }),
}))

vi.mock('@/modules/writer/composables/useToolOverlay', () => ({
  useToolOverlay: () => ({
    openFromRightPanel: vi.fn(),
  }),
}))

const baseProps = {
  activeTool: 'assets' as const,
  projectId: 'project-1',
  chapterId: 'chapter-1',
  chapterTitle: '第一章',
  chapters: [],
  sourceText: '正文',
  aiActionTrigger: null,
  aiApplyFeedback: null,
  workflowContext: {
    signature: 'chapter-1',
    projectId: 'project-1',
    chapterId: 'chapter-1',
    chapterTitle: '第一章',
    scopeLabel: '第一场',
    activeCharacters: [],
    activeRelations: [],
    pendingChangeRequests: [],
    pendingChangeRequestCount: 0,
  },
  draftProposals: [],
}

describe('ToolRightPanel', () => {
  beforeEach(() => {
    dividerActive.value = false
    startListResize.mockClear()
  })

  const mountPanel = () =>
    mount(ToolRightPanel, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
          AssetListPanel: { template: '<div data-testid="asset-list-panel" />' },
          AssetDetailPanel: { template: '<div data-testid="asset-detail-panel" />' },
          AIChatPanel: true,
          ProofreadPanel: true,
          InspirationPanel: true,
        },
      },
    })

  it('renders the split divider with shared resize affordance metadata', () => {
    const wrapper = mountPanel()
    const divider = wrapper.get('.tool-right-panel__divider')

    expect(divider.attributes('role')).toBe('separator')
    expect(divider.attributes('aria-label')).toBe('调整右侧设定列表宽度')
    expect(wrapper.get('.tool-right-panel__list').attributes('style')).toContain('220px')
  })

  it('reflects active resize state on the divider', async () => {
    const wrapper = mountPanel()

    dividerActive.value = true
    await nextTick()

    expect(wrapper.get('.tool-right-panel__divider').classes()).toContain(
      'tool-right-panel__divider--active',
    )
  })

  it('forwards divider mousedown to the resize handler', async () => {
    const wrapper = mountPanel()

    await wrapper.get('.tool-right-panel__divider').trigger('mousedown')

    expect(startListResize).toHaveBeenCalledTimes(1)
  })
})
