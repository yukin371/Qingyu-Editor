/**
 * Switch 组件导出
 */

import Switch from './Switch.vue'
import type { SwitchProps, SwitchEmits, SwitchSize, SwitchColor, SwitchValue, BeforeChangeReturn } from './types'

// 导出组件
export { Switch }

// 导出类型
export type {
  SwitchProps,
  SwitchEmits,
  SwitchSize,
  SwitchColor,
  SwitchValue,
  BeforeChangeReturn,
}

// 导出默认属性
export { switchDefaults } from './types'

// 默认导出
export default Switch
