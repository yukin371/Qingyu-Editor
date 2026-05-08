/**
 * 书单模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/booklists',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'booklists',
        component: () => import('./views/BookListsView.vue'),
        meta: { title: '书单广场' }
      },
      {
        path: ':id',
        name: 'booklist-detail',
        component: () => import('./views/BookListDetailView.vue'),
        meta: { title: '书单详情' },
        props: true
      },
      {
        path: 'create',
        name: 'create-booklist',
        component: () => import('./views/CreateBookListView.vue'),
        meta: { title: '创建书单', requiresAuth: true }
      },
      {
        path: ':id/edit',
        name: 'edit-booklist',
        component: () => import('./views/EditBookListView.vue'),
        meta: { title: '编辑书单', requiresAuth: true },
        props: true
      },
      {
        path: 'my',
        name: 'my-booklists',
        component: () => import('./views/MyBookListsView.vue'),
        meta: { title: '我的书单', requiresAuth: true }
      },
      {
        path: 'favorite',
        name: 'favorite-booklists',
        component: () => import('./views/FavoriteBookListsView.vue'),
        meta: { title: '收藏的书单', requiresAuth: true }
      }
    ]
  }
]

export default routes
