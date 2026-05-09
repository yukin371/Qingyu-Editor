import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { setupTestModeGuard } from './test-mode-guard'

// 配置 NProgress
NProgress.configure({ showSpinner: false })

/**
 * 设置全局路由守卫
 */
export function setupRouterGuards(router: Router) {
  createProgressGuard(router)
  createTitleGuard(router)
  createDesktopEntryGuard(router)
  setupTestModeGuard(router)
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
    const appTitle = import.meta.env.VITE_APP_TITLE || '青羽写作'
    if (to.meta.title) {
      document.title = `${to.meta.title} - ${appTitle}`
    } else {
      document.title = appTitle
    }
  })
}

/**
 * 3. 桌面宿主入口守卫
 */
function createDesktopEntryGuard(router: Router) {
  router.beforeEach((to) => {
    const isAuthEntryPath = ['/auth', '/login', '/register'].includes(to.path)

    if (isAuthEntryPath) {
      return { path: '/', replace: true }
    }

    return true
  })
}
