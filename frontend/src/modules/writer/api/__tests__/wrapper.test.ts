import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetProjects = vi.fn()
const mockCreateDocument = vi.fn()
const mockUpdateContent = vi.fn()

vi.mock('../project', () => ({
  getProjects: mockGetProjects,
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}))

vi.mock('../document', () => ({
  getDocuments: vi.fn(),
  getDocumentById: vi.fn(),
  getDocumentTree: vi.fn(),
  createDocument: mockCreateDocument,
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  moveDocument: vi.fn(),
  duplicateDocument: vi.fn(),
}))

vi.mock('../editor', () => ({
  editorApi: {
    getContent: vi.fn(),
    getSaveStatus: vi.fn(),
    getContents: vi.fn(),
    replaceContents: vi.fn(),
    reindexContents: vi.fn(),
    autoSave: vi.fn(),
    updateContent: mockUpdateContent,
  },
}))

describe('Writer API Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProjects.mockResolvedValue({ data: { items: [] } })
    mockCreateDocument.mockResolvedValue({ data: { id: 'doc-1' } })
    mockUpdateContent.mockResolvedValue(undefined)
  })

  it('应该导出当前桌面主链需要的核心方法', async () => {
    const wrapper = await import('../wrapper')
    expect(wrapper.getProjects).toBeDefined()
    expect(wrapper.createDocument).toBeDefined()
    expect(wrapper.updateDocumentContent).toBeDefined()
    expect(wrapper.getDocumentTree).toBeDefined()
  })

  it('getProjects 应该委托给 project API', async () => {
    const wrapper = await import('../wrapper')
    await wrapper.getProjects({ page: 1 } as any)
    expect(mockGetProjects).toHaveBeenCalled()
  })

  it('createDocument 应该委托给 document API', async () => {
    const wrapper = await import('../wrapper')
    await wrapper.createDocument('project-123', {
      title: 'Test Document',
      content: 'Test content',
    })
    expect(mockCreateDocument).toHaveBeenCalledWith(
      'project-123',
      expect.objectContaining({
        title: 'Test Document',
      }),
    )
  })

  it('updateDocumentContent 应该委托给 editor API', async () => {
    const wrapper = await import('../wrapper')
    await wrapper.updateDocumentContent('doc-1', {
      content: 'hello',
      version: 2,
      contentType: 'tiptap_json',
    })
    expect(mockUpdateContent).toHaveBeenCalledWith(
      'doc-1',
      expect.objectContaining({
        content: 'hello',
        version: 2,
        contentType: 'tiptap_json',
      }),
    )
  })
})
