/**
 * Admin announcement.api - 公告管理相关 API
 */

import { api, unwrapPayload, normalizeAnnouncement } from './shared'
import type { APIResponse } from '@/types/api'
import type { Announcement } from '@/modules/admin/types/admin.types'
import type { AdminListResult } from './shared'

/**
 * 获取公告列表
 * 兼容旧API: getAnnouncements(params)
 * 转换参数： page/pageSize -> page/pageSize (backend uses same)
 */
export async function getAnnouncements(params?: {
  page?: number
  pageSize?: number
  type?: string
  targetUsers?: string
  targetRole?: string
  status?: string
}): Promise<AdminListResult<Announcement>> {
  const rawResponse = await api.getApiV1AdminAnnouncements({
    page: params?.page,
    page_size: params?.pageSize,
    type: params?.type,
    targetRole: params?.targetRole ?? params?.targetUsers,
    isActive: params?.status === 'active' ? true : undefined,
  } as any)
  const response = unwrapPayload<Record<string, any>>(rawResponse)
  const rawItems = Array.isArray(response?.items)
    ? response.items
    : Array.isArray(response?.announcements)
      ? response.announcements
      : Array.isArray(response?.list)
        ? response.list
        : []
  return {
    items: rawItems.map((item) => normalizeAnnouncement(item)),
    total: Number(response?.total ?? response?.pagination?.total ?? rawItems.length ?? 0),
  }
}

/**
 * 创建公告
 * 兼容旧API: createAnnouncement(data)
 */
export async function createAnnouncement(data: {
  title: string
  content: string
  type: 'info' | 'warning' | 'notice'
  priority?: number
  isActive?: boolean
  startTime?: string
  endTime?: string
  targetRole?: 'all' | 'reader' | 'writer' | 'admin'
}): Promise<APIResponse<any>> {
  return api.postApiV1AdminAnnouncements(data as any) as any
}

/**
 * 更新公告
 * 兼容旧API: updateAnnouncement(id, data)
 */
export async function updateAnnouncement(id: string, data: any): Promise<APIResponse<any>> {
  return api.putApiV1AdminAnnouncementsId(id, data as any) as any
}

/**
 * 删除公告
 * 兼容旧API: deleteAnnouncement(id)
 */
export const deleteAnnouncement = api.deleteApiV1AdminAnnouncementsId

/**
 * 批量更新公告状态
 * 兼容旧API: batchUpdateAnnouncementStatus(ids, status)
 */
export async function batchUpdateAnnouncementStatus(
  ids: string[],
  status: 'active' | 'inactive',
): Promise<APIResponse<void>> {
  return api.putApiV1AdminAnnouncementsBatchStatus({
    announcementIds: ids,
    isActive: status === 'active',
  } as any) as any
}

/**
 * 批量删除公告
 */
export const batchDeleteAnnouncements = api.deleteApiV1AdminAnnouncementsBatchDelete
