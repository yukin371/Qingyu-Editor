/**
 * API健康检查工具
 * 用于检测后端服务是否可用
 */

import { ref } from 'vue'
import { isRemoteWriterMode } from '@/modules/writer/data-bridge/wails'

interface HealthCheckResult {
  healthy: boolean
  latency?: number
  error?: string
}

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!configured) {
    return '/api/v1'
  }
  if (/^https?:\/\//.test(configured) || configured.startsWith('/')) {
    return configured.replace(/\/$/, '')
  }
  return `/${configured.replace(/^\/+/, '').replace(/\/$/, '')}`
}

function shouldCheckRemoteApiHealth(): boolean {
  return import.meta.env.DEV && isRemoteWriterMode()
}

/**
 * 检查API健康状态
 */
export async function checkApiHealth(): Promise<HealthCheckResult> {
  if (!shouldCheckRemoteApiHealth()) {
    return { healthy: true }
  }

  const startTime = performance.now()
  const apiBaseUrl = getApiBaseUrl()

  try {
    // 请求后端健康检查接口
    // 注意：后端 health 端点在 /api/v1/system/health
    const response = await fetch(`${apiBaseUrl}/system/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })

    const latency = Math.round(performance.now() - startTime)

    if (response.ok) {
      return { healthy: true, latency }
    } else {
      return {
        healthy: false,
        latency,
        error: `HTTP ${response.status}`
      }
    }
  } catch (error: any) {
    const latency = Math.round(performance.now() - startTime)

    // 如果是开发环境，可能是后端未启动
    if (import.meta.env.DEV) {
      return {
        healthy: false,
        latency,
        error: '后端服务未启动或无法连接'
      }
    }

    return {
      healthy: false,
      latency,
      error: error.message || '网络连接失败'
    }
  }
}

/**
 * 在开发环境启动时执行健康检查
 */
export function initApiHealthCheck() {
  if (!shouldCheckRemoteApiHealth()) return

  checkApiHealth().then((result) => {
    if (result.healthy) {
      console.log(
        `%c✓ API服务正常 (${result.latency}ms)`,
        'color: #67c23a; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
      )
    } else {
      console.warn(
        `%c⚠️ API服务异常: ${result.error}`,
        'color: #e6a23c; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
      )
      console.warn(
        '%c提示: 请确保后端服务已启动在 ' + getApiBaseUrl(),
        'color: #909399; padding: 4px 8px;'
      )
    }
  })
}

/**
 * 创建API状态监控组件（可选）
 */
export function createApiStatusMonitor() {
  const shouldCheck = shouldCheckRemoteApiHealth()
  const status = ref<'checking' | 'healthy' | 'unhealthy'>(shouldCheck ? 'checking' : 'healthy')
  const latency = ref<number>(0)
  const error = ref<string>('')

  const check = async () => {
    status.value = 'checking'
    const result = await checkApiHealth()
    status.value = result.healthy ? 'healthy' : 'unhealthy'
    latency.value = result.latency || 0
    error.value = result.error || ''
  }

  // 开发环境每30秒检查一次
  if (shouldCheck) {
    check()
    setInterval(check, 30000)
  }

  return { status, latency, error, check }
}
