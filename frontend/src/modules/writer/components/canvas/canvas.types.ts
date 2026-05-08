/**
 * canvas.types - 画布系统类型定义
 *
 * 提供 CanvasCore 组件及其消费者所需的全部共享类型。
 * 所有画布工具（结构舞台、故事分支、实体图谱）共享此类型体系。
 */

// ---------------------------------------------------------------------------
// 基础几何类型
// ---------------------------------------------------------------------------

/** 二维坐标点 */
export interface CanvasPoint {
  x: number
  y: number
}

/** 二维尺寸 */
export interface CanvasSize {
  width: number
  height: number
}

/** 矩形边界 */
export interface CanvasRect {
  x: number
  y: number
  width: number
  height: number
}

// ---------------------------------------------------------------------------
// 画布变换
// ---------------------------------------------------------------------------

/** 画布变换状态（平移 + 缩放） */
export interface CanvasTransform {
  /** 水平偏移 (px) */
  offsetX: number
  /** 垂直偏移 (px) */
  offsetY: number
  /** 缩放倍率 */
  zoom: number
}

/** 画布边界约束 */
export interface CanvasBounds {
  /** 最小水平偏移 */
  minOffsetX: number
  /** 最大水平偏移 */
  maxOffsetX: number
  /** 最小垂直偏移 */
  minOffsetY: number
  /** 最大垂直偏移 */
  maxOffsetY: number
}

// ---------------------------------------------------------------------------
// 节点
// ---------------------------------------------------------------------------

/** 画布节点基础接口 - 所有画布工具的节点类型需实现此接口 */
export interface CanvasNode {
  /** 唯一标识 */
  id: string
  /** 节点位置 x */
  x: number
  /** 节点位置 y */
  y: number
  /** 节点宽度 */
  width: number
  /** 节点高度 */
  height: number
}

// ---------------------------------------------------------------------------
// 连线
// ---------------------------------------------------------------------------

/** 画布连线基础接口 */
export interface CanvasEdge {
  /** 唯一标识 */
  id: string
  /** 起点节点 ID */
  sourceId: string
  /** 终点节点 ID */
  targetId: string
}

// ---------------------------------------------------------------------------
// 交互状态
// ---------------------------------------------------------------------------

/** 画布交互模式 */
export type CanvasInteractionMode = 'idle' | 'panning' | 'selecting'

/** 画布交互状态快照 */
export interface CanvasInteractionState {
  /** 当前交互模式 */
  mode: CanvasInteractionMode
  /** 是否处于空格键按住状态（用于平移模式切换） */
  isSpaceDown: boolean
  /** 当前缩放值 */
  zoom: number
  /** 当前偏移 */
  offset: CanvasPoint
}

// ---------------------------------------------------------------------------
// 选区
// ---------------------------------------------------------------------------

/** 选区框矩形（屏幕坐标系） */
export interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
}

// ---------------------------------------------------------------------------
// 组件配置
// ---------------------------------------------------------------------------

/** CanvasCore 组件 Props 类型 */
export interface CanvasCoreProps {
  /** 最小缩放值（默认 0.1） */
  minZoom?: number
  /** 最大缩放值（默认 3.0） */
  maxZoom?: number
  /** 缩放步长（默认 0.1） */
  zoomStep?: number
  /** 是否启用选区框选（默认 true） */
  enableSelection?: boolean
  /** 是否显示网格背景（默认 false） */
  showGrid?: boolean
  /** 网格间距 px（默认 20） */
  gridSize?: number
  /** 初始缩放值 */
  initialZoom?: number
  /** 初始偏移 */
  initialOffset?: CanvasPoint
  /** 画布容器类名 */
  containerClass?: string
}

/** CanvasCore 组件 Emits 类型 */
export interface CanvasCoreEmits {
  (e: 'zoom-change', zoom: number): void
  (e: 'offset-change', offset: CanvasPoint): void
  (e: 'selection-change', ids: string[]): void
  (e: 'canvas-click', event: MouseEvent): void
  (e: 'canvas-contextmenu', event: MouseEvent): void
  (e: 'node-click', nodeId: string, event: MouseEvent): void
  (e: 'node-dblclick', nodeId: string, event: MouseEvent): void
}

// ---------------------------------------------------------------------------
// composable 配置
// ---------------------------------------------------------------------------

/** useCanvasInteraction composable 配置 */
export interface UseCanvasInteractionOptions {
  /** 最小缩放值 */
  minZoom?: number
  /** 最大缩放值 */
  maxZoom?: number
  /** 缩放步长 */
  zoomStep?: number
  /** 缩放时是否以鼠标指针为中心（默认 true） */
  zoomToPointer?: boolean
  /** 初始缩放值 */
  initialZoom?: number
  /** 初始偏移 */
  initialOffset?: CanvasPoint
}
