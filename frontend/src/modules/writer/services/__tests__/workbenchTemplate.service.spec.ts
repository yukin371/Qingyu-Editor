import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  createProjectMock,
  createDocumentMock,
  saveCreativeWorkflowMock,
  saveWriterProjectBriefMock,
} = vi.hoisted(() => ({
  createProjectMock: vi.fn(),
  createDocumentMock: vi.fn(),
  saveCreativeWorkflowMock: vi.fn(),
  saveWriterProjectBriefMock: vi.fn(),
}))

vi.mock('@/modules/writer/api/project', () => ({
  projectApi: {
    create: createProjectMock,
  },
}))

vi.mock('@/modules/writer/api/document', () => ({
  createDocument: createDocumentMock,
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

vi.mock('../writerProjectBrief.service', () => ({
  saveWriterProjectBrief: saveWriterProjectBriefMock,
}))

import {
  createProjectFromTemplate,
  getWorkbenchTemplateDetail,
  listWorkbenchTemplateCategories,
} from '../workbenchTemplate.service'

describe('workbenchTemplate.service', () => {
  beforeEach(() => {
    createProjectMock.mockReset()
    createDocumentMock.mockReset()
    saveCreativeWorkflowMock.mockReset()
    saveCreativeWorkflowMock.mockResolvedValue(undefined)
    saveWriterProjectBriefMock.mockReset()
    saveWriterProjectBriefMock.mockResolvedValue(undefined)
  })

  it('模板详情应提供大纲/角色/设定三类结构化预览', async () => {
    const detail = await getWorkbenchTemplateDetail('cautious-mortal')

    expect(detail?.previewTabs.outline).toHaveLength(3)
    expect(detail?.previewTabs.characters.length).toBeGreaterThan(0)
    expect(detail?.previewTabs.settings.length).toBeGreaterThan(0)
    expect(detail?.commercialMechanism?.protagonistArchetype).toContain('凡人')
    expect(detail?.commercialMechanism?.promptPresetIds).toContain('chapterReview')
    expect(detail?.commercialMechanism?.promptPresets?.map((preset) => preset.label)).toContain('审本章')
  })

  it('模板分类列表应包含全部模板入口', async () => {
    const categories = await listWorkbenchTemplateCategories()

    expect(categories[0]).toEqual({
      id: 'all',
      label: '全部模板',
      count: 8,
    })
  })

  it('应用模板创建项目时应写入 sidecar 并生成黄金三章', async () => {
    createProjectMock.mockResolvedValue({ id: 'project-77' })
    createDocumentMock
      .mockResolvedValueOnce({ id: 'volume-1' })
      .mockResolvedValueOnce({ id: 'chapter-1' })
      .mockResolvedValueOnce({ id: 'chapter-2' })
      .mockResolvedValueOnce({ id: 'chapter-3' })

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
    expect(saveWriterProjectBriefMock).toHaveBeenCalledWith(
      'project-77',
      expect.objectContaining({
        premise: '先抑后扬的开局验证',
        genreTemplateId: 'comeback',
        targetAudience: '赘婿',
      }),
    )
    expect(createDocumentMock).toHaveBeenCalledTimes(4)
    expect(createDocumentMock).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        content: expect.any(String),
      }),
    )
    expect(result).toEqual({
      projectId: 'project-77',
      chapterId: 'chapter-1',
    })
  })
})
