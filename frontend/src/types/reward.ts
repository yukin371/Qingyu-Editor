/**
 * 打赏系统类型定义
 */

/**
 * 打赏记录
 */
export interface Reward {
  id: string
  fromUserId: string
  fromUser: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
  toUserId: string
  toUser: {
    id: string
    username: string
    nickname: string
  }
  bookId?: string
  book?: {
    id: string
    title: string
    cover: string
  }
  chapterId?: string
  chapterTitle?: string
  amount: number
  message?: string
  isAnonymous: boolean
  createdAt: string
}

/**
 * 打赏排行
 */
export interface RewardRanking {
  userId: string
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
  totalAmount: number
  rewardCount: number
  rank: number
}

/**
 * 打赏统计
 */
export interface RewardStats {
  totalReceived: number
  totalGiven: number
  rewardCount: number
  monthlyIncome: number
}
