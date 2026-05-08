/**
 * QyUserCard Component Types
 * Qingyu User Card Component - Display user information in social contexts
 */

export interface UserCardProps {
  /** Avatar URL */
  avatar: string
  /** Username */
  username: string
  /** Short bio */
  bio?: string
  /** Follower count */
  followerCount?: number
  /** Following count */
  followingCount?: number
  /** User level */
  level?: number
  /** Click action */
  clickAction?: () => void
  /** Follow action */
  followAction?: () => void
}

export interface UserCardEmits {
  /** Click event */
  click: [event: MouseEvent]
  /** Follow event */
  follow: []
}
