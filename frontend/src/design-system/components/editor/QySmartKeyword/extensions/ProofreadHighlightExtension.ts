import { Extension } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import type { EditorState } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { EditorView } from '@tiptap/pm/view'

export type ProofreadHighlightSeverity = 'error' | 'warning' | 'suggestion'

export interface ProofreadHighlightRange {
  id: string
  start: number
  end: number
  severity: ProofreadHighlightSeverity
  originalText?: string
}

interface MappedHighlightRange extends ProofreadHighlightRange {
  from: number
  to: number
}

const proofreadHighlightKey = new PluginKey('proofreadHighlight')
let activeHighlights: ProofreadHighlightRange[] = []
let focusedHighlightId = ''

export function normalizeHighlights(
  highlights: ProofreadHighlightRange[],
): ProofreadHighlightRange[] {
  return highlights
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end))
    .filter((item) => item.start >= 0 && item.end > item.start)
    .map((item) => ({
      ...item,
      severity:
        item.severity === 'error' || item.severity === 'warning' || item.severity === 'suggestion'
          ? item.severity
          : 'suggestion',
    }))
    .sort((left, right) => left.start - right.start)
}

export function setProofreadHighlights(
  highlights: ProofreadHighlightRange[],
  view?: EditorView | null,
) {
  activeHighlights = normalizeHighlights(highlights)
  if (!activeHighlights.some((item) => item.id === focusedHighlightId)) {
    focusedHighlightId = ''
  }
  refreshProofreadHighlights(view)
}

export function clearProofreadHighlights(view?: EditorView | null) {
  setProofreadHighlights([], view)
}

export function setFocusedProofreadHighlight(issueId: string, view?: EditorView | null) {
  focusedHighlightId = issueId
  refreshProofreadHighlights(view)
}

export function focusProofreadHighlight(issueId: string, view: EditorView) {
  const highlight = activeHighlights.find((item) => item.id === issueId)
  if (!highlight) {
    setFocusedProofreadHighlight('', view)
    return false
  }

  const mapped = mapPlainTextRangeToDocPosition(view.state.doc, highlight)
  if (!mapped) {
    setFocusedProofreadHighlight('', view)
    return false
  }

  focusedHighlightId = issueId
  view.dispatch(
    view.state.tr
      .setSelection(TextSelection.create(view.state.doc, mapped.from, mapped.to))
      .setMeta(proofreadHighlightKey, { focus: issueId, refresh: Date.now() })
      .scrollIntoView(),
  )
  view.focus()
  return true
}

export function mapPlainTextRangeToDocPosition(
  doc: ProseMirrorNode,
  range: ProofreadHighlightRange,
): MappedHighlightRange | null {
  let plainOffset = 0
  let from: number | null = null
  let to: number | null = null

  doc.forEach((blockNode, blockOffset, blockIndex) => {
    blockNode.descendants((node, pos) => {
      if (!node.isText || typeof node.text !== 'string') {
        return true
      }

      const textLength = node.text.length
      const nodeStartOffset = plainOffset
      const nodeEndOffset = plainOffset + textLength
      const docPosition = blockOffset + 1 + pos

      if (from === null && range.start >= nodeStartOffset && range.start <= nodeEndOffset) {
        from = docPosition + (range.start - nodeStartOffset)
      }

      if (to === null && range.end >= nodeStartOffset && range.end <= nodeEndOffset) {
        to = docPosition + (range.end - nodeStartOffset)
      }

      plainOffset = nodeEndOffset
      return true
    })

    if (blockIndex < doc.childCount - 1) {
      plainOffset += 1
    }
  })

  if (from === null || to === null || to <= from) {
    return null
  }

  const currentText = doc.textBetween(from, to, '')
  if (range.originalText && currentText !== range.originalText) {
    return null
  }

  return {
    ...range,
    from,
    to,
  }
}

function refreshProofreadHighlights(view?: EditorView | null) {
  if (!view) return
  view.dispatch(view.state.tr.setMeta(proofreadHighlightKey, { refresh: Date.now() }))
}

function buildDecorations(state: EditorState): DecorationSet {
  if (activeHighlights.length === 0) {
    return DecorationSet.empty
  }

  const decorations: Decoration[] = []
  const mappedRanges = activeHighlights
    .map((range) => mapPlainTextRangeToDocPosition(state.doc, range))
    .filter((range): range is MappedHighlightRange => !!range)

  let previousTo = -1
  for (const range of mappedRanges) {
    if (range.from < previousTo) {
      continue
    }

    decorations.push(
      Decoration.inline(range.from, range.to, {
        class: [
          'proofread-highlight',
          `proofread-highlight--${range.severity}`,
          focusedHighlightId === range.id ? 'proofread-highlight--focused' : '',
        ]
          .filter(Boolean)
          .join(' '),
        'data-proofread-issue-id': range.id,
      }),
    )
    previousTo = range.to
  }

  return DecorationSet.create(state.doc, decorations)
}

export const ProofreadHighlightExtension = Extension.create({
  name: 'proofreadHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: proofreadHighlightKey,
        props: {
          decorations(state: EditorState) {
            return buildDecorations(state)
          },
        },
      }),
    ]
  },
})
