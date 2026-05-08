/**
 * 用户模块 API 统一导出
 *
 * 导出所有用户相关 API 模块
 *
 * @module user/api
 */

// 用户核心 API
export {
  userAPI,
  getProfile,
  updateProfile,
  getBookshelf,
  getReadingHistory,
  uploadAvatar,
} from './user.api'
export type { UserProfile, UpdateProfileData, AvatarUploadResponse } from './user.api'

// 用户个人资料 API
export {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar as uploadProfileAvatar,
} from './profile'

// 用户安全功能 API
export * from './security'
export {
  sendPhoneVerifyCode,
  bindPhone,
  changePhone,
  unbindPhone,
  sendEmailVerifyCode,
  bindEmail,
  changeEmail,
  unbindEmail,
  verifyEmail,
  changePasswordSecure as changeSecurityPassword,
  sendPasswordResetCode,
  verifyResetCode,
  resetPassword,
  getLoginDevices,
  removeDevice,
  cancelAccount
} from './security'

// 关注功能 API
export * from './follow'
export { followAPI, followUser, unfollowUser, checkFollowStatus, getFollowers, getFollowing, getFollowingAuthors } from './follow'
