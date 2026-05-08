/**
 * Admin category.api - 分类管理相关 API
 */

import { httpService, normalizeCategory } from './shared'
import type { APIResponse } from '@/types/api'
import type { AdminCategory } from './shared'

/**
 * 获取分类树
 */
export async function getCategoryTree(): Promise<AdminCategory[]> {
  const response = await httpService.get<Record<string, any>[] | { items?: Record<string, any>[] }>(
    '/admin/categories/tree',
  )
  const rawItems = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
      ? response.items
      : []
  return rawItems.map((item) => normalizeCategory(item))
}

/**
 * 创建分类
 */
export async function createCategory(data: {
  name: string
  description?: string
  icon?: string
  parent_id?: string
  sort_order?: number
}): Promise<APIResponse<any>> {
  return httpService.post('/admin/categories', data) as any
}

/**
 * 更新分类
 */
export async function updateCategory(
  id: string,
  data: {
    name?: string
    description?: string
    icon?: string
    sort_order?: number
  },
): Promise<APIResponse<any>> {
  return httpService.put(`/admin/categories/${id}`, data) as any
}

/**
 * 删除分类
 */
export async function deleteCategory(id: string): Promise<APIResponse<void>> {
  return httpService.delete(`/admin/categories/${id}`) as any
}
