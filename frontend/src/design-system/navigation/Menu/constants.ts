/**
 * Menu 组件常量和类型导出
 *
 * 用于在子组件中注入 Menu 上下文
 */

import { type InjectionKey, type Ref } from 'vue'
import type { MenuMode } from './types'

/**
 * Menu 上下文类型
 */
export interface MenuContext {
  activeIndex: Ref<string>
  openedMenus: Ref<string[]>
  mode: Ref<MenuMode>
  collapse: Ref<boolean>
  uniqueOpened: Ref<boolean>
  handleSelect: (index: string) => void
  handleOpen: (index: string) => void
  handleClose: (index: string) => void
}

/**
 * Menu 上下文注入键
 */
export const MENU_KEY: InjectionKey<MenuContext> = Symbol('Menu')
