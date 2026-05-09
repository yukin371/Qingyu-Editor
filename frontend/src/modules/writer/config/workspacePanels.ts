import type {
  RightToolType,
  WorkspacePanelDefinition,
} from '@/modules/writer/types/workspaceLayout'

export const workspacePanelRegistry: WorkspacePanelDefinition[] = [
  {
    id: 'chapters',
    title: '章节',
    defaultArea: 'left',
    detachable: false,
    tabGroup: 'left-sidebar',
  },
  {
    id: 'outline',
    title: '大纲',
    defaultArea: 'left',
    detachable: false,
    tabGroup: 'left-sidebar',
  },
  {
    id: 'ai',
    title: 'AI 助手',
    defaultArea: 'right',
    detachable: true,
    tabGroup: 'right-sidebar',
  },
  {
    id: 'harness',
    title: 'Story Harness',
    defaultArea: 'right',
    detachable: true,
    tabGroup: 'right-sidebar',
  },
  {
    id: 'status',
    title: '工作区状态',
    defaultArea: 'bottom',
    detachable: true,
    tabGroup: 'right-sidebar',
  },
  {
    id: 'context',
    title: '上下文摘要',
    defaultArea: 'bottom',
    detachable: true,
    tabGroup: 'right-sidebar',
  },
  {
    id: 'assets',
    title: '资产总览',
    defaultArea: 'overlay',
    detachable: true,
    tabGroup: 'overlay',
  },
  {
    id: 'relations',
    title: '关系图谱',
    defaultArea: 'overlay',
    detachable: true,
    tabGroup: 'overlay',
  },
  {
    id: 'timeline',
    title: '时间线',
    defaultArea: 'overlay',
    detachable: true,
    tabGroup: 'overlay',
  },
  {
    id: 'branches',
    title: '故事分支',
    defaultArea: 'overlay',
    detachable: true,
    tabGroup: 'overlay',
  },
]

export const workspacePanelRegistryById = Object.fromEntries(
  workspacePanelRegistry.map((panel) => [panel.id, panel]),
) as Record<string, WorkspacePanelDefinition>

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
