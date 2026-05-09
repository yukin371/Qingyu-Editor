import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  RightToolAreaState,
  RightToolPanelWidths,
  RightToolType,
  WorkspaceAreaId,
  WorkspaceAreaState,
  WorkspaceLayoutPreset,
  WorkspaceLayoutSnapshot,
  WorkspacePanelId,
  WorkspaceRightPanelTab,
  WorkspaceSidebarTab,
} from '@/modules/writer/types/workspaceLayout'

const STORAGE_KEY = 'qingyu_editor_workspace_layout_v2'

function createDefaultSnapshot(): WorkspaceLayoutSnapshot {
  return {
    preset: 'default',
    leftSidebarTab: 'chapters',
    rightPanelTab: 'chat',
    rightToolArea: {
      visible: true,
      activeTool: 'ai',
      widths: {
        list: 200,
        detail: 320,
      },
    },
    areas: {
      left: {
        visible: true,
        activePanelId: 'chapters',
        panelIds: ['chapters', 'outline'],
      },
      right: {
        visible: false,
        activePanelId: 'harness',
        panelIds: ['harness'],
      },
      bottom: {
        visible: false,
        activePanelId: 'status',
        panelIds: ['status', 'context', 'harness'],
      },
      overlay: {
        visible: false,
        activePanelId: 'assets',
        panelIds: ['assets', 'relations', 'timeline', 'branches'],
      },
    },
  }
}

function sanitizeRightToolWidths(
  value: Partial<RightToolPanelWidths> | undefined,
  fallback: RightToolPanelWidths,
): RightToolPanelWidths {
  const normalizeWidth = (width: unknown, min: number, max: number, defaultValue: number) => {
    if (typeof width !== 'number' || Number.isNaN(width)) {
      return defaultValue
    }
    return Math.max(min, Math.min(max, Math.round(width)))
  }

  return {
    list: normalizeWidth(value?.list, 160, 320, fallback.list),
    detail: normalizeWidth(value?.detail, 240, 560, fallback.detail),
  }
}

function sanitizeRightToolArea(
  value: Partial<RightToolAreaState> | undefined,
  fallback: RightToolAreaState,
): RightToolAreaState {
  const activeTool: RightToolType =
    value?.activeTool === 'assets' ||
    value?.activeTool === 'proofread' ||
    value?.activeTool === 'inspiration'
      ? value.activeTool
      : fallback.activeTool

  return {
    visible: typeof value?.visible === 'boolean' ? value.visible : fallback.visible,
    activeTool,
    widths: sanitizeRightToolWidths(value?.widths, fallback.widths),
  }
}

function sanitizeAreaState(
  value: Partial<WorkspaceAreaState> | undefined,
  fallback: WorkspaceAreaState,
): WorkspaceAreaState {
  const panelIds = Array.isArray(value?.panelIds)
    ? (value?.panelIds.filter(Boolean) as WorkspacePanelId[])
    : fallback.panelIds
  const activePanelId =
    value?.activePanelId && panelIds.includes(value.activePanelId as WorkspacePanelId)
      ? (value.activePanelId as WorkspacePanelId)
      : fallback.activePanelId

  return {
    visible: typeof value?.visible === 'boolean' ? value.visible : fallback.visible,
    activePanelId,
    panelIds,
  }
}

function loadSnapshot(): WorkspaceLayoutSnapshot {
  const fallback = createDefaultSnapshot()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<WorkspaceLayoutSnapshot>

    return {
      preset: (parsed.preset as WorkspaceLayoutPreset) || fallback.preset,
      leftSidebarTab:
        parsed.leftSidebarTab === 'outline' ? parsed.leftSidebarTab : fallback.leftSidebarTab,
      rightPanelTab:
        parsed.rightPanelTab === 'harness' ? parsed.rightPanelTab : fallback.rightPanelTab,
      rightToolArea: sanitizeRightToolArea(parsed.rightToolArea, fallback.rightToolArea),
      areas: {
        left: sanitizeAreaState(parsed.areas?.left, fallback.areas.left),
        right: sanitizeAreaState(parsed.areas?.right, fallback.areas.right),
        bottom: sanitizeAreaState(parsed.areas?.bottom, fallback.areas.bottom),
        overlay: sanitizeAreaState(parsed.areas?.overlay, fallback.areas.overlay),
      },
    }
  } catch (error) {
    console.warn('Failed to load workspace layout state:', error)
    return fallback
  }
}

export const useWorkspaceLayoutStore = defineStore('writer-workspace-layout', () => {
  const snapshot = ref<WorkspaceLayoutSnapshot>(loadSnapshot())

  const saveSnapshot = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.value))
    } catch (error) {
      console.warn('Failed to save workspace layout state:', error)
    }
  }

  const preset = computed(() => snapshot.value.preset)
  const leftSidebarTab = computed<WorkspaceSidebarTab>({
    get: () => snapshot.value.leftSidebarTab,
    set: (value) => {
      snapshot.value.leftSidebarTab = value
      snapshot.value.areas.left.activePanelId = value
      saveSnapshot()
    },
  })

  const rightPanelTab = computed<WorkspaceRightPanelTab>({
    get: () => snapshot.value.rightPanelTab,
    set: (value) => {
      snapshot.value.rightPanelTab = value
      snapshot.value.areas.right.activePanelId = value === 'chat' ? 'ai' : 'harness'
      saveSnapshot()
    },
  })

  const areas = computed(() => snapshot.value.areas)
  const rightToolArea = computed(() => snapshot.value.rightToolArea)

  const setAreaVisibility = (areaId: WorkspaceAreaId, visible: boolean) => {
    snapshot.value.areas[areaId].visible = visible
    saveSnapshot()
  }

  const setAreaActivePanel = (areaId: WorkspaceAreaId, panelId: WorkspacePanelId | null) => {
    if (panelId && !snapshot.value.areas[areaId].panelIds.includes(panelId)) {
      snapshot.value.areas[areaId].panelIds.push(panelId)
    }
    snapshot.value.areas[areaId].activePanelId = panelId
    saveSnapshot()
  }

  const setRightToolVisible = (visible: boolean) => {
    snapshot.value.rightToolArea.visible = visible
    saveSnapshot()
  }

  const setRightToolActive = (tool: RightToolType) => {
    snapshot.value.rightToolArea.activeTool = tool
    snapshot.value.rightToolArea.visible = true
    saveSnapshot()
  }

  const toggleRightTool = (tool: RightToolType) => {
    if (snapshot.value.rightToolArea.activeTool === tool && snapshot.value.rightToolArea.visible) {
      snapshot.value.rightToolArea.visible = false
    } else {
      snapshot.value.rightToolArea.activeTool = tool
      snapshot.value.rightToolArea.visible = true
    }
    saveSnapshot()
  }

  const updateRightToolPanelWidths = (widths: Partial<RightToolPanelWidths>) => {
    snapshot.value.rightToolArea.widths = sanitizeRightToolWidths(
      {
        ...snapshot.value.rightToolArea.widths,
        ...widths,
      },
      snapshot.value.rightToolArea.widths,
    )
    saveSnapshot()
  }

  const movePanelToArea = (panelId: WorkspacePanelId, targetArea: WorkspaceAreaId) => {
    for (const areaId of Object.keys(snapshot.value.areas) as WorkspaceAreaId[]) {
      snapshot.value.areas[areaId].panelIds = snapshot.value.areas[areaId].panelIds.filter(
        (id) => id !== panelId,
      )
      if (snapshot.value.areas[areaId].activePanelId === panelId) {
        snapshot.value.areas[areaId].activePanelId =
          snapshot.value.areas[areaId].panelIds[0] ?? null
      }
    }

    snapshot.value.areas[targetArea].panelIds.push(panelId)
    snapshot.value.areas[targetArea].activePanelId = panelId
    snapshot.value.areas[targetArea].visible = true
    saveSnapshot()
  }

  const applyPreset = (layoutPreset: WorkspaceLayoutPreset) => {
    const next = createDefaultSnapshot()
    next.preset = layoutPreset

    if (layoutPreset === 'focus') {
      next.areas.left.visible = false
      next.areas.right.visible = false
      next.rightToolArea.visible = false
    }

    if (layoutPreset === 'outline-first') {
      next.leftSidebarTab = 'outline'
      next.areas.left.activePanelId = 'outline'
      next.rightToolArea.visible = false
    }

    if (layoutPreset === 'ai-first') {
      next.rightPanelTab = 'chat'
      next.rightToolArea.activeTool = 'ai'
      next.rightToolArea.visible = true
    }

    snapshot.value = next
    saveSnapshot()
  }

  const resetLayout = () => {
    snapshot.value = createDefaultSnapshot()
    saveSnapshot()
  }

  return {
    preset,
    areas,
    leftSidebarTab,
    rightPanelTab,
    rightToolArea,
    setAreaVisibility,
    setAreaActivePanel,
    setRightToolVisible,
    setRightToolActive,
    toggleRightTool,
    updateRightToolPanelWidths,
    movePanelToArea,
    applyPreset,
    resetLayout,
  }
})
