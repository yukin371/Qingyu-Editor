/**
 * Slider 组件类型定义
 */

// Slider 尺寸
export type SliderSize = 'sm' | 'md' | 'lg'

// Slider 颜色
export type SliderColor = 'primary' | 'success' | 'warning' | 'danger'

// Slider 值类型
export type SliderValue = number | number[]

// Slider 刻度标记类型
export type SliderMarks = Record<number, string>

// Tooltip 格式化函数类型
export type TooltipFormatter = (value: number) => string

// Slider Props 接口
export interface SliderProps {
  /**
   * v-model 绑定值
   * @default 0
   */
  modelValue?: SliderValue

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
   * 禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 双滑块模式
   * @default false
   */
  range?: boolean

  /**
   * 垂直模式
   * @default false
   */
  vertical?: boolean

  /**
   * 垂直模式高度
   * @default '200px'
   */
  height?: string

  /**
   * 显示提示
   * @default true
   */
  showTooltip?: boolean

  /**
   * 格式化提示
   */
  formatTooltip?: TooltipFormatter

  /**
   * 刻度标记
   */
  marks?: SliderMarks

  /**
   * Slider 尺寸
   * @default 'md'
   */
  size?: SliderSize

  /**
   * Slider 颜色
   * @default 'primary'
   */
  color?: SliderColor

  /**
   * 标签文本
   */
  label?: string

  /**
   * 自定义类名
   */
  class?: any
}

// Slider Emits 接口
export interface SliderEmits {
  /**
   * 值更新事件
   */
  'update:modelValue': [value: SliderValue]

  /**
   * 值改变事件
   */
  change: [value: SliderValue]
}

// Slider 组件默认属性
export const sliderDefaults: Partial<SliderProps> = {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  range: false,
  vertical: false,
  height: '200px',
  showTooltip: true,
  size: 'md',
  color: 'primary',
}
