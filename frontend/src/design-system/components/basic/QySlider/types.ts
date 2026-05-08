/**
 * QySlider 类型定义
 */

/**
 * 滑块颜色类型
 */
export type SliderColor = 'primary' | 'success' | 'warning' | 'danger'

/**
 * 滑块尺寸类型
 */
export type SliderSize = 'sm' | 'md' | 'lg'

/**
 * 滑块值类型
 */
export type SliderValue = number | number[]

/**
 * 刻度标记类型
 */
export interface SliderMark {
  /**
   * 刻度值
   */
  value: number
  /**
   * 刻度标签
   */
  label: string | number
  /**
   * 刻度位置百分比（0-100）
   */
  percent: number
}

/**
 * QySlider 组件 Props
 */
export interface QySliderProps {
  /**
   * v-model 绑定值
   * @default 0
   */
  modelValue: SliderValue
  /**
   * 最小值
   * @default 0
   */
  min?: number
  /**
   * 最大值
   * @default 100
   */
  max?: number
  /**
   * 步长
   * @default 1
   */
  step?: number
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 是否为范围模式（双滑块）
   * @default false
   */
  range?: boolean
  /**
   * 是否垂直模式
   * @default false
   */
  vertical?: boolean
  /**
   * 是否显示提示框
   * @default true
   */
  showTooltip?: boolean
  /**
   * 尺寸
   * @default 'md'
   */
  size?: SliderSize
  /**
   * 颜色
   * @default 'primary'
   */
  color?: SliderColor
  /**
   * 高度（垂直模式时使用）
   */
  height?: string
  /**
   * 刻度标记
   */
  marks?: SliderMark[]
  /**
   * 格式化提示文本
   */
  formatTooltip?: (_value: number) => string
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * QySlider 组件 Emits
 */
export interface QySliderEmits {
  /**
   * 值变化时触发
   */
  'update:modelValue': [value: SliderValue]
  /**
   * 拖拽结束时触发
   */
  change: [value: SliderValue]
}
