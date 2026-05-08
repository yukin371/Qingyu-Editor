/**
 * Breadcrumb 组件类型定义
 */

import type { ComputedRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

// Breadcrumb 上下文接口
export interface BreadcrumbContext {
  separator: ComputedRef<string>
  separatorClass: ComputedRef<string | undefined>
  itemCount: ComputedRef<number>
  registerItem: (hasChildren: boolean) => string
  unregisterItem: (id: string) => void
}

// Breadcrumb Props 接口
export interface BreadcrumbProps {
  /**
   * 分隔符
   * @default '/'
   */
  separator?: string

  /**
   * 分隔符类名
   */
  separatorClass?: string

  /**
   * 自定义类名
   */
  class?: any
}

// BreadcrumbItem Props 接口
export interface BreadcrumbItemProps {
  /**
   * 路由链接
   */
  to?: RouteLocationRaw

  /**
   * 是否替换而不是推送
   * @default false
   */
  replace?: boolean

  /**
   * 是否可点击
   * @default true
   */
  clickable?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// BreadcrumbSeparator Props 接口
export interface BreadcrumbSeparatorProps {
  /**
   * 自定义类名
   */
  class?: any
}

// BreadcrumbItem Emits 接口
export interface BreadcrumbItemEmits {
  /**
   * 点击事件
   */
  click: [event: MouseEvent]
}

// Breadcrumb 组件默认属性
export const breadcrumbDefaults: Partial<BreadcrumbProps> = {
  separator: '/',
}

// BreadcrumbItem 组件默认属性
export const breadcrumbItemDefaults: Partial<BreadcrumbItemProps> = {
  clickable: true,
  replace: false,
}
