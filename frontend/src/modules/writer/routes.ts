import type { RouteRecordRaw } from 'vue-router'

export const WRITER_ROUTE_NAMES = {
  home: 'writer-home',
  projects: 'writer-projects',
  templates: 'writer-templates',
  project: 'writer-project',
  editor: 'writer-editor',
} as const

const writerRoutes: RouteRecordRaw[] = [
  {
    path: '/writer',
    name: WRITER_ROUTE_NAMES.home,
    component: () => import('./views/WriterWorkbenchView.vue'),
    meta: { title: '作者工作台' },
  },
  {
    path: '/writer/projects',
    name: WRITER_ROUTE_NAMES.projects,
    component: () => import('./views/WriterProjectsView.vue'),
    meta: { title: '项目列表' },
  },
  {
    path: '/writer/templates',
    name: WRITER_ROUTE_NAMES.templates,
    component: () => import('./views/WriterTemplateCenterView.vue'),
    meta: { title: '模板中心' },
  },
  {
    path: '/writer/project/:projectId',
    name: WRITER_ROUTE_NAMES.project,
    component: () => import('./views/ProjectWorkspace.vue'),
    meta: { title: '创作工作区' },
    props: true,
  },
  {
    // 兼容旧编辑器链接，统一重定向到 writer-project 工作区
    path: '/writer/editor/:projectId/:chapterId?',
    name: WRITER_ROUTE_NAMES.editor,
    redirect: (to) => ({
      name: WRITER_ROUTE_NAMES.project,
      params: { projectId: to.params.projectId },
      query: {
        ...to.query,
        ...(to.params.chapterId ? { chapterId: String(to.params.chapterId) } : {}),
      },
    }),
    meta: { deprecated: true, replacement: WRITER_ROUTE_NAMES.project },
  },
]

export default writerRoutes
