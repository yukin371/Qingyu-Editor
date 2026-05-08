/**
 * Bookstore Store (refactored with service layer)
 */

import { defineStore } from 'pinia'
import { bookstoreService } from '../services/bookstore.service'
import { searchService } from '../services/search.service'
import type {
  Book,
  BookBrief,
  Banner,
  RankingItem,
  Category,
  HomepageData,
  SearchFilter
} from '../types/bookstore.types'

export interface BookstoreState {
  homepageData: HomepageData | null
  loading: boolean
  rankingsLoading: boolean
  error: string | null
  rankings: {
    realtime: RankingItem[]
    weekly: RankingItem[]
    monthly: RankingItem[]
    newbie: RankingItem[]
  }
  banners: Banner[]
  books: {
    recommended: BookBrief[]
    featured: BookBrief[]
    searchResults: BookBrief[]
    categoryBooks: Record<string, BookBrief[]>
  }
  categories: Category[]
  searchKeyword: string
  searchFilters: Partial<SearchFilter>
  searchLoading: boolean
  searchHistory: string[]
  currentBook: Book | null
  bookLoading: boolean
}

export const useBookstoreStore = defineStore('bookstore', {
  state: (): BookstoreState => ({
    homepageData: null,
    loading: false,
    rankingsLoading: false,
    error: null,
    rankings: {
      realtime: [],
      weekly: [],
      monthly: [],
      newbie: []
    },
    banners: [],
    books: {
      recommended: [],
      featured: [],
      searchResults: [],
      categoryBooks: {}
    },
    categories: [],
    searchKeyword: '',
    searchFilters: {},
    searchLoading: false,
    searchHistory: [],
    currentBook: null,
    bookLoading: false
  }),

  getters: {
    getCategoryBooks: (state) => (categoryId: string): BookBrief[] => {
      return state.books.categoryBooks[categoryId] || []
    },

    hasSearchResults: (state): boolean => {
      return state.books.searchResults.length > 0
    },

    searchResultsCount: (state): number => {
      return state.books.searchResults.length
    }
  },

  actions: {
    /**
     * Fetch homepage data using service
     */
    async fetchHomepageData(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const data = await bookstoreService.getHomepageData()

        // 数据安全性检查
        if (!data || typeof data !== 'object') {
          console.warn('首页数据为空或格式不正确')
          return
        }

        this.homepageData = data

        // Update state with safe access — 只用非空数组覆盖已有 rankings
        if (data.rankings && typeof data.rankings === 'object') {
          const mergeRanking = (key: keyof typeof this.rankings) => {
            const incoming = data.rankings[key]
            if (Array.isArray(incoming) && incoming.length > 0) {
              this.rankings[key] = incoming
            }
          }
          mergeRanking('realtime')
          mergeRanking('weekly')
          mergeRanking('monthly')
          mergeRanking('newbie')
        }
        if (data.banners && Array.isArray(data.banners)) {
          this.banners = data.banners
        }
        if (data.recommendedBooks && Array.isArray(data.recommendedBooks)) {
          this.books.recommended = data.recommendedBooks
        }
        if (data.featuredBooks && Array.isArray(data.featuredBooks)) {
          this.books.featured = data.featuredBooks
        }
        if (data.categories && Array.isArray(data.categories)) {
          this.categories = data.categories
        }
      } catch (error: any) {
        console.error('获取首页数据失败:', error)
        this.error = '获取首页数据失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch rankings
     */
    async fetchRankings(type?: 'realtime' | 'weekly' | 'monthly' | 'newbie'): Promise<void> {
      this.rankingsLoading = true
      this.error = null

      try {
        const normalizeRankingList = (raw: any): RankingItem[] => {
          if (Array.isArray(raw)) return raw as RankingItem[]
          if (Array.isArray(raw?.list)) return raw.list as RankingItem[]
          if (Array.isArray(raw?.data?.list)) return raw.data.list as RankingItem[]
          if (Array.isArray(raw?.data)) return raw.data as RankingItem[]
          return []
        }

        if (type) {
          const data = await bookstoreService.getRanking(type) as any
          this.rankings[type] = normalizeRankingList(data)
        } else {
          const data = await bookstoreService.getAllRankings() as any
          this.rankings = {
            realtime: normalizeRankingList(data.realtime),
            weekly: normalizeRankingList(data.weekly),
            monthly: normalizeRankingList(data.monthly),
            newbie: normalizeRankingList(data.newbie)
          }
        }
      } catch (error: any) {
        console.error('获取排行榜失败:', error)
        this.error = '获取排行榜失败'
        // 确保出错时也有默认空数组
        if (type) {
          this.rankings[type] = this.rankings[type] || []
        }
      } finally {
        this.rankingsLoading = false
      }
    },

    /**
     * Fetch book detail
     */
    async fetchBookDetail(bookId: string): Promise<void> {
      this.bookLoading = true
      this.error = null

      try {
        this.currentBook = await bookstoreService.getBookDetail(bookId)
      } catch (error: any) {
        console.error('获取书籍详情失败:', error)
        this.error = '获取书籍详情失败'
      } finally {
        this.bookLoading = false
      }
    },

    /**
     * Search books
     */
    async searchBooks(keyword: string, filters: Partial<SearchFilter> = {}): Promise<void> {
      const validation = searchService.validateKeyword(keyword)
      if (!validation.valid) {
        this.error = validation.message || '搜索关键词无效'
        return
      }

      this.searchLoading = true
      this.searchKeyword = keyword
      this.searchFilters = filters

      try {
        const params = searchService.buildSearchParams(keyword, filters)
        const result = await bookstoreService.searchBooks(params)
        this.books.searchResults = result.books

        // Add to history
        searchService.addToHistory(keyword)
        this.searchHistory = searchService.getSearchHistory()
      } catch (error: any) {
        console.error('搜索书籍失败:', error)
        this.books.searchResults = []
        this.error = '搜索失败'
      } finally {
        this.searchLoading = false
      }
    },

    /**
     * Load search history
     */
    loadSearchHistory(): void {
      this.searchHistory = searchService.getSearchHistory()
    },

    /**
     * Clear search history
     */
    clearSearchHistory(): void {
      searchService.clearHistory()
      this.searchHistory = []
    },

    /**
     * Clear search results
     */
    clearSearchResults(): void {
      this.books.searchResults = []
      this.searchKeyword = ''
      this.searchFilters = {}
    },

    /**
     * Fetch recommended books
     */
    async fetchRecommendedBooks(page: number = 1, size: number = 20): Promise<{
      items: BookBrief[]
      total: number
      hasMore: boolean
    }> {
      try {
        const result = await bookstoreService.getRecommendedBooks(page, size) as any

        let items: BookBrief[] = []
        let total = 0
        let hasMore = false

        if (Array.isArray(result)) {
          items = result
          total = page * size + (items.length === size ? 1 : 0)
          hasMore = items.length === size
        } else if (result && typeof result === 'object') {
          if (Array.isArray(result.data?.list)) {
            items = result.data.list
          } else if (Array.isArray(result.data?.books)) {
            items = result.data.books
          } else if (Array.isArray(result.data)) {
            items = result.data
          } else if (Array.isArray(result.list)) {
            items = result.list
          } else if (Array.isArray(result.books)) {
            items = result.books
          }

          total = Number(result.pagination?.total ?? result.data?.pagination?.total ?? result.total ?? items.length)
          hasMore = Boolean(result.pagination?.has_next ?? result.data?.pagination?.has_next ?? (items.length === size))
        }

        this.books.recommended = items
        return { items, total, hasMore }
      } catch (error: any) {
        console.error('获取推荐书籍失败:', error)
        this.books.recommended = []
        this.error = '获取推荐书籍失败'
        return { items: [], total: 0, hasMore: false }
      }
    },

    /**
     * Fetch featured books
     */
    async fetchFeaturedBooks(page: number = 1, size: number = 20): Promise<void> {
      try {
        const result = await bookstoreService.getFeaturedBooks(page, size)
        // 验证返回数据
        if (result && Array.isArray(result)) {
          this.books.featured = result
        } else {
          console.warn('精选书籍数据格式不正确:', result)
          this.books.featured = []
        }
      } catch (error: any) {
        console.error('获取精选书籍失败:', error)
        this.books.featured = []
        this.error = '获取精选书籍失败'
      }
    },

    /**
     * Fetch categories
     */
    async fetchCategories(): Promise<void> {
      try {
        this.categories = await bookstoreService.getCategories()
      } catch (error) {
        console.error('获取分类失败:', error)
      }
    },

    /**
     * Handle banner click
     */
    async handleBannerClick(bannerId: string): Promise<void> {
      await bookstoreService.handleBannerClick(bannerId)
    },

    /**
     * Increment book view count
     */
    async incrementBookView(bookId: string): Promise<void> {
      try {
        await bookstoreService.incrementBookView(bookId)
      } catch (error) {
        console.error('更新浏览量失败:', error)
      }
    },

    /**
     * Clear error
     */
    clearError(): void {
      this.error = null
    },

    /**
     * Reset state
     */
    resetState(): void {
      this.$reset()
    }
  }
})

export default useBookstoreStore
