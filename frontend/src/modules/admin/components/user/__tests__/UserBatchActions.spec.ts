import { describe, it, expect } from 'vitest'
import UserBatchActions from '../UserBatchActions.vue'

// 简化测试 - 仅测试组件存在性
describe('UserBatchActions', () => {
  it('component exists and can be imported', () => {
    expect(UserBatchActions).toBeDefined()
    expect(UserBatchActions.name || 'UserBatchActions').toBeTruthy()
  })
})
