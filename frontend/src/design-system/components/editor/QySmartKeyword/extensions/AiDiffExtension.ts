/**
 * AiDiffExtension — Tiptap 扩展
 * 在编辑器内容区域渲染 AI 生成的内联 Diff（红色删除 + 绿色新增）
 * 支持接受/拒绝操作，类似 Cursor 编辑器的体验
 */
import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorState, Transaction } from '@tiptap/pm/state'

// ── Types ──────────────────────────────────────
export interface PendingDiff {
  id: string
  /** 旧文本位置（编辑器中的 from/to） */
  from: number
  to: number
  /** 原始文本 */
  oldText: string
  /** 新文本 */
  newText: string
  /** diff 类型 */
  applyMode: 'replace_selection' | 'insert_after_selection'
}

interface AiDiffState {
  diffs: PendingDiff[]
}

// ── Plugin Key ─────────────────────────────────
const aiDiffKey = new PluginKey('aiDiff')

// ── 全局状态（简化版，演示优先）───────────────
let pendingDiffs: PendingDiff[] = []
let onDiffAccept: ((diff: PendingDiff) => void) | null = null
let onDiffReject: ((diff: PendingDiff) => void) | null = null

/**
 * 注册一个 pending diff
 */
export function registerPendingDiff(diff: PendingDiff) {
  // 移除之前的 diff（一次只显示一个）
  pendingDiffs = [diff]
}

/**
 * 获取当前 pending diffs
 */
export function getPendingDiffs(): PendingDiff[] {
  return [...pendingDiffs]
}

/**
 * 清除所有 pending diffs
 */
export function clearPendingDiffs() {
  pendingDiffs = []
}

/**
 * 设置回调
 */
export function setDiffCallbacks(
  accept: (diff: PendingDiff) => void,
  reject: (diff: PendingDiff) => void,
) {
  onDiffAccept = accept
  onDiffReject = reject
}

// ── Diff 计算（简单字符对比，演示优先）──────
function computeCharDiffs(oldText: string, newText: string): Array<{ type: 'del' | 'ins' | 'eq'; text: string }> {
  // 简单实现：按行对比
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result: Array<{ type: 'del' | 'ins' | 'eq'; text: string }> = []

  const maxLen = Math.max(oldLines.length, newLines.length)
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i]
    const newLine = newLines[i]
    if (oldLine === newLine) {
      if (oldLine !== undefined) result.push({ type: 'eq', text: oldLine })
    } else {
      if (oldLine !== undefined) result.push({ type: 'del', text: oldLine })
      if (newLine !== undefined) result.push({ type: 'ins', text: newLine })
    }
  }
  return result
}

// ── Build Decorations ──────────────────────────
function buildDecorations(state: EditorState): DecorationSet {
  const decorations: Decoration[] = []

  for (const diff of pendingDiffs) {
    const { from, to, oldText, newText, applyMode } = diff

    // 检查位置是否有效
    const docSize = state.doc.content.size
    if (from < 0 || to > docSize || from > to) continue

    // 验证选区文本仍然匹配
    const currentText = state.doc.textBetween(from, to, '\n')
    if (currentText.trim() !== oldText.trim()) continue

    if (applyMode === 'replace_selection' && oldText.trim() !== newText.trim()) {
      // 删除样式：原文本加红色删除线背景
      decorations.push(
        Decoration.inline(from, to, {
          class: 'ai-diff-delete',
          style:
            'background: linear-gradient(180deg, rgba(254, 226, 226, 0.94), rgba(254, 242, 242, 0.88)); text-decoration: line-through; color: #b91c1c; opacity: 0.95; border-radius: 8px; box-shadow: inset 0 0 0 1px rgba(248, 113, 113, 0.18);',
        }),
      )

      // 新增内容：在选区末尾插入 widget（绿色新文本）
      const diffResult = computeCharDiffs(oldText, newText)
      const insertTexts = diffResult.filter((d) => d.type === 'ins').map((d) => d.text).join('\n')
      if (insertTexts) {
        decorations.push(
          Decoration.widget(to, () => {
            const span = document.createElement('span')
            span.className = 'ai-diff-insert'
            span.style.cssText =
              'display: block; margin-top: 8px; white-space: pre-wrap; background: linear-gradient(180deg, rgba(240, 253, 244, 0.98), rgba(236, 253, 245, 0.9)); color: #166534; border-left: 4px solid #22c55e; border-radius: 12px; padding: 10px 12px; box-shadow: 0 12px 24px rgba(34, 197, 94, 0.08);'
            span.textContent = insertTexts
            return span
          }, { side: 1 }),
        )
      }
    } else if (applyMode === 'insert_after_selection') {
      // 续写模式：在选区后插入绿色 widget
      decorations.push(
        Decoration.widget(to, () => {
          const span = document.createElement('span')
          span.className = 'ai-diff-insert'
          span.style.cssText =
            'display: block; margin-top: 8px; white-space: pre-wrap; background: linear-gradient(180deg, rgba(240, 253, 244, 0.98), rgba(236, 253, 245, 0.9)); color: #166534; border-left: 4px solid #22c55e; border-radius: 12px; padding: 10px 12px; box-shadow: 0 12px 24px rgba(34, 197, 94, 0.08);'
          span.textContent = newText
          return span
        }, { side: 1 }),
      )
    } else {
      // 纯文本替换（总结等）：绿色 widget 在选区位置
      decorations.push(
        Decoration.widget(from, () => {
          const span = document.createElement('span')
          span.className = 'ai-diff-insert'
          span.style.cssText =
            'display: block; margin-top: 8px; white-space: pre-wrap; background: linear-gradient(180deg, rgba(240, 253, 244, 0.98), rgba(236, 253, 245, 0.9)); color: #166534; border-left: 4px solid #22c55e; border-radius: 12px; padding: 10px 12px; box-shadow: 0 12px 24px rgba(34, 197, 94, 0.08);'
          span.textContent = newText
          return span
        }, { side: 1 }),
      )
    }

    // 在 diff 区域上方添加操作按钮 widget
    decorations.push(
      Decoration.widget(from, () => {
        const toolbar = document.createElement('div')
        toolbar.className = 'ai-diff-toolbar'
        toolbar.style.cssText = `
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 10px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(3, 105, 161, 0.92));
          border: 1px solid rgba(125, 211, 252, 0.18); border-radius: 14px;
          box-shadow: 0 18px 34px rgba(2,6,23,0.18), inset 0 1px 0 rgba(255,255,255,0.08); font-size: 13px;
          position: relative; margin-bottom: 8px; z-index: 100;
        `

        const label = document.createElement('span')
        label.style.cssText = 'color: #e0f2fe; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;'
        label.textContent = diff.applyMode === 'insert_after_selection' ? 'AI Continuation' : 'AI Patch'
        toolbar.appendChild(label)

        const acceptBtn = document.createElement('button')
        acceptBtn.textContent = '接受修改'
        acceptBtn.style.cssText = `
          padding: 7px 12px; border: 1px solid rgba(34, 197, 94, 0.22); border-radius: 999px;
          background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff; cursor: pointer; font-size: 12px; font-weight: 700;
        `
        acceptBtn.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (onDiffAccept) onDiffAccept(diff)
        }
        toolbar.appendChild(acceptBtn)

        const rejectBtn = document.createElement('button')
        rejectBtn.textContent = '放弃修改'
        rejectBtn.style.cssText = `
          padding: 7px 12px; border: 1px solid rgba(226, 232, 240, 0.22); border-radius: 999px;
          background: rgba(255,255,255,0.1); color: #e2e8f0; cursor: pointer; font-size: 12px; font-weight: 700;
        `
        rejectBtn.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (onDiffReject) onDiffReject(diff)
        }
        toolbar.appendChild(rejectBtn)

        return toolbar
      }, { side: -1 }),
    )
  }

  return DecorationSet.create(state.doc, decorations)
}

// ── Tiptap Extension ───────────────────────────
export const AiDiffExtension = Extension.create({
  name: 'aiDiff',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: aiDiffKey,
        state: {
          init: (): AiDiffState => ({ diffs: [] }),
          apply: (_tr: Transaction, value: AiDiffState): AiDiffState => {
            return value
          },
        },
        props: {
          decorations(state: EditorState) {
            if (pendingDiffs.length === 0) return DecorationSet.empty
            return buildDecorations(state)
          },
        },
      }),
    ]
  },
})
