import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ReviewWorkbenchTool from '../ReviewWorkbenchTool.vue'

const proofreadContent = vi.fn()
const auditSensitiveWords = vi.fn()

vi.mock('@/modules/ai/api/workbench', () => ({
  proofreadContent: (...args: unknown[]) => proofreadContent(...args),
  auditSensitiveWords: (...args: unknown[]) => auditSensitiveWords(...args),
}))

describe('ReviewWorkbenchTool', () => {
  beforeEach(() => {
    proofreadContent.mockReset()
    auditSensitiveWords.mockReset()

    proofreadContent.mockResolvedValue({
      issues: [
        {
          id: 'issue-1',
          type: 'grammar',
          severity: 'medium',
          message: '建议调整语序以减少歧义',
          suggestions: ['将主语提前', '缩短从句'],
        },
      ],
      score: 86.5,
    })

    auditSensitiveWords.mockResolvedValue({
      sensitiveWords: [
        {
          id: 'risk-1',
          word: '极端措辞',
          suggestion: '建议替换为更中性表达',
        },
      ],
    })
  })

  it('emits a review result candidate for proofread results', async () => {
    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三在雨夜里盯着李四，情绪极端。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')

    expect(proofreadContent).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]).toMatchObject({
      source: 'review',
      action: 'proofread',
      title: '审校建议提案',
    })
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]?.generatedText).toContain(
      '建议调整语序以减少歧义',
    )
  })

  it('emits a review result candidate for audit results', async () => {
    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三在雨夜里盯着李四，情绪极端。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__primary').trigger('click')

    expect(auditSensitiveWords).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]).toMatchObject({
      source: 'review',
      action: 'audit',
      title: '风险复核提案',
    })
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]?.generatedText).toContain('极端措辞')
  })

  it('shows unified running and ready status copy for proofread lifecycle', async () => {
    let resolveProofread: (value: { issues: unknown[]; score: number }) => void
    proofreadContent.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveProofread = resolve
        }),
    )

    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三在雨夜里盯着李四，情绪极端。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')
    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--running')
    expect(wrapper.get('.tool-panel__status').text()).toContain('处理中')

    resolveProofread!({
      issues: [
        {
          id: 'issue-1',
          type: 'grammar',
          message: '建议调整语序',
        },
      ],
      score: 90,
    })
    await flushPromises()
    await nextTick()

    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--success')
    expect(wrapper.get('.tool-panel__status').text()).toContain('已就绪')
  })

  it('shows synced status copy when review action is injected before execution', () => {
    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '',
        actionTrigger: {
          source: 'review',
          action: 'proofread',
          text: '',
        },
      },
    })

    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--warning')
    expect(wrapper.get('.tool-panel__status').text()).toContain('已同步')
  })

  it('shows unified offline message when audit service is unavailable', async () => {
    auditSensitiveWords.mockRejectedValue({ message: 'Network Error' })

    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三在雨夜里盯着李四，情绪极端。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__primary').trigger('click')
    await flushPromises()

    expect(wrapper.get('.tool-state-card--error').text()).toContain('AI 服务连接失败，请确认本地 AI 服务已启动。')
  })
})
