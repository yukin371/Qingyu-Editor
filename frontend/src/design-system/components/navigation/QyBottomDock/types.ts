/**
 * QyBottomDock component type definitions
 */

export type QyBottomDockPosition = 'bottom' | 'floating'

export interface QyBottomDockItem {
  /**
   * Icon SVG string or component
   */
  icon: string

  /**
   * Item label
   */
  label: string

  /**
   * Active state
   * @default false
   */
  active?: boolean

  /**
   * Highlight as main action button (larger, centered)
   * @default false
   */
  highlight?: boolean

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

export interface QyBottomDockProps {
  /**
   * Dock items
   */
  items: QyBottomDockItem[]

  /**
   * Position mode
   * @default 'floating'
   */
  position?: QyBottomDockPosition

  /**
   * Show labels on mobile
   * @default true
   */
  showLabels?: boolean
}

export interface QyBottomDockEmits {
  /**
   * Emitted when an item is clicked
   */
  (e: 'item-click', item: QyBottomDockItem, index: number): void
}
