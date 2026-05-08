/**
 * Admin API 共享类型和工具函数
 */

import { getApi } from './generated/admin'
import type { APIResponse } from '@/types/api'
import { httpService } from '@/core/services/http.service'
import type { Announcement, Banner } from '@/modules/admin/types/admin.types'

// 获取生成的API对象
export const api = getApi()

// ==================== 通用类型 ====================

export type AdminListResult<T> = {
  items: T[]
  total: number
}

export type AdminCategory = {
  id: string
  name: string
  description?: string
  icon?: string
  parentId?: string
  level: number
  sortOrder: number
  bookCount: number
  isActive: boolean
  children?: AdminCategory[]
}

export type AdminWithdrawalItem = {
  id: string
  user_id: string
  username?: string
  email?: string
  display_name?: string
  source: 'wallet' | 'author' | string
  status: string
  amount: number
  fee: number
  actual_amount: number
  method?: string
  account?: string
  account_type?: string
  account_name?: string
  bank_name?: string
  order_no?: string
  reviewed_by?: string
  reviewed_at?: string
  reject_reason?: string
  processed_at?: string
  transaction_id?: string
  created_at: string
  updated_at: string
}

export type AdminWithdrawalStats = {
  total_count: number
  pending_count: number
  approved_count: number
  rejected_count: number
  approved_today_count: number
  pending_amount: number
  approved_amount: number
}

// ==================== 工具函数 ====================

export function unwrapPayload<T>(response: unknown): T {
  const maybeWrapped = response as { data?: T }
  return (maybeWrapped?.data ?? response) as T
}

export function normalizeAnnouncement(item: Record<string, any>): Announcement {
  return {
    id: item.id || item._id || '',
    title: item.title || '',
    content: item.content || '',
    type: item.type || 'system',
    priority: item.priority || 'medium',
    status: item.status || (item.isActive ? 'active' : 'inactive'),
    effectiveStartTime: item.effectiveStartTime || item.startTime || '',
    effectiveEndTime: item.effectiveEndTime || item.endTime || '',
    targetUsers: item.targetUsers || (item.targetRole ? [item.targetRole] : undefined),
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt,
    isActive: item.isActive ?? item.status === 'active',
    startTime: item.startTime || item.effectiveStartTime,
    endTime: item.endTime || item.effectiveEndTime,
  }
}

export function normalizeBanner(item: Record<string, any>): Banner {
  return {
    id: item.id || item._id || '',
    title: item.title || '',
    imageUrl: item.imageUrl || item.image || '',
    link: item.link || item.target,
    position: item.position || item.targetType || 'home',
    sortOrder: item.sortOrder ?? 0,
    status: item.status || (item.isActive ? 'active' : 'inactive'),
    startTime: item.startTime,
    endTime: item.endTime,
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt,
    isActive: item.isActive ?? item.status === 'active',
    description: item.description,
    image: item.image || item.imageUrl,
    target: item.target || item.link,
    targetType: item.targetType || item.position,
  }
}

export function normalizeCategory(item: Record<string, any>): AdminCategory {
  const rawChildren = Array.isArray(item.children) ? item.children : []
  return {
    id: item.id || item._id || '',
    name: item.name || '',
    description: item.description || '',
    icon: item.icon || '',
    parentId: item.parentId || item.parent_id,
    level: Number(item.level ?? 0),
    sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0),
    bookCount: Number(item.bookCount ?? item.book_count ?? 0),
    isActive: item.isActive ?? item.is_active ?? true,
    children: rawChildren.map((child: Record<string, any>) => normalizeCategory(child)),
  }
}

// 重新导出类型和 API
export type { APIResponse }
export { getApi, httpService }
