import { describe, expect, it } from 'vitest'
import {
  extractPlainTextFromEditorContent,
  stripLeadingTitleHeadingFromEditorContent,
} from '../editorContent'

describe('editorContent', () => {
  it('正文显示应移除与章节标题重复的首个标题节点', () => {
    const content = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '第一章' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '正文开始。' }],
        },
      ],
    })

    const stripped = stripLeadingTitleHeadingFromEditorContent(content, '第一章')

    expect(extractPlainTextFromEditorContent(stripped)).toBe('正文开始。')
  })

  it('首个标题不是当前章节标题时不应移除', () => {
    const content = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '场景一' }],
        },
      ],
    })

    expect(stripLeadingTitleHeadingFromEditorContent(content, '第一章')).toBe(content)
  })
})
