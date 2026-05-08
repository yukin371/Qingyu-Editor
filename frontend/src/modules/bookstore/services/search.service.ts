/**
 * Search Service
 * Business logic for book search functionality
 */

import { storageService } from '@/core/services/storage.service'
import { STORAGE_KEYS } from '@/core/config/constants'
import type { SearchParams, SearchFilter } from '../types/bookstore.types'

const MAX_HISTORY_ITEMS = 10

class SearchService {
  /**
   * Get search history
   */
  getSearchHistory(): string[] {
    return storageService.get<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || []
  }

  /**
   * Add to search history
   */
  addToHistory(keyword: string): void {
    if (!keyword || keyword.trim().length < 2) {
      return
    }

    const history = this.getSearchHistory()

    // Remove duplicate if exists
    const filtered = history.filter(item => item !== keyword)

    // Add to front
    filtered.unshift(keyword)

    // Keep only max items
    const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS)

    storageService.set(STORAGE_KEYS.SEARCH_HISTORY, trimmed)
  }

  /**
   * Remove from search history
   */
  removeFromHistory(keyword: string): void {
    const history = this.getSearchHistory()
    const filtered = history.filter(item => item !== keyword)
    storageService.set(STORAGE_KEYS.SEARCH_HISTORY, filtered)
  }

  /**
   * Clear search history
   */
  clearHistory(): void {
    storageService.remove(STORAGE_KEYS.SEARCH_HISTORY)
  }

  /**
   * Build search params
   */
  buildSearchParams(
    keyword: string,
    filters?: Partial<SearchFilter>,
    page: number = 1,
    size: number = 20
  ): SearchParams {
    return {
      keyword: keyword.trim(),
      page,
      size,
      ...filters
    }
  }

  /**
   * Validate search keyword
   */
  validateKeyword(keyword: string): { valid: boolean; message?: string } {
    if (!keyword || keyword.trim().length === 0) {
      return { valid: false, message: '请输入搜索关键词' }
    }

    if (keyword.trim().length < 2) {
      return { valid: false, message: '搜索关键词至少2个字符' }
    }

    if (keyword.length > 50) {
      return { valid: false, message: '搜索关键词不能超过50个字符' }
    }

    return { valid: true }
  }

  /**
   * Get popular search keywords (mock data, should come from API)
   */
  getPopularKeywords(): string[] {
    // In real app, this would come from an API
    return [
      '玄幻小说',
      '都市小说',
      '武侠小说',
      '科幻小说',
      '言情小说'
    ]
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(keyword: string): Promise<string[]> {
    // In real app, this would call an API
    // For now, return filtered history
    if (!keyword || keyword.length < 2) {
      return []
    }

    const history = this.getSearchHistory()
    return history.filter(item =>
      item.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 5)
  }

  /**
   * Format search filters for display
   */
  formatFilters(filters: Partial<SearchFilter>): string {
    const parts: string[] = []

    if (filters.category) {
      parts.push(`分类: ${filters.category}`)
    }

    if (filters.status) {
      parts.push(`状态: ${filters.status}`)
    }

    if (filters.sort_by) {
      const sortLabels: Record<string, string> = {
        popularity: '热度',
        rating: '评分',
        update_time: '更新时间',
        word_count: '字数'
      }
      parts.push(`排序: ${sortLabels[filters.sort_by] || filters.sort_by}`)
    }

    return parts.join(', ')
  }
}

export const searchService = new SearchService()
export default searchService

