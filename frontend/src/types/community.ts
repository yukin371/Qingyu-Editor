/**
 * 社区/动态系统类型定义
 */

/**
 * 动态类型
 */
export type PostType = 'text' | 'image' | 'book_recommendation' | 'reading_progress' | 'poll'

/**
 * 动态
 */
export interface Post {
  id: string
  userId: string
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
    level: number
  }
  type: PostType
  content: string
  images?: string[]
  book?: {
    bookId: string
    title: string
    cover: string
    author: string
  }
  readingProgress?: {
    bookId: string
    chapterId: string
    chapterTitle: string
    progress: number
  }
  topics: string[]
  likeCount: number
  commentCount: number
  shareCount: number
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 评论
 */
export interface PostComment {
  id: string
  postId: string
  userId: string
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
  content: string
  replyTo?: string
  replyToUser?: {
    id: string
    username: string
  }
  likeCount: number
  isLiked: boolean
  createdAt: string
}

/**
 * 话题
 */
export interface Topic {
  id: string
  name: string
  description: string
  cover: string
  postCount: number
  followerCount: number
  isFollowing: boolean
}

/**
 * 动态查询参数
 */
export interface PostQuery {
  type?: PostType
  topic?: string
  sort?: 'latest' | 'hottest'
  page?: number
  size?: number
}
