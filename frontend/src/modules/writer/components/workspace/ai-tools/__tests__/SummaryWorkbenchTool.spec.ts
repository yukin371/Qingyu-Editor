import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SummaryWorkbenchTool from '../SummaryWorkbenchTool.vue'

const summarizeSelection = vi.fn()
const summarizeChapter = vi.fn()
const generateStructurePlan = vi.fn()

vi.mock('@/modules/ai/api/workbench', () => ({
  summarizeSelection: (...args: unknown[]) => summarizeSelection(...args),
  summarizeChapter: (...args: unknown[]) => summarizeChapter(...args),
  generateStructurePlan: (...args: unknown[]) => generateStructurePlan(...args),
}))

describe('SummaryWorkbenchTool', () => {
  beforeEach(() => {
    summarizeSelection.mockReset()
    summarizeChapter.mockReset()
    generateStructurePlan.mockReset()
    summarizeSelection.mockResolvedValue({
      summary: '这一段主要呈现张三对李四的试探。',
      keyPoints: ['张三先试探', '李四暂不回应'],
    })
    summarizeChapter.mockResolvedValue({
      summary: '本章应聚焦双方试探升级。',
      keyPoints: ['张三主动施压', '李四继续隐藏真实态度'],
    })
    generateStructurePlan.mockResolvedValue({
      summary: '建议补 2 个后续章节。',
      items: [
        {
          title: '夜探旧仓库',
          summary: '主角第一次确认线索方向。',
          reason: '补足冲突升级节点。',
        },
        {
          title: '街口对峙',
          summary: '反派提前亮相。',
          reason: '把压力前置到下一段。',
        },
      ],
    })
  })

  it('emits a summary result candidate for selection summaries', async () => {
    const wrapper = mount(SummaryWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三试探李四。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')

    expect(summarizeSelection).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]).toMatchObject({
      source: 'summary',
      action: 'summary',
      title: '片段摘要结果',
    })
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]?.generatedText).toContain('核心要点：')
  })

  it('emits a chapter-direction candidate for chapter summaries', async () => {
    const wrapper = mount(SummaryWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '整章正文。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__primary').trigger('click')

    expect(summarizeChapter).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]).toMatchObject({
      source: 'summary',
      action: 'summarize_chapter',
      title: '章节方向提案',
      sourceText: '第一章',
    })
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]?.generatedText).toContain(
      '本章应聚焦双方试探升级。',
    )
  })

  it('shows unified running and ready status copy', async () => {
    let resolveSelection: (value: { summary: string; keyPoints: string[] }) => void
    summarizeSelection.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSelection = resolve
        }),
    )

    const wrapper = mount(SummaryWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三试探李四。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')
    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--running')
    expect(wrapper.get('.tool-panel__status').text()).toContain('处理中')

    resolveSelection!({
      summary: '收到 summary',
      keyPoints: [],
    })
    await flushPromises()
    await nextTick()

    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--success')
    expect(wrapper.get('.tool-panel__status').text()).toContain('已就绪')
  })

  it('shows synced status copy when summary action is injected before execution', () => {
    const wrapper = mount(SummaryWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '',
        actionTrigger: {
          source: 'summary',
          action: 'summary',
          text: '',
        },
      },
    })

    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--warning')
    expect(wrapper.get('.tool-panel__status').text()).toContain('已同步')
  })

  it('auto-executes chapter summary when summarize_chapter trigger arrives', async () => {
    const wrapper = mount(SummaryWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '',
        actionTrigger: null,
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 'trigger-chapter-1',
        action: 'summarize_chapter',
        text: '整章内容概要',
      },
    })

    await flushPromises()
    await nextTick()

    // Should have auto-executed the chapter summary
    expect(summarizeChapter).toHaveBeenCalledTimes(1)
    expect(summarizeChapter).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        chapterId: 'chapter-1',
      }),
    )

    // Should emit a chapter-direction result candidate
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]).toMatchObject({
      source: 'summary',
      action: 'summarize_chapter',
      title: '章节方向提案',
    })
  })

  it('generates structure plans and emits applyStructurePlan payloads', async () => {
    const wrapper = mount(SummaryWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三试探李四。',
        actionTrigger: null,
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
      },
    })

    await wrapper.get('.result-card--planner .tool-panel__primary').trigger('click')
    await flushPromises()
    await nextTick()

    expect(generateStructurePlan).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        chapterId: 'chapter-1',
        mode: 'chapter',
      }),
    )
    expect(wrapper.text()).toContain('夜探旧仓库')

    await wrapper.get('.result-card__action--primary').trigger('click')

    expect(wrapper.emitted('applyStructurePlan')?.[0]?.[0]).toMatchObject({
      mode: 'chapter',
      summary: '建议补 2 个后续章节。',
    })
    expect(wrapper.emitted('applyStructurePlan')?.[0]?.[0].items).toHaveLength(2)
  })
})
