import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  createProjectMock,
  createDocumentMock,
  updateDocumentContentMock,
  saveCreativeWorkflowMock,
} = vi.hoisted(() => ({
  createProjectMock: vi.fn(),
  createDocumentMock: vi.fn(),
  updateDocumentContentMock: vi.fn(),
  saveCreativeWorkflowMock: vi.fn(),
}))

vi.mock('@/modules/writer/api/project', () => ({
  projectApi: {
    create: createProjectMock,
  },
}))

vi.mock('@/modules/writer/api/document', () => ({
  createDocument: createDocumentMock,
}))

vi.mock('@/modules/writer/api/editor', () => ({
  updateDocumentContent: updateDocumentContentMock,
}))

vi.mock('../creativeWorkflow.service', async () => {
  const actual = await vi.importActual<typeof import('../creativeWorkflow.service')>(
    '../creativeWorkflow.service',
  )
  return {
    ...actual,
    saveCreativeWorkflow: saveCreativeWorkflowMock,
  }
})

import {
  createProjectFromTemplate,
  getWorkbenchTemplateDetail,
  listWorkbenchTemplateCategories,
} from '../workbenchTemplate.service'

describe('workbenchTemplate.service', () => {
  beforeEach(() => {
    createProjectMock.mockReset()
    createDocumentMock.mockReset()
    updateDocumentContentMock.mockReset()
    saveCreativeWorkflowMock.mockReset()
  })

  it('模板详情应提供大纲/角色/设定三类结构化预览', () => {
    const detail = getWorkbenchTemplateDetail('mystery')

    expect(detail?.previewTabs.outline).toHaveLength(3)
    expect(detail?.previewTabs.characters.length).toBeGreaterThan(0)
    expect(detail?.previewTabs.settings.length).toBeGreaterThan(0)
  })

  it('模板分类列表应包含全部模板入口', () => {
    const categories = listWorkbenchTemplateCategories()

    expect(categories[0]).toEqual({
      id: 'all',
      label: '全部模板',
      count: 5,
    })
  })

  it('应用模板创建项目时应写入 sidecar 并生成黄金三章', async () => {
    createProjectMock.mockResolvedValue({ id: 'project-77' })
    createDocumentMock
      .mockResolvedValueOnce({ id: 'volume-1' })
      .mockResolvedValueOnce({ id: 'chapter-1' })
      .mockResolvedValueOnce({ id: 'chapter-2' })
      .mockResolvedValueOnce({ id: 'chapter-3' })
    updateDocumentContentMock.mockResolvedValue(undefined)

    const result = await createProjectFromTemplate({
      templateId: 'comeback',
      title: '逆光反击录',
      summary: '先抑后扬的开局验证',
    })

    expect(createProjectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '逆光反击录',
        category: '赘婿',
      }),
    )
    expect(saveCreativeWorkflowMock).toHaveBeenCalledWith('project-77', { templateId: 'comeback' })
    expect(createDocumentMock).toHaveBeenCalledTimes(4)
    expect(updateDocumentContentMock).toHaveBeenCalledTimes(3)
    expect(result).toEqual({
      projectId: 'project-77',
      chapterId: 'chapter-1',
    })
  })
})
