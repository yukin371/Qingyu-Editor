/**
 * Row 组件类型定义
 */

// Row Props 接口
export interface RowProps {
  /**
   * 水平对齐方式
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'

  /**
   * 垂直对齐方式
   * @default 'top'
   */
  align?: 'top' | 'center' | 'bottom' | 'stretch'

  /**
   * Col 之间的间距（像素）
   * @default 0
   */
  gutter?: number

  /**
   * 是否换行
   * @default true
   */
  wrap?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Row 组件默认属性
export const rowDefaults: Partial<RowProps> = {
  justify: 'start',
  align: 'top',
  gutter: 0,
  wrap: true,
}
