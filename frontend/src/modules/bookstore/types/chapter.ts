// ==========================================
// Chapter (章节)
// ==========================================

import type { ID, ISODate } from './core'

// 注意：JSON tag 为 snake_case
// 价格字段单位：分 (需要除以100转换为元显示)
export interface Chapter {
  id: ID
  book_id: ID
  title: string
  chapter_num: number
  content: string // 列表接口通常不返回此字段，详情接口返回
  word_count: number
  is_free: boolean
  price: number // 单位：分
  publish_time: ISODate
  created_at: ISODate
  updated_at: ISODate
}
