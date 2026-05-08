import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, type EditorState, type Transaction } from '@tiptap/pm/state'

const paragraphWithIdKey = new PluginKey('paragraphWithId')

export const ParagraphWithId = Extension.create({
  name: 'paragraphWithId',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          paragraphId: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('data-paragraph-id'),
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.paragraphId) return {}
              return { 'data-paragraph-id': String(attributes.paragraphId) }
            },
          },
          paragraphOrder: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('data-paragraph-order'),
            renderHTML: (attributes: Record<string, unknown>) => {
              if (attributes.paragraphOrder == null) return {}
              return { 'data-paragraph-order': String(attributes.paragraphOrder) }
            },
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: paragraphWithIdKey,
        appendTransaction: (
          _transactions: readonly Transaction[],
          _oldState: EditorState,
          newState: EditorState,
        ) => {
          let changed = false
          let order = 0
          const tr = newState.tr

          newState.doc.descendants((node: any, pos: number) => {
            if (node.type.name !== 'paragraph') return true

            const nextId = node.attrs.paragraphId || `p-${Date.now().toString(36)}-${order}`
            const nextOrder = order
            const shouldUpdate = node.attrs.paragraphId !== nextId || node.attrs.paragraphOrder !== nextOrder

            if (shouldUpdate) {
              changed = true
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                paragraphId: nextId,
                paragraphOrder: nextOrder,
              })
            }

            order += 1
            return true
          })

          return changed ? tr : null
        },
      }),
    ]
  },
})
