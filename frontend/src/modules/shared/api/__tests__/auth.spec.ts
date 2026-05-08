import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sharedAuthAPI } from '../auth'
import { httpService } from '@/core/services/http.service'

vi.mock('@/core/services/http.service', () => ({
  httpService: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}))

describe('sharedAuthAPI profile payload normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getUserInfo should unwrap nested user payloads', async () => {
    vi.mocked(httpService.get).mockResolvedValue({
      user: {
        id: 'user-1',
        username: 'reader_1',
        nickname: '新昵称',
      },
    } as any)

    const response = await sharedAuthAPI.getUserInfo()

    expect(response.user).toEqual({
      id: 'user-1',
      username: 'reader_1',
      nickname: '新昵称',
    })
  })

  it('updateUserInfo should unwrap nested user payloads from profile update responses', async () => {
    vi.mocked(httpService.put).mockResolvedValue({
      user: {
        id: 'user-1',
        username: 'reader_1',
        nickname: '更新后的昵称',
        bio: '更新后的简介',
      },
    } as any)

    const response = await sharedAuthAPI.updateUserInfo({
      nickname: '更新后的昵称',
      bio: '更新后的简介',
    })

    expect(response.user).toEqual({
      id: 'user-1',
      username: 'reader_1',
      nickname: '更新后的昵称',
      bio: '更新后的简介',
    })
  })
})
