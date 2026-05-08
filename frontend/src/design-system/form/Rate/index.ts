/**
 * Rate 组件导出
 */

import Rate from './Rate.vue'
import type { RateProps, RateEmits, RateSize, RateValue } from './types'

// 导出组件
export { Rate }

// 导出类型
export type {
  RateProps,
  RateEmits,
  RateSize,
  RateValue,
}

// 导出默认属性
export { rateDefaults } from './types'

// 默认导出
export default Rate
