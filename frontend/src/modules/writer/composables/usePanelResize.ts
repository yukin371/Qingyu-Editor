/**
 * usePanelResize - 面板调整大小组合式函数
 *
 * 提供面板拖拽调整大小的功能：
 * - 拖拽开始/结束逻辑
 * - 宽度计算和约束
 * - panelStore集成
 * - 事件监听器管理
 *
 * @features
 * - 支持左/右面板拖拽
 * - 宽度约束（200-600px，可自定义）
 * - localStorage持久化（通过panelStore）
 * - collapsible功能支持
 */

import { ref, computed, watch, onUnmounted, getCurrentInstance } from 'vue'
import { usePanelStore } from '../stores/panelStore'

export interface DragStartEvent {
  position: 'left' | 'right'
  startX: number
  startY: number
  source?: 'mouse' | 'touch'
}

export interface TouchGestureOptions {
  /** 边缘阈值（避免与系统手势冲突） */
  edgeThreshold?: number
  /** 是否阻止默认行为 */
  preventDefault?: boolean
}

export interface UsePanelResizeOptions {
  /** 面板ID */
  panelId: 'left' | 'right'
  /** 默认宽度 */
  defaultWidth: number
  /** 最小宽度（默认200px） */
  minWidth?: number
  /** 最大宽度（默认600px） */
  maxWidth?: number
  /** 是否可折叠 */
  collapsible?: boolean
}

export function usePanelResize(options: UsePanelResizeOptions, touchOptions?: TouchGestureOptions) {
  // 检查是否在组件上下文中
  const isInComponent = !!getCurrentInstance()
  const {
    panelId,
    defaultWidth,
    minWidth = 200,
    maxWidth = 600,
    collapsible = false
  } = options

  const clampWidth = (width: number) => {
    return Math.max(minWidth, Math.min(maxWidth, width))
  }

  // 触摸手势配置
  const {
    edgeThreshold = 20,
    preventDefault = true
  } = touchOptions || {}

  // panelStore集成
  const panelStore = usePanelStore()

  // 获取保存的宽度（如果存在）
  const savedWidth = computed(() => {
    return panelId === 'left' ? panelStore.leftWidth : panelStore.rightWidth
  })

  const readPersistedWidth = (): number | null => {
    try {
      const saved = localStorage.getItem('qingyu_editor_panel_layout')
      if (!saved) return null
      const data = JSON.parse(saved) as { leftWidth?: unknown; rightWidth?: unknown }
      const width = panelId === 'left' ? data.leftWidth : data.rightWidth
      if (typeof width === 'number' && Number.isFinite(width)) {
        return width
      }
    } catch {
      // 忽略读取异常，回退到 store/default
    }
    return null
  }

  const persistedWidth = readPersistedWidth()

  // 当前面板宽度（本地状态，用于拖拽过程中避免频繁更新store）
  const initialWidth = persistedWidth ?? defaultWidth
  const localWidth = ref(clampWidth(initialWidth))

  // 对于可折叠的右侧面板，监听折叠状态
  const isCollapsed = computed(() => {
    if (!collapsible) return false
    return panelId === 'left' ? panelStore.leftCollapsed : panelStore.rightCollapsed
  })

  // 当前面板宽度
  const currentWidth = computed(() => {
    if (isCollapsed.value) {
      return 0
    }
    return localWidth.value
  })

  // 拖拽状态
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragSwitchLineX = ref<number | null>(null)
  const dragLastX = ref(0)
  const dragStartWidth = ref(0)
  const dragCurrentRawWidth = ref(0)
  const dragSource = ref<'mouse' | 'touch'>('mouse')
  const currentTouchId = ref<number | null>(null)
  const computeSwitchLine = (clientX: number, widthAtClientX: number) => {
    const collapseThreshold = minWidth / 2
    const offsetToLine = widthAtClientX - collapseThreshold
    return panelId === 'left'
      ? clientX - offsetToLine
      : clientX + offsetToLine
  }

  const detachGlobalListeners = () => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('blur', handleMouseUp)
    document.removeEventListener('mouseup', handleMouseUp, true)

    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('touchcancel', handleTouchEnd)
    document.removeEventListener('touchend', handleTouchEnd, true)
    document.removeEventListener('touchcancel', handleTouchEnd, true)

    // 始终恢复全局鼠标样式，避免拖拽异常中断后光标残留
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  // 监听store变化，同步到本地
  watch(
    savedWidth,
    (newWidth) => {
      if (!isDragging.value) {
        localWidth.value = clampWidth(newWidth)
      }
    },
    { flush: 'sync' },
  )

  const resolveEffectiveWidth = () => {
    const preferred = localWidth.value || savedWidth.value || defaultWidth
    return clampWidth(preferred)
  }

  /**
   * 开始拖拽
   */
  const startDrag = (event: DragStartEvent) => {
    // 检查是否在边缘区域（触摸手势）
    if (event.source === 'touch') {
      const isInEdgeArea = event.startX < edgeThreshold || event.startX > window.innerWidth - edgeThreshold
      if (isInEdgeArea) {
        // 边缘区域降低灵敏度，避免与系统手势冲突
        return
      }
    }

    isDragging.value = true
    dragStartX.value = event.startX
    dragLastX.value = event.startX
    dragStartWidth.value = isCollapsed.value ? 0 : resolveEffectiveWidth()
    dragCurrentRawWidth.value = dragStartWidth.value
    dragSource.value = event.source || 'mouse'

    // 同步切换中线：
    // 展开态每次拖拽按当前宽度重算；折叠态优先复用上次中线，首次缺失时估算一个。
    if (!isCollapsed.value) {
      dragSwitchLineX.value = computeSwitchLine(event.startX, dragStartWidth.value)
    } else if (dragSwitchLineX.value === null) {
      dragSwitchLineX.value = panelId === 'left'
        ? event.startX + (minWidth / 2)
        : event.startX - (minWidth / 2)
    }

    // 添加全局事件监听器（根据来源选择事件类型）
    if (event.source === 'touch') {
      detachGlobalListeners()
      window.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
      window.addEventListener('touchend', handleTouchEnd)
      window.addEventListener('touchcancel', handleTouchEnd)
      document.addEventListener('touchend', handleTouchEnd, true)
      document.addEventListener('touchcancel', handleTouchEnd, true)
    } else {
      detachGlobalListeners()
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mouseup', handleMouseUp, true)
      window.addEventListener('blur', handleMouseUp)
    }
  }

  /**
   * 处理鼠标移动
   */
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value) return
    if (event.buttons !== 1) {
      stopDrag()
      return
    }

    // 计算鼠标移动距离
    const deltaX = event.clientX - dragStartX.value
    dragLastX.value = event.clientX

    handleDragProgress(event.clientX, deltaX)
  }

  /**
   * 处理触摸移动
   */
  const handleTouchMove = (event: TouchEvent) => {
    if (!isDragging.value || currentTouchId.value === null) return

    const touch = event.touches[0]
    if (!touch) return

    // 计算触摸移动距离
    const deltaX = touch.clientX - dragStartX.value
    dragLastX.value = touch.clientX

    handleDragProgress(touch.clientX, deltaX)

    // 阻止默认行为（如滚动）
    if (preventDefault) {
      event.preventDefault()
    }
  }

  /**
   * 处理触摸结束
   */
  const handleTouchEnd = () => {
    if (!isDragging.value) return
    stopDrag()
  }

  /**
   * 处理鼠标松开
   */
  const handleMouseUp = () => {
    if (!isDragging.value) return
    stopDrag()
  }

  /**
   * 停止拖拽
   */
  const stopDrag = () => {
    if (!isDragging.value) return

    if (panelId === 'left') {
      if (!panelStore.leftCollapsed) {
        panelStore.setLeftWidth(localWidth.value)
      }
    } else {
      if (!panelStore.rightCollapsed) {
        panelStore.setRightWidth(localWidth.value)
      }
    }

    isDragging.value = false
    currentTouchId.value = null

    detachGlobalListeners()
  }

  const setCollapsedState = (collapsed: boolean) => {
    if (!collapsible) return
    if (panelId === 'left') {
      if (panelStore.leftCollapsed !== collapsed) {
        panelStore.setLeftCollapsed(collapsed)
      }
      return
    }
    if (panelStore.rightCollapsed !== collapsed) {
      panelStore.setRightCollapsed(collapsed)
    }
  }

  const handleDragProgress = (clientX: number, deltaX: number) => {
    const collapseThreshold = minWidth / 2
    const hysteresis = 2
    const switchLine = dragSwitchLineX.value ?? clientX

    // 折叠态下：跨过同一条中线即展开到 min（与隐藏共享同一条线）
    if (isCollapsed.value) {
      const shouldExpand = panelId === 'left'
        ? clientX >= switchLine + hysteresis
        : clientX <= switchLine - hysteresis

      if (shouldExpand) {
        setCollapsedState(false)
        localWidth.value = minWidth
        dragStartWidth.value = minWidth
        dragStartX.value = clientX
        dragSwitchLineX.value = switchLine
      }
      return
    }

    // 展开态：正常计算宽度
    let rawWidth: number
    if (panelId === 'left') {
      rawWidth = dragStartWidth.value + deltaX
    } else {
      rawWidth = dragStartWidth.value - deltaX
    }
    dragCurrentRawWidth.value = rawWidth

    const shouldCollapseByLine = panelId === 'left'
      ? clientX <= switchLine - hysteresis
      : clientX >= switchLine + hysteresis
    const shouldCollapseByWidth = rawWidth <= collapseThreshold

    // 展开态下：跨过中线（或首次达到 min/2）即隐藏
    if (collapsible && (shouldCollapseByLine || shouldCollapseByWidth)) {
      dragSwitchLineX.value = shouldCollapseByWidth
        ? computeSwitchLine(clientX, rawWidth)
        : switchLine
      setCollapsedState(true)
      dragStartWidth.value = 0
      dragStartX.value = clientX
      return
    }

    const newWidth = Math.max(minWidth, Math.min(maxWidth, rawWidth))
    localWidth.value = newWidth
  }

  /**
   * 拖拽处理函数（供组件调用）
   */
  const onDrag = (event: MouseEvent) => {
    if (!isDragging.value) return

    const deltaX = event.clientX - dragStartX.value
    dragLastX.value = event.clientX

    handleDragProgress(event.clientX, deltaX)
  }

  /**
   * 切换折叠状态（仅右侧面板）
   */
  const toggleCollapse = () => {
    if (!collapsible) return
    if (panelId === 'left') {
      panelStore.toggleLeftCollapsed()
      return
    }
    panelStore.toggleRightCollapsed()
  }

  /**
   * 清理函数
   */
  const cleanup = () => {
    if (isDragging.value) {
      stopDrag()
    }
    detachGlobalListeners()
  }

  // 组件卸载时清理（仅在组件上下文中）
  if (isInComponent) {
    onUnmounted(() => {
      cleanup()
    })
  }

  return {
    // 状态
    currentWidth,
    isDragging,
    isCollapsed,

    // 方法
    startDrag,
    onDrag,
    stopDrag,
    toggleCollapse,
    cleanup,

    // 触摸支持
    handleTouchStart: (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return

      currentTouchId.value = event.changedTouches[0].identifier

      startDrag({
        position: panelId,
        startX: touch.clientX,
        startY: touch.clientY,
        source: 'touch',
      })
    },
  }
}
