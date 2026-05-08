/**
 * Reader API Wrapper 测试
 * 测试wrapper层是否可以正常工作
 */

// Mock orval mutator
vi.mock('@/core/config/orval-mutator', () => ({
  orvalMutator: vi.fn((config: any) => {
    // 模拟返回数据
    return Promise.resolve({
      books: [],
      total: 0,
      page: config.params?.page || 1,
      size: config.params?.size || 20,
    })
  }),
}))

describe('Reader API Wrapper', () => {
  describe('导入测试', () => {
    it('应该能够导入wrapper', async () => {
      const wrapper = await import('../wrapper')
      expect(wrapper).toBeDefined()
    }, 30000)

    it('应该导出核心API方法', async () => {
      const wrapper = await import('../wrapper')

      // 检查核心方法是否存在
      expect((wrapper as any).getBooks).toBeDefined()
      expect((wrapper as any).getBookInfo).toBeDefined()
      expect((wrapper as any).getChapterInfo).toBeDefined()
      expect((wrapper as any).saveReadingProgress).toBeDefined()
    }, 30000)
  })

  describe('API调用测试', () => {
    it('应该能调用getBooks', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await (wrapper as any).getBooks({ page: 1, size: 20 })

      expect(orvalMutator).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v1/reader/books',
        params: { page: 1, size: 20 },
      } as any)
      expect(result).toBeDefined()
    }, 30000)

    it('应该能调用saveReadingProgress', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const progressData = {
        bookId: 'book-123',
        chapterId: 'chapter-1',
        progress: 50,
      }

      await (wrapper as any).saveReadingProgress(progressData)

      expect(orvalMutator).toHaveBeenCalled()
    }, 30000)
  })
})
