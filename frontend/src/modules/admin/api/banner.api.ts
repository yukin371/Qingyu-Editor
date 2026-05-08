/**
 * Admin banner.api - Banner管理相关 API
 */

import { api, unwrapPayload, normalizeBanner } from './shared'
import type { APIResponse } from '@/types/api'
import type { Banner } from '@/modules/admin/types/admin.types'
import type { AdminListResult } from './shared'

/**
 * 获取Banner列表
 * 兼容旧API: getBanners(params)
 * 转换参数： page/pageSize -> limit/offset
 */
export async function getBanners(params: {
  page?: number
  pageSize?: number
  targetType?: string
  status?: string
}): Promise<AdminListResult<Banner>> {
  const limit = params.pageSize || 10
  const offset = ((params.page || 1) - 1) * (params.pageSize || 10)
  const rawResponse = await api.getApiV1AdminBanners({
    limit,
    offset,
    targetType: params.targetType,
    isActive: params.status === 'active' ? true : undefined,
  })
  const response = unwrapPayload<Record<string, any>>(rawResponse)
  const rawItems = Array.isArray(response?.items)
    ? response.items
    : Array.isArray(response?.banners)
      ? response.banners
      : Array.isArray(response?.list)
        ? response.list
        : []
  return {
    items: rawItems.map((item) => normalizeBanner(item)),
    total: Number(response?.total ?? response?.pagination?.total ?? rawItems.length ?? 0),
  }
}

/**
 * 创建Banner
 * 兼容旧API: createBanner(data)
 */
export async function createBanner(data: {
  title: string
  image: string
  target: string
  targetType: string
  sortOrder?: number
  isActive?: boolean
  startTime?: string
  endTime?: string
}): Promise<APIResponse<any>> {
  return api.postApiV1AdminBanners(data as any) as any
}

/**
 * 更新Banner
 * 兼容旧API: updateBanner(id, data)
 */
export async function updateBanner(id: string, data: any): Promise<APIResponse<any>> {
  return api.putApiV1AdminBannersId(id, data as any) as any
}

/**
 * 删除Banner
 * 兼容旧API: deleteBanner(id)
 */
export const deleteBanner = api.deleteApiV1AdminBannersId

/**
 * 批量更新Banner排序
 */
export const batchUpdateBannerSort = api.putApiV1AdminBannersBatchSort

/**
 * 批量更新Banner状态
 */
export const batchUpdateBannerStatus = api.putApiV1AdminBannersBatchStatus
