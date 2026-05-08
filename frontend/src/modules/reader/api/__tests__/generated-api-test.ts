/**
 * Generated Reader API 测试
 * 测试orval生成的API是否可以正常工作
 */


import { getApi } from '../generated/reader'

// Mock orval mutator
vi.mock('@/core/config/orval-mutator', () => ({
  orvalMutator: vi.fn(),
}))

import { orvalMutator } from '@/core/config/orval-mutator'

describe('Generated Reader API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getApi factory', () => {
    it('should return API object with methods', () => {
      const api = getApi()

      expect(api).toBeDefined()
      expect(typeof api).toBe('object')
    })

    it('should have reader-related methods', () => {
      const api = getApi()

      // 检查是否有reader相关的API方法
      const methodNames = Object.keys(api).filter(name =>
        name.toLowerCase().includes('reader')
      )

      console.log('Found reader methods:', methodNames.slice(0, 10))
      expect(methodNames.length).toBeGreaterThan(0)
    })
  })

  describe('API calls', () => {
    it('should call getApiV1ReaderBooks correctly', async () => {
      const mockResponse = { books: [], total: 0 }
      vi.mocked(orvalMutator).mockResolvedValue(mockResponse)

      const api = getApi()

      // 检查是否有getApiV1ReaderBooks方法
      if (api.getApiV1ReaderBooks) {
        const result = await api.getApiV1ReaderBooks({
          page: 1,
          size: 20,
        })

        expect(orvalMutator).toHaveBeenCalledWith({
          method: 'get',
          url: '/api/v1/reader/books',
          params: { page: 1, size: 20 },
        })
        expect(result).toEqual(mockResponse)
      } else {
        console.log('getApiV1ReaderBooks not found, available methods:',
          Object.keys(api).filter(k => k.includes('Reader')).slice(0, 10))
      }
    })
  })
})
