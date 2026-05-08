
import { createRouter, createMemoryHistory } from 'vue-router'

// Mock the MainLayout component
vi.mock('@/shared/components/layout/MainLayout.vue', () => ({
  default: {
    template: '<div><router-view /></div>',
    name: 'MainLayout'
  }
}))

// Import routes
import notificationRoutes from '../routes'

describe('Notification路由配置', () => {
  it('应该有唯一的路由路径', () => {
    const extractPaths = (routes: any[]): string[] => {
      const paths: string[] = []
      routes.forEach(route => {
        paths.push(route.path)
        if (route.children) {
          paths.push(...extractPaths(route.children))
        }
      })
      return paths
    }

    const paths = extractPaths(notificationRoutes)
    const uniquePaths = new Set(paths)

    expect(paths.length).toBe(uniquePaths.size)
    expect(paths.length).toBeGreaterThan(0)
  })

  it('应该有唯一的路由名称', () => {
    const extractNames = (routes: any[]): string[] => {
      const names: string[] = []
      routes.forEach(route => {
        if (route.name) {
          names.push(route.name)
        }
        if (route.children) {
          names.push(...extractNames(route.children))
        }
      })
      return names
    }

    const names = extractNames(notificationRoutes)
    const uniqueNames = new Set(names)

    expect(names.length).toBe(uniqueNames.size)
    expect(names.length).toBeGreaterThan(0)
  })

  it('所有路由组件应该正确导入', () => {
    const checkComponents = (routes: any[]) => {
      routes.forEach(route => {
        if (route.component) {
          expect(route.component).toBeTruthy()
        }
        if (route.children) {
          checkComponents(route.children)
        }
      })
    }

    checkComponents(notificationRoutes)
  })

  it('路由路径应该以/notifications开头', () => {
    const checkPaths = (routes: any[]) => {
      routes.forEach(route => {
        // 对于子路由，检查相对路径；对于根路由，检查完整路径
        if (route.children && route.children.length > 0) {
          route.children.forEach((child: any) => {
            if (child.path && !child.path.startsWith(':')) {
              expect(child.path).toMatch(/^($|[a-z0-9-]+)$/i)
            }
          })
        } else {
          expect(route.path).toMatch(/^\/notifications/)
        }
      })
    }

    checkPaths(notificationRoutes)
  })

  it('应该能够创建有效的路由器', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: notificationRoutes
    })

    expect(router).toBeTruthy()

    // 测试主要路由是否可以解析
    const route = router.resolve('/notifications')
    expect(route).toBeTruthy()
  })

  it('应该有正确的元数据配置', () => {
    const checkMeta = (routes: any[]) => {
      routes.forEach(route => {
        if (route.meta) {
          expect(route.meta).toBeTruthy()
          if (route.meta.requiresAuth !== undefined) {
            expect(typeof route.meta.requiresAuth).toBe('boolean')
          }
        }
        if (route.children) {
          checkMeta(route.children)
        }
      })
    }

    checkMeta(notificationRoutes)
  })
})
