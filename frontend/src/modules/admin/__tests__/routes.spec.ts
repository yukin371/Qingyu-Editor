import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/components/layout/AdminLayout.vue', () => ({
  default: {
    name: 'AdminLayout',
  },
}))

import adminRoutes from '../routes'

describe('admin routes', () => {
  it('应该注册 quota 相关子路由', () => {
    expect(adminRoutes).toHaveLength(1)

    const adminRoute = adminRoutes[0]
    expect(adminRoute.path).toBe('/admin')
    expect(adminRoute.meta).toMatchObject({
      requiresAuth: true,
      roles: ['admin'],
    })

    const children = adminRoute.children ?? []
    const quotaPaths = children.map((route) => route.path)

    expect(quotaPaths).toContain('quota')
    expect(quotaPaths).toContain('quota/dashboard')
    expect(quotaPaths).toContain('quota/users')
    expect(quotaPaths).toContain('quota/policies')
    expect(quotaPaths).toContain('quota/alerts')
    expect(quotaPaths).toContain('quota/reports')
  })

  it('应该把 quota 路由名和跳转目标配置正确', () => {
    const children = adminRoutes[0].children ?? []
    const redirectRoute = children.find((route) => route.path === 'quota')

    expect(redirectRoute?.redirect).toBe('/admin/quota/dashboard')
    expect(children.find((route) => route.path === 'quota/dashboard')?.name).toBe(
      'admin-quota-dashboard',
    )
    expect(children.find((route) => route.path === 'quota/users')?.name).toBe('admin-quota-users')
    expect(children.find((route) => route.path === 'quota/policies')?.name).toBe(
      'admin-quota-policies',
    )
    expect(children.find((route) => route.path === 'quota/alerts')?.name).toBe('admin-quota-alerts')
    expect(children.find((route) => route.path === 'quota/reports')?.name).toBe(
      'admin-quota-reports',
    )
  })
})
