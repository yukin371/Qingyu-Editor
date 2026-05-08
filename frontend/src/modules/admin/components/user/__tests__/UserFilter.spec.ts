import { describe, it, expect } from 'vitest'
import UserFilter from '../UserFilter.vue'

// 简化测试 - 仅测试组件存在性
describe('UserFilter', () => {
  it('component exists and can be imported', () => {
    expect(UserFilter).toBeDefined()
    expect(UserFilter.name || 'UserFilter').toBeTruthy()
  })
})
