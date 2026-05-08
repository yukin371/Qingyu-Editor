// 直接定义类型，避免路径解析问题

export interface ChapterParagraph {
  id: string
  paragraphOrder: number
  content: string
  format?: string
  wordCount?: number
}

export interface UserBrief {
  id: string
  username: string
  nickname: string
  avatar: string
  level?: number
}

export interface Comment {
  id: string
  bookId: string
  chapterId?: string
  userId: string
  user: UserBrief
  content: string
  rating?: number
  likeCount: number
  isLiked: boolean
  replyCount: number
  parentId?: string
  replies?: Comment[]
  createdAt: string
  updatedAt?: string
  createTime?: string
}

export interface ParagraphComment {
  id: string
  paragraphId: string
  chapterId: string
  paragraphIndex: number
  userId: string
  username: string
  avatar: string
  content?: string
  emoji?: string
  likes: number
  likedByMe: boolean
  replyToCommentId?: string
  replyToUsername?: string
  createdAt: string
  updatedAt: string
}

export interface ParagraphCommentSummary {
  paragraphId: string
  commentCount: number
  latestComment?: {
    content: string
    username: string
    time: string
  }
}
