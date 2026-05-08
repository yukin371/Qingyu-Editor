/**
 * 发现/推荐模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/discovery',
    name: 'discovery',
    component: MainLayout,
    meta: { title: '发现' },
    children: [
      {
        path: '',
        name: 'discovery-home',
        component: () => import('./views/DiscoveryView.vue'),
        meta: { title: '发现' }
      },
      {
        path: 'topics',
        name: 'topics',
        component: () => import('./views/TopicsView.vue'),
        meta: { title: '话题广场' }
      },
      {
        path: 'topic/:id',
        name: 'topic-detail',
        component: () => import('./views/TopicDetailView.vue'),
        meta: { title: '话题详情' },
        props: true
      },
      {
        path: 'new-releases',
        name: 'new-releases',
        component: () => import('./views/NewReleasesView.vue'),
        meta: { title: '新书抢先' }
      },
      {
        path: 'editors-pick',
        name: 'editors-pick',
        component: () => import('./views/EditorsPickView.vue'),
        meta: { title: '编辑推荐' }
      }
    ]
  }
]

export default routes
