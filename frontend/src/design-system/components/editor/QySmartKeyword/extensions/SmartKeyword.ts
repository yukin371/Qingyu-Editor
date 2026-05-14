import { Mark, mergeAttributes, markPasteRule } from '@tiptap/core'

export type KeywordType = 'character' | 'location' | 'item' | 'concept' | 'organization'

export interface KeywordInfo {
  id?: string
  type: KeywordType
  name: string
  summary?: string
  isUnified?: boolean
  suggestedType?: KeywordType
}

export interface SmartKeywordOptions {
  projectId?: string
}

const pasteUnifiedKeywordPattern = /@([\u4e00-\u9fa5\w-]{1,30})/g

export const SmartKeyword = Mark.create<SmartKeywordOptions>({
  name: 'smartKeyword',

  // 防止光标在 mark 边界时后续输入继承该 mark
  inclusive: false,

  addAttributes() {
    return {
      keywordId: { default: null },
      keywordType: { default: null },
      keywordName: { default: null },
      projectId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-smart-keyword]' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const keywordType = String(HTMLAttributes.keywordType || '')
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-smart-keyword': 'true',
        'data-keyword-id': HTMLAttributes.keywordId,
        'data-keyword-type': keywordType,
        'data-keyword-name': HTMLAttributes.keywordName,
        class: `qy-smart-keyword ${keywordType ? `qy-smart-keyword--${keywordType}` : ''}`.trim(),
      }),
      0,
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: pasteUnifiedKeywordPattern,
        type: this.type,
        getAttributes: (match: string[]) => {
          const name = match[1]
          return {
            keywordType: 'character',
            keywordName: name,
            projectId: this.options.projectId || null,
          }
        },
      }),
    ]
  },
})
