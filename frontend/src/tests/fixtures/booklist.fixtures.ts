/**
 * Booklist模块测试fixtures
 * 提供booklist模块的mock数据
 */

import { nanoid } from 'nanoid'

/**
 * 书单mock数据
 */
export const mockBooklist = {
  id: 'booklist_1234567890',
  title: '我的推荐书单',
  description: '这是我精心挑选的好书推荐',
  coverImage: 'https://example.com/booklist-cover.jpg',
  creatorId: 'user_1234567890',
  creatorName: '测试用户',
  creatorAvatar: 'https://example.com/avatar.jpg',
  books: [],
  booksCount: 0,
  followersCount: 50,
  isPublic: true,
  tags: ['玄幻', '仙侠'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/**
 * 创建书单mock数据
 * @param overrides 覆盖字段
 */
export const createMockBooklist = (overrides: Partial<typeof mockBooklist> = {}) => {
  return {
    ...mockBooklist,
    id: nanoid(),
    creatorId: nanoid(),
    ...overrides,
  }
}

/**
 * 书单列表mock数据
 */
export const mockBooklists = [
  createMockBooklist({ title: '玄幻小说推荐', booksCount: 10 }),
  createMockBooklist({ title: '经典武侠精选', booksCount: 15 }),
  createMockBooklist({ title: '都市爽文合集', booksCount: 20 }),
]

/**
 * 创建书单列表mock数据
 * @param count 书单数量
 */
export const createMockBooklists = (count: number = 10): typeof mockBooklists => {
  return Array.from({ length: count }, (_, index) =>
    createMockBooklist({
      title: `书单${index + 1}`,
      booksCount: index * 5 + 1,
    })
  )
}

/**
 * 书单创建参数mock数据
 */
export const mockBooklistCreateParams = {
  title: '新书单',
  description: '这是一个新书单',
  coverImage: 'https://example.com/cover.jpg',
  isPublic: true,
  tags: ['玄幻'],
}

/**
 * 书单更新参数mock数据
 */
export const mockBooklistUpdateParams = {
  title: '更新后的书单标题',
  description: '更新后的书单描述',
  isPublic: false,
  tags: ['仙侠', '都市'],
}

/**
 * 书单筛选参数mock数据
 */
export const mockBooklistFilterParams = {
  keyword: '玄幻',
  tags: ['玄幻', '仙侠'],
  sortBy: 'latest',
  sortOrder: 'desc',
}

/**
 * 书单书籍项mock数据
 */
export const mockBooklistBookItem = {
  bookId: 'book_1234567890',
  bookTitle: '测试书籍',
  bookAuthor: '测试作者',
  bookCover: 'https://example.com/book-cover.jpg',
  bookDescription: '这是一本好书',
  addedAt: '2024-01-01T00:00:00Z',
  note: '我的推荐理由',
}

/**
 * 创建书单书籍项mock数据
 * @param overrides 覆盖字段
 */
export const createMockBooklistBookItem = (overrides: Partial<typeof mockBooklistBookItem> = {}) => {
  return {
    ...mockBooklistBookItem,
    bookId: nanoid(),
    ...overrides,
  }
}

/**
 * 书单书籍列表mock数据
 */
export const mockBooklistBooks = [
  createMockBooklistBookItem({ bookTitle: '书籍1' }),
  createMockBooklistBookItem({ bookTitle: '书籍2' }),
  createMockBooklistBookItem({ bookTitle: '书籍3' }),
]

/**
 * 创建书单书籍列表mock数据
 * @param count 书籍数量
 */
export const createMockBooklistBooks = (count: number = 10): typeof mockBooklistBooks => {
  return Array.from({ length: count }, (_, index) =>
    createMockBooklistBookItem({
      bookTitle: `书籍${index + 1}`,
    })
  )
}

/**
 * 书单统计mock数据
 */
export const mockBooklistStats = {
  totalBooklists: 100,
  myBooklists: 10,
  followedBooklists: 20,
  totalBooks: 500,
}

/**
 * 创建书单统计mock数据
 * @param overrides 覆盖字段
 */
export const createMockBooklistStats = (overrides: Partial<typeof mockBooklistStats> = {}) => {
  return {
    ...mockBooklistStats,
    ...overrides,
  }
}
