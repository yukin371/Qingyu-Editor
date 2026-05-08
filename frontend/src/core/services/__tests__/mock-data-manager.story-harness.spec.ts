import { beforeEach, describe, expect, it } from 'vitest'
import { handleMockRequest, resetMockState } from '../mock-data-manager'

describe('mock-data-manager story harness routes', () => {
  beforeEach(() => {
    resetMockState()
  })

  it('应返回今日写作统计 mock，避免 workspace 状态栏在 test mode 下告警', async () => {
    const response = await handleMockRequest('/api/v1/writer/stats/today', {
      method: 'get',
    })

    expect(response.code).toBe(200)
    expect(response.data.todayWords).toBeGreaterThan(0)
    expect(response.data.words).toBe(response.data.todayWords)
  })

  it('应返回 demo 章节分段内容', async () => {
    const response = await handleMockRequest('/api/v1/writer/documents/ch-2/contents', {
      method: 'get',
    })

    expect(response.code).toBe(200)
    expect(response.data.documentId).toBe('ch-2')
    expect(response.data.total).toBeGreaterThan(0)
    expect(response.data.wordCount).toBeGreaterThan(0)
    expect(Array.isArray(response.data.contents)).toBe(true)
    expect(response.data.contents[0].contentType).toBe('markdown')
  })

  it('应返回今日写作统计，避免状态栏在 mock mode 下命中未匹配路由', async () => {
    const response = await handleMockRequest('/api/v1/writer/stats/today', {
      method: 'get',
    })

    expect(response.code).toBe(200)
    expect(response.data.todayWords).toBeGreaterThan(0)
    expect(response.data.writingMinutes).toBeGreaterThan(0)
    expect(typeof response.data.date).toBe('string')
  })

  it('应支持保存后批次回执与 latest 读取', async () => {
    const createResponse = await handleMockRequest(
      '/writer/project/project-yljs-1/documents/ch-2/story-harness/batches',
      {
        method: 'post',
        data: {
          chapterTitle: '第二章：雨夜入城',
          changeRequests: [
            {
              id: 'live-cr-1',
              source: 'live',
              type: 'state',
              title: '正文指令建议：更新周德厚',
              summary: '进入观察状态',
              reason: '正文已显式说明态度变化',
              severity: 'focus',
            },
          ],
        },
      },
    )

    expect(createResponse.code).toBe(200)
    expect(createResponse.data.chapterId).toBe('ch-2')
    expect(createResponse.data.changeRequests).toHaveLength(1)

    const latestResponse = await handleMockRequest(
      '/writer/project/project-yljs-1/documents/ch-2/story-harness/batches/latest',
      {
        method: 'get',
      },
    )

    expect(latestResponse.code).toBe(200)
    expect(latestResponse.data.batchId).toBe(createResponse.data.batchId)
    expect(latestResponse.data.changeRequests[0].title).toContain('更新周德厚')
  })

  it('应支持触发索引、查询队列并更新待处理状态', async () => {
    const triggerResponse = await handleMockRequest(
      '/writer/projects/project-yljs-1/chapters/ch-2/trigger-index',
      {
        method: 'post',
      },
    )

    expect(triggerResponse.code).toBe(200)
    expect(triggerResponse.data.generated).toBeGreaterThan(0)
    expect(triggerResponse.data.pending).toBeGreaterThan(0)

    const listResponse = await handleMockRequest(
      '/writer/projects/project-yljs-1/chapters/ch-2/change-requests?status=pending',
      {
        method: 'get',
      },
    )

    expect(listResponse.code).toBe(200)
    expect(listResponse.data.total).toBeGreaterThan(0)

    const firstRequestId = listResponse.data.items[0].id as string

    await handleMockRequest(`/writer/change-requests/${firstRequestId}/status`, {
      method: 'put',
      data: { status: 'accepted' },
    })

    const contextResponse = await handleMockRequest(
      '/writer/projects/project-yljs-1/chapters/ch-2/context',
      {
        method: 'get',
      },
    )

    expect(contextResponse.code).toBe(200)
    expect(contextResponse.data.characters).toHaveLength(2)
    expect(contextResponse.data.pendingCRs).toBe(listResponse.data.total - 1)
  })
})
