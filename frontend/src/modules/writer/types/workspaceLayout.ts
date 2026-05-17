export type WorkspaceAreaId = 'left' | 'bottom' | 'overlay'
export type WorkspacePanelDockId = WorkspaceAreaId | 'right-tool'

export type WorkspaceSidebarTab = 'chapters' | 'outline'
export type RightToolType = 'ai' | 'assets' | 'harness' | 'proofread' | 'inspiration'
export type OverlayToolType = 'structure' | 'assets' | 'relations' | 'timeline' | 'branches'

export type WorkspacePanelId =
  | 'scene'
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

export interface BottomPanelLayoutState {
  height: number
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
  defaultVisible?: boolean
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
  bottomPanel: BottomPanelLayoutState
  areas: Record<WorkspaceAreaId, WorkspaceAreaState>
}
