// src/modules/writer/types/editor.ts
import type { ID, ISODate } from './core'
import type { DocumentContent } from './document'

// =======================
// 编辑与保存 (Editing & Saving)
// =======================

export interface AutoSaveRequest {
  documentId: ID // 通常在 path 中，但 DTO 可能也包含
  content: string
  version: number // 用于乐观锁冲突检测
  wordCount?: number
}

export interface AutoSaveResponse {
  version: number // 服务端返回的新版本号
  lastSavedAt: ISODate
  status: 'success' | 'conflict'
}

export interface SaveStatusResponse {
  isSaved: boolean
  lastSavedAt: ISODate
  version: number
  lastEditedBy: string
}

export interface UpdateContentRequest {
  documentId: ID
  content: string
  version: number
  wordCount?: number
}

export interface DocumentContentResponse extends DocumentContent {
  // 继承自 document.ts 中的 DocumentContent
  // 如果后端返回有额外字段，可以在这里扩展
}

// =======================
// 字数统计 (Word Count)
// =======================

export interface WordCountRequest {
  content: string
  filterMarkdown?: boolean
}

export interface WordCountResult {
  totalWords: number
  charCount: number // 不含空格
  charCountWithSpace?: number
  paragraphs?: number
  readingTime?: string // 预估阅读时间
}

// =======================
// 快捷键 (Shortcuts)
// =======================

export interface Shortcut {
  id: string // 命令ID, e.g., 'editor.save'
  keys: string[] // 快捷键组合, e.g., ['Ctrl', 'S']
  description: string
  category: string // 分类
  isCustom?: boolean // 是否为用户自定义
}

export interface ShortcutConfig {
  shortcuts: Record<string, Shortcut> // key 是 commandId
}

export interface UpdateShortcutsRequest {
  shortcuts: Record<string, Shortcut>
}

export interface ShortcutCategory {
  name: string
  title: string
  shortcuts: Shortcut[]
}
