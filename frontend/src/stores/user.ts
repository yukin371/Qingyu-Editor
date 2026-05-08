/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { message } from '@/design-system/services'
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types/user'
import { login, logout, register } from '@/modules/shared/api/auth'
import { useAuthStore } from '@/stores/auth'
import storage, { readStoredAuthToken } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  const authStore = useAuthStore()

  // 状态
  const token = ref<string>(readStoredAuthToken() || '')
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  const resolvePrimaryRole = (user?: Partial<UserInfo> | null) => {
    const roles = Array.isArray((user as any)?.roles) ? (user as any).roles : []
    if (roles.includes('admin')) return 'admin'
    if (roles.includes('author')) return 'author'
    if (roles.includes('writer')) return 'author'
    if (roles.includes('reader')) return 'reader'

    const role = String(user?.role || '').toLowerCase()
    if (role) {
      return role === 'writer' ? 'author' : role
    }

    return 'user'
  }

  const normalizeRoles = (user?: Partial<UserInfo> | null) => {
    const roles = Array.isArray((user as any)?.roles)
      ? (user as any).roles
          .map((role: unknown) => String(role || '').toLowerCase())
          .map((role: string) => (role === 'writer' ? 'author' : role))
          .filter(Boolean)
      : []

    if (roles.length > 0) {
      return Array.from(new Set(roles))
    }

    const primaryRole = resolvePrimaryRole(user)
    return primaryRole === 'user' ? [] : [primaryRole]
  }

  const syncAuthStoreUser = (nextUser: UserInfo | null) => {
    if (!nextUser) return

    const nextRoles = normalizeRoles(nextUser)
    const resolvedRoles =
      nextRoles.length > 0
        ? nextRoles
        : Array.isArray((authStore.user as any)?.roles)
          ? (authStore.user as any).roles
          : authStore.roles

    authStore.user = {
      ...(authStore.user || {}),
      ...nextUser,
      role: resolvePrimaryRole(nextUser),
      roles: resolvedRoles,
    } as any
    authStore.roles = resolvedRoles
    storage.set('user', authStore.user)
    storage.set('roles', resolvedRoles)
  }

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isWriter = computed(() =>
    ['writer', 'author', 'admin'].includes(resolvePrimaryRole(userInfo.value)),
  )
  const isAdmin = computed(() => resolvePrimaryRole(userInfo.value) === 'admin')

  // 用户资料相关计算属性
  const profile = computed(() => userInfo.value)
  const username = computed(() => userInfo.value?.username || '')
  const email = computed(() => userInfo.value?.email || '')
  const displayName = computed(() => userInfo.value?.nickname || userInfo.value?.username || '用户')
  const avatar = computed(() => userInfo.value?.avatar || '')

  /**
   * 用户登录
   */
  async function handleLogin(loginData: LoginRequest) {
    try {
      isLoading.value = true
      const response = await login(loginData)

      // HTTP拦截器已经解包了data字段，response直接是 { user, token }
      const { token: responseToken, user } = response

      if (!responseToken) {
        throw new Error('服务端返回数据异常：缺少 token')
      }

      token.value = responseToken

      // 适配后端返回的用户数据
      const adaptedUser: UserInfo = {
        ...user,
        role: resolvePrimaryRole(user as UserInfo),
      }

      userInfo.value = adaptedUser
      syncAuthStoreUser(adaptedUser)

      // 保存token到localStorage
      localStorage.setItem('qingyu_token', JSON.stringify(responseToken))
      localStorage.setItem('token', responseToken)

      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户注册
   */
  async function handleRegister(registerData: RegisterRequest) {
    try {
      isLoading.value = true
      await register(registerData)

      // 注册成功后自动登录
      return await handleLogin({
        username: registerData.username,
        password: registerData.password,
      })
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户登出
   */
  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败:', error)
      // 404错误说明后端没有这个API，忽略即可
    } finally {
      // 无论API调用是否成功，都清除本地状态
      token.value = ''
      userInfo.value = null
      authStore.clearAuth()
      localStorage.removeItem('qingyu_token')
      localStorage.removeItem('token')
      localStorage.removeItem('qingyu_user')
      localStorage.removeItem('user')
      localStorage.removeItem('qingyu_roles')
      localStorage.removeItem('roles')
      message.success('已退出登录')
    }
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    if (!token.value) {
      return
    }

    try {
      isLoading.value = true
      const { sharedAuthAPI } = await import('@/modules/shared/api/auth')
      const response = await sharedAuthAPI.getUserInfo()
      const normalizedUser = {
        ...(response.user as any),
        role: resolvePrimaryRole(response.user as any),
      }
      userInfo.value = normalizedUser as any
      syncAuthStoreUser(userInfo.value)
      return response.user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果token失效，清除登录状态
      if ((error as any).code === 401) {
        handleLogout()
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新用户信息
   */
  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      const nextUserInfo = { ...userInfo.value, ...info }
      userInfo.value = {
        ...nextUserInfo,
        role: resolvePrimaryRole(nextUserInfo),
      }
      syncAuthStoreUser(userInfo.value)
    }
  }

  /**
   * 获取用户详细资料
   */
  async function fetchProfile() {
    return fetchUserInfo()
  }

  /**
   * 更新用户资料
   */
  async function updateProfile(data: any) {
    try {
      isLoading.value = true
      const { sharedAuthAPI } = await import('@/modules/shared/api/auth')
      const response = await sharedAuthAPI.updateUserInfo(data)
      updateUserInfo(response.user as any)
      return response.user
    } catch (error) {
      console.error('更新资料失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    token,
    userInfo,
    isLoading,

    // 计算属性
    isLoggedIn,
    isWriter,
    isAdmin,
    profile,
    username,
    email,
    displayName,
    avatar,

    // 方法
    handleLogin,
    handleRegister,
    handleLogout,
    fetchUserInfo,
    updateUserInfo,
    fetchProfile,
    updateProfile,
  }
})
