/**
 * 发现/推荐系统类型定义
 */

/**
 * 推荐位类型
 */
export type RecommendationSlot = 'banner' | 'featured' | 'new_releases' | 'editors_pick'

/**
 * 推荐内容
 */
export interface RecommendationItem {
  id: string
  type: 'book' | 'booklist' | 'author' | 'topic'
  slot: RecommendationSlot
  title: string
  description: string
  cover: string
  link: string
  priority: number
  startTime: string
  endTime: string
}

/**
 * 推荐配置
 */
export interface RecommendationConfig {
  userId: string
  preferences: {
    favoriteGenres: string[]
    favoriteAuthors: string[]
    favoriteTags: string[]
  }
  history: {
    viewedBooks: string[]
    viewedLists: string[]
  }
}

/**
 * 个性化推荐结果
 */
export interface PersonalizedRecommendations {
  books: {
    forYou: BookBrief[]
    similar: BookBrief[]
    trending: BookBrief[]
  }
  booklists: {
    recommended: BookListBrief[]
    popular: BookListBrief[]
  }
  authors: {
    suggested: AuthorBrief[]
  }
}

/**
 * 简要书籍信息
 */
interface BookBrief {
  id: string
  title: string
  cover: string
  author: string
  rating: number
  description: string
  tags: string[]
}

/**
 * 简要书单信息
 */
interface BookListBrief {
  id: string
  title: string
  cover: string
  bookCount: number
  likeCount: number
  creator: {
    id: string
    nickname: string
  }
}

/**
 * 简要作者信息
 */
interface AuthorBrief {
  id: string
  username: string
  nickname: string
  avatar: string
  followerCount: number
  bookCount: number
}
