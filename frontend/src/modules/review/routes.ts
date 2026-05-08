/**
 * 书评模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/reviews',
    component: MainLayout,
    meta: { title: '书评', requiresAuth: false },
    children: [
      {
        path: 'book/:bookId',
        name: 'book-reviews',
        component: () => import('./views/BookReviewsView.vue'),
        meta: { title: '书评' },
        props: true
      },
      {
        path: ':reviewId',
        name: 'review-detail',
        component: () => import('./views/ReviewDetailView.vue'),
        meta: { title: '书评详情' },
        props: true
      },
      {
        path: 'my',
        name: 'my-reviews',
        component: () => import('./views/MyReviewsView.vue'),
        meta: { title: '我的书评', requiresAuth: true }
      }
    ]
  }
]

export default routes
