/**
 * 通用测试fixtures
 * 提供跨模块的通用mock数据
 */

import { nanoid } from 'nanoid'

/**
 * 用户mock数据
 */
export const mockUser = {
  id: 'user_1234567890',
  username: 'testuser',
  nickname: '测试用户',
  avatar: 'https://example.com/avatar.jpg',
  email: 'test@example.com',
  bio: '这是一个测试用户',
  followersCount: 100,
  followingCount: 50,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/**
 * 创建用户mock数据
 * @param overrides 覆盖字段
 */
export const createMockUser = (overrides: Partial<typeof mockUser> = {}) => {
  return {
    ...mockUser,
    id: nanoid(),
    ...overrides,
  }
}

/**
 * 分页参数mock数据
 */
export const mockPaginationParams = {
  page: 1,
  pageSize: 10,
}

/**
 * 创建分页参数mock数据
 * @param page 页码
 * @param pageSize 每页大小
 */
export const createMockPaginationParams = (page: number = 1, pageSize: number = 10) => {
  return { page, pageSize }
}

/**
 * 分页响应mock数据
 */
export const mockPaginationResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
}

/**
 * 创建分页响应mock数据
 * @param items 数据项
 * @param page 当前页
 * @param pageSize 每页大小
 * @param total 总数 (可选)
 */
export const createMockPaginationResponse = <T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10,
  total?: number
) => {
  const actualTotal = total ?? items.length
  return {
    items,
    total: actualTotal,
    page,
    pageSize,
    totalPages: Math.ceil(actualTotal / pageSize),
  }
}

/**
 * API成功响应mock
 */
export const mockApiSuccessResponse = {
  code: 0,
  message: 'success',
  data: null,
  timestamp: Date.now(),
}

/**
 * 创建API成功响应mock
 * @param data 响应数据
 */
export const createMockApiSuccessResponse = <T>(data: T) => {
  return {
    ...mockApiSuccessResponse,
    data,
    timestamp: Date.now(),
  }
}

/**
 * API错误响应mock
 */
export const mockApiErrorResponse = {
  code: -1,
  message: 'error',
  data: null,
  timestamp: Date.now(),
}

/**
 * 创建API错误响应mock
 * @param message 错误消息
 * @param code 错误代码
 */
export const createMockApiErrorResponse = (message: string, code: number = -1) => {
  return {
    code,
    message,
    data: null,
    timestamp: Date.now(),
  }
}

/**
 * 常用标签mock数据
 */
export const mockTags = [
  '玄幻',
  '仙侠',
  '都市',
  '历史',
  '科幻',
  '游戏',
  '军事',
  '悬疑',
  '武侠',
  '奇幻',
]

/**
 * 创建标签mock数据
 * @param count 标签数量
 */
export const createMockTags = (count: number = 5): string[] => {
  return mockTags.slice(0, count)
}

/**
 * 时间格式化函数
 * @param date 日期
 */
export const formatDate = (date: Date): string => {
  return date.toISOString()
}

/**
 * 创建日期mock数据
 * @param daysOffset 天数偏移 (默认0)
 */
export const createMockDate = (daysOffset: number = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return formatDate(date)
}
