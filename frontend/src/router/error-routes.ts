/**
 * Error Routes
 */

import type { RouteRecordRaw } from 'vue-router'

export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/Forbidden.vue'),
    meta: { title: '访问被拒绝', layout: 'blank' }
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '页面不存在', layout: 'blank' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]
