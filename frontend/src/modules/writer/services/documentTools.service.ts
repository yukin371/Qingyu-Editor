import {
  getDocumentContent,
  getDocumentContents,
  getDocumentTree,
  updateDocumentContent,
} from '@/modules/writer/api/wrapper'
import type { Document } from '@/modules/writer/types/document'
import type {
  WriterDocumentLine,
  WriterDocumentPatchOperation,
  WriterDocumentPatchPreview,
  WriterDocumentPatchPreviewResult,
  WriterDocumentToolEntry,
  WriterDocumentToolRequest,
  WriterDocumentToolResponse,
  WriterListDocumentsToolResult,
  WriterPatchDocumentToolRequest,
  WriterPatchDocumentToolResult,
  WriterReadDocumentToolResult,
  WriterSearchDocumentToolRequest,
  WriterSearchDocumentToolResult,
} from '@/modules/writer/types/document-tools'
import {
  buildEditorContentFromPlainText,
  extractPlainTextFromEditorContent,
} from '@/modules/writer/utils/editorContent'

type WrapperResponse<T> = T | { data?: T } | null | undefined

type DocumentContentsPayload = {
  documentId?: string
  contents?: Array<{
    content?: string
    contentType?: string
    version?: number
    order?: number
  }>
}

type DocumentContentPayload = {
  documentId?: string
  content?: string
  contentType?: string
  version?: number
}

function unwrapResponse<T>(payload: WrapperResponse<T>): T {
  return ((payload as { data?: T } | null | undefined)?.data ?? payload ?? {}) as T
}

function normalizeTreeNode(node: Record<string, unknown>): Document {
  return {
    id: String(node.id || node.documentId || ''),
    documentId: String(node.id || node.documentId || ''),
    projectId: String(node.projectId || ''),
    parentId: node.parentId ? String(node.parentId) : undefined,
    title: String(node.title || ''),
    type: String(node.type || 'chapter'),
    level: Number(node.level || 0),
    order: Number(node.order || 0),
    status: String(node.status || 'planned'),
    wordCount: Number(node.wordCount || 0),
    children: Array.isArray(node.children)
      ? node.children.map((child) => normalizeTreeNode(child as Record<string, unknown>))
      : undefined,
    createdAt: String(node.createdAt || ''),
    updatedAt: String(node.updatedAt || ''),
  } as Document
}

function flattenDocumentTree(nodes: Document[], collector: WriterDocumentToolEntry[] = []) {
  nodes
    .slice()
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .forEach((node) => {
      collector.push({
        documentId: String(node.id || node.documentId || ''),
        title: node.title || '',
        type: node.type,
        parentId: node.parentId || undefined,
        level: Number(node.level || 0),
        order: Number(node.order || 0),
        wordCount: Number(node.wordCount || 0),
        status: String(node.status || ''),
      })

      if (Array.isArray(node.children) && node.children.length > 0) {
        flattenDocumentTree(node.children, collector)
      }
    })

  return collector
}

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

function textFromLines(lines: string[]): string {
  return lines.join('\n')
}

function extractPlainTextFromContents(contents: DocumentContentsPayload['contents'] = []): {
  text: string
  version: number
  contentType: string
} {
  if (!Array.isArray(contents) || contents.length === 0) {
    return { text: '', version: 0, contentType: 'tiptap_json' }
  }

  const sorted = contents
    .slice()
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
  const version = Math.max(...sorted.map((item) => Number(item.version || 0)), 0)
  const contentType = String(sorted[0]?.contentType || 'tiptap_json')

  const text = sorted
    .map((item) => extractPlainTextFromEditorContent(item.content || ''))
    .filter((item) => item.length > 0)
    .join('\n\n')

  return { text, version, contentType }
}

function createSearchPattern(request: WriterSearchDocumentToolRequest): RegExp {
  if (request.regex) {
    return new RegExp(request.query, request.caseSensitive ? 'g' : 'gi')
  }

  const escaped = request.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(escaped, request.caseSensitive ? 'g' : 'gi')
}

function applyPatchOperation(
  currentLines: string[],
  operation: WriterDocumentPatchOperation,
): WriterDocumentPatchPreview {
  if (operation.type === 'insert_after_line') {
    if (operation.line < 0 || operation.line > currentLines.length) {
      throw new Error(`插入位置超出范围: ${operation.line}`)
    }

    const insertAt = operation.line
    currentLines.splice(insertAt, 0, ...operation.lines)
    return {
      type: operation.type,
      startLine: operation.line + 1,
      endLine: operation.line + operation.lines.length,
      before: [],
      after: operation.lines.slice(),
    }
  }

  if (operation.startLine <= 0 || operation.endLine < operation.startLine) {
    throw new Error(`无效的行范围: ${operation.startLine}-${operation.endLine}`)
  }

  if (currentLines.length === 0 && operation.startLine === 1 && operation.endLine === 1) {
    if (operation.type === 'replace_lines') {
      currentLines.splice(0, 0, ...operation.lines)
      return {
        type: operation.type,
        startLine: 1,
        endLine: Math.max(operation.lines.length, 1),
        before: [],
        after: operation.lines.slice(),
      }
    }

    return {
      type: operation.type,
      startLine: 1,
      endLine: 1,
      before: [],
      after: [],
    }
  }

  if (operation.endLine > currentLines.length) {
    throw new Error(`行范围超出文档长度: ${operation.startLine}-${operation.endLine}`)
  }

  const startIndex = operation.startLine - 1
  const deleteCount = operation.endLine - operation.startLine + 1
  const before = currentLines.slice(startIndex, startIndex + deleteCount)
  const beforeText = textFromLines(before)
  const normalizedExpected =
    'expectedText' in operation && operation.expectedText
      ? normalizeLineBreaks(operation.expectedText)
      : undefined

  if (normalizedExpected !== undefined && beforeText !== normalizedExpected) {
    throw new Error(`原文校验失败: ${operation.startLine}-${operation.endLine}`)
  }

  if (operation.type === 'delete_lines') {
    currentLines.splice(startIndex, deleteCount)
    return {
      type: operation.type,
      startLine: operation.startLine,
      endLine: operation.endLine,
      before,
      after: [],
    }
  }

  currentLines.splice(startIndex, deleteCount, ...operation.lines)
  return {
    type: operation.type,
    startLine: operation.startLine,
    endLine: operation.endLine,
    before,
    after: operation.lines.slice(),
  }
}

export async function listWriterToolDocuments(
  projectId: string,
): Promise<WriterListDocumentsToolResult> {
  if (!projectId.trim()) {
    throw new Error('projectId 不能为空')
  }

  const payload = unwrapResponse(await getDocumentTree(projectId)) as unknown
  const nodes = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { documents?: unknown[] })?.documents)
      ? (payload as { documents: unknown[] }).documents
      : []

  const tree = nodes.map((node) => normalizeTreeNode(node as Record<string, unknown>))
  return {
    projectId,
    documents: flattenDocumentTree(tree),
  }
}

export async function readWriterToolDocument(
  documentId: string,
): Promise<WriterReadDocumentToolResult> {
  if (!documentId.trim()) {
    throw new Error('documentId 不能为空')
  }

  try {
    const payload = unwrapResponse<DocumentContentsPayload>(await getDocumentContents(documentId))
    const parsed = extractPlainTextFromContents(payload.contents)

    return {
      documentId,
      version: parsed.version,
      contentType: parsed.contentType,
      totalLines: toLines(parsed.text).length,
      lines: toLines(parsed.text),
    }
  } catch {
    const payload = unwrapResponse<DocumentContentPayload>(await getDocumentContent(documentId))
    const plainText = extractPlainTextFromEditorContent(payload.content || '')
    return {
      documentId,
      version: Number(payload.version || 0),
      contentType: String(payload.contentType || 'tiptap_json'),
      totalLines: toLines(plainText).length,
      lines: toLines(plainText),
    }
  }
}

export async function searchWriterToolDocument(
  request: WriterSearchDocumentToolRequest,
): Promise<WriterSearchDocumentToolResult> {
  if (!request.query.trim()) {
    throw new Error('query 不能为空')
  }

  const document = await readWriterToolDocument(request.documentId)
  const pattern = createSearchPattern(request)
  const contextRadius = Math.max(0, request.contextLines || 0)
  const matches = document.lines.flatMap((line) => {
    const found: WriterSearchDocumentToolResult['matches'] = []
    pattern.lastIndex = 0
    for (const match of line.text.matchAll(pattern)) {
      const hit = match[0] || ''
      const startColumn = (match.index ?? 0) + 1
      const endColumn = startColumn + Math.max(hit.length - 1, 0)
      found.push({
        line: line.line,
        startColumn,
        endColumn,
        text: line.text,
        before: document.lines.slice(
          Math.max(0, line.line - contextRadius - 1),
          Math.max(0, line.line - 1),
        ),
        after: document.lines.slice(line.line, line.line + contextRadius),
      })
    }
    return found
  })

  return {
    documentId: request.documentId,
    query: request.query,
    totalMatches: matches.length,
    matches,
  }
}

export function previewWriterToolTextPatch(input: {
  documentId: string
  version?: number
  lines: WriterDocumentLine[]
  operations: WriterDocumentPatchOperation[]
}): WriterDocumentPatchPreviewResult {
  if (!input.documentId.trim()) {
    throw new Error('documentId 不能为空')
  }

  if (!Array.isArray(input.operations) || input.operations.length === 0) {
    throw new Error('operations 不能为空')
  }

  const mutableLines = input.lines.map((line) => line.text)
  const previews = input.operations.map((operation) => applyPatchOperation(mutableLines, operation))
  const nextPlainText = textFromLines(mutableLines)

  return {
    documentId: input.documentId,
    baseVersion: input.version || 0,
    totalLines: mutableLines.length,
    lines: toLines(nextPlainText),
    previews,
  }
}

export async function previewWriterToolDocumentPatch(
  request: WriterPatchDocumentToolRequest,
): Promise<WriterDocumentPatchPreviewResult> {
  if (!request.documentId.trim()) {
    throw new Error('documentId 不能为空')
  }

  if (!Array.isArray(request.operations) || request.operations.length === 0) {
    throw new Error('operations 不能为空')
  }

  const currentDocument = await readWriterToolDocument(request.documentId)
  if (
    typeof request.version === 'number' &&
    request.version > 0 &&
    currentDocument.version > 0 &&
    request.version !== currentDocument.version
  ) {
    throw new Error(
      `文档版本已变化，当前版本 ${currentDocument.version}，请求版本 ${request.version}`,
    )
  }

  return previewWriterToolTextPatch({
    documentId: request.documentId,
    version: currentDocument.version || request.version || 0,
    lines: currentDocument.lines,
    operations: request.operations,
  })
}

export async function patchWriterToolDocument(
  request: WriterPatchDocumentToolRequest,
): Promise<WriterPatchDocumentToolResult> {
  const preview = await previewWriterToolDocumentPatch(request)
  const nextPlainText = textFromLines(preview.lines.map((line) => line.text))

  await updateDocumentContent(request.documentId, {
    content: buildEditorContentFromPlainText(nextPlainText),
    contentType: 'tiptap_json',
    version: preview.baseVersion,
  })

  return {
    ...preview,
    appliedVersion: preview.baseVersion,
    savedContentType: 'tiptap_json',
  }
}

export async function executeWriterDocumentTool(
  request: WriterDocumentToolRequest,
): Promise<WriterDocumentToolResponse> {
  if (request.tool === 'list_documents') {
    return {
      tool: request.tool,
      output: await listWriterToolDocuments(request.input.projectId),
    }
  }

  if (request.tool === 'read_document') {
    return {
      tool: request.tool,
      output: await readWriterToolDocument(request.input.documentId),
    }
  }

  if (request.tool === 'search_document') {
    return {
      tool: request.tool,
      output: await searchWriterToolDocument(request.input),
    }
  }

  return {
    tool: request.tool,
    output: await patchWriterToolDocument(request.input),
  }
}

export const documentToolsService = {
  listDocuments: listWriterToolDocuments,
  readDocument: readWriterToolDocument,
  searchDocument: searchWriterToolDocument,
  previewPatchDocument: previewWriterToolDocumentPatch,
  previewTextPatch: previewWriterToolTextPatch,
  patchDocument: patchWriterToolDocument,
  execute: executeWriterDocumentTool,
}
