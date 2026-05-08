/**
 * 社交功能类型定义
 */

/**
 * 关注关系
 */
export interface Follow {
  id: string
  followerId: string      // 关注者ID
  followingId: string     // 被关注者ID
  followTime: string      // 关注时间
  isMutual: boolean       // 是否互相关注
}

/**
 * 关注统计
 */
export interface FollowStats {
  followersCount: number     // 粉丝数
  followingCount: number     // 关注数
  mutualFollowCount: number  // 互关数
}

/**
 * 用户简要信息（增强版）
 */
export interface UserBrief {
  id: string
  username: string
  nickname: string
  avatar: string
  level: number
  bio?: string
  followerCount?: number
  followingCount?: number
  isFollowing?: boolean      // 当前用户是否关注
  isFollower?: boolean        // 是否关注当前用户
  isMutualFollow?: boolean    // 是否互相关注
}

/**
 * 关注列表项
 */
export interface FollowListItem {
  id: string
  user: UserBrief
  followTime: string
  isMutual: boolean
  latestWork?: {
    // 最新作品信息（如果是作者）
    bookId: string
    bookTitle: string
    bookCover: string
  }
}

/**
 * 关注查询参数
 */
export interface FollowQuery {
  type?: 'followers' | 'following' | 'mutual'
  page?: number
  size?: number
  keyword?: string
}

/**
 * 关注结果（分页）
 */
export interface FollowListResult {
  list: FollowListItem[]
  total: number
  page: number
  size: number
}

/**
 * 用户动态类型
 */
export type UserActivityType =
  | 'publish_book'        // 发布作品
  | 'update_chapter'      // 更新章节
  | 'write_review'        // 写书评
  | 'create_booklist'     // 创建书单
  | 'follow_user'         // 关注用户
  | 'like_review'         // 点赞书评

/**
 * 用户动态
 */
export interface UserActivity {
  id: string
  userId: string
  user: UserBrief
  type: UserActivityType
  content: string
  relatedId?: string      // 关联的内容ID
  createdAt: string
}
