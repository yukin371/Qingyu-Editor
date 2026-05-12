import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StructureStageView from '../StructureStageView.vue'

const mockWriterStore = {
  currentProjectId: 'project-1',
  error: '',
  outline: {
    loading: false,
    tree: [
      {
        id: 'node-1',
        title: '主线冲突',
        level: 1,
        order: 0,
        status: 'writing',
        description: '主角与反派第一次正面对抗。',
        documentId: 'chapter-1',
        children: [],
      },
    ],
  },
  setCurrentOutlineNode: vi.fn(),
  loadOutlineTree: vi.fn(async () => {}),
  updateOutlineNode: vi.fn(async () => {}),
  createOutlineNode: vi.fn(async () => {}),
  moveOutlineNode: vi.fn(async () => {}),
  deleteOutlineNode: vi.fn(async () => {}),
}

vi.mock('@/design-system/services', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
  messageBox: {
    confirm: vi.fn(async () => {}),
  },
}))

vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => mockWriterStore,
}))

vi.mock('@/modules/writer/utils/characterGraphDrafts', () => ({
  loadCharacterGraphDraftState: () => ({ chapterGraphs: [] }),
}))

vi.mock('@/modules/writer/utils/writerAssetRefs', () => ({
  loadWriterAssetRefState: () => ({
    chapterRefs: {
      'chapter-1': [{ assetType: 'character', assetId: 'char-1', assetName: '林舟' }],
    },
    volumeRefs: {},
  }),
  summarizeWriterAssetRefs: (refs: Array<unknown>) => ({
    total: refs.length,
  }),
}))

vi.mock('@/modules/writer/services/creativeWorkflow.service', () => ({
  loadCreativeWorkflow: () => ({
    version: 1,
    projectId: 'project-1',
    templateId: 'comeback',
    pitchLine: '一个被踩进泥里的主角，要在第三章先完成第一次反击。',
    targetAudience: ['喜欢高压反转', '期待明确兑现'],
    corePromises: ['第三章先打脸一次', '反派压制必须足够强'],
    paceContract: '前三章必须完成压制、转折、首次兑现。',
    goldenChapters: [
      {
        chapterNumber: 1,
        title: '屈辱现场',
        summary: '先建立读者共情和压制关系。',
        hook: '主角明明有底牌却暂时不能出手。',
        payoff: '埋下第一次反击信号。',
      },
      {
        chapterNumber: 2,
        title: '身份初显',
        summary: '让少数人先看到主角的真正价值。',
        hook: '制造信息差。',
        payoff: '转折开始形成。',
      },
      {
        chapterNumber: 3,
        title: '首次打脸',
        summary: '先兑现一轮小范围反击。',
        hook: '更大冲突抬头。',
        payoff: '完成第一针爽点。',
      },
    ],
    gate: {
      status: 'ready',
      missing: [],
      nextActions: [],
      completedFields: {
        hasPrimaryGenre: true,
        hasTargetAudience: true,
        hasCorePromises: true,
        hasPaceContract: true,
      },
    },
    createdAt: '2026-05-12T00:00:00.000Z',
    updatedAt: '2026-05-12T00:00:00.000Z',
  }),
  getCreativeWorkflowTemplate: () => ({
    id: 'comeback',
    name: '逆袭打脸',
  }),
}))

describe('StructureStageView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockWriterStore.outline.loading = false
    mockWriterStore.outline.tree = [
      {
        id: 'node-1',
        title: '主线冲突',
        level: 1,
        order: 0,
        status: 'writing',
        description: '主角与反派第一次正面对抗。',
        documentId: 'chapter-1',
        children: [],
      },
    ]
    mockWriterStore.loadOutlineTree.mockClear()
    mockWriterStore.setCurrentOutlineNode.mockClear()
  })

  it('默认层应折叠高级视图与筛选', async () => {
    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          FishboneOutlineBoard: { template: '<div />' },
          CanvasOutlineBoard: { template: '<div />' },
          BeatBoardPanel: { template: '<div />' },
          StructureInspectorPanel: { template: '<div />' },
          StructureNodeEditorDialog: { template: '<div />' },
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('结构舞台')
    expect(wrapper.text()).toContain('Stage 3 Handoff')
    expect(wrapper.text()).toContain('逆袭打脸')
    expect(wrapper.text()).toContain('首次打脸')
    expect(wrapper.text()).toContain('进入写作')
    expect(wrapper.find('[data-testid="structure-stage-default"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="structure-stage-default-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="structure-stage-advanced"]').exists()).toBe(false)
    expect(wrapper.find('.structure-search__input').exists()).toBe(false)
    expect(wrapper.find('.structure-stage-view__default-node-action.is-primary').text()).toContain(
      '进入写作',
    )

    await wrapper.get('.stage-secondary-action').trigger('click')

    expect(wrapper.find('[data-testid="structure-stage-default"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="structure-stage-advanced"]').exists()).toBe(true)
    expect(wrapper.findAll('.structure-filter-chip').map((chip) => chip.text())).toEqual([
      '全部',
      '已绑定',
      '待绑定',
      '当前章节',
      '推进中',
    ])
    expect(wrapper.find('[data-testid="structure-secondary-filter"]').exists()).toBe(true)
  })

  it('阶段 3 接力卡应把黄金三章上下文交给 AI', async () => {
    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '开篇冲突',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          FishboneOutlineBoard: { template: '<div />' },
          CanvasOutlineBoard: { template: '<div />' },
          BeatBoardPanel: { template: '<div />' },
          StructureInspectorPanel: { template: '<div />' },
          StructureNodeEditorDialog: { template: '<div />' },
        },
      },
    })

    await flushPromises()
    const aiActionButton = wrapper
      .findAll('.structure-stage-view__blueprint-action')
      .find((button) => button.text().includes('交给 AI 做蓝图建议'))
    expect(aiActionButton).toBeTruthy()
    await aiActionButton!.trigger('click')

    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0]).toMatchObject({
      source: 'workspace',
      action: 'add_to_chat',
      title: '蓝图接力：逆袭打脸',
    })
    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0].text).toContain('核心承诺：第三章先打脸一次')
    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0].text).toContain('第3章：首次打脸')
  })

  it('阶段 3 接力卡应能导入黄金三章为章节草案', async () => {
    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          FishboneOutlineBoard: { template: '<div />' },
          CanvasOutlineBoard: { template: '<div />' },
          BeatBoardPanel: { template: '<div />' },
          StructureInspectorPanel: { template: '<div />' },
          StructureNodeEditorDialog: { template: '<div />' },
        },
      },
    })

    await flushPromises()
    await wrapper.get('[data-testid="structure-blueprint-import"]').trigger('click')

    expect(wrapper.emitted('create-structure-plan')?.[0]?.[0]).toMatchObject({
      mode: 'chapter',
      prompt: '基于 逆袭打脸 导入黄金三章',
      importTarget: 'project-root',
      duplicateStrategy: 'skip_existing',
    })
    expect(wrapper.emitted('create-structure-plan')?.[0]?.[0].items).toHaveLength(3)
    expect(wrapper.emitted('create-structure-plan')?.[0]?.[0].items[0]).toMatchObject({
      title: '屈辱现场',
      summary: '先建立读者共情和压制关系。',
    })
  })

  it('存在当前卷时应默认导入当前卷', async () => {
    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        chapters: [
          {
            id: 'volume-1',
            projectId: 'project-1',
            chapterNum: 0,
            title: '第一卷',
            nodeType: 'directory',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
          {
            id: 'chapter-1',
            projectId: 'project-1',
            parentId: 'volume-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          FishboneOutlineBoard: { template: '<div />' },
          CanvasOutlineBoard: { template: '<div />' },
          BeatBoardPanel: { template: '<div />' },
          StructureInspectorPanel: { template: '<div />' },
          StructureNodeEditorDialog: { template: '<div />' },
        },
      },
    })

    await flushPromises()

    expect(
      (wrapper.get('[data-testid="structure-import-target"]').element as HTMLSelectElement).value,
    ).toBe('current-volume')
    expect(wrapper.text()).toContain('当前导入到：当前卷：第一卷')

    await wrapper.get('[data-testid="structure-blueprint-import"]').trigger('click')

    expect(wrapper.emitted('create-structure-plan')?.[0]?.[0]).toMatchObject({
      importTarget: 'current-volume',
      duplicateStrategy: 'skip_existing',
    })
  })

  it('当前节点已绑定章节时，顶部主动作应跳转到写作章节', async () => {
    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          FishboneOutlineBoard: { template: '<div />' },
          CanvasOutlineBoard: { template: '<div />' },
          BeatBoardPanel: { template: '<div />' },
          StructureInspectorPanel: { template: '<div />' },
          StructureNodeEditorDialog: { template: '<div />' },
        },
      },
    })

    await flushPromises()
    await wrapper.get('.focus-card__action--primary').trigger('click')

    expect(wrapper.emitted('jumpToChapter')?.[0]).toEqual(['chapter-1'])
  })

  it('未绑定节点在默认队列中应突出绑定当前章节动作', async () => {
    mockWriterStore.outline.tree = [
      {
        id: 'node-2',
        title: '第二幕转折',
        level: 1,
        order: 0,
        status: 'planned',
        description: '先把当前章节落到结构节点。',
        documentId: '',
        children: [],
      },
    ]

    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          FishboneOutlineBoard: { template: '<div />' },
          CanvasOutlineBoard: { template: '<div />' },
          BeatBoardPanel: { template: '<div />' },
          StructureInspectorPanel: { template: '<div />' },
          StructureNodeEditorDialog: { template: '<div />' },
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('绑定当前章节')
    expect(wrapper.find('.structure-stage-view__default-node-action.is-primary').exists()).toBe(
      false,
    )
  })

  it('默认推进队列应优先展示高优先级节点，并把剩余节点下沉到高级控制', async () => {
    mockWriterStore.outline.tree = [
      {
        id: 'node-1',
        title: '当前章节节点',
        level: 1,
        order: 1,
        status: 'draft',
        description: '和当前章节绑定',
        documentId: 'chapter-1',
        children: [],
      },
      {
        id: 'node-2',
        title: '推进中节点',
        level: 1,
        order: 2,
        status: 'writing',
        description: '推进中',
        documentId: '',
        children: [],
      },
      {
        id: 'node-3',
        title: '已绑定节点 A',
        level: 1,
        order: 3,
        status: 'planned',
        description: '已绑定其他章节',
        documentId: 'chapter-2',
        children: [],
      },
      {
        id: 'node-4',
        title: '已绑定节点 B',
        level: 1,
        order: 4,
        status: 'planned',
        description: '已绑定其他章节',
        documentId: 'chapter-3',
        children: [],
      },
      {
        id: 'node-5',
        title: '草稿节点 A',
        level: 1,
        order: 5,
        status: 'planned',
        description: '普通草稿',
        documentId: '',
        children: [],
      },
      {
        id: 'node-6',
        title: '草稿节点 B',
        level: 1,
        order: 6,
        status: 'planned',
        description: '普通草稿',
        documentId: '',
        children: [],
      },
    ]

    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
          {
            id: 'chapter-2',
            projectId: 'project-1',
            chapterNum: 2,
            title: '第二章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
          {
            id: 'chapter-3',
            projectId: 'project-1',
            chapterNum: 3,
            title: '第三章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          FishboneOutlineBoard: { template: '<div />' },
          CanvasOutlineBoard: { template: '<div />' },
          BeatBoardPanel: { template: '<div />' },
          StructureInspectorPanel: { template: '<div />' },
          StructureNodeEditorDialog: { template: '<div />' },
        },
      },
    })

    await flushPromises()

    const queueNodes = wrapper.findAll('.structure-stage-view__default-node')
    expect(queueNodes).toHaveLength(5)
    expect(wrapper.text()).toContain('其余 1 个节点已下沉到高级控制')
    expect(wrapper.text()).toContain('当前章节节点')
    expect(wrapper.text()).not.toContain('草稿节点 B')
  })

  it('结构检视里的全局资产入口应透传到 overlay 工具切换', async () => {
    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          FishboneOutlineBoard: { template: '<div />' },
          CanvasOutlineBoard: { template: '<div />' },
          BeatBoardPanel: { template: '<div />' },
          StructureInspectorPanel: {
            template:
              '<button data-testid="inspector-open-assets" @click="$emit(\'switch-tool\', \'assets\')">资产</button>',
          },
          StructureNodeEditorDialog: { template: '<div />' },
        },
      },
    })

    await flushPromises()
    await wrapper.get('[data-testid="inspector-open-assets"]').trigger('click')

    expect(wrapper.emitted('switch-tool')?.[0]).toEqual(['assets'])
  })
})
