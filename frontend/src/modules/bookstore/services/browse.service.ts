import { httpService } from '@/core/services/http.service'
import type { BookBrief } from '@/types/models'
import type { BrowseFilters } from '@/types/models/browse'
import { normalizeBookList } from '../utils/contract-normalizer'

interface GetBooksResponse {
  code: number
  message: string
  data: BookBrief[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  timestamp: number
  request_id?: string
}

export const browseService = {
  /**
   * 获取书籍列表
   */
  async getBooks(filters: BrowseFilters): Promise<GetBooksResponse> {
    const keyword = filters.q.trim()
    const isKeywordSearch = keyword.length > 0
    const params = isKeywordSearch
      ? {
          keyword,
          categoryId: filters.categoryId || undefined,
          status: filters.status || undefined,
          tags: filters.tags.length > 0 ? filters.tags : undefined,
          page: filters.page,
          size: filters.pageSize,
          sortBy: filters.sortBy,
        }
      : {
          q: undefined,
          keyword: undefined,
          categoryId: filters.categoryId || undefined,
          category: filters.categoryId || undefined,
          year: filters.year || undefined,
          status: filters.status || undefined,
          tags: filters.tags.length > 0 ? filters.tags : undefined,
          tagMode: filters.tagMode,
          page: filters.page,
          size: filters.pageSize,
          pageSize: filters.pageSize,
          sortBy: filters.sortBy,
        }

    // 移除undefined值
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    )

    const endpoint = isKeywordSearch ? '/bookstore/books/search' : '/bookstore/books'
    const response = (await httpService.get(endpoint, { params: cleanParams })) as GetBooksResponse

    if (Array.isArray((response as any)?.data)) {
      return {
        ...response,
        data: normalizeBookList((response as any).data) as BookBrief[],
      }
    }

    return response
  },

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(query: string) {
    return httpService.get('/bookstore/books/suggestions', { params: { q: query } })
  },

  /**
   * 获取标签列表
   */
  async getTags(categoryId?: string) {
    return httpService.get('/bookstore/tags', { params: { categoryId } })
  },

  /**
   * 获取分类列表
   */
  async getCategories() {
    return httpService.get('/bookstore/categories/tree')
  },

  /**
   * 获取年份列表
   */
  async getYears() {
    return httpService.get('/bookstore/books/years')
  },
}
