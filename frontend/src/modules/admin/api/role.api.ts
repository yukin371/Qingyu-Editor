/**
 * Admin role.api - 角色权限管理相关 API
 */

import { api } from './shared'

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
