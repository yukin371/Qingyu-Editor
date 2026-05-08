import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  WorkspaceAreaId,
  WorkspaceAreaState,
  WorkspaceLayoutPreset,
  WorkspaceLayoutSnapshot,
  WorkspacePanelId,
  WorkspaceRightPanelTab,
  WorkspaceSidebarTab,
} from '@/modules/writer/types/workspaceLayout'

const STORAGE_KEY = 'qingyu_editor_workspace_layout_v1'

function createDefaultSnapshot(): WorkspaceLayoutSnapshot {
  return {
    preset: 'default',
    leftSidebarTab: 'chapters',
    rightPanelTab: 'chat',
    areas: {
      left: {
        visible: true,
        activePanelId: 'chapters',
        panelIds: ['chapters', 'outline'],
      },
      right: {
        visible: true,
        activePanelId: 'ai',
        panelIds: ['ai', 'harness'],
      },
      bottom: {
        visible: false,
        activePanelId: 'status',
        panelIds: ['status', 'context'],
      },
      overlay: {
        visible: false,
        activePanelId: 'assets',
        panelIds: ['assets', 'relations', 'timeline', 'branches'],
      },
    },
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
    }

    if (layoutPreset === 'outline-first') {
      next.leftSidebarTab = 'outline'
      next.areas.left.activePanelId = 'outline'
    }

    if (layoutPreset === 'ai-first') {
      next.rightPanelTab = 'chat'
      next.areas.right.activePanelId = 'ai'
      next.areas.right.visible = true
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
    setAreaVisibility,
    setAreaActivePanel,
    movePanelToArea,
    applyPreset,
    resetLayout,
  }
})
