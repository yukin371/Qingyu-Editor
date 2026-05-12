import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WorkspaceEditorContent from '../WorkspaceEditorContent.vue'

vi.mock('@/modules/writer/composables/useWorkspaceShortcuts', () => ({
  useWorkspaceShortcuts: () => ({
    shortcutsEnabled: { value: true },
  }),
}))

describe('WorkspaceEditorContent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('在写作模式下应渲染写作面', () => {
    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [{ id: 'chapter-1', title: '第一章' }],
        content: '这里是正文。',
        scopeLabel: '第一章 / 当前章节',
        entityStats: {
          characters: 2,
          locations: 1,
          items: 1,
          concepts: 0,
        },
        activeCharacters: [
          { id: 'char-1', name: '张三', traits: ['热血'], currentState: '怀疑中' },
          { id: 'char-2', name: '李四', traits: ['冷静'] },
        ],
        activeRelations: [
          { id: 'rel-1', fromName: '张三', toName: '李四', type: '朋友', strength: 80 },
        ],
        changeRequests: [
          {
            id: 'cr-1',
            source: 'live',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为怀疑或动摇',
            reason: '这类变化适合先作为 Change Request 预览。',
            evidence: '张三开始怀疑李四。',
            severity: 'focus',
          },
        ],
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          TipTapEditorView: { template: '<div data-testid="tiptap-editor" />' },
          WorkspaceToolOverlay: { template: '<div data-testid="tool-overlay" />' },
        },
      },
    })

    expect(wrapper.find('[data-testid="workspace-writing-surface"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tiptap-editor"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tool-overlay"]').exists()).toBe(true)
  })

  it('旧百科路由态下仍应保留写作面，不再让工具页接管主编辑区', () => {
    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [{ id: 'chapter-1', title: '第一章' }],
        content: '这里是正文。',
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          TipTapEditorView: { template: '<div data-testid="tiptap-editor" />' },
          WorkspaceToolOverlay: { template: '<div data-testid="tool-overlay" />' },
        },
      },
    })

    expect(wrapper.find('[data-testid="workspace-writing-surface"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tiptap-editor"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tool-overlay"]').exists()).toBe(true)
  })

  it('全屏关系图谱的交给 AI 动作应透传为 trigger-ai-action 事件', async () => {
    const WorkspaceToolOverlayStub = {
      emits: ['trigger-ai-action'],
      template:
        "<button data-testid=\"graph-send-to-ai\" @click=\"$emit('trigger-ai-action', { source: 'workspace', action: 'add_to_chat', title: '图谱角色分析：林舟', text: '角色：林舟' })\">send</button>",
    }

    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [{ id: 'chapter-1', title: '第一章' }],
        content: '这里是正文。',
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          TipTapEditorView: { template: '<div data-testid="tiptap-editor" />' },
          WorkspaceToolOverlay: WorkspaceToolOverlayStub,
        },
      },
    })

    await wrapper.get('[data-testid="graph-send-to-ai"]').trigger('click')

    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0]).toMatchObject({
      source: 'workspace',
      action: 'add_to_chat',
      title: '图谱角色分析：林舟',
    })
  })

  it('未选择章节时应显示空状态', () => {
    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        projectId: 'project-1',
        chapterId: '',
        chapterTitle: '',
        chapters: [],
        content: '',
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          WorkspaceToolOverlay: { template: '<div data-testid="tool-overlay" />' },
          QyIcon: { template: '<span />' },
          QyGhostButton: { template: '<button><slot /></button>' },
        },
      },
    })

    expect(wrapper.text()).toContain('选择章节后开始写作')
    expect(wrapper.find('[data-testid="workspace-writing-surface"]').exists()).toBe(false)
  })

  it('应将共享 workflowContext 和 activeEntities 透传给全屏工具覆盖层', () => {
    const WorkspaceToolOverlayStub = {
      props: ['workflowContext', 'activeEntities', 'chapterId', 'chapterTitle'],
      template: `
        <div
          data-testid="tool-overlay"
          :data-signature="workflowContext?.signature || ''"
          :data-entities="String(activeEntities?.length || 0)"
          :data-chapter-id="chapterId || ''"
          :data-chapter-title="chapterTitle || ''"
        />
      `,
    }

    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [{ id: 'chapter-1', title: '第一章' }],
        content: '这里是正文。',
        workflowContext: {
          signature: 'ctx-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        activeEntities: [
          { id: 'char-1', name: '张三', type: 'character', summary: '紧张' },
          { id: 'loc-1', name: '青石镇', type: 'location' },
        ],
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          TipTapEditorView: { template: '<div data-testid="tiptap-editor" />' },
          WorkspaceToolOverlay: WorkspaceToolOverlayStub,
        },
      },
    })

    const overlay = wrapper.get('[data-testid="tool-overlay"]')
    expect(overlay.attributes('data-signature')).toBe('ctx-1')
    expect(overlay.attributes('data-entities')).toBe('2')
    expect(overlay.attributes('data-chapter-id')).toBe('chapter-1')
    expect(overlay.attributes('data-chapter-title')).toBe('第一章')
  })

  it('应允许为工具覆盖层覆写章节作用域，而不影响主编辑区章节', () => {
    const WorkspaceToolOverlayStub = {
      props: ['chapterId', 'chapterTitle'],
      template: `
        <div
          data-testid="tool-overlay"
          :data-chapter-id="chapterId || ''"
          :data-chapter-title="chapterTitle || ''"
        />
      `,
    }

    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        toolOverlayChapterId: '',
        toolOverlayChapterTitle: '',
        chapters: [{ id: 'chapter-1', title: '第一章' }],
        content: '这里是正文。',
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          TipTapEditorView: { template: '<div data-testid="tiptap-editor" />' },
          WorkspaceToolOverlay: WorkspaceToolOverlayStub,
        },
      },
    })

    const overlay = wrapper.get('[data-testid="tool-overlay"]')
    expect(overlay.attributes('data-chapter-id')).toBe('')
    expect(overlay.attributes('data-chapter-title')).toBe('')
    expect(wrapper.find('[data-testid="workspace-writing-surface"]').exists()).toBe(true)
  })

  it('全屏结构舞台的交给 AI 动作应透传为 trigger-ai-action 事件', async () => {
    const WorkspaceToolOverlayStub = {
      emits: ['trigger-ai-action'],
      template:
        "<button data-testid=\"structure-send-to-ai\" @click=\"$emit('trigger-ai-action', { source: 'workspace', action: 'add_to_chat', title: '结构节点分析：主线冲突', text: '结构节点：主线冲突' })\">send</button>",
    }

    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [{ id: 'chapter-1', title: '第一章' }],
        content: '这里是正文。',
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          TipTapEditorView: { template: '<div data-testid="tiptap-editor" />' },
          WorkspaceToolOverlay: WorkspaceToolOverlayStub,
        },
      },
    })

    await wrapper.get('[data-testid="structure-send-to-ai"]').trigger('click')

    expect(wrapper.emitted('trigger-ai-action')?.[0]?.[0]).toMatchObject({
      source: 'workspace',
      action: 'add_to_chat',
      title: '结构节点分析：主线冲突',
    })
  })
})
