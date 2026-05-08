import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const announcementRoutes: RouteRecordRaw[] = [
  {
    path: '/announcements',
    component: MainLayout,
    children: [
      {
        path: ':id',
        name: 'announcement-detail',
        component: () => import('./views/AnnouncementDetail.vue'),
        meta: { title: '公告详情' },
      },
    ],
  },
]

export default announcementRoutes
