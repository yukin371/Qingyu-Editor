/**
 * Social 模块路由配置
 */
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/social',
    redirect: '/social/booklist'
  },
  {
    path: '/social/booklist',
    name: 'SocialBooklist',
    component: () => import('../views/BooklistView.vue'),
    meta: {
      title: '书单',
      requiresAuth: true
    }
  },
  {
    path: '/social/follow',
    name: 'SocialFollow',
    component: () => import('../views/FollowView.vue'),
    meta: {
      title: '关注',
      requiresAuth: true
    }
  },
  {
    path: '/social/message',
    name: 'SocialMessage',
    component: () => import('../views/MessageView.vue'),
    meta: {
      title: '消息',
      requiresAuth: true
    }
  },
  {
    path: '/social/review',
    name: 'SocialReview',
    component: () => import('../views/ReviewView.vue'),
    meta: {
      title: '书评',
      requiresAuth: true
    }
  }
]

export default routes
