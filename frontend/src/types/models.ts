/**
 * 青羽阅读平台 - 核心数据模型类型定义
 */

// ==================== 书籍相关 ====================

/** 书籍状态 */
export type BookStatus = 'ongoing' | 'completed' | 'paused' | 'serializing'

/** 书籍信息 */
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
  latestChapter?:
    | {
        id: string
        title: string
        updateTime?: string
        updatedAt?: string
      }
    | string
}

/** 书籍简要信息（列表用） */
export interface BookBrief {
  id: string
  title: string
  author: string
  cover: string
  categoryName?: string
  category?: string
  tags?: string[]
  rating: number
  ratingCount?: number
  wordCount: number
  viewCount: number
  status: BookStatus
  latestChapter?: string
}

// ==================== 章节相关 ====================

/** 章节信息 */
export interface Chapter {
  id: string
  bookId: string
  title: string
  chapterNum: number
  wordCount: number
  isFree: boolean
  price: number
  publishTime?: string
  publishedAt?: string
  updateTime?: string
  updatedAt?: string
  locked?: boolean
  prevChapterId: string | null
  nextChapterId: string | null
}

/** 章节内容 */
export interface ChapterContent {
  id: string
  bookId: string
  title: string
  content: string
  chapterNum: number
  wordCount: number
  publishTime?: string
  publishedAt?: string
  prevChapterId: string | null
  nextChapterId: string | null
}

/** 章节列表项 */
export interface ChapterListItem {
  id: string
  title: string
  chapterNum: number
  wordCount: number
  isFree: boolean
  price: number
  isRead?: boolean
  publishTime?: string
  publishedAt?: string
}

// ==================== 分类相关 ====================

/** 分类信息 */
export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  bookCount: number
  count?: number // 用于筛选面板的书籍数量显示
  parentId?: string
  children?: Category[]
  sort?: number
}

/** 标签信息 */
export interface Tag {
  id: string
  name: string
  count?: number // 使用该标签的书籍数量
  description?: string
}

// ==================== 用户相关 ====================

/** 用户角色 */
export type UserRole = 'reader' | 'author' | 'admin'

/** 用户性别 */
export type UserGender = 'male' | 'female' | 'unknown'

/** 用户信息 */
export interface User {
  id: string
  username: string
  nickname: string
  email: string
  phone?: string
  avatar: string
  gender: UserGender
  birthday?: string
  bio?: string
  role: UserRole
  level: number
  exp: number
  balance: number
  readingTime: number
  registerTime: string
  lastLoginTime: string
  isVip: boolean
  vipExpireTime?: string
  emailVerified?: boolean
  roles?: string[]
  permissions?: string[]
}

/** 用户简要信息 */
export interface UserBrief {
  id: string
  username: string
  nickname: string
  avatar: string
  level: number
}

// ==================== 阅读进度相关 ====================

/** 阅读进度 */
export interface ReadingProgress {
  id: string
  userId: string
  bookId: string
  chapterId: string
  chapterTitle: string
  progress: number // 0-100
  scrollPosition: number
  updateTime?: string
  updatedAt?: string
}

/** 阅读历史 */
export interface ReadingHistory {
  id: string
  bookId: string
  book: BookBrief
  chapterId: string
  chapterTitle: string
  readTime: string
  duration: number
  bookCover?: string
  bookTitle?: string
  progress?: number
  readAt?: string
}

// ==================== 阅读设置相关 ====================

/** 阅读主题 */
export type ReadingTheme = 'light' | 'dark' | 'sepia' | 'night' | 'eye-care' | 'parchment'

/** 阅读设置 */
export interface ReadingSettings {
  theme: ReadingTheme
  fontFamily: string
  fontSize: number // 12-32
  lineHeight: number // 1.2-2.5
  pageWidth: number // 60-100 (percent)
  pageMode: 'scroll' | 'click' | 'slide'
  autoRead: boolean
  autoReadSpeed: number // 1-10
  enableConvert: boolean
  eyeCare: boolean
  keepScreenOn: boolean
  autoSave?: boolean
}

// ==================== 书架相关 ====================

/** 书架书籍 */
export interface ShelfBook {
  id: string
  userId: string
  bookId: string
  book: BookBrief
  lastReadChapterId?: string
  lastReadChapterTitle?: string
  progress: number
  addTime: string
  updateTime: string
}

/** 书签 */
export interface Bookmark {
  id: string
  userId: string
  bookId: string
  chapterId: string
  chapterTitle: string
  content: string
  note?: string
  position: number
  createdAt: string
  updatedAt?: string
  bookTitle?: string
  bookCover?: string
  progress?: number
}

// ==================== 榜单相关 ====================

/** 榜单类型 */
export type RankingType = 'realtime' | 'weekly' | 'monthly' | 'new'

/** 榜单项 */
export interface RankingItem {
  rank: number
  bookId: string
  book: BookBrief
  score: number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
}

// ==================== 搜索相关 ====================

/** 搜索过滤条件 */
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

/** 搜索结果 */
export interface SearchResult {
  books: BookBrief[]
  total: number
  page: number
  size: number
  hasMore: boolean
}

// ==================== 评分评论相关 ====================

/** 评分 */
export interface Rating {
  id: string
  userId: string
  user: UserBrief
  bookId: string
  score: number // 1-5
  content?: string
  createTime: string
  updateTime: string
  likeCount: number
  isLiked?: boolean
}

// ==================== Banner相关 ====================

/** Banner信息 */
export interface Banner {
  id: string
  title: string
  image: string
  link: string
  sort: number
  startTime?: string
  endTime?: string
}

// ==================== 推荐相关 ====================

/** 推荐书籍 */
export interface RecommendedBook {
  book: BookBrief
  reason: string
  score: number
}

// ==================== 统计相关 ====================

/** 阅读统计 */
export interface ReadingStats {
  totalReadingTime: number
  totalBooks: number
  totalChapters: number
  averageReadingTime: number
  favoriteCategory: string
  recentBooks: BookBrief[]
}

// ==================== 首页数据 ====================

/** 首页数据 */
export interface HomepageData {
  banners: Banner[]
  recommendedBooks: BookBrief[]
  featuredBooks: BookBrief[]
  categories: Category[]
  rankings?: {
    realtime: RankingItem[]
    weekly: RankingItem[]
    monthly: RankingItem[]
  }
}
