import { describe, expect, it } from 'vitest'
import {
  buildSelectionApplyPayload,
  buildSelectionNotice,
  buildSelectionResultCandidate,
  buildSelectionUserPrompt,
} from '../writerAISelection'

describe('writerAISelection', () => {
  it('builds selection notice with normalized instructions', () => {
    expect(buildSelectionNotice('rewrite', '原文', '  保留语气  ', 'running')).toMatchObject({
      action: 'rewrite',
      actionLabel: '改写',
      instructions: '保留语气',
      statusText: '正在处理选中内容...',
    })
  })

  it('builds selection user prompt and result candidate', () => {
    expect(buildSelectionUserPrompt('expand', '原文', '补细节')).toContain('[扩写] 原文')
    expect(buildSelectionResultCandidate('expand', '原文', '新正文')).toMatchObject({
      source: 'rewrite',
      title: '扩写结果',
      generatedText: '新正文',
    })
  })

  it('builds apply payload with matching apply mode', () => {
    expect(buildSelectionApplyPayload('continue', '原文', '新正文')).toMatchObject({
      applyMode: 'insert_after_selection',
    })
    expect(buildSelectionApplyPayload('rewrite', '原文', '新正文')).toMatchObject({
      applyMode: 'replace_selection',
    })
  })
})
