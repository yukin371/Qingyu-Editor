/**
 * Agent Diff Bridge — 连接 agentStore 的 textDiffSuggestions 和 AiDiffExtension
 * 将 agent 返回的 suggestion 转换为 AiDiffExtension 需要的 PendingDiff 格式
 */
import type { ManagedSuggestion } from '../types/agent'
import type { Editor } from '@tiptap/core'
import {
  registerPendingDiff,
  clearPendingDiffs,
  setDiffCallbacks,
  type PendingDiff,
} from '@/design-system/components/editor/QySmartKeyword/extensions/AiDiffExtension'

/**
 * 将 text_diff suggestion 应用到编辑器
 * 需要 editor 实例来定位文本位置
 */
export function applyDiffSuggestion(
  editor: Editor,
  suggestion: ManagedSuggestion,
  onAccept: (suggestion: ManagedSuggestion) => void,
  onReject: (suggestion: ManagedSuggestion) => void,
) {
  const applyMode = suggestion.action === 'append'
    ? 'insert_after_selection'
    : 'replace_selection'

  // 定位 original_content 在编辑器中的位置
  let from = 0
  let to = 0
  const oldText = suggestion.originalContent || ''

  if (applyMode === 'replace_selection' && oldText) {
    // 搜索文本位置
    const pos = findTextPosition(editor, oldText)
    if (pos !== null) {
      from = pos.from
      to = pos.to
    } else {
      // 如果找不到原文，fallback 到文档末尾追加
      const endPos = editor.state.doc.content.size
      from = Math.max(0, endPos - 1)
      to = from
    }
  } else {
    // append 模式：在文档末尾
    const endPos = editor.state.doc.content.size
    from = Math.max(0, endPos - 1)
    to = from
  }

  const diff: PendingDiff = {
    id: suggestion.id,
    from,
    to,
    oldText: suggestion.originalContent || '',
    newText: stripHtml(suggestion.content),
    applyMode,
  }

  setDiffCallbacks(
    (acceptedDiff) => {
      applyDiff(editor, acceptedDiff)
      clearPendingDiffs()
      onAccept(suggestion)
    },
    () => {
      clearPendingDiffs()
      onReject(suggestion)
    },
  )

  registerPendingDiff(diff)

  // 强制编辑器重新渲染 decorations
  editor.view.dispatch(
    editor.state.tr.setMeta('aiDiff', { refresh: Date.now() }),
  )
}

/**
 * 清除编辑器中的所有 diff 展示
 */
export function clearEditorDiffs() {
  clearPendingDiffs()
}

/**
 * 应用 diff 到编辑器
 */
function applyDiff(editor: Editor, diff: PendingDiff) {
  if (diff.applyMode === 'replace_selection') {
    editor.chain()
      .focus()
      .setTextSelection({ from: diff.from, to: diff.to })
      .deleteSelection()
      .insertContent(diff.newText)
      .run()
  } else {
    // insert_after_selection
    editor.chain()
      .focus()
      .setTextSelection(diff.to)
      .insertContent(diff.newText)
      .run()
  }
}

/**
 * 在编辑器文档中搜索文本位置
 */
function findTextPosition(editor: Editor, text: string): { from: number; to: number } | null {
  const plainText = stripHtml(text).trim()
  if (!plainText) return null

  const doc = editor.state.doc
  let found: { from: number; to: number } | null = null

  doc.descendants((node, pos) => {
    if (found) return false
    if (node.isText && node.text) {
      const idx = node.text.indexOf(plainText.substring(0, 50))
      if (idx !== -1) {
        found = { from: pos + idx, to: pos + idx + plainText.length }
        return false
      }
    }
    return true
  })

  return found
}

/**
 * 去除 HTML 标签
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}
