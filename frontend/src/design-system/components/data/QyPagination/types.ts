/**
 * QyPagination 组件类型定义
 */

import type { HTMLAttributes } from 'vue'

/**
 * 每页数量选项
 */
export type PageSizeOption = {
  label: string
  value: number
}

/**
 * QyPagination 组件 Props
 */
export interface QyPaginationProps extends /* @vue-ignore */ HTMLAttributes {
  /**
   * 当前页码
   */
  modelValue?: number

  /**
   * 总条目数
   */
  total?: number

  /**
   * 每页显示条目数
   * @default 10
   */
  pageSize?: number

  /**
   * 每页显示个数选择器的选项配置
   */
  pageSizes?: number[] | PageSizeOption[]

  /**
   * 最大页码按钮数量
   * @default 7
   */
  pageCount?: number

  /**
   * 是否显示背景色
   * @default false
   */
  background?: boolean

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否显示快速跳转
   * @default false
   */
  showQuickJumper?: boolean

  /**
   * 布局顺序
   * @default 'prev, pager, next'
   */
  layout?: string[]

  /**
   * 是否显示总条目数
   * @default false
   */
  showTotal?: boolean

  /**
   * 小型分页器
   * @default false
   */
  small?: boolean
}

/**
 * QyPagination 组件 Emits
 */
export interface QyPaginationEmits {
  (e: 'update:modelValue', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'change', currentPage: number, pageSize: number): void
}
