import type { RouteLocationRaw } from 'vue-router'
import { WRITER_ROUTE_NAMES } from '../routes'

export type WriterWorkbenchNavId = 'workbench' | 'projects' | 'templates' | 'writing'

export interface WriterWorkbenchNavItem {
  id: WriterWorkbenchNavId
  label: string
  description: string
  icon: string
  to: RouteLocationRaw
}

export function getWriterWorkbenchNavigation(lastProjectId?: string): WriterWorkbenchNavItem[] {
  return [
    {
      id: 'workbench',
      label: '工作台',
      description: '最近项目与快捷入口',
      icon: 'HomeFilled',
      to: { name: WRITER_ROUTE_NAMES.home },
    },
    {
      id: 'projects',
      label: '项目',
      description: '完整项目列表与筛选',
      icon: 'Files',
      to: { name: WRITER_ROUTE_NAMES.projects },
    },
    {
      id: 'templates',
      label: '模板中心',
      description: '按题材启动新项目',
      icon: 'Collection',
      to: { name: WRITER_ROUTE_NAMES.templates },
    },
    {
      id: 'writing',
      label: '创作',
      description: '继续进入正文工作区',
      icon: 'EditPen',
      to: lastProjectId
        ? { name: WRITER_ROUTE_NAMES.project, params: { projectId: lastProjectId } }
        : { name: WRITER_ROUTE_NAMES.home },
    },
  ]
}
