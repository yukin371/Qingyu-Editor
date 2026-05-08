/**
 * Bookstore API Wrapper
 * 将orval生成的工厂模式API转换为更易使用的格式
 *
 * 使用方式：
 * import * as bookstoreAPI from '@/modules/bookstore/api'
 * const books = await bookstoreAPI.getBookList({ page: 1, size: 20 })
 */

import { getApi } from './generated/bookstore'
import type { APIResponse } from '@/types/api'
import type {
  BookDetail,
  Category,
} from '@/modules/bookstore/types'
import { normalizeBookDetail, normalizeBookList } from '../utils/contract-normalizer'

// 获取生成的API对象
const api = getApi()

// ==================== Banners 相关 API ====================

/**
 * 获取轮播图列表
 * 适配器函数：将limit参数转换为对象参数
 */
export async function getBanners(limit: number = 5) {
  return api.getApiV1BookstoreBanners({ limit })
}

/**
 * 增加轮播图点击次数
 */
export const incrementBannerClick = api.postApiV1BookstoreBannersIdClick

// ==================== Books 相关 API ====================

/**
 * 获取书籍列表
 */
export async function getBookList(params?: any) {
  const response = await api.getApiV1BookstoreBooks(params)

  if (Array.isArray(response)) {
    return normalizeBookList(response)
  }

  if (response && typeof response === 'object') {
    const payload = response as any
    if (Array.isArray(payload.data)) {
      return { ...payload, data: normalizeBookList(payload.data) }
    }
    if (payload.data?.books && Array.isArray(payload.data.books)) {
      return {
        ...payload,
        data: {
          ...payload.data,
          books: normalizeBookList(payload.data.books)
        }
      }
    }
  }

  return response
}

/**
 * 获取书籍详情
 * 兼容旧API: getBookDetail(id)
 */
export async function getBookDetail(id: string): Promise<APIResponse<BookDetail>> {
  try {
    const response = await (api.getApiV1BookstoreBooksIdDetail(id) as any)

    // 使用 normalizeBookDetail 处理数据
    if (response?.data) {
      return {
        ...response,
        data: normalizeBookDetail(response.data) ?? response.data
      }
    }

    return response
  } catch (error: any) {
    const status = error?.response?.status
    if (status === 404 || status === 400) {
      const direct = await (api.getApiV1BookstoreBooksId(id) as any)
      if (direct?.data) {
        return {
          ...direct,
          data: normalizeBookDetail(direct.data) ?? direct.data
        }
      }

      // 兼容部分后端实例详情接口不可用：从列表分页回捞指定ID
      const pageSize = 100
      for (let page = 1; page <= 20; page++) {
        const listResp = await (api.getApiV1BookstoreBooks({ page, size: pageSize }) as any)
        const list = Array.isArray(listResp?.data) ? listResp.data : []
        const found = list.find((item: any) => String(item?.id) === String(id))
        if (found) {
          return { ...(direct || {}), code: 0, data: normalizeBookDetail(found) ?? found } as any
        }
        const hasNext = Boolean(listResp?.pagination?.has_next ?? listResp?.pagination?.hasNext)
        if (!hasNext) break
      }
    }
    throw error
  }
}

/**
 * 创建书籍
 */
export const createBook = api.postApiV1BookstoreBooks

/**
 * 更新书籍
 */
export const updateBook = api.putApiV1BookstoreBooksId

/**
 * 删除书籍
 */
export const deleteBook = api.deleteApiV1BookstoreBooksId

/**
 * 搜索书籍
 */
export async function searchBooks(params?: any) {
  const response = await api.getApiV1BookstoreBooksSearch(params as any)

  if (response?.data && Array.isArray(response.data)) {
    return { ...response, data: normalizeBookList(response.data) }
  }

  return response
}

/**
 * 按书名搜索
 */
export const searchByTitle = api.getApiV1BookstoreBooksSearchTitle

/**
 * 按作者搜索
 */
export const searchByAuthor = api.getApiV1BookstoreBooksSearchAuthor

/**
 * 按状态获取书籍
 */
export const getBooksByStatus = api.getApiV1BookstoreBooksStatus

/**
 * 按标签获取书籍
 */
export const getBooksByTags = api.getApiV1BookstoreBooksTags

/**
 * 获取推荐书籍
 * 适配器函数：将独立参数转换为对象参数以匹配Orval生成的API
 */
export async function getRecommendedBooks(page: number = 1, size: number = 20) {
  const response = await api.getApiV1BookstoreBooksRecommended({ page, size })
  return normalizeBookList(response as any)
}

/**
 * 获取精选书籍
 * 适配器函数：将独立参数转换为对象参数以匹配Orval生成的API
 */
export async function getFeaturedBooks(page: number = 1, size: number = 20) {
  const response = await api.getApiV1BookstoreBooksFeatured({ page, size })
  return normalizeBookList(response as any)
}

/**
 * 获取热门书籍
 * 适配器函数：将limit参数转换为对象参数
 */
export async function getPopularBooks(limit: number = 10) {
  return api.getApiV1BookstoreBooksPopular({ limit })
}

/**
 * 获取最新书籍
 * 适配器函数：将limit参数转换为对象参数
 */
export async function getLatestBooks(limit: number = 10) {
  return api.getApiV1BookstoreBooksLatest({ limit })
}

/**
 * 获取相似书籍
 * 适配器函数：将独立参数转换为对象参数以匹配Orval生成的API
 */
export async function getSimilarBooks(bookId: string, limit: number = 10) {
  return api.getApiV1BookstoreBooksIdSimilar(bookId, { limit })
}

/**
 * 增加书籍浏览次数
 */
export const incrementBookView = api.postApiV1BookstoreBooksIdView

/**
 * 获取书籍统计信息
 */
export const getBookStatistics = api.getApiV1BookstoreBooksIdStatistics

/**
 * 点赞书籍
 */
export const likeBook = api.postApiV1BookstoreBooksIdLike

/**
 * 取消点赞书籍
 */
export const unlikeBook = api.postApiV1BookstoreBooksIdUnlike

/**
 * 获取书籍评分分布
 */
export const getBookRatingDistribution = api.getApiV1BookstoreBooksIdRatingDistribution

/**
 * 获取书籍评论列表
 */
export const getBookReviews = api.getApiV1BookstoreBooksIdRatings

/**
 * 为书籍评分
 */
export const rateBook = api.postApiV1BookstoreBooksIdRating

/**
 * 更新书籍评分
 */
export const updateBookRating = api.putApiV1BookstoreBooksIdRating

/**
 * 删除书籍评分
 */
export const deleteBookRating = api.deleteApiV1BookstoreBooksIdRating

/**
 * 获取书籍平均评分
 */
export const getBookAverageRating = api.getApiV1BookstoreBooksIdAverageRating

/**
 * 获取书籍章节列表
 */
export const getBookChapters = api.getApiV1BookstoreBooksIdChapters

/**
 * 获取书籍第一章
 */
export const getBookFirstChapter = api.getApiV1BookstoreBooksIdChaptersFirst

/**
 * 获取书籍最后一章
 */
export const getBookLastChapter = api.getApiV1BookstoreBooksIdChaptersLast

/**
 * 获取书籍免费章节
 */
export const getBookFreeChapters = api.getApiV1BookstoreBooksIdChaptersFree

/**
 * 获取书籍付费章节
 */
export const getBookPaidChapters = api.getApiV1BookstoreBooksIdChaptersPaid

/**
 * 获取书籍已发布章节
 */
export const getBookPublishedChapters = api.getApiV1BookstoreBooksIdChaptersPublished

/**
 * 获取书籍章节统计
 */
export const getBookChapterStatistics = api.getApiV1BookstoreBooksIdChaptersStatistics

/**
 * 获取书籍试读章节
 */
export const getBookTrialChapters = api.getApiV1BookstoreBooksIdTrialChapters

/**
 * 获取书籍VIP章节
 */
export const getBookVipChapters = api.getApiV1BookstoreBooksIdVipChapters

/**
 * 按分类获取书籍
 */
export async function getBooksByCategory(categoryIdOrParams: string | Record<string, any>, params?: any) {
  const requestParams =
    typeof categoryIdOrParams === 'string'
      ? { categoryId: categoryIdOrParams, ...(params || {}) }
      : { ...(categoryIdOrParams || {}) }

  const response = await api.getApiV1BookstoreBooksCategory(requestParams as any)

  if (Array.isArray(response)) {
    return normalizeBookList(response)
  }

  if (response && typeof response === 'object') {
    const payload = response as any
    if (payload.data?.books && Array.isArray(payload.data.books)) {
      return {
        ...payload,
        data: {
          ...payload.data,
          books: normalizeBookList(payload.data.books)
        }
      }
    }
    if (Array.isArray(payload.data)) {
      return { ...payload, data: normalizeBookList(payload.data) }
    }
  }

  return response
}

// ==================== Categories 相关 API ====================

/**
 * 获取所有分类（树形结构）
 */
export async function getAllCategories(): Promise<APIResponse<Category[]>> {
  return api.getApiV1BookstoreCategoriesTree() as any
}

/**
 * 获取分类列表（别名）
 */
export const getCategories = getAllCategories

/**
 * 获取分类树
 */
export const getCategoryTree = api.getApiV1BookstoreCategoriesTree

/**
 * 获取分类详情
 */
export const getCategoryDetail = api.getApiV1BookstoreCategoriesId

/**
 * 获取分类下的书籍
 */
export const getBooksByCategoryWithPagination = api.getApiV1BookstoreCategoriesIdBooks

// ==================== Chapters 相关 API ====================

/**
 * 获取章节详情
 */
export const getChapterDetail = api.getApiV1BookstoreChaptersId

/**
 * 获取章节内容
 */
export const getChapterContent = api.getApiV1BookstoreChaptersIdContent

/**
 * 获取下一章
 */
export const getNextChapter = api.getApiV1BookstoreChaptersIdNext

/**
 * 获取上一章
 */
export const getPreviousChapter = api.getApiV1BookstoreChaptersIdPrevious

/**
 * 获取章节价格
 */
export const getChapterPrice = api.getApiV1BookstoreChaptersIdPrice

/**
 * 搜索章节
 */
export const searchChapters = api.getApiV1BookstoreChaptersSearch

/**
 * 创建章节
 */
export const createChapter = api.postApiV1BookstoreChapters

/**
 * 更新章节
 */
export const updateChapter = api.putApiV1BookstoreChaptersId

/**
 * 删除章节
 */
export const deleteChapter = api.deleteApiV1BookstoreChaptersId

/**
 * 获取章节访问权限
 */
export const getChapterAccess = api.getApiV1BookstoreChaptersIdAccess

// ==================== Homepage 相关 API ====================

/**
 * 获取首页数据
 */
export async function getHomepage() {
  const response = await api.getApiV1BookstoreHomepage()

  if (response && typeof response === 'object') {
    const payload = response as any
    return {
      ...payload,
      recommendedBooks: normalizeBookList(payload.recommendedBooks),
      featuredBooks: normalizeBookList(payload.featuredBooks),
      newBooks: normalizeBookList(payload.newBooks),
      hotBooks: normalizeBookList(payload.hotBooks),
      completedBooks: normalizeBookList(payload.completedBooks),
    }
  }

  return response
}

// ==================== Rankings 相关 API ====================

/**
 * 获取实时榜单
 * 适配器函数：将limit参数转换为对象参数
 */
export async function getRealtimeRanking(limit?: number) {
  return api.getApiV1BookstoreRankingsRealtime({ limit })
}

/**
 * 获取周榜
 * 适配器函数：将period参数转换为对象参数
 */
export async function getWeeklyRanking(period?: string, limit?: number) {
  return api.getApiV1BookstoreRankingsWeekly({ period, limit })
}

/**
 * 获取月榜
 * 适配器函数：将period和limit参数转换为对象参数
 */
export async function getMonthlyRanking(period?: string, limit?: number) {
  return api.getApiV1BookstoreRankingsMonthly({ period, limit })
}

/**
 * 获取新人榜
 * 适配器函数：将limit参数转换为对象参数
 */
export async function getNewbieRanking(limit?: number) {
  return api.getApiV1BookstoreRankingsNewbie({ limit })
}

/**
 * 按类型获取榜单
 * 适配器函数：将period和limit参数转换为对象参数
 */
export async function getRankingByType(
  type: 'realtime' | 'weekly' | 'monthly' | 'newbie',
  period?: string,
  limit?: number
) {
  return api.getApiV1BookstoreRankingsType(type, { period, limit })
}

// ==================== 其他便捷方法 ====================

/**
 * 获取指定书籍的指定章节
 */
export const getBookChapterByNumber = api.getApiV1BookstoreBooksIdChaptersChapterNum

/**
 * 获取指定书籍的指定章节（通过ID）
 */
export const getBookChapterById = api.getApiV1BookstoreBooksIdChaptersChapterId

/**
 * 获取用户对指定书籍的评分
 */
export const getUserBookRating = api.getApiV1BookstoreRatingsUserId

/**
 * 导出原始getApi函数（高级用法）
 * 可以传入自定义axios实例
 */
export { getApi }

/**
 * 导出 bookstoreAPI 对象（兼容 index.ts 导出）
 */
export const bookstoreAPI = {
  getBanners,
  incrementBannerClick,
  getBookList,
  getBookDetail,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  searchByTitle,
  searchByAuthor,
  getBooksByStatus,
  getBooksByTags,
  getRecommendedBooks,
  getFeaturedBooks,
  getPopularBooks,
  getLatestBooks,
  getSimilarBooks,
  incrementBookView,
  getBookStatistics,
  likeBook,
  unlikeBook,
  getBookRatingDistribution,
  getBookReviews,
  rateBook,
  updateBookRating,
  deleteBookRating,
  getBookAverageRating,
  getBookChapters,
  getBookFirstChapter,
  getBookLastChapter,
  getBookFreeChapters,
  getBookPaidChapters,
  getBookPublishedChapters,
  getBookChapterStatistics,
  getBookTrialChapters,
  getBookVipChapters,
  getBooksByCategory,
  getAllCategories,
  getCategories,
  getCategoryTree,
  getCategoryDetail,
  getBooksByCategoryWithPagination,
  getChapterDetail,
  getChapterContent,
  getNextChapter,
  getPreviousChapter,
  getChapterPrice,
  searchChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  getChapterAccess,
  getHomepage,
  getRealtimeRanking,
  getWeeklyRanking,
  getMonthlyRanking,
  getNewbieRanking,
  getRankingByType,
  getBookChapterByNumber,
  getBookChapterById,
  getUserBookRating,
  getApi,
}
