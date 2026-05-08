/**
 * 财务模块路由
 */
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/finance',
    redirect: '/finance/membership',
    meta: { requiresAuth: true }
  },
  {
    path: '/finance/membership',
    name: 'Membership',
    component: () => import('@/modules/finance/views/MembershipView.vue'),
    meta: {
      title: '会员中心',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/finance/revenue',
    name: 'AuthorRevenue',
    component: () => import('@/modules/finance/views/AuthorRevenueView.vue'),
    meta: {
      title: '作者收入',
      requiresAuth: true,
      layout: 'main',
      roles: ['author', 'admin'] // 作者和管理员都可以访问
    }
  }
]

export default routes
