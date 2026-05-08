/**
 * useResponsiveLayout.ts
 * 响应式布局组合式函数
 *
 * 功能：
 * 1. 响应式断点检测（mobile/tablet/desktop）
 * 2. 布局模式切换逻辑
 * 3. 面板状态管理（expanded/collapsed/overlay）
 * 4. localStorage持久化用户设置
 * 5. 触摸手势支持
 */

import { ref, computed, watch } from 'vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

// ==================== 类型定义 ====================

/**
 * 布局模式
 */
export type LayoutMode = 'mobile' | 'tablet' | 'desktop'

/**
 * 面板状态
 */
export type PanelState = 'expanded' | 'collapsed' | 'overlay'

/**
 * 面板位置
 */
export type PanelPosition = 'left' | 'right'

/**
 * 面板配置
 */
export interface PanelConfig {
  position: PanelPosition
  state: PanelState
  width: number
  defaultWidth: number
  minWidth: number
  maxWidth: number
  visible: boolean
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  mode: LayoutMode
  leftPanel: PanelConfig
  rightPanel: PanelConfig
  activeTab: 'editor' | 'left' | 'right'
}

/**
 * localStorage存储的布局设置
 */
interface StoredLayoutSettings {
  leftPanelWidth?: number
  rightPanelWidth?: number
  leftPanelCollapsed?: boolean
  rightPanelCollapsed?: boolean
}

// ==================== 常量定义 ====================

const BREAKPOINTS = {
  mobile: 768, // 移动端断点
  tablet: 1024, // 平板端断点
  desktop: 1024, // 桌面端断点
}

const STORAGE_KEY = 'editor-layout-settings'

const DEFAULT_PANEL_WIDTHS = {
  left: 280,
  right: 320,
}

const PANEL_CONSTRAINTS = {
  minWidth: 200,
  maxWidth: 600,
}

// ==================== 主函数 ====================

export function useResponsiveLayout() {
  // 响应式断点检测
  const breakpoints = useBreakpoints(BREAKPOINTS)

  // 从localStorage加载用户设置
  const storedSettings = ref<StoredLayoutSettings>(loadStoredSettings())

  // 当前布局模式
  const layoutMode = computed<LayoutMode>(() => {
    if (breakpoints.isMobile.value) return 'mobile'
    if (breakpoints.isTablet.value) return 'tablet'
    return 'desktop'
  })

  // 左侧面板配置
  const leftPanel = computed<PanelConfig>(() => {
    const baseWidth = storedSettings.value.leftPanelWidth || DEFAULT_PANEL_WIDTHS.left
    const collapsed = storedSettings.value.leftPanelCollapsed ?? false

    return {
      position: 'left',
      state: getPanelState('left', layoutMode.value, collapsed),
      width: baseWidth,
      defaultWidth: DEFAULT_PANEL_WIDTHS.left,
      minWidth: PANEL_CONSTRAINTS.minWidth,
      maxWidth: PANEL_CONSTRAINTS.maxWidth,
      visible:
        layoutMode.value !== 'mobile' ||
        (layoutMode.value === 'mobile' && activeTab.value === 'left'),
    }
  })

  // 右侧面板配置
  const rightPanel = computed<PanelConfig>(() => {
    const baseWidth = storedSettings.value.rightPanelWidth || DEFAULT_PANEL_WIDTHS.right
    const collapsed = storedSettings.value.rightPanelCollapsed ?? false

    return {
      position: 'right',
      state: getPanelState('right', layoutMode.value, collapsed),
      width: baseWidth,
      defaultWidth: DEFAULT_PANEL_WIDTHS.right,
      minWidth: PANEL_CONSTRAINTS.minWidth,
      maxWidth: PANEL_CONSTRAINTS.maxWidth,
      visible:
        layoutMode.value !== 'mobile' ||
        (layoutMode.value === 'mobile' && activeTab.value === 'right'),
    }
  })

  // 当前激活的tab（移动端使用）
  const activeTab = ref<'editor' | 'left' | 'right'>('editor')

  // 完整的布局配置
  const layout = computed<LayoutConfig>(() => ({
    mode: layoutMode.value,
    leftPanel: leftPanel.value,
    rightPanel: rightPanel.value,
    activeTab: activeTab.value,
  }))

  // ==================== 方法 ====================

  /**
   * 切换移动端tab
   */
  function switchTab(tab: 'editor' | 'left' | 'right') {
    activeTab.value = tab
  }

  /**
   * 切换面板折叠状态
   */
  function togglePanel(position: PanelPosition) {
    const key = position === 'left' ? 'leftPanelCollapsed' : 'rightPanelCollapsed'
    const currentCollapsed =
      position === 'left'
        ? storedSettings.value.leftPanelCollapsed
        : storedSettings.value.rightPanelCollapsed

    storedSettings.value = {
      ...storedSettings.value,
      [key]: !currentCollapsed,
    }

    saveStoredSettings(storedSettings.value)
  }

  /**
   * 更新面板宽度
   */
  function updatePanelWidth(position: PanelPosition, width: number) {
    const key = position === 'left' ? 'leftPanelWidth' : 'rightPanelWidth'

    // 确保宽度在约束范围内
    const clampedWidth = Math.max(
      PANEL_CONSTRAINTS.minWidth,
      Math.min(PANEL_CONSTRAINTS.maxWidth, width),
    )

    storedSettings.value = {
      ...storedSettings.value,
      [key]: clampedWidth,
    }

    saveStoredSettings(storedSettings.value)
  }

  /**
   * 重置布局设置
   */
  function resetLayout() {
    storedSettings.value = {}
    activeTab.value = 'editor'
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * 处理触摸手势
   */
  function handleTouchGesture(direction: 'left' | 'right') {
    if (layoutMode.value !== 'mobile') return

    const tabs: Array<'editor' | 'left' | 'right'> = ['left', 'editor', 'right']
    const currentIndex = tabs.indexOf(activeTab.value)

    if (direction === 'left' && currentIndex < tabs.length - 1) {
      switchTab(tabs[currentIndex + 1])
    } else if (direction === 'right' && currentIndex > 0) {
      switchTab(tabs[currentIndex - 1])
    }
  }

  // ==================== 监听器 ====================

  // 监听布局模式变化，自动调整面板状态
  watch(layoutMode, (newMode, oldMode) => {
    if (newMode !== oldMode) {
      // 切换到移动端时，重置为编辑器tab
      if (newMode === 'mobile') {
        activeTab.value = 'editor'
      }

      // 切换到平板端时，默认折叠侧边栏
      if (newMode === 'tablet' && oldMode === 'desktop') {
        if (!storedSettings.value.leftPanelCollapsed) {
          storedSettings.value.leftPanelCollapsed = true
        }
        if (!storedSettings.value.rightPanelCollapsed) {
          storedSettings.value.rightPanelCollapsed = true
        }
        saveStoredSettings(storedSettings.value)
      }
    }
  })

  // ==================== 工具函数 ====================

  /**
   * 根据布局模式和位置获取面板状态
   */
  function getPanelState(
    _position: PanelPosition,
    mode: LayoutMode,
    collapsed: boolean,
  ): PanelState {
    // 移动端：overlay模式
    if (mode === 'mobile') {
      return 'overlay'
    }

    // 平板端/桌面端：根据折叠状态
    return collapsed ? 'collapsed' : 'expanded'
  }

  return {
    // 状态
    layout,
    layoutMode,
    leftPanel,
    rightPanel,
    activeTab,

    // 方法
    switchTab,
    togglePanel,
    updatePanelWidth,
    resetLayout,
    handleTouchGesture,
  }
}

// ==================== 辅助函数 ====================

/**
 * 从localStorage加载布局设置
 */
function loadStoredSettings(): StoredLayoutSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn('[useResponsiveLayout] Failed to load stored settings:', error)
  }
  return {}
}

/**
 * 保存布局设置到localStorage
 */
function saveStoredSettings(settings: StoredLayoutSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('[useResponsiveLayout] Failed to save settings:', error)
  }
}
