/**
 * canvas - 统一画布系统入口
 *
 * 导出 CanvasCore 组件、useCanvasInteraction composable 及类型定义。
 */

export { default as CanvasCore } from './CanvasCore.vue'
export { useCanvasInteraction } from './useCanvasInteraction'
export type { UseCanvasInteractionReturn } from './useCanvasInteraction'

export type {
  CanvasPoint,
  CanvasSize,
  CanvasRect,
  CanvasTransform,
  CanvasBounds,
  CanvasNode,
  CanvasEdge,
  CanvasInteractionMode,
  CanvasInteractionState,
  SelectionBox,
  CanvasCoreProps,
  CanvasCoreEmits,
  UseCanvasInteractionOptions,
} from './canvas.types'
