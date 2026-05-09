import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Qingyu 全局服务
import { message, messageBox, notification } from '@/design-system/services'

// 主题系统 - 必须在样式之前初始化
import { initTheme } from '@/design-system/tokens/theme'
initTheme() // 自动从 localStorage 读取保存的主题，如果没有则使用默认的青羽主题

// 测试模式 API 拦截器
import { initTestModeApiInterceptor } from '@/utils/test-mode-api-interceptor'
initTestModeApiInterceptor() // 初始化测试模式 API 拦截器

// 全局样式
import './style.css' // Tailwind CSS - MUST be imported first
import '@/styles/variables.scss'
import '@/styles/reader-variables.scss' // TDD Phase 2: 阅读器设计系统变量
import '@/design-system/themes/vscode-dark.scss' // VSCode 深色主题
import '@/design-system/themes/editor-themes.css' // 编辑器多主题 token
import '@/styles/common.scss'

// 全局指令
import { vLazy } from '@/directives/lazy'
import { vSafeHtml } from '@/directives/safeHtml'

// 全局错误处理
import { createVueErrorHandler, createPromiseRejectionHandler } from './utils/errorHandler'

// 性能监控

const app = createApp(App)
const pinia = createPinia()

// 注册全局指令
app.directive('lazy', vLazy)
app.directive('safe-html', vSafeHtml)

// Vue错误处理
app.config.errorHandler = createVueErrorHandler()

// Promise拒绝处理
window.addEventListener('unhandledrejection', createPromiseRejectionHandler())

// 性能监控
const isDev = (import.meta as any).env?.DEV
if (isDev) {
  // 仅在开发环境按需加载调试能力，避免进入生产首屏主包
  void import('./utils/performance').then(({ performanceMonitor, measureFirstScreenTime }) => {
    measureFirstScreenTime((time) => {
      console.log(`[Performance] 首屏渲染时间: ${time}ms`)
    })

    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = performanceMonitor.collectPageMetrics()
        console.log('[Performance] 页面性能指标:', metrics)
      }, 1000)
    })
  })

  void import('./utils/api-health').then(({ initApiHealthCheck }) => {
    initApiHealthCheck()
  })
}

// 先注册 Pinia，确保 store 可用
app.use(pinia)
// 再注册 Router，路由守卫需要访问 store
app.use(router)
// 注册 Qingyu 全局服务（兼容 Element Plus API）
app.config.globalProperties.$message = message
app.config.globalProperties.$MessageBox = messageBox
app.config.globalProperties.$notify = notification

// 添加类型声明
declare module 'vue' {
  export interface ComponentCustomProperties {
    $message: typeof message
    $MessageBox: typeof messageBox
    $notify: typeof notification
  }
}

const bootstrap = async () => {
  const { default: ElementPlus } = await import('element-plus')
  app.use(ElementPlus)

  app.mount('#app')
}

void bootstrap()
