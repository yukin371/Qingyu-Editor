/**
 * 通知模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/notifications',
    name: 'notifications',
    component: MainLayout,
    meta: {
      title: '消息中心',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'notifications-center',
        component: () => import('./views/NotificationCenter.vue'),
        meta: {
          title: '消息中心'
        }
      },
      {
        path: ':type',
        name: 'notifications-by-type',
        component: () => import('./views/NotificationCenter.vue'),
        meta: {
          title: '消息列表'
        },
        props: true
      }
    ]
  }
]

export default routes
