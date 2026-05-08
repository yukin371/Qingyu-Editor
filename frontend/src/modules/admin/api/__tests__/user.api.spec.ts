/**
 * User API 测试
 * 测试用户管理相关 API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock generated API
const mockGetApiV1AdminUsers = vi.fn()
const mockGetApiV1AdminUsersCountByStatus = vi.fn()
const mockPutApiV1AdminUsersIdStatus = vi.fn()
const mockPutApiV1AdminUsersIdRole = vi.fn()
const mockDeleteApiV1AdminUsersId = vi.fn()
const mockPostApiV1AdminUsersBatchDelete = vi.fn()
const mockPostApiV1AdminUsersBatchUpdateStatus = vi.fn()
const mockGetApiV1AdminQuotaUserId = vi.fn()
const mockPutApiV1AdminQuotaUserId = vi.fn()
const mockPostApiV1AdminQuotaUserIdSuspend = vi.fn()
const mockPostApiV1AdminQuotaUserIdActivate = vi.fn()

vi.mock('../generated/admin', () => ({
  getApi: vi.fn(() => ({
    getApiV1AdminUsers: mockGetApiV1AdminUsers,
    getApiV1AdminUsersCountByStatus: mockGetApiV1AdminUsersCountByStatus,
    putApiV1AdminUsersIdStatus: mockPutApiV1AdminUsersIdStatus,
    putApiV1AdminUsersIdRole: mockPutApiV1AdminUsersIdRole,
    deleteApiV1AdminUsersId: mockDeleteApiV1AdminUsersId,
    postApiV1AdminUsersBatchDelete: mockPostApiV1AdminUsersBatchDelete,
    postApiV1AdminUsersBatchUpdateStatus: mockPostApiV1AdminUsersBatchUpdateStatus,
    getApiV1AdminQuotaUserId: mockGetApiV1AdminQuotaUserId,
    putApiV1AdminQuotaUserId: mockPutApiV1AdminQuotaUserId,
    postApiV1AdminQuotaUserIdSuspend: mockPostApiV1AdminQuotaUserIdSuspend,
    postApiV1AdminQuotaUserIdActivate: mockPostApiV1AdminQuotaUserIdActivate,
  })),
}))

// Mock httpService
vi.mock('../shared', async () => {
  const actual = await vi.importActual('../shared')
  return {
    ...actual,
    httpService: {
      post: vi.fn().mockResolvedValue({ data: {} }),
    },
  }
})

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserList', () => {
    it('应该成功获取用户列表', async () => {
      const mockResponse = {
        users: [
          { id: '1', username: 'user1', email: 'user1@test.com' },
          { id: '2', username: 'user2', email: 'user2@test.com' },
        ],
        total: 2,
        page: 1,
        size: 20,
      }
      mockGetApiV1AdminUsers.mockResolvedValueOnce(mockResponse)

      const { getUserList } = await import('../user.api')
      const result = await getUserList({ page: 1, pageSize: 20 })

      expect(mockGetApiV1AdminUsers).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
      expect(result).toMatchObject({
        total: 2,
        page: 1,
        size: 20,
        users: [
          {
            id: '1',
            username: 'user1',
            email: 'user1@test.com',
            roles: ['reader'],
            status: 'active',
          },
          {
            id: '2',
            username: 'user2',
            email: 'user2@test.com',
            roles: ['reader'],
            status: 'active',
          },
        ],
      })
      expect(result.users).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('应该支持带筛选条件的查询', async () => {
      mockGetApiV1AdminUsers.mockResolvedValueOnce({ users: [], total: 0, page: 1, size: 20 })

      const { getUserList } = await import('../user.api')
      await getUserList({ keyword: 'test', role: 'admin', status: 'active' })

      expect(mockGetApiV1AdminUsers).toHaveBeenCalledWith({
        keyword: 'test',
        role: 'admin',
        status: 'active',
      })
    })

    it('应该支持无参数调用', async () => {
      mockGetApiV1AdminUsers.mockResolvedValueOnce({ users: [], total: 0, page: 1, size: 20 })

      const { getUserList } = await import('../user.api')
      await getUserList()

      expect(mockGetApiV1AdminUsers).toHaveBeenCalledWith(undefined)
    })

    it('应该兼容测试模式返回的旧字段结构', async () => {
      mockGetApiV1AdminUsers.mockResolvedValueOnce({
        items: [
          {
            user_id: 'user-1',
            username: 'user_1',
            email: 'user1@test.com',
            role: 'admin',
            status: 'active',
            created_at: '2026-04-20T00:00:00.000Z',
            last_login_at: '2026-04-20T01:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      })

      const { getUserList } = await import('../user.api')
      const result = await getUserList({ page: 1, pageSize: 10 })

      expect(result).toEqual({
        users: [
          {
            id: 'user-1',
            username: 'user_1',
            email: 'user1@test.com',
            phone: '',
            roles: ['admin'],
            status: 'active',
            registerTime: new Date('2026-04-20T00:00:00.000Z').getTime(),
            lastLoginTime: new Date('2026-04-20T01:00:00.000Z').getTime(),
            banReason: undefined,
            banUntil: undefined,
          },
        ],
        total: 1,
        page: 1,
        size: 10,
      })
    })
  })

  describe('getUserCountsByStatus', () => {
    it('应该成功获取用户状态统计', async () => {
      const mockCounts = { active: 100, inactive: 20, banned: 5 }
      mockGetApiV1AdminUsersCountByStatus.mockResolvedValueOnce(mockCounts)

      const { getUserCountsByStatus } = await import('../user.api')
      const result = await getUserCountsByStatus()

      expect(result).toEqual(mockCounts)
    })

    it('应该为缺失字段提供默认值', async () => {
      mockGetApiV1AdminUsersCountByStatus.mockResolvedValueOnce({ active: 3 })

      const { getUserCountsByStatus } = await import('../user.api')
      const result = await getUserCountsByStatus()

      expect(result).toEqual({ active: 3, inactive: 0, banned: 0 })
    })
  })

  describe('updateUserStatus', () => {
    it('应该成功更新用户状态', async () => {
      mockPutApiV1AdminUsersIdStatus.mockResolvedValueOnce({})

      const { updateUserStatus } = await import('../user.api')
      await updateUserStatus('user-123', { status: 'banned', reason: '违规操作' })

      expect(mockPutApiV1AdminUsersIdStatus).toHaveBeenCalledWith('user-123', {
        status: 'banned',
        reason: '违规操作',
      })
    })
  })

  describe('assignRole', () => {
    it('应该成功分配角色', async () => {
      mockPutApiV1AdminUsersIdRole.mockResolvedValueOnce({})

      const { assignRole } = await import('../user.api')
      await assignRole('user-123', { role: 'admin', reason: '晋升为管理员' })

      expect(mockPutApiV1AdminUsersIdRole).toHaveBeenCalledWith('user-123', {
        role: 'admin',
        reason: '晋升为管理员',
      })
    })
  })

  describe('deleteUser', () => {
    it('应该成功删除用户', async () => {
      mockDeleteApiV1AdminUsersId.mockResolvedValueOnce({})

      const { deleteUser } = await import('../user.api')
      await deleteUser('user-123')

      expect(mockDeleteApiV1AdminUsersId).toHaveBeenCalledWith('user-123')
    })
  })

  describe('batchDeleteUsers', () => {
    it('应该成功批量删除用户', async () => {
      mockPostApiV1AdminUsersBatchDelete.mockResolvedValueOnce({})

      const { batchDeleteUsers } = await import('../user.api')
      await batchDeleteUsers({ userIds: ['user-1', 'user-2'], reason: '批量清理' })

      expect(mockPostApiV1AdminUsersBatchDelete).toHaveBeenCalledWith({
        userIds: ['user-1', 'user-2'],
        reason: '批量清理',
      })
    })
  })

  describe('batchUpdateUserStatus', () => {
    it('应该成功批量更新用户状态', async () => {
      mockPostApiV1AdminUsersBatchUpdateStatus.mockResolvedValueOnce({})

      const { batchUpdateUserStatus } = await import('../user.api')
      await batchUpdateUserStatus({ userIds: ['user-1', 'user-2'], status: 'inactive' })

      expect(mockPostApiV1AdminUsersBatchUpdateStatus).toHaveBeenCalledWith({
        userIds: ['user-1', 'user-2'],
        status: 'inactive',
      })
    })
  })

  describe('配额管理', () => {
    it('应该成功获取用户配额详情', async () => {
      const mockQuota = { free: 100, paid: 500, trial: 50 }
      mockGetApiV1AdminQuotaUserId.mockResolvedValueOnce(mockQuota)

      const { getUserQuotaDetails } = await import('../user.api')
      const result = await getUserQuotaDetails('user-123')

      expect(mockGetApiV1AdminQuotaUserId).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockQuota)
    })

    it('应该成功更新用户配额', async () => {
      mockPutApiV1AdminQuotaUserId.mockResolvedValueOnce({})

      const { updateUserQuota } = await import('../user.api')
      await updateUserQuota('user-123', { totalQuota: 1000 })

      expect(mockPutApiV1AdminQuotaUserId).toHaveBeenCalledWith('user-123', { totalQuota: 1000 })
    })

    it('应该成功暂停用户配额', async () => {
      mockPostApiV1AdminQuotaUserIdSuspend.mockResolvedValueOnce({})

      const { suspendUserQuota } = await import('../user.api')
      await suspendUserQuota('user-123')

      expect(mockPostApiV1AdminQuotaUserIdSuspend).toHaveBeenCalledWith('user-123')
    })

    it('应该成功激活用户配额', async () => {
      mockPostApiV1AdminQuotaUserIdActivate.mockResolvedValueOnce({})

      const { activateUserQuota } = await import('../user.api')
      await activateUserQuota('user-123')

      expect(mockPostApiV1AdminQuotaUserIdActivate).toHaveBeenCalledWith('user-123')
    })
  })

  describe('updateUser 边界情况', () => {
    it('仅更新状态时应该调用状态更新接口', async () => {
      mockPutApiV1AdminUsersIdStatus.mockResolvedValueOnce({})

      const { updateUser } = await import('../user.api')
      await updateUser('user-123', { status: 'active' })

      expect(mockPutApiV1AdminUsersIdStatus).toHaveBeenCalled()
    })

    it('仅更新角色时应该调用角色分配接口', async () => {
      mockPutApiV1AdminUsersIdRole.mockResolvedValueOnce({})

      const { updateUser } = await import('../user.api')
      await updateUser('user-123', { roles: ['admin'] })

      expect(mockPutApiV1AdminUsersIdRole).toHaveBeenCalled()
    })

    it('同时更新多个字段时应该抛出错误', async () => {
      const { updateUser } = await import('../user.api')

      await expect(updateUser('user-123', { status: 'active', roles: ['admin'] })).rejects.toThrow(
        'updateUser: 当前仅支持更新 status 或 roles 单个字段',
      )
    })
  })
})
