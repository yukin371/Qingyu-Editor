import { describe, expect, it } from 'vitest'
import { creativeFlowStages, getCreativeFlowStage } from '../creativeFlow'

describe('creativeFlow', () => {
  it('keeps inspiration as an in-project right panel entry instead of template center', () => {
    const inspiration = getCreativeFlowStage('inspiration')

    expect(inspiration.primaryAction).toEqual({ type: 'right-tool', tool: 'inspiration' })
    expect(inspiration.tasks).toEqual([
      '灵感原点',
      '题材坐标',
      '读者承诺',
      '开篇钩子',
      '日更循环',
    ])
    expect(inspiration.outputs).toEqual(['定位声明', '对标与禁区', '黄金三章锚点'])
  })

  it('routes review stage to the right-side harness tool', () => {
    const review = getCreativeFlowStage('review')

    expect(review.primaryAction).toEqual({ type: 'right-tool', tool: 'harness' })
    expect(review.primaryActionLabel).toBe('打开审查')
  })

  it('uses concrete author-facing tasks for every stage', () => {
    expect(creativeFlowStages).toHaveLength(5)

    for (const stage of creativeFlowStages) {
      expect(stage.tasks.length).toBeGreaterThanOrEqual(5)
      expect(stage.outputs.length).toBeGreaterThanOrEqual(3)
      expect(stage.tasks.every((task) => task.length >= 4)).toBe(true)
    }
  })
})
