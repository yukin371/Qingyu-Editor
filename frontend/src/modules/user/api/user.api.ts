
/**
 * 用户模块API
 */

import { httpService } from '@/core/services/http.service'

export interface UserProfile {
  id: string
  username: string
  email: string
  nickname?: string
  avatar?: string
  bio?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfileData {
  nickname?: string
  bio?: string
  avatar?: string
}

export interface AvatarUploadResponse {
  url: string
}

/**
 * 用户API
 */
export const userAPI = {
  /**
   * 获取用户信息
   */
  async getProfile(): Promise<UserProfile> {
    return httpService.get<UserProfile>('/user/profile')
  },

  /**
   * 更新用户信息
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    return httpService.put<UserProfile>('/user/profile', data)
  },

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData()
    formData.append('avatar', file)

    return httpService.post<AvatarUploadResponse>('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 获取用户书架
   * 注意：使用reader路径，因为这是读者功能而非用户管理功能
   */
  async getBookshelf(): Promise<any[]> {
    return httpService.get<any[]>('/reader/books')
  },

  /**
   * 获取阅读历史
   * 注意：使用reader路径，因为这是读者功能而非用户管理功能
   */
  async getReadingHistory(): Promise<any[]> {
    return httpService.get<any[]>('/reader/reading-history')
  }
}

// 便捷导出函数，提供更简洁的 API 调用方式
export const getProfile = () => userAPI.getProfile()
export const updateProfile = (data: UpdateProfileData) => userAPI.updateProfile(data)
export const uploadAvatar = (file: File) => userAPI.uploadAvatar(file)
export const getBookshelf = () => userAPI.getBookshelf()
export const getReadingHistory = () => userAPI.getReadingHistory()

export default userAPI
