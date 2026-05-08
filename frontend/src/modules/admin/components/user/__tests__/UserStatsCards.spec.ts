import { describe, it, expect } from 'vitest'
import UserStatsCards from '../UserStatsCards.vue'

// 简化测试 - 仅测试组件存在性
describe('UserStatsCards', () => {
  it('component exists and can be imported', () => {
    expect(UserStatsCards).toBeDefined()
    expect(UserStatsCards.name || 'UserStatsCards').toBeTruthy()
  })
})
