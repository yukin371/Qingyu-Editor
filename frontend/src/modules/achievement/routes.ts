/**
 * 成就模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/achievements',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'achievements',
        component: () => import('./views/AchievementsView.vue'),
        meta: { title: '成就', requiresAuth: true }
      },
      {
        path: ':id',
        name: 'achievement-detail',
        component: () => import('./views/AchievementDetailView.vue'),
        meta: { title: '成就详情' },
        props: true
      },
      {
        path: 'level',
        name: 'level-info',
        component: () => import('./views/LevelInfoView.vue'),
        meta: { title: '等级信息', requiresAuth: true }
      },
      {
        path: 'ranking',
        name: 'achievement-ranking',
        component: () => import('./views/AchievementRankingView.vue'),
        meta: { title: '成就排行' }
      }
    ]
  }
]

export default routes
