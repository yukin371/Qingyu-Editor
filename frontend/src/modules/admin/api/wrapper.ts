/**
 * Admin API Wrapper
 * 将orval生成的工厂模式API转换为更易使用的格式
 *
 * 使用方式：
 * import * as adminAPI from '@/modules/admin/api'
 * const stats = await adminAPI.getDashboardStats()
 */

import { getApi } from './generated/admin'
import type { APIResponse } from '@/types/api'
import { httpService } from '@/core/services/http.service'
import type {
  DashboardStats,
  Announcement,
  Banner,
  UserManagementItem,
  OperationLog,
} from '@/modules/admin/types/admin.types'

// 获取生成的API对象
const api = getApi()

type AdminListResult<T> = {
  items: T[]
  total: number
}

type AdminCategory = {
  id: string
  name: string
  description?: string
  icon?: string
  parentId?: string
  level: number
  sortOrder: number
  bookCount: number
  isActive: boolean
  children?: AdminCategory[]
}

export type AdminWithdrawalItem = {
  id: string
  user_id: string
  username?: string
  email?: string
  display_name?: string
  source: 'wallet' | 'author' | string
  status: string
  amount: number
  fee: number
  actual_amount: number
  method?: string
  account?: string
  account_type?: string
  account_name?: string
  bank_name?: string
  order_no?: string
  reviewed_by?: string
  reviewed_at?: string
  reject_reason?: string
  processed_at?: string
  transaction_id?: string
  created_at: string
  updated_at: string
}

export type AdminWithdrawalStats = {
  total_count: number
  pending_count: number
  approved_count: number
  rejected_count: number
  approved_today_count: number
  pending_amount: number
  approved_amount: number
}

function unwrapPayload<T>(response: unknown): T {
  const maybeWrapped = response as { data?: T }
  return (maybeWrapped?.data ?? response) as T
}

function normalizeAnnouncement(item: Record<string, any>): Announcement {
  return {
    id: item.id || item._id || '',
    title: item.title || '',
    content: item.content || '',
    type: item.type || 'system',
    priority: item.priority || 'medium',
    status: item.status || (item.isActive ? 'active' : 'inactive'),
    effectiveStartTime: item.effectiveStartTime || item.startTime || '',
    effectiveEndTime: item.effectiveEndTime || item.endTime || '',
    targetUsers: item.targetUsers || (item.targetRole ? [item.targetRole] : undefined),
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt,
    isActive: item.isActive ?? item.status === 'active',
    startTime: item.startTime || item.effectiveStartTime,
    endTime: item.endTime || item.effectiveEndTime,
  }
}

function normalizeBanner(item: Record<string, any>): Banner {
  return {
    id: item.id || item._id || '',
    title: item.title || '',
    imageUrl: item.imageUrl || item.image || '',
    link: item.link || item.target,
    position: item.position || item.targetType || 'home',
    sortOrder: item.sortOrder ?? 0,
    status: item.status || (item.isActive ? 'active' : 'inactive'),
    startTime: item.startTime,
    endTime: item.endTime,
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt,
    isActive: item.isActive ?? item.status === 'active',
    description: item.description,
    image: item.image || item.imageUrl,
    target: item.target || item.link,
    targetType: item.targetType || item.position,
  }
}

function normalizeCategory(item: Record<string, any>): AdminCategory {
  const rawChildren = Array.isArray(item.children) ? item.children : []
  return {
    id: item.id || item._id || '',
    name: item.name || '',
    description: item.description || '',
    icon: item.icon || '',
    parentId: item.parentId || item.parent_id,
    level: Number(item.level ?? 0),
    sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0),
    bookCount: Number(item.bookCount ?? item.book_count ?? 0),
    isActive: item.isActive ?? item.is_active ?? true,
    children: rawChildren.map((child: Record<string, any>) => normalizeCategory(child)),
  }
}

// ==================== 仪表盘相关 API ====================

/**
 * 获取仪表盘统计数据
 * 兼容旧API: getDashboardStats()
 * 使用生成的 getApiV1AdminStats
 *
 * 注意：httpService 响应拦截器已自动解包 APIResponse
 * 后端返回: { totalUsers: number, activeUsers: number, authorsCount: number, newUsersToday: number, ... }
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return api.getApiV1AdminStats() as any
}

/**
 * 获取统计数据（别名）
 */
export const getStats = getDashboardStats

// ==================== 审核相关 API ====================

/**
 * 获取待审核内容列表
 * @deprecated 请使用 getPendingAudits 代替
 */
export const getReviewList = getPendingAudits

/**
 * 获取待审核内容列表（别名）
 */
export const getPendingReviews = getReviewList

/**
 * 审核内容
 * @deprecated 请使用 reviewAudit 代替
 */
export const reviewContent = reviewAudit

// ==================== 提现相关 API ====================

/**
 * 获取提现申请列表
 */
export async function getWithdrawalList(params?: {
  page?: number
  pageSize?: number
  status?: string
  source?: string
  start_date?: string
  end_date?: string
}): Promise<AdminListResult<AdminWithdrawalItem>> {
  const response = await httpService.get<{
    code: number
    data: AdminWithdrawalItem[]
    pagination?: { total?: number }
  }>('/admin/withdrawals', {
    params: {
      page: params?.page,
      page_size: params?.pageSize,
      status: params?.status,
      source: params?.source,
      start_date: params?.start_date,
      end_date: params?.end_date,
    },
  })

  return {
    items: Array.isArray(response?.data) ? response.data : [],
    total: Number(response?.pagination?.total ?? response?.data?.length ?? 0),
  }
}

/**
 * 处理提现申请
 */
export async function handleWithdrawal(params: {
  withdraw_id: string
  approved: boolean
  reason?: string
}): Promise<APIResponse<void>> {
  return api.postApiV1AdminWithdrawReview(params as any) as any
}

/**
 * 审核提现申请（别名）
 */
export const reviewWithdraw = handleWithdrawal

export async function getWithdrawalStats(params?: {
  status?: string
  source?: string
  start_date?: string
  end_date?: string
}): Promise<AdminWithdrawalStats> {
  const response = await httpService.get<AdminWithdrawalStats>('/admin/withdrawals/stats', {
    params: {
      status: params?.status,
      source: params?.source,
      start_date: params?.start_date,
      end_date: params?.end_date,
    },
  })

  return {
    total_count: Number(response?.total_count ?? 0),
    pending_count: Number(response?.pending_count ?? 0),
    approved_count: Number(response?.approved_count ?? 0),
    rejected_count: Number(response?.rejected_count ?? 0),
    approved_today_count: Number(response?.approved_today_count ?? 0),
    pending_amount: Number(response?.pending_amount ?? 0),
    approved_amount: Number(response?.approved_amount ?? 0),
  }
}

// ==================== 用户管理相关 API ====================

/**
 * 获取用户管理列表
 * 兼容旧API: getUserList(params)
 *
 * 注意：httpService 响应拦截器已自动解包 APIResponse
 * 后端返回: { users: UserManagementItem[], total: number, page: number, size: number }
 */
export async function getUserList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  role?: string
  status?: string
}): Promise<{ users: UserManagementItem[]; total: number; page: number; size: number }> {
  const response = await api.getApiV1AdminUsers(params as any)
  return unwrapPayload(response)
}

export async function getUserCountsByStatus(): Promise<Record<string, number>> {
  const response = await api.getApiV1AdminUsersCountByStatus()
  return unwrapPayload(response)
}

export async function createUser(data: {
  username: string
  email: string
  password?: string
  nickname?: string
  role: string
  status?: string
  bio?: string
}): Promise<APIResponse<any>> {
  return httpService.post('/admin/users', data) as any
}

export async function batchCreateUsers(data: {
  count: number
  prefix?: string
  role: string
  status?: string
}): Promise<APIResponse<{ users: any[]; count: number }>> {
  return httpService.post('/admin/users/batch-create', data) as any
}

/**
 * 更新用户信息
 * 兼容旧API: updateUser(id, params)
 * 注意：后端暂不支持完整的用户更新，请使用 updateUserStatus 或 assignRole
 */
export async function updateUser(
  id: string,
  params: Partial<UserManagementItem>,
): Promise<APIResponse<void>> {
  // 如果只更新状态，使用状态更新接口
  if (params.status && Object.keys(params).length === 1) {
    return api.putApiV1AdminUsersIdStatus(id, { status: params.status } as any) as any
  }
  // 如果只更新角色，使用角色分配接口
  if (params.roles && Object.keys(params).length === 1) {
    return api.putApiV1AdminUsersIdRole(id, { role: params.roles[0] } as any) as any
  }
  // 其他情况暂不支持，抛出错误
  throw new Error(
    'updateUser: 当前仅支持更新 status 或 roles 单个字段，请使用 updateUserStatus 或 assignRole',
  )
}

/**
 * 删除用户
 * 兼容旧API: deleteUser(id)
 */
export async function deleteUser(id: string): Promise<APIResponse<void>> {
  return api.deleteApiV1AdminUsersId(id) as any
}

/**
 * 更新用户状态
 * 兼容旧API: updateUserStatus(id, params)
 */
export async function updateUserStatus(
  id: string,
  params: { status: string; reason?: string },
): Promise<APIResponse<void>> {
  return api.putApiV1AdminUsersIdStatus(id, params as any) as any
}

/**
 * 分配角色
 * 兼容旧API: assignRole(id, params)
 */
export async function assignRole(
  id: string,
  params: { role: string; reason?: string },
): Promise<APIResponse<void>> {
  return api.putApiV1AdminUsersIdRole(id, params as any) as any
}

/**
 * 更新用户角色（别名）
 * 使用 putApiV1AdminUsersIdRole
 */
export const updateUserRole = api.putApiV1AdminUsersIdRole

/**
 * 批量删除用户
 * 兼容旧API: batchDeleteUsers(params)
 */
export async function batchDeleteUsers(params: {
  userIds: string[]
  reason?: string
}): Promise<APIResponse<void>> {
  return api.postApiV1AdminUsersBatchDelete(params as any) as any
}

export async function batchUpdateUserStatus(params: {
  userIds: string[]
  status: string
}): Promise<APIResponse<void>> {
  return api.postApiV1AdminUsersBatchUpdateStatus(params as any) as any
}

// ==================== 分类管理相关 API ====================

export async function getCategoryTree(): Promise<AdminCategory[]> {
  const response = await httpService.get<Record<string, any>[] | { items?: Record<string, any>[] }>(
    '/admin/categories/tree',
  )
  const rawItems = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
      ? response.items
      : []
  return rawItems.map((item) => normalizeCategory(item))
}

export async function createCategory(data: {
  name: string
  description?: string
  icon?: string
  parent_id?: string
  sort_order?: number
}): Promise<APIResponse<any>> {
  return httpService.post('/admin/categories', data) as any
}

export async function updateCategory(
  id: string,
  data: {
    name?: string
    description?: string
    icon?: string
    sort_order?: number
  },
): Promise<APIResponse<any>> {
  return httpService.put(`/admin/categories/${id}`, data) as any
}

export async function deleteCategory(id: string): Promise<APIResponse<void>> {
  return httpService.delete(`/admin/categories/${id}`) as any
}

// ==================== 操作日志相关 API ====================

/**
 * 获取操作日志
 * 兼容旧API: getOperationLogs(params)
 *
 * 注意：由于响应包含 pagination 字段，httpService 不会解包
 * 后端返回: { code: 0, data: OperationLog[], pagination: { total: number, ... } }
 *
 * 后端参数: page, page_size, admin_id, operation
 */
export async function getOperationLogs(params?: {
  page?: number
  page_size?: number
  admin_id?: string
  operation?: string
  start_date?: string
  end_date?: string
}): Promise<{
  code: number
  data: OperationLog[]
  pagination: { total: number; page: number; page_size: number }
}> {
  return api.getApiV1AdminOperationLogs(params as any) as any
}

// ==================== 配额管理相关 API ====================

/**
 * 获取用户配额详情
 * 兼容旧API: getUserQuotaDetails(userId)
 */
export async function getUserQuotaDetails(userId: string): Promise<APIResponse<any>> {
  return api.getApiV1AdminQuotaUserId(userId) as any
}

/**
 * 更新用户配额
 * 兼容旧API: updateUserQuota(userId, params)
 */
export async function updateUserQuota(
  userId: string,
  params: {
    quotaType?: 'free' | 'paid' | 'trial'
    totalQuota?: number
    resetDate?: string
  },
): Promise<APIResponse<void>> {
  return api.putApiV1AdminQuotaUserId(userId, params as any) as any
}

/**
 * 暂停用户配额
 * 兼容旧API: suspendUserQuota(userId, reason)
 */
export async function suspendUserQuota(userId: string): Promise<APIResponse<void>> {
  return api.postApiV1AdminQuotaUserIdSuspend(userId) as any
}

/**
 * 激活用户配额
 * 兼容旧API: activateUserQuota(userId)
 */
export async function activateUserQuota(userId: string): Promise<APIResponse<void>> {
  return api.postApiV1AdminQuotaUserIdActivate(userId) as any
}

/**
 * 更新配额
 * @deprecated 请使用 updateUserQuota 代替
 */
export const updateQuota = updateUserQuota

// ==================== 审核管理相关 API ====================

/**
 * 获取待审核内容列表
 * 兼容旧API: getPendingAudits(params)
 */
export async function getPendingAudits(params?: {
  page?: number
  pageSize?: number
  contentType?: string
  riskLevel?: string
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return api.getApiV1AdminAuditPending(params as any) as any
}

/**
 * 获取高风险审核列表
 * 兼容旧API: getHighRiskAudits(params)
 */
export async function getHighRiskAudits(params?: {
  page?: number
  pageSize?: number
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return api.getApiV1AdminAuditHighRisk(params as any) as any
}

/**
 * 获取审核统计数据
 * 兼容旧API: getAuditStatistics()
 */
export async function getAuditStatistics(): Promise<
  APIResponse<{
    pending: number
    approved: number
    rejected: number
    highRisk: number
  }>
> {
  return api.getApiV1AdminAuditStatistics() as any
}

/**
 * 审核内容
 * 兼容旧API: reviewAudit(auditId, params)
 */
export async function reviewAudit(
  auditId: string,
  params: {
    approved: boolean
    reason?: string
  },
): Promise<APIResponse<void>> {
  return api.postApiV1AdminAuditIdReview(auditId, params as any) as any
}

/**
 * 审核申诉
 */
export const reviewAppeal = api.postApiV1AdminAuditIdAppealReview

// ==================== 公告管理相关 API ====================

/**
 * 获取公告列表
 * 兼容旧API: getAnnouncements(params)
 * 转换参数： page/pageSize -> page/pageSize (backend uses same)
 */
export async function getAnnouncements(params?: {
  page?: number
  pageSize?: number
  type?: string
  targetUsers?: string
  targetRole?: string
  status?: string
}): Promise<AdminListResult<Announcement>> {
  const rawResponse = await api.getApiV1AdminAnnouncements({
    page: params?.page,
    page_size: params?.pageSize,
    type: params?.type,
    targetRole: params?.targetRole ?? params?.targetUsers,
    isActive: params?.status === 'active' ? true : undefined,
  } as any)
  const response = unwrapPayload<Record<string, any>>(rawResponse)
  const rawItems = Array.isArray(response?.items)
    ? response.items
    : Array.isArray(response?.announcements)
      ? response.announcements
      : Array.isArray(response?.list)
        ? response.list
        : []
  return {
    items: rawItems.map((item) => normalizeAnnouncement(item)),
    total: Number(response?.total ?? response?.pagination?.total ?? rawItems.length ?? 0),
  }
}

/**
 * 创建公告
 * 兼容旧API: createAnnouncement(data)
 */
export async function createAnnouncement(data: {
  title: string
  content: string
  type: 'info' | 'warning' | 'notice'
  priority?: number
  isActive?: boolean
  startTime?: string
  endTime?: string
  targetRole?: 'all' | 'reader' | 'writer' | 'admin'
}): Promise<APIResponse<any>> {
  return api.postApiV1AdminAnnouncements(data as any) as any
}

/**
 * 更新公告
 * 兼容旧API: updateAnnouncement(id, data)
 */
export async function updateAnnouncement(id: string, data: any): Promise<APIResponse<any>> {
  return api.putApiV1AdminAnnouncementsId(id, data as any) as any
}

/**
 * 删除公告
 * 兼容旧API: deleteAnnouncement(id)
 */
export const deleteAnnouncement = api.deleteApiV1AdminAnnouncementsId

/**
 * 批量更新公告状态
 * 兼容旧API: batchUpdateAnnouncementStatus(ids, status)
 */
export async function batchUpdateAnnouncementStatus(
  ids: string[],
  status: 'active' | 'inactive',
): Promise<APIResponse<void>> {
  return api.putApiV1AdminAnnouncementsBatchStatus({
    announcementIds: ids,
    isActive: status === 'active',
  } as any) as any
}

/**
 * 批量删除公告
 */
export const batchDeleteAnnouncements = api.deleteApiV1AdminAnnouncementsBatchDelete

// ==================== 配置管理相关 API ====================

/**
 * 获取所有系统配置
 * 兼容旧API: getAllConfigs()
 */
export const getAllConfigs = api.getApiV1AdminConfig

/**
 * 获取单个配置项
 * 兼容旧API: getConfigByKey(key)
 */
export const getConfigByKey = api.getApiV1AdminConfigKey

/**
 * 更新配置项
 * 兼容旧API: updateConfig(key, value)
 */
export const updateConfig = api.putApiV1AdminConfig

/**
 * 批量更新配置项
 * 兼容旧API: batchUpdateConfig(configs)
 */
export const batchUpdateConfig = api.putApiV1AdminConfigBatch

/**
 * 验证配置项
 * 兼容旧API: validateConfig(configs)
 */
export const validateConfig = api.postApiV1AdminConfigValidate

/**
 * 系统配置请求
 * 使用 putApiV1AdminConfig
 */
export const systemConfig = api.putApiV1AdminConfig

// ==================== 配置备份相关 API ====================

/**
 * 获取配置备份列表
 * 兼容旧API: getConfigBackups()
 */
export const getConfigBackups = api.getApiV1AdminConfigBackups

/**
 * 恢复配置备份
 * 兼容旧API: restoreConfigBackup(backupId)
 */
export const restoreConfigBackup = api.postApiV1AdminConfigRestore

// ==================== Banner管理相关 API ====================

/**
 * 获取Banner列表
 * 兼容旧API: getBanners(params)
 * 转换参数： page/pageSize -> limit/offset
 */
export async function getBanners(params: {
  page?: number
  pageSize?: number
  targetType?: string
  status?: string
}): Promise<AdminListResult<Banner>> {
  const limit = params.pageSize || 10
  const offset = ((params.page || 1) - 1) * (params.pageSize || 10)
  const rawResponse = await api.getApiV1AdminBanners({
    limit,
    offset,
    targetType: params.targetType,
    isActive: params.status === 'active' ? true : undefined,
  })
  const response = unwrapPayload<Record<string, any>>(rawResponse)
  const rawItems = Array.isArray(response?.items)
    ? response.items
    : Array.isArray(response?.banners)
      ? response.banners
      : Array.isArray(response?.list)
        ? response.list
        : []
  return {
    items: rawItems.map((item) => normalizeBanner(item)),
    total: Number(response?.total ?? response?.pagination?.total ?? rawItems.length ?? 0),
  }
}

/**
 * 创建Banner
 * 兼容旧API: createBanner(data)
 */
export async function createBanner(data: {
  title: string
  image: string
  target: string
  targetType: string
  sortOrder?: number
  isActive?: boolean
  startTime?: string
  endTime?: string
}): Promise<APIResponse<any>> {
  return api.postApiV1AdminBanners(data as any) as any
}

/**
 * 更新Banner
 * 兼容旧API: updateBanner(id, data)
 */
export async function updateBanner(id: string, data: any): Promise<APIResponse<any>> {
  return api.putApiV1AdminBannersId(id, data as any) as any
}

/**
 * 删除Banner
 * 兼容旧API: deleteBanner(id)
 */
export const deleteBanner = api.deleteApiV1AdminBannersId

/**
 * 批量更新Banner排序
 */
export const batchUpdateBannerSort = api.putApiV1AdminBannersBatchSort

/**
 * 批量更新Banner状态
 */
export const batchUpdateBannerStatus = api.putApiV1AdminBannersBatchStatus

// ==================== 角色管理相关 API ====================

/**
 * 获取角色列表
 */
export const getRoles = api.getApiV1AdminRoles

/**
 * 创建角色
 */
export const createRole = api.postApiV1AdminRoles

/**
 * 获取角色详情
 */
export const getRole = api.getApiV1AdminRolesId

/**
 * 更新角色
 */
export const updateRole = api.putApiV1AdminRolesId

/**
 * 删除角色
 */
export const deleteRole = api.deleteApiV1AdminRolesId

/**
 * 获取角色权限
 */
export const getRolePermissions = api.getApiV1AdminRolesIdPermissions

// ==================== 权限管理相关 API ====================

/**
 * 获取所有权限
 */
export const getPermissions = api.getApiV1AdminPermissions

/**
 * 创建权限
 */
export const createPermission = api.postApiV1AdminPermissions

/**
 * 获取权限详情
 */
export const getPermission = api.getApiV1AdminPermissionsCode

/**
 * 更新权限
 */
export const updatePermission = api.putApiV1AdminPermissionsCode

/**
 * 删除权限
 */
export const deletePermission = api.deleteApiV1AdminPermissionsCode

// ==================== 批量操作相关 API ====================

/**
 * 批量更新状态
 * @deprecated 请使用具体的批量更新API
 * 例如：batchUpdateAnnouncementStatus, batchUpdateBannerStatus 等
 */
export const batchUpdateStatus = (..._args: any[]) => {
  throw new Error(
    '[DEPRECATED] batchUpdateStatus 已被移除。\n' +
      '请使用具体的批量更新API：\n' +
      '  - batchUpdateAnnouncementStatus() - 批量更新公告状态\n' +
      '  - batchUpdateBannerStatus() - 批量更新Banner状态\n' +
      '  - 或其他特定模块的批量更新方法',
  )
}

/**
 * 批量删除
 * @deprecated 请使用具体的批量删除API
 * 例如：batchDeleteUsers, batchDeleteAnnouncements 等
 */
export const batchDelete = (..._args: any[]) => {
  throw new Error(
    '[DEPRECATED] batchDelete 已被移除。\n' +
      '请使用具体的批量删除API：\n' +
      '  - batchDeleteUsers() - 批量删除用户\n' +
      '  - batchDeleteAnnouncements() - 批量删除公告\n' +
      '  - 或其他特定模块的批量删除方法',
  )
}

/**
 * 审核提现
 */
export const reviewWithdrawRequest = api.postApiV1AdminWithdrawReview

/**
 * 导出原始getApi函数（高级用法）
 * 可以传入自定义axios实例
 */
export { getApi }

/**
 * 默认导出
 */
export default {
  // 仪表盘相关
  getDashboardStats,
  getStats,
  // 审核相关
  getReviewList,
  getPendingReviews,
  getPendingAudits,
  getHighRiskAudits,
  getAuditStatistics,
  reviewAudit,
  reviewContent,
  reviewAppeal,
  // 提现相关
  getWithdrawalList,
  getWithdrawalStats,
  handleWithdrawal,
  reviewWithdraw,
  reviewWithdrawRequest,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  // 用户管理相关
  getUserList,
  getUserCountsByStatus,
  createUser,
  batchCreateUsers,
  updateUser,
  deleteUser,
  updateUserStatus,
  assignRole,
  updateUserRole,
  batchDeleteUsers,
  batchUpdateUserStatus,
  // 操作日志相关
  getOperationLogs,
  // 配额管理相关
  getUserQuotaDetails,
  updateUserQuota,
  suspendUserQuota,
  activateUserQuota,
  updateQuota,
  // 公告管理相关
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  batchUpdateAnnouncementStatus,
  batchDeleteAnnouncements,
  // 配置管理相关
  getAllConfigs,
  getConfigByKey,
  updateConfig,
  batchUpdateConfig,
  validateConfig,
  systemConfig,
  // 配置备份相关
  getConfigBackups,
  restoreConfigBackup,
  // Banner管理相关
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  batchUpdateBannerSort,
  batchUpdateBannerStatus,
  // 角色管理相关
  getRoles,
  createRole,
  getRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  // 权限管理相关
  getPermissions,
  createPermission,
  getPermission,
  updatePermission,
  deletePermission,
  // 批量操作相关
  batchUpdateStatus,
  batchDelete,
  // 工具函数
  getApi,
}

// 导出为默认对象，以支持 import { adminAPI } from './api'
const adminAPIExport = {
  // 仪表盘
  getDashboardStats,
  getStats,
  // 审核相关
  getPendingAudits,
  getReviewList,
  getPendingReviews,
  getHighRiskAudits,
  getAuditStatistics,
  reviewAudit,
  reviewContent,
  reviewAppeal,
  // 用户管理
  getUserList,
  getUserCountsByStatus,
  createUser,
  batchCreateUsers,
  updateUser,
  deleteUser,
  updateUserStatus,
  assignRole,
  updateUserRole,
  batchDeleteUsers,
  batchUpdateUserStatus,
  // 操作日志
  getOperationLogs,
  // 配额管理
  getUserQuotaDetails,
  updateUserQuota,
  suspendUserQuota,
  activateUserQuota,
  // 分类管理
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  // 公告管理
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  batchUpdateAnnouncementStatus,
  batchDeleteAnnouncements,
  // 配置管理
  getAllConfigs,
  getConfigByKey,
  updateConfig,
  batchUpdateConfig,
  validateConfig,
  systemConfig,
  // 配置备份
  getConfigBackups,
  restoreConfigBackup,
  // Banner管理
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  batchUpdateBannerSort,
  batchUpdateBannerStatus,
  // 角色管理
  getRoles,
  createRole,
  getRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  // 权限管理
  getPermissions,
  createPermission,
  getPermission,
  updatePermission,
  deletePermission,
  // 提现审核
  getWithdrawalList,
  getWithdrawalStats,
  handleWithdrawal,
  reviewWithdraw,
  reviewWithdrawRequest,
  // 工具函数
  getApi,
}

export const adminAPI = adminAPIExport
