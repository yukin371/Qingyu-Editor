/**
 * 写作发布 API
 * @description 对接后端 /api/v1/writer/publish 路由，提供章节发布、审核、付费等功能
 * @endpoint /api/v1/writer/publish
 * @category writer
 * @tags 发布管理
 */
import { request } from '@/utils/request-adapter'
import httpService from '@/core/services/http.service'

// 发布状态
export type PublishStatus =
  | 'draft'
  | 'pending_review'
  | 'scheduled'
  | 'published'
  | 'rejected'
  | 'unpublished'
  | 'active'
  | 'paused'

// 发布类型
export type PublishType = 'free' | 'paid' | 'vip' | 'limited'

// 发布平台
export type PublishPlatform = 'web' | 'mobile' | 'all'

// 章节发布配置
export interface ChapterPublishConfig {
  chapter_id: string
  chapter_title?: string
  chapter_number?: number
  is_free?: boolean
  price?: number
  vip_only?: boolean
  publish_at?: string // 定时发布时间
}

// 发布计划
export interface PublishPlan {
  id: string
  book_id: string
  name: string
  description?: string
  type: PublishType
  status: PublishStatus
  platforms: PublishPlatform[]
  schedule: {
    type: 'immediate' | 'scheduled' | 'manual'
    publish_at?: string
    interval_days?: number
    chapters_per_release?: number
  }
  pricing: {
    is_free: boolean
    price?: number
    vip_discount?: number
  }
  created_at: string
  updated_at: string
}

// 发布记录
export interface PublishRecord {
  id: string
  book_id: string
  chapter_id: string
  chapter_title: string
  chapter_number: number
  status: PublishStatus
  published_at?: string
  created_at: string
}

export interface PublicationReviewDetail {
  id: string
  book_id: string
  chapter_id: string
  chapter_title: string
  chapter_number: number
  status: PublishStatus
  published_at?: string
  created_at: string
  reviewed_at: string | null
  reviewer_name: string | null
  review_comment: string | null
}

// 发布统计
export interface PublishStats {
  total_chapters: number
  published_chapters: number
  draft_chapters: number
  pending_review_chapters: number
  scheduled_chapters: number
  total_words: number
  published_words: number
  recent_trend?: Array<{
    date: string
    label: string
    count: number
  }>
}

function mapBackendPublicationStatus(item: any): PublishStatus {
  const backendStatus = item?.status as string
  const scheduledTime = item?.scheduledTime ? new Date(item.scheduledTime).getTime() : 0
  const isScheduled = backendStatus === 'pending' && scheduledTime > Date.now()

  if (backendStatus === 'published') return 'published'
  if (isScheduled) return 'scheduled'
  if (backendStatus === 'pending') return 'pending_review'
  if (backendStatus === 'failed' || backendStatus === 'rejected') return 'rejected'
  if (backendStatus === 'unpublished') return 'draft'
  return 'draft'
}

function mapPublicationRecord(item: any, bookId: string): PublishRecord {
  return {
    id: item?.id || '',
    book_id: bookId,
    chapter_id: item?.resourceId || '',
    chapter_title: item?.metadata?.chapterTitle || item?.resourceTitle || '未命名',
    chapter_number: item?.metadata?.chapterNumber || 0,
    status: mapBackendPublicationStatus(item),
    published_at: item?.publishTime || item?.scheduledTime,
    created_at: item?.createdAt || '',
  }
}

/**
 * 获取书籍发布计划
 * @description 获取指定书籍的发布计划详情
 * @endpoint GET /api/v1/writer/publish/books/:bookId/plan
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @response {PublishPlan} 200 - 成功返回发布计划
 * @security BearerAuth
 */
export function getPublishPlan(bookId: string) {
  return httpService
    .get<any>(`/api/v1/writer/projects/${bookId}/publication-status`)
    .then((status: any) => ({
      id: status?.projectId || bookId,
      book_id: status?.projectId || bookId,
      name: `${status?.projectTitle || '项目'}发布计划`,
      description: '',
      type: 'free' as PublishType,
      status: status?.isPublished ? ('active' as PublishStatus) : ('paused' as PublishStatus),
      platforms: ['all' as PublishPlatform],
      schedule: { type: 'manual' as const },
      pricing: { is_free: true },
      created_at: status?.publishedAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
}

/**
 * 创建发布计划
 * @description 为指定书籍创建新的发布计划
 * @endpoint POST /api/v1/writer/publish/books/:bookId/plan
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @param {Object} data - 发布计划数据
 * @param {string} data.name - 计划名称
 * @param {string} [data.description] - 计划描述
 * @param {PublishType} data.type - 发布类型（free: 免费, paid: 付费, vip: VIP专享, limited: 限时免费）
 * @param {PublishPlatform[]} data.platforms - 发布平台（web: 网页, mobile: 移动, all: 全平台）
 * @param {Object} data.schedule - 发布调度配置
 * @param {Object} data.pricing - 付费配置
 * @response {PublishPlan} 201 - 成功创建发布计划
 * @security BearerAuth
 */
export function createPublishPlan(
  bookId: string,
  data: {
    name: string
    description?: string
    type: PublishType
    platforms: PublishPlatform[]
    schedule: PublishPlan['schedule']
    pricing: PublishPlan['pricing']
  },
) {
  return httpService
    .post(`/api/v1/writer/projects/${bookId}/publish`, {
      bookstoreId: 'default-bookstore',
      categoryId: 'general',
      tags: [],
      description: data.description || '',
      coverImage: '',
      publishType: 'serial',
      freeChapters: data.pricing?.is_free ? 99999 : 0,
      authorNote: data.name || '发布计划',
      enableComment: true,
      enableShare: true,
    })
    .then(() => getPublishPlan(bookId))
}

/**
 * 更新发布计划
 * @description 更新已有的发布计划
 * @endpoint PUT /api/v1/writer/publish/plans/:planId
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @param {Partial<PublishPlan>} data - 要更新的计划字段
 * @response {PublishPlan} 200 - 成功更新发布计划
 * @security BearerAuth
 */
export function updatePublishPlan(planId: string, data: Partial<PublishPlan>) {
  return createPublishPlan(planId, {
    name: data.name || '发布计划',
    description: data.description,
    type: (data.type || 'free') as PublishType,
    platforms: (data.platforms || ['all']) as PublishPlatform[],
    schedule: data.schedule || { type: 'manual' },
    pricing: data.pricing || { is_free: true },
  })
}

/**
 * 删除发布计划
 * @description 删除指定的发布计划
 * @endpoint DELETE /api/v1/writer/publish/plans/:planId
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @response {{success: boolean}} 204 - 成功删除发布计划
 * @security BearerAuth
 */
export function deletePublishPlan(planId: string) {
  return httpService
    .post(`/api/v1/writer/projects/${planId}/unpublish`)
    .then(() => ({ success: true }))
}

/**
 * 发布章节
 * @description 立即发布指定章节
 * @endpoint POST /api/v1/writer/publish/chapters/:chapterId
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @param {ChapterPublishConfig} config - 发布配置（是否免费、价格、VIP专享等）
 * @response {PublishRecord} 201 - 成功发布章节
 * @security BearerAuth
 */
export function publishChapter(chapterId: string, config: ChapterPublishConfig) {
  const projectId = (config as any).project_id || (config as any).projectId || ''
  return request<PublishRecord>({
    url: `/api/v1/writer/documents/${chapterId}/publish`,
    method: 'post',
    params: projectId ? { projectId } : undefined,
    data: {
      chapterTitle: config.chapter_title || (config as any).chapterTitle || '未命名章节',
      chapterNumber: config.chapter_number || (config as any).chapterNumber || 1,
      isFree: config.is_free ?? true,
      authorNote: '',
      publishTime: config.publish_at || undefined,
    },
  })
}

/**
 * 批量发布章节
 * @description 批量发布多个章节
 * @endpoint POST /api/v1/writer/publish/chapters/batch
 * @category writer
 * @tags 发布管理
 * @param {Object} data - 批量发布数据
 * @param {string[]} data.chapter_ids - 章节ID数组
 * @param {ChapterPublishConfig} data.config - 发布配置
 * @response {PublishRecord[]} 201 - 成功批量发布，返回发布记录列表
 * @security BearerAuth
 */
export function batchPublishChapters(data: {
  chapter_ids: string[]
  config: ChapterPublishConfig
}) {
  return request<PublishRecord[]>({
    url: '/api/v1/writer/publish/chapters/batch',
    method: 'post',
    data,
  })
}

/**
 * 取消发布章节
 * @description 取消已发布的章节，将其下架
 * @endpoint DELETE /api/v1/writer/publish/chapters/:chapterId
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @response {{success: boolean}} 204 - 成功取消发布
 * @security BearerAuth
 */
export function unpublishChapter(chapterId: string, projectId: string, reason = '作者主动下架') {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/documents/${chapterId}/publish-status`,
    method: 'put',
    params: { projectId },
    data: {
      isPublished: false,
      isFree: true,
      unpublishReason: reason,
    },
  })
}

/**
 * 定时发布章节
 * @description 设置章节在指定时间自动发布
 * @endpoint POST /api/v1/writer/publish/chapters/:chapterId/schedule
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @param {string} publishAt - 发布时间（ISO8601格式）
 * @response {PublishRecord} 201 - 成功设置定时发布
 * @security BearerAuth
 */
export function scheduleChapter(
  chapterId: string,
  projectId: string,
  config: ChapterPublishConfig,
) {
  return publishChapter(chapterId, {
    ...config,
    chapter_id: chapterId,
    ...(projectId ? { project_id: projectId } : {}),
  } as ChapterPublishConfig)
}

/**
 * 获取发布记录
 * @description 获取指定书籍的发布记录列表，支持分页和状态筛选
 * @endpoint GET /api/v1/writer/publish/books/:bookId/records
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @param {PublishStatus} [params.status] - 发布状态筛选
 * @response {{items: PublishRecord[], total: number}} 200 - 成功返回发布记录
 * @security BearerAuth
 */
export function getPublishRecords(
  bookId: string,
  params?: {
    page?: number
    page_size?: number
    status?: PublishStatus
  },
) {
  return httpService
    .get<any>(`/api/v1/writer/projects/${bookId}/publications`, {
      params: {
        page: params?.page || 1,
        pageSize: params?.page_size || 20,
      },
    })
    .then((res: any) => {
      const rawItems = Array.isArray(res?.data) ? res.data : []
      const mappedItems: PublishRecord[] = rawItems.map((item: any) =>
        mapPublicationRecord(item, bookId),
      )

      const filtered =
        params?.status && params.status.length > 0
          ? mappedItems.filter((item) => item.status === params.status)
          : mappedItems

      return {
        items: filtered,
        total: Number(res?.pagination?.total || filtered.length),
      }
    })
}

export function getPublicationDetail(recordId: string): Promise<PublicationReviewDetail> {
  return request<any>({
    url: `/api/v1/writer/publications/${recordId}`,
    method: 'get',
  }).then((item: any) => ({
    ...mapPublicationRecord(item, item?.projectId || item?.bookId || ''),
    reviewed_at: item?.reviewedAt || item?.publishTime || null,
    reviewer_name: item?.reviewedBy || null,
    review_comment: item?.reviewNote || item?.reason || null,
  }))
}

/**
 * 获取发布统计
 * @description 获取指定书籍的发布统计数据
 * @endpoint GET /api/v1/writer/publish/books/:bookId/stats
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @response {PublishStats} 200 - 成功返回发布统计
 * @security BearerAuth
 */
export function getPublishStats(bookId: string) {
  return Promise.all([
    request<any>({
      url: `/api/v1/writer/projects/${bookId}/publication-status`,
      method: 'get',
    }),
    getPublishRecords(bookId, { page: 1, page_size: 1000 }),
  ]).then(([status, records]) => {
    const scheduledChapters = records.items.filter((item) => item.status === 'scheduled').length
    const pendingReviewChapters = records.items.filter(
      (item) => item.status === 'pending_review',
    ).length
    const publishedChapters = Number(status?.publishedChapters || 0)
    const totalChapters = Number(status?.totalChapters || records.total || 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const recentTrend = Array.from({ length: 7 }, (_, index) => {
      const currentDay = new Date(today)
      currentDay.setDate(today.getDate() - (6 - index))
      const nextDay = new Date(currentDay)
      nextDay.setDate(currentDay.getDate() + 1)

      const count = records.items.filter((item) => {
        if (item.status !== 'published' || !item.published_at) return false
        const publishedAt = new Date(item.published_at)
        return publishedAt >= currentDay && publishedAt < nextDay
      }).length

      return {
        date: currentDay.toISOString(),
        label: `${currentDay.getMonth() + 1}/${currentDay.getDate()}`,
        count,
      }
    })

    return {
      total_chapters: totalChapters,
      published_chapters: publishedChapters,
      draft_chapters: Math.max(
        0,
        totalChapters - publishedChapters - pendingReviewChapters - scheduledChapters,
      ),
      pending_review_chapters: pendingReviewChapters,
      scheduled_chapters: scheduledChapters,
      total_words: 0,
      published_words: 0,
      recent_trend: recentTrend,
    }
  })
}

/**
 * 提交审核
 * @description 将书籍提交审核
 * @endpoint POST /api/v1/writer/publish/books/:bookId/review
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @response {{success: boolean}} 200 - 成功提交审核
 * @security BearerAuth
 */
export function submitForReview(_bookId: string) {
  return Promise.reject(new Error('后端暂未提供提交审核接口'))
}

/**
 * 获取审核状态
 * @description 获取书籍的审核状态和审核意见
 * @endpoint GET /api/v1/writer/publish/books/:bookId/review/status
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @response {{status: PublishStatus, reviewer?: string, review_comment?: string, reviewed_at?: string}} 200 - 成功返回审核状态
 * @security BearerAuth
 */
export function getReviewStatus(bookId: string) {
  return request<{
    status: PublishStatus
    reviewer?: string
    review_comment?: string
    reviewed_at?: string
  }>({
    url: `/api/v1/writer/publish/books/${bookId}/review/status`,
    method: 'get',
  })
}

/**
 * 设置章节付费
 * @description 设置章节的付费方式和价格
 * @endpoint PUT /api/v1/writer/publish/chapters/:chapterId/pricing
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @param {Object} data - 付费配置
 * @param {boolean} data.is_free - 是否免费
 * @param {number} [data.price] - 价格（分）
 * @param {boolean} [data.vip_only] - 是否VIP专享
 * @response {{success: boolean}} 200 - 成功设置付费
 * @security BearerAuth
 */
export function setChapterPricing(
  chapterId: string,
  data: {
    is_free: boolean
    price?: number
    vip_only?: boolean
  },
) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/chapters/${chapterId}/pricing`,
    method: 'put',
    data,
  })
}

/**
 * 获取章节发布状态
 * @description 获取章节的发布状态和付费信息
 * @endpoint GET /api/v1/writer/publish/chapters/:chapterId/status
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @response {{status: PublishStatus, published_at?: string, is_free: boolean, price?: number, vip_only: boolean}} 200 - 成功返回章节状态
 * @security BearerAuth
 */
export function getChapterPublishStatus(chapterId: string) {
  return request<{
    status: PublishStatus
    published_at?: string
    is_free: boolean
    price?: number
    vip_only: boolean
  }>({
    url: `/api/v1/writer/publish/chapters/${chapterId}/status`,
    method: 'get',
  })
}

/**
 * 更新发布平台
 * @description 更新发布计划的发布平台
 * @endpoint PUT /api/v1/writer/publish/plans/:planId/platforms
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @param {PublishPlatform[]} platforms - 发布平台列表
 * @response {{success: boolean}} 200 - 成功更新发布平台
 * @security BearerAuth
 */
export function updatePublishPlatforms(planId: string, platforms: PublishPlatform[]) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/plans/${planId}/platforms`,
    method: 'put',
    data: { platforms },
  })
}

/**
 * 暂停发布计划
 * @description 暂停正在执行的发布计划
 * @endpoint POST /api/v1/writer/publish/plans/:planId/pause
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @response {{success: boolean}} 200 - 成功暂停发布计划
 * @security BearerAuth
 */
export function pausePublishPlan(planId: string) {
  return httpService
    .post(`/api/v1/writer/projects/${planId}/unpublish`)
    .then(() => ({ success: true }))
}

/**
 * 恢复发布计划
 * @description 恢复已暂停的发布计划
 * @endpoint POST /api/v1/writer/publish/plans/:planId/resume
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @response {{success: boolean}} 200 - 成功恢复发布计划
 * @security BearerAuth
 */
export function resumePublishPlan(planId: string) {
  return httpService
    .post(`/api/v1/writer/projects/${planId}/publish`, {
      bookstoreId: 'default-bookstore',
      categoryId: 'general',
      tags: [],
      description: '',
      coverImage: '',
      publishType: 'serial',
      freeChapters: 99999,
      authorNote: '恢复发布',
      enableComment: true,
      enableShare: true,
    })
    .then(() => ({ success: true }))
}

// 发布类型选项
export const publishTypeOptions = [
  { label: '免费发布', value: 'free' as PublishType, description: '所有读者均可免费阅读' },
  { label: '付费阅读', value: 'paid' as PublishType, description: '读者需要付费才能阅读' },
  { label: 'VIP专享', value: 'vip' as PublishType, description: '仅VIP会员可阅读' },
  { label: '限时免费', value: 'limited' as PublishType, description: '限时免费，之后转为付费' },
]

// 发布平台选项
export const publishPlatformOptions = [
  { label: '网页端', value: 'web' as PublishPlatform },
  { label: '移动端', value: 'mobile' as PublishPlatform },
  { label: '全平台', value: 'all' as PublishPlatform },
]

// 发布状态映射
export const publishStatusMap: Partial<
  Record<PublishStatus, { label: string; type: 'info' | 'success' | 'warning' | 'danger' }>
> = {
  draft: { label: '草稿', type: 'info' },
  pending_review: { label: '审核中', type: 'warning' },
  scheduled: { label: '定时发布', type: 'info' },
  published: { label: '已发布', type: 'success' },
  rejected: { label: '审核驳回', type: 'danger' },
  unpublished: { label: '已下架', type: 'info' },
  // active 和 paused 是内部状态，映射到已有状态
  active: { label: '活跃', type: 'success' },
  paused: { label: '暂停', type: 'warning' },
}
