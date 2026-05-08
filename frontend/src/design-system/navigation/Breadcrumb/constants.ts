/**
 * Breadcrumb 组件常量定义
 */

import { type InjectionKey } from 'vue'
import type { BreadcrumbContext } from './types'

// Breadcrumb 上下文 Key
export const BREADCRUMB_KEY: InjectionKey<BreadcrumbContext> = Symbol('breadcrumb')
