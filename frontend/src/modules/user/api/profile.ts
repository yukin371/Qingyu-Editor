/**
 * 用户 - 个人资料相关API
 *
 * 后端路由: /api/v1/user/*
 * 需要认证: JWT Token
 */

import { httpService } from '@/core/services/http.service'
import type { UserInfo, UpdateProfileRequest } from '@/types/user'

/**
 * 获取当前用户信息
 * GET /api/v1/user/profile
 */
export function getUserProfile() {
  return httpService.get<UserInfo>('/user/profile')
}

/**
 * 更新当前用户信息
 * PUT /api/v1/user/profile
 */
export function updateUserProfile(data: UpdateProfileRequest) {
  return httpService.put<UserInfo>('/user/profile', data)
}

/**
 * 修改密码
 * PUT /api/v1/user/password
 */
export function changePassword(oldPassword: string, newPassword: string) {
  return httpService.put<void>('/user/password', {
    oldPassword,
    newPassword,
  })
}

/**
 * 上传头像
 * POST /api/v1/user/avatar
 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)
  return httpService.post<{ url: string }>('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

