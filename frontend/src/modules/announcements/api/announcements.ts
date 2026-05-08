/**
 * 公告 API 模块
 * 对接后端 /api/v1/announcements/* 路由
 * 后端路由文档: Qingyu_backend/router/announcements/announcements_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 公告类型
 */
export type AnnouncementType = 'info' | 'warning' | 'notice'

/**
 * 公告优先级
 */
export type AnnouncementPriority = 'low' | 'medium' | 'high'

/**
 * 公告信息
 */
export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  priority: number
  isActive?: boolean
  targetRole?: 'all' | 'reader' | 'writer' | 'admin'
  startTime?: string
  endTime?: string
  effectiveStartTime?: string
  effectiveEndTime?: string
  viewCount: number
  createdAt: string
  updatedAt?: string
}

/**
 * 公告列表查询参数
 */
export interface GetAnnouncementsParams {
  type?: AnnouncementType
  page?: number
  pageSize?: number
}

/**
 * 公告 API 接口 (v1.0)
 * 对接后端: /api/v1/announcements/*
 */
export const announcementsAPI = {
  /**
   * 获取有效公告列表
   * GET /api/v1/announcements/effective
   */
  async getEffectiveAnnouncements(): Promise<APIResponse<Announcement[]>> {
    return httpService.get<APIResponse<Announcement[]>>('/announcements/effective')
  },

  /**
   * 获取公告详情
   * GET /api/v1/announcements/:id
   */
  async getAnnouncementById(id: string): Promise<APIResponse<Announcement>> {
    return httpService.get<APIResponse<Announcement>>(`/announcements/${id}`)
  },

  /**
   * 增加公告查看次数
   * POST /api/v1/announcements/:id/view
   */
  async incrementViewCount(id: string): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>(`/announcements/${id}/view`)
  },

  /**
   * 获取所有公告（带分页）
   * GET /api/v1/announcements
   */
  async getAnnouncements(
    params?: GetAnnouncementsParams,
  ): Promise<PaginatedResponse<Announcement>> {
    return httpService.get<PaginatedResponse<Announcement>>('/announcements', { params })
  },
}

// 向后兼容：导出旧的函数名
export const getEffectiveAnnouncements = () => announcementsAPI.getEffectiveAnnouncements()
export const getAnnouncementById = (id: string) => announcementsAPI.getAnnouncementById(id)
export const incrementViewCount = (id: string) => announcementsAPI.incrementViewCount(id)
export const getAnnouncements = (params?: GetAnnouncementsParams) =>
  announcementsAPI.getAnnouncements(params)

export default announcementsAPI
