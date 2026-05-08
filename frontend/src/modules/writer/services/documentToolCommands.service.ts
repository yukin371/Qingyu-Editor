import type { ChatMessage } from '@/composables/useChatHistory'
import type {
  WriterDocumentLine,
  WriterDocumentPatchOperation,
  WriterDocumentToolEntry,
} from '@/modules/writer/types/document-tools'
import type { WriterAIApplyPayload } from '@/modules/writer/types/workflow'
import { documentToolsService } from './documentTools.service'

interface WriterDocumentCommandContext {
  projectId?: string
  currentDocumentId?: string | null
  currentDocumentTitle?: string | null
  currentSourceText?: string | null
}

interface WriterDocumentCommandExecutionResult {
  handled: boolean
  userEcho?: string
  assistantMessage?: string
  assistantMeta?: ChatMessage['meta']
  patchPayload?: WriterAIApplyPayload
}

type WriterDocumentCommand =
  | { type: 'help' }
  | { type: 'list' }
  | { type: 'read'; documentRef?: string; startLine?: number; endLine?: number }
  | { type: 'search'; documentRef?: string; query: string }
  | { type: 'patch'; documentRef?: string; operation: WriterDocumentPatchOperation }

function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}

function toLines(text: string): WriterDocumentLine[] {
  const normalized = normalizeLineBreaks(text)
  if (!normalized) {
    return []
  }

  return normalized.split('\n').map((line, index) => ({
    line: index + 1,
    text: line,
  }))
}

function textFromLines(lines: WriterDocumentLine[]): string {
  return lines.map((line) => line.text).join('\n')
}

function parseRangeToken(input: string): { startLine: number; endLine: number } | null {
  const match = input.trim().match(/^(\d+)(?:-(\d+))?$/)
  if (!match) {
    return null
  }

  const startLine = Number(match[1])
  const endLine = Number(match[2] || match[1])
  if (startLine <= 0 || endLine < startLine) {
    return null
  }

  return { startLine, endLine }
}

function extractDocumentOption(input: string): { text: string; documentRef?: string } {
  const match = input.match(/--doc=(?:"([^"]+)"|'([^']+)'|(\S+))/)
  if (!match) {
    return {
      text: input.trim(),
    }
  }

  const documentRef = match[1] || match[2] || match[3]
  return {
    text: `${input.slice(0, match.index)}${input.slice((match.index || 0) + match[0].length)}`.trim(),
    documentRef: documentRef?.trim(),
  }
}

function formatDocumentLabel(
  document: Pick<WriterDocumentToolEntry, 'documentId' | 'title'>,
): string {
  return `${document.title || '未命名文档'}（${document.documentId}）`
}

function formatLines(lines: WriterDocumentLine[]): string {
  if (lines.length === 0) {
    return '（空内容）'
  }

  return lines.map((line) => `${String(line.line).padStart(4, ' ')} | ${line.text}`).join('\n')
}

function formatPatchPreviewBlocks(
  previews: Array<{
    type: WriterDocumentPatchOperation['type']
    startLine: number
    endLine: number
    before: string[]
    after: string[]
  }>,
): string {
  if (previews.length === 0) {
    return '（无预览内容）'
  }

  return previews
    .slice(0, 3)
    .map((preview, index) => {
      const header = `变更 ${index + 1} [${preview.type}] ${preview.startLine}-${preview.endLine}`
      const before =
        preview.before.length > 0
          ? preview.before.map((line) => `- ${line}`).join('\n')
          : '- （空）'
      const after =
        preview.after.length > 0
          ? preview.after.map((line) => `+ ${line}`).join('\n')
          : '+ （删除）'

      return [header, before, after].join('\n')
    })
    .join('\n\n')
}

function buildPatchPreviewMeta(input: {
  documentLabel: string
  operationType: WriterDocumentPatchOperation['type']
  totalLines: number
  status: 'ready' | 'switching'
  statusText: string
  previews: Array<{
    type: WriterDocumentPatchOperation['type']
    startLine: number
    endLine: number
    before: string[]
    after: string[]
  }>
}): ChatMessage['meta'] {
  return {
    kind: 'document_tool_patch_preview',
    status: input.status,
    statusText: input.statusText,
    documentLabel: input.documentLabel,
    operationType: input.operationType,
    blockCount: input.previews.length,
    totalLines: input.totalLines,
    blocks: input.previews.slice(0, 3).map((preview, index) => ({
      header: `变更 ${index + 1} [${preview.type}] ${preview.startLine}-${preview.endLine}`,
      before: preview.before.slice(),
      after: preview.after.slice(),
    })),
  }
}

function buildHelpMessage(): string {
  return [
    '可用文档命令：',
    '/doc list',
    '/doc read 1-20',
    '/doc read --doc=chapter-2 1-20',
    '/doc search 张三',
    '/doc search --doc=chapter-2 张三',
    '/doc patch replace 12-14 => 新内容',
    '/doc patch insert 24 => 新增一行',
    '/doc patch delete 8-10',
    '说明：当前章节 patch 会直接走正文编辑器 diff；其它章节 patch 会先返回预览。',
  ].join('\n')
}

export function parseWriterDocumentCommand(input: string): WriterDocumentCommand | null {
  const trimmed = input.trim()
  if (!trimmed.startsWith('/doc')) {
    return null
  }

  const rest = trimmed.slice(4).trim()
  if (!rest || rest === 'help') {
    return { type: 'help' }
  }

  if (rest === 'list') {
    return { type: 'list' }
  }

  const { text, documentRef } = extractDocumentOption(rest)

  if (text.startsWith('read')) {
    const range = parseRangeToken(text.slice(4).trim())
    return {
      type: 'read',
      documentRef,
      startLine: range?.startLine,
      endLine: range?.endLine,
    }
  }

  if (text.startsWith('search')) {
    const query = text.slice(6).trim()
    if (!query) {
      throw new Error('请提供要搜索的关键词，例如 /doc search 张三')
    }

    return {
      type: 'search',
      documentRef,
      query,
    }
  }

  if (text.startsWith('patch')) {
    const patchText = text.slice(5).trim()
    const replaceMatch = patchText.match(/^replace\s+(\d+(?:-\d+)?)\s*=>\s*([\s\S]+)$/)
    if (replaceMatch) {
      const range = parseRangeToken(replaceMatch[1])
      if (!range) {
        throw new Error('replace 的行范围无效')
      }

      return {
        type: 'patch',
        documentRef,
        operation: {
          type: 'replace_lines',
          startLine: range.startLine,
          endLine: range.endLine,
          lines: normalizeLineBreaks(replaceMatch[2]).split('\n'),
        },
      }
    }

    const insertMatch = patchText.match(/^insert\s+(\d+)\s*=>\s*([\s\S]+)$/)
    if (insertMatch) {
      const line = Number(insertMatch[1])
      if (line < 0) {
        throw new Error('insert 的行号无效')
      }

      return {
        type: 'patch',
        documentRef,
        operation: {
          type: 'insert_after_line',
          line,
          lines: normalizeLineBreaks(insertMatch[2]).split('\n'),
        },
      }
    }

    const deleteMatch = patchText.match(/^delete\s+(\d+(?:-\d+)?)$/)
    if (deleteMatch) {
      const range = parseRangeToken(deleteMatch[1])
      if (!range) {
        throw new Error('delete 的行范围无效')
      }

      return {
        type: 'patch',
        documentRef,
        operation: {
          type: 'delete_lines',
          startLine: range.startLine,
          endLine: range.endLine,
        },
      }
    }

    throw new Error('patch 命令格式无效，请使用 replace / insert / delete')
  }

  throw new Error('未识别的 /doc 子命令，请使用 /doc help 查看示例')
}

async function resolveDocument(
  context: WriterDocumentCommandContext,
  documentRef?: string,
): Promise<WriterDocumentToolEntry | { documentId: string; title: string }> {
  if (!documentRef?.trim()) {
    if (!context.currentDocumentId?.trim()) {
      throw new Error('未找到当前章节，请先切到目标章节，或显式传入 --doc=')
    }

    return {
      documentId: context.currentDocumentId,
      title: context.currentDocumentTitle?.trim() || context.currentDocumentId,
    }
  }

  if (!context.projectId?.trim()) {
    throw new Error('当前项目上下文缺失，无法解析 --doc= 参数')
  }

  const entries = await documentToolsService.listDocuments(context.projectId)
  const normalizedRef = documentRef.trim().toLowerCase()
  const exactMatch = entries.documents.find((item) => {
    return (
      item.documentId.toLowerCase() === normalizedRef ||
      item.title.trim().toLowerCase() === normalizedRef
    )
  })

  if (exactMatch) {
    return exactMatch
  }

  const fuzzyMatches = entries.documents.filter((item) => {
    return (
      item.documentId.toLowerCase().includes(normalizedRef) ||
      item.title.trim().toLowerCase().includes(normalizedRef)
    )
  })

  if (fuzzyMatches.length === 1) {
    return fuzzyMatches[0]
  }

  if (fuzzyMatches.length > 1) {
    throw new Error(`--doc=${documentRef} 匹配到多个章节，请改用更精确的文档 ID`)
  }

  throw new Error(`未找到文档：${documentRef}`)
}

export async function executeWriterDocumentCommand(
  input: string,
  context: WriterDocumentCommandContext,
): Promise<WriterDocumentCommandExecutionResult> {
  const command = parseWriterDocumentCommand(input)
  if (!command) {
    return { handled: false }
  }

  if (command.type === 'help') {
    return {
      handled: true,
      userEcho: input.trim(),
      assistantMessage: buildHelpMessage(),
    }
  }

  try {
    if (command.type === 'list') {
      if (!context.projectId?.trim()) {
        throw new Error('当前项目上下文缺失，无法列出章节')
      }

      const result = await documentToolsService.listDocuments(context.projectId)
      const documentLines = result.documents.map((item) => {
        const levelIndent = '  '.repeat(Math.max(0, item.level))
        return `${levelIndent}- ${item.title || '未命名文档'} [${item.type}] (${item.documentId})`
      })

      return {
        handled: true,
        userEcho: input.trim(),
        assistantMessage:
          documentLines.length > 0
            ? ['当前项目文档：', ...documentLines].join('\n')
            : '当前项目下还没有可用文档。',
      }
    }

    if (command.type === 'read') {
      const document = await resolveDocument(context, command.documentRef)
      const result = await documentToolsService.readDocument(document.documentId)
      const startLine = command.startLine || 1
      const endLine = Math.min(command.endLine || result.totalLines || startLine, result.totalLines)
      const lines = result.lines.filter((line) => line.line >= startLine && line.line <= endLine)

      return {
        handled: true,
        userEcho: input.trim(),
        assistantMessage: [
          `读取 ${document.title} 第 ${startLine}-${endLine} 行：`,
          formatLines(lines),
        ].join('\n'),
      }
    }

    if (command.type === 'search') {
      const document = await resolveDocument(context, command.documentRef)
      const result = await documentToolsService.searchDocument({
        documentId: document.documentId,
        query: command.query,
        contextLines: 1,
      })

      if (result.matches.length === 0) {
        return {
          handled: true,
          userEcho: input.trim(),
          assistantMessage: `在 ${document.title} 中没有找到 “${command.query}”。`,
        }
      }

      const formattedMatches = result.matches.slice(0, 8).map((match, index) => {
        const before = match.before.map((line) => `${line.line} | ${line.text}`)
        const current = `${match.line} | ${match.text}`
        const after = match.after.map((line) => `${line.line} | ${line.text}`)
        return [`命中 ${index + 1}:`, ...before, current, ...after].join('\n')
      })

      return {
        handled: true,
        userEcho: input.trim(),
        assistantMessage: [
          `在 ${document.title} 中找到 ${result.totalMatches} 处命中：`,
          ...formattedMatches,
        ].join('\n\n'),
      }
    }

    const document = await resolveDocument(context, command.documentRef)
    if (!context.currentDocumentId || document.documentId !== context.currentDocumentId) {
      const targetDocument = await documentToolsService.readDocument(document.documentId)
      const sourceText = textFromLines(targetDocument.lines)
      const preview = documentToolsService.previewTextPatch({
        documentId: document.documentId,
        version: targetDocument.version,
        lines: targetDocument.lines,
        operations: [command.operation],
      })
      const nextText = textFromLines(preview.lines)

      return {
        handled: true,
        userEcho: input.trim(),
        assistantMessage: [
          `已为 ${formatDocumentLabel(document)} 生成异章节 patch 预览，并准备切章挂起 diff：`,
          `- 操作类型：${command.operation.type}`,
          `- 变更块数：${preview.previews.length}`,
          `- 结果行数：${preview.totalLines}`,
          '',
          formatPatchPreviewBlocks(preview.previews),
          '',
          '系统将自动切换到目标章节，并在正文编辑器内显示可接受/放弃的 diff。',
        ].join('\n'),
        assistantMeta: buildPatchPreviewMeta({
          documentLabel: formatDocumentLabel(document),
          operationType: command.operation.type,
          totalLines: preview.totalLines,
          status: 'switching',
          statusText: '正在切换章节并准备正文 diff',
          previews: preview.previews,
        }),
        patchPayload: {
          action: 'rewrite',
          sourceText,
          generatedText: nextText,
          applyMode: 'replace_document',
          targetDocumentId: document.documentId,
          targetDocumentTitle: document.title,
        },
      }
    }

    const sourceText = context.currentSourceText ?? ''
    const preview = documentToolsService.previewTextPatch({
      documentId: document.documentId,
      lines: toLines(sourceText),
      operations: [command.operation],
    })
    const nextText = textFromLines(preview.lines)

    return {
      handled: true,
      userEcho: input.trim(),
      assistantMessage: [
        `已为 ${formatDocumentLabel(document)} 生成正文 diff 预览：`,
        `- 操作类型：${command.operation.type}`,
        `- 变更块数：${preview.previews.length}`,
        `- 结果行数：${preview.totalLines}`,
        '',
        formatPatchPreviewBlocks(preview.previews),
        '',
        '请直接在正文编辑器中接受或放弃这次修改。',
      ].join('\n'),
      assistantMeta: buildPatchPreviewMeta({
        documentLabel: formatDocumentLabel(document),
        operationType: command.operation.type,
        totalLines: preview.totalLines,
        status: 'ready',
        statusText: '正文 diff 已就绪，可直接接受或放弃',
        previews: preview.previews,
      }),
      patchPayload: {
        action: 'rewrite',
        sourceText,
        generatedText: nextText,
        applyMode: 'replace_document',
        targetDocumentId: document.documentId,
        targetDocumentTitle: document.title,
      },
    }
  } catch (error) {
    return {
      handled: true,
      userEcho: input.trim(),
      assistantMessage: error instanceof Error ? error.message : '文档命令执行失败，请稍后再试。',
    }
  }
}

export const documentToolCommandsService = {
  parse: parseWriterDocumentCommand,
  execute: executeWriterDocumentCommand,
}
