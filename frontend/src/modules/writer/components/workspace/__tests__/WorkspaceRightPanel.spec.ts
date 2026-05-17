import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WorkspaceRightPanel from '../WorkspaceRightPanel.vue'
import { usePanelStore } from '@/modules/writer/stores/panelStore'
import { useWorkspaceLayoutStore } from '@/modules/writer/stores/workspaceLayoutStore'

const baseProps = {
  collapsed: false,
  isImmersiveMode: false,
  projectId: 'project-1',
  chapterId: 'chapter-1',
  chapterTitle: '第一章',
  chapters: [],
  sourceText: '这是当前章节正文。',
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

describe('WorkspaceRightPanel', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  const mountPanel = () =>
    mount(WorkspaceRightPanel, {
      props: baseProps,
      global: {
        stubs: {
          ToolRightPanel: {
            template: '<div data-testid="tool-right-panel-stub" />',
          },
          QyIcon: true,
        },
      },
    })

  it('renders five right-tool activity buttons', () => {
    const wrapper = mountPanel()

    expect(wrapper.findAll('.workspace-activity-bar__item')).toHaveLength(5)
  })

  it('switches active tool and keeps body visible when selecting a different tool', async () => {
    const wrapper = mountPanel()
    const layoutStore = useWorkspaceLayoutStore()

    expect(layoutStore.rightToolArea.activeTool).toBe('ai')
    expect(layoutStore.rightToolArea.visible).toBe(true)

    await wrapper.findAll('.workspace-activity-bar__item')[1].trigger('click')

    expect(layoutStore.rightToolArea.activeTool).toBe('assets')
    expect(layoutStore.rightToolArea.visible).toBe(true)
    expect(wrapper.classes()).not.toContain('is-collapsed')
  })

  it('clicking the same tool toggles the tool body closed', async () => {
    const wrapper = mountPanel()
    const layoutStore = useWorkspaceLayoutStore()
    const panelStore = usePanelStore()

    await wrapper.findAll('.workspace-activity-bar__item')[0].trigger('click')

    expect(layoutStore.rightToolArea.visible).toBe(false)
    expect(panelStore.rightCollapsed).toBe(true)
    expect(wrapper.classes()).toContain('is-collapsed')
  })

  it('expands from panelStore collapsed state before activating the selected tool', async () => {
    const wrapper = mountPanel()
    const layoutStore = useWorkspaceLayoutStore()
    const panelStore = usePanelStore()

    panelStore.setRightCollapsed(true)
    layoutStore.setRightToolVisible(false)

    await wrapper.findAll('.workspace-activity-bar__item')[3].trigger('click')

    expect(panelStore.rightCollapsed).toBe(false)
    expect(layoutStore.rightToolArea.visible).toBe(true)
    expect(layoutStore.rightToolArea.activeTool).toBe('proofread')
  })

  it('closes the right tool body when the tool panel emits close', async () => {
    const wrapper = mount(WorkspaceRightPanel, {
      props: baseProps,
      global: {
        stubs: {
          ToolRightPanel: {
            template: '<button data-testid="close-tool" @click="$emit(\'close\')" />',
          },
          QyIcon: true,
        },
      },
    })
    const layoutStore = useWorkspaceLayoutStore()

    await wrapper.get('[data-testid="close-tool"]').trigger('click')

    expect(layoutStore.rightToolArea.visible).toBe(false)
    expect(usePanelStore().rightCollapsed).toBe(true)
  })
})
