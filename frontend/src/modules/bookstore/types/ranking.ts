// ==========================================
// Ranking (榜单)
// ==========================================

import type { ID, ISODate } from './core'
import type { Book } from './book'

export enum RankingType {
  Realtime = 'realtime',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Newbie = 'newbie',
}

// 注意：JSON tag 混合了 snake_case 和 camelCase，需仔细对照 Go 结构体
export interface RankingItem {
  id: ID
  bookId: ID
  book?: Book // 查询时填充，可能为空
  type: RankingType
  rank: number
  score: number
  viewCount: number // json:"viewCount"
  likeCount: number // json:"likeCount"
  period: string // "2024-01-01" 或 "2024-W01"
  createdAt: ISODate
  updatedAt: ISODate
}

export interface RankingStats {
  type: RankingType
  period: string
  totalBooks: number
  totalViews: number
  totalLikes: number
  averageScore: number
  lastUpdatedAt: ISODate
}

export interface RankingResponse {
  type: RankingType
  period: string
  items: RankingItem[]
  stats?: RankingStats
  updatedAt: ISODate
}

export interface RankingFilter {
  type?: RankingType
  period?: string
  limit?: number
  offset?: number
  withBook?: boolean
}
