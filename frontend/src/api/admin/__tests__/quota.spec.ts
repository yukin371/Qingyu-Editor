import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()
const mockRequestUse = vi.fn()
const mockResponseUse = vi.fn()

const mockApiClient = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: {
      use: mockRequestUse,
    },
    response: {
      use: mockResponseUse,
    },
  },
}

const createLocalStorageMock = () => {
  const store = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(() => {
      store.clear()
    }),
  }
}

vi.mock('@/core/services/http.service', () => {
  return {
    default: mockApiClient,
    apiClient: mockApiClient,
    httpService: mockApiClient,
  }
})

describe('quota admin api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.stubGlobal('localStorage', createLocalStorageMock())
    localStorage.clear()
  })

  it('应该解析仪表板 envelope 数据', async () => {
    const dashboard = {
      summary: {
        totalUsers: 100,
        activeUsers: 80,
        exhaustedUsers: 3,
        nearExhaustUsers: 8,
        suspendedUsers: 2,
        totalConsumption: 2048,
        avgConsumption: 25.6,
      },
      distribution: {
        byRole: { writer: 60, reader: 40 },
        byLevel: { normal: 70, vip_monthly: 30 },
        byService: { chat: 1200, rewrite: 848 },
        byStatus: { active: 80, suspended: 2 },
      },
      topConsumers: [],
      recentAlerts: [],
      trendData: [],
    }
    mockGet.mockResolvedValueOnce({
      code: 0,
      message: 'ok',
      data: dashboard,
    })

    const { getQuotaDashboard } = await import('../quota')
    const result = await getQuotaDashboard()

    expect(mockGet).toHaveBeenCalledWith('/admin/quota/dashboard', { preserveEnvelope: true })
    expect(result).toEqual(dashboard)
  })

  it('应该解析分页用户列表数据', async () => {
    const items = [
      {
        userId: 'user-1',
        username: 'alice',
        role: 'writer',
        memberLevel: 'vip_monthly',
        dailyQuota: 10000,
        dailyUsed: 2300,
        usagePercent: 23,
        status: 'active',
      },
    ]
    mockGet.mockResolvedValueOnce({
      code: 0,
      message: 'ok',
      data: items,
      total: 12,
      page: 2,
      size: 50,
    })

    const { listQuotaUsers } = await import('../quota')
    const result = await listQuotaUsers({ page: 2, limit: 50, role: 'writer' })

    expect(mockGet).toHaveBeenCalledWith('/admin/quota/users', {
      params: { page: 2, limit: 50, role: 'writer' },
      preserveEnvelope: true,
    })
    expect(result).toEqual({
      items,
      total: 12,
      page: 2,
      size: 50,
    })
  })

  it('应该把对象形态的用户详情归一化为数组', async () => {
    mockGet.mockResolvedValueOnce({
      code: 0,
      message: 'ok',
      data: {
        daily: {
          userId: 'user-1',
          quotaType: 'daily',
          totalQuota: 1000,
          usedQuota: 200,
          remainingQuota: 800,
          status: 'active',
        },
        monthly: {
          userId: 'user-1',
          quotaType: 'monthly',
          totalQuota: 10000,
          usedQuota: 1200,
          remainingQuota: 8800,
          status: 'active',
        },
      },
    })

    const { getQuotaUserDetails } = await import('../quota')
    const result = await getQuotaUserDetails('user-1')

    expect(mockGet).toHaveBeenCalledWith('/admin/quota/users/user-1', { preserveEnvelope: true })
    expect(result).toEqual([
      {
        userId: 'user-1',
        quotaType: 'daily',
        totalQuota: 1000,
        usedQuota: 200,
        remainingQuota: 800,
        status: 'active',
      },
      {
        userId: 'user-1',
        quotaType: 'monthly',
        totalQuota: 10000,
        usedQuota: 1200,
        remainingQuota: 8800,
        status: 'active',
      },
    ])
  })

  it('应该通过全局 apiClient 保留 envelope 响应', async () => {
    mockGet.mockResolvedValueOnce({
      code: 0,
      message: 'ok',
      data: {
        summary: {
          totalUsers: 1,
          activeUsers: 1,
          exhaustedUsers: 0,
          nearExhaustUsers: 0,
          suspendedUsers: 0,
          totalConsumption: 20,
          avgConsumption: 20,
        },
        distribution: {
          byRole: { reader: 1 },
          byLevel: { normal: 1 },
          byService: { chat: 20 },
          byStatus: { active: 1 },
        },
        topConsumers: [],
        recentAlerts: [],
        trendData: [],
      },
    })

    const { getQuotaDashboard } = await import('../quota')
    await getQuotaDashboard()

    expect(mockGet).toHaveBeenCalledWith('/admin/quota/dashboard', { preserveEnvelope: true })
  })

  it('应该请求聚合对账摘要接口并透传查询参数', async () => {
    const reconciliation = {
      timeRange: 'week',
      groupBy: 'workflow',
      page: 1,
      pageSize: 5,
      totalGroups: 2,
      backendTotalTokens: 1200,
      backendTotalRecords: 18,
      aiServiceTotalTokens: 1100,
      aiServiceTotalRecords: 17,
      differenceTokens: 100,
      differenceRatio: 0.0833,
      alertLevel: 'info',
      shouldAlert: false,
      checkedAt: '2026-04-24T10:00:00Z',
      items: [],
    }
    mockGet.mockResolvedValueOnce({
      code: 0,
      message: 'ok',
      data: reconciliation,
    })

    const { getQuotaReconciliationSummary } = await import('../quota')
    const result = await getQuotaReconciliationSummary({
      timeRange: 'week',
      groupBy: 'workflow',
      page: 1,
      pageSize: 5,
    })

    expect(mockGet).toHaveBeenCalledWith('/admin/quota/statistics/reconciliation', {
      params: {
        timeRange: 'week',
        groupBy: 'workflow',
        page: 1,
        pageSize: 5,
      },
      preserveEnvelope: true,
    })
    expect(result).toEqual(reconciliation)
  })

  it('应该在未传状态时由前端 helper 默认请求 open 告警', async () => {
    const items = [
      {
        id: 'alert-001',
        type: 'consistency',
        level: 'warning',
        title: 'test',
        message: 'test',
        status: 'pending',
        createdAt: '2026-04-24T10:00:00Z',
      },
    ]
    mockGet.mockResolvedValueOnce({
      code: 200,
      message: '获取成功',
      data: items,
      total: 1,
      page: 1,
      size: 20,
    })

    const { listQuotaAlerts } = await import('../quota')
    const result = await listQuotaAlerts()

    expect(mockGet).toHaveBeenCalledWith('/admin/quota/alerts', {
      params: { status: 'open' },
      preserveEnvelope: true,
    })
    expect(result.items).toEqual(items)
  })

  it('应该调用手动一致性检查接口', async () => {
    mockPost.mockResolvedValueOnce({
      code: 0,
      message: 'ok',
      data: null,
    })

    const { runQuotaConsistencyCheck } = await import('../quota')
    await runQuotaConsistencyCheck()

    expect(mockPost).toHaveBeenCalledWith(
      '/admin/quota/statistics/reconciliation/check',
      undefined,
      { preserveEnvelope: true },
    )
  })

  it('应该在 mock 模式下把 open 状态视为未关闭预警', async () => {
    localStorage.setItem('qingyu_token', 'mock-token')

    const { listQuotaAlerts } = await import('../quota')
    const result = await listQuotaAlerts({ status: 'open', page: 1, limit: 10 })

    expect(mockGet).not.toHaveBeenCalled()
    expect(result.total).toBe(2)
    expect(result.items.map((item) => item.id)).toEqual(['alert-001', 'alert-002'])
    expect(result.items.every((item) => ['pending', 'acknowledged'].includes(item.status))).toBe(
      true,
    )
  })

  it('应该在 mock 模式下支持 all 状态查看完整历史', async () => {
    localStorage.setItem('qingyu_token', 'mock-token')

    const { listQuotaAlerts } = await import('../quota')
    const result = await listQuotaAlerts({ status: 'all', page: 1, limit: 10 })

    expect(result.total).toBe(3)
    expect(result.items.map((item) => item.id)).toEqual(['alert-001', 'alert-002', 'alert-003'])
  })
})
