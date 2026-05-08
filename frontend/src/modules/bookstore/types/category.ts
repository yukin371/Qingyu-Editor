// ==========================================
// Category (分类)
// ==========================================

import type { ID, ISODate, BaseFilter } from './core'

export interface Category {
  id: ID
  name: string
  description: string
  icon: string
  parentId?: ID
  level: number
  sortOrder: number
  bookCount: number
  isActive: boolean
  createdAt: ISODate
  updatedAt: ISODate
}

// 包含子节点的分类树
export interface CategoryTree extends Category {
  children?: CategoryTree[]
}

export interface CategoryFilter extends BaseFilter {
  parentId?: ID
  level?: number
  isActive?: boolean
  keyword?: string
}
