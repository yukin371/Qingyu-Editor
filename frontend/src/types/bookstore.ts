/**
 * 书城系统类型定义 (v1.3)
 * 基于 doc/api/frontend/书城API参考.md
 */

// ==================== 书籍相关 ====================

/**
 * 书籍状态
 */
export type BookStatus = 'ongoing' | 'completed' | 'paused' | 'serializing'

/**
 * 书籍完整信息
 */
export interface Book {
  id: string
  title: string
  author: string
  authorId?: string
  cover: string
  description: string
  categoryId?: string
  categoryIds?: string[]
  categoryName?: string
  category?: string
  tags?: string[]
  status: BookStatus
  wordCount: number
  chapterCount: number
  rating: number
  ratingCount?: number
  viewCount: number
  favoriteCount: number
  isVip?: boolean
  isFree?: boolean
  price?: number
  publishTime?: string
  publishedAt?: string
  updateTime?: string
  updatedAt?: string
  latestChapter?: {
    id: string
    title: string
    updateTime?: string
    updatedAt?: string
  }
}

/**
 * 书籍简要信息（列表用）
 */
export interface BookBrief {
  id: string
  title: string
  author: string
  cover: string
  categoryName: string
  tags?: string[]
  rating: number
  wordCount: number
  viewCount: number
  status: BookStatus
  latestChapter?: string
  description?: string
}

/**
 * 书籍详细信息（别名）
 */
export type BookDetail = Book

/**
 * 首页数据
 */
export interface HomepageData {
  banners: Banner[]
  recommendations?: BookBrief[]
  newBooks?: BookBrief[]
  hotBooks?: BookBrief[]
  completedBooks?: BookBrief[]
  recommendedBooks: BookBrief[]
  featuredBooks: BookBrief[]
  categories: Category[]
  rankings?: {
    realtime: RankingItem[]
    weekly: RankingItem[]
    monthly: RankingItem[]
  }
}

// ==================== 分类相关 ====================

/**
 * 分类信息
 */
export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  bookCount: number
  count?: number
  parentId?: string | null
  children?: Category[]
  sort?: number
  level?: number
}

/**
 * 分类树节点
 */
export interface CategoryTreeNode {
  id: string
  name: string
  parentId: string | null
  children: CategoryTreeNode[]
  bookCount: number
}

/**
 * 标签信息
 */
export interface Tag {
  id: string
  name: string
  count?: number
  description?: string
}

// ==================== Banner相关 ====================

/**
 * Banner信息
 */
export interface Banner {
  id: string
  title: string
  image: string
  link: string
  sort: number
  startTime?: string
  endTime?: string
  clickCount?: number
}

// ==================== 榜单相关 ====================

/**
 * 榜单类型
 */
export type RankingType = 'realtime' | 'weekly' | 'monthly' | 'newbie'

/**
 * 榜单项
 */
export interface RankingItem {
  rank: number
  bookId: string
  book: BookBrief
  score: number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
}

// ==================== 搜索相关 ====================

/**
 * 搜索参数
 */
export interface SearchParams {
  keyword?: string
  author?: string
  categoryId?: string
  categoryIds?: string[]
  tags?: string[]
  status?: BookStatus
  wordCountMin?: number
  wordCountMax?: number
  ratingMin?: number
  sortBy?: 'updateTime' | 'rating' | 'viewCount' | 'wordCount' | 'relevance'
  sortOrder?: 'asc' | 'desc'
  page?: number
  page_size?: number
  size?: number // 页面大小别名
}

/**
 * 搜索过滤条件
 */
export interface SearchFilter {
  keyword?: string
  categoryId?: string
  tags?: string[]
  status?: BookStatus
  wordCountMin?: number
  wordCountMax?: number
  ratingMin?: number
  sortBy?: 'updateTime' | 'rating' | 'viewCount' | 'wordCount' | 'relevance'
  sortOrder?: 'asc' | 'desc'
  page?: number
  size?: number
}

/**
 * 搜索结果
 */
export interface SearchResult {
  books: BookBrief[]
  total: number
  page: number
  size: number
  hasMore: boolean
}

// ==================== 推荐相关 ====================

/**
 * 推荐书籍
 */
export interface RecommendedBook {
  book: BookBrief
  reason: string
  score: number
}
