const mockGetDocumentTree = vi.fn()
const mockGetDocumentContents = vi.fn()
const mockGetDocumentContent = vi.fn()
const mockUpdateDocumentContent = vi.fn()

vi.mock('@/modules/writer/api/wrapper', () => ({
  getDocumentTree: (...args: unknown[]) => mockGetDocumentTree(...args),
  getDocumentContents: (...args: unknown[]) => mockGetDocumentContents(...args),
  getDocumentContent: (...args: unknown[]) => mockGetDocumentContent(...args),
  updateDocumentContent: (...args: unknown[]) => mockUpdateDocumentContent(...args),
}))

import { documentToolsService } from '../documentTools.service'

describe('documentToolsService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('flattens document tree into tool entries', async () => {
    mockGetDocumentTree.mockResolvedValue({
      documents: [
        {
          id: 'volume-1',
          title: '第一卷',
          type: 'volume',
          level: 0,
          order: 1,
          children: [
            {
              id: 'chapter-1',
              parentId: 'volume-1',
              title: '第一章',
              type: 'chapter',
              level: 1,
              order: 2,
              wordCount: 1234,
            },
          ],
        },
      ],
    })

    const result = await documentToolsService.listDocuments('project-1')

    expect(result.documents).toEqual([
      expect.objectContaining({
        documentId: 'volume-1',
        title: '第一卷',
        type: 'volume',
      }),
      expect.objectContaining({
        documentId: 'chapter-1',
        parentId: 'volume-1',
        title: '第一章',
        type: 'chapter',
        wordCount: 1234,
      }),
    ])
  })

  it('reads tiptap_json document content into line entries', async () => {
    mockGetDocumentContents.mockResolvedValue({
      documentId: 'chapter-1',
      contents: [
        {
          order: 1,
          version: 7,
          contentType: 'tiptap_json',
          content: JSON.stringify({
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: '第一行' }] },
              { type: 'paragraph', content: [{ type: 'text', text: '第二行' }] },
            ],
          }),
        },
      ],
    })

    const result = await documentToolsService.readDocument('chapter-1')

    expect(result.version).toBe(7)
    expect(result.lines).toEqual([
      { line: 1, text: '第一行' },
      { line: 2, text: '第二行' },
    ])
  })

  it('searches line content with context', async () => {
    mockGetDocumentContents.mockResolvedValue({
      documentId: 'chapter-1',
      contents: [
        {
          order: 1,
          version: 3,
          contentType: 'tiptap_json',
          content: JSON.stringify({
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: '张三起身。' }] },
              { type: 'paragraph', content: [{ type: 'text', text: '李四看向张三。' }] },
              { type: 'paragraph', content: [{ type: 'text', text: '风声更紧。' }] },
            ],
          }),
        },
      ],
    })

    const result = await documentToolsService.searchDocument({
      documentId: 'chapter-1',
      query: '张三',
      contextLines: 1,
    })

    expect(result.totalMatches).toBe(2)
    expect(result.matches[1]).toMatchObject({
      line: 2,
      startColumn: 5,
      text: '李四看向张三。',
    })
    expect(result.matches[1].before).toEqual([{ line: 1, text: '张三起身。' }])
  })

  it('patches lines and writes tiptap_json content with version', async () => {
    mockGetDocumentContents.mockResolvedValue({
      documentId: 'chapter-1',
      contents: [
        {
          order: 1,
          version: 5,
          contentType: 'tiptap_json',
          content: JSON.stringify({
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: '第一行' }] },
              { type: 'paragraph', content: [{ type: 'text', text: '第二行' }] },
            ],
          }),
        },
      ],
    })
    mockUpdateDocumentContent.mockResolvedValue(undefined)

    const result = await documentToolsService.patchDocument({
      documentId: 'chapter-1',
      version: 5,
      operations: [
        {
          type: 'replace_lines',
          startLine: 2,
          endLine: 2,
          lines: ['第二行（改）'],
          expectedText: '第二行',
        },
        {
          type: 'insert_after_line',
          line: 2,
          lines: ['第三行'],
        },
      ],
    })

    expect(mockUpdateDocumentContent).toHaveBeenCalledWith(
      'chapter-1',
      expect.objectContaining({
        contentType: 'tiptap_json',
        version: 5,
      }),
    )
    expect(result.lines).toEqual([
      { line: 1, text: '第一行' },
      { line: 2, text: '第二行（改）' },
      { line: 3, text: '第三行' },
    ])
    expect(result.previews).toEqual([
      expect.objectContaining({
        type: 'replace_lines',
        before: ['第二行'],
        after: ['第二行（改）'],
      }),
      expect.objectContaining({
        type: 'insert_after_line',
        after: ['第三行'],
      }),
    ])
  })
})
