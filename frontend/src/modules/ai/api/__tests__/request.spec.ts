import { beforeEach, describe, expect, it, vi } from 'vitest'

const get = vi.fn()
const post = vi.fn()
const put = vi.fn()

vi.mock('@/core/services/http.service', () => ({
  httpService: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
    put: (...args: unknown[]) => put(...args),
  },
}))

import { AI_REQUEST_TIMEOUT_MS, getAIRequest, postAIRequest, putAIRequest } from '../request'

describe('ai request helper', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
    put.mockReset()
    get.mockResolvedValue({})
    post.mockResolvedValue({})
    put.mockResolvedValue({})
  })

  it('applies the shared timeout to post requests', async () => {
    await postAIRequest('/api/v1/ai/chat', { message: 'hello' }, { headers: { 'X-Test': '1' } })

    expect(post).toHaveBeenCalledWith('/api/v1/ai/chat', { message: 'hello' }, {
      timeout: AI_REQUEST_TIMEOUT_MS,
      headers: { 'X-Test': '1' },
    })
  })

  it('applies the shared timeout to get requests', async () => {
    await getAIRequest('/api/v1/ai/health', { params: { verbose: true } })

    expect(get).toHaveBeenCalledWith('/api/v1/ai/health', {
      timeout: AI_REQUEST_TIMEOUT_MS,
      params: { verbose: true },
    })
  })

  it('applies the shared timeout to put requests', async () => {
    await putAIRequest('/api/v1/ai/story/documents/doc-1/scene-state', { sceneGoal: '推进冲突' })

    expect(put).toHaveBeenCalledWith(
      '/api/v1/ai/story/documents/doc-1/scene-state',
      { sceneGoal: '推进冲突' },
      { timeout: AI_REQUEST_TIMEOUT_MS },
    )
  })
})
