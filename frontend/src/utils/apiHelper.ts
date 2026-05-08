/**
 * API响应辅助工具
 * 帮助访问APIResponse中的数据
 */
import type { APIResponse } from '@/types/api'

/**
 * 获取分页响应的数据和总数
 */
export function getPaginatedData<T>(response: APIResponse<{ items: T[]; total: number }>) {
  return {
    items: response.data?.items || [],
    total: response.data?.total || 0
  }
}

/**
 * 获取响应数据
 */
export function getData<T>(response: APIResponse<T>) {
  return response.data
}

/**
 * 获取分页items
 */
export function getItems<T>(response: APIResponse<{ items: T[]; total: number }>) {
  return response.data?.items || []
}

/**
 * 获取分页total
 */
export function getTotal(response: APIResponse<{ items: any[]; total: number }>) {
  return response.data?.total || 0
}
