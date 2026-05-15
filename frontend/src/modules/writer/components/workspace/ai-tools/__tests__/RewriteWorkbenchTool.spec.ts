import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RewriteWorkbenchTool from '../RewriteWorkbenchTool.vue'

const rewriteWithWorkbench = vi.fn()

vi.mock('@/modules/ai/api/workbench', () => ({
  rewriteWithWorkbench: (...args: unknown[]) => rewriteWithWorkbench(...args),
}))

describe('RewriteWorkbenchTool', () => {
  beforeEach(() => {
    rewriteWithWorkbench.mockReset()
    rewriteWithWorkbench.mockResolvedValue({ rewrittenText: '改写后的文本。' })
  })

  it('merges workflow context prompt into rewrite instructions', async () => {
    const wrapper = mount(RewriteWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '原始文本',
        actionTrigger: null,
        aiSummaryContextText: '创作蓝图与资产摘要：\n当前章节资产：角色 2；地点 1',
        workflowContext: {
          signature: 'sig-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 2,
        },
      },
    })

    await wrapper.get('input[type="text"]').setValue('保持节奏紧凑')
    await wrapper.get('.tool-panel__primary').trigger('click')

    expect(rewriteWithWorkbench).toHaveBeenCalledTimes(1)
    expect(rewriteWithWorkbench).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        chapterId: 'chapter-1',
        originalText: '原始文本',
        instructions: expect.stringContaining('保持节奏紧凑'),
      }),
    )

    const payload = rewriteWithWorkbench.mock.calls[0][0] as {
      instructions?: string
      chapterId?: string
    }
    expect(payload.instructions).toContain('当前工作流上下文：')
    expect(payload.instructions).toContain('章节：第一章')
    expect(payload.instructions).toContain('场景作用域：第一场')
    expect(payload.instructions).toContain('创作蓝图与资产摘要：')
    expect(payload.instructions).toContain('当前章节资产：角色 2；地点 1')
  })

  it('keeps instructions undefined when both manual and workflow context are empty', async () => {
    const wrapper = mount(RewriteWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: '',
        chapterTitle: '',
        seedText: '原始文本',
        actionTrigger: null,
        workflowContext: null,
      },
    })

    await wrapper.get('.tool-panel__primary').trigger('click')

    expect(rewriteWithWorkbench).toHaveBeenCalledTimes(1)
    const payload = rewriteWithWorkbench.mock.calls[0][0] as {
      instructions?: string
      chapterId?: string
    }
    expect(payload.instructions).toBeUndefined()
    expect(payload.chapterId).toBeUndefined()
  })

  it('shows unified running and ready status copy', async () => {
    let resolveRun: (value: { rewrittenText: string }) => void
    rewriteWithWorkbench.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRun = resolve
        }),
    )

    const wrapper = mount(RewriteWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '原始文本',
        actionTrigger: null,
        workflowContext: null,
      },
    })

    await wrapper.get('.tool-panel__primary').trigger('click')
    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--running')
    expect(wrapper.get('.tool-panel__status').text()).toContain('处理中')

    resolveRun!({ rewrittenText: '新的文本' })
    await flushPromises()
    await nextTick()

    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--success')
    expect(wrapper.get('.tool-panel__status').text()).toContain('已就绪')
  })

  it('shows synced status copy when action trigger is present before execution', () => {
    const wrapper = mount(RewriteWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '',
        actionTrigger: {
          action: 'rewrite',
          text: '',
          applyMode: 'replace_selection',
        },
        workflowContext: null,
      },
    })

    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--warning')
    expect(wrapper.get('.tool-panel__status').text()).toContain('已同步')
  })

  it('auto-executes rewrite when action trigger with text arrives', async () => {
    const wrapper = mount(RewriteWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '',
        actionTrigger: null,
        workflowContext: null,
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 'trigger-auto-1',
        action: 'rewrite',
        text: '这段文字需要润色。',
        applyMode: 'replace_selection' as const,
      },
    })

    await flushPromises()
    await nextTick()

    // Should have auto-executed the rewrite
    expect(rewriteWithWorkbench).toHaveBeenCalledTimes(1)
    expect(rewriteWithWorkbench).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        originalText: '这段文字需要润色。',
        mode: 'polish',
      }),
    )

    // Should show the result
    expect(wrapper.get('.tool-panel__status').text()).toContain('已就绪')
    expect(wrapper.find('.result-card').exists()).toBe(true)
  })

  it('shows unified offline message when ai service is unavailable', async () => {
    rewriteWithWorkbench.mockRejectedValue({ message: 'Network Error' })

    const wrapper = mount(RewriteWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '原始文本',
        actionTrigger: null,
        workflowContext: null,
      },
    })

    await wrapper.get('.tool-panel__primary').trigger('click')
    await flushPromises()

    expect(wrapper.get('.tool-state-card--error').text()).toContain('AI 服务连接失败，请确认本地 AI 服务已启动。')
  })
})
