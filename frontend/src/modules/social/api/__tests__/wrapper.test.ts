/**
 * Social API Wrapper 测试
 * 测试wrapper层是否可以正常工作
 */



// Mock orval mutator
vi.mock('@/core/config/orval-mutator', () => ({
  orvalMutator: vi.fn((config) => {
    // 模拟返回数据
    return Promise.resolve({
      data: [],
      total: 0,
      page: config.params?.page || 1,
      size: config.params?.size || 20,
    })
  }),
}))

describe('Social API Wrapper', () => {
  describe('导入测试', () => {
    it('应该能够导入wrapper', async () => {
      const wrapper = await import('../wrapper')
      expect(wrapper).toBeDefined()
    })

    it('应该导出核心API方法', async () => {
      const wrapper = await import('../wrapper')

      // 检查核心方法是否存在
      expect(wrapper.getBookLists).toBeDefined()
      expect(wrapper.createBookList).toBeDefined()
      expect(wrapper.updateBookList).toBeDefined()
      expect(wrapper.deleteBookList).toBeDefined()
      expect(wrapper.getReviews).toBeDefined()
      expect(wrapper.createReview).toBeDefined()
      expect(wrapper.getFollowers).toBeDefined()
      expect(wrapper.followUser).toBeDefined()
      expect(wrapper.getFollowing).toBeDefined()
      expect(wrapper.getConversations).toBeDefined()
      expect(wrapper.sendMessage).toBeDefined()
    })
  })

  describe('API调用测试', () => {
    it('应该能调用getBookLists', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getBookLists({ page: 1, size: 20 })

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用createBookList', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const bookListData = {
        name: '我的书单',
        description: '这是一个测试书单',
        isPublic: true,
      }

      await wrapper.createBookList(bookListData as any)

      expect(orvalMutator).toHaveBeenCalled()
    })

    it('应该能调用getReviews', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getReviews({ book_id: 'book-123' } as any)

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用followUser', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      await wrapper.followUser('user-123' as any)

      expect(orvalMutator).toHaveBeenCalled()
    })
  })

  describe('兼容性测试', () => {
    it('应该导出getApi函数', async () => {
      const wrapper = await import('../wrapper')
      expect(wrapper.getApi).toBeDefined()
      expect(typeof wrapper.getApi).toBe('function')
    })
  })
})
