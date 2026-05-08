import { defineStore } from 'pinia'
import { sharedAuthAPI as authAPI } from '@/modules/shared/api/auth'
import storage from '@/utils/storage'
// 移除对router的直接导入以避免循环依赖
// import router from '@/router'
import type { User, UserRole } from '@/types/models'
import type { LoginCredentials, RegisterData } from '@/types/auth'

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  ROLES: 'roles',
}

const TEST_MODE_MOCK_TOKEN = 'mock-token-for-testing'
const TEST_MODE_MOCK_REFRESH_TOKEN = 'mock-refresh-token-for-testing'

// 检查是否启用测试模式（URL参数：?test=true 或 #test）
function isTestMode(): boolean {
  if (typeof window === 'undefined') return false

  // 检查URL查询参数 ?test=true
  const urlParams = new URLSearchParams(window.location.search)
  const queryTest = urlParams.get('test') === 'true'

  // 检查URL hash #test
  const hashTest = window.location.hash.includes('#test') || window.location.hash.includes('?test')

  const isTestMode = queryTest || hashTest
  return isTestMode
}

function isMockToken(token: string | null | undefined): boolean {
  if (!token) return false
  const normalized = token.toString()
  return normalized.startsWith('mock-') || normalized.includes('mock')
}

/**
 * 认证状态接口
 */
export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean
  loading: boolean
  error: string | null
  permissions: string[]
  roles: string[]
}

type RoleSource = {
  roles?: string[]
  role?: string
}

function normalizeRole(role?: string | null): UserRole | '' {
  const normalized = String(role || '').toLowerCase()
  if (normalized === 'writer' || normalized === 'author') return 'author'
  if (normalized === 'admin') return 'admin'
  if (normalized === 'reader') return 'reader'
  return ''
}

function resolvePrimaryRole(role?: string | null, roles?: string[] | null): UserRole {
  const normalizedRole = normalizeRole(role)
  if (normalizedRole) return normalizedRole

  const normalizedRoles = Array.isArray(roles)
    ? (roles.map((item) => normalizeRole(item)).filter(Boolean) as UserRole[])
    : []

  if (normalizedRoles.includes('admin')) return 'admin'
  if (normalizedRoles.includes('author')) return 'author'
  if (normalizedRoles.includes('reader')) return 'reader'
  return 'reader'
}

function isUnauthorizedAuthError(error: unknown): boolean {
  const err = error as {
    response?: { status?: number; data?: { code?: string | number } }
    code?: string | number
  }

  const status = err?.response?.status
  const responseCode = err?.response?.data?.code
  const code = err?.code

  if (status === 401) return true

  const authErrorCodes = new Set<string | number>([
    1002,
    1102,
    1103,
    2007,
    2008,
    2009,
    2010,
    2016,
    '1002',
    '1102',
    '1103',
    '2007',
    '2008',
    '2009',
    '2010',
    '2016',
    'UNAUTHORIZED',
  ])

  return (
    authErrorCodes.has(responseCode as string | number) ||
    authErrorCodes.has(code as string | number)
  )
}

function normalizeRoles(user?: RoleSource | null, responseRoles?: string[] | null): string[] {
  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    return Array.from(new Set(user.roles.map((role) => normalizeRole(role)).filter(Boolean)))
  }
  if (Array.isArray(responseRoles) && responseRoles.length > 0) {
    return Array.from(new Set(responseRoles.map((role) => normalizeRole(role)).filter(Boolean)))
  }
  if (typeof user?.role === 'string' && user.role.length > 0) {
    return [normalizeRole(user.role)].filter(Boolean)
  }
  return []
}

function normalizeStoredRoles(roles?: string[] | null): string[] {
  return normalizeRoles({ roles: Array.isArray(roles) ? roles : [] }, null)
}

function resolveRolesForUser(user?: RoleSource | null, fallbackRoles?: string[] | null): string[] {
  const normalizedRoles = normalizeRoles(user, fallbackRoles)
  if (normalizedRoles.length > 0) {
    return normalizedRoles
  }

  const storedRoles = normalizeStoredRoles(fallbackRoles)
  if (storedRoles.length > 0) {
    return storedRoles
  }

  const primaryRole = resolvePrimaryRole(user?.role, fallbackRoles)
  return primaryRole ? [primaryRole] : []
}

/**
 * 密码修改数据
 */
export interface PasswordChangeData {
  old_password: string
  new_password: string
}

/**
 * 邮箱验证数据
 */
export interface EmailVerificationData {
  email: string
  code: string
}

/**
 * 密码重置数据
 */
export interface PasswordResetData {
  email: string
  code: string
  new_password: string
}

function createTestModeMockUser(): User {
  const now = new Date().toISOString()
  return {
    id: 'mock-user-001',
    username: 'demo_user',
    nickname: '测试用户',
    email: 'demo@example.com',
    // 使用 DiceBear 生成测试头像，确保头像可正常显示
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo-user',
    gender: 'unknown',
    bio: '这是测试模式下的模拟用户（拥有所有角色权限用于演示）',
    role: 'admin',
    level: 5,
    exp: 2500,
    balance: 0,
    readingTime: 1200,
    registerTime: now,
    lastLoginTime: now,
    isVip: false,
    // 测试模式拥有所有角色，可访问所有功能页面
    roles: ['admin', 'author', 'reader'],
    permissions: ['*'],
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    // 从storage恢复token
    const savedToken = storage.get<string>(STORAGE_KEYS.TOKEN)
    const savedRefreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN)
    const savedUser = storage.get<User>(STORAGE_KEYS.USER)
    const savedRoles = normalizeStoredRoles(storage.get<string[]>(STORAGE_KEYS.ROLES))
    const fallbackRoles = normalizeRoles(savedUser as unknown as RoleSource, null)

    return {
      // 用户信息
      user: savedUser,

      // 认证状态
      token: savedToken,
      refreshToken: savedRefreshToken,
      isLoggedIn: !!savedToken, // 有token就认为是已登录

      // 加载状态
      loading: false,

      // 错误信息
      error: null,

      // 权限列表
      permissions: [],

      // 角色列表 - 从storage恢复或使用user.roles
      roles: savedRoles.length > 0 ? savedRoles : fallbackRoles,
    }
  },

  getters: {
    // 获取用户头像
    userAvatar: (state): string => {
      return state.user?.avatar || '/images/avatars/avatar-default.svg'
    },

    // 获取用户昵称
    userNickname: (state): string => {
      return state.user?.nickname || state.user?.username || '未登录用户'
    },

    // 获取用户邮箱
    userEmail: (state): string => {
      return state.user?.email || ''
    },

    // 检查是否有特定权限
    hasPermission:
      (state) =>
      (permission: string): boolean => {
        return state.permissions.includes(permission) || state.permissions.includes('*')
      },

    // 检查是否有特定角色
    hasRole:
      (state) =>
      (role: string): boolean => {
        return state.roles.includes(role)
      },

    // 检查是否为管理员
    isAdmin: (state): boolean => {
      return state.roles.includes('admin') || state.roles.includes('super_admin')
    },

    // 检查是否为VIP用户
    isVip: (state): boolean => {
      return state.user?.isVip || false
    },

    // 是否拥有作者身份（作者或管理员）
    hasAuthorRole: (state): boolean => {
      return state.roles.includes('author') || state.roles.includes('admin')
    },

    // 作者购买 AI 套餐折扣（85折）
    authorAIPackageDiscountRate: (state): number => {
      const hasAuthor = state.roles.includes('author') || state.roles.includes('admin')
      return hasAuthor ? 0.85 : 1
    },
  },

  actions: {
    // 发布作品后自动升级作者身份（前端状态兜底，避免等待下一次刷新）
    promoteToAuthorByPublishing(_showToast = true): void {
      const currentRoles = Array.isArray(this.roles) ? [...this.roles] : []
      const hasAuthor = currentRoles.includes('author') || currentRoles.includes('admin')
      if (hasAuthor) return

      this.roles = [...currentRoles, 'author']

      if (this.user) {
        const nextUserRoles = Array.from(new Set([...(this.user.roles || []), 'author']))
        this.user = {
          ...this.user,
          role: this.user.role === 'admin' ? 'admin' : 'author',
          roles: nextUserRoles,
        }
      }

      storage.set(STORAGE_KEYS.USER, this.user)
      storage.set(STORAGE_KEYS.ROLES, this.roles)
    },

    ensureTestModeMockSession(forceTestMode = false): void {
      if (!forceTestMode && !isTestMode()) return
      if (this.isLoggedIn && this.token && isMockToken(this.token) && this.user) return

      const mockUser = createTestModeMockUser()
      this.token = TEST_MODE_MOCK_TOKEN
      this.refreshToken = TEST_MODE_MOCK_REFRESH_TOKEN
      this.user = mockUser
      this.permissions = mockUser.permissions || []
      // 测试模式使用完整角色列表
      this.roles = mockUser.roles || ['admin', 'author', 'reader']
      this.isLoggedIn = true
      this.error = null

      storage.set(STORAGE_KEYS.TOKEN, this.token)
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken)
      storage.set(STORAGE_KEYS.USER, this.user)
      storage.set(STORAGE_KEYS.ROLES, this.roles)
      localStorage.setItem(STORAGE_KEYS.TOKEN, this.token)
    },

    // 初始化认证状态
    async initAuth(): Promise<void> {
      if (!this.token && isTestMode()) {
        this.ensureTestModeMockSession()
        return
      }

      if (this.token) {
        // 检查是否是测试模式的mock token
        const mockToken = isMockToken(this.token)

        // 只有在URL明确标记为测试模式时，才允许使用mock token
        const isTestModeEnabled = isTestMode()

        if (mockToken && !isTestModeEnabled) {
          // 发现mock token但URL没有测试模式标识，清空并要求真实登录
          if (import.meta.env.DEV)
            console.warn('[auth] 检测到mock token但URL未启用测试模式，清空token')
          this.clearAuth()
          return
        }

        if (mockToken && isTestModeEnabled) {
          // 测试模式：直接使用localStorage中的用户数据，不调用API
          this.isLoggedIn = true
          // 从storage恢复user数据（如果还没有的话）
          if (!this.user) {
            this.user = storage.get<User>(STORAGE_KEYS.USER)
          }
          // 优先从localStorage恢复roles，否则使用默认的完整角色列表
          const savedRoles = normalizeStoredRoles(storage.get<string[]>(STORAGE_KEYS.ROLES))
          if (savedRoles && savedRoles.length > 0) {
            this.roles = savedRoles
          } else {
            // 测试模式默认拥有所有角色
            this.roles = this.user?.roles || ['admin', 'author', 'reader']
          }
          this.permissions = this.user?.permissions || ['*']
          return
        }

        // 生产模式：确保roles有值
        if (!this.roles || this.roles.length === 0) {
          const savedRoles = normalizeStoredRoles(storage.get<string[]>(STORAGE_KEYS.ROLES))
          if (savedRoles && savedRoles.length > 0) {
            this.roles = savedRoles
          }
        }

        // 本地已有完整认证信息时，避免额外请求导致401中断路由流程
        if (this.user && this.roles && this.roles.length > 0) {
          this.isLoggedIn = true
          return
        }

        // 生产模式：调用API获取用户信息
        try {
          await this.getUserInfo()
          this.isLoggedIn = true
        } catch (error) {
          console.error('[initAuth] getUserInfo失败:', error)
          // 认证错误（401/token失效）必须清空状态，避免“看起来已登录但接口一直401”
          if (isUnauthorizedAuthError(error)) {
            this.clearAuth()
            return
          }

          // 非认证错误（如短时网络问题）允许从本地恢复，减少误登出
          const hasTokenInStorage = storage.has(STORAGE_KEYS.TOKEN)
          const hasRolesInStorage = storage.has(STORAGE_KEYS.ROLES)

          if (hasTokenInStorage && hasRolesInStorage) {
            // 从 localStorage 恢复状态，保持登录
            const savedUser = storage.get<User>(STORAGE_KEYS.USER)
            const savedRoles = normalizeStoredRoles(storage.get<string[]>(STORAGE_KEYS.ROLES))

            this.user = savedUser ?? null
            this.roles = savedRoles
            this.isLoggedIn = true
          } else {
            // 只有在完全没有存储数据时才清空
            this.clearAuth()
          }
        }
      }
    },

    // 用户登录
    async login(credentials: LoginCredentials): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.login(credentials)
        // 响应拦截器已经提取了data字段，所以response就是LoginResponse
        const data = response

        // 保存认证信息
        this.token = data.token
        this.refreshToken = data.refreshToken ?? null
        const normalizedRoles = normalizeRoles(data.user as RoleSource, data.roles)
        // 确保user对象包含roles字段，兼容后端 role(字符串) 与 roles(数组)
        this.user = data.user
          ? ({
              ...data.user,
              role: resolvePrimaryRole(data.user.role, normalizedRoles),
              roles: normalizedRoles,
            } as User)
          : null
        this.permissions = data.permissions || []
        this.roles = normalizedRoles
        this.isLoggedIn = true

        // 存储到本地
        storage.set(STORAGE_KEYS.TOKEN, this.token)
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken)
        storage.set(STORAGE_KEYS.USER, this.user)
        storage.set(STORAGE_KEYS.ROLES, this.roles)
        localStorage.setItem(STORAGE_KEYS.TOKEN, this.token || '')

        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 用户注册
    async register(userData: RegisterData): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.register(userData)
        // 响应拦截器已经提取了data字段，所以response就是LoginResponse
        const data = response

        // 注册成功后自动登录
        if (data.token) {
          const normalizedRoles = normalizeRoles(data.user as RoleSource, data.roles)
          this.token = data.token
          this.refreshToken = data.refreshToken ?? null
          this.user = data.user
            ? ({
                ...data.user,
                role: resolvePrimaryRole(data.user.role, normalizedRoles),
                roles: normalizedRoles,
              } as User)
            : null
          this.permissions = data.permissions || []
          this.roles = normalizedRoles
          this.isLoggedIn = true

          // 存储到本地
          storage.set(STORAGE_KEYS.TOKEN, this.token)
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken)
          storage.set(STORAGE_KEYS.USER, this.user)
          storage.set(STORAGE_KEYS.ROLES, this.roles)
          localStorage.setItem(STORAGE_KEYS.TOKEN, this.token || '')
        }

        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 用户登出
    async logout(): Promise<void> {
      try {
        // 调用登出接口
        if (this.token) {
          await authAPI.logout()
        }
      } catch (error) {
        console.error('登出接口调用失败:', error)
        throw error
      } finally {
        // 清除本地状态
        this.clearAuth()
      }
    },

    // 获取用户信息
    async getUserInfo(): Promise<any> {
      try {
        const response = await authAPI.getUserInfo()
        // http service 响应拦截器已提取 data 字段，response 直接是 { user, permissions?, roles? }
        const data = response as { user: User; permissions?: string[]; roles?: string[] }
        this.user = data.user || data
        this.permissions = data.permissions || []
        const userData = data.user || data
        const normalizedRoles = resolveRolesForUser(
          userData as RoleSource,
          data.roles || this.roles,
        )
        this.roles = normalizedRoles
        if (this.user) {
          this.user = {
            ...this.user,
            role: resolvePrimaryRole(this.user.role, normalizedRoles),
            roles: normalizedRoles,
          }
        }

        // 更新本地存储
        storage.set(STORAGE_KEYS.USER, this.user)
        storage.set(STORAGE_KEYS.ROLES, this.roles)

        return response
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    // 更新用户信息
    async updateUserInfo(userInfo: Partial<User>): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.updateUserInfo(userInfo)
        // http service 响应拦截器已提取 data 字段，response 直接是 { user }
        const data = response as { user: User; roles?: string[] }
        const nextUser = { ...(this.user || {}), ...data.user } as User
        const normalizedRoles = resolveRolesForUser(
          nextUser as RoleSource,
          data.roles || this.roles,
        )

        this.roles = normalizedRoles
        this.user = {
          ...nextUser,
          role: resolvePrimaryRole(nextUser.role, normalizedRoles),
          roles: normalizedRoles,
        }

        // 更新本地存储
        storage.set(STORAGE_KEYS.USER, this.user)
        storage.set(STORAGE_KEYS.ROLES, this.roles)

        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 修改密码
    async changePassword(passwordData: PasswordChangeData): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.changePassword(passwordData)
        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 刷新Token
    async refreshAuthToken(): Promise<any> {
      if (!this.refreshToken) {
        throw new Error('没有刷新令牌')
      }

      try {
        const response = await authAPI.refreshToken()
        // http service 响应拦截器已提取 data 字段，response 直接是 { token, expiresAt }
        const data = response as { token: string; expiresAt?: string; refreshToken?: string }

        if (data) {
          this.token = data.token
          // refreshToken 可能在响应中，否则保持原值
          if ('refreshToken' in data && data.refreshToken) {
            this.refreshToken = data.refreshToken
          }

          // 更新本地存储
          storage.set(STORAGE_KEYS.TOKEN, this.token)
          storage.set(STORAGE_KEYS.ROLES, this.roles)
          localStorage.setItem(STORAGE_KEYS.TOKEN, this.token || '')
          if ('refreshToken' in data && data.refreshToken) {
            storage.set(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken)
          }
        }

        return response
      } catch (error) {
        console.error('刷新Token失败:', error)
        this.clearAuth()
        throw error
      }
    },

    // 检查用户名是否可用
    async checkUsername(username: string): Promise<boolean> {
      try {
        const response = await authAPI.checkUsername(username)
        // http service 响应拦截器已提取 data 字段，response 直接是 { available, message? }
        return (response as { available?: boolean })?.available || false
      } catch (error) {
        console.error('检查用户名失败:', error)
        return false
      }
    },

    // 检查邮箱是否可用
    async checkEmail(email: string): Promise<boolean> {
      try {
        const response = await authAPI.checkEmail(email)
        // http service 响应拦截器已提取 data 字段，response 直接是 { available, message? }
        return (response as { available?: boolean })?.available || false
      } catch (error) {
        console.error('检查邮箱失败:', error)
        return false
      }
    },

    // 发送验证码
    async sendVerificationCode(email: string): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.sendVerificationCode(email)
        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 验证邮箱
    async verifyEmail(verificationData: EmailVerificationData): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.verifyEmail(verificationData)

        // 更新用户信息
        if (this.user) {
          this.user = { ...this.user, isVip: true }
          storage.set(STORAGE_KEYS.USER, this.user)
        }

        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 重置密码
    async resetPassword(resetData: PasswordResetData): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.resetPassword(resetData)
        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 清除认证状态
    clearAuth(): void {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isLoggedIn = false
      this.permissions = []
      this.roles = []
      this.error = null

      // 清除本地存储
      storage.remove(STORAGE_KEYS.TOKEN)
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.remove(STORAGE_KEYS.USER)
      storage.remove(STORAGE_KEYS.ROLES)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    },

    // 清除错误信息
    clearError(): void {
      this.error = null
    },
  },
})
