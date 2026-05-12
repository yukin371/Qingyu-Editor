import type {
  OverlayToolType,
  RightToolType,
  WorkspacePanelDefinition,
  WorkspacePanelId,
  WorkspaceAreaId,
} from '@/modules/writer/types/workspaceLayout'

export const workspacePanelRegistry: WorkspacePanelDefinition[] = [
  {
    id: 'structure',
    title: '结构舞台',
    defaultArea: 'overlay',
    allowedAreas: ['overlay'],
    detachable: true,
    tabGroup: 'overlay',
    icon: 'Grid',
    overlayGroup: 'primary',
  },
  {
    id: 'chapters',
    title: '章节',
    defaultArea: 'left',
    allowedAreas: ['left'],
    detachable: false,
    tabGroup: 'left-sidebar',
    icon: 'Files',
  },
  {
    id: 'outline',
    title: '大纲',
    defaultArea: 'left',
    allowedAreas: ['left'],
    detachable: false,
    tabGroup: 'left-sidebar',
    icon: 'Memo',
  },
  {
    id: 'ai',
    title: 'AI 助手',
    defaultArea: 'right-tool',
    allowedAreas: ['right-tool', 'bottom'],
    detachable: true,
    tabGroup: 'right-tool',
    icon: 'ChatDotRound',
  },
  {
    id: 'status',
    title: '工作区状态',
    defaultArea: 'bottom',
    allowedAreas: ['bottom'],
    detachable: true,
    tabGroup: 'bottom',
    icon: 'Tickets',
  },
  {
    id: 'context',
    title: '上下文摘要',
    defaultArea: 'bottom',
    allowedAreas: ['bottom'],
    detachable: true,
    tabGroup: 'bottom',
    icon: 'Connection',
  },
  {
    id: 'harness',
    title: 'Story Harness',
    defaultArea: 'bottom',
    allowedAreas: ['bottom'],
    detachable: true,
    tabGroup: 'bottom',
    icon: 'MagicStick',
  },
  {
    id: 'assets',
    title: '资产总览',
    defaultArea: 'overlay',
    allowedAreas: ['overlay'],
    detachable: true,
    tabGroup: 'overlay',
    icon: 'Collection',
    overlayGroup: 'primary',
  },
  {
    id: 'relations',
    title: '关系图谱',
    defaultArea: 'overlay',
    allowedAreas: ['overlay'],
    detachable: true,
    tabGroup: 'overlay',
    icon: 'Share',
    overlayGroup: 'professional',
  },
  {
    id: 'timeline',
    title: '时间线',
    defaultArea: 'overlay',
    allowedAreas: ['overlay'],
    detachable: true,
    tabGroup: 'overlay',
    icon: 'Clock',
    overlayGroup: 'professional',
  },
  {
    id: 'branches',
    title: '故事分支',
    defaultArea: 'overlay',
    allowedAreas: ['overlay'],
    detachable: true,
    tabGroup: 'overlay',
    icon: 'Connection',
    overlayGroup: 'professional',
  },
]

export const workspacePanelRegistryById = Object.fromEntries(
  workspacePanelRegistry.map((panel) => [panel.id, panel]),
) as Record<WorkspacePanelId, WorkspacePanelDefinition>

export function getWorkspaceAreaDefaultPanelIds(areaId: WorkspaceAreaId): WorkspacePanelId[] {
  return workspacePanelRegistry
    .filter((panel) => panel.defaultArea === areaId)
    .map((panel) => panel.id)
}

export function isWorkspacePanelAllowedInArea(
  panelId: WorkspacePanelId,
  areaId: WorkspaceAreaId,
): boolean {
  return workspacePanelRegistryById[panelId]?.allowedAreas.includes(areaId) ?? false
}

export function getWorkspacePanelTitle(panelId: WorkspacePanelId): string {
  return workspacePanelRegistryById[panelId]?.title ?? panelId
}

export function getWorkspacePanelIcon(panelId: WorkspacePanelId): string {
  return workspacePanelRegistryById[panelId]?.icon ?? 'Tools'
}

export const OVERLAY_TOOL_ORDER = workspacePanelRegistry
  .filter((panel) => panel.tabGroup === 'overlay')
  .map((panel) => panel.id) as OverlayToolType[]

export const DEFAULT_OVERLAY_TOOL =
  workspacePanelRegistry.find((panel) => panel.defaultArea === 'overlay')?.id === 'structure'
    ? 'structure'
    : 'structure'

const OVERLAY_GROUP_ORDER = ['primary', 'professional'] as const

export const OVERLAY_TOOL_GROUPS: Array<{
  id: 'primary' | 'professional'
  label: string
  tools: Array<{
    id: OverlayToolType
    name: string
    icon: string
  }>
}> = OVERLAY_GROUP_ORDER.map((groupId) => ({
  id: groupId,
  label: groupId === 'primary' ? '主辅助' : '专业',
  tools: workspacePanelRegistry
    .filter((panel) => panel.tabGroup === 'overlay' && panel.overlayGroup === groupId)
    .map((panel) => ({
      id: panel.id as OverlayToolType,
      name: panel.title,
      icon: panel.icon ?? 'Tools',
    })),
}))

export const RIGHT_TOOL_CONFIG: Record<
  RightToolType,
  {
    mode: 'single' | 'dual'
    hasListPanel: boolean
    label: string
    icon: string
  }
> = {
  ai: {
    mode: 'single',
    hasListPanel: false,
    label: 'AI',
    icon: 'MagicStick',
  },
  assets: {
    mode: 'dual',
    hasListPanel: true,
    label: '设定',
    icon: 'Collection',
  },
  proofread: {
    mode: 'single',
    hasListPanel: false,
    label: '校对',
    icon: 'DocumentChecked',
  },
  inspiration: {
    mode: 'single',
    hasListPanel: false,
    label: '灵感',
    icon: 'Lightbulb',
  },
}

export const RIGHT_TOOL_ORDER = Object.keys(RIGHT_TOOL_CONFIG) as RightToolType[]
