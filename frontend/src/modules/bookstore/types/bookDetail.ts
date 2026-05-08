// ==========================================
// Book Detail (书籍详情)
// ==========================================

import type { ID, ISODate } from './core'
import type { BookStatus } from './book'

// 对应 Go 中的 BookDetail 结构体
// 注意：此处 JSON tag 为 snake_case，与列表 Book 结构不同
// 价格字段单位：分 (需要除以100转换为元显示)
export interface BookDetail {
  id?: ID
  title: string
  subtitle: string
  author: string
  author_id: ID
  authorId?: ID // camelCase 别名
  description: string
  introduction: string
  cover_url: string // 注意与 Book 中的 cover 区分
  cover?: string // camelCase 别名

  // 网络小说特有字段
  serialized_at: ISODate
  publishedAt?: ISODate
  publishTime?: ISODate
  completed_at?: ISODate

  categories: string[]
  category_ids: ID[] // 注意与 Book 中的 categoryIds 区分
  categoryId?: ID // 单分类兼容别名
  categoryIds?: ID[] // camelCase 别名
  tags: string[]
  status: BookStatus
  word_count: number
  wordCount?: number // camelCase 别名
  chapter_count: number
  chapterCount?: number // camelCase 别名
  price: number // 单位：分
  is_free: boolean
  isFree?: boolean // camelCase 别名

  // 统计数据
  view_count: number
  viewCount?: number // camelCase 别名
  like_count: number
  likeCount?: number // camelCase 别名
  comment_count: number
  commentCount?: number // camelCase 别名
  share_count: number
  shareCount?: number // camelCase 别名
  collect_count: number
  collectCount?: number // camelCase 别名
  rating: number
  rating_count: number
  ratingCount?: number // camelCase 别名

  // 最新章节信息
  last_chapter_title: string
  lastChapterTitle?: string // camelCase 别名
  last_chapter_at: ISODate
  lastChapterAt?: ISODate // camelCase 别名

  created_at: ISODate
  createdAt?: ISODate // camelCase 别名
  updated_at: ISODate
  updatedAt?: ISODate // camelCase 别名
}
