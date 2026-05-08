/**
 * 社区/动态模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/community',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'community',
        component: () => import('./views/CommunityFeedView.vue'),
        meta: { title: '社区' }
      },
      {
        path: 'post',
        name: 'create-post',
        component: () => import('./views/CreatePostView.vue'),
        meta: { title: '发布动态', requiresAuth: true }
      },
      {
        path: 'post/:id',
        name: 'post-detail',
        component: () => import('./views/PostDetailView.vue'),
        meta: { title: '动态详情' },
        props: true
      },
      {
        path: 'topic/:tag',
        name: 'topic-posts',
        component: () => import('./views/TopicPostsView.vue'),
        meta: { title: '话题动态' },
        props: true
      }
    ]
  }
]

export default routes
