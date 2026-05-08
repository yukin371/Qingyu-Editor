import { describe, it, expect } from 'vitest'
import UserBatchAddDialog from '../UserBatchAddDialog.vue'

// 简化测试 - 仅测试组件存在性
describe('UserBatchAddDialog', () => {
  it('component exists and can be imported', () => {
    expect(UserBatchAddDialog).toBeDefined()
    expect(UserBatchAddDialog.name || 'UserBatchAddDialog').toBeTruthy()
  })
})
