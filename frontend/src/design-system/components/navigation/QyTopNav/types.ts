/**
 * QyTopNav component type definitions
 */

export interface QyTopNavLink {
  /**
   * Link label text
   */
  label: string

  /**
   * Link path/route
   */
  path: string

  /**
   * Active state
   * @default false
   */
  active?: boolean
}

export interface QyTopNavUserMenuItem {
  /**
   * Menu item label
   */
  label: string

  /**
   * Action identifier
   */
  action: string

  /**
   * Icon (optional)
   */
  icon?: string
}

export interface QyTopNavProps {
  /**
   * Logo text or image URL
   */
  logo?: string

  /**
   * Navigation links
   */
  links?: QyTopNavLink[]

  /**
   * User menu items (PC only)
   */
  userMenu?: QyTopNavUserMenuItem[]

  /**
   * Avatar URL
   */
  avatarUrl?: string

  /**
   * Fixed position
   * @default true
   */
  fixed?: boolean
}

export interface QyTopNavEmits {
  /**
   * Emitted when a link is clicked
   */
  (e: 'link-click', link: QyTopNavLink): void

  /**
   * Emitted when user menu item is clicked
   */
  (e: 'user-menu-click', item: QyTopNavUserMenuItem): void

  /**
   * Emitted when avatar is clicked
   */
  (e: 'avatar-click'): void
}
