/**
 * Admin operation-log.api - 操作日志相关 API
 */

import { api } from './shared'
import type { OperationLog } from '@/modules/admin/types/admin.types'

/**
 * 获取操作日志
 * 兼容旧API: getOperationLogs(params)
 *
 * 注意：由于响应包含 pagination 字段，httpService 不会解包
 * 后端返回: { code: 0, data: OperationLog[], pagination: { total: number, ... } }
 *
 * 后端参数: page, page_size, admin_id, operation
 */
export async function getOperationLogs(params?: {
  page?: number
  page_size?: number
  admin_id?: string
  operation?: string
  start_date?: string
  end_date?: string
}): Promise<{
  code: number
  data: OperationLog[]
  pagination: { total: number; page: number; page_size: number }
}> {
  return api.getApiV1AdminOperationLogs(params as any) as any
}
