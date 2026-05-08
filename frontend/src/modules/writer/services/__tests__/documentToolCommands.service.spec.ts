import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockListDocuments = vi.fn()
const mockReadDocument = vi.fn()
const mockSearchDocument = vi.fn()
const mockPreviewTextPatch = vi.fn()

vi.mock('@/modules/writer/services/documentTools.service', () => ({
  documentToolsService: {
    listDocuments: (...args: unknown[]) => mockListDocuments(...args),
    readDocument: (...args: unknown[]) => mockReadDocument(...args),
    searchDocument: (...args: unknown[]) => mockSearchDocument(...args),
    previewTextPatch: (...args: unknown[]) => mockPreviewTextPatch(...args),
  },
}))

import {
  executeWriterDocumentCommand,
  parseWriterDocumentCommand,
} from '../documentToolCommands.service'

describe('documentToolCommandsService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('parses patch replace command with range and content', () => {
    const parsed = parseWriterDocumentCommand('/doc patch replace 12-14 => 新内容\n第二行')

    expect(parsed).toEqual({
      type: 'patch',
      operation: {
        type: 'replace_lines',
        startLine: 12,
        endLine: 14,
        lines: ['新内容', '第二行'],
      },
    })
  })

  it('lists project documents', async () => {
    mockListDocuments.mockResolvedValue({
      projectId: 'project-1',
      documents: [
        { documentId: 'volume-1', title: '第一卷', type: 'volume', level: 0 },
        { documentId: 'chapter-1', title: '第一章', type: 'chapter', level: 1 },
      ],
    })

    const result = await executeWriterDocumentCommand('/doc list', {
      projectId: 'project-1',
    })

    expect(result.handled).toBe(true)
    expect(result.assistantMessage).toContain('当前项目文档')
    expect(result.assistantMessage).toContain('第一卷')
    expect(result.assistantMessage).toContain('chapter-1')
  })

  it('reads current document line range when doc is omitted', async () => {
    mockReadDocument.mockResolvedValue({
      documentId: 'chapter-1',
      version: 3,
      contentType: 'tiptap_json',
      totalLines: 3,
      lines: [
        { line: 1, text: '第一行' },
        { line: 2, text: '第二行' },
        { line: 3, text: '第三行' },
      ],
    })

    const result = await executeWriterDocumentCommand('/doc read 2-3', {
      currentDocumentId: 'chapter-1',
      currentDocumentTitle: '第一章',
    })

    expect(mockReadDocument).toHaveBeenCalledWith('chapter-1')
    expect(result.assistantMessage).toContain('第一章')
    expect(result.assistantMessage).toContain('2-3')
    expect(result.assistantMessage).toContain('   2 | 第二行')
    expect(result.assistantMessage).toContain('   3 | 第三行')
  })

  it('searches explicit document resolved from list', async () => {
    mockListDocuments.mockResolvedValue({
      projectId: 'project-1',
      documents: [{ documentId: 'chapter-2', title: '第二章', type: 'chapter', level: 0 }],
    })
    mockSearchDocument.mockResolvedValue({
      documentId: 'chapter-2',
      query: '张三',
      totalMatches: 1,
      matches: [
        {
          line: 8,
          startColumn: 3,
          endColumn: 4,
          text: '李四看向张三。',
          before: [{ line: 7, text: '门外有人经过。' }],
          after: [{ line: 9, text: '空气忽然沉了下去。' }],
        },
      ],
    })

    const result = await executeWriterDocumentCommand('/doc search --doc=第二章 张三', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-1',
    })

    expect(mockSearchDocument).toHaveBeenCalledWith({
      documentId: 'chapter-2',
      query: '张三',
      contextLines: 1,
    })
    expect(result.assistantMessage).toContain('找到 1 处命中')
    expect(result.assistantMessage).toContain('8 | 李四看向张三。')
  })

  it('turns current chapter patch into replace_document diff payload', async () => {
    mockPreviewTextPatch.mockReturnValue({
      documentId: 'chapter-1',
      baseVersion: 0,
      totalLines: 3,
      lines: [
        { line: 1, text: '第一行' },
        { line: 2, text: '第二行（改）' },
        { line: 3, text: '第三行' },
      ],
      previews: [
        {
          type: 'replace_lines',
          startLine: 2,
          endLine: 2,
          before: ['第二行'],
          after: ['第二行（改）'],
        },
      ],
    })

    const result = await executeWriterDocumentCommand(
      '/doc patch replace 2 => 第二行（改）\n第三行',
      {
        currentDocumentId: 'chapter-1',
        currentDocumentTitle: '第一章',
        currentSourceText: '第一行\n第二行',
      },
    )

    expect(mockPreviewTextPatch).toHaveBeenCalledWith({
      documentId: 'chapter-1',
      lines: [
        { line: 1, text: '第一行' },
        { line: 2, text: '第二行' },
      ],
      operations: [
        {
          type: 'replace_lines',
          startLine: 2,
          endLine: 2,
          lines: ['第二行（改）', '第三行'],
        },
      ],
    })
    expect(result.patchPayload).toEqual({
      action: 'rewrite',
      sourceText: '第一行\n第二行',
      generatedText: '第一行\n第二行（改）\n第三行',
      applyMode: 'replace_document',
      targetDocumentId: 'chapter-1',
      targetDocumentTitle: '第一章',
    })
    expect(result.assistantMeta).toMatchObject({
      kind: 'document_tool_patch_preview',
      status: 'ready',
      documentLabel: '第一章（chapter-1）',
      operationType: 'replace_lines',
      blockCount: 1,
    })
  })

  it('returns target chapter diff payload when patching a non-current document', async () => {
    mockListDocuments.mockResolvedValue({
      projectId: 'project-1',
      documents: [{ documentId: 'chapter-2', title: '第二章', type: 'chapter', level: 0 }],
    })
    mockReadDocument.mockResolvedValue({
      documentId: 'chapter-2',
      baseVersion: 5,
      version: 5,
      contentType: 'tiptap_json',
      totalLines: 12,
      lines: [
        { line: 1, text: '第一行' },
        { line: 2, text: '第二行' },
      ],
    })
    mockPreviewTextPatch.mockReturnValue({
      documentId: 'chapter-2',
      baseVersion: 5,
      totalLines: 1,
      lines: [{ line: 1, text: '第一行' }],
      previews: [
        {
          type: 'delete_lines',
          startLine: 8,
          endLine: 10,
          before: ['旧内容一', '旧内容二', '旧内容三'],
          after: [],
        },
      ],
    })

    const result = await executeWriterDocumentCommand('/doc patch --doc=chapter-2 delete 8-10', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-1',
      currentSourceText: '当前正文',
    })

    expect(mockReadDocument).toHaveBeenCalledWith('chapter-2')
    expect(mockPreviewTextPatch).toHaveBeenCalledWith({
      documentId: 'chapter-2',
      version: 5,
      lines: [
        { line: 1, text: '第一行' },
        { line: 2, text: '第二行' },
      ],
      operations: [
        {
          type: 'delete_lines',
          startLine: 8,
          endLine: 10,
        },
      ],
    })
    expect(result.patchPayload).toEqual({
      action: 'rewrite',
      sourceText: '第一行\n第二行',
      generatedText: '第一行',
      applyMode: 'replace_document',
      targetDocumentId: 'chapter-2',
      targetDocumentTitle: '第二章',
    })
    expect(result.assistantMeta).toMatchObject({
      kind: 'document_tool_patch_preview',
      status: 'switching',
      documentLabel: '第二章（chapter-2）',
      operationType: 'delete_lines',
      blockCount: 1,
    })
    expect(result.assistantMessage).toContain('异章节 patch 预览')
    expect(result.assistantMessage).toContain('准备切章挂起 diff')
    expect(result.assistantMessage).toContain('自动切换到目标章节')
  })
})
