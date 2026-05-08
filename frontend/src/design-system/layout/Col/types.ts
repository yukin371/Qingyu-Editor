/**
 * Col 组件类型定义
 */

// Col Props 接口
export interface ColProps {
  /**
   * 列宽度（占 12 列中的几列）
   * @default 12
   */
  span?: number

  /**
   * 左侧偏移列数
   * @default 0
   */
  offset?: number

  /**
   * 排序顺序
   */
  order?: number

  /**
   * 断点 xs 下的 span
   */
  xs?: number

  /**
   * 断点 sm 下的 span
   */
  sm?: number

  /**
   * 断点 md 下的 span
   */
  md?: number

  /**
   * 断点 lg 下的 span
   */
  lg?: number

  /**
   * 断点 xl 下的 span
   */
  xl?: number

  /**
   * 自定义类名
   */
  class?: any
}

// Col 组件默认属性
export const colDefaults: Partial<ColProps> = {
  span: 12,
  offset: 0,
}
