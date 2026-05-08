/**
 * Switch 组件类型定义
 */

// Switch 尺寸
export type SwitchSize = 'sm' | 'md' | 'lg'

// Switch 颜色
export type SwitchColor = 'primary' | 'success' | 'warning' | 'danger'

// Switch 值类型
export type SwitchValue = boolean

// Switch 切换前回调返回类型
export type BeforeChangeReturn = boolean | Promise<boolean>

// Switch Props 接口
export interface SwitchProps {
  /**
   * v-model 绑定值
   * @default false
   */
  modelValue?: SwitchValue

  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 加载状态
   * @default false
   */
  loading?: boolean

  /**
   * Switch 尺寸
   * @default 'md'
   */
  size?: SwitchSize

  /**
   * Switch 颜色
   * @default 'primary'
   */
  color?: SwitchColor

  /**
   * 标签文本（显示在 Switch 旁边）
   */
  label?: string

  /**
   * 选中时文本（显示在 Switch 内部或旁边）
   */
  activeText?: string

  /**
   * 未选中时文本（显示在 Switch 内部或旁边）
   */
  inactiveText?: string

  /**
   * 选中值
   * @default true
   */
  activeValue?: SwitchValue

  /**
   * 未选中值
   * @default false
   */
  inactiveValue?: SwitchValue

  /**
   * 切换前回调
   * 返回 false 或被拒绝的 Promise 可以阻止切换
   */
  beforeChange?: () => BeforeChangeReturn

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void
}

// Switch Emits 接口
export interface SwitchEmits {
  /**
   * 值更新事件
   */
  'update:modelValue': [value: SwitchValue]

  /**
   * 状态改变事件
   */
  change: [value: SwitchValue]

  /**
   * 点击事件
   */
  click: [event: MouseEvent]
}

// Switch 组件默认属性
export const switchDefaults: Partial<SwitchProps> = {
  modelValue: false,
  disabled: false,
  loading: false,
  size: 'md',
  color: 'primary',
  activeValue: true,
  inactiveValue: false,
}
