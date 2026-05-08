/**
 * useCanvasInteraction - 画布交互组合式函数
 *
 * 提供统一的画布交互逻辑，被 CanvasCore 组件内部使用，
 * 也可独立用于自定义画布视图。
 *
 * @features
 * - 画布平移（鼠标拖拽 / 空格+拖拽）
 * - 画布缩放（滚轮 / 方法调用）
 * - 选区管理（单击 / 框选 / Ctrl 多选）
 * - 缩放范围控制（默认 0.1 ~ 3.0）
 * - 缩放以鼠标指针为中心
 * - 快捷键映射（+/- 缩放，空格 平移）
 */

import { ref, computed, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type {
  CanvasPoint,
  CanvasTransform,
  UseCanvasInteractionOptions,
  SelectionBox,
} from './canvas.types'

/** 默认配置 */
const DEFAULT_OPTIONS: Required<UseCanvasInteractionOptions> = {
  minZoom: 0.1,
  maxZoom: 3.0,
  zoomStep: 0.1,
  zoomToPointer: true,
  initialZoom: 1,
  initialOffset: { x: 0, y: 0 },
}

export function useCanvasInteraction(
  containerRef: Ref<HTMLElement | undefined>,
  options: UseCanvasInteractionOptions = {},
) {
  const config = { ...DEFAULT_OPTIONS, ...options }

  // -------------------------------------------------------------------------
  // 核心状态
  // -------------------------------------------------------------------------
  const zoom = ref(config.initialZoom)
  const offset = ref<CanvasPoint>({ ...config.initialOffset })
  const isPanning = ref(false)
  const isSpaceDown = ref(false)

  // 选区
  const selectedIds = ref<Set<string>>(new Set())
  const selectionBox = ref<SelectionBox | null>(null)
  const isSelecting = ref(false)

  // 拖拽状态
  let panStartX = 0
  let panStartY = 0
  let panStartOffsetX = 0
  let panStartOffsetY = 0

  // -------------------------------------------------------------------------
  // 计算属性
  // -------------------------------------------------------------------------
  const transform = computed<CanvasTransform>(() => ({
    offsetX: offset.value.x,
    offsetY: offset.value.y,
    zoom: zoom.value,
  }))

  const transformStyle = computed(() => ({
    transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${zoom.value})`,
    transformOrigin: '0 0',
  }))

  const interactionMode = computed<'idle' | 'panning' | 'selecting'>(() => {
    if (isPanning.value) return 'panning'
    if (isSelecting.value) return 'selecting'
    return 'idle'
  })

  // -------------------------------------------------------------------------
  // 缩放
  // -------------------------------------------------------------------------

  /** 将缩放值限制在合法范围内 */
  function clampZoom(value: number): number {
    return Math.max(config.minZoom, Math.min(config.maxZoom, value))
  }

  /** 设置缩放值，支持以指定点为中心缩放 */
  function setZoom(newZoom: number, pivot?: CanvasPoint) {
    const clamped = clampZoom(newZoom)
    if (clamped === zoom.value) return

    if (pivot && config.zoomToPointer) {
      // 以 pivot 为中心缩放：保持 pivot 在视口中的位置不变
      const ratio = clamped / zoom.value
      offset.value = {
        x: pivot.x - ratio * (pivot.x - offset.value.x),
        y: pivot.y - ratio * (pivot.y - offset.value.y),
      }
    }

    zoom.value = clamped
  }

  /** 放大 */
  function zoomIn(pivot?: CanvasPoint) {
    setZoom(zoom.value + config.zoomStep, pivot)
  }

  /** 缩小 */
  function zoomOut(pivot?: CanvasPoint) {
    setZoom(zoom.value - config.zoomStep, pivot)
  }

  /** 重置到初始状态 */
  function resetView() {
    zoom.value = config.initialZoom
    offset.value = { ...config.initialOffset }
  }

  /** 自适应缩放到指定内容范围 */
  function zoomToFit(contentWidth: number, contentHeight: number, padding = 40) {
    const container = containerRef.value
    if (!container) return

    const viewWidth = container.clientWidth - padding * 2
    const viewHeight = container.clientHeight - padding * 2
    if (viewWidth <= 0 || viewHeight <= 0) return

    const scaleX = viewWidth / contentWidth
    const scaleY = viewHeight / contentHeight
    const fitZoom = clampZoom(Math.min(scaleX, scaleY))

    zoom.value = fitZoom
    offset.value = {
      x: (container.clientWidth - contentWidth * fitZoom) / 2,
      y: (container.clientHeight - contentHeight * fitZoom) / 2,
    }
  }

  // -------------------------------------------------------------------------
  // 平移
  // -------------------------------------------------------------------------

  function handlePanStart(clientX: number, clientY: number) {
    isPanning.value = true
    panStartX = clientX
    panStartY = clientY
    panStartOffsetX = offset.value.x
    panStartOffsetY = offset.value.y
  }

  function handlePanMove(clientX: number, clientY: number) {
    if (!isPanning.value) return
    offset.value = {
      x: panStartOffsetX + (clientX - panStartX),
      y: panStartOffsetY + (clientY - panStartY),
    }
  }

  function handlePanEnd() {
    isPanning.value = false
  }

  // -------------------------------------------------------------------------
  // 选区
  // -------------------------------------------------------------------------

  function setSelectedIds(ids: string[]) {
    selectedIds.value = new Set(ids)
  }

  function addToSelection(id: string) {
    const next = new Set(selectedIds.value)
    next.add(id)
    selectedIds.value = next
  }

  function removeFromSelection(id: string) {
    const next = new Set(selectedIds.value)
    next.delete(id)
    selectedIds.value = next
  }

  function toggleSelection(id: string) {
    if (selectedIds.value.has(id)) {
      removeFromSelection(id)
    } else {
      addToSelection(id)
    }
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  function selectAll(nodeIds: string[]) {
    selectedIds.value = new Set(nodeIds)
  }

  function handleSelectionStart(clientX: number, clientY: number) {
    isSelecting.value = true
    selectionBox.value = {
      startX: clientX,
      startY: clientY,
      endX: clientX,
      endY: clientY,
    }
  }

  function handleSelectionMove(clientX: number, clientY: number) {
    if (!isSelecting.value || !selectionBox.value) return
    selectionBox.value = {
      ...selectionBox.value,
      endX: clientX,
      endY: clientY,
    }
  }

  function handleSelectionEnd() {
    isSelecting.value = false
    selectionBox.value = null
  }

  function getContainerRelativePoint(clientX: number, clientY: number): CanvasPoint {
    const container = containerRef.value
    if (!container) {
      return { x: clientX, y: clientY }
    }

    const rect = container.getBoundingClientRect()
    const scaleX = container.clientWidth > 0 ? rect.width / container.clientWidth : 1
    const scaleY = container.clientHeight > 0 ? rect.height / container.clientHeight : 1

    return {
      x: (clientX - rect.left - container.clientLeft) / scaleX,
      y: (clientY - rect.top - container.clientTop) / scaleY,
    }
  }

  // -------------------------------------------------------------------------
  // 鼠标事件
  // -------------------------------------------------------------------------

  function onMouseDown(event: MouseEvent) {
    // 中键拖拽 或 空格+左键拖拽 => 平移
    if (event.button === 1 || (event.button === 0 && isSpaceDown.value)) {
      event.preventDefault()
      handlePanStart(event.clientX, event.clientY)
      return
    }

    // 左键按下（非空格模式）=> 准备选区
    if (event.button === 0) {
      const point = getContainerRelativePoint(event.clientX, event.clientY)
      handleSelectionStart(point.x, point.y)
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (isPanning.value) {
      handlePanMove(event.clientX, event.clientY)
      return
    }
    if (isSelecting.value) {
      const point = getContainerRelativePoint(event.clientX, event.clientY)
      handleSelectionMove(point.x, point.y)
    }
  }

  function onMouseUp(_event: MouseEvent) {
    if (isPanning.value) {
      handlePanEnd()
      return
    }
    if (isSelecting.value) {
      handleSelectionEnd()
    }
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault()
    const container = containerRef.value
    if (!container) return

    const rect = container.getBoundingClientRect()
    const pivot: CanvasPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }

    const delta = event.deltaY > 0 ? -config.zoomStep : config.zoomStep
    setZoom(zoom.value + delta, pivot)
  }

  // -------------------------------------------------------------------------
  // 键盘事件
  // -------------------------------------------------------------------------

  function onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault()
      isSpaceDown.value = true
    }
    if (event.code === 'Equal' || event.code === 'NumpadAdd') {
      event.preventDefault()
      zoomIn()
    }
    if (event.code === 'Minus' || event.code === 'NumpadSubtract') {
      event.preventDefault()
      zoomOut()
    }
    if (event.code === 'Digit0' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      resetView()
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    if (event.code === 'Space') {
      isSpaceDown.value = false
    }
  }

  // -------------------------------------------------------------------------
  // 生命周期
  // -------------------------------------------------------------------------

  function attachListeners() {
    const container = containerRef.value
    if (!container) return

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
  }

  function detachListeners() {
    const container = containerRef.value
    if (container) {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('mousedown', onMouseDown)
    }
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  }

  onMounted(() => {
    attachListeners()
  })

  onUnmounted(() => {
    detachListeners()
  })

  // 当 containerRef 发生变化时重新绑定
  watch(containerRef, (newEl, oldEl) => {
    if (oldEl) detachListeners()
    if (newEl) attachListeners()
  })

  // -------------------------------------------------------------------------
  // 返回
  // -------------------------------------------------------------------------
  return {
    // 响应式状态
    zoom,
    offset,
    isPanning,
    isSpaceDown,
    isSelecting,
    selectedIds,
    selectionBox,
    transform,
    transformStyle,
    interactionMode,

    // 缩放方法
    setZoom,
    zoomIn,
    zoomOut,
    resetView,
    zoomToFit,

    // 平移方法
    handlePanStart,
    handlePanMove,
    handlePanEnd,

    // 选区方法
    setSelectedIds,
    addToSelection,
    removeFromSelection,
    toggleSelection,
    clearSelection,
    selectAll,

    // 事件处理
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,

    // 生命周期
    attachListeners,
    detachListeners,
  }
}

export type UseCanvasInteractionReturn = ReturnType<typeof useCanvasInteraction>
