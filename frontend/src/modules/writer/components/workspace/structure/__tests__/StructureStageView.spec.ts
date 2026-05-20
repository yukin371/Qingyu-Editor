import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import StructureStageView from '../StructureStageView.vue'

const emittedPayload = (wrapper: ReturnType<typeof mount>, eventName: string, index = 0) =>
  (wrapper.emitted(eventName) as unknown[][] | undefined)?.[index]?.[0]

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

vi.mock('@/modules/writer/utils/writerAssetRefs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/modules/writer/utils/writerAssetRefs')>()
  return {
    ...actual,
    loadWriterAssetRefState: () => ({
      chapterRefs: {
        'chapter-1': [{ assetType: 'character', assetId: 'char-1', assetName: '林舟' }],
      },
      volumeRefs: {},
    }),
    summarizeWriterAssetRefs: (refs: Array<unknown>) => ({
      total: refs.length,
    }),
  }
})

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
  buildCreativeWorkflowSnapshot: (record: {
    projectId: string
    templateId: string | null
    pitchLine: string
    targetAudience: string[]
    corePromises: string[]
    paceContract: string
    goldenChapters: Array<Record<string, unknown>>
    updatedAt: string
  } | null) => (record
    ? {
    projectId: record.projectId,
    templateId: record.templateId,
    templateName: '逆袭打脸',
    premise: record.pitchLine,
    targetAudience: record.targetAudience,
    corePromises: record.corePromises,
    paceContract: record.paceContract,
    goldenChapters: record.goldenChapters,
    updatedAt: record.updatedAt,
      }
    : null),
  buildCreativeWorkflowSummaryLines: (snapshot: {
    templateName: string
    premise: string
    targetAudience: string[]
    corePromises: string[]
    paceContract: string
    goldenChapters: Array<{
      chapterNumber: number
      title: string
      summary?: string
      hook?: string
      payoff?: string
    }>
  }) => [
    snapshot.templateName ? `题材模板：${snapshot.templateName}` : '',
    snapshot.premise ? `定位声明：${snapshot.premise}` : '',
    snapshot.targetAudience.length ? `目标读者：${snapshot.targetAudience.slice(0, 2).join(' / ')}` : '',
    snapshot.corePromises.length ? `核心承诺：${snapshot.corePromises.join('；')}` : '',
    snapshot.paceContract ? `节奏合约：${snapshot.paceContract}` : '',
    ...snapshot.goldenChapters.map((chapter) =>
      [
        `第${chapter.chapterNumber}章：${chapter.title}`,
        chapter.summary ? `目标：${chapter.summary}` : '',
        chapter.hook ? `钩子：${chapter.hook}` : '',
        chapter.payoff ? `兑现：${chapter.payoff}` : '',
      ]
        .filter(Boolean)
        .join(' | '),
    ),
  ].filter(Boolean),
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

  it('默认层应展示全书节奏表并折叠高级视图', async () => {
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
    expect(wrapper.text()).toContain('全书节奏表')
    expect(wrapper.text()).not.toContain('大多数规划都在这里完成')
    expect(wrapper.text()).not.toContain('用章节/情节点做主行')
    expect(wrapper.text()).not.toContain('蓝图输入')
    expect(wrapper.text()).toContain('逆袭打脸')
    expect(wrapper.text()).not.toContain('首次打脸')
    expect(wrapper.text()).toContain('写作')
    expect(wrapper.find('[data-testid="structure-stage-default"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="structure-stage-hub"]').text()).toContain('当前写作')
    expect(wrapper.get('[data-testid="structure-stage-hub"]').text()).toContain('第一章')
    expect(wrapper.get('[data-testid="structure-stage-hub"]').text()).toContain('当前大纲')
    expect(wrapper.get('[data-testid="structure-stage-hub"]').text()).toContain('主线冲突')
    expect(wrapper.get('[data-testid="structure-stage-hub"]').text()).toContain('节拍承诺')
    expect(wrapper.get('[data-testid="structure-stage-hub"]').text()).toContain('卷只定位窗口')
    expect(wrapper.find('[data-testid="structure-rhythm-board"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="structure-stage-default-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="structure-stage-advanced"]').exists()).toBe(false)
    expect(wrapper.find('.structure-search__input').exists()).toBe(false)
    expect(wrapper.find('.structure-stage-view__rhythm-action.is-primary').text()).toContain('写作')

    const hubAiButton = wrapper
      .findAll('.structure-stage-view__hub-actions button')
      .find((button) => button.text().includes('交给 AI 整理'))
    expect(hubAiButton).toBeTruthy()
    await hubAiButton!.trigger('click')
    const aiPayload = emittedPayload(wrapper, 'trigger-ai-action') as { text?: string } | undefined
    expect(aiPayload).toMatchObject({
      source: 'workspace',
      action: 'add_to_chat',
      title: '结构舞台：当前写作整理',
    })
    expect(aiPayload?.text).toContain('当前大纲节点：主线冲突')

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

    const aiPayload = emittedPayload(wrapper, 'trigger-ai-action') as { text?: string } | undefined
    expect(aiPayload).toMatchObject({
      source: 'workspace',
      action: 'add_to_chat',
      title: '蓝图接力：逆袭打脸',
    })
    expect(aiPayload?.text).toContain(
      '核心承诺：第三章先打脸一次',
    )
    expect(aiPayload?.text).toContain('第3章：首次打脸')
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

    const planPayload = emittedPayload(wrapper, 'create-structure-plan') as { items?: unknown[] } | undefined
    expect(planPayload).toMatchObject({
      mode: 'chapter',
      prompt: '基于 逆袭打脸 导入黄金三章',
      importTarget: 'project-root',
      duplicateStrategy: 'skip_existing',
    })
    expect(planPayload?.items).toHaveLength(3)
    expect(planPayload?.items?.[0]).toMatchObject({
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
    expect(wrapper.text()).not.toContain('导入位置')
    expect(wrapper.text()).not.toContain('重复策略')

    await wrapper.get('[data-testid="structure-blueprint-import"]').trigger('click')

    expect(emittedPayload(wrapper, 'create-structure-plan')).toMatchObject({
      importTarget: 'current-volume',
      duplicateStrategy: 'skip_existing',
    })
  })

  it('多卷结构应按当前章节所在卷展示卷内章节序号', async () => {
    mockWriterStore.outline.tree = [
      {
        id: 'node-1',
        title: '第一卷开局',
        level: 1,
        order: 0,
        status: 'planned',
        description: '',
        documentId: 'chapter-1',
        children: [],
      },
      {
        id: 'node-2',
        title: '第二卷开局',
        level: 1,
        order: 1,
        status: 'planned',
        description: '',
        documentId: 'chapter-2',
        children: [],
      },
    ]

    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-2',
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
            wordCount: 1000,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
          {
            id: 'volume-2',
            projectId: 'project-1',
            chapterNum: 0,
            title: '第二卷',
            nodeType: 'directory',
            wordCount: 0,
            updatedAt: '2026-04-13T00:00:00.000Z',
            status: 'draft',
          },
          {
            id: 'chapter-2',
            projectId: 'project-1',
            parentId: 'volume-2',
            chapterNum: 2,
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
    await nextTick()

    expect(wrapper.find('.structure-stage-view__segment-node.is-active').text()).toContain('第二卷')
    expect(wrapper.find('.structure-stage-view__window-range').text()).toContain(
      '第二卷 · 第 1 章',
    )
    expect(wrapper.find('.structure-stage-view__rhythm-order').text()).toContain(
      '第二卷 · 第 1 章',
    )
    expect(wrapper.find('.structure-stage-view__rhythm-order').text()).not.toContain('第 2 章')
  })

  it('当前章节已入纲时，表格写作动作应跳转到写作章节', async () => {
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
    await wrapper
      .get('.structure-stage-view__rhythm-action.is-primary')
      .trigger('click')

    expect(wrapper.emitted('jumpToChapter')?.[0]).toEqual(['chapter-1'])
  })

  it('未入纲章节在默认节奏表中仍应作为章节显示', async () => {
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

    expect(wrapper.text()).toContain('未入纲 1')
    expect(wrapper.find('.structure-stage-view__rhythm-action.is-primary').exists()).toBe(true)
  })

  it('全书节奏表应保持章节原始顺序，选中行不应跳到首行', async () => {
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

    const queueNodes = wrapper.findAll('.structure-stage-view__rhythm-title')
    expect(queueNodes).toHaveLength(3)
    expect(wrapper.text()).toContain('第一章')
    expect(queueNodes.map((node) => node.text())).toEqual([
      expect.stringContaining('第一章'),
      expect.stringContaining('第二章'),
      expect.stringContaining('第三章'),
    ])

    await wrapper.findAll('.structure-stage-view__rhythm-row')[1].trigger('click')

    expect(
      wrapper.findAll('.structure-stage-view__rhythm-title').map((node) => node.text()),
    ).toEqual([
      expect.stringContaining('第一章'),
      expect.stringContaining('第二章'),
      expect.stringContaining('第三章'),
    ])
  })

  it('点击章节卡只切换检视节点，不应重算当前章节附近窗口', async () => {
    mockWriterStore.outline.tree = Array.from({ length: 24 }, (_, index) => ({
      id: `node-${index + 1}`,
      projectId: 'project-1',
      title: `第${index + 1}章节点`,
      level: 1,
      order: index,
      status: 'planned',
      description: `第${index + 1}章节奏`,
      documentId: `chapter-${index + 1}`,
      children: [],
    }))

    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-12',
        currentChapterTitle: '第12章',
        chapters: Array.from({ length: 24 }, (_, index) => ({
          id: `chapter-${index + 1}`,
          projectId: 'project-1',
          chapterNum: index + 1,
          title: `第${index + 1}章`,
          nodeType: 'chapter' as const,
          wordCount: 1000,
          updatedAt: '2026-04-13T00:00:00.000Z',
          status: 'draft' as const,
        })),
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

    const beforeTitles = wrapper.findAll('.structure-stage-view__rhythm-title').map((node) => node.text())
    await wrapper.findAll('.structure-stage-view__rhythm-row')[0].trigger('click')

    expect(wrapper.findAll('.structure-stage-view__rhythm-title').map((node) => node.text())).toEqual(
      beforeTitles,
    )
  })

  it('结构舞台应明确节拍覆盖范围独立于卷窗口', async () => {
    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-2',
        currentChapterTitle: '第二章',
        sceneStage: {
          projectId: 'project-1',
          sceneId: 'scene-1',
          beatId: 'beat-1',
          chapterId: 'chapter-2',
          chapterTitle: '第二章',
          chapterIds: ['chapter-1', 'chapter-2'],
          chapterCount: 2,
          coverageLabel: '第一卷 第 28 章 - 第二卷 第 1 章',
          coverageChapterCount: 2,
          coverageOptions: [],
          currentChapterLinked: true,
          sceneTitle: '黑市脱身',
          beatTitle: '黑市脱身',
          goal: '完成跨卷逃脱与新地图承诺',
          conflict: '',
          beatStatus: 'active',
          doneCondition: '主角带着关键线索离开旧地图',
          assets: [],
          evidence: [],
          summaryLine: '黑市脱身',
          isEmpty: false,
          draft: {},
        },
        chapters: [
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

    const hubText = wrapper.get('[data-testid="structure-stage-hub"]').text()
    expect(hubText).toContain('黑市脱身')
    expect(hubText).toContain('覆盖章节：第一卷 第 28 章 - 第二卷 第 1 章')
    expect(hubText).toContain('卷只定位窗口，节拍可跨卷覆盖连续章节')
    expect(hubText).toContain('完成条件：主角带着关键线索离开旧地图')
  })

  it('长篇默认按 50 章分段，并只展示当前章节附近窗口', async () => {
    mockWriterStore.outline.tree = Array.from({ length: 120 }, (_, index) => ({
      id: `node-${index + 1}`,
      projectId: 'project-1',
      title: `第${index + 1}章节点`,
      level: 1,
      order: index,
      status: index === 79 ? 'writing' : 'planned',
      description: `第${index + 1}章节奏`,
      documentId: `chapter-${index + 1}`,
      children: [],
    }))

    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-80',
        currentChapterTitle: '第80章',
        chapters: Array.from({ length: 120 }, (_, index) => ({
          id: `chapter-${index + 1}`,
          projectId: 'project-1',
          chapterNum: index + 1,
          title: `第${index + 1}章`,
          nodeType: 'chapter' as const,
          wordCount: 1000,
          updatedAt: '2026-04-13T00:00:00.000Z',
          status: 'draft' as const,
        })),
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
      wrapper.findAll('.structure-stage-view__segment-node').map((node) => node.text()),
    ).toEqual([
      expect.stringContaining('第1章-第50章'),
      expect.stringContaining('第51章-第100章'),
      expect.stringContaining('第101章-第120章'),
    ])
    expect(wrapper.text()).toContain('第51章-第100章')
    expect(wrapper.text()).toContain('第 60 章-第 100 章')
    const windowTitles = wrapper.findAll('.structure-stage-view__rhythm-title').map((node) => node.text())
    expect(windowTitles).toEqual(
      expect.arrayContaining([
        expect.stringContaining('第76章'),
        expect.stringContaining('第80章'),
        expect.stringContaining('第84章'),
      ]),
    )
    expect(windowTitles).not.toEqual(expect.arrayContaining([expect.stringContaining('第60章')]))
    expect(windowTitles).not.toEqual(expect.arrayContaining([expect.stringContaining('第100章')]))

    await wrapper.findAll('.structure-stage-view__segment-node')[2].trigger('click')

    expect(wrapper.text()).toContain('第 101 章-第 120 章')
    expect(wrapper.text()).toContain('第101章')
    expect(wrapper.text()).toContain('第120章')
  })

  it('定位章节号时应切换到命中区段并选中目标行', async () => {
    mockWriterStore.outline.tree = Array.from({ length: 120 }, (_, index) => ({
      id: `node-${index + 1}`,
      projectId: 'project-1',
      title: `第${index + 1}章节点`,
      level: 1,
      order: index,
      status: 'planned',
      description: `第${index + 1}章节奏`,
      documentId: `chapter-${index + 1}`,
      children: [],
    }))

    const wrapper = mount(StructureStageView, {
      props: {
        projectId: 'project-1',
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第1章',
        chapters: Array.from({ length: 120 }, (_, index) => ({
          id: `chapter-${index + 1}`,
          projectId: 'project-1',
          chapterNum: index + 1,
          title: `第${index + 1}章`,
          nodeType: 'chapter' as const,
          wordCount: 1000,
          updatedAt: '2026-04-13T00:00:00.000Z',
          status: 'draft' as const,
        })),
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
    await wrapper.get('.structure-stage-view__locator-input input').setValue('115')
    await wrapper.get('.structure-stage-view__locator-action').trigger('click')

    expect(wrapper.text()).toContain('第101章-第120章')
    expect(wrapper.find('.structure-stage-view__rhythm-row.is-selected').text()).toContain(
      '第115章',
    )
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
