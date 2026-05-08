/**
 * QySelect 组件导出
 *
 * QySelect: Apple 风格单选下拉栏
 * Select: 全功能下拉选择器（支持多选、搜索、远程等）
 */

export { default as QySelect } from './Select.vue'
export type { SelectOption, SelectProps, SelectEmits } from './types'

// 全功能遗留版本
export { default as Select } from './SelectLegacy.vue'
export type {
  SelectSize,
  SelectProps as SelectFullProps,
  SelectEmits as SelectFullEmits,
  SelectSlots,
  selectDefaults,
} from './types-legacy'
