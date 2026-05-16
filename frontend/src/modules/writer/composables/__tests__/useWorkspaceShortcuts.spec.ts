import { describe, expect, it, vi, beforeEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import {
  WORKSPACE_CLOSE_OVERLAY_ACTION,
  WORKSPACE_OPEN_LAST_TOOL_ACTION,
  WORKSPACE_TOGGLE_LEFT_PANEL_ACTION,
  WORKSPACE_TOGGLE_RIGHT_PANEL_ACTION,
  WORKSPACE_TOOL_SHORTCUT_ACTIONS,
} from '../workspaceShortcutActions'

const registeredHandlers = new Map<string, (event: KeyboardEvent) => void>()

vi.mock('../useShortcutConfig', () => ({
  useShortcutConfig: () => ({
    registerHandler: (actionId: string, handler: (event: KeyboardEvent) => void) => {
      registeredHandlers.set(actionId, handler)
      return () => {
        registeredHandlers.delete(actionId)
      }
    },
  }),
}))

import { useWorkspaceShortcuts } from '../useWorkspaceShortcuts'

describe('useWorkspaceShortcuts', () => {
  beforeEach(() => {
    registeredHandlers.clear()
  })

  const mountHarness = (visible = false) => {
    const openLatestTool = vi.fn()
    const openTool = vi.fn()
    const closeOverlay = vi.fn()
    const toggleLeftPanel = vi.fn()
    const toggleRightPanel = vi.fn()

    const Harness = defineComponent({
      setup() {
        useWorkspaceShortcuts({
          openLatestTool,
          openTool,
          closeOverlay,
          isOverlayVisible: () => visible,
          toggleLeftPanel,
          toggleRightPanel,
        })
        return () => null
      },
    })

    mount(Harness)

    return {
      openLatestTool,
      openTool,
      closeOverlay,
      toggleLeftPanel,
      toggleRightPanel,
    }
  }

  it('应为工具动作和关闭动作注册 handler', () => {
    mountHarness()

    expect(registeredHandlers.has(WORKSPACE_OPEN_LAST_TOOL_ACTION.id)).toBe(true)
    WORKSPACE_TOOL_SHORTCUT_ACTIONS.forEach((action) => {
      expect(registeredHandlers.has(action.id)).toBe(true)
    })
    expect(registeredHandlers.has(WORKSPACE_CLOSE_OVERLAY_ACTION.id)).toBe(true)
    expect(registeredHandlers.has(WORKSPACE_TOGGLE_LEFT_PANEL_ACTION.id)).toBe(true)
    expect(registeredHandlers.has(WORKSPACE_TOGGLE_RIGHT_PANEL_ACTION.id)).toBe(true)
  })

  it('tool.open 应触发打开最近一次工具', () => {
    const { openLatestTool } = mountHarness()

    registeredHandlers.get(WORKSPACE_OPEN_LAST_TOOL_ACTION.id)?.(
      new KeyboardEvent('keydown', { key: 'g' }),
    )

    expect(openLatestTool).toHaveBeenCalledTimes(1)
  })

  it('tool.switchStructure 应触发打开指定工具', () => {
    const { openTool } = mountHarness()
    const structureAction = WORKSPACE_TOOL_SHORTCUT_ACTIONS.find(
      (action) => action.tool === 'structure',
    )

    if (structureAction) {
      registeredHandlers.get(structureAction.id)?.(new KeyboardEvent('keydown', { key: 'S' }))
    }

    expect(openTool).toHaveBeenCalledWith('structure')
  })

  it('workspace.toggleLeftPanel 应触发左侧栏折叠切换', () => {
    const { toggleLeftPanel } = mountHarness()

    registeredHandlers.get(WORKSPACE_TOGGLE_LEFT_PANEL_ACTION.id)?.(
      new KeyboardEvent('keydown', { key: '[' }),
    )

    expect(toggleLeftPanel).toHaveBeenCalledTimes(1)
  })

  it('workspace.toggleRightPanel 应触发右侧栏折叠切换', () => {
    const { toggleRightPanel } = mountHarness()

    registeredHandlers.get(WORKSPACE_TOGGLE_RIGHT_PANEL_ACTION.id)?.(
      new KeyboardEvent('keydown', { key: ']' }),
    )

    expect(toggleRightPanel).toHaveBeenCalledTimes(1)
  })

  it('workspace.closeOverlay 仅在 overlay 可见时才触发关闭', () => {
    const hidden = mountHarness(false)
    registeredHandlers.get(WORKSPACE_CLOSE_OVERLAY_ACTION.id)?.(
      new KeyboardEvent('keydown', { key: 'Escape' }),
    )
    expect(hidden.closeOverlay).not.toHaveBeenCalled()

    registeredHandlers.clear()
    const visible = mountHarness(true)
    registeredHandlers.get(WORKSPACE_CLOSE_OVERLAY_ACTION.id)?.(
      new KeyboardEvent('keydown', { key: 'Escape' }),
    )
    expect(visible.closeOverlay).toHaveBeenCalledTimes(1)
  })
})
