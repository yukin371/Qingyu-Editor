/**
 * Slider 组件导出
 */

import Slider from './Slider.vue'
import type {
  SliderProps,
  SliderEmits,
  SliderSize,
  SliderColor,
  SliderValue,
  SliderMarks,
  TooltipFormatter,
} from './types'

// 导出组件
export { Slider }

// 导出类型
export type {
  SliderProps,
  SliderEmits,
  SliderSize,
  SliderColor,
  SliderValue,
  SliderMarks,
  TooltipFormatter,
}

// 导出默认属性
export { sliderDefaults } from './types'

// 默认导出
export default Slider
