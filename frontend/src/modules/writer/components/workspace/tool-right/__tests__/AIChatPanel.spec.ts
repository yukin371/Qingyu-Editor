import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import AIChatPanel from '../AIChatPanel.vue'

describe('AIChatPanel', () => {
  it('passes ai summary context through to AIWorkbench', () => {
    const AIWorkbenchStub = defineComponent({
      props: ['aiSummaryContextText', 'aiSceneStageSummary', 'sourceText', 'chapters'],
      template:
        '<div><div data-testid="ai-workbench-summary-context">{{ aiSummaryContextText }}</div><div data-testid="ai-workbench-scene-stage">{{ aiSceneStageSummary?.beatTitle }}</div><div data-testid="ai-workbench-source-text">{{ sourceText }}</div><div data-testid="ai-workbench-chapters">{{ chapters.length }}</div></div>',
    })

    const wrapper = mount(AIChatPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [{ id: 'chapter-1', title: '第一章' }],
        sourceText: '当前章节正文',
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
        aiSummaryContextText: '创作蓝图与资产摘要：\n当前章节资产：角色 2；地点 1',
        aiSceneStageSummary: {
          sceneTitle: '雨夜祠堂',
          beatTitle: '主角救下线人',
        },
        draftProposals: [],
      },
      global: {
        stubs: {
          AIWorkbench: AIWorkbenchStub,
        },
      },
    })

    expect(wrapper.get('[data-testid="ai-workbench-summary-context"]').text()).toContain(
      '创作蓝图与资产摘要：',
    )
    expect(wrapper.get('[data-testid="ai-workbench-summary-context"]').text()).toContain(
      '当前章节资产：角色 2；地点 1',
    )
    expect(wrapper.get('[data-testid="ai-workbench-source-text"]').text()).toBe('当前章节正文')
    expect(wrapper.get('[data-testid="ai-workbench-chapters"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="ai-workbench-scene-stage"]').text()).toBe('主角救下线人')
  })
})
