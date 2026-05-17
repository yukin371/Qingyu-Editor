import type { Shortcut } from '../types/editor'
import type { ToolType } from './useToolOverlay'

type WorkspaceShortcutCategory = Shortcut['category']

interface WorkspaceShortcutActionDefinition {
  id: string
  defaultKeys: string[]
  description: string
  category: WorkspaceShortcutCategory
  system?: boolean
}

interface WorkspaceToolShortcutDefinition extends WorkspaceShortcutActionDefinition {
  tool: ToolType
}

const createShortcut = (definition: WorkspaceShortcutActionDefinition): Shortcut => ({
  id: definition.id,
  keys: [...definition.defaultKeys],
  description: definition.description,
  category: definition.category,
})

export const WORKSPACE_CLOSE_OVERLAY_ACTION: WorkspaceShortcutActionDefinition = {
  id: 'workspace.closeOverlay',
  defaultKeys: ['Escape'],
  description: '关闭覆盖层',
  category: 'navigation',
  system: true,
}

export const WORKSPACE_OPEN_LAST_TOOL_ACTION: WorkspaceShortcutActionDefinition = {
  id: 'tool.open',
  defaultKeys: ['Ctrl', 'G'],
  description: '打开最近一次工具',
  category: 'tool',
}

export const WORKSPACE_TOGGLE_LEFT_PANEL_ACTION: WorkspaceShortcutActionDefinition = {
  id: 'workspace.toggleLeftPanel',
  defaultKeys: ['Ctrl', '['],
  description: '隐藏/显示左侧边栏',
  category: 'navigation',
}

export const WORKSPACE_TOGGLE_RIGHT_PANEL_ACTION: WorkspaceShortcutActionDefinition = {
  id: 'workspace.toggleRightPanel',
  defaultKeys: ['Ctrl', ']'],
  description: '隐藏/显示右侧边栏',
  category: 'navigation',
}

export const WORKSPACE_PANEL_SHORTCUT_ACTIONS: WorkspaceShortcutActionDefinition[] = [
  WORKSPACE_TOGGLE_LEFT_PANEL_ACTION,
  WORKSPACE_TOGGLE_RIGHT_PANEL_ACTION,
]

export const WORKSPACE_TOOL_SHORTCUT_ACTIONS: WorkspaceToolShortcutDefinition[] = [
  {
    id: 'tool.switchRelations',
    defaultKeys: ['Ctrl', 'Shift', 'G'],
    description: '打开关系图谱',
    category: 'tool',
    tool: 'relations',
  },
  {
    id: 'tool.switchTimeline',
    defaultKeys: ['Ctrl', 'Shift', 'T'],
    description: '打开时间线',
    category: 'tool',
    tool: 'timeline',
  },
  {
    id: 'tool.switchBranches',
    defaultKeys: ['Ctrl', 'Shift', 'B'],
    description: '打开互动分支',
    category: 'tool',
    tool: 'branches',
  },
  {
    id: 'tool.switchStructure',
    defaultKeys: ['Ctrl', 'Shift', 'S'],
    description: '打开结构舞台',
    category: 'tool',
    tool: 'structure',
  },
]

export const WORKSPACE_SHORTCUT_ACTIONS: WorkspaceShortcutActionDefinition[] = [
  WORKSPACE_CLOSE_OVERLAY_ACTION,
  ...WORKSPACE_PANEL_SHORTCUT_ACTIONS,
  WORKSPACE_OPEN_LAST_TOOL_ACTION,
  ...WORKSPACE_TOOL_SHORTCUT_ACTIONS,
]

export const WORKSPACE_SYSTEM_SHORTCUT_IDS = WORKSPACE_SHORTCUT_ACTIONS.filter(
  (action) => action.system,
).map((action) => action.id)

export const WORKSPACE_SHORTCUT_DEFAULTS: Shortcut[] =
  WORKSPACE_SHORTCUT_ACTIONS.map(createShortcut)
