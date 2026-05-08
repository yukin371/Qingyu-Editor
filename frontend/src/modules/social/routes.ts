/**
 * 社交模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/social',
    name: 'social',
    component: MainLayout,
    redirect: '/social/booklist',
    meta: {
      title: '社交',
      requiresAuth: true,
    },
    children: [
      {
        path: 'booklist',
        name: 'social-booklist',
        component: () => import('./views/BooklistView.vue'),
        meta: {
          title: '书单',
        },
      },
      {
        path: 'follow',
        name: 'social-follow',
        component: () => import('./views/FollowView.vue'),
        meta: {
          title: '关注',
        },
      },
      {
        path: 'message',
        name: 'social-message',
        component: () => import('./views/MessageView.vue'),
        meta: {
          title: '消息',
        },
      },
      {
        path: 'review',
        name: 'social-review',
        component: () => import('./views/ReviewView.vue'),
        meta: {
          title: '书评',
        },
      },
      {
        path: 'followers/:userId?',
        name: 'followers-list',
        component: () => import('./views/FollowListView.vue'),
        meta: {
          title: '粉丝列表',
        },
        props: true,
      },
      {
        path: 'following/:userId?',
        name: 'following-list',
        component: () => import('./views/FollowListView.vue'),
        meta: {
          title: '关注列表',
        },
        props: true,
      },
      {
        path: 'mutual/:userId?',
        name: 'mutual-list',
        component: () => import('./views/FollowListView.vue'),
        meta: {
          title: '互关列表',
        },
        props: true,
      },
    ],
  },
]

export default routes
