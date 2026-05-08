/**
 * useBusinessMock Composable
 * 
 * 专为业务页面设计的 Mock 数据工具
 * 
 * 功能：
 * 1. 根据 ?test=true 参数自动加载对应模块的 Mock 数据
 * 2. 提供模拟 API 延迟的异步方法
 * 3. 支持分页、筛选等常见业务场景
 * 4. 与真实 API 接口保持一致的数据结构
 * 
 * @example
 * ```ts
 * const { getHomepageData, isTestMode } = useBusinessMock()
 * 
 * if (isTestMode.value) {
 *   const data = await getHomepageData()
 *   // 使用 mock 数据
 * }
 * ```
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 导入业务模块 Mock 数据
import businessMockData from '@/views/demo/business-mock-data'

// ==================== 类型定义 ====================

interface PaginationOptions {
  page: number
  pageSize: number
}

interface FilterOptions {
  category?: string
  status?: string
  sortBy?: string
  keyword?: string
}

interface ApiResult<T> {
  code: number
  message: string
  data: T
}

interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ==================== 工具函数 ====================

/**
 * 模拟 API 延迟
 */
function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟随机失败（用于测试错误处理）
 */
function randomFailure(failureRate = 0.05): never | void {
  if (Math.random() < failureRate) {
    throw new Error('模拟 API 请求失败')
  }
}

// ==================== useBusinessMock Composable ====================

export function useBusinessMock() {
  const route = useRoute()

  // 检测是否处于测试模式
  const isTestMode = computed(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const routeQuery = route.query.test as string | undefined
    return (urlParams.get('test') === 'true' || routeQuery === 'true')
  })

  // ==================== 书城模块 API ====================

  /**
   * 获取首页数据
   */
  const getHomepageData = async (): Promise<ApiResult<{
    banners: typeof businessMockData.homepageBanners
    stats: typeof businessMockData.homepageStats
    recommended: typeof businessMockData.recommendedBooks
    rankings: typeof businessMockData.rankings
  }>> => {
    await delay(300)
    randomFailure(0.01)

    return {
      code: 200,
      message: 'success',
      data: {
        banners: businessMockData.homepageBanners,
        stats: businessMockData.homepageStats,
        recommended: businessMockData.recommendedBooks.slice(0, 8),
        rankings: businessMockData.rankings
      }
    }
  }

  /**
   * 获取书籍列表（支持分页和筛选）
   */
  const getBooksList = async (
    options: PaginationOptions & FilterOptions
  ): Promise<ApiResult<PaginatedResult<typeof businessMockData.recommendedBooks[0]>>> => {
    await delay(400)

    let books = [...businessMockData.recommendedBooks]

    // 应用筛选
    if (options.category) {
      books = books.filter(book => book.categoryName === options.category)
    }

    if (options.keyword) {
      const keyword = options.keyword.toLowerCase()
      books = books.filter(book =>
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword)
      )
    }

    // 应用排序
    if (options.sortBy === 'rating') {
      books.sort((a, b) => b.rating - a.rating)
    } else if (options.sortBy === 'viewCount') {
      books.sort((a, b) => b.viewCount - a.viewCount)
    } else if (options.sortBy === 'wordCount') {
      books.sort((a, b) => b.wordCount - a.wordCount)
    }

    // 应用分页
    const total = books.length
    const start = (options.page - 1) * options.pageSize
    const end = start + options.pageSize
    const list = books.slice(start, end)

    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total,
        page: options.page,
        pageSize: options.pageSize,
        hasMore: end < total
      }
    }
  }

  /**
   * 获取书籍详情
   */
  const getBookDetail = async (bookId: string): Promise<ApiResult<typeof businessMockData.recommendedBooks[0] & {
    chapters: typeof businessMockData.bookChapters
    comments: typeof businessMockData.userBookshelf
  }>> => {
    await delay(300)

    const book = businessMockData.recommendedBooks.find(b => b.id === bookId)
    if (!book) {
      throw new Error('书籍不存在')
    }

    return {
      code: 200,
      message: 'success',
      data: {
        ...book,
        chapters: businessMockData.bookChapters.slice(0, 10),
        comments: businessMockData.userBookshelf
      }
    }
  }

  /**
   * 获取书籍章节列表
   */
  const getBookChapters = async (
    _bookId: string,
    options: PaginationOptions
  ): Promise<ApiResult<PaginatedResult<typeof businessMockData.bookChapters[0]>>> => {
    await delay(200)

    const start = (options.page - 1) * options.pageSize
    const end = start + options.pageSize
    const list = businessMockData.bookChapters.slice(start, end)

    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: businessMockData.bookChapters.length,
        page: options.page,
        pageSize: options.pageSize,
        hasMore: end < businessMockData.bookChapters.length
      }
    }
  }

  /**
   * 获取榜单数据
   */
  const getRankings = async (
    type: 'realtime' | 'weekly' | 'monthly' | 'newbie'
  ): Promise<ApiResult<typeof businessMockData.rankings[typeof type]>> => {
    await delay(300)

    return {
      code: 200,
      message: 'success',
      data: businessMockData.rankings[type]
    }
  }

  // ==================== 创作中心 API ====================

  /**
   * 获取写作项目列表
   */
  const getWriterProjects = async (): Promise<ApiResult<typeof businessMockData.writerProjects>> => {
    await delay(300)

    return {
      code: 200,
      message: 'success',
      data: businessMockData.writerProjects
    }
  }

  /**
   * 获取项目详情
   */
  const getProjectDetail = async (
    projectId: string
  ): Promise<ApiResult<typeof businessMockData.writerProjects[0]>> => {
    await delay(200)

    const project = businessMockData.writerProjects.find(p => p.projectId === projectId)
    if (!project) {
      throw new Error('项目不存在')
    }

    return {
      code: 200,
      message: 'success',
      data: project
    }
  }

  // ==================== 社区模块 API ====================

  /**
   * 获取社区帖子列表
   */
  const getCommunityPosts = async (
    options: PaginationOptions & FilterOptions
  ): Promise<ApiResult<PaginatedResult<typeof businessMockData.communityPosts[0]>>> => {
    await delay(400)

    let posts = [...businessMockData.communityPosts]

    // 应用筛选
    if (options.keyword) {
      const keyword = options.keyword.toLowerCase()
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword)
      )
    }

    if (options.category) {
      posts = posts.filter(post => post.tags.includes(options.category as string))
    }

    // 应用分页
    const total = posts.length
    const start = (options.page - 1) * options.pageSize
    const end = start + options.pageSize
    const list = posts.slice(start, end)

    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total,
        page: options.page,
        pageSize: options.pageSize,
        hasMore: end < total
      }
    }
  }

  // ==================== 用户中心 API ====================

  /**
   * 获取用户信息
   */
  const getUserProfile = async (): Promise<ApiResult<typeof businessMockData.userProfile>> => {
    await delay(200)

    return {
      code: 200,
      message: 'success',
      data: businessMockData.userProfile
    }
  }

  /**
   * 获取用户书架
   */
  const getUserBookshelf = async (): Promise<ApiResult<typeof businessMockData.userBookshelf>> => {
    await delay(300)

    return {
      code: 200,
      message: 'success',
      data: businessMockData.userBookshelf
    }
  }

  /**
   * 获取用户钱包信息
   */
  const getUserWallet = async (): Promise<ApiResult<typeof businessMockData.userWallet>> => {
    await delay(200)

    return {
      code: 200,
      message: 'success',
      data: businessMockData.userWallet
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 统一的数据获取方法
   * 根据 module 和 action 自动调用对应的方法
   */
  const fetchMockData = async (
    module: string,
    action: string,
    params?: any
  ): Promise<any> => {
    const moduleMap: Record<string, Record<string, Function>> = {
      bookstore: {
        homepage: getHomepageData,
        books: getBooksList,
        bookDetail: getBookDetail,
        chapters: getBookChapters,
        rankings: getRankings
      },
      writer: {
        projects: getWriterProjects,
        projectDetail: getProjectDetail
      },
      community: {
        posts: getCommunityPosts
      },
      user: {
        profile: getUserProfile,
        bookshelf: getUserBookshelf,
        wallet: getUserWallet
      }
    }

    const moduleActions = moduleMap[module]
    if (!moduleActions) {
      throw new Error(`Unknown module: ${module}`)
    }

    const actionFunc = moduleActions[action]
    if (!actionFunc) {
      throw new Error(`Unknown action: ${action} in module ${module}`)
    }

    return await actionFunc(params)
  }

  return {
    // 状态
    isTestMode,

    // 书城模块
    getHomepageData,
    getBooksList,
    getBookDetail,
    getBookChapters,
    getRankings,

    // 创作中心
    getWriterProjects,
    getProjectDetail,

    // 社区模块
    getCommunityPosts,

    // 用户中心
    getUserProfile,
    getUserBookshelf,
    getUserWallet,

    // 通用方法
    fetchMockData
  }
}

// ==================== 导出便捷函数 ====================

/**
 * 检查当前是否在测试模式
 */
export function isInTestMode(): boolean {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('test') === 'true'
}

/**
 * 获取测试模式的 URL
 */
export function getTestModeUrl(path: string): string {
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}test=true`
}
