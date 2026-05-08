import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

vi.mock('@/modules/writer/components/v3/story-harness/StoryHarnessPanel.vue', () => ({
  default: defineComponent({
    name: 'StoryHarnessPanelMock',
    template: '<div data-testid="story-harness-module-mock" />',
  }),
}))

import WorkspaceRightPanel from '../WorkspaceRightPanel.vue'

describe('WorkspaceRightPanel', () => {
  it('forwards source text into AIWorkbench and relays ai-apply outward', async () => {
    const AIWorkbenchStub = defineComponent({
      props: ['sourceText'],
      emits: ['apply-generated-text'],
      template:
        "<div><div data-testid=\"forwarded-source-text\">{{ sourceText }}</div><button data-testid=\"forward-apply\" @click=\"$emit('apply-generated-text', { action: 'rewrite', sourceText: '原文', generatedText: '新文', applyMode: 'replace_document' })\">apply</button></div>",
    })

    const wrapper = mount(WorkspaceRightPanel, {
      props: {
        collapsed: false,
        isImmersiveMode: false,
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
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
      },
      global: {
        stubs: {
          AIWorkbench: AIWorkbenchStub,
          StoryHarnessPanel: true,
          QyIcon: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="forwarded-source-text"]').text()).toBe('这是当前章节正文。')

    await wrapper.get('[data-testid="forward-apply"]').trigger('click')

    expect(wrapper.emitted('ai-apply')?.[0]?.[0]).toMatchObject({
      action: 'rewrite',
      sourceText: '原文',
      generatedText: '新文',
      applyMode: 'replace_document',
    })
  })

  it('switches harness through side activity button without top tabs', async () => {
    const StoryHarnessPanelStub = defineComponent({
      template: '<div data-testid="story-harness-panel">harness</div>',
    })

    const wrapper = mount(WorkspaceRightPanel, {
      props: {
        collapsed: false,
        isImmersiveMode: false,
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
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
        harnessData: {
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          content: '章节内容',
          chapterCount: 1,
        },
      },
      global: {
        stubs: {
          AIWorkbench: true,
          StoryHarnessPanel: StoryHarnessPanelStub,
          QyIcon: true,
        },
      },
    })

    expect(wrapper.find('.workspace-right-panel-tabs').exists()).toBe(false)
    expect(wrapper.findAll('.workspace-activity-bar__item')[0].classes()).toContain('active')
    expect(wrapper.findAll('.workspace-activity-bar__item')[1].classes()).not.toContain('active')

    await wrapper.findAll('.workspace-activity-bar__item')[1].trigger('click')

    expect(wrapper.findAll('.workspace-activity-bar__item')[1].classes()).toContain('active')
    expect(wrapper.text()).toContain('当前章节分析台')
  })

  it('relays structure-plan creation requests outward', async () => {
    const AIWorkbenchStub = defineComponent({
      emits: ['apply-structure-plan'],
      template:
        "<button data-testid=\"forward-structure-plan\" @click=\"$emit('apply-structure-plan', { mode: 'chapter', prompt: '补两个后续章节', summary: '建议补 2 个后续章节。', items: [{ title: '夜探旧仓库' }] })\">plan</button>",
    })

    const wrapper = mount(WorkspaceRightPanel, {
      props: {
        collapsed: false,
        isImmersiveMode: false,
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
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
      },
      global: {
        stubs: {
          AIWorkbench: AIWorkbenchStub,
          StoryHarnessPanel: true,
          QyIcon: true,
        },
      },
    })

    await wrapper.get('[data-testid="forward-structure-plan"]').trigger('click')

    expect(wrapper.emitted('create-structure-plan')?.[0]?.[0]).toMatchObject({
      mode: 'chapter',
      summary: '建议补 2 个后续章节。',
    })
  })
})
