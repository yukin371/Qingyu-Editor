/**
 * List 组件类型定义
 */

// List Props 接口
export interface ListProps {
  /**
   * 列表数据
   */
  data?: any[]

  /**
   * 是否显示边框
   * @default false
   */
  border?: boolean

  /**
   * 是否显示分割线
   * @default true
   */
  split?: boolean

  /**
   * 加载状态
   * @default false
   */
  loading?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// ListItem Props 接口
export interface ListItemProps {
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// List 组件默认属性
export const listDefaults: Partial<ListProps> = {
  data: [],
  border: false,
  split: true,
  loading: false,
}

// ListItem 组件默认属性
export const listItemDefaults: Partial<ListItemProps> = {
  disabled: false,
}
