/**
 * Bookstore API Wrapper 测试
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

describe('Bookstore API Wrapper', () => {
  describe('导入测试', () => {
    it('应该能够导入wrapper', async () => {
      const wrapper = await import('../wrapper')
      expect(wrapper).toBeDefined()
    })

    it('应该导出核心API方法', async () => {
      const wrapper = await import('../wrapper')

      // 检查核心方法是否存在
      expect(wrapper.getBookList).toBeDefined()
      expect(wrapper.getBookDetail).toBeDefined()
      expect(wrapper.getBanners).toBeDefined()
      expect(wrapper.getHomepage).toBeDefined()
    })
  })

  describe('Banners API测试', () => {
    it('应该能调用getBanners', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      await wrapper.getBanners()

      expect(orvalMutator).toHaveBeenCalled()
    })

    it('应该能调用incrementBannerClick', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.incrementBannerClick('banner-123')

      expect(wrapper.incrementBannerClick).toBeDefined()
    })
  })

  describe('Books API测试', () => {
    it('应该能调用getBookList', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getBookList({ page: 1, size: 20 })

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用getBookDetail', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getBookDetail('book-123')

      expect(wrapper.getBookDetail).toBeDefined()
    })

    it('应该能调用searchBooks', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.searchBooks({ keyword: 'test' })

      expect(wrapper.searchBooks).toBeDefined()
    })

    it('应该能调用getBooksByStatus', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getBooksByStatus({ status: 'published' })

      expect((wrapper as any).getBooksByStatus).toBeDefined()
    })

    it('应该能调用getBooksByTags', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getBooksByTags({ tags: '玄幻,修真' })

      expect((wrapper as any).getBooksByTags).toBeDefined()
    })

    it('应该能调用getRecommendedBooks', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getRecommendedBooks(1, 10)

      expect((wrapper as any).getRecommendedBooks).toBeDefined()
    })

    it('应该能调用getFeaturedBooks', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getFeaturedBooks(1, 10)

      expect((wrapper as any).getFeaturedBooks).toBeDefined()
    })

    it('应该能调用getPopularBooks', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getPopularBooks(1, 10)

      expect((wrapper as any).getPopularBooks).toBeDefined()
    })

    it('应该能调用getLatestBooks', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getLatestBooks(1, 10)

      expect((wrapper as any).getLatestBooks).toBeDefined()
    })

    it('应该能调用getSimilarBooks', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getSimilarBooks('book-123')

      expect(wrapper.getSimilarBooks).toBeDefined()
    })

    it('应该能调用incrementBookView', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.incrementBookView('book-123')

      expect(wrapper.incrementBookView).toBeDefined()
    })

    it('应该能调用getBookStatistics', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getBookStatistics('book-123')

      expect(wrapper.getBookStatistics).toBeDefined()
    })

    it('应该能调用likeBook', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.likeBook('book-123')

      expect(wrapper.likeBook).toBeDefined()
    })

    it('应该能调用unlikeBook', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.unlikeBook('book-123')

      expect(wrapper.unlikeBook).toBeDefined()
    })
  })

  describe('Categories API测试', () => {
    it('应该能调用getAllCategories', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getAllCategories()

      expect(wrapper.getAllCategories).toBeDefined()
    })

    it('应该能调用getCategoryTree', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getCategoryTree()

      expect(wrapper.getCategoryTree).toBeDefined()
    })

    it('应该能调用getCategoryDetail', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getCategoryDetail('category-123')

      expect(wrapper.getCategoryDetail).toBeDefined()
    })

    it('应该能调用getBooksByCategoryWithPagination', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getBooksByCategoryWithPagination('category-123', { page: 1, size: 20 })

      expect(wrapper.getBooksByCategoryWithPagination).toBeDefined()
    })
  })

  describe('Chapters API测试', () => {
    it('应该能调用getChapterDetail', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getChapterDetail('chapter-123')

      expect(wrapper.getChapterDetail).toBeDefined()
    })

    it('应该能调用getChapterContent', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getChapterContent('chapter-123')

      expect(wrapper.getChapterContent).toBeDefined()
    })

    it('应该能调用getNextChapter', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getNextChapter('chapter-123')

      expect(wrapper.getNextChapter).toBeDefined()
    })

    it('应该能调用getPreviousChapter', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getPreviousChapter('chapter-123')

      expect(wrapper.getPreviousChapter).toBeDefined()
    })

    it('应该能调用getChapterPrice', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getChapterPrice('chapter-123')

      expect(wrapper.getChapterPrice).toBeDefined()
    })

    it('应该能调用searchChapters', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.searchChapters({ keyword: 'test' })

      expect(wrapper.searchChapters).toBeDefined()
    })
  })

  describe('Homepage API测试', () => {
    it('应该能调用getHomepage', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      await wrapper.getHomepage()

      expect(orvalMutator).toHaveBeenCalled()
      expect(wrapper.getHomepage).toBeDefined()
    })
  })

  describe('Rankings API测试', () => {
    it('应该能调用getRealtimeRanking', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getRealtimeRanking(1, 20)

      expect((wrapper as any).getRealtimeRanking).toBeDefined()
    })

    it('应该能调用getWeeklyRanking', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getWeeklyRanking(1, 20)

      expect((wrapper as any).getWeeklyRanking).toBeDefined()
    })

    it('应该能调用getMonthlyRanking', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getMonthlyRanking(1, 20)

      expect((wrapper as any).getMonthlyRanking).toBeDefined()
    })

    it('应该能调用getNewbieRanking', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getNewbieRanking(1, 20)

      expect((wrapper as any).getNewbieRanking).toBeDefined()
    })

    it('应该能调用getRankingByType', async () => {
      const wrapper = await import('../wrapper')

      await (wrapper as any).getRankingByType('realtime', 1, 20)

      expect((wrapper as any).getRankingByType).toBeDefined()
    })
  })

  describe('其他便捷方法测试', () => {
    it('应该能调用getBookChapters', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getBookChapters('book-123')

      expect(wrapper.getBookChapters).toBeDefined()
    })

    it('应该能调用getBookFirstChapter', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getBookFirstChapter('book-123')

      expect(wrapper.getBookFirstChapter).toBeDefined()
    })

    it('应该能调用getBookLastChapter', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.getBookLastChapter('book-123')

      expect(wrapper.getBookLastChapter).toBeDefined()
    })

    it('应该能调用createBook', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.createBook({
        title: 'Test Book',
        author: 'Test Author',
      } as any)

      expect(wrapper.createBook).toBeDefined()
    })

    it('应该能调用updateBook', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.updateBook('book-123', {
        title: 'Updated Book',
      } as any)

      expect(wrapper.updateBook).toBeDefined()
    })

    it('应该能调用deleteBook', async () => {
      const wrapper = await import('../wrapper')

      await wrapper.deleteBook('book-123')

      expect(wrapper.deleteBook).toBeDefined()
    })
  })
})
