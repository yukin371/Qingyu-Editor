import type { RouteRecordRaw } from 'vue-router'

const writerRoutes: RouteRecordRaw[] = [
  {
    path: '/writer',
    name: 'writer-home',
    component: () => import('./views/ProjectWorkspace.vue'),
    meta: { title: '编辑器', requiresAuth: true },
  },
  {
    path: '/writer/projects',
    name: 'writer-projects',
    component: () => import('./views/ProjectWorkspace.vue'),
    meta: { title: '编辑器', requiresAuth: true },
  },
  {
    path: '/writer/project/:projectId',
    name: 'writer-project',
    component: () => import('./views/ProjectWorkspace.vue'),
    meta: { title: '编辑器', requiresAuth: true },
    props: true,
  },
  {
    // 兼容旧编辑器链接，统一重定向到 writer-project 工作区
    path: '/writer/editor/:projectId/:chapterId?',
    name: 'writer-editor',
    redirect: (to) => ({
      name: 'writer-project',
      params: { projectId: to.params.projectId },
      query: {
        ...to.query,
        ...(to.params.chapterId ? { chapterId: String(to.params.chapterId) } : {}),
      },
    }),
    meta: { requiresAuth: true, deprecated: true, replacement: 'writer-project' },
  },
]

export default writerRoutes
