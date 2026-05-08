/**
 * QyTabBar component type definitions
 */

export type QyTabBarPosition = 'bottom' | 'top'

export interface QyTabBarTab {
  /**
   * Unique key for the tab
   */
  key: string

  /**
   * Tab label
   */
  label: string

  /**
   * Icon (optional)
   */
  icon?: string

  /**
   * Badge number
   */
  badge?: number

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean
}

export interface QyTabBarProps {
  /**
   * Tabs array
   */
  tabs: QyTabBarTab[]

  /**
   * Active tab key (v-model)
   */
  modelValue: string

  /**
   * Position
   * @default 'bottom'
   */
  position?: QyTabBarPosition

  /**
   * Show icons
   * @default true
   */
  showIcons?: boolean

  /**
   * Show labels
   * @default true
   */
  showLabels?: boolean
}

export interface QyTabBarEmits {
  /**
   * Update active tab (v-model)
   */
  (e: 'update:modelValue', value: string): void

  /**
   * Emitted when tab is clicked
   */
  (e: 'tab-click', tab: QyTabBarTab, index: number): void

  /**
   * Emitted when tab is changed
   */
  (e: 'tab-change', tab: QyTabBarTab, index: number): void
}
