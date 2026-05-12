export type WorkspaceAreaId = 'left' | 'bottom' | 'overlay'
export type WorkspacePanelDockId = WorkspaceAreaId | 'right-tool'

export type WorkspaceSidebarTab = 'chapters' | 'outline'
export type RightToolType = 'ai' | 'assets' | 'proofread' | 'inspiration'
export type OverlayToolType = 'structure' | 'assets' | 'relations' | 'timeline' | 'branches'

export type WorkspacePanelId =
  | 'structure'
  | 'chapters'
  | 'outline'
  | 'ai'
  | 'harness'
  | 'status'
  | 'context'
  | 'assets'
  | 'relations'
  | 'timeline'
  | 'branches'

export type WorkspaceLayoutPreset = 'default' | 'focus' | 'outline-first' | 'ai-first'

export interface RightToolPanelWidths {
  list: number
  detail: number
}

export interface RightToolAreaState {
  visible: boolean
  activeTool: RightToolType
  widths: RightToolPanelWidths
}

export interface WorkspacePanelDefinition {
  id: WorkspacePanelId
  title: string
  defaultArea: WorkspacePanelDockId
  allowedAreas: WorkspacePanelDockId[]
  detachable: boolean
  tabGroup: 'left-sidebar' | 'right-tool' | 'bottom' | 'overlay'
  icon?: string
  overlayGroup?: 'primary' | 'professional'
}

export interface WorkspaceAreaState {
  visible: boolean
  activePanelId: WorkspacePanelId | null
  panelIds: WorkspacePanelId[]
}

export interface WorkspaceLayoutSnapshot {
  preset: WorkspaceLayoutPreset
  leftSidebarTab: WorkspaceSidebarTab
  rightToolArea: RightToolAreaState
  areas: Record<WorkspaceAreaId, WorkspaceAreaState>
}
