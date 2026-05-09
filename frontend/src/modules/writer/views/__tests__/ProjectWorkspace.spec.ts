import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
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
    loadDetail: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/modules/writer/stores/documentStore', () => ({
  useDocumentStore: () => ({
    currentDocMeta: null,
    flatDocs: [
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
    ],
    loadTree: vi.fn().mockResolvedValue(undefined),
    selectDocument: selectDocumentMock,
    create: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/modules/writer/stores/editorStore', () => ({
  useEditorStore: () => ({
    activeTool: ref('writing'),
    editorContent: '',
    content: '',
    tipTapEditor: null,
    setActiveTool,
    setCurrentChapter: vi.fn(),
    setContent: vi.fn(),
    markSaved: vi.fn(),
    reset: vi.fn(),
    loadDocument: loadDocumentMock,
  }),
}))

vi.mock('@/modules/writer/stores/panelStore', () => ({
  usePanelStore: () => ({
    leftCollapsed: false,
    rightCollapsed: false,
    setLeftCollapsed: vi.fn(),
    setRightCollapsed: vi.fn(),
  }),
}))

vi.mock('@/modules/writer/stores/editorThemeStore', () => ({
  useEditorThemeStore: () => ({
    currentTheme: 'light',
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
    list: [],
    relations: [],
    loading: false,
  },
  locations: { list: [] },
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

const WorkspaceLeftPanelStub = defineComponent({
  emits: ['update:chapter-id', 'open-graph', 'outline-select'],
  setup(_, { emit }) {
    return () =>
      h('div', [
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

const openFullscreenToolSpy = vi.fn()
const closeFullscreenSpy = vi.fn()

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
  beforeEach(() => {
    routeState.query = { chapterId: 'chapter-1', tool: 'writing' }
    routerReplace.mockClear()
    setActiveTool.mockClear()
    setSelectedText.mockClear()
    createDocumentMock.mockReset()
    createDocumentMock.mockResolvedValue({ id: 'generated-doc-1' })
    messageSuccess.mockClear()
    messageInfo.mockClear()
    messageWarning.mockClear()
    messageError.mockClear()
    messageBoxConfirm.mockClear()
    loadCharacters.mockClear()
    loadCharacterRelations.mockClear()
    writerStoreState.setCurrentOutlineNode.mockClear()
    selectDocumentMock.mockClear()
    loadDocumentMock.mockClear()
    openFullscreenToolSpy.mockClear()
    closeFullscreenSpy.mockClear()
  })

  it('写作模式下应渲染工作区编辑宿主且不渲染旧 EditorPanel', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    expect(wrapper.find('[data-testid="workspace-editor-content-module-mock"]').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('EditorPanel')
    expect(loadCharacters).toHaveBeenCalledWith('project-1')
    expect(loadCharacterRelations).toHaveBeenCalledWith('project-1')
  })

  it('切换章节时应通过路由保持写作模式', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="change-chapter"]').trigger('click')

    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        chapterId: 'chapter-2',
        tool: 'writing',
      }),
    })
  })

  it('AI 回填后应把反馈重新传给右侧工作台', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="apply-ai-result"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="apply-feedback-title"]').text()).toBe('已整章替换')
    expect(setSelectedText).toHaveBeenCalledWith('')
  })

  it('异章节 AI 回填应先切章再加载目标章节', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

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

    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'encyclopedia'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: OverlayAwareEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
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

    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'encyclopedia'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: GlobalOverlayEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
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

    mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: OverlayAwareEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
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

    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

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
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('0')

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
  })

  it('工作流触发应注入 aiActionTrigger 与 workflowContext 到右侧面板', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: WorkflowRelayEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
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
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: WorkflowRelayEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
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
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: WorkflowRelayEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
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
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: WorkflowRelayEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
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
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: WorkflowRelayEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
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
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: WorkflowRelayEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
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
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="save-summary-proposal"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="proposal-kind"]').text()).toBe('chapter-direction')
    expect(wrapper.find('[data-testid="proposal-source"]').text()).toBe('summary-workbench')
  })

  it('审校结果应映射为 review-workbench proposal', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="save-review-proposal"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="proposal-kind"]').text()).toBe('text-draft')
    expect(wrapper.find('[data-testid="proposal-source"]').text()).toBe('review-workbench')
  })

  it('提案状态变更后再次暂存应复位为 draft', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

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
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

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

    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

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
        title: '第3章 夜探旧仓库',
        type: 'chapter',
      }),
    )
    expect(createDocumentMock).toHaveBeenNthCalledWith(
      2,
      'project-1',
      expect.objectContaining({
        title: '第4章 街口对峙',
        type: 'chapter',
      }),
    )
  })
})
