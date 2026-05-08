import { apiClient } from '@/core/services/http.service'

type Envelope<T> = {
  code: number
  message: string
  data: T
  total?: number
  page?: number
  size?: number
}

export type QuotaSummary = {
  totalUsers: number
  activeUsers: number
  exhaustedUsers: number
  nearExhaustUsers: number
  suspendedUsers: number
  totalConsumption: number
  avgConsumption: number
}

export type QuotaDistribution = {
  byRole: Record<string, number>
  byLevel: Record<string, number>
  byService: Record<string, number>
  byStatus: Record<string, number>
}

export type QuotaTrendPoint = {
  date: string
  consumption: number
  users: number
}

export type QuotaTopConsumer = {
  userId: string
  username: string
  role: string
  usedQuota: number
  totalQuota: number
  usagePercent: number
}

export type QuotaAlertSummary = {
  id: string
  type: string
  level: string
  title: string
  userId?: string
  status: string
  createdAt: string
}

export type QuotaDashboard = {
  summary: QuotaSummary
  distribution: QuotaDistribution
  topConsumers: QuotaTopConsumer[]
  recentAlerts: QuotaAlertSummary[]
  trendData: QuotaTrendPoint[]
}

export type QuotaListItem = {
  userId: string
  username: string
  role: string
  memberLevel: string
  dailyQuota: number
  dailyUsed: number
  usagePercent: number
  status: string
}

export type UserQuotaDetail = {
  id?: string
  userId: string
  quotaType: string
  totalQuota: number
  usedQuota: number
  remainingQuota: number
  status: string
  resetAt?: string
}

export type QuotaPolicy = {
  id: string
  name: string
  userRole: string
  membershipLevel: string
  dailyQuota: number
  monthlyQuota: number
  totalQuota: number
  isDefault: boolean
  status: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export type QuotaAlert = {
  id: string
  type: string
  userId?: string
  level: string
  title: string
  message: string
  data?: Record<string, unknown>
  status: string
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
}

export type QuotaAlertStatusFilter =
  | 'all'
  | 'open'
  | 'pending'
  | 'acknowledged'
  | 'resolved'
  | 'ignored'

export type QuotaReconciliationTimeRange = 'day' | 'week' | 'month' | 'all'

export type QuotaReconciliationGroupBy = 'user' | 'workflow'

export type QuotaReconciliationItem = {
  groupKey: string
  backendTokens: number
  backendRecords: number
  aiServiceTokens: number
  aiServiceRecords: number
  differenceTokens: number
  differenceRatio: number
  alertLevel: string
  shouldAlert: boolean
}

export type QuotaReconciliationSummary = {
  timeRange: QuotaReconciliationTimeRange
  workflowType?: string
  groupBy: QuotaReconciliationGroupBy
  page: number
  pageSize: number
  totalGroups: number
  backendTotalTokens: number
  backendTotalRecords: number
  aiServiceTotalTokens: number
  aiServiceTotalRecords: number
  differenceTokens: number
  differenceRatio: number
  alertLevel: string
  shouldAlert: boolean
  checkedAt: string
  items: QuotaReconciliationItem[]
}

export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  size: number
}

export type QuotaUserQuery = {
  page?: number
  limit?: number
  role?: string
  status?: string
  search?: string
}

export type QuotaPolicyQuery = {
  page?: number
  limit?: number
  role?: string
  status?: string
}

export type QuotaAlertQuery = {
  page?: number
  limit?: number
  type?: string
  level?: string
  status?: QuotaAlertStatusFilter
}

export type QuotaReconciliationQuery = {
  timeRange?: QuotaReconciliationTimeRange
  workflowType?: string
  groupBy?: QuotaReconciliationGroupBy
  page?: number
  pageSize?: number
}

export type AdminRechargePayload = {
  amount: number
  quotaType: 'daily' | 'monthly'
  reason: string
}

export type BatchQuotaPayload = {
  userIds: string[]
  amount?: number
  quotaType?: 'daily' | 'monthly' | 'total'
  reason?: string
}

export type UpdateQuotaPayload = {
  totalQuota: number
  quotaType: 'daily' | 'monthly' | 'total'
}

export type PolicyPayload = {
  name: string
  userRole: string
  membershipLevel: string
  dailyQuota: number
  monthlyQuota: number
  totalQuota: number
  description?: string
}

type MockQuotaUserRecord = QuotaListItem & {
  monthlyQuota: number
  monthlyUsed: number
  totalQuota: number
  totalUsed: number
}

const createTimestamp = (deltaDays = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + deltaDays)
  return date.toISOString()
}

const createMockUsers = (): MockQuotaUserRecord[] => [
  {
    userId: 'mock-admin-001',
    username: '星穹运营台',
    role: 'admin',
    memberLevel: 'super_vip',
    dailyQuota: 20000,
    dailyUsed: 12600,
    usagePercent: 63,
    status: 'active',
    monthlyQuota: 400000,
    monthlyUsed: 188000,
    totalQuota: 1000000,
    totalUsed: 522000,
  },
  {
    userId: 'mock-writer-001',
    username: '云岚主笔',
    role: 'writer',
    memberLevel: 'vip_yearly',
    dailyQuota: 12000,
    dailyUsed: 10800,
    usagePercent: 90,
    status: 'active',
    monthlyQuota: 220000,
    monthlyUsed: 176000,
    totalQuota: 600000,
    totalUsed: 418000,
  },
  {
    userId: 'mock-writer-002',
    username: '晨风夜话',
    role: 'writer',
    memberLevel: 'vip_monthly',
    dailyQuota: 8000,
    dailyUsed: 7920,
    usagePercent: 99,
    status: 'exhausted',
    monthlyQuota: 160000,
    monthlyUsed: 158500,
    totalQuota: 420000,
    totalUsed: 401000,
  },
  {
    userId: 'mock-reader-001',
    username: '追更读者A',
    role: 'reader',
    memberLevel: 'normal',
    dailyQuota: 3000,
    dailyUsed: 640,
    usagePercent: 21,
    status: 'active',
    monthlyQuota: 60000,
    monthlyUsed: 11200,
    totalQuota: 180000,
    totalUsed: 56800,
  },
  {
    userId: 'mock-reader-002',
    username: '深夜刷书人',
    role: 'reader',
    memberLevel: 'vip_monthly',
    dailyQuota: 5000,
    dailyUsed: 4160,
    usagePercent: 83,
    status: 'suspended',
    monthlyQuota: 90000,
    monthlyUsed: 63200,
    totalQuota: 260000,
    totalUsed: 167400,
  },
  {
    userId: 'mock-reader-003',
    username: '档案检索员',
    role: 'reader',
    memberLevel: 'vip_yearly',
    dailyQuota: 6500,
    dailyUsed: 2580,
    usagePercent: 40,
    status: 'active',
    monthlyQuota: 120000,
    monthlyUsed: 42000,
    totalQuota: 320000,
    totalUsed: 142000,
  },
]

const createDetailsForUser = (user: MockQuotaUserRecord): UserQuotaDetail[] => [
  {
    id: `${user.userId}-daily`,
    userId: user.userId,
    quotaType: 'daily',
    totalQuota: user.dailyQuota,
    usedQuota: user.dailyUsed,
    remainingQuota: Math.max(0, user.dailyQuota - user.dailyUsed),
    status: user.status,
    resetAt: createTimestamp(1),
  },
  {
    id: `${user.userId}-monthly`,
    userId: user.userId,
    quotaType: 'monthly',
    totalQuota: user.monthlyQuota,
    usedQuota: user.monthlyUsed,
    remainingQuota: Math.max(0, user.monthlyQuota - user.monthlyUsed),
    status: user.status,
    resetAt: createTimestamp(30),
  },
  {
    id: `${user.userId}-total`,
    userId: user.userId,
    quotaType: 'total',
    totalQuota: user.totalQuota,
    usedQuota: user.totalUsed,
    remainingQuota: Math.max(0, user.totalQuota - user.totalUsed),
    status: user.status,
  },
]

const buildInitialDetailsMap = (users: MockQuotaUserRecord[]) =>
  Object.fromEntries(users.map((user) => [user.userId, createDetailsForUser(user)]))

const createMockPolicies = (): QuotaPolicy[] => [
  {
    id: 'policy-reader-default',
    name: '默认读者策略',
    userRole: 'reader',
    membershipLevel: 'normal',
    dailyQuota: 3000,
    monthlyQuota: 60000,
    totalQuota: 180000,
    isDefault: true,
    status: 'active',
    description: '基础读者默认额度',
    createdAt: createTimestamp(-12),
    updatedAt: createTimestamp(-1),
  },
  {
    id: 'policy-writer-vip',
    name: '作者年费增强策略',
    userRole: 'writer',
    membershipLevel: 'vip_yearly',
    dailyQuota: 12000,
    monthlyQuota: 220000,
    totalQuota: 600000,
    isDefault: false,
    status: 'active',
    description: '面向核心作者的高额度策略',
    createdAt: createTimestamp(-8),
    updatedAt: createTimestamp(-2),
  },
  {
    id: 'policy-admin-default',
    name: '管理员审查策略',
    userRole: 'admin',
    membershipLevel: 'super_vip',
    dailyQuota: 20000,
    monthlyQuota: 400000,
    totalQuota: 1000000,
    isDefault: true,
    status: 'active',
    description: '保障运营与审查台稳定使用',
    createdAt: createTimestamp(-20),
    updatedAt: createTimestamp(-1),
  },
]

const createMockAlerts = (): QuotaAlert[] => [
  {
    id: 'alert-001',
    type: 'threshold',
    userId: 'mock-writer-001',
    level: 'warning',
    title: '作者日额度即将耗尽',
    message: '云岚主笔今日配额使用率已达到 90%，建议确认是否需要临时充值。',
    status: 'pending',
    createdAt: createTimestamp(-1),
  },
  {
    id: 'alert-002',
    type: 'abuse',
    userId: 'mock-reader-002',
    level: 'critical',
    title: '账号异常高频调用已暂停',
    message: '深夜刷书人短时间内触发多次请求峰值，系统已自动暂停。',
    status: 'acknowledged',
    createdAt: createTimestamp(-2),
  },
  {
    id: 'alert-003',
    type: 'consistency',
    level: 'info',
    title: '昨日聚合缓存刷新成功',
    message: 'Quota 仪表板缓存已完成每日重建。',
    status: 'resolved',
    resolvedBy: 'mock-admin-001',
    resolvedAt: createTimestamp(0),
    createdAt: createTimestamp(-1),
  },
]

const createTrend = (): QuotaTrendPoint[] => {
  const base = [18200, 19600, 20500, 22400, 23900, 25100, 24400, 26800, 28100, 29700, 30400, 31500]
  return base.map((consumption, index) => ({
    date: createTimestamp(index - (base.length - 1)).slice(0, 10),
    consumption,
    users: 180 + index * 3,
  }))
}

const mockQuotaState = {
  users: createMockUsers(),
  details: buildInitialDetailsMap(createMockUsers()),
  policies: createMockPolicies(),
  alerts: createMockAlerts(),
  trend: createTrend(),
}

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const isQuotaMockMode = () => {
  if (typeof window === 'undefined') return false
  const searchParams = new URLSearchParams(window.location.search)
  const queryEnabled = searchParams.get('test') === 'true'
  const token = localStorage.getItem('qingyu_token') || localStorage.getItem('token') || ''
  return queryEnabled || token.includes('mock')
}

const syncMockUserDerivedFields = (user: MockQuotaUserRecord) => {
  user.usagePercent = user.dailyQuota > 0 ? Math.round((user.dailyUsed / user.dailyQuota) * 100) : 0
  const details = mockQuotaState.details[user.userId] ?? createDetailsForUser(user)
  details.forEach((item) => {
    item.status = user.status
    if (item.quotaType === 'daily') {
      item.totalQuota = user.dailyQuota
      item.usedQuota = user.dailyUsed
      item.remainingQuota = Math.max(0, user.dailyQuota - user.dailyUsed)
      item.resetAt = createTimestamp(1)
    }
    if (item.quotaType === 'monthly') {
      item.totalQuota = user.monthlyQuota
      item.usedQuota = user.monthlyUsed
      item.remainingQuota = Math.max(0, user.monthlyQuota - user.monthlyUsed)
      item.resetAt = createTimestamp(30)
    }
    if (item.quotaType === 'total') {
      item.totalQuota = user.totalQuota
      item.usedQuota = user.totalUsed
      item.remainingQuota = Math.max(0, user.totalQuota - user.totalUsed)
    }
  })
  mockQuotaState.details[user.userId] = details
}

const summarizeMockQuota = (): QuotaSummary => {
  const totalUsers = mockQuotaState.users.length
  const activeUsers = mockQuotaState.users.filter((item) => item.status === 'active').length
  const exhaustedUsers = mockQuotaState.users.filter((item) => item.status === 'exhausted').length
  const nearExhaustUsers = mockQuotaState.users.filter((item) => item.usagePercent >= 80).length
  const suspendedUsers = mockQuotaState.users.filter((item) => item.status === 'suspended').length
  const totalConsumption = mockQuotaState.trend.reduce((sum, item) => sum + item.consumption, 0)
  return {
    totalUsers,
    activeUsers,
    exhaustedUsers,
    nearExhaustUsers,
    suspendedUsers,
    totalConsumption,
    avgConsumption: totalUsers > 0 ? Math.round(totalConsumption / totalUsers) : 0,
  }
}

const buildDistribution = (): QuotaDistribution => {
  const byRole: Record<string, number> = {}
  const byLevel: Record<string, number> = {}
  const byService: Record<string, number> = {
    reader: 7,
    writer: 12,
    analysis: 5,
    moderation: 3,
  }
  const byStatus: Record<string, number> = {}

  mockQuotaState.users.forEach((item) => {
    byRole[item.role] = (byRole[item.role] || 0) + 1
    byLevel[item.memberLevel] = (byLevel[item.memberLevel] || 0) + 1
    byStatus[item.status] = (byStatus[item.status] || 0) + 1
  })

  return { byRole, byLevel, byService, byStatus }
}

const getMockDashboard = (): QuotaDashboard => {
  const sortedUsers = [...mockQuotaState.users].sort((a, b) => b.dailyUsed - a.dailyUsed)
  return {
    summary: summarizeMockQuota(),
    distribution: buildDistribution(),
    topConsumers: sortedUsers.slice(0, 5).map((item) => ({
      userId: item.userId,
      username: item.username,
      role: item.role,
      usedQuota: item.dailyUsed,
      totalQuota: item.dailyQuota,
      usagePercent: item.usagePercent,
    })),
    recentAlerts: mockQuotaState.alerts.slice(0, 5).map((item) => ({
      id: item.id,
      type: item.type,
      level: item.level,
      title: item.title,
      userId: item.userId,
      status: item.status,
      createdAt: item.createdAt,
    })),
    trendData: deepClone(mockQuotaState.trend.slice(-7)),
  }
}

const getMockReconciliationTimeRange = (timeRange?: string): QuotaReconciliationTimeRange => {
  if (timeRange === 'week' || timeRange === 'month' || timeRange === 'all') {
    return timeRange
  }
  return 'day'
}

const getMockReconciliationGroupBy = (groupBy?: string): QuotaReconciliationGroupBy => {
  return groupBy === 'workflow' ? 'workflow' : 'user'
}

const resolveMockRangeMultiplier = (timeRange: QuotaReconciliationTimeRange) => {
  if (timeRange === 'week') return 7
  if (timeRange === 'month') return 30
  if (timeRange === 'all') return 90
  return 1
}

const summarizeMockDifference = (backendTokens: number, aiServiceTokens: number) => {
  const differenceTokens = Math.abs(backendTokens - aiServiceTokens)
  const denominator = Math.max(backendTokens, aiServiceTokens, 1)
  const differenceRatio = differenceTokens / denominator
  if (differenceTokens >= 1000 || differenceRatio > 0.2) {
    return { differenceTokens, differenceRatio, alertLevel: 'critical', shouldAlert: true }
  }
  if (differenceTokens >= 200 || differenceRatio > 0.1) {
    return { differenceTokens, differenceRatio, alertLevel: 'warning', shouldAlert: true }
  }
  return { differenceTokens, differenceRatio, alertLevel: 'info', shouldAlert: false }
}

const buildMockReconciliationItems = (
  timeRange: QuotaReconciliationTimeRange,
  groupBy: QuotaReconciliationGroupBy,
): QuotaReconciliationItem[] => {
  const multiplier = resolveMockRangeMultiplier(timeRange)

  if (groupBy === 'workflow') {
    const workflowBases = [
      { groupKey: 'chat', tokens: 9600, records: 128 },
      { groupKey: 'rewrite', tokens: 6200, records: 72 },
      { groupKey: 'outline', tokens: 4100, records: 43 },
      { groupKey: 'analysis', tokens: 2800, records: 31 },
    ]

    return workflowBases.map((item, index) => {
      const backendTokens = item.tokens * multiplier
      const backendRecords = item.records * multiplier
      const diff = Math.max(24, Math.round(backendTokens * (0.012 + index * 0.004)))
      const aiServiceTokens = Math.max(0, backendTokens + (index % 2 === 0 ? -diff : diff))
      const aiServiceRecords = Math.max(
        0,
        backendRecords + (index % 2 === 0 ? -Math.ceil(diff / 120) : Math.ceil(diff / 150)),
      )
      return {
        groupKey: item.groupKey,
        backendTokens,
        backendRecords,
        aiServiceTokens,
        aiServiceRecords,
        ...summarizeMockDifference(backendTokens, aiServiceTokens),
      }
    })
  }

  return [...mockQuotaState.users]
    .sort((a, b) => b.dailyUsed - a.dailyUsed)
    .map((user, index) => {
      const backendTokens = user.dailyUsed * multiplier
      const backendRecords = Math.max(1, Math.round(backendTokens / 180))
      const diff = Math.max(12, Math.round(backendTokens * (0.015 + index * 0.003)))
      const aiServiceTokens = Math.max(0, backendTokens + (index % 2 === 0 ? -diff : diff))
      const aiServiceRecords = Math.max(
        0,
        backendRecords + (index % 2 === 0 ? -Math.ceil(diff / 140) : Math.ceil(diff / 180)),
      )
      return {
        groupKey: user.userId,
        backendTokens,
        backendRecords,
        aiServiceTokens,
        aiServiceRecords,
        ...summarizeMockDifference(backendTokens, aiServiceTokens),
      }
    })
}

const getMockReconciliationSummary = (
  params: QuotaReconciliationQuery = {},
): QuotaReconciliationSummary => {
  refreshAllMockUsers()
  const timeRange = getMockReconciliationTimeRange(params.timeRange)
  const groupBy = getMockReconciliationGroupBy(params.groupBy)
  const page = Math.max(1, Number(params.page || 1))
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize || 20)))
  const workflowType = params.workflowType?.trim()

  let items = buildMockReconciliationItems(timeRange, groupBy)
  if (workflowType && groupBy === 'workflow') {
    items = items.filter((item) => item.groupKey === workflowType)
  }

  const backendTotalTokens = items.reduce((sum, item) => sum + item.backendTokens, 0)
  const backendTotalRecords = items.reduce((sum, item) => sum + item.backendRecords, 0)
  const aiServiceTotalTokens = items.reduce((sum, item) => sum + item.aiServiceTokens, 0)
  const aiServiceTotalRecords = items.reduce((sum, item) => sum + item.aiServiceRecords, 0)
  const summary = summarizeMockDifference(backendTotalTokens, aiServiceTotalTokens)
  const start = (page - 1) * pageSize

  return {
    timeRange,
    workflowType,
    groupBy,
    page,
    pageSize,
    totalGroups: items.length,
    backendTotalTokens,
    backendTotalRecords,
    aiServiceTotalTokens,
    aiServiceTotalRecords,
    checkedAt: createTimestamp(0),
    items: deepClone(items.slice(start, start + pageSize)),
    ...summary,
  }
}

const paginate = <T>(items: T[], page = 1, size = 20): PaginatedResult<T> => {
  const safePage = Math.max(1, Number(page || 1))
  const safeSize = Math.max(1, Number(size || 20))
  const start = (safePage - 1) * safeSize
  return {
    items: items.slice(start, start + safeSize),
    total: items.length,
    page: safePage,
    size: safeSize,
  }
}

const refreshAllMockUsers = () => {
  mockQuotaState.users.forEach((item) => syncMockUserDerivedFields(item))
}

const withEnvelope = <T extends Record<string, unknown>>(config?: T) =>
  ({
    ...(config || {}),
    preserveEnvelope: true,
  }) as T & { preserveEnvelope: true }

const quotaGet = <T>(url: string, config?: Record<string, unknown>) =>
  apiClient.get<Envelope<T>>(url, withEnvelope(config) as any) as unknown as Promise<Envelope<T>>

const quotaPost = <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
  apiClient.post<Envelope<T>>(url, data, withEnvelope(config) as any) as unknown as Promise<
    Envelope<T>
  >

const quotaPut = <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
  apiClient.put<Envelope<T>>(url, data, withEnvelope(config) as any) as unknown as Promise<
    Envelope<T>
  >

const quotaDelete = <T>(url: string, config?: Record<string, unknown>) =>
  apiClient.delete<Envelope<T>>(url, withEnvelope(config) as any) as unknown as Promise<Envelope<T>>

const readEnvelope = async <T>(request: Promise<Envelope<T>>) => request

const readPaginated = async <T>(request: Promise<Envelope<T[]>>): Promise<PaginatedResult<T>> => {
  const envelope = await request
  return {
    items: Array.isArray(envelope.data) ? envelope.data : [],
    total: Number(envelope.total ?? 0),
    page: Number(envelope.page ?? 1),
    size: Number(envelope.size ?? 20),
  }
}

const normalizeQuotaDetails = (payload: unknown): UserQuotaDetail[] => {
  if (Array.isArray(payload)) {
    return payload as UserQuotaDetail[]
  }
  if (payload && typeof payload === 'object') {
    return Object.values(payload as Record<string, UserQuotaDetail>)
  }
  return []
}

export const getQuotaDashboard = async () => {
  if (isQuotaMockMode()) {
    refreshAllMockUsers()
    return deepClone(getMockDashboard())
  }
  const envelope = await readEnvelope<QuotaDashboard>(quotaGet('/admin/quota/dashboard'))
  return envelope.data
}

export const getQuotaGlobalStatistics = async () => {
  if (isQuotaMockMode()) {
    refreshAllMockUsers()
    return deepClone(summarizeMockQuota())
  }
  const envelope = await readEnvelope<QuotaSummary>(quotaGet('/admin/quota/statistics/global'))
  return envelope.data
}

export const getQuotaTrend = async (days = 7) => {
  if (isQuotaMockMode()) {
    return deepClone(mockQuotaState.trend.slice(-Math.max(1, days)))
  }
  const envelope = await readEnvelope<QuotaTrendPoint[]>(
    quotaGet('/admin/quota/statistics/trend', { params: { days } }),
  )
  return Array.isArray(envelope.data) ? envelope.data : []
}

export const getQuotaReconciliationSummary = async (params: QuotaReconciliationQuery = {}) => {
  if (isQuotaMockMode()) {
    return deepClone(getMockReconciliationSummary(params))
  }
  const envelope = await readEnvelope<QuotaReconciliationSummary>(
    quotaGet('/admin/quota/statistics/reconciliation', { params }),
  )
  return envelope.data
}

export const refreshQuotaDashboard = async () => {
  if (isQuotaMockMode()) return
  await readEnvelope<null>(quotaPost('/admin/quota/dashboard/refresh'))
}

export const runQuotaConsistencyCheck = async () => {
  if (isQuotaMockMode()) return
  await readEnvelope<null>(quotaPost('/admin/quota/statistics/reconciliation/check'))
}

export const listQuotaUsers = async (params: QuotaUserQuery = {}) => {
  if (isQuotaMockMode()) {
    refreshAllMockUsers()
    const keyword = (params.search || '').trim().toLowerCase()
    const filtered = mockQuotaState.users.filter((item) => {
      if (params.role && item.role !== params.role) return false
      if (params.status && item.status !== params.status) return false
      if (
        keyword &&
        !item.username.toLowerCase().includes(keyword) &&
        !item.userId.toLowerCase().includes(keyword)
      ) {
        return false
      }
      return true
    })
    return deepClone(paginate(filtered, params.page, params.limit))
  }
  return readPaginated<QuotaListItem>(quotaGet('/admin/quota/users', { params }))
}

export const getQuotaUserDetails = async (userId: string) => {
  if (isQuotaMockMode()) {
    refreshAllMockUsers()
    return deepClone(mockQuotaState.details[userId] ?? [])
  }
  const envelope = await readEnvelope<unknown>(quotaGet(`/admin/quota/users/${userId}`))
  return normalizeQuotaDetails(envelope.data)
}

export const updateQuotaUser = async (userId: string, payload: UpdateQuotaPayload) => {
  if (isQuotaMockMode()) {
    const target = mockQuotaState.users.find((item) => item.userId === userId)
    if (target) {
      if (payload.quotaType === 'daily') target.dailyQuota = payload.totalQuota
      if (payload.quotaType === 'monthly') target.monthlyQuota = payload.totalQuota
      if (payload.quotaType === 'total') target.totalQuota = payload.totalQuota
      syncMockUserDerivedFields(target)
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<null>(quotaPut(`/admin/quota/users/${userId}`, payload))
}

export const rechargeQuotaUser = async (userId: string, payload: AdminRechargePayload) => {
  if (isQuotaMockMode()) {
    const target = mockQuotaState.users.find((item) => item.userId === userId)
    if (target) {
      if (payload.quotaType === 'daily') target.dailyQuota += payload.amount
      if (payload.quotaType === 'monthly') target.monthlyQuota += payload.amount
      syncMockUserDerivedFields(target)
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<null>(quotaPost(`/admin/quota/users/${userId}/recharge`, payload))
}

export const suspendQuotaUser = async (userId: string) => {
  if (isQuotaMockMode()) {
    const target = mockQuotaState.users.find((item) => item.userId === userId)
    if (target) {
      target.status = 'suspended'
      syncMockUserDerivedFields(target)
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<null>(quotaPost(`/admin/quota/users/${userId}/suspend`))
}

export const activateQuotaUser = async (userId: string) => {
  if (isQuotaMockMode()) {
    const target = mockQuotaState.users.find((item) => item.userId === userId)
    if (target) {
      target.status = 'active'
      syncMockUserDerivedFields(target)
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<null>(quotaPost(`/admin/quota/users/${userId}/activate`))
}

export const batchRechargeQuota = async (payload: BatchQuotaPayload) => {
  if (isQuotaMockMode()) {
    for (const userId of payload.userIds) {
      await rechargeQuotaUser(userId, {
        amount: payload.amount || 0,
        quotaType: payload.quotaType === 'monthly' ? 'monthly' : 'daily',
        reason: payload.reason || '批量充值',
      })
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<unknown>(quotaPost('/admin/quota/batch-recharge', payload))
}

export const batchUpdateQuota = async (payload: BatchQuotaPayload) => {
  if (isQuotaMockMode()) {
    for (const userId of payload.userIds) {
      await updateQuotaUser(userId, {
        totalQuota: payload.amount || 0,
        quotaType: payload.quotaType || 'daily',
      })
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<unknown>(quotaPost('/admin/quota/batch-update', payload))
}

export const batchSuspendQuota = async (payload: Pick<BatchQuotaPayload, 'userIds'>) => {
  if (isQuotaMockMode()) {
    for (const userId of payload.userIds) {
      await suspendQuotaUser(userId)
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<unknown>(quotaPost('/admin/quota/batch-suspend', payload))
}

export const batchActivateQuota = async (payload: Pick<BatchQuotaPayload, 'userIds'>) => {
  if (isQuotaMockMode()) {
    for (const userId of payload.userIds) {
      await activateQuotaUser(userId)
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<unknown>(quotaPost('/admin/quota/batch-activate', payload))
}

export const listQuotaPolicies = async (params: QuotaPolicyQuery = {}) => {
  if (isQuotaMockMode()) {
    const filtered = mockQuotaState.policies.filter((item) => {
      if (params.role && item.userRole !== params.role) return false
      if (params.status && item.status !== params.status) return false
      return true
    })
    return deepClone(paginate(filtered, params.page, params.limit))
  }
  return readPaginated<QuotaPolicy>(quotaGet('/admin/quota/policies', { params }))
}

export const getQuotaPolicy = async (id: string) => {
  if (isQuotaMockMode()) {
    return deepClone(
      mockQuotaState.policies.find((item) => item.id === id) || mockQuotaState.policies[0],
    )
  }
  const envelope = await readEnvelope<QuotaPolicy>(quotaGet(`/admin/quota/policies/${id}`))
  return envelope.data
}

export const createQuotaPolicy = async (payload: PolicyPayload) => {
  if (isQuotaMockMode()) {
    const created: QuotaPolicy = {
      id: `policy-${Date.now()}`,
      ...payload,
      isDefault: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockQuotaState.policies.unshift(created)
    return deepClone(created)
  }
  const envelope = await readEnvelope<QuotaPolicy>(quotaPost('/admin/quota/policies', payload))
  return envelope.data
}

export const updateQuotaPolicy = async (id: string, payload: PolicyPayload) => {
  if (isQuotaMockMode()) {
    const target = mockQuotaState.policies.find((item) => item.id === id)
    if (target) {
      Object.assign(target, payload, { updatedAt: new Date().toISOString() })
    }
    return deepClone(target || mockQuotaState.policies[0])
  }
  const envelope = await readEnvelope<QuotaPolicy>(quotaPut(`/admin/quota/policies/${id}`, payload))
  return envelope.data
}

export const deleteQuotaPolicy = async (id: string) => {
  if (isQuotaMockMode()) {
    mockQuotaState.policies = mockQuotaState.policies.filter((item) => item.id !== id)
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<null>(quotaDelete(`/admin/quota/policies/${id}`))
}

export const initializeQuotaPolicies = async () => {
  if (isQuotaMockMode()) {
    mockQuotaState.policies = createMockPolicies()
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<null>(quotaPost('/admin/quota/policies/initialize'))
}

export const listQuotaAlerts = async (params: QuotaAlertQuery = {}) => {
  const normalizedStatus = params.status ?? 'open'
  const normalizedParams: QuotaAlertQuery = {
    ...params,
    status: normalizedStatus,
  }

  if (isQuotaMockMode()) {
    const filtered = mockQuotaState.alerts.filter((item) => {
      if (normalizedParams.type && item.type !== normalizedParams.type) return false
      if (normalizedParams.level && item.level !== normalizedParams.level) return false
      if (normalizedParams.status === 'all') return true
      if (normalizedParams.status === 'open') {
        return item.status === 'pending' || item.status === 'acknowledged'
      }
      if (normalizedParams.status && item.status !== normalizedParams.status) return false
      return true
    })
    return deepClone(paginate(filtered, normalizedParams.page, normalizedParams.limit))
  }
  return readPaginated<QuotaAlert>(quotaGet('/admin/quota/alerts', { params: normalizedParams }))
}

export const getQuotaAlert = async (id: string) => {
  if (isQuotaMockMode()) {
    return deepClone(
      mockQuotaState.alerts.find((item) => item.id === id) || mockQuotaState.alerts[0],
    )
  }
  const envelope = await readEnvelope<QuotaAlert>(quotaGet(`/admin/quota/alerts/${id}`))
  return envelope.data
}

export const acknowledgeQuotaAlert = async (id: string, operatorId?: string) => {
  if (isQuotaMockMode()) {
    const target = mockQuotaState.alerts.find((item) => item.id === id)
    if (target) {
      target.status = 'acknowledged'
      target.resolvedBy = operatorId || 'mock-admin-001'
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<null>(quotaPut(`/admin/quota/alerts/${id}/acknowledge`, { operatorId }))
}

export const resolveQuotaAlert = async (id: string, operatorId?: string) => {
  if (isQuotaMockMode()) {
    const target = mockQuotaState.alerts.find((item) => item.id === id)
    if (target) {
      target.status = 'resolved'
      target.resolvedBy = operatorId || 'mock-admin-001'
      target.resolvedAt = new Date().toISOString()
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<null>(quotaPut(`/admin/quota/alerts/${id}/resolve`, { operatorId }))
}

export const ignoreQuotaAlert = async (id: string, operatorId?: string) => {
  if (isQuotaMockMode()) {
    const target = mockQuotaState.alerts.find((item) => item.id === id)
    if (target) {
      target.status = 'ignored'
      target.resolvedBy = operatorId || 'mock-admin-001'
      target.resolvedAt = new Date().toISOString()
    }
    return { code: 0, message: 'ok', data: null }
  }
  return readEnvelope<null>(quotaPut(`/admin/quota/alerts/${id}/ignore`, { operatorId }))
}
