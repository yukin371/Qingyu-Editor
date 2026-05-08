/**
 * Tabs 组件类型定义
 */

// Tabs Props 接口
export interface TabsProps {
  /**
   * v-model 绑定值（当前激活的标签）
   */
  modelValue?: string | number

  /**
   * 标签页类型
   * @default 'line'
   */
  type?: 'line' | 'card' | 'border-card'

  /**
   * 标签页位置
   * @default 'top'
   */
  tabPosition?: 'top' | 'right' | 'bottom' | 'left'

  /**
   * 标签宽度是否自适应
   * @default false
   */
  stretch?: boolean

  /**
   * 标签是否可关闭
   * @default false
   */
  closable?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// TabPane Props 接口
export interface TabPaneProps {
  /**
   * 标签标题
   */
  label?: string

  /**
   * 标签标题别名
   */
  title?: string

  /**
   * 标签标识符
   */
  name?: string | number

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否可关闭
   * @default false
   */
  closable?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Tabs 组件默认属性
export const tabsDefaults: Partial<TabsProps> = {
  modelValue: '',
  type: 'line',
  tabPosition: 'top',
  stretch: false,
  closable: false,
}

// TabPane 组件默认属性
export const tabPaneDefaults: Partial<TabPaneProps> = {
  label: '',
  title: '',
  name: undefined,
  disabled: false,
  closable: undefined,
}

// Tabs 事件类型
export interface TabsEmits {
  'update:modelValue': [value: string | number]
  tabClick: [pane: TabPaneInstance, event: MouseEvent]
  tabChange: [name: string | number]
  tabRemove: [name: string | number, event: MouseEvent]
}

// TabPane 实例类型
export interface TabPaneInstance {
  uid: number
  props: TabPaneProps
  paneName: string | number
  active: boolean
  isClosable: boolean
}

// Tabs 上下文类型
import type { Ref } from 'vue'

export interface TabsContext {
  props: TabsProps
  currentName: Ref<string | number>
  panes: Ref<TabPaneInstance[]>
  addPane: (pane: TabPaneInstance) => void
  removePane: (pane: TabPaneInstance) => void
  handleTabClick: (pane: TabPaneInstance, event: MouseEvent) => void
  handleTabRemove: (pane: TabPaneInstance, event: MouseEvent) => void
}
