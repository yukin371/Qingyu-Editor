/**
 * 书单系统类型定义
 */

/**
 * 书单
 */
export interface BookList {
  id: string
  title: string
  description: string
  cover: string
  creatorId: string
  creator: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
  books: BookListItem[]
  bookCount: number
  viewCount: number
  likeCount: number
  isLiked: boolean
  isPublic: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 书单项
 */
export interface BookListItem {
  id: string
  listId: string
  bookId: string
  book: {
    id: string
    title: string
    cover: string
    author: string
    rating: number
  }
  note?: string          // 推荐语
  order: number
  addTime: string
}

/**
 * 书单查询参数
 */
export interface BookListQuery {
  userId?: string
  tag?: string
  sort?: 'latest' | 'hottest' | 'mostBooks'
  page?: number
  size?: number
}

/**
 * 我的书单统计
 */
export interface MyBookListStats {
  created: number
  favorited: number
  totalBooks: number
}
