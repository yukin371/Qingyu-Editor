export type WorkspaceAreaId = 'left' | 'right' | 'bottom' | 'overlay'

export type WorkspaceSidebarTab = 'chapters' | 'outline'
export type WorkspaceRightPanelTab = 'chat' | 'harness'

export type WorkspacePanelId =
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

export interface WorkspacePanelDefinition {
  id: WorkspacePanelId
  title: string
  defaultArea: WorkspaceAreaId
  detachable: boolean
  tabGroup: 'left-sidebar' | 'right-sidebar' | 'overlay'
}

export interface WorkspaceAreaState {
  visible: boolean
  activePanelId: WorkspacePanelId | null
  panelIds: WorkspacePanelId[]
}

export interface WorkspaceLayoutSnapshot {
  preset: WorkspaceLayoutPreset
  leftSidebarTab: WorkspaceSidebarTab
  rightPanelTab: WorkspaceRightPanelTab
  areas: Record<WorkspaceAreaId, WorkspaceAreaState>
}
