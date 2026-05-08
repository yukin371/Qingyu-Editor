/**
 * User Service
 * Business logic for user management
 */

import * as userAPI from '@/modules/user/api'
import type { UserProfile, UpdateProfileParams } from '../types/user.types'
import { validationService } from '@/core/services/validation.service'

class UserService {
  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    return await userAPI.getUserProfile() as UserProfile
  }

  /**
   * Update user profile
   */
  async updateUserProfile(data: UpdateProfileParams): Promise<void> {
    // Validate data
    if (data.email) {
      const emailValidation = validationService.validateEmail(data.email)
      if (!emailValidation.valid) {
        throw new Error(emailValidation.message)
      }
    }

    if (data.phone) {
      const phoneValidation = validationService.validatePhone(data.phone)
      if (!phoneValidation.valid) {
        throw new Error(phoneValidation.message)
      }
    }

    await userAPI.updateUserProfile(data)
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    // Validate new password
    const validation = validationService.validatePassword(newPassword)
    if (!validation.valid) {
      throw new Error(validation.message)
    }

    await userAPI.changePassword(oldPassword, newPassword)
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    // Validate file
    const sizeValidation = validationService.validateFileSize(file, 5 * 1024 * 1024) // 5MB
    if (!sizeValidation.valid) {
      throw new Error(sizeValidation.message)
    }

    const typeValidation = validationService.validateFileType(file, ['image/jpeg', 'image/png', 'image/gif'])
    if (!typeValidation.valid) {
      throw new Error(typeValidation.message)
    }

    const result = await userAPI.uploadAvatar(file)
    return result.url
  }

  /**
   * Format user role
   */
  formatUserRole(role: string): string {
    const roleMap: Record<string, string> = {
      guest: '游客',
      user: '普通用户',
      author: '作者',
      admin: '管理员'
    }
    return roleMap[role] || role
  }

  /**
   * Check if user has role
   */
  hasRole(userRoles: string[], requiredRole: string): boolean {
    return userRoles.includes(requiredRole)
  }
}

export const userService = new UserService()
export default userService

