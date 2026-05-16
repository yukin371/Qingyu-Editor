import { onUnmounted, ref } from 'vue'
import { useShortcutConfig } from './useShortcutConfig'
import type { ToolType } from './useToolOverlay'
import {
  WORKSPACE_CLOSE_OVERLAY_ACTION,
  WORKSPACE_OPEN_LAST_TOOL_ACTION,
  WORKSPACE_TOGGLE_LEFT_PANEL_ACTION,
  WORKSPACE_TOGGLE_RIGHT_PANEL_ACTION,
  WORKSPACE_TOOL_SHORTCUT_ACTIONS,
} from './workspaceShortcutActions'

interface UseWorkspaceShortcutsOptions {
  openLatestTool: () => void
  openTool: (tool: ToolType) => void
  closeOverlay: () => void
  isOverlayVisible: () => boolean
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
}

/**
 * 工作区快捷键管理
 * 集成 useShortcutConfig 提供统一的快捷键管理
 */
export function useWorkspaceShortcuts(options: UseWorkspaceShortcutsOptions) {
  const shortcutsEnabled = ref(true)

  const { registerHandler } = useShortcutConfig()
  const unregisterHandlers: Array<() => void> = []

  const registerWorkspaceHandler = (actionId: string, handler: (event: KeyboardEvent) => void) => {
    unregisterHandlers.push(
      registerHandler(actionId, (event: KeyboardEvent) => {
        if (!shortcutsEnabled.value) {
          return
        }

        handler(event)
      }),
    )
  }

  registerWorkspaceHandler(WORKSPACE_OPEN_LAST_TOOL_ACTION.id, (event: KeyboardEvent) => {
    event.preventDefault()
    options.openLatestTool()
  })

  registerWorkspaceHandler(WORKSPACE_TOGGLE_LEFT_PANEL_ACTION.id, (event: KeyboardEvent) => {
    event.preventDefault()
    options.toggleLeftPanel()
  })

  registerWorkspaceHandler(WORKSPACE_TOGGLE_RIGHT_PANEL_ACTION.id, (event: KeyboardEvent) => {
    event.preventDefault()
    options.toggleRightPanel()
  })

  WORKSPACE_TOOL_SHORTCUT_ACTIONS.forEach((action) => {
    registerWorkspaceHandler(action.id, (event: KeyboardEvent) => {
      event.preventDefault()
      options.openTool(action.tool)
    })
  })

  registerWorkspaceHandler(WORKSPACE_CLOSE_OVERLAY_ACTION.id, (event: KeyboardEvent) => {
    if (!options.isOverlayVisible()) {
      return
    }

    event.preventDefault()
    options.closeOverlay()
  })

  onUnmounted(() => {
    unregisterHandlers.splice(0).forEach((unregister) => unregister())
  })

  return {
    shortcutsEnabled,
  }
}
