import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createDocumentMock, getDetailMock, getDocumentTreeMock, importProjectFromZipMock } = vi.hoisted(() => ({
  createDocumentMock: vi.fn(),
  getDetailMock: vi.fn(),
  getDocumentTreeMock: vi.fn(),
  importProjectFromZipMock: vi.fn(),
}))

vi.mock('@/modules/writer/api/project', () => ({
  projectApi: {
    getDetail: getDetailMock,
  },
}))

vi.mock('@/modules/writer/api/document', () => ({
  createDocument: createDocumentMock,
  getDocumentTree: getDocumentTreeMock,
}))

vi.mock('@/utils/exportImport', () => ({
  importProjectFromZip: importProjectFromZipMock,
}))

import {
  buildWorkbenchRecentProjectCards,
  ensureProjectBaseSkeleton,
  importProjectArchive,
  resolveProjectContinueTarget,
} from '../workbenchProject.service'

describe('workbenchProject.service', () => {
  beforeEach(() => {
    createDocumentMock.mockReset()
    getDetailMock.mockReset()
    getDocumentTreeMock.mockReset()
    importProjectFromZipMock.mockReset()
  })

  it('继续创作应优先跳到最近章节', async () => {
    getDetailMock.mockResolvedValue({
      id: 'project-1',
      documents: [
        { id: 'volume-1', type: 'volume', lastEditAt: '2026-05-10T10:00:00.000Z' },
        {
          id: 'chapter-1',
          type: 'chapter',
          title: '第一章',
          lastEditAt: '2026-05-11T10:00:00.000Z',
        },
        {
          id: 'chapter-2',
          type: 'chapter',
          title: '第二章',
          lastEditAt: '2026-05-12T08:00:00.000Z',
        },
      ],
    })

    const target = await resolveProjectContinueTarget('project-1')

    expect(target).toEqual({
      name: 'writer-project',
      params: { projectId: 'project-1' },
      query: { chapterId: 'chapter-2' },
    })
  })

  it('最近项目卡片应复用详情中的最近章节', async () => {
    getDetailMock.mockResolvedValue({
      id: 'project-1',
      documents: [
        { id: 'chapter-9', type: 'chapter', title: '尾声', lastEditAt: '2026-05-12T08:00:00.000Z' },
      ],
    })

    const cards = await buildWorkbenchRecentProjectCards([
      {
        id: 'project-1',
        title: '夜航人手册',
        summary: '关于离岸电台与失联海域',
        status: 'serializing',
        category: '悬疑',
        totalWords: 42000,
        chapterCount: 18,
        updatedAt: '2026-05-12T09:00:00.000Z',
      },
    ])

    expect(cards[0]).toMatchObject({
      id: 'project-1',
      lastChapterTitle: '尾声',
      continueTarget: {
        name: 'writer-project',
        params: { projectId: 'project-1' },
        query: { chapterId: 'chapter-9' },
      },
    })
  })

  it('导入入口应直接复用现有 ZIP 导入能力', async () => {
    importProjectFromZipMock.mockResolvedValue({ success: true, projectId: 'imported-1' })

    const file = new File(['demo'], 'demo.zip', { type: 'application/zip' })
    const result = await importProjectArchive(file)

    expect(importProjectFromZipMock).toHaveBeenCalledWith(file)
    expect(result).toEqual({ success: true, projectId: 'imported-1' })
  })

  it('新建普通项目后应补第一卷和第一章骨架', async () => {
    getDocumentTreeMock.mockResolvedValue([])
    createDocumentMock
      .mockResolvedValueOnce({ id: 'volume-1', type: 'volume', title: '第一卷' })
      .mockResolvedValueOnce({ id: 'chapter-1', type: 'chapter', title: '第一章' })

    const result = await ensureProjectBaseSkeleton('project-1')

    expect(createDocumentMock).toHaveBeenNthCalledWith(1, 'project-1', {
      projectId: 'project-1',
      title: '第一卷',
      type: 'volume',
      order: 0,
    })
    expect(createDocumentMock).toHaveBeenNthCalledWith(2, 'project-1', {
      projectId: 'project-1',
      parentId: 'volume-1',
      title: '第一章',
      type: 'chapter',
      order: 0,
    })
    expect(result).toEqual({ chapterId: 'chapter-1' })
  })

  it('已有章节时不应重复补项目骨架', async () => {
    getDocumentTreeMock.mockResolvedValue([
      {
        id: 'volume-1',
        type: 'volume',
        title: '第一卷',
        children: [{ id: 'chapter-1', type: 'chapter', title: '第一章', order: 0 }],
      },
    ])

    const result = await ensureProjectBaseSkeleton('project-1')

    expect(createDocumentMock).not.toHaveBeenCalled()
    expect(result).toEqual({ chapterId: 'chapter-1' })
  })
})
