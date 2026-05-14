import { describe, expect, it } from 'vitest'
import { cleanParagraphLeadingSpaces } from '../cleanParagraphLeadingSpaces'

describe('cleanParagraphLeadingSpaces', () => {
  it('only trims the first text node in a paragraph', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '  开头空格' },
            { type: 'text', text: ' ' },
            { type: 'text', text: '后续内容' },
          ],
        },
      ],
    }

    expect(cleanParagraphLeadingSpaces(doc)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '开头空格' },
            { type: 'text', text: ' ' },
            { type: 'text', text: '后续内容' },
          ],
        },
      ],
    })
  })

  it('preserves trailing spacer after inserted smart keyword', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '@测试实体',
              marks: [{ type: 'smartKeyword', attrs: { keywordName: '测试实体' } }],
            },
            { type: 'text', text: ' ' },
          ],
        },
      ],
    }

    expect(cleanParagraphLeadingSpaces(doc)).toEqual(doc)
  })
})
