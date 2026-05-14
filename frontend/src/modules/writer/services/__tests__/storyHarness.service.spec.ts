import { beforeEach, describe, expect, it, vi } from 'vitest'
import { storyHarnessService } from '../storyHarness.service'

const mockCreateStoryHarnessBatch = vi.fn()
const mockGetLatestStoryHarnessBatch = vi.fn()

const createLocalStorageMock = () => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length
    },
  }
}

const localStorageMock = createLocalStorageMock()

vi.stubGlobal('localStorage', localStorageMock)

vi.mock('@/modules/writer/api/story-harness', () => ({
  createStoryHarnessBatch: (...args: unknown[]) => mockCreateStoryHarnessBatch(...args),
  getLatestStoryHarnessBatch: (...args: unknown[]) => mockGetLatestStoryHarnessBatch(...args),
}))

describe('storyHarnessService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    window.history.replaceState({}, '', '/?remote=true')
  })

  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('远端保存失败时应回退到本地持久化，并生成 receipt', async () => {
    mockCreateStoryHarnessBatch.mockRejectedValue(new Error('not ready'))

    const result = await storyHarnessService.persistBatch({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      chapterTitle: '第一章',
      changeRequests: [
        {
          id: 'cr-1',
          source: 'live',
          type: 'state',
          title: '正文指令建议：更新 李四',
          summary: '受伤严重，退出后续战斗。',
          reason: '作者在正文中显式写下了指令。',
          severity: 'focus',
        },
      ],
    })

    expect(result.receipt.chapterId).toBe('chapter-1')
    expect(result.receipt.count).toBe(1)
    expect(result.receipt.source).toBe('local_fallback')
    expect(result.changeRequests[0].source).toBe('save_batch')
    expect(result.changeRequests[0].id).toContain('save-batch:')
  })

  it('远端返回缺失 changeRequests 时应回退到原始 payload 补齐，而不是触发异常回退', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    mockCreateStoryHarnessBatch.mockResolvedValue({
      data: {
        batchId: 'batch-2',
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        committedAt: 1712345678902,
        source: 'remote',
      },
    })

    const result = await storyHarnessService.persistBatch({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      chapterTitle: '第一章',
      changeRequests: [
        {
          id: 'cr-1',
          source: 'live',
          type: 'state',
          title: '正文指令建议：更新 李四',
          summary: '受伤严重，退出后续战斗。',
          reason: '作者在正文中显式写下了指令。',
          severity: 'focus',
        },
      ],
    })

    expect(result.receipt.batchId).toBe('batch-2')
    expect(result.receipt.count).toBe(1)
    expect(result.receipt.source).toBe('remote')
    expect(result.changeRequests[0].id).toContain('save-batch:batch-2')
    expect(warnSpy).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  it('应优先读取远端批次，并归一化为正式建议批次', async () => {
    mockGetLatestStoryHarnessBatch.mockResolvedValue({
      data: {
        batchId: 'batch-1',
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        committedAt: 1712345678901,
        source: 'remote',
        changeRequests: [
          {
            id: 'cr-1',
            source: 'save_batch',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为怀疑或动摇',
            reason: '正文命中了状态关键词。',
            severity: 'focus',
          },
        ],
      },
    })

    const result = await storyHarnessService.getLatestBatch('project-1', 'chapter-1')

    expect(result?.receipt.batchId).toBe('batch-1')
    expect(result?.receipt.source).toBe('remote')
    expect(result?.changeRequests[0].id).toContain('save-batch:batch-1')
  })

  it('远端显式返回 null 批次时，不应把响应壳误判为异常 payload', async () => {
    mockGetLatestStoryHarnessBatch.mockResolvedValue({ data: null })

    const result = await storyHarnessService.getLatestBatch('project-1', 'chapter-1')

    expect(result).toBeNull()
  })

  it('读取远端批次缺少变更列表时，应与本地缓存合并而不是返回空壳批次', async () => {
    mockCreateStoryHarnessBatch.mockRejectedValueOnce(new Error('offline'))

    await storyHarnessService.persistBatch({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      chapterTitle: '第一章',
      changeRequests: [
        {
          id: 'cr-1',
          source: 'live',
          type: 'state',
          title: '正文指令建议：更新 李四',
          summary: '受伤严重，退出后续战斗。',
          reason: '作者在正文中显式写下了指令。',
          severity: 'focus',
        },
      ],
    })

    mockGetLatestStoryHarnessBatch.mockResolvedValue({
      data: {
        batchId: 'batch-remote',
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章（远端）',
        committedAt: 1712345678999,
        source: 'remote',
      },
    })

    const result = await storyHarnessService.getLatestBatch('project-1', 'chapter-1')

    expect(result?.receipt.batchId).toBe('batch-remote')
    expect(result?.receipt.source).toBe('remote')
    expect(result?.receipt.count).toBe(1)
    expect(result?.changeRequests[0].id).toContain('save-batch:batch-remote')
  })

  it('默认 standalone-local 宿主保存 Story Harness 批次时不应请求远端', async () => {
    window.history.replaceState({}, '', '/')

    const result = await storyHarnessService.persistBatch({
      projectId: 'project-local',
      chapterId: 'chapter-local',
      chapterTitle: '本地章节',
      changeRequests: [
        {
          id: 'cr-local-1',
          source: 'live',
          type: 'state',
          title: '正文指令建议：更新 本地角色',
          summary: '本地宿主应直接落本地缓存。',
          reason: '独立编辑器默认不依赖原后端。',
          severity: 'focus',
        },
      ],
    })

    expect(mockCreateStoryHarnessBatch).not.toHaveBeenCalled()
    expect(result.receipt.source).toBe('local_fallback')

    const hydrated = await storyHarnessService.getLatestBatch('project-local', 'chapter-local')
    expect(mockGetLatestStoryHarnessBatch).not.toHaveBeenCalled()
    expect(hydrated?.receipt.chapterId).toBe('chapter-local')
    expect(hydrated?.changeRequests[0].id).toContain('save-batch:')
  })

  it('standalone-local 下应基于本地批次返回 pending 建议，并支持本地决策刷新', async () => {
    window.history.replaceState({}, '', '/')

    await storyHarnessService.persistBatch({
      projectId: 'project-local',
      chapterId: 'chapter-local',
      chapterTitle: '本地章节',
      changeRequests: [
        {
          id: 'cr-local-1',
          source: 'live',
          type: 'state',
          title: '正文指令建议：更新 本地角色',
          summary: '本地宿主应直接落本地缓存。',
          reason: '独立编辑器默认不依赖原后端。',
          severity: 'focus',
        },
      ],
    })

    const pendingBefore = await storyHarnessService.fetchChangeRequests(
      'project-local',
      'chapter-local',
      'pending',
    )
    expect(pendingBefore).toHaveLength(1)
    expect(pendingBefore[0]?.status).toBe('pending')

    const requestId = pendingBefore[0]?.id as string
    await expect(storyHarnessService.processChangeRequest(requestId, 'ignored')).resolves.toBe(true)

    const pendingAfter = await storyHarnessService.fetchChangeRequests(
      'project-local',
      'chapter-local',
      'pending',
    )
    const ignored = await storyHarnessService.fetchChangeRequests(
      'project-local',
      'chapter-local',
      'ignored',
    )

    expect(pendingAfter).toHaveLength(0)
    expect(ignored).toHaveLength(1)
    expect(ignored[0]?.id).toBe(requestId)
    expect(mockCreateStoryHarnessBatch).not.toHaveBeenCalled()
    expect(mockGetLatestStoryHarnessBatch).not.toHaveBeenCalled()
  })
})
