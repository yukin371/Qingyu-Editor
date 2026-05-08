import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'qingyu_editor_panel_layout'

interface PanelState {
  leftWidth: number
  rightWidth: number
  leftCollapsed: boolean
  rightCollapsed: boolean
}

export const usePanelStore = defineStore('panel', () => {
  const clampWidth = (width: unknown, fallback: number) => {
    if (typeof width !== 'number' || Number.isNaN(width)) {
      return fallback
    }
    return Math.max(200, Math.min(600, width))
  }

  // 从 localStorage 加载或使用默认值
  const loadState = (): PanelState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PanelState>
        return {
          leftWidth: clampWidth(parsed.leftWidth, 280),
          rightWidth: clampWidth(parsed.rightWidth, 320),
          leftCollapsed: Boolean(parsed.leftCollapsed),
          rightCollapsed: Boolean(parsed.rightCollapsed)
        }
      }
    } catch (error) {
      console.warn('Failed to load panel state:', error)
    }
    return {
      leftWidth: 280,
      rightWidth: 320,
      leftCollapsed: false,
      rightCollapsed: false
    }
  }

  const state = loadState()

  // 响应式状态
  const leftWidth = ref(state.leftWidth)
  const rightWidth = ref(state.rightWidth)
  const leftCollapsed = ref(state.leftCollapsed)
  const rightCollapsed = ref(state.rightCollapsed)

  // 保存到 localStorage
  const saveState = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        leftWidth: leftWidth.value,
        rightWidth: rightWidth.value,
        leftCollapsed: leftCollapsed.value,
        rightCollapsed: rightCollapsed.value
      }))
    } catch (error) {
      console.warn('Failed to save panel state:', error)
    }
  }

  // Actions
  const setLeftWidth = (width: number) => {
    leftWidth.value = Math.max(200, Math.min(600, width))
    saveState()
  }

  const setRightWidth = (width: number) => {
    rightWidth.value = Math.max(200, Math.min(600, width))
    saveState()
  }

  const toggleRightCollapsed = () => {
    rightCollapsed.value = !rightCollapsed.value
    saveState()
  }

  const toggleLeftCollapsed = () => {
    leftCollapsed.value = !leftCollapsed.value
    saveState()
  }

  const setLeftCollapsed = (collapsed: boolean) => {
    leftCollapsed.value = collapsed
    saveState()
  }

  const setRightCollapsed = (collapsed: boolean) => {
    rightCollapsed.value = collapsed
    saveState()
  }

  const resetToDefaults = () => {
    leftWidth.value = 280
    rightWidth.value = 320
    leftCollapsed.value = false
    rightCollapsed.value = false
    saveState()
  }

  return {
    leftWidth,
    rightWidth,
    leftCollapsed,
    rightCollapsed,
    setLeftWidth,
    setRightWidth,
    toggleLeftCollapsed,
    toggleRightCollapsed,
    setLeftCollapsed,
    setRightCollapsed,
    resetToDefaults
  }
})
