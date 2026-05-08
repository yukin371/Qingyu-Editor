/**
 * Admin API 统一导出
 * 导出wrapper层的所有API方法
 */

// 导出各模块 API
export * from './dashboard.api'
export * from './user.api'
export * from './withdrawal.api'
export * from './category.api'
export * from './announcement.api'
export * from './banner.api'
export * from './config.api'
export * from './role.api'
export * from './audit.api'
export * from './operation-log.api'

// 导出共享工具
export { getApi } from './shared'

// 导出类型
export type {
  AdminListResult,
  AdminCategory,
  AdminWithdrawalItem,
  AdminWithdrawalStats,
} from './shared'

// ==================== 兼容别名 ====================

// 仪表盘统计别名
export { getStats } from './dashboard.api'

// 审核相关别名（从 audit.api 重新导出）
export { getPendingAudits as getReviewList } from './audit.api'
export { getPendingAudits as getPendingReviews } from './audit.api'
export { reviewAudit as reviewContent } from './audit.api'

// 提现相关别名（从 withdrawal.api 重新导出）
export { handleWithdrawal as reviewWithdraw } from './withdrawal.api'

// 配额管理相关别名（从 user.api 重新导出）
export { updateUserQuota as updateQuota } from './user.api'

// ==================== 默认导出 ====================

// 从各模块导入用于默认导出
import { getDashboardStats, getStats } from './dashboard.api'
import {
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
  getUserQuotaDetails,
  updateUserQuota,
  suspendUserQuota,
  activateUserQuota,
} from './user.api'
import {
  getWithdrawalList,
  getWithdrawalStats,
  handleWithdrawal,
  reviewWithdraw,
} from './withdrawal.api'
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from './category.api'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  batchUpdateAnnouncementStatus,
  batchDeleteAnnouncements,
} from './announcement.api'
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  batchUpdateBannerSort,
  batchUpdateBannerStatus,
} from './banner.api'
import {
  getAllConfigs,
  getConfigByKey,
  updateConfig,
  batchUpdateConfig,
  validateConfig,
  systemConfig,
  getConfigBackups,
  restoreConfigBackup,
} from './config.api'
import {
  getRoles,
  createRole,
  getRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  getPermissions,
  createPermission,
  getPermission,
  updatePermission,
  deletePermission,
} from './role.api'
import {
  getPendingAudits,
  getHighRiskAudits,
  getAuditStatistics,
  reviewAudit,
  reviewAppeal,
} from './audit.api'
import { getOperationLogs } from './operation-log.api'
import { getApi } from './shared'

// 兼容别名
const getReviewList = getPendingAudits
const getPendingReviews = getPendingAudits
const reviewContent = reviewAudit
const updateQuota = updateUserQuota

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
  batchUpdateStatus: (..._args: any[]) => {
    throw new Error(
      '[DEPRECATED] batchUpdateStatus 已被移除。\n' +
        '请使用具体的批量更新API：\n' +
        '  - batchUpdateAnnouncementStatus() - 批量更新公告状态\n' +
        '  - batchUpdateBannerStatus() - 批量更新Banner状态\n' +
        '  - 或其他特定模块的批量更新方法',
    )
  },
  batchDelete: (..._args: any[]) => {
    throw new Error(
      '[DEPRECATED] batchDelete 已被移除。\n' +
        '请使用具体的批量删除API：\n' +
        '  - batchDeleteUsers() - 批量删除用户\n' +
        '  - batchDeleteAnnouncements() - 批量删除公告\n' +
        '  - 或其他特定模块的批量删除方法',
    )
  },
  // 工具函数
  getApi,
}

// 导出为默认对象，以支持 import { adminAPI } from './api'
export const adminAPI = {
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
  updateQuota,
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
  // 工具函数
  getApi,
}
