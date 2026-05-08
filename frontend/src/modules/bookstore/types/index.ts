// ==========================================
// 书店模块类型统一导出
// ==========================================

// 通用基础类型
export * from './core'

// API响应类型
export * from './api'

// Banner (轮播图)
export * from './banner'

// Book Core (书籍核心)
export * from './book'

// Book Detail (书籍详情)
export * from './bookDetail'

// Book Interaction (评分与统计)
export * from './bookInteraction'

// Category (分类)
export * from './category'

// Chapter (章节)
export * from './chapter'

// Ranking (榜单)
export * from './ranking'

// Bookstore综合类型（包含BookBrief, HomepageData等）
// 注意：选择性导出以避免与上面的类型冲突
export type {
  BookBrief,
  HomepageData,
  SearchFilter,
  SearchParams,
  SearchResult
} from './bookstore.types'

// Search (搜索相关类型)
export * from './search.types'
