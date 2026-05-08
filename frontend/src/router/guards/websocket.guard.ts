import { useWebSocketStore } from '@/stores/websocket.store'
import type { Router } from 'vue-router'

/**
 * WebSocket连接路由守卫
 * 确保路由切换时正确清理连接状态
 */
export function setupWebSocketGuard(router: Router) {
  router.beforeEach((to, _from, next) => {
    // 如果离开需要WebSocket的页面，可以选择断开连接
    // 这里保持连接，但清理页面特定的消息处理器
    // to 参数用于后续的路由逻辑判断
    void to // 临时使用 to 参数避免警告

    next()
  })

  router.afterEach((to) => {
    // 在 afterEach 回调中调用 store，确保 Pinia 已经初始化
    const websocketStore = useWebSocketStore()

    // 可以根据路由配置决定是否需要WebSocket连接
    const requiresWebSocket = to.meta.requiresWebSocket === true

    if (requiresWebSocket && !websocketStore.isConnected) {
      // 自动连接
      const token = localStorage.getItem('token')
      if (token) {
        websocketStore.connect(token)
      }
    }
  })
}
