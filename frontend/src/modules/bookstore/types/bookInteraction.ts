// ==========================================
// Book Interaction (评分与统计)
// ==========================================

import type { ID, ISODate } from './core'

export interface BookRating {
  id: ID
  book_id: ID
  user_id: ID
  rating: number // 1-5
  comment: string
  tags: string[]
  likes: number
  created_at: ISODate
  updated_at: ISODate
}

export interface BookStatistics {
  id: ID
  book_id: ID
  view_count: number
  favorite_count: number
  comment_count: number
  share_count: number
  average_rating: number
  rating_count: number
  // Go map[int]int64 对应 TS 的 Record 或索引类型
  rating_distribution: Record<number, number>
  hot_score: number
  updated_at: ISODate
}
