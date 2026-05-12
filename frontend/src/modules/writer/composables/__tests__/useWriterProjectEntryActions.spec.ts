import { beforeEach, describe, expect, it, vi } from 'vitest'

const { routerPushMock, importProjectArchiveMock, messageErrorMock, messageSuccessMock } =
  vi.hoisted(() => ({
    routerPushMock: vi.fn().mockResolvedValue(undefined),
    importProjectArchiveMock: vi.fn(),
    messageErrorMock: vi.fn(),
    messageSuccessMock: vi.fn(),
  }))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}))

vi.mock('@/modules/writer/services/workbenchProject.service', () => ({
  importProjectArchive: importProjectArchiveMock,
}))

vi.mock('@/design-system/services', () => ({
  message: {
    error: messageErrorMock,
    success: messageSuccessMock,
  },
}))

import { useWriterProjectEntryActions } from '../useWriterProjectEntryActions'

describe('useWriterProjectEntryActions', () => {
  beforeEach(() => {
    routerPushMock.mockClear()
    importProjectArchiveMock.mockReset()
    messageErrorMock.mockClear()
    messageSuccessMock.mockClear()
  })

  it('openProject 应进入项目工作区', async () => {
    const { openProject } = useWriterProjectEntryActions()

    await openProject('project-1', { chapterId: 'chapter-1' })

    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'writer-project',
      params: { projectId: 'project-1' },
      query: { chapterId: 'chapter-1' },
    })
  })

  it('continueProject 应使用最近章节目标', async () => {
    const { continueProject } = useWriterProjectEntryActions()
    const continueTarget = {
      name: 'writer-project',
      params: { projectId: 'project-1' },
      query: { chapterId: 'chapter-2' },
    }

    await continueProject({
      id: 'project-1',
      title: '夜航人手册',
      summary: '',
      status: 'serializing',
      statusLabel: '连载中',
      category: '悬疑',
      totalWords: 1200,
      chapterCount: 2,
      updatedAt: '2026-05-12T12:00:00.000Z',
      continueTarget,
    })

    expect(routerPushMock).toHaveBeenCalledWith(continueTarget)
  })

  it('importProjectAndEnter 导入成功后刷新并进入项目', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined)
    importProjectArchiveMock.mockResolvedValue({
      success: true,
      projectId: 'imported-1',
      title: '导入项目',
    })
    const { importProjectAndEnter } = useWriterProjectEntryActions()

    await importProjectAndEnter(new File(['demo'], 'demo.zip'), { refresh })

    expect(refresh).toHaveBeenCalled()
    expect(messageSuccessMock).toHaveBeenCalledWith('已导入项目：导入项目')
    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'writer-project',
      params: { projectId: 'imported-1' },
    })
  })

  it('importProjectAndEnter 导入失败时留在当前页', async () => {
    importProjectArchiveMock.mockResolvedValue({
      success: false,
      error: '文件格式不正确',
    })
    const { importProjectAndEnter } = useWriterProjectEntryActions()

    await importProjectAndEnter(new File(['demo'], 'demo.txt'))

    expect(messageErrorMock).toHaveBeenCalledWith('文件格式不正确')
    expect(routerPushMock).not.toHaveBeenCalled()
  })
})
