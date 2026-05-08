/**
 * Writer API Wrapper 测试
 * 仅验证 wrapper 层调用链，不触发真实网络请求
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetProjects = vi.fn()
const mockCreateProjectDocument = vi.fn()
const mockUpdateDocument = vi.fn()
const mockGetProjectDocuments = vi.fn()

vi.mock('../generated/writer', () => ({
  getApi: () => ({
    getApiV1ProjectsProjectIdDocuments: mockGetProjectDocuments,
    postApiV1ProjectsProjectIdDocuments: mockCreateProjectDocument,
    putApiV1DocumentsId: mockUpdateDocument
  })
}))

vi.mock('../project', () => ({
  getProjects: mockGetProjects,
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}))

describe('Writer API Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProjects.mockResolvedValue({ data: { items: [] } })
    mockGetProjectDocuments.mockResolvedValue({ data: { items: [] } })
    mockCreateProjectDocument.mockResolvedValue({ data: { id: 'doc-1' } })
    mockUpdateDocument.mockResolvedValue({ data: { id: 'doc-1' } })
  })

  it('应该导出核心API方法', async () => {
    const wrapper = await import('../wrapper')
    expect(wrapper.getProjects).toBeDefined()
    expect(wrapper.getProjectDocuments).toBeDefined()
    expect(wrapper.createDocument).toBeDefined()
    expect(wrapper.updateDocument).toBeDefined()
  })

  it('getProjects 应该委托给 generated api', async () => {
    const wrapper = await import('../wrapper')
    await wrapper.getProjects({ page: 1 } as any)
    expect(mockGetProjects).toHaveBeenCalled()
  })

  it('createDocument 应该委托给 generated api', async () => {
    const wrapper = await import('../wrapper')
    await wrapper.createDocument(
      {
        projectId: 'project-123',
        title: 'Test Document',
        content: 'Test content'
      } as any,
      {} as any
    )
    expect(mockCreateProjectDocument).toHaveBeenCalled()
  })
})
