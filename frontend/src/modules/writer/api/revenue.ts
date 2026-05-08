/**
 * 写作端 - 作家收入统计API
 */

import { httpService } from '@/core/services/http.service'

/**
 * 收入统计数据接口
 */
export interface RevenueStats {
  totalRevenue: number // 总收入
  todayRevenue: number // 今日收入
  availableBalance: number // 可提现余额
  totalWithdrawn: number // 已提现总额
  monthRevenue?: number // 本月收入
  lastMonthRevenue?: number // 上月收入
}

/**
 * 章节收入排行接口
 */
export interface ChapterRevenue {
  id: string
  chapterTitle: string
  chapterNumber: number
  views: number // 阅读量
  subscriptions: number // 订阅数
  revenue: number // 收入金额
  bookId?: string
  bookTitle?: string
}

/**
 * 收入趋势数据接口
 */
export interface RevenueTrend {
  date: string
  revenue: number
  subscriptions?: number
  tips?: number
}

/**
 * 收入来源分布接口
 */
export interface RevenueSource {
  type: 'subscription' | 'tip' | 'ad' | 'other'
  label: string
  amount: number
  percentage: number
}

function extractItems<T = any>(raw: any): T[] {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.items)) return raw.items
  if (Array.isArray(raw?.list)) return raw.list
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.data?.items)) return raw.data.items
  if (Array.isArray(raw?.data?.list)) return raw.data.list
  return []
}

function toNumber(value: unknown): number {
  return Number(value ?? 0)
}

function formatRevenueSourceLabel(type: string): RevenueSource['label'] {
  const map: Record<string, RevenueSource['label']> = {
    chapter: '章节订阅',
    subscription: '订阅收入',
    reward: '打赏收入',
    tip: '打赏收入',
    vip_reading: 'VIP 阅读',
    vip: 'VIP 阅读',
    ad: '广告收入',
    other: '其他收入',
  }
  return map[type] || '其他收入'
}

/**
 * 获取作家收入统计
 * @description 获取当前登录作家的收入统计概览，包括总收入、今日收入、可提现余额等
 * @endpoint GET /api/v1/finance/author/revenue-statistics
 * @category writer
 * @tags 收入管理
 * @param {string} [period='monthly'] - 统计周期：daily（日）、monthly（月）、yearly（年）
 * @response {RevenueStats} 200 - 成功返回收入统计概览
 * @security BearerAuth
 */
export const getRevenueStats = (period: 'daily' | 'monthly' | 'yearly' = 'monthly') => {
  return httpService.get('/api/v1/finance/author/revenue-statistics', {
    params: { period },
  })
}

/**
 * 获取收入趋势
 * @description 获取当前登录作家的收入趋势数据，通过获取收入统计并使用period参数来获取趋势
 * @endpoint GET /api/v1/finance/author/revenue-statistics
 * @category writer
 * @tags 收入管理
 * @param {string} [period='daily'] - 统计周期：daily（日）用于趋势
 * @response {RevenueTrend[]} 200 - 成功返回收入趋势数据列表
 * @security BearerAuth
 */
export const getRevenueTrend = (period: 'daily' | 'monthly' | 'yearly' = 'daily') => {
  return httpService
    .get('/api/v1/finance/author/revenue-statistics', {
      params: { period },
    })
    .then((raw: any) =>
      extractItems(raw).map(
        (item: any): RevenueTrend => ({
          date: item.period_start || item.periodStart || item.period || '',
          revenue: toNumber(item.total_revenue ?? item.totalRevenue),
          subscriptions: toNumber(item.transaction_count ?? item.transactionCount),
          tips: toNumber(item.reward_income ?? item.rewardIncome),
        }),
      ),
    )
}

/**
 * 获取收入来源分布
 * @description 获取当前登录作家的收入来源分布数据，通过收入明细聚合计算
 * @endpoint GET /api/v1/finance/author/revenue-details
 * @category writer
 * @tags 收入管理
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.page_size=100] - 每页数量（默认取100条用于聚合分析）
 * @response {RevenueSource[]} 200 - 成功返回收入来源分布数据
 * @security BearerAuth
 */
export const getRevenueSources = (params?: { page?: number; page_size?: number }) => {
  return httpService
    .get('/api/v1/finance/author/revenue-details', {
      params: { page: params?.page ?? 1, page_size: params?.page_size ?? 100 },
    })
    .then((raw: any) => {
      const items = extractItems(raw)
      const totals = new Map<string, number>()

      items.forEach((item: any) => {
        const type = String(item.type || 'other')
        const amount = toNumber(
          item.total_income ?? item.totalIncome ?? item.total_amount ?? item.totalAmount,
        )
        totals.set(type, (totals.get(type) || 0) + amount)
      })

      const totalAmount = Array.from(totals.values()).reduce((sum, value) => sum + value, 0)

      return Array.from(totals.entries()).map(
        ([type, amount]): RevenueSource => ({
          type: (['subscription', 'tip', 'ad', 'other'].includes(type)
            ? type
            : 'other') as RevenueSource['type'],
          label: formatRevenueSourceLabel(type),
          amount: Number(amount.toFixed(2)),
          percentage: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(2)) : 0,
        }),
      )
    })
}

/**
 * 获取章节收入排行
 * @description 获取指定作品的章节收入排行数据，支持分页查询
 * @endpoint GET /api/v1/finance/author/earnings/:bookId
 * @category writer
 * @tags 收入管理
 * @param {string} bookId - 作品ID
 * @param {number} [page=1] - 页码，默认为1
 * @param {number} [pageSize=20] - 每页数量，默认为20
 * @response {{items: ChapterRevenue[], total: number}} 200 - 成功返回章节收入排行数据
 * @security BearerAuth
 */
export const getChapterRevenueRanking = async (
  bookId?: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<ChapterRevenue[]> => {
  if (bookId) {
    const raw = await httpService.get(`/api/v1/writer/books/${bookId}/top-chapters`, {
      params: { page, size: pageSize },
    })

    return extractItems(raw).map(
      (item: any, index: number): ChapterRevenue => ({
        id: item.chapterId || item.chapter_id || `${bookId}-${index}`,
        chapterTitle: item.chapterTitle || item.title || '未命名章节',
        chapterNumber: Number(item.chapterNumber || index + 1),
        views: toNumber(item.views ?? item.reads),
        subscriptions: toNumber(item.subscriptions),
        revenue: toNumber(item.revenue),
        bookId,
      }),
    )
  }

  const raw = await httpService.get('/api/v1/finance/author/earnings', {
    params: { page, page_size: 100 },
  })
  const grouped = new Map<
    string,
    {
      id: string
      chapterTitle: string
      chapterNumber: number
      views: number
      subscriptions: number
      revenue: number
      bookId?: string
      bookTitle?: string
    }
  >()

  extractItems(raw).forEach((item: any, index: number) => {
    const chapterId = item.chapter_id || item.chapterId || `chapter-${index}`
    const entry = grouped.get(chapterId) || {
      id: chapterId,
      chapterTitle: item.chapter_title || item.chapterTitle || '未命名章节',
      chapterNumber: Number(item.chapter_number || index + 1),
      views: 0,
      subscriptions: 0,
      revenue: 0,
      bookId: item.book_id || item.bookId,
      bookTitle: item.book_title || item.bookTitle,
    }

    entry.revenue += toNumber(item.amount ?? item.author_income ?? item.authorIncome)
    grouped.set(chapterId, entry)
  })

  return Array.from(grouped.values())
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, pageSize)
}

/**
 * 获取作品列表（用于筛选）
 * @description 获取当前登录作家的作品列表，支持分页和状态筛选
 * @endpoint GET /api/v1/writer/books
 * @category writer
 * @tags 作品管理
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.size] - 每页数量
 * @param {string} [params.status] - 作品状态筛选
 * @response {{list: BookItem[], total: number}} 200 - 成功返回作品列表
 * @security BearerAuth
 */
export function getWriterBooks(params?: { page?: number; size?: number; status?: string }) {
  return httpService.get<{
    list: Array<{
      id: string
      title: string
      status: string
      chapterCount: number
    }>
    total: number
  }>('/writer/books', { params })
}

/**
 * 获取详细收入记录
 * @description 获取当前登录作家的详细收入记录，支持按作品、类型、日期范围筛选
 * @endpoint GET /api/v1/finance/author/revenue-details
 * @category writer
 * @tags 收入管理
 * @param {Object} [params] - 查询参数
 * @param {string} [params.bookId] - 作品ID筛选
 * @param {string} [params.type] - 收入类型筛选：subscription（订阅）、tip（打赏）、ad（广告）
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @param {string} [params.startDate] - 开始日期（ISO8601格式）
 * @param {string} [params.endDate] - 结束日期（ISO8601格式）
 * @response {{items: RevenueRecord[], total: number}} 200 - 成功返回收入记录列表
 * @security BearerAuth
 */
export function getRevenueRecords(params?: {
  bookId?: string
  type?: string // subscription, tip, ad
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}) {
  return httpService.get('/api/v1/finance/author/revenue-details', { params })
}

/**
 * 获取作者收入列表
 * @description 获取作者的收入记录列表
 * @endpoint GET /api/v1/finance/author/earnings
 * @category writer
 * @tags 收入管理
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @response {{items: any[], total: number}} 200 - 成功返回收入列表
 * @security BearerAuth
 */
export function getEarnings(params?: { page?: number; pageSize?: number }) {
  return httpService.get('/api/v1/finance/author/earnings', {
    params: { page: params?.page ?? 1, page_size: params?.pageSize ?? 20 },
  })
}

/**
 * 获取提现记录
 * @description 获取用户的提现申请记录
 * @endpoint GET /api/v1/finance/author/withdrawals
 * @category writer
 * @tags 收入管理
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @response {{items: any[], total: number}} 200 - 成功返回提现记录列表
 * @security BearerAuth
 */
export function getWithdrawals(params?: { page?: number; pageSize?: number }) {
  return httpService.get('/api/v1/finance/author/withdrawals', {
    params: { page: params?.page ?? 1, page_size: params?.pageSize ?? 20 },
  })
}

/**
 * 提现账户信息
 */
export interface WithdrawAccount {
  accountType: string
  accountName: string
  accountNo: string
  bankName?: string
  branchName?: string
}

/**
 * 申请提现
 * @description 作者申请提现
 * @endpoint POST /api/v1/finance/author/withdraw
 * @category writer
 * @tags 收入管理
 * @param {Object} data - 提现信息
 * @param {number} data.amount - 提现金额
 * @param {string} data.method - 提现方式：alipay、wechat、bank
 * @param {WithdrawAccount} data.accountInfo - 账户信息
 * @response {any} 200 - 成功返回提现申请结果
 * @security BearerAuth
 */
export function requestWithdraw(data: {
  amount: number
  method: 'alipay' | 'wechat' | 'bank'
  accountType: string
  accountName: string
  accountNo: string
  bankName?: string
  branchName?: string
}) {
  return httpService.post('/api/v1/finance/author/withdraw', data)
}

export default {
  getRevenueStats,
  getRevenueTrend,
  getRevenueSources,
  getChapterRevenueRanking,
  getRevenueRecords,
  getEarnings,
  getWithdrawals,
  requestWithdraw,
}
