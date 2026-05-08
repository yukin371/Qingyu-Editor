/**
 * Reader Module Routes
 */

import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'
import ReaderRedirect from './components/ReaderRedirect.vue'

const readerRoutes: RouteRecordRaw[] = [
  {
    path: '/reader',
    component: ReaderRedirect,
  },
  {
    path: '/reader/:chapterId',
    name: 'reader',
    component: () => import('./views/ReaderView.vue'),
    meta: { title: '阅读器' },
    props: true
  },
  {
    path: '/reading',
    component: MainLayout,
    children: [
      {
        path: 'bookshelf',
        name: 'bookshelf',
        component: () => import('./views/BookshelfView.vue'),
        meta: { title: '我的书架', requiresAuth: true }
      },
      {
        path: 'history',
        name: 'reading-history',
        component: () => import('./views/ReadingHistoryView.vue'),
        meta: { title: '阅读历史', requiresAuth: true }
      },
      {
        path: 'bookmarks',
        name: 'bookmarks',
        component: () => import('./views/BookmarkManagementView.vue'),
        meta: { title: '我的书签', requiresAuth: true }
      },
      {
        path: 'collections',
        name: 'collections',
        component: () => import('./views/CollectionsView.vue'),
        meta: { title: '我的收藏', requiresAuth: true }
      },
      {
        path: 'theme-settings',
        name: 'theme-settings',
        component: () => import('./views/ThemeSettingsView.vue'),
        meta: { title: '主题设置', requiresAuth: true }
      },
      {
        path: 'comment/:commentId',
        name: 'comment-detail',
        component: () => import('./views/CommentDetailView.vue'),
        meta: { title: '评论详情' },
        props: true
      }
    ]
  }
]

export default readerRoutes
