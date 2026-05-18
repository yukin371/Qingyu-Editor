import { describe, expect, it } from 'vitest'
import { buildWriterToolAIHandoff } from '../writerToolAIHandoff'

describe('writerToolAIHandoff', () => {
  it('adds compact tool hints without owning a separate prompt system', () => {
    const request = buildWriterToolAIHandoff({
      toolLabel: '时间线',
      title: '当前事件窗口',
      focusLines: ['焦点：主角回到三年前'],
      instructions: '给出一个时间一致性风险。',
    })

    expect(request.text).toContain('工具：时间线')
    expect(request.text).toContain('工具提示：时间线')
    expect(request.text).toContain('事件顺序')
    expect(request.text).toContain('焦点：主角回到三年前')
    expect(request.instructions).toBe('给出一个时间一致性风险。')
  })
})
