/**
 * Bookstore Module Routes
 */

import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const bookstoreRoutes: RouteRecordRaw[] = [
  {
    path: '/bookstore',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('./views/HomeView.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'books',
        redirect: '/bookstore/browse',
      },
      {
        path: 'browse',
        name: 'browse',
        component: () => import('./views/BrowseBooksView.vue'),
        meta: { title: '浏览书籍' },
      },
      {
        path: 'books/:id',
        name: 'book-detail',
        beforeEnter: (to) => {
          const routeTestFlag = to.query?.test
          const isTestMode =
            routeTestFlag === 'true' ||
            String(routeTestFlag) === 'true' ||
            (Array.isArray(routeTestFlag) && routeTestFlag.some((v) => String(v) === 'true'))
          const isYunlanProject = String(to.params.id || '') === 'project-yljs-1'
          if (isTestMode && isYunlanProject) {
            return {
              path: '/bookstore/books-demo',
              query: to.query,
              replace: true,
            }
          }
          return true
        },
        component: () => import('./views/BookDetailView.vue'),
        meta: { title: '书籍详情' },
        props: true,
      },
      {
        path: 'books-demo',
        name: 'book-detail-demo',
        component: () => import('./views/BookDetailDemo.vue'),
        meta: { title: '书籍详情（演示）' },
      },
      {
        path: 'categories',
        redirect: (to) => {
          const categoryId = to.query.id as string
          return {
            path: '/bookstore/browse',
            query: categoryId ? { categoryId } : undefined,
          }
        },
      },
      {
        path: 'rankings',
        name: 'rankings',
        component: () => import('./views/RankingsView.vue'),
        meta: { title: '排行榜' },
      },
      {
        path: 'search',
        redirect: (to) => ({
          path: '/bookstore/browse',
          query: to.query,
        }),
      },
    ],
  },
]

export default bookstoreRoutes
