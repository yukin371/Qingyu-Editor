/**
 * QySwitch 类型定义
 */

/**
 * 开关颜色类型
 */
export type SwitchColor = 'primary' | 'success' | 'warning' | 'danger'

/**
 * 开关尺寸类型
 */
export type SwitchSize = 'sm' | 'md' | 'lg'

/**
 * 文本位置类型
 */
export type TextPosition = 'left' | 'right' | 'inside'

/**
 * QySwitch 组件 Props
 */
export interface QySwitchProps {
  /**
   * v-model 绑定值
   * @default false
   */
  modelValue: boolean | string | number
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean
  /**
   * 尺寸
   * @default 'md'
   */
  size?: SwitchSize
  /**
   * 颜色
   * @default 'primary'
   */
  color?: SwitchColor
  /**
   * 激活值
   * @default true
   */
  activeValue?: boolean | string | number
  /**
   * 非激活值
   * @default false
   */
  inactiveValue?: boolean | string | number
  /**
   * 激活时文本
   */
  activeText?: string
  /**
   * 非激活时文本
   */
  inactiveText?: string
  /**
   * 激活文本位置
   * @default 'right'
   */
  activeTextPosition?: TextPosition
  /**
   * 非激活文本位置
   * @default 'left'
   */
  inactiveTextPosition?: TextPosition
  /**
   * 激活图标（SVG内容）
   */
  activeIcon?: string
  /**
   * 非激活图标（SVG内容）
   */
  inactiveIcon?: string
  /**
   * 变化前的回调函数
   * 返回 false 可以阻止变化
   */
  beforeChange?: (_value: boolean | string | number) => boolean | Promise<boolean>
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * QySwitch 组件 Emits
 */
export interface QySwitchEmits {
  /**
   * 值变化时触发
   */
  'update:modelValue': [value: boolean | string | number]
  /**
   * 状态变化时触发
   */
  change: [value: boolean | string | number]
}
