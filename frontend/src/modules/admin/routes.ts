/**
 * Admin Module Routes
 */

import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/shared/components/layout/AdminLayout.vue'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('./views/DashboardView.vue'),
        meta: { title: '仪表板', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'reviews',
        name: 'admin-reviews',
        component: () => import('./views/ReviewManagement.vue'),
        meta: { title: '内容审核', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'withdrawals',
        name: 'admin-withdrawals',
        component: () => import('./views/WithdrawalManagement.vue'),
        meta: { title: '提现审核', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('./views/UserManagement.vue'),
        meta: { title: '用户管理', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'logs',
        name: 'admin-logs',
        component: () => import('./views/OperationLogs.vue'),
        meta: { title: '操作日志', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'system-config',
        name: 'admin-system-config',
        component: () => import('./views/SystemConfig.vue'),
        meta: { title: '系统配置', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'banners',
        name: 'admin-banners',
        component: () => import('./views/BannerManagement.vue'),
        meta: { title: 'Banner管理', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'announcements',
        name: 'admin-announcements',
        component: () => import('./views/AnnouncementManagement.vue'),
        meta: { title: '公告管理', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('./views/CategoryManagement.vue'),
        meta: { title: '分类管理', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'quota',
        redirect: '/admin/quota/dashboard',
      },
      {
        path: 'quota/dashboard',
        name: 'admin-quota-dashboard',
        component: () => import('./views/QuotaDashboard.vue'),
        meta: { title: '配额仪表板', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'quota/users',
        name: 'admin-quota-users',
        component: () => import('./views/QuotaUserList.vue'),
        meta: { title: '用户配额列表', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'quota/policies',
        name: 'admin-quota-policies',
        component: () => import('./views/QuotaPolicy.vue'),
        meta: { title: '策略配置', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'quota/alerts',
        name: 'admin-quota-alerts',
        component: () => import('./views/QuotaAlertCenter.vue'),
        meta: { title: '预警中心', requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'quota/reports',
        name: 'admin-quota-reports',
        component: () => import('./views/QuotaReport.vue'),
        meta: { title: '消耗报表', requiresAuth: true, roles: ['admin'] },
      },
    ],
  },
]

export default adminRoutes
