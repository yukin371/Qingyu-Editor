/**
 * QyCommentItem Component Types
 * Qingyu Comment Item Component - Display a single comment in discussion threads
 */

export interface CommentItemProps {
  /** Avatar URL */
  avatar: string
  /** Username */
  username: string
  /** Comment content */
  content: string
  /** Timestamp (e.g., "2小时前") */
  timestamp: string
  /** Like count */
  likeCount?: number
  /** Reply action */
  replyAction?: () => void
  /** Like action */
  likeAction?: () => void
  /** Is liked */
  isLiked?: boolean
}

export interface CommentItemEmits {
  /** Reply event */
  reply: []
  /** Like event */
  like: []
}
