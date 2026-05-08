/**
 * 写作仪表盘 API
 * @description 对接后端 /api/v1/writer/dashboard 路由
 * @endpoint /api/v1/writer/dashboard
 * @category writer
 * @tags 仪表盘
 */
import { request } from '@/utils/request-adapter'
import httpService from '@/core/services/http.service'

// ==================== 类型定义 ====================

/**
 * 今日写作统计
 */
export interface TodayWordsStats {
  /** 今日写作字数 */
  todayWords: number
  /** 本周总字数 */
  weekTotal: number
  /** 本月总字数 */
  monthTotal: number
  /** 写作时长（分钟） */
  writingMinutes: number
  /** 更新章节 */
  updatedChapters: number
  /** 日期 */
  date: string
}

/**
 * 后端 /stats/today 接口返回格式
 */
interface StatsTodayResponse {
  bookId?: string
  todayViews?: number
  todaySubscribers?: number
  todayWords?: number
  views?: number
  subscribers?: number
  words?: number
}

/**
 * 仪表盘概览统计
 */
export interface DashboardOverview {
  /** 总项目数 */
  totalProjects: number
  /** 进行中项目数 */
  activeProjects: number
  /** 总字数 */
  totalWords: number
  /** 总章节 */
  totalChapters: number
  /** 总收入 */
  totalRevenue: number
  /** 今日字数 */
  todayWords: number
  /** 本周字数 */
  weekWords: number
}

/**
 * 审核统计
 */
export interface ReviewStats {
  /** 总提交数 */
  total: number
  /** 已通过数 */
  approved: number
  /** 通过率 */
  approvedRate: number
  /** 已拒绝数 */
  rejected: number
  /** 拒绝率 */
  rejectedRate: number
  /** 待审核数 */
  pending: number
}

/**
 * 审核记录
 */
export interface ReviewRecord {
  /** 记录ID */
  id: string
  /** 章节标题 */
  chapter_title: string
  /** 章节序号 */
  chapter_number: number
  /** 审核状态 */
  status: 'pending' | 'approved' | 'rejected'
  /** 提交时间 */
  submitted_at: string
  /** 审核时间 */
  reviewed_at: string | null
  /** 审核员 */
  reviewer_name: string | null
  /** 审核意见 */
  review_comment: string | null
}

/**
 * 审核历史响应
 */
export interface ReviewHistoryResponse {
  items: ReviewRecord[]
  total: number
  page: number
  pageSize: number
}

// ==================== API 函数 ====================

/**
 * 获取今日写作统计
 * @description 获取当前用户今日的写作统计数据
 * @endpoint GET /api/v1/writer/stats/today
 * @category writer
 * @tags 仪表盘
 * @response {TodayWordsStats} 200 - 成功返回今日统计
 * @security BearerAuth
 */
export async function getTodayWordsStats(): Promise<TodayWordsStats> {
  const response = await request<StatsTodayResponse>({
    url: '/api/v1/writer/stats/today',
    method: 'get',
  })
  // 适配后端返回的数据结构
  return {
    todayWords: response.todayWords ?? response.words ?? 0,
    weekTotal: 0,
    monthTotal: 0,
    writingMinutes: 0,
    updatedChapters: 0,
    date: new Date().toISOString().split('T')[0],
  }
}

/**
 * 获取仪表盘概览
 * @description 获取写作仪表盘的概览统计数据
 * @endpoint GET /api/v1/writer/dashboard/overview
 * @category writer
 * @tags 仪表盘
 * @response {DashboardOverview} 200 - 成功返回概览数据
 * @security BearerAuth
 */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  // 优先调用 /stats 端点，若不可用降级到 /overview
  try {
    const statsResp = await request<{
      totalWords: number
      bookCount: number
      todayWords: number
      pending: number
      streak: number
    }>({
      url: '/api/v1/writer/dashboard/stats',
      method: 'get',
    })
    return {
      totalProjects: statsResp.bookCount,
      activeProjects: statsResp.pending,
      totalWords: statsResp.totalWords,
      totalChapters: 0,
      totalRevenue: 0,
      todayWords: statsResp.todayWords,
      weekWords: 0,
    }
  } catch {
    // stats 端点不可用，降级到 overview
    return request<DashboardOverview>({
      url: '/api/v1/writer/dashboard/overview',
      method: 'get',
    })
  }
}

/**
 * 获取审核统计
 * @description 获取当前用户作品的审核统计数据
 * @endpoint GET /api/v1/writer/reviews/statistics
 * @category writer
 * @tags 审核管理
 * @response {ReviewStats} 200 - 成功返回审核统计
 * @security BearerAuth
 */
export function getReviewStatistics(): Promise<ReviewStats> {
  return request<ReviewStats>({
    url: '/api/v1/writer/reviews/statistics',
    method: 'get',
  })
}

/**
 * 获取审核历史
 * @description 获取当前用户作品的审核历史记录
 * @endpoint GET /api/v1/writer/reviews/history
 * @category writer
 * @tags 审核管理
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.status] - 状态筛选 (pending/approved/rejected)
 * @response {ReviewHistoryResponse} 200 - 成功返回审核历史
 * @security BearerAuth
 */
export function getReviewHistory(params?: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<ReviewHistoryResponse> {
  return request<ReviewHistoryResponse>({
    url: '/api/v1/writer/reviews/history',
    method: 'get',
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
      status: params?.status,
    },
  })
}

/**
 * 重新提交审核
 * @description 重新提交被拒绝的章节进行审核
 * @endpoint POST /api/v1/writer/reviews/{reviewId}/resubmit
 * @category writer
 * @tags 审核管理
 * @param {string} reviewId - 审核记录ID
 * @param {Object} data - 重新提交数据
 * @param {string} [data.comment] - 附带说明
 * @response {{success: boolean}} 200 - 成功重新提交
 * @security BearerAuth
 */
export function resubmitReview(
  reviewId: string,
  data?: { comment?: string },
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/reviews/${reviewId}/resubmit`,
    method: 'post',
    data,
  })
}

// ==================== 兼容旧API（使用publish API模拟）====================

/**
 * 发布状态响应接口
 */
export interface PublicationStatusResponse {
  pendingChapters?: number
  publishedChapters?: number
  totalChapters?: number
}

/**
 * 发布历史响应接口
 */
export interface PublicationHistoryResponse {
  data?: Array<Record<string, unknown>>
  pagination?: { total?: number }
}

/**
 * 获取审核统计（兼容函数）
 * @description 使用发布统计API获取审核相关数据
 * @deprecated 请使用 getReviewStatistics
 */
export async function getReviewStatsCompat(projectId: string): Promise<ReviewStats> {
  try {
    // 使用发布统计API
    // httpService 返回的是 AxiosResponse，需要提取 data
    const response = await httpService.get<PublicationStatusResponse>(
      `/api/v1/writer/projects/${projectId}/publication-status`,
    )
    // 处理可能的 AxiosResponse 包装
    const status = (response as any)?.data ?? response
    const pending = Number(status?.pendingChapters || 0)
    const published = Number(status?.publishedChapters || 0)
    const total = pending + published + Number(status?.totalChapters || 0)

    return {
      total,
      approved: published,
      approvedRate: total > 0 ? Math.round((published / total) * 100) : 0,
      rejected: 0,
      rejectedRate: 0,
      pending,
    }
  } catch (error) {
    console.error('获取审核统计失败:', error)
    return {
      total: 0,
      approved: 0,
      approvedRate: 0,
      rejected: 0,
      rejectedRate: 0,
      pending: 0,
    }
  }
}

/**
 * 获取审核历史（兼容函数）
 * @description 使用发布记录API获取审核历史
 * @deprecated 请使用 getReviewHistory
 */
export async function getReviewHistoryCompat(
  projectId: string,
  params?: {
    page?: number
    pageSize?: number
    status?: string
  },
): Promise<ReviewHistoryResponse> {
  try {
    const response = await httpService.get<PublicationHistoryResponse>(
      `/api/v1/writer/projects/${projectId}/publications`,
      {
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 20,
        },
      },
    )
    // 处理可能的 AxiosResponse 包装
    const res = (response as any)?.data ?? response

    const rawItems = Array.isArray(res?.data) ? res.data : []
    const items: ReviewRecord[] = rawItems.map((item: any) => ({
      id: item?.id || '',
      chapter_title: item?.metadata?.chapterTitle || item?.resourceTitle || '未命名',
      chapter_number: item?.metadata?.chapterNumber || 0,
      status: mapPublishStatusToReviewStatus(item?.status),
      submitted_at: item?.createdAt || '',
      reviewed_at: item?.publishTime || null,
      reviewer_name: item?.reviewer || null,
      review_comment: item?.reason || null,
    }))

    return {
      items,
      total: Number(res?.pagination?.total || items.length),
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
    }
  } catch (error) {
    console.error('获取审核历史失败:', error)
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    }
  }
}

/**
 * 映射发布状态到审核状态
 */
function mapPublishStatusToReviewStatus(status: string): 'pending' | 'approved' | 'rejected' {
  switch (status) {
    case 'published':
      return 'approved'
    case 'pending':
      return 'pending'
    case 'failed':
    case 'rejected':
      return 'rejected'
    default:
      return 'pending'
  }
}

// 默认导出
export default {
  getTodayWordsStats,
  getDashboardOverview,
  getReviewStatistics,
  getReviewHistory,
  resubmitReview,
  getReviewStatsCompat,
  getReviewHistoryCompat,
}
