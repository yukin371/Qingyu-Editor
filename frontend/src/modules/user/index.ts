/**
 * User Module Export
 */

// Services
export { userService } from './services/user.service'
export { walletService } from './services/wallet.service'

// API
export { userAPI } from './api/user.api'
// walletAPI 已移至 shared 模块，请从 @/modules/shared/api 导入

// Stores
export { useAuthStore } from '@/stores/auth'
export { useUserStore } from '@/stores/user'
export { useWalletStore } from '@/stores/wallet'

// Types
export * from './types/user.types'
