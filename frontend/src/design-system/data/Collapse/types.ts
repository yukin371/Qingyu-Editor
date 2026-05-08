/**
 * Collapse 组件类型定义
 */

// Collapse Props 接口
export interface CollapseProps {
  /**
   * v-model 绑定值（激活的面板）
   */
  modelValue?: (string | number)[]

  /**
   * 手风琴模式（只能展开一个）
   * @default false
   */
  accordion?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// CollapseItem Props 接口
export interface CollapseItemProps {
  /**
   * 面板标识
   */
  name?: string | number

  /**
   * 标题
   */
  title?: string

  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Collapse 组件默认属性
export const collapseDefaults = {
  modelValue: (): (string | number)[] => [],
  accordion: false,
} as const

// CollapseItem 组件默认属性
export const collapseItemDefaults: Partial<CollapseItemProps> = {
  name: undefined,
  title: undefined,
  disabled: false,
}

// Collapse 事件类型
export interface CollapseEmits {
  'update:modelValue': [value: (string | number)[]]
  'change': [activeNames: (string | number)[]]
}
