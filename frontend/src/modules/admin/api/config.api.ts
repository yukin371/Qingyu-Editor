/**
 * Admin config.api - 配置管理相关 API
 */

import { api } from './shared'

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
