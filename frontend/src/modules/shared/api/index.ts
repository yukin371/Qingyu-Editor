/**
 * 共享服务 API 统一导出
 *
 * 导出所有共享服务相关 API 模块（认证、钱包、存储）
 *
 * @module shared/api
 */

// 认证服务
export * from './auth'
export { sharedAuthAPI, register, login, logout, refreshToken, getUserPermissions, getUserRoles } from './auth'

// 钱包服务
export * from './wallet'
export { walletAPI, getBalance, getWallet, recharge, consume, transfer, getTransactions, submitWithdraw, getWithdrawRequests } from './wallet'

// 存储服务
export * from './storage'
export { storageAPI, uploadFile, downloadFile, deleteFile, getFileInfo, listFiles, getFileURL } from './storage'
