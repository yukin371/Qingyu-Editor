/**
 * API健康检查 - 使用说明
 *
 * 在 main.ts 中添加：
 *
 * import { initApiHealthCheck } from '@/utils/api-health'
 *
 * // 开发环境启动健康检查
 * initApiHealthCheck()
 *
 * ---
 *
 * 在组件中使用（可选）：
 *
 * import { createApiStatusMonitor } from '@/utils/api-health'
 *
 * const { status, latency, error } = createApiStatusMonitor()
 *
 * <template>
 *   <div v-if="status === 'unhealthy'" class="api-warning">
 *     ⚠️ API服务不可用: {{ error }}
 *   </div>
 * </template>
 */

import { describe, it, expect } from 'vitest'

describe.skip('API Health Check (Documentation Only)', () => {
  it('this is a documentation file, not an actual test', () => {
    expect(true).toBe(true)
  })
})
