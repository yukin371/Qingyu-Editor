/**
 * 工具面板状态管理
 *
 * 提供统一的工具面板状态管理，支持：
 * - 打开/关闭工具面板
 * - 切换工具
 * - 记住上次使用的工具
 */

import { computed, readonly, ref } from 'vue'
import {
  DEFAULT_OVERLAY_TOOL,
  OVERLAY_TOOL_ORDER,
  getWorkspacePanelIcon,
  getWorkspacePanelTitle,
} from '@/modules/writer/config/workspacePanels'
import { useWorkspaceLayoutStore } from '@/modules/writer/stores/workspaceLayoutStore'
import type { OverlayToolType } from '@/modules/writer/types/workspaceLayout'
import type { EncyclopediaCategory, GraphFocusTarget } from './types'

export type ToolType = OverlayToolType

export interface ToolOverlayContext {
  assetsCategory?: EncyclopediaCategory
  assetId?: string
  focusedAsset?: GraphFocusTarget
}

// 单例状态
const context = ref<ToolOverlayContext | null>(null)

function isOverlayTool(panelId: unknown): panelId is ToolType {
  return typeof panelId === 'string' && OVERLAY_TOOL_ORDER.includes(panelId as ToolType)
}

export function useToolOverlay() {
  const workspaceLayoutStore = useWorkspaceLayoutStore()
  const visible = computed(() => workspaceLayoutStore.areas.overlay.visible)
  const activeTool = computed<ToolType>(() => {
    const panelId = workspaceLayoutStore.areas.overlay.activePanelId
    return isOverlayTool(panelId) ? panelId : DEFAULT_OVERLAY_TOOL
  })

  const applyContext = (nextContext?: ToolOverlayContext | null) => {
    context.value = nextContext ? { ...nextContext } : null
  }

  /**
   * 打开工具面板
   * @param tool 可选，指定打开的工具类型，默认为上次使用的工具
   */
  function open(tool?: ToolType, nextContext?: ToolOverlayContext | null) {
    workspaceLayoutStore.setAreaActivePanel('overlay', tool ?? activeTool.value)
    applyContext(nextContext)
    workspaceLayoutStore.setAreaVisibility('overlay', true)
  }

  /**
   * 关闭工具面板
   */
  function close() {
    workspaceLayoutStore.setAreaVisibility('overlay', false)
  }

  /**
   * 切换工具面板可见状态
   */
  function toggle() {
    if (visible.value) {
      close()
    } else {
      open()
    }
  }

  /**
   * 切换到指定工具
   * 如果面板未打开，会自动打开
   */
  function switchTool(toolId: ToolType, nextContext?: ToolOverlayContext | null) {
    workspaceLayoutStore.setAreaActivePanel('overlay', toolId)
    applyContext(nextContext)
    workspaceLayoutStore.setAreaVisibility('overlay', true)
  }

  function openFromRightPanel(toolId: ToolType, nextContext?: ToolOverlayContext | null) {
    open(toolId, nextContext)
  }

  /**
   * 获取当前工具的名称
   */
  function getToolName(toolId: ToolType): string {
    return getWorkspacePanelTitle(toolId)
  }

  function getToolIcon(toolId: ToolType): string {
    return getWorkspacePanelIcon(toolId)
  }

  return {
    // 只读状态
    visible: readonly(visible),
    activeTool: readonly(activeTool),
    context: readonly(context),
    // 方法
    open,
    close,
    toggle,
    switchTool,
    openFromRightPanel,
    // 工具信息
    getToolName,
    getToolIcon,
  }
}
