import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive } from 'vue'
import { createPinia } from 'pinia'

const routeState = reactive({
  params: { projectId: 'project-1' },
  query: {
    chapterId: 'chapter-1',
    tool: 'writing',
  } as Record<string, unknown>,
})

const routerReplace = vi
  .fn()
  .mockImplementation(async ({ query }: { query?: Record<string, unknown> }) => {
    routeState.query = { ...(query || {}) }
  })
const setActiveTool = vi.fn()
const setSelectedText = vi.fn()
const toggleLeftCollapsed = vi.fn()
const { messageSuccess, messageInfo, messageWarning, messageError, messageBoxConfirm } = vi.hoisted(
  () => ({
    messageSuccess: vi.fn(),
    messageInfo: vi.fn(),
    messageWarning: vi.fn(),
    messageError: vi.fn(),
    messageBoxConfirm: vi.fn().mockResolvedValue(undefined),
  }),
)
const { createDocumentMock } = vi.hoisted(() => ({
  createDocumentMock: vi.fn(),
}))
const { selectDocumentMock, loadDocumentMock } = vi.hoisted(() => ({
  selectDocumentMock: vi.fn().mockResolvedValue(undefined),
  loadDocumentMock: vi.fn().mockResolvedValue(undefined),
}))
const { loadProjectDetailMock } = vi.hoisted(() => ({
  loadProjectDetailMock: vi.fn().mockResolvedValue(undefined),
}))
const { loadDocumentTreeMock, saveParagraphsMock } = vi.hoisted(() => ({
  loadDocumentTreeMock: vi.fn().mockResolvedValue(undefined),
  saveParagraphsMock: vi.fn().mockResolvedValue(undefined),
}))
const { documentStoreCreateMock } = vi.hoisted(() => ({
  documentStoreCreateMock: vi.fn().mockResolvedValue({ id: 'generated-doc-1' }),
}))
const { listEntitiesMock, conceptListMock, replaceScopeAssetRefsMock } = vi.hoisted(() => ({
  listEntitiesMock: vi.fn().mockResolvedValue([]),
  conceptListMock: vi.fn().mockResolvedValue([]),
  replaceScopeAssetRefsMock: vi.fn(),
}))
const editorStoreState = reactive({
  activeTool: 'writing',
  editorContent: '',
  content: '',
  tipTapEditor: null,
  currentVersion: 0,
  autosaveEnabled: false,
  isDirty: false,
  setActiveTool,
  setCurrentChapter: vi.fn(),
  setContent: vi.fn((value: string) => {
    editorStoreState.content = value
    editorStoreState.isDirty = true
  }),
  markSaved: vi.fn(() => {
    editorStoreState.isDirty = false
  }),
  reset: vi.fn(),
  loadDocument: loadDocumentMock,
  saveParagraphs: saveParagraphsMock,
})
const baseFlatDocs = [
  {
    id: 'chapter-1',
    title: '第一章',
    type: 'chapter',
    projectId: 'project-1',
  },
  {
    id: 'chapter-2',
    title: '第二章',
    type: 'chapter',
    projectId: 'project-1',
  },
] as any[]
const mockFlatDocs = [...baseFlatDocs]

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({
    replace: routerReplace,
    push: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/modules/writer/mock/workspaceMock', () => ({
  getWorkspaceMockProject: () => null,
}))

vi.mock('@/modules/writer/api/document', () => ({
  createDocument: (...args: unknown[]) => createDocumentMock(...args),
  duplicateDocument: vi.fn(),
  moveDocument: vi.fn(),
  getDocuments: vi.fn(),
  getDocumentById: vi.fn(),
  getDocumentTree: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
}))

vi.mock('@/modules/writer/api/entities', () => ({
  listEntities: (...args: unknown[]) => listEntitiesMock(...args),
}))

vi.mock('@/modules/writer/api/concept', () => ({
  conceptApi: {
    list: (...args: unknown[]) => conceptListMock(...args),
  },
}))

vi.mock('@/modules/writer/utils/writerAssetRefs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/modules/writer/utils/writerAssetRefs')>()
  return {
    ...actual,
    replaceScopeAssetRefs: (...args: unknown[]) => replaceScopeAssetRefsMock(...args),
  }
})

vi.mock('@/design-system/components', () => {
  const stub = defineComponent({
    name: 'DesignSystemComponentMock',
    template: '<div data-testid="design-system-component-mock" />',
  })

  return {
    __esModule: true,
    QyButton: stub,
    QyCard: stub,
    QyDialog: stub,
    QyDrawer: stub,
    QyDropdown: stub,
    QyGhostButton: stub,
    QyIcon: stub,
    QyProgress: stub,
    QyRow: stub,
    QyCol: stub,
    QySelect: stub,
    Skeleton: stub,
  }
})

vi.mock('@/design-system/components/index', () => {
  const stub = defineComponent({
    name: 'DesignSystemComponentMock',
    template: '<div data-testid="design-system-component-mock" />',
  })

  return {
    __esModule: true,
    QyButton: stub,
    QyCard: stub,
    QyDialog: stub,
    QyDrawer: stub,
    QyDropdown: stub,
    QyGhostButton: stub,
    QyIcon: stub,
    QyProgress: stub,
    QyRow: stub,
    QyCol: stub,
    QySelect: stub,
    Skeleton: stub,
  }
})

vi.mock('@/modules/writer/components/v3/story-harness/StoryHarnessPanel.vue', () => ({
  default: defineComponent({
    name: 'StoryHarnessPanelMock',
    template: '<div data-testid="story-harness-module-mock" />',
  }),
}))

vi.mock('@/modules/writer/components/workspace/WorkspaceTopbar.vue', () => ({
  default: defineComponent({
    name: 'WorkspaceTopbarMock',
    template: '<div data-testid="workspace-topbar-module-mock" />',
  }),
}))

vi.mock('@/modules/writer/components/workspace/WorkspaceLeftPanel.vue', () => ({
  default: defineComponent({
    name: 'WorkspaceLeftPanel',
    template: '<div data-testid="workspace-left-panel-module-mock" />',
  }),
}))

vi.mock('@/modules/writer/components/workspace/WorkspaceRightPanel.vue', () => ({
  default: defineComponent({
    name: 'WorkspaceRightPanel',
    template: '<div data-testid="workspace-right-panel-module-mock" />',
  }),
}))

vi.mock('@/modules/writer/components/workspace/WorkspaceEditorContent.vue', () => ({
  default: defineComponent({
    name: 'WorkspaceEditorContent',
    template: '<div data-testid="workspace-editor-content-module-mock" />',
  }),
}))

vi.mock('@/design-system/services', () => ({
  message: {
    success: messageSuccess,
    info: messageInfo,
    warning: messageWarning,
    error: messageError,
  },
  messageBox: {
    confirm: messageBoxConfirm,
  },
}))

vi.mock('@/modules/writer/stores/projectStore', () => ({
  useProjectStore: () => ({
    currentProjectId: 'project-1',
    projects: [],
    currentProject: null,
    loadList: vi.fn().mockResolvedValue(undefined),
    loadDetail: loadProjectDetailMock,
  }),
}))

vi.mock('@/modules/writer/stores/documentStore', () => ({
  useDocumentStore: () => ({
    currentDocMeta: null,
    flatDocs: mockFlatDocs,
    loadTree: loadDocumentTreeMock,
    selectDocument: selectDocumentMock,
    create: documentStoreCreateMock,
    remove: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/modules/writer/stores/editorStore', () => ({
  useEditorStore: () => editorStoreState,
}))

vi.mock('@/modules/writer/stores/panelStore', () => ({
  usePanelStore: () => ({
    leftCollapsed: false,
    rightCollapsed: false,
    toggleLeftCollapsed,
    setLeftCollapsed: vi.fn(),
    setRightCollapsed: vi.fn(),
  }),
}))

vi.mock('@/modules/writer/stores/editorThemeStore', () => ({
  useEditorThemeStore: () => ({
    currentTheme: 'mist',
    initTheme: vi.fn(),
  }),
}))

const loadCharacters = vi.fn().mockResolvedValue(undefined)
const loadCharacterRelations = vi.fn().mockResolvedValue(undefined)
const loadLocations = vi.fn().mockResolvedValue(undefined)
const loadOutlineTree = vi.fn().mockResolvedValue(undefined)
const loadTimelines = vi.fn().mockResolvedValue(undefined)
const loadTimelineEvents = vi.fn().mockResolvedValue(undefined)

const writerStoreState = {
  characters: {
    list: [] as Array<{ id: string; name: string }>,
    relations: [],
    loading: false,
  },
  locations: { list: [] as Array<{ id: string; name: string }> },
  loadCharacters,
  loadCharacterRelations,
  loadLocations,
  loadOutlineTree,
  loadTimelines,
  loadTimelineEvents,
  outline: {
    currentNode: null,
    tree: [],
    loading: false,
  },
  timeline: {
    currentTimeline: null,
    events: [],
  },
  setCurrentOutlineNode: vi.fn(),
  setSelectedText,
}

vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => writerStoreState,
}))

vi.mock('@/modules/writer/api/outline', () => {
  const outlineApi = {
    getTree: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  }

  return {
    outlineApi,
    default: outlineApi,
  }
})

vi.mock('@/modules/writer/composables/useWorkspaceShortcuts', () => ({
  useWorkspaceShortcuts: () => ({
    shortcutsEnabled: { value: true },
  }),
}))

vi.mock('@/modules/writer/components/workspace/WorkspaceStatusbar.vue', () => ({
  default: defineComponent({
    name: 'WorkspaceStatusbarStub',
    template: '<div data-testid="workspace-statusbar-stub" />',
  }),
}))

import ProjectWorkspace from '../ProjectWorkspace.vue'

const EditorLayoutStub = {
  template: `
    <div>
      <slot name="left-panel" />
      <slot name="editor" />
      <slot name="right-panel" />
    </div>
  `,
}

const TipTapEditorViewStub = { template: '<div data-testid="tiptap-editor-view" />' }
const EncyclopediaViewStub = { template: '<div data-testid="encyclopedia-view" />' }
const AIPanelStub = { template: '<div data-testid="ai-panel" />' }

const WorkspaceLeftPanelStub = defineComponent({
  emits: ['update:chapter-id', 'open-graph', 'outline-select', 'toggle', 'add-doc'],
  setup(_, { emit }) {
    return () =>
      h('div', [
        h('button', {
          'data-testid': 'add-doc',
          onClick: () => emit('add-doc'),
        }),
        h('button', {
          'data-testid': 'toggle-left-panel',
          onClick: () => emit('toggle'),
        }),
        h('button', {
          'data-testid': 'change-chapter',
          onClick: () => emit('update:chapter-id', 'chapter-2'),
        }),
        h('button', {
          'data-testid': 'open-global-graph',
          onClick: () => emit('open-graph', ''),
        }),
        h('button', {
          'data-testid': 'outline-select',
          onClick: () =>
            emit('outline-select', {
              id: 'node-2',
              title: '第二幕转折',
              documentId: 'chapter-2',
            }),
        }),
      ])
  },
})

const WorkspaceRightPanelStub = defineComponent({
  props: {
    aiApplyFeedback: {
      type: Object,
      default: null,
    },
    aiActionTrigger: {
      type: Object,
      default: null,
    },
    workflowContext: {
      type: Object,
      default: null,
    },
    draftProposals: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['ai-apply', 'proposal-draft', 'proposal-status-change', 'create-structure-plan'],
  setup(props, { emit }) {
    return () =>
      h('div', [
        h('button', {
          'data-testid': 'apply-ai-result',
          onClick: () =>
            emit('ai-apply', {
              action: 'rewrite',
              sourceText: '旧内容',
              generatedText: '新内容',
              applyMode: 'replace_document',
            }),
        }),
        h('button', {
          'data-testid': 'apply-ai-result-to-other-chapter',
          onClick: () =>
            emit('ai-apply', {
              action: 'rewrite',
              sourceText: '第二章旧内容',
              generatedText: '第二章新内容',
              applyMode: 'replace_document',
              targetDocumentId: 'chapter-2',
              targetDocumentTitle: '第二章',
            }),
        }),
        h('button', {
          'data-testid': 'save-proposal-draft',
          onClick: () =>
            emit('proposal-draft', {
              source: 'chat',
              action: 'chat',
              title: 'AI 对话结果',
              summary: '新的推进方向',
              generatedText: '新的推进方向',
              sourceText: '继续推进冲突',
            }),
        }),
        h('button', {
          'data-testid': 'save-summary-proposal',
          onClick: () =>
            emit('proposal-draft', {
              source: 'summary',
              action: 'summarize_chapter',
              title: '章节方向提案',
              summary: '本章应聚焦冲突升级',
              generatedText: '本章应聚焦冲突升级\n\n核心要点：\n- 张三主动试探\n- 李四暂不表态',
              sourceText: '第一章',
            }),
        }),
        h('button', {
          'data-testid': 'save-review-proposal',
          onClick: () =>
            emit('proposal-draft', {
              source: 'review',
              action: 'proofread',
              title: '审校建议提案',
              summary: '检测到 2 条语言问题',
              generatedText: '审校评分：8.5\n1. 语法：建议调整句式\n2. 标点：补充逗号',
              sourceText: '第一章正文',
            }),
        }),
        h('button', {
          'data-testid': 'create-structure-plan',
          onClick: () =>
            emit('create-structure-plan', {
              mode: 'chapter',
              prompt: '补两个后续章节',
              summary: '建议补 2 个后续章节。',
              importTarget: 'project-root',
              duplicateStrategy: 'skip_existing',
              items: [
                {
                  title: '夜探旧仓库',
                  summary: '主角第一次确认线索方向。',
                },
                {
                  title: '街口对峙',
                  summary: '反派提前亮相。',
                },
              ],
            }),
        }),
        h('div', { 'data-testid': 'apply-feedback-title' }, props.aiApplyFeedback?.title || ''),
        h('div', { 'data-testid': 'trigger-action' }, props.aiActionTrigger?.action || ''),
        h('div', { 'data-testid': 'trigger-source' }, props.aiActionTrigger?.source || ''),
        h('div', { 'data-testid': 'trigger-text' }, props.aiActionTrigger?.text || ''),
        h('div', { 'data-testid': 'context-signature' }, props.workflowContext?.signature || ''),
        h(
          'div',
          { 'data-testid': 'proposal-count' },
          String((props.draftProposals as unknown[]).length || 0),
        ),
        h(
          'div',
          { 'data-testid': 'proposal-status' },
          String((props.draftProposals as Array<{ status?: string }>)[0]?.status || ''),
        ),
        h(
          'div',
          { 'data-testid': 'proposal-id' },
          String((props.draftProposals as Array<{ id?: string }>)[0]?.id || ''),
        ),
        h(
          'div',
          { 'data-testid': 'proposal-kind' },
          String((props.draftProposals as Array<{ kind?: string }>)[0]?.kind || ''),
        ),
        h(
          'div',
          { 'data-testid': 'proposal-source' },
          String((props.draftProposals as Array<{ source?: string }>)[0]?.source || ''),
        ),
      ])
  },
})

const WorkflowRelayEditorContentStub = defineComponent({
  emits: ['trigger-ai-action'],
  setup(_, { emit }) {
    return () =>
      h('button', {
        'data-testid': 'relay-workflow-action',
        onClick: () =>
          emit('trigger-ai-action', {
            source: 'story_harness',
            action: 'add_to_chat',
            text: '请基于这条建议补写下一段冲突',
            title: '来自 Story Harness',
            instructions: '保留当前章节语气',
            applyMode: 'append_paragraph',
          }),
      })
  },
})

const AutosaveEditorContentStub = defineComponent({
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  emits: ['update:content'],
  setup(_, { emit }) {
    return () =>
      h('button', {
        'data-testid': 'edit-content',
        onClick: () =>
          emit(
            'update:content',
            JSON.stringify({
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '你好，hahaha！' }] }],
            }),
          ),
      })
  },
})

const EntityScanEditorContentStub = defineComponent({
  emits: ['entity-scan'],
  setup(_, { emit }) {
    return () =>
      h('button', {
        'data-testid': 'emit-entity-scan',
        onClick: () =>
          emit('entity-scan', [{ id: 'char-1', name: '林舟', type: 'character' }]),
      })
  },
})

const EmptyEntityScanEditorContentStub = defineComponent({
  emits: ['entity-scan'],
  setup(_, { emit }) {
    return () =>
      h('button', {
        'data-testid': 'emit-empty-entity-scan',
        onClick: () => emit('entity-scan', []),
      })
  },
})

const openFullscreenToolSpy = vi.fn()
const closeFullscreenSpy = vi.fn()
const focusTitleInputMock = vi.fn().mockResolvedValue(undefined)

const OverlayAwareEditorContentStub = defineComponent({
  props: {
    toolOverlayChapterId: {
      type: String,
      default: undefined,
    },
    toolOverlayChapterTitle: {
      type: String,
      default: undefined,
    },
  },
  emits: ['open-graph'],
  setup(props, { emit, expose }) {
    expose({
      openFullscreenTool: (tool: string) => openFullscreenToolSpy(tool),
      closeFullscreen: () => closeFullscreenSpy(),
    })

    return () =>
      h('div', [
        h('button', {
          'data-testid': 'open-graph',
          onClick: () => emit('open-graph', 'chapter-2'),
        }),
        h(
          'div',
          { 'data-testid': 'overlay-chapter-id' },
          props.toolOverlayChapterId ?? '__undefined__',
        ),
        h(
          'div',
          { 'data-testid': 'overlay-chapter-title' },
          props.toolOverlayChapterTitle ?? '__undefined__',
        ),
      ])
  },
})

const baseGlobalStubs = {
  EditorLayout: EditorLayoutStub,
  WorkspaceLeftPanel: WorkspaceLeftPanelStub,
  WorkspaceRightPanel: WorkspaceRightPanelStub,
  TipTapEditorView: TipTapEditorViewStub,
  EncyclopediaView: EncyclopediaViewStub,
  AIPanel: AIPanelStub,
}

const mountedWrappers: Array<ReturnType<typeof mount>> = []

function mountProjectWorkspace(extraStubs?: Record<string, unknown>) {
  const wrapper = mount(ProjectWorkspace, {
    global: {
      plugins: [createPinia()],
      stubs: {
        ...baseGlobalStubs,
        ...extraStubs,
      },
    },
  })
  mountedWrappers.push(wrapper)
  return wrapper
}

const GlobalOverlayEditorContentStub = defineComponent({
  props: {
    toolOverlayChapterId: {
      type: String,
      default: undefined,
    },
    toolOverlayChapterTitle: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { expose }) {
    expose({
      openFullscreenTool: (tool: string) => openFullscreenToolSpy(tool),
      closeFullscreen: () => closeFullscreenSpy(),
    })

    return () =>
      h('div', [
        h(
          'div',
          { 'data-testid': 'overlay-chapter-id' },
          props.toolOverlayChapterId ?? '__undefined__',
        ),
        h(
          'div',
          { 'data-testid': 'overlay-chapter-title' },
          props.toolOverlayChapterTitle ?? '__undefined__',
        ),
      ])
  },
})

describe('ProjectWorkspace Refactor', () => {
  afterEach(() => {
    for (const wrapper of mountedWrappers.splice(0)) {
      wrapper.unmount()
    }
  })

  beforeEach(() => {
    routeState.query = { chapterId: 'chapter-1', tool: 'writing' }
    routerReplace.mockClear()
    setActiveTool.mockClear()
    setSelectedText.mockClear()
    toggleLeftCollapsed.mockClear()
    editorStoreState.activeTool = 'writing'
    editorStoreState.editorContent = ''
    editorStoreState.content = ''
    editorStoreState.currentVersion = 0
    editorStoreState.autosaveEnabled = false
    editorStoreState.isDirty = true
    editorStoreState.setCurrentChapter.mockClear()
    editorStoreState.setContent.mockClear()
    editorStoreState.markSaved.mockClear()
    editorStoreState.reset.mockClear()
    mockFlatDocs.splice(0, mockFlatDocs.length, ...baseFlatDocs)
    writerStoreState.characters.list = []
    writerStoreState.locations.list = []
    createDocumentMock.mockReset()
    createDocumentMock.mockResolvedValue({ id: 'generated-doc-1' })
    documentStoreCreateMock.mockReset()
    documentStoreCreateMock.mockResolvedValue({ id: 'generated-doc-1' })
    messageSuccess.mockClear()
    messageInfo.mockClear()
    messageWarning.mockClear()
    messageError.mockClear()
    messageBoxConfirm.mockClear()
    loadCharacters.mockClear()
    loadCharacters.mockResolvedValue(undefined)
    loadCharacterRelations.mockClear()
    loadLocations.mockClear()
    loadLocations.mockResolvedValue(undefined)
    listEntitiesMock.mockClear()
    listEntitiesMock.mockResolvedValue([])
    conceptListMock.mockClear()
    conceptListMock.mockResolvedValue([])
    replaceScopeAssetRefsMock.mockClear()
    loadProjectDetailMock.mockReset()
    loadProjectDetailMock.mockResolvedValue(undefined)
    loadDocumentTreeMock.mockClear()
    saveParagraphsMock.mockClear()
    writerStoreState.setCurrentOutlineNode.mockClear()
    selectDocumentMock.mockClear()
    loadDocumentMock.mockClear()
    openFullscreenToolSpy.mockClear()
    closeFullscreenSpy.mockClear()
    focusTitleInputMock.mockClear()
  })

  it('写作模式下应渲染工作区编辑宿主且不渲染旧 EditorPanel', async () => {
    const wrapper = mountProjectWorkspace()
    await Promise.resolve()
    await nextTick()

    expect(wrapper.find('[data-writer-shell="editor"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="workspace-editor-content-module-mock"]').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('EditorPanel')
    expect(loadCharacters).toHaveBeenCalledWith('project-1')
    expect(loadCharacterRelations).toHaveBeenCalledWith('project-1')
  })

  it('项目不存在时应提示并返回工作台', async () => {
    loadProjectDetailMock.mockRejectedValueOnce(new Error('项目不存在: project-1'))

    mountProjectWorkspace()
    await Promise.resolve()
    await nextTick()

    expect(messageWarning).toHaveBeenCalledWith('项目不存在或已失效，已返回工作台')
    expect(routerReplace).toHaveBeenCalledWith({
      name: 'writer-home',
    })
  })

  it('切换章节时应通过路由保持写作模式', async () => {
    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="change-chapter"]').trigger('click')

    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        chapterId: 'chapter-2',
        tool: 'writing',
      }),
    })
  })

  it('点击左侧栏折叠入口应切换左侧边栏显示状态', async () => {
    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="toggle-left-panel"]').trigger('click')

    expect(toggleLeftCollapsed).toHaveBeenCalledTimes(1)
  })

  it('正文变更后应防抖保存并刷新章节与项目统计', async () => {
    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: AutosaveEditorContentStub,
    })
    await nextTick()
    saveParagraphsMock.mockClear()
    loadDocumentTreeMock.mockClear()
    loadProjectDetailMock.mockClear()
    editorStoreState.isDirty = true
    editorStoreState.autosaveEnabled = true

    await wrapper.find('[data-testid="edit-content"]').trigger('click')
    await nextTick()
    expect(saveParagraphsMock).not.toHaveBeenCalled()

    await new Promise((resolve) => window.setTimeout(resolve, 1300))
    await Promise.resolve()
    await nextTick()

    expect(saveParagraphsMock).toHaveBeenCalledTimes(1)
    expect(loadDocumentTreeMock).toHaveBeenCalledWith('project-1')
    expect(loadProjectDetailMock).toHaveBeenCalledWith('project-1')
  })

  it('@ 创建资产后即时扫描时应刷新资产源并同步章节引用', async () => {
    editorStoreState.editorContent = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '@林舟 登场。' }] }],
    })
    loadCharacters.mockImplementationOnce(async () => {
      writerStoreState.characters.list = [{ id: 'char-1', name: '林舟' }]
    })
    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: EntityScanEditorContentStub,
    })

    await wrapper.find('[data-testid="emit-entity-scan"]').trigger('click')
    await Promise.resolve()
    await nextTick()

    expect(loadCharacters).toHaveBeenCalledWith('project-1')
    expect(replaceScopeAssetRefsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        scopeType: 'chapter',
        scopeId: 'chapter-1',
        candidates: [
          expect.objectContaining({
            assetType: 'character',
            assetId: 'char-1',
            assetName: '林舟',
            unresolved: false,
          }),
        ],
      }),
    )
  })

  it('扫描结果为空时应清空章节局部资产投影而不影响全局资产加载', async () => {
    writerStoreState.characters.list = [{ id: 'char-1', name: '林舟' }]
    writerStoreState.locations.list = [{ id: 'loc-1', name: '云城' }]
    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: EmptyEntityScanEditorContentStub,
    })

    await wrapper.find('[data-testid="emit-empty-entity-scan"]').trigger('click')
    await Promise.resolve()
    await nextTick()

    expect(loadCharacters).toHaveBeenCalledWith('project-1')
    expect(listEntitiesMock).toHaveBeenCalledWith('project-1', 'item')
    expect(listEntitiesMock).toHaveBeenCalledWith('project-1', 'organization')
    expect(conceptListMock).toHaveBeenCalledWith('project-1')
    expect(replaceScopeAssetRefsMock).toHaveBeenCalledWith({
      projectId: 'project-1',
      scopeType: 'chapter',
      scopeId: 'chapter-1',
      candidates: [],
    })
    expect(writerStoreState.characters.list).toEqual([{ id: 'char-1', name: '林舟' }])
    expect(writerStoreState.locations.list).toEqual([{ id: 'loc-1', name: '云城' }])
  })

  it('在第二卷新增章节时应压栈追加到该卷末尾', async () => {
    mockFlatDocs.splice(
      0,
      mockFlatDocs.length,
      {
        id: 'volume-1',
        title: '第一卷',
        type: 'volume',
        projectId: 'project-1',
        order: 0,
      },
      {
        id: 'chapter-1',
        title: '第一章',
        type: 'chapter',
        projectId: 'project-1',
        parentId: 'volume-1',
        order: 0,
      },
      {
        id: 'volume-2',
        title: '第二卷',
        type: 'volume',
        projectId: 'project-1',
        order: 1,
      },
      {
        id: 'chapter-2',
        title: '第二卷第一章',
        type: 'chapter',
        projectId: 'project-1',
        parentId: 'volume-2',
        order: 4,
      },
      {
        id: 'chapter-3',
        title: '第二卷第二章',
        type: 'chapter',
        projectId: 'project-1',
        parentId: 'volume-2',
        order: 8,
      },
    )
    routeState.query = { chapterId: 'volume-2', tool: 'writing' }
    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="add-doc"]').trigger('click')
    await Promise.resolve()
    await nextTick()

    expect(documentStoreCreateMock).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({
        title: '第三章',
        type: 'chapter',
        parentId: 'volume-2',
        order: 9,
      }),
    )
  })

  it('AI 回填后应把反馈重新传给右侧工作台', async () => {
    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="apply-ai-result"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="apply-feedback-title"]').text()).toBe('已整章替换')
    expect(setSelectedText).toHaveBeenCalledWith('')
  })

  it('异章节 AI 回填应先切章再加载目标章节', async () => {
    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="apply-ai-result-to-other-chapter"]').trigger('click')
    await nextTick()
    await Promise.resolve()
    await nextTick()

    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        chapterId: 'chapter-2',
        tool: 'writing',
      }),
    })
    expect(selectDocumentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'chapter-2',
        title: '第二章',
      }),
    )
    expect(loadDocumentMock).toHaveBeenCalledWith('chapter-2')
  })

  it('从结构舞台打开章节图谱时应保持写作路由，并把目标章节作用域交给 overlay', async () => {
    routeState.query = {
      chapterId: 'chapter-1',
      tool: 'writing',
    }

    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: OverlayAwareEditorContentStub,
    })

    await wrapper.find('[data-testid="open-graph"]').trigger('click')

    expect(openFullscreenToolSpy).toHaveBeenCalledWith('relations')
    expect(wrapper.find('[data-testid="overlay-chapter-id"]').text()).toBe('chapter-2')
    expect(wrapper.find('[data-testid="overlay-chapter-title"]').text()).toBe('第二章')
    expect(routerReplace).not.toHaveBeenCalled()
  })

  it('点击左栏全局关系图谱入口时应以空章节作用域打开 overlay', async () => {
    routeState.query = {
      chapterId: 'project-yljs-1-volume-1',
      tool: 'writing',
    }

    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: GlobalOverlayEditorContentStub,
    })

    await wrapper.find('[data-testid="open-global-graph"]').trigger('click')

    expect(openFullscreenToolSpy).toHaveBeenCalledWith('relations')
    expect(wrapper.find('[data-testid="overlay-chapter-id"]').text()).toBe('')
    expect(wrapper.find('[data-testid="overlay-chapter-title"]').text()).toBe('')
    expect(routerReplace).not.toHaveBeenCalled()
  })

  it('旧 encyclopedia deep-link 应自动转成 overlay，并把主路由收回写作态', async () => {
    routeState.query = {
      chapterId: 'chapter-2',
      tool: 'encyclopedia',
      encyclopediaView: 'branches',
    }

    mountProjectWorkspace({
      WorkspaceEditorContent: OverlayAwareEditorContentStub,
    })

    await nextTick()
    await Promise.resolve()
    await nextTick()

    expect(openFullscreenToolSpy).toHaveBeenCalledWith('branches')
    expect(routerReplace).toHaveBeenCalledWith({
      query: {
        chapterId: 'chapter-2',
        tool: 'writing',
      },
    })
  })

  it('结构节点选择已绑定章节时，应切回写作章节并记录当前大纲节点', async () => {
    routeState.query = {
      chapterId: 'chapter-1',
      tool: 'structure',
    }

    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="outline-select"]').trigger('click')
    await nextTick()

    expect(writerStoreState.setCurrentOutlineNode).toHaveBeenCalledWith({
      id: 'node-2',
      title: '第二幕转折',
      documentId: 'chapter-2',
    })
    expect(setActiveTool).toHaveBeenCalledWith('writing')
    expect(routerReplace).toHaveBeenCalledWith({
      query: {
        chapterId: 'chapter-2',
        tool: 'writing',
      },
    })
  })

  it('保存 AI 结果为提案后应把草案回传给右侧工作台', async () => {
    const wrapper = mountProjectWorkspace()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('0')

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
  })

  it('工作流触发应注入 aiActionTrigger 与 workflowContext 到右侧面板', async () => {
    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: WorkflowRelayEditorContentStub,
    })

    await wrapper.find('[data-testid="relay-workflow-action"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="trigger-action"]').text()).toBe('add_to_chat')
    expect(wrapper.find('[data-testid="trigger-source"]').text()).toBe('story_harness')
    expect(wrapper.find('[data-testid="trigger-text"]').text()).toContain('补写下一段冲突')
    expect(wrapper.find('[data-testid="context-signature"]').text()).toContain(
      '"chapterId":"chapter-1"',
    )
  })

  it('切章节后再次触发工作流动作时，应注入新章节的 workflowContext', async () => {
    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: WorkflowRelayEditorContentStub,
    })

    await wrapper.find('[data-testid="change-chapter"]').trigger('click')
    await nextTick()
    await Promise.resolve()
    await nextTick()

    await wrapper.find('[data-testid="relay-workflow-action"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="trigger-action"]').text()).toBe('add_to_chat')
    expect(wrapper.find('[data-testid="context-signature"]').text()).toContain(
      '"chapterId":"chapter-2"',
    )
  })

  it('clears stale transient right-panel state on new workflow actions and chapter switches', async () => {
    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: WorkflowRelayEditorContentStub,
    })

    await wrapper.find('[data-testid="apply-ai-result"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="apply-feedback-title"]').text()).toBe('已整章替换')

    await wrapper.find('[data-testid="relay-workflow-action"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="trigger-action"]').text()).toBe('add_to_chat')
    expect(wrapper.find('[data-testid="apply-feedback-title"]').text()).toBe('')

    await wrapper.find('[data-testid="change-chapter"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="trigger-action"]').text()).toBe('')
    expect(wrapper.find('[data-testid="apply-feedback-title"]').text()).toBe('')
  })

  it('retires workflow trigger after applying generated text', async () => {
    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: WorkflowRelayEditorContentStub,
    })

    await wrapper.find('[data-testid="relay-workflow-action"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="trigger-action"]').text()).toBe('add_to_chat')

    await wrapper.find('[data-testid="apply-ai-result"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="trigger-action"]').text()).toBe('')
    expect(wrapper.find('[data-testid="apply-feedback-title"]').text()).toBe('已整章替换')
  })

  it('retires workflow trigger after saving a proposal draft', async () => {
    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: WorkflowRelayEditorContentStub,
    })

    await wrapper.find('[data-testid="relay-workflow-action"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="trigger-action"]').text()).toBe('add_to_chat')

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="trigger-action"]').text()).toBe('')
  })

  it('提案应按当前章节过滤展示（Phase 2: chapter-scoped proposal visibility）', async () => {
    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: WorkflowRelayEditorContentStub,
    })

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()

    const chapterOneProposalId = wrapper.find('[data-testid="proposal-id"]').text()
    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(chapterOneProposalId).toContain('proposal-')

    await wrapper.find('[data-testid="change-chapter"]').trigger('click')
    await Promise.resolve()
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('0')
    expect(wrapper.find('[data-testid="proposal-id"]').text()).toBe('')

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()

    const chapterTwoProposalId = wrapper.find('[data-testid="proposal-id"]').text()
    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(chapterTwoProposalId).toContain('proposal-')
    expect(chapterTwoProposalId).not.toBe(chapterOneProposalId)

    routeState.query = {
      ...routeState.query,
      chapterId: 'chapter-1',
      tool: 'writing',
    }
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="proposal-id"]').text()).toBe(chapterOneProposalId)
  })

  it('章节总结结果应映射为 chapter-direction proposal', async () => {
    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="save-summary-proposal"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="proposal-kind"]').text()).toBe('chapter-direction')
    expect(wrapper.find('[data-testid="proposal-source"]').text()).toBe('summary-workbench')
  })

  it('审校结果应映射为 review-workbench proposal', async () => {
    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="save-review-proposal"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="proposal-kind"]').text()).toBe('text-draft')
    expect(wrapper.find('[data-testid="proposal-source"]').text()).toBe('review-workbench')
  })

  it('提案状态变更后再次暂存应复位为 draft', async () => {
    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()
    const proposalId = wrapper.find('[data-testid="proposal-id"]').text()
    expect(proposalId).toContain('proposal-')
    expect(wrapper.find('[data-testid="proposal-status"]').text()).toBe('draft')

    await wrapper.findComponent(WorkspaceRightPanelStub).vm.$emit('proposal-status-change', {
      proposalId,
      status: 'discarded',
    })
    await nextTick()
    expect(wrapper.find('[data-testid="proposal-status"]').text()).toBe('discarded')
    expect(messageInfo).toHaveBeenCalledWith('已丢弃当前提案')

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="proposal-status"]').text()).toBe('draft')
  })

  it('selected 提案移出后应保持移出语义提示', async () => {
    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="save-summary-proposal"]').trigger('click')
    await nextTick()

    const proposalId = wrapper.find('[data-testid="proposal-id"]').text()
    await wrapper.findComponent(WorkspaceRightPanelStub).vm.$emit('proposal-status-change', {
      proposalId,
      status: 'selected',
    })
    await nextTick()
    expect(wrapper.find('[data-testid="proposal-status"]').text()).toBe('selected')
    expect(messageSuccess).toHaveBeenCalledWith('已保留当前提案方向')

    messageInfo.mockClear()

    await wrapper.findComponent(WorkspaceRightPanelStub).vm.$emit('proposal-status-change', {
      proposalId,
      status: 'discarded',
    })
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-status"]').text()).toBe('discarded')
    expect(messageInfo).toHaveBeenCalledWith('已移出当前提案')
  })

  it('AI 结构草案落地后应批量创建章节并跳转到首个新章节', async () => {
    createDocumentMock
      .mockResolvedValueOnce({ id: 'generated-doc-1' })
      .mockResolvedValueOnce({ id: 'generated-doc-2' })

    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="create-structure-plan"]').trigger('click')
    await Promise.resolve()
    await nextTick()
    await Promise.resolve()
    await nextTick()

    expect(createDocumentMock).toHaveBeenCalledTimes(2)
    expect(createDocumentMock).toHaveBeenNthCalledWith(
      1,
      'project-1',
      expect.objectContaining({
        title: '第三章 夜探旧仓库',
        type: 'chapter',
      }),
    )
    expect(createDocumentMock).toHaveBeenNthCalledWith(
      2,
      'project-1',
      expect.objectContaining({
        title: '第四章 街口对峙',
        type: 'chapter',
      }),
    )
  })

  it('新建章节后应自动跳转并聚焦标题输入框', async () => {
    const FocusableWorkspaceEditorContentStub = defineComponent({
      setup(_, { expose }) {
        expose({
          focusTitleInput: focusTitleInputMock,
        })

        return () => h('div', { 'data-testid': 'workspace-editor-content-focus-stub' })
      },
    })

    const wrapper = mountProjectWorkspace({
      WorkspaceEditorContent: FocusableWorkspaceEditorContentStub,
    })

    await wrapper.find('[data-testid="add-doc"]').trigger('click')
    await Promise.resolve()
    await nextTick()
    await Promise.resolve()
    await nextTick()

    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        chapterId: 'generated-doc-1',
        tool: 'writing',
      }),
    })
    expect(focusTitleInputMock).toHaveBeenCalled()
  })

  it('跳过重复策略开启时应略过已有同名章节', async () => {
    mockFlatDocs.push({
      id: 'chapter-3',
      title: '第三章 夜探旧仓库',
      type: 'chapter',
      projectId: 'project-1',
    })
    createDocumentMock.mockResolvedValueOnce({ id: 'generated-doc-4' })

    const wrapper = mountProjectWorkspace()

    await wrapper.find('[data-testid="create-structure-plan"]').trigger('click')
    await Promise.resolve()
    await nextTick()
    await Promise.resolve()
    await nextTick()
    await Promise.resolve()
    await nextTick()

    expect(createDocumentMock).toHaveBeenCalledTimes(1)
    expect(createDocumentMock).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({
        title: '第五章 街口对峙',
        type: 'chapter',
      }),
    )
    expect(messageSuccess).toHaveBeenCalledWith('已创建 1 个 AI 章节草案，已跳过 1 个重复章节')
  })
})
