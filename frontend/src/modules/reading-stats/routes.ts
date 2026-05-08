/**
 * 阅读统计模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/reading',
    component: MainLayout,
    children: [
      {
        path: 'report',
        name: 'reading-report',
        component: () => import('./views/ReadingReportView.vue'),
        meta: { title: '阅读报告', requiresAuth: true }
      },
      {
        path: 'report/:period',
        name: 'reading-report-period',
        component: () => import('./views/ReadingReportView.vue'),
        meta: { title: '阅读报告', requiresAuth: true },
        props: true
      },
      {
        path: 'stats',
        name: 'reading-stats',
        component: () => import('./views/ReadingStatsView.vue'),
        meta: { title: '阅读统计', requiresAuth: true }
      },
      {
        path: 'history',
        name: 'reading-history-detail',
        component: () => import('./views/ReadingHistoryDetailView.vue'),
        meta: { title: '阅读历史', requiresAuth: true }
      },
      {
        path: 'ranking',
        name: 'reading-ranking',
        component: () => import('./views/ReadingRankingView.vue'),
        meta: { title: '阅读排行' }
      }
    ]
  }
]

export default routes
