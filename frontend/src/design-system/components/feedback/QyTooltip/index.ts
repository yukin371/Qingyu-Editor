/**
 * QyTooltip - Tooltip 提示组件
 *
 * 基于 Tailwind v4 和 CVA 的提示组件
 * 支持多种位置、效果和触发方式
 */

import QyTooltip from './QyTooltip.vue'

export { QyTooltip }
export { tooltipVariants } from './variants'
export type {
  QyTooltipProps,
  QyTooltipEmits,
  QyTooltipInstance,
  TooltipPlacement,
  TooltipEffect
} from './types'

export default QyTooltip
