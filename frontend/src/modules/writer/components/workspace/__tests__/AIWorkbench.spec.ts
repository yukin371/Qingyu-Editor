import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import AIWorkbench from '../AIWorkbench.vue'

describe('AIWorkbench', () => {
  const findStateRail = (wrapper: VueWrapper<any>) => {
    const primary = wrapper.find('[data-testid="workflow-state-rail"]')
    if (primary.exists()) {
      return primary
    }
    return wrapper.find('[data-testid="workflow-feedback-strip"]')
  }

  const findResultSection = (wrapper: VueWrapper<any>) => {
    const selectors = ['[data-testid="workflow-result-card"]', '[data-testid="ai-result-card"]']
    for (const selector of selectors) {
      const match = wrapper.find(selector)
      if (match.exists()) {
        return match
      }
    }
    return wrapper.find('[data-testid="result-section"]')
  }

  const findPromoteButton = (sectionWrapper: VueWrapper<any>) => {
    const selectors = [
      '[data-testid="workflow-result-action"]',
      '[data-testid="workflow-result-card-action"]',
    ]
    for (const selector of selectors) {
      const button = sectionWrapper.find(selector)
      if (button.exists()) {
        return button
      }
    }
    const fallback = sectionWrapper.find('button')
    if (fallback.exists()) {
      return fallback
    }
    return sectionWrapper.find('.workflow-result-card__action')
  }

  it('uses the tab row as the only visible workbench header', () => {
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          pendingChangeRequestCount: 3,
        },
        draftProposals: [
          {
            id: 'proposal-1',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '章节方向提案',
            summary: '保留冲突升级主线',
            generatedText: '保留冲突升级主线',
            sourceText: '第一章',
            status: 'draft',
            createdAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          AIPanel: true,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    expect(wrapper.find('.ai-workbench__title').exists()).toBe(false)
    expect(wrapper.text()).toContain('对话协作')
    expect(wrapper.text()).not.toContain('待处理 3')
    expect(wrapper.text()).not.toContain('草案 1')
  })

  it('renders apply feedback and switches tabs from action triggers', async () => {
    const RewriteWorkbenchToolStub = defineComponent({
      props: ['workflowContext'],
      template: '<div data-testid="rewrite-tool">{{ workflowContext?.chapterTitle }}</div>',
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: {
          status: 'fallback',
          title: '选区已失效，改为安全回填',
          detail: '原选区内容已变化，系统改为按段落写回。',
          mode: 'replace_selection',
          updatedAt: Date.now(),
        },
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
          AIPanel: true,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: RewriteWorkbenchToolStub,
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 1,
        action: 'rewrite',
        text: '测试片段',
        applyMode: 'replace_selection',
      },
    })
    await nextTick()

    const rail = findStateRail(wrapper)
    expect(rail.exists()).toBe(true)
    expect(wrapper.find('[data-testid="workflow-feedback-strip"]').exists()).toBe(true)
    expect(rail.text()).toContain('选区已失效')
    expect(wrapper.get('[data-testid="rewrite-tool"]').text()).toContain('第一章')
  })

  it('passes current chapter source text down to chat AIPanel', () => {
    const AIPanelStub = defineComponent({
      props: ['sourceText'],
      template: '<div data-testid="ai-panel-source-text">{{ sourceText }}</div>',
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="ai-panel-source-text"]').text()).toBe('这是当前章节正文。')
  })

  it('promotes AI result candidates into proposal drafts through emitted events', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-result\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '生成了一条新方向', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          pendingChangeRequestCount: 2,
        },
        draftProposals: [],
      },
      global: {
        stubs: {
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-result"]').trigger('click')
    const resultSection = findResultSection(wrapper)
    expect(resultSection.exists()).toBe(true)

    const promoteButton = findPromoteButton(resultSection)
    expect(promoteButton.exists()).toBe(true)
    await promoteButton.trigger('click')

    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'chat',
      action: 'chat',
      generatedText: '新的剧情方向',
    })
  })

  it('clears stale result candidate once a newer workflow trigger arrives', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-trigger-reset-result\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '生成了一条新方向', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-trigger-reset-result"]').trigger('click')
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)

    await wrapper.setProps({
      actionTrigger: {
        id: 77,
        action: 'rewrite',
        text: '请重写这一段',
      },
    })
    await nextTick()

    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(false)
  })

  it('clears stale result candidate when chapter context changes', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-chapter-reset-result\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '生成了一条新方向', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-chapter-reset-result"]').trigger('click')
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)

    await wrapper.setProps({
      chapterId: 'chapter-2',
      chapterTitle: '第二章',
      sourceText: '这是第二章正文。',
      workflowContext: {
        signature: 'chapter-2',
        projectId: 'project-1',
        chapterId: 'chapter-2',
        chapterTitle: '第二章',
        scopeLabel: '第二场',
        activeCharacters: [],
        activeRelations: [],
        pendingChangeRequests: [],
        pendingChangeRequestCount: 0,
      },
    })
    await nextTick()

    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="workflow-state-rail"]').exists()).toBe(false)
  })

  it('keeps proposal as primary card while allowing result promotion inside the workflow rail', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-result\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '生成了一条新方向', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: {
          status: 'success',
          title: '已按选区回填',
          detail: 'AI 结果已替换当前选区。',
          mode: 'replace_selection',
          updatedAt: Date.now(),
        },
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
        draftProposals: [
          {
            id: 'proposal-1',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '章节方向提案',
            summary: '保留冲突升级主线',
            generatedText: '保留冲突升级主线',
            sourceText: '第一章',
            status: 'draft',
            createdAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-result"]').trigger('click')

    const rail = wrapper.get('[data-testid="workflow-state-rail"]')
    expect(rail.attributes('aria-live')).toBe('polite')
    expect(rail.find('[data-testid="workflow-feedback-strip"]').exists()).toBe(true)
    const proposalCard = rail.get('[data-testid="proposal-card"]')
    expect(proposalCard.classes()).toContain('proposal-card--condensed')
    expect(proposalCard.get('[data-testid="proposal-card-meta"]').text()).toContain('草稿')
    expect(proposalCard.get('[data-testid="proposal-card-meta"]').text()).toContain('方向')
    expect(proposalCard.get('[data-testid="proposal-card-meta"]').text()).toContain('总结')
    expect(proposalCard.find('[data-testid="proposal-card-summary"]').exists()).toBe(false)
    expect(rail.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
    expect(rail.find('[data-testid="workflow-result-action"]').exists()).toBe(true)
    expect(rail.get('[data-testid="workflow-result-meta"]').text()).toContain('候选')
    expect(rail.get('[data-testid="workflow-result-meta"]').text()).toContain('对话')
    expect(rail.get('[data-testid="workflow-result-meta"]').text()).toContain('正文')
    expect(rail.find('[data-testid="workflow-result-summary"]').exists()).toBe(false)
    expect(rail.get('[data-testid="workflow-result-action"]').text()).toBe('存为正文')
    expect(rail.get('[data-testid="workflow-result-action"]').attributes('aria-label')).toContain(
      '存为正文提案',
    )
    expect(rail.get('.proposal-card__action').attributes('aria-label')).toContain('章节方向提案')
    expect(rail.get('.proposal-card__action').text()).toBe('定为方向')

    await rail.find('[data-testid="workflow-result-action"]').trigger('click')
    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'chat',
      action: 'chat',
      generatedText: '新的剧情方向',
    })
  })

  it('shows lightweight editor diff status for direct whole-document edits', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate', 'apply-generated-text'],
      template:
        "<button data-testid=\"emit-direct-edit-result\" @click=\"$emit('result-candidate', { source: 'rewrite', action: 'direct_edit', title: 'AI 直接改写结果', summary: '已生成新的正文版本。', generatedText: '重写后的第一段\\n第二段更紧张。', sourceText: '原始第一段\\n第二段。' }); $emit('apply-generated-text', { action: 'direct_edit', sourceText: '原始第一段\\n第二段。', generatedText: '重写后的第一段\\n第二段更紧张。', applyMode: 'replace_document' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: {
          id: 100,
          action: 'rewrite',
          text: '把这一章改得更紧张',
          applyMode: 'replace_document',
        },
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
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-direct-edit-result"]').trigger('click')

    const diffCard = wrapper.get('[data-testid="workflow-diff-card"]')
    expect(diffCard.text()).toContain('正文已挂起')
    expect(diffCard.text()).toContain('整章改写')
    expect(diffCard.text()).toContain('请直接在正文区域接受或放弃')
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(false)
    expect(diffCard.text()).not.toContain('修改前')
    expect(diffCard.text()).not.toContain('修改后')
    expect(diffCard.text()).not.toContain('原始第一段 第二段。')
    expect(diffCard.text()).not.toContain('重写后的第一段 第二段更紧张。')
  })

  it('forwards chat apply payload immediately and keeps revision entry in diff rail', async () => {
    const AIPanelStub = defineComponent({
      emits: ['apply-generated-text'],
      template:
        "<button data-testid=\"emit-apply-generated-text\" @click=\"$emit('apply-generated-text', { action: 'rewrite', sourceText: '原文', generatedText: '新文', applyMode: 'replace_document' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-apply-generated-text"]').trigger('click')

    const applyPayload = wrapper.emitted('applyGeneratedText')?.[0]?.[0]
    expect(applyPayload).toMatchObject({
      action: 'rewrite',
      sourceText: '原文',
      generatedText: '新文',
      applyMode: 'replace_document',
    })

    expect(wrapper.find('[data-testid="workflow-diff-card"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="workflow-diff-actions"]').text()).toContain('继续修改')
    expect(wrapper.text()).toContain('本侧栏不再重复展示前后对比')
  })

  it('injects pending candidate back into chat panel when continuing revision', async () => {
    const AIPanelStub = defineComponent({
      props: ['revisionSeed'],
      emits: ['apply-generated-text'],
      template:
        "<div><button data-testid=\"emit-apply-generated-text\" @click=\"$emit('apply-generated-text', { action: 'rewrite', sourceText: '原文', generatedText: '新文', applyMode: 'replace_document' })\">emit</button><div data-testid=\"revision-seed-text\">{{ revisionSeed?.text || \"empty\" }}</div></div>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-apply-generated-text"]').trigger('click')
    await wrapper.find('[data-testid="workflow-revise-action"]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-testid="revision-seed-text"]').text()).toBe('新文')
  })

  it('clears pending diff rail and stale hidden candidate after apply feedback arrives', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate', 'apply-generated-text'],
      template:
        "<button data-testid=\"emit-edit-with-hidden-result\" @click=\"$emit('result-candidate', { source: 'rewrite', action: 'rewrite', title: 'AI 改写候选', summary: '新的正文版本', generatedText: '新文', sourceText: '原文' }); $emit('apply-generated-text', { action: 'rewrite', sourceText: '原文', generatedText: '新文', applyMode: 'replace_document' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-edit-with-hidden-result"]').trigger('click')

    expect(wrapper.find('[data-testid="workflow-diff-card"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(false)

    await wrapper.setProps({
      aiApplyFeedback: {
        status: 'success',
        title: '已更新正文',
        detail: '正文已接受最新改写。',
        mode: 'replace_document',
        updatedAt: Date.now(),
      },
    })
    await nextTick()

    expect(wrapper.find('[data-testid="workflow-diff-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="workflow-feedback-strip"]').exists()).toBe(true)
  })

  it('renders workflow state rail with aiApplyFeedback and still promotes result card action alongside proposal drafts', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-state-result\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '新状态流结果', generatedText: '新的剧情方向', sourceText: '上次选区' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: {
          status: 'success',
          title: '已更新正文',
          detail: 'AI 结果已应用',
          updatedAt: Date.now(),
        },
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
        draftProposals: [
          {
            id: 'proposal-main',
            kind: 'text-draft',
            source: 'review-workbench',
            title: '审校建议提案',
            summary: '审校完成',
            generatedText: '审校完成',
            sourceText: '第一章',
            status: 'draft',
            createdAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: AIPanelStub,
        },
      },
    })

    expect(wrapper.find('[data-testid="workflow-state-rail"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="workflow-feedback-strip"]').exists()).toBe(true)
    expect(wrapper.get('.proposal-card__action').text()).toBe('定为正文')

    await wrapper.find('[data-testid="emit-state-result"]').trigger('click')
    const resultSection = findResultSection(wrapper)
    expect(resultSection.exists()).toBe(true)
    expect(wrapper.get('[data-testid="proposal-card"]').classes()).toContain(
      'proposal-card--condensed',
    )
    expect(wrapper.find('[data-testid="proposal-card-summary"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="workflow-result-summary"]').exists()).toBe(false)

    const promoteButton = findPromoteButton(resultSection)
    expect(promoteButton.exists()).toBe(true)

    await promoteButton.trigger('click')
    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'chat',
      action: 'chat',
    })
  })

  it('keeps selected proposal lifecycle feedback quiet once the retained card is visible', () => {
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
        draftProposals: [
          {
            id: 'proposal-selected',
            kind: 'text-draft',
            source: 'review-workbench',
            title: '审校建议提案',
            summary: '审校完成',
            generatedText: '审校完成',
            sourceText: '第一章',
            status: 'selected',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="proposal-feedback-strip"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="proposal-card"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="proposal-card-meta"]').text()).toContain('保留')
    expect(wrapper.text()).toContain('审校建议提案')
  })

  it('condenses selected proposal card once a newer result candidate is visible', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-result-on-selected\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '新的处理建议', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
        draftProposals: [
          {
            id: 'proposal-selected',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '已保留方向',
            summary: '当前采用方案',
            generatedText: '已保留方向',
            sourceText: '第一章',
            status: 'selected',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: AIPanelStub,
        },
      },
    })

    await wrapper.find('[data-testid="emit-result-on-selected"]').trigger('click')

    const proposalCard = wrapper.get('[data-testid="proposal-card"]')
    expect(proposalCard.classes()).toContain('proposal-card--condensed')
    expect(proposalCard.find('[data-testid="proposal-card-summary"]').exists()).toBe(false)
    expect(proposalCard.text()).toContain('已保留方向')
    expect(proposalCard.text()).toContain('移出')
    expect(proposalCard.get('.proposal-card__action--ghost').attributes('aria-label')).toContain(
      '移出提案 已保留方向',
    )
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="workflow-result-summary"]').exists()).toBe(false)
  })

  it('hides stale apply feedback once retained proposal and newer result candidate enter condensed state', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-result-on-selected-with-apply\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '新的处理建议', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: {
          status: 'success',
          title: '已按选区回填',
          detail: 'AI 结果已替换当前选区。',
          mode: 'replace_selection',
          updatedAt: Date.now(),
        },
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
        draftProposals: [
          {
            id: 'proposal-selected-with-apply',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '已保留方向',
            summary: '当前采用方案',
            generatedText: '已保留方向',
            sourceText: '第一章',
            status: 'selected',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: AIPanelStub,
        },
      },
    })

    expect(wrapper.find('[data-testid="workflow-feedback-strip"]').exists()).toBe(true)

    await wrapper.find('[data-testid="emit-result-on-selected-with-apply"]').trigger('click')

    expect(wrapper.find('[data-testid="workflow-feedback-strip"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="proposal-card"]').classes()).toContain(
      'proposal-card--condensed',
    )
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
  })

  it('prioritizes selected proposal over draft when choosing primary proposal card', () => {
    const now = Date.now()
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
        draftProposals: [
          {
            id: 'proposal-draft',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '新的草稿方向',
            summary: '还未确认',
            generatedText: '新的草稿方向',
            sourceText: '第一章',
            status: 'draft',
            createdAt: now - 50,
            updatedAt: now,
          },
          {
            id: 'proposal-selected',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '已保留方向',
            summary: '当前采用方案',
            generatedText: '已保留方向',
            sourceText: '第一章',
            status: 'selected',
            createdAt: now - 100,
            updatedAt: now - 10,
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="proposal-card"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="proposal-card-meta"]').text()).toContain('保留')
    expect(wrapper.text()).toContain('已保留方向')
    expect(wrapper.text()).not.toContain('新的草稿方向')
  })

  it('hides discarded-only proposals while keeping discard feedback inside the rail', () => {
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
        draftProposals: [
          {
            id: 'proposal-discarded',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '旧方向提案',
            summary: '已不再采用',
            generatedText: '旧方向提案',
            sourceText: '第一章',
            status: 'discarded',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="workflow-state-rail"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="proposal-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="proposal-feedback-strip"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="proposal-feedback-strip"]').text()).toContain(
      '方向提案已移出',
    )
    expect(wrapper.get('[data-testid="proposal-feedback-strip"]').text()).toContain('总结')
    expect(wrapper.get('[data-testid="proposal-feedback-strip"]').text()).toContain('旧方向提案')
  })

  it('suppresses discarded lifecycle feedback when a newer result candidate arrives', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-result-after-discard\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '新的处理建议', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
        draftProposals: [
          {
            id: 'proposal-discarded',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '旧方向提案',
            summary: '已不再采用',
            generatedText: '旧方向提案',
            sourceText: '第一章',
            status: 'discarded',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: AIPanelStub,
        },
      },
    })

    expect(wrapper.find('[data-testid="proposal-feedback-strip"]').exists()).toBe(true)

    await wrapper.find('[data-testid="emit-result-after-discard"]').trigger('click')

    expect(wrapper.find('[data-testid="proposal-feedback-strip"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="proposal-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
  })

  it('routes add_to_chat actions to chat tab via shared workflow resolver', async () => {
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          AIPanel: true,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 9,
        action: 'add_to_chat',
        text: '来自 Story Harness 的建议',
      },
    })
    await nextTick()

    expect(wrapper.html()).toContain('a-i-panel-stub')
  })

  it('surfaces summary results through the shared workflow result card', async () => {
    const SummaryWorkbenchToolStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-summary\" @click=\"$emit('result-candidate', { source: 'summary', action: 'summarize_chapter', title: '章节方向提案', summary: '本章应聚焦冲突升级', generatedText: '本章应聚焦冲突升级\\n\\n核心要点：\\n- 张三主动试探\\n- 李四暂不表态', sourceText: '第一章' })\">emit-summary</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          pendingChangeRequestCount: 1,
        },
        draftProposals: [],
      },
      global: {
        stubs: {
          AIPanel: true,
          SummaryWorkbenchTool: SummaryWorkbenchToolStub,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 11,
        action: 'summarize_chapter',
        text: '这是当前章节正文。',
      },
    })
    await nextTick()

    await wrapper.find('[data-testid="emit-summary"]').trigger('click')
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('候选')
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('总结')
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('方向')
    expect(wrapper.text()).toContain('章节方向提案')
    expect(wrapper.get('[data-testid="workflow-result-summary"]').text()).toContain(
      '本章应聚焦冲突升级',
    )
    expect(wrapper.get('[data-testid="workflow-result-action"]').text()).toBe('存为方向')

    await wrapper.find('.workflow-result-card__action').trigger('click')
    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'summary',
      action: 'summarize_chapter',
      title: '章节方向提案',
    })
  })

  it('relays structure-plan apply events from summary workbench', async () => {
    const SummaryWorkbenchToolStub = defineComponent({
      emits: ['apply-structure-plan'],
      template:
        "<button data-testid=\"emit-structure-plan\" @click=\"$emit('apply-structure-plan', { mode: 'chapter', prompt: '补两个后续章节', summary: '建议补 2 个后续章节。', items: [{ title: '夜探旧仓库', summary: '主角第一次确认线索方向。' }] })\">emit-structure-plan</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          AIPanel: true,
          SummaryWorkbenchTool: SummaryWorkbenchToolStub,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 13,
        action: 'summarize_chapter',
        text: '这是当前章节正文。',
      },
    })
    await nextTick()
    await wrapper.find('[data-testid="emit-structure-plan"]').trigger('click')

    expect(wrapper.emitted('applyStructurePlan')?.[0]?.[0]).toMatchObject({
      mode: 'chapter',
      summary: '建议补 2 个后续章节。',
    })
  })

  it('surfaces review results through the shared workflow result card', async () => {
    const ReviewWorkbenchToolStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-review\" @click=\"$emit('result-candidate', { source: 'review', action: 'proofread', title: '审校建议提案', summary: '检测到 2 条语言问题', generatedText: '审校评分：8.5\\n1. 语法：建议调整句式', sourceText: '第一章正文' })\">emit-review</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
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
          pendingChangeRequestCount: 1,
        },
        draftProposals: [],
      },
      global: {
        stubs: {
          AIPanel: true,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: ReviewWorkbenchToolStub,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 12,
        action: 'proofread',
        text: '这是当前章节正文。',
      },
    })
    await nextTick()

    await wrapper.find('[data-testid="emit-review"]').trigger('click')
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('候选')
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('审校')
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('正文')
    expect(wrapper.text()).toContain('审校建议提案')
    expect(wrapper.get('[data-testid="workflow-result-summary"]').text()).toContain(
      '检测到 2 条语言问题',
    )
    expect(wrapper.get('[data-testid="workflow-result-action"]').text()).toBe('存为正文')

    await wrapper.find('.workflow-result-card__action').trigger('click')
    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'review',
      action: 'proofread',
      title: '审校建议提案',
    })
  })
})
