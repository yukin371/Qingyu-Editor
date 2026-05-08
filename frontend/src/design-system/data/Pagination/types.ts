/**
 * Pagination 组件类型定义
 */

// 分页布局组件类型
export type PaginationLayout =
  | 'prev'
  | 'pager'
  | 'next'
  | 'jumper'
  | 'sizes'
  | 'total'

// 分页器每页数量选项类型
export type PaginationPageSize = number

// Pagination Props 接口
export interface PaginationProps {
  /**
   * 当前页数
   * @default 1
   */
  currentPage?: number

  /**
   * 每页显示条目个数
   * @default 10
   */
  pageSize?: number

  /**
   * 总条目数
   * @default 0
   */
  total?: number

  /**
   * 每页显示个数选择器的选项设置
   * @default [10, 20, 30, 40, 50]
   */
  pageSizes?: PaginationPageSize[]

  /**
   * 组件布局，子组件名用逗号分隔
   * @default 'prev, pager, next'
   */
  layout?: string

  /**
   * 是否为分页按钮添加背景色
   * @default false
   */
  background?: boolean

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 只有一页时是否隐藏
   * @default false
   */
  hideOnSinglePage?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Pagination Events 接口
export interface PaginationEmits {
  /**
   * 当前页改变时触发
   * @param currentPage - 新的当前页
   */
  'update:currentPage': [currentPage: number]

  /**
   * 每页数量改变时触发
   * @param pageSize - 新的每页数量
   */
  'update:pageSize': [pageSize: number]

  /**
   * pageSize 改变时触发
   * @param pageSize - 新的每页数量
   */
  sizeChange: [pageSize: number]

  /**
   * currentPage 改变时触发
   * @param currentPage - 新的当前页
   */
  currentChange: [currentPage: number]
}

// Pagination 组件默认属性
export const paginationDefaults: Partial<PaginationProps> = {
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: [10, 20, 30, 40, 50],
  layout: 'prev, pager, next',
  background: false,
  disabled: false,
  hideOnSinglePage: false,
}

// 分页项类型
export interface PagerItem {
  type: 'page' | 'more-left' | 'more-right'
  value: number
}
