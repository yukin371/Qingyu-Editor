import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getWorkspaceAreaDefaultPanelIds,
  isWorkspacePanelAllowedInArea,
} from '@/modules/writer/config/workspacePanels'
import type {
  BottomPanelLayoutState,
  RightToolAreaState,
  RightToolPanelWidths,
  RightToolType,
  WorkspaceAreaId,
  WorkspaceAreaState,
  WorkspaceLayoutPreset,
  WorkspaceLayoutSnapshot,
  WorkspacePanelId,
  WorkspaceSidebarTab,
} from '@/modules/writer/types/workspaceLayout'

const STORAGE_KEY = 'qingyu_editor_workspace_layout_v2'
const BOTTOM_PANEL_MIN_HEIGHT = 140
const BOTTOM_PANEL_MAX_HEIGHT = 360
const BOTTOM_PANEL_DEFAULT_HEIGHT = 220

function getWorkspaceLayoutStorage(): Storage | null {
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage
}

function createDefaultSnapshot(): WorkspaceLayoutSnapshot {
  return {
    preset: 'default',
    leftSidebarTab: 'chapters',
    rightToolArea: {
      visible: true,
      activeTool: 'ai',
      widths: {
        list: 200,
        detail: 320,
      },
    },
    bottomPanel: {
      height: BOTTOM_PANEL_DEFAULT_HEIGHT,
    },
    areas: {
      left: {
        visible: true,
        activePanelId: 'chapters',
        panelIds: getWorkspaceAreaDefaultPanelIds('left'),
      },
      bottom: {
        visible: false,
        activePanelId: 'scene',
        panelIds: getWorkspaceAreaDefaultPanelIds('bottom'),
      },
      overlay: {
        visible: false,
        activePanelId: 'structure',
        panelIds: getWorkspaceAreaDefaultPanelIds('overlay'),
      },
    },
  }
}

function sanitizeBottomPanelLayout(
  value: Partial<BottomPanelLayoutState> | undefined,
  fallback: BottomPanelLayoutState,
): BottomPanelLayoutState {
  const height =
    typeof value?.height === 'number' && !Number.isNaN(value.height)
      ? value.height
      : fallback.height

  return {
    height: Math.max(
      BOTTOM_PANEL_MIN_HEIGHT,
      Math.min(BOTTOM_PANEL_MAX_HEIGHT, Math.round(height)),
    ),
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
    value?.activeTool === 'harness' ||
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
  areaId: WorkspaceAreaId,
  value: Partial<WorkspaceAreaState> | undefined,
  fallback: WorkspaceAreaState,
): WorkspaceAreaState {
  const panelIds = Array.isArray(value?.panelIds)
    ? Array.from(
        new Set(
          value.panelIds.filter(
            (panelId): panelId is WorkspacePanelId =>
              typeof panelId === 'string' &&
              isWorkspacePanelAllowedInArea(panelId as WorkspacePanelId, areaId),
          ),
        ),
      )
    : []
  const normalizedPanelIds =
    areaId === 'bottom'
      ? [
          'scene' as WorkspacePanelId,
          ...panelIds.filter(
            (panelId) => panelId !== 'scene' && panelId !== 'status' && panelId !== 'context',
          ),
        ]
      : panelIds.length > 0
        ? panelIds
        : fallback.panelIds
  const activePanelId =
    value?.activePanelId && normalizedPanelIds.includes(value.activePanelId as WorkspacePanelId)
      ? (value.activePanelId as WorkspacePanelId)
      : (normalizedPanelIds[0] ?? fallback.activePanelId)

  return {
    visible: typeof value?.visible === 'boolean' ? value.visible : fallback.visible,
    activePanelId,
    panelIds: normalizedPanelIds,
  }
}

function loadSnapshot(): WorkspaceLayoutSnapshot {
  const fallback = createDefaultSnapshot()
  try {
    const storage = getWorkspaceLayoutStorage()
    if (!storage) return fallback
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<WorkspaceLayoutSnapshot>

    return {
      preset: (parsed.preset as WorkspaceLayoutPreset) || fallback.preset,
      leftSidebarTab:
        parsed.leftSidebarTab === 'outline' ? parsed.leftSidebarTab : fallback.leftSidebarTab,
      rightToolArea: sanitizeRightToolArea(parsed.rightToolArea, fallback.rightToolArea),
      bottomPanel: sanitizeBottomPanelLayout(parsed.bottomPanel, fallback.bottomPanel),
      areas: {
        left: sanitizeAreaState('left', parsed.areas?.left, fallback.areas.left),
        bottom: sanitizeAreaState('bottom', parsed.areas?.bottom, fallback.areas.bottom),
        overlay: sanitizeAreaState('overlay', parsed.areas?.overlay, fallback.areas.overlay),
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
      const storage = getWorkspaceLayoutStorage()
      if (!storage) return
      storage.setItem(STORAGE_KEY, JSON.stringify(snapshot.value))
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

  const areas = computed(() => snapshot.value.areas)
  const rightToolArea = computed(() => snapshot.value.rightToolArea)
  const bottomPanel = computed(() => snapshot.value.bottomPanel)

  const setAreaVisibility = (areaId: WorkspaceAreaId, visible: boolean) => {
    snapshot.value.areas[areaId].visible = visible
    saveSnapshot()
  }

  const setAreaActivePanel = (areaId: WorkspaceAreaId, panelId: WorkspacePanelId | null) => {
    if (panelId && !isWorkspacePanelAllowedInArea(panelId, areaId)) {
      return
    }
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

  const updateBottomPanelHeight = (height: number) => {
    snapshot.value.bottomPanel = sanitizeBottomPanelLayout(
      { height },
      snapshot.value.bottomPanel,
    )
    saveSnapshot()
  }

  const movePanelToArea = (panelId: WorkspacePanelId, targetArea: WorkspaceAreaId) => {
    if (!isWorkspacePanelAllowedInArea(panelId, targetArea)) {
      return
    }

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
      next.rightToolArea.visible = false
    }

    if (layoutPreset === 'outline-first') {
      next.leftSidebarTab = 'outline'
      next.areas.left.activePanelId = 'outline'
      next.rightToolArea.visible = false
    }

    if (layoutPreset === 'ai-first') {
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
    rightToolArea,
    bottomPanel,
    setAreaVisibility,
    setAreaActivePanel,
    setRightToolVisible,
    setRightToolActive,
    toggleRightTool,
    updateRightToolPanelWidths,
    updateBottomPanelHeight,
    movePanelToArea,
    applyPreset,
    resetLayout,
  }
})
