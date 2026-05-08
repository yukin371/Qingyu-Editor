/**
 * VIP会员模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/vip',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'vip',
        component: () => import('./views/VIPCenterView.vue'),
        meta: { title: '会员中心' }
      },
      {
        path: 'purchase',
        name: 'vip-purchase',
        component: () => import('./views/VIPPurchaseView.vue'),
        meta: { title: '购买会员', requiresAuth: true }
      },
      {
        path: 'privileges',
        name: 'vip-privileges',
        component: () => import('./views/VIPPrivilegesView.vue'),
        meta: { title: '会员权益' }
      },
      {
        path: 'subscription',
        name: 'vip-subscription',
        component: () => import('./views/VIPSubscriptionView.vue'),
        meta: { title: '订阅管理', requiresAuth: true }
      }
    ]
  }
]

export default routes
