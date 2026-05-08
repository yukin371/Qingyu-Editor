/**
 * 成就系统类型定义
 */

/**
 * 成就类型
 */
export type AchievementType = 'reading' | 'writing' | 'social' | 'special'

/**
 * 成就等级
 */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

/**
 * 成就
 */
export interface Achievement {
  id: string
  type: AchievementType
  tier: AchievementTier
  name: string
  description: string
  icon: string
  condition: AchievementCondition
  reward: AchievementReward
  progress: number
  maxProgress: number
  isUnlocked: boolean
  unlockedAt?: string
}

/**
 * 成就条件
 */
export interface AchievementCondition {
  type: string
  target: number
  current: number
  description: string
}

/**
 * 成就奖励
 */
export interface AchievementReward {
  type: 'exp' | 'coins' | 'badge' | 'title'
  amount?: number
  item?: string
  name: string
  description: string
}

/**
 * 用户成就
 */
export interface UserAchievement {
  userId: string
  achievementId: string
  achievement: Achievement
  unlockedAt: string
  progress: number
}

/**
 * 等级信息
 */
export interface LevelInfo {
  level: number
  currentExp: number
  maxExp: number
  totalExp: number
  nextLevelExp: number
  percentage: number
  achievementsUnlocked: number
  totalAchievements: number
}
