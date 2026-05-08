/**
 * Authors Result Store
 * 使用mock数据实现作者搜索功能
 */

import { defineStore } from 'pinia'
import type { AuthorCard } from '../types/search.types'

// Mock作者数据
const MOCK_AUTHORS: AuthorCard[] = [
  {
    id: 'author-1',
    name: '唐家三少',
    avatar: 'https://via.placeholder.com/80',
    bio: '起点白金作家，代表作《斗罗大陆》系列，玄幻小说领军人物',
    book_count: 15,
    total_words: 20000000,
    follower_count: 500000
  },
  {
    id: 'author-2',
    name: '我吃西红柿',
    avatar: 'https://via.placeholder.com/80',
    bio: '起点白金作家，代表作《盘龙》《星辰变》等',
    book_count: 12,
    total_words: 18000000,
    follower_count: 450000
  },
  {
    id: 'author-3',
    name: '天蚕土豆',
    avatar: 'https://via.placeholder.com/80',
    bio: '起点白金作家，代表作《斗破苍穹》《武动乾坤》',
    book_count: 10,
    total_words: 15000000,
    follower_count: 400000
  },
  {
    id: 'author-4',
    name: '辰东',
    avatar: 'https://via.placeholder.com/80',
    bio: '起点白金作家，代表作《完美世界》《遮天》',
    book_count: 8,
    total_words: 12000000,
    follower_count: 350000
  },
  {
    id: 'author-5',
    name: '猫腻',
    avatar: 'https://via.placeholder.com/80',
    bio: '起点白金作家，代表作《庆余年》《将夜》',
    book_count: 9,
    total_words: 13000000,
    follower_count: 380000
  }
]

export interface AuthorsResultState {
  authors: AuthorCard[]
  cursor: string
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export const useAuthorsResultStore = defineStore('authorsResult', {
  state: (): AuthorsResultState => ({
    authors: [],
    cursor: '',
    hasMore: true,
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * 获取作者数量
     */
    authorsCount: (state): number => {
      return state.authors.length
    },

    /**
     * 是否有搜索结果
     */
    hasResults: (state): boolean => {
      return state.authors.length > 0
    },

    /**
     * 是否正在加载
     */
    loading: (state): boolean => {
      return state.isLoading
    }
  },

  actions: {
    /**
     * 搜索作者（使用mock数据）
     */
    async search(keyword: string, _filters?: Record<string, unknown>): Promise<void> {
      // 重置状态
      this.authors = []
      this.cursor = ''
      this.hasMore = true
      this.error = null

      try {
        this.isLoading = true

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock搜索逻辑
        if (!keyword.trim()) {
          // 无关键词时返回空结果
          this.authors = []
          this.hasMore = false
          return
        }

        // 简单的字符串包含匹配
        const filtered = MOCK_AUTHORS.filter(author =>
          author.name.includes(keyword) || author.bio.includes(keyword)
        )

        this.authors = filtered.slice(0, 20) // 最多返回20条
        this.hasMore = false // Mock数据不支持分页

        console.log(`[AuthorsResultStore] Found ${filtered.length} authors for keyword: ${keyword}`)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '搜索失败'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 加载下一批数据（Mock数据不支持分页）
     */
    async loadNextBatch(): Promise<void> {
      // Mock数据不支持分页，直接返回
      this.hasMore = false
    },

    /**
     * 清空搜索结果
     */
    clearResults(): void {
      this.authors = []
      this.cursor = ''
      this.hasMore = true
      this.error = null
    },

    /**
     * 清空错误
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 重置状态
     */
    resetState(): void {
      this.$reset()
    }
  }
})

export default useAuthorsResultStore
