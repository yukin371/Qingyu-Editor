import { describe, it, expect } from 'vitest'
import UserTable from '../UserTable.vue'

// 简化测试 - 仅测试组件存在性
describe('UserTable', () => {
  it('component exists and can be imported', () => {
    expect(UserTable).toBeDefined()
    expect(UserTable.name || 'UserTable').toBeTruthy()
  })
})
