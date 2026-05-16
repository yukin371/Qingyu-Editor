import { calculateWritingWordCount } from './wordCount'

/**
 * 编辑器工具函数集合
 * 针对 HTMLTextAreaElement 进行优化
 */

// ==========================================
// 1. 统计与计算类
// ==========================================

/**
 * 计算字数（高性能版）
 * 规则：汉字算 1 个，连续拉丁字母算 1 个，数字/标点/空白不计入
 */
export function calculateWordCount(text: string, filterMarkdown: boolean = false): number {
  if (!text) return 0
  return calculateWritingWordCount(text, filterMarkdown)
}

/**
 * 格式化字数显示
 * 使用 Intl API 支持国际化数字格式
 */
export function formatWordCount(count: number): string {
  const formatter = new Intl.NumberFormat('zh-CN')
  if (count < 1000) {
    return `${formatter.format(count)} 字`
  }
  if (count < 10000) {
    return `${(count / 1000).toFixed(1)} 千字`
  }
  return `${(count / 10000).toFixed(2)} 万字`
}

/**
 * 计算阅读时长
 */
export function estimateReadingTime(wordCount: number, readingSpeed: number = 300): number {
  return Math.max(1, Math.ceil(wordCount / readingSpeed))
}

// ==========================================
// 2. 文本操作类 (DOM Manipulation)
// ==========================================

/**
 * 保持滚动位置执行操作
 */
function withScrollPreservation(element: HTMLTextAreaElement, callback: () => void) {
  const scrollTop = element.scrollTop
  callback()
  // 恢复滚动位置，防止跳动
  requestAnimationFrame(() => {
    element.scrollTop = scrollTop
  })
}

/**
 * 插入文本到光标位置
 */
export function insertTextAtCursor(element: HTMLTextAreaElement, text: string): void {
  withScrollPreservation(element, () => {
    // 现代浏览器支持 setRangeText，性能更好且自动处理选区
    if (typeof element.setRangeText === 'function') {
      element.setRangeText(text, element.selectionStart, element.selectionEnd, 'end')
    } else {
      // 降级处理
      const start = element.selectionStart
      const end = element.selectionEnd
      const value = element.value
      element.value = value.substring(0, start) + text + value.substring(end)
      element.selectionStart = element.selectionEnd = start + text.length
    }
    element.focus()
  })
}

/**
 * 智能包裹/解包文本 (Toggle逻辑)
 * 选中 "text" -> 点击粗体 -> "**text**"
 * 选中 "**text**" -> 点击粗体 -> "text"
 */
export function toggleWrapText(element: HTMLTextAreaElement, symbol: string): void {
  withScrollPreservation(element, () => {
    const start = element.selectionStart
    const end = element.selectionEnd
    const value = element.value
    const selectedText = value.substring(start, end)

    // 检查是否已经包裹
    const prefixLen = symbol.length
    const isWrapped =
      start >= prefixLen &&
      value.substring(start - prefixLen, start) === symbol &&
      value.substring(end, end + prefixLen) === symbol

    if (isWrapped) {
      // 解包 (Unwrap)
      element.setRangeText(selectedText, start - prefixLen, end + prefixLen, 'select')
      // 修正选区，只选中文字部分
      element.selectionStart = start - prefixLen
      element.selectionEnd = end - prefixLen // setRangeText 后 length 变了，需要重新计算
    } else {
      // 包裹 (Wrap)
      // 如果没有选中文本，则插入占位符
      const textToWrap = selectedText || '文本'
      const replacement = `${symbol}${textToWrap}${symbol}`

      // 使用 select 模式保持选中整个替换后的文本，方便连续操作
      element.setRangeText(replacement, start, end, 'select')

      // 调整光标位置：如果是空文本插入，光标放在符号中间
      if (!selectedText) {
        element.selectionStart = start + prefixLen
        element.selectionEnd = start + prefixLen + textToWrap.length
      }
    }
    element.focus()
  })
}

/**
 * 智能多行前缀处理 (用于列表、引用、标题)
 * 支持多行选中，支持 Toggle
 */
export function toggleLinePrefix(element: HTMLTextAreaElement, prefix: string): void {
  withScrollPreservation(element, () => {
    const start = element.selectionStart
    const end = element.selectionEnd
    const value = element.value

    // 1. 扩充选区到完整的行（从第一行行首到最后一行行尾）
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    let lineEnd = value.indexOf('\n', end)
    if (lineEnd === -1) lineEnd = value.length

    const rawText = value.substring(lineStart, lineEnd)
    const lines = rawText.split('\n')

    // 2. 检测当前状态：是否所有行都已经有该前缀？
    // 注意：标题(#)通常只允许单行，但引用(>)和列表(-)通常允许批量
    const isAllPrefixed = lines.every((line) => line.startsWith(prefix))

    // 3. 处理每一行
    const newLines = lines.map((line) => {
      if (isAllPrefixed) {
        // 移除前缀
        return line.substring(prefix.length)
      } else {
        // 添加前缀 (如果已经有其他前缀，这里策略是直接叠加还是替换？通常编辑器是叠加或不做处理，这里做简单的正则清洗避免重复)
        // 例如避免 "## # 标题"
        const cleanLine = line.replace(new RegExp(`^${prefix.trim()}\\s*`), '')
        return prefix + cleanLine
      }
    })

    const newText = newLines.join('\n')

    // 4. 替换文本
    element.setRangeText(newText, lineStart, lineEnd, 'select')
    element.focus()
  })
}

/**
 * 格式化Markdown入口
 */
export function formatMarkdown(type: string, element: HTMLTextAreaElement): void {
  if (!element) return

  switch (type) {
    case 'bold':
      toggleWrapText(element, '**')
      break
    case 'italic':
      toggleWrapText(element, '*')
      break
    case 'strikethrough':
      toggleWrapText(element, '~~')
      break
    case 'code':
      toggleWrapText(element, '`')
      break
    case 'link': {
      const selected = element.value.substring(element.selectionStart, element.selectionEnd)
      const text = selected || '链接文本'
      insertTextAtCursor(element, `[${text}](url)`)
      // 选中 url 部分方便用户修改
      const newEnd = element.selectionEnd - 1
      element.selectionStart = newEnd - 3
      element.selectionEnd = newEnd
      break
    }
    case 'image': {
      const selected = element.value.substring(element.selectionStart, element.selectionEnd)
      const text = selected || '图片描述'
      insertTextAtCursor(element, `![${text}](url)`)
      break
    }
    case 'heading1':
      toggleLinePrefix(element, '# ')
      break
    case 'heading2':
      toggleLinePrefix(element, '## ')
      break
    case 'heading3':
      toggleLinePrefix(element, '### ')
      break
    case 'quote':
      toggleLinePrefix(element, '> ')
      break
    case 'list':
      toggleLinePrefix(element, '- ')
      break
    case 'orderedList':
      // 有序列表比较特殊，需要重新计算索引
      handleOrderedList(element)
      break
    case 'line':
      insertTextAtCursor(element, '\n---\n')
      break
  }
}

function handleOrderedList(element: HTMLTextAreaElement) {
  // 简化版：只添加 1.
  // 完整版需要扫描上一行的数字，这里暂时使用统一前缀逻辑
  toggleLinePrefix(element, '1. ')
}

// ==========================================
// 3. 辅助功能 (Logic & Storage)
// ==========================================

export function detectVersionConflict(localVersion: number, serverVersion: number): boolean {
  return serverVersion > localVersion
}

/**
 * 强类型防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * 强类型节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 本地存储相关常量
const DRAFT_KEY = 'writer_editor_drafts'
const DRAFT_EXPIRE_DAYS = 7 // 草稿有效期7天

interface DraftData {
  content: string
  timestamp: number
}

/**
 * 保存草稿 (带垃圾回收)
 */
export function saveDraftToLocal(documentId: string, content: string): void {
  if (!documentId) return
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    const drafts: Record<string, DraftData> = raw ? JSON.parse(raw) : {}

    // 1. 保存当前草稿
    drafts[documentId] = {
      content,
      timestamp: Date.now(),
    }

    // 2. 简单的垃圾回收：清理过期草稿
    const now = Date.now()
    const expireTime = DRAFT_EXPIRE_DAYS * 24 * 60 * 60 * 1000
    Object.keys(drafts).forEach((key) => {
      if (now - drafts[key].timestamp > expireTime) {
        delete drafts[key]
      }
    })

    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.warn('LocalStorage Quota Exceeded or Error:', error)
  }
}

export function loadDraftFromLocal(documentId: string): string | null {
  if (!documentId) return null
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null

    const drafts: Record<string, DraftData> = JSON.parse(raw)
    return drafts[documentId]?.content || null
  } catch {
    return null
  }
}

export function clearDraftFromLocal(documentId: string): void {
  if (!documentId) return
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return

    const drafts: Record<string, DraftData> = JSON.parse(raw)
    if (drafts[documentId]) {
      delete drafts[documentId]
      localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
    }
  } catch (error) {
    console.error('清除草稿失败:', error)
  }
}
