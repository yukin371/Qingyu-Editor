// ==========================================
// Banner (轮播图)
// ==========================================

import type { ID, ISODate, BaseFilter } from './core'

export interface Banner {
  id: ID
  title: string
  description: string
  image: string
  target: string
  targetType: 'book' | 'category' | 'url'
  sortOrder: number
  isActive: boolean
  startTime?: ISODate
  endTime?: ISODate
  clickCount: number
  createdAt: ISODate
  updatedAt: ISODate
}

export interface BannerFilter extends BaseFilter {
  isActive?: boolean
  targetType?: string
}
