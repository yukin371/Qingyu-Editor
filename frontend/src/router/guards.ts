import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useAuthStore } from '@/stores/auth'
import { setupWebSocketGuard } from './guards/websocket.guard'
import { setupTestModeGuard } from './test-mode-guard'

// 配置 NProgress
NProgress.configure({ showSpinner: false })

/**
 * 设置全局路由守卫
 */
export function setupRouterGuards(router: Router) {
  createProgressGuard(router)
  createTitleGuard(router)
  setupTestModeGuard(router)
  createAuthGuard(router)
  setupWebSocketGuard(router)
}

/**
 * 1. 进度条守卫
 */
function createProgressGuard(router: Router) {
  router.beforeEach(() => {
    NProgress.start()
  })

  router.afterEach(() => {
    NProgress.done()
  })
}

/**
 * 2. 标题守卫
 */
function createTitleGuard(router: Router) {
  router.afterEach((to) => {
    // 使用 afterEach 设置标题更合理，防止跳转失败标题却变了
    const appTitle = import.meta.env.VITE_APP_TITLE || '青羽写作平台'
    if (to.meta.title) {
      document.title = `${to.meta.title} - ${appTitle}`
    } else {
      document.title = appTitle
    }
  })
}

/**
 * 3. 核心认证与权限守卫
 */
function createAuthGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const routeTestFlag = to.query?.test
    const fromTestFlag = from.query?.test
    const currentUrlTestMode = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('test') === 'true'
      : false
    const routeHasTestMode =
      routeTestFlag === 'true' ||
      (Array.isArray(routeTestFlag) && routeTestFlag.some((v) => v === 'true')) ||
      fromTestFlag === 'true' ||
      (Array.isArray(fromTestFlag) && fromTestFlag.some((v) => v === 'true')) ||
      currentUrlTestMode ||
      to.hash.includes('test=true')
    authStore.ensureTestModeMockSession(routeHasTestMode)

    const isAuthEntryPath = ['/auth', '/login', '/register'].includes(to.path)

    // 本地编辑器不展示登录页，认证入口统一回到编辑器
    if (isAuthEntryPath) {
      next({ path: '/', replace: true })
      return
    }

    // 本地宿主默认可直接使用，必要时自动补齐 mock 会话
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      authStore.ensureTestModeMockSession(true)
      next()
      return
    }

    // 3.3 角色/权限检查
    // 假设路由 meta 中定义了 roles 数组: meta: { roles: ['author', 'admin'] }
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const requiredRoles = to.meta.roles
      const hasRole = authStore.roles?.some((role: string) => requiredRoles.includes(role))

      if (!hasRole) {
        next({ path: '/403', replace: true })
        return
      }
    }

    // 3.4 动态路由加载 (如果你的应用涉及后端返回路由表)
    // if (authStore.isLoggedIn && !authStore.routesLoaded) {
    //    await authStore.generateRoutes()
    //    next({ ...to, replace: true })
    //    return
    // }

    next()
  })
}
