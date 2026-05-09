/**
 * 工具面板状态管理
 *
 * 提供统一的工具面板状态管理，支持：
 * - 打开/关闭工具面板
 * - 切换工具
 * - 记住上次使用的工具
 */

import { readonly, ref } from 'vue'
import type { EncyclopediaCategory, GraphFocusTarget } from './types'

const LAST_TOOL_KEY = 'qingyu_last_tool'
const TOOL_IDS = ['structure', 'assets', 'relations', 'timeline', 'branches'] as const
const DEFAULT_TOOL = 'structure'

export type ToolType = 'structure' | 'assets' | 'relations' | 'timeline' | 'branches'

export interface ToolOverlayContext {
  assetsCategory?: EncyclopediaCategory
  assetId?: string
  focusedAsset?: GraphFocusTarget
}

// 单例状态
const visible = ref(false)
const activeTool = ref<ToolType>(getLastTool())
const context = ref<ToolOverlayContext | null>(null)

function getLastTool(): ToolType {
  const saved = localStorage.getItem(LAST_TOOL_KEY)
  if (saved && TOOL_IDS.includes(saved as ToolType)) {
    return saved as ToolType
  }
  return DEFAULT_TOOL as ToolType
}

function setLastTool(toolId: string) {
  localStorage.setItem(LAST_TOOL_KEY, toolId)
}

export function useToolOverlay() {
  const applyContext = (nextContext?: ToolOverlayContext | null) => {
    context.value = nextContext ? { ...nextContext } : null
  }

  /**
   * 打开工具面板
   * @param tool 可选，指定打开的工具类型，默认为上次使用的工具
   */
  function open(tool?: ToolType, nextContext?: ToolOverlayContext | null) {
    if (tool) {
      activeTool.value = tool
      setLastTool(tool)
    } else {
      // 确保 activeTool 是有效的
      activeTool.value = getLastTool()
    }
    applyContext(nextContext)
    visible.value = true
  }

  /**
   * 关闭工具面板
   */
  function close() {
    visible.value = false
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
    activeTool.value = toolId
    setLastTool(toolId)
    applyContext(nextContext)
    if (!visible.value) {
      visible.value = true
    }
  }

  function openFromRightPanel(toolId: ToolType, nextContext?: ToolOverlayContext | null) {
    open(toolId, nextContext)
  }

  /**
   * 获取当前工具的名称
   */
  const toolNames: Record<ToolType, string> = {
    structure: '结构舞台',
    assets: '资产总览',
    relations: '关系图谱',
    timeline: '时间线',
    branches: '故事分支',
  }

  /**
   * 获取当前工具的图标
   */
  const toolIcons: Record<ToolType, string> = {
    structure: 'Grid',
    assets: 'Collection',
    relations: 'Share',
    timeline: 'Clock',
    branches: 'Connection',
  }

  function getToolName(toolId: ToolType): string {
    return toolNames[toolId] || toolId
  }

  function getToolIcon(toolId: ToolType): string {
    return toolIcons[toolId] || 'Tools'
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
    toolNames,
    toolIcons,
  }
}
