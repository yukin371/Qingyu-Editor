/**
 * Rate 组件类型定义
 */

// Rate 尺寸
export type RateSize = 'sm' | 'md' | 'lg'

// Rate 值类型
export type RateValue = number

// Rate Props 接口
export interface RateProps {
  /**
   * v-model 绑定值
   * @default 0
   */
  modelValue?: RateValue

  /**
   * 最大分数
   * @default 5
   */
  max?: number

  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 是否允许半星
   * @default false
   */
  allowHalf?: boolean

  /**
   * 只读模式
   * @default false
   */
  readonly?: boolean

  /**
   * Rate 尺寸
   * @default 'md'
   */
  size?: RateSize

  /**
   * 选中颜色（Tailwind 类名）
   * @default 'amber-400'
   */
  color?: string

  /**
   * 未选中颜色（Tailwind 类名）
   * @default 'slate-300 dark:slate-600'
   */
  voidColor?: string

  /**
   * 显示分数
   * @default false
   */
  showScore?: boolean

  /**
   * 分数对应的文字
   */
  texts?: string[]

  /**
   * 自定义类名
   */
  class?: any
}

// Rate Emits 接口
export interface RateEmits {
  /**
   * 值更新事件
   */
  'update:modelValue': [value: RateValue]

  /**
   * 分数改变事件
   */
  change: [value: RateValue]
}

// Rate 组件默认属性
export const rateDefaults: Partial<RateProps> = {
  modelValue: 0,
  max: 5,
  disabled: false,
  allowHalf: false,
  readonly: false,
  size: 'md',
  color: 'amber-400',
  voidColor: 'slate-300 dark:slate-600',
  showScore: false,
}
