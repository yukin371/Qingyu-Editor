/**
 * Qingyu Design System - Icon Mapper
 *
 * Maps legacy icon names to SVG icon strings
 * Provides case-insensitive icon lookup and type-safe access
 */

import { getIcon, hasIcon } from '../assets/icons'

/**
 * Get icon SVG with case-insensitive lookup
 * Maps legacy icon names to SVG icons
 *
 * @param name - Icon name (case-insensitive)
 * @returns SVG string or undefined if not found
 *
 * @example
 * ```ts
 * import { getIconSVG } from '@/design-system/utils/icon-mapper'
 *
 * const searchIcon = getIconSVG('Search') // Works
 * const searchIcon2 = getIconSVG('search') // Also works
 * const searchIcon3 = getIconSVG('SEARCH') // Also works
 * ```
 */
export function getIconSVG(name: string): string | undefined {
  const mappedName = iconMapping[name] || name

  // Try exact match first
  if (hasIcon(mappedName)) {
    return getIcon(mappedName)
  }

  // Try with first letter capitalized
  const capitalized = mappedName.charAt(0).toUpperCase() + mappedName.slice(1)
  if (hasIcon(capitalized)) {
    return getIcon(capitalized)
  }

  // Try all uppercase
  const uppercased = mappedName.toUpperCase()
  if (hasIcon(uppercased)) {
    return getIcon(uppercased)
  }

  // Try all lowercase
  const lowercased = mappedName.toLowerCase()
  if (hasIcon(lowercased)) {
    return getIcon(lowercased)
  }

  for (const [canonicalName, aliases] of Object.entries(iconAliases)) {
    if (canonicalName === mappedName || aliases.includes(mappedName)) {
      if (hasIcon(canonicalName)) {
        return getIcon(canonicalName)
      }
    }
  }

  // Not found
  return undefined
}

/**
 * Check if icon exists (case-insensitive)
 *
 * @param name - Icon name
 * @returns true if icon exists
 */
export function iconExists(name: string): boolean {
  return getIconSVG(name) !== undefined
}

/**
 * Icon name mapping from legacy names to our icons
 * Add any custom mappings here if icon names differ
 */
export const iconMapping: Record<string, string> = {
  RefreshLeft: 'Refresh',
  DocumentChecked: 'CircleCheck',
  SetUp: 'Setting',
  List: 'Menu',
  ChatBubbleLeftRight: 'ChatLineSquare',
  Pencil: 'EditPen',
  DocumentText: 'Document',
  Promotion: 'ArrowRight',
}

/**
 * Get icon SVG with custom mapping
 *
 * @param name - Icon name (can use custom mapping)
 * @returns SVG string or undefined if not found
 */
export function getMappedIconSVG(name: string): string | undefined {
  return getIconSVG(name)
}

/**
 * Common icon name aliases
 * Provides alternative names for commonly used icons
 */
export const iconAliases: Record<string, string[]> = {
  // Navigation
  ArrowRight: ['Right', 'Next', 'Forward'],
  ArrowLeft: ['Left', 'Back', 'Previous'],
  ArrowUp: ['Up', 'Top'],
  ArrowDown: ['Down', 'Bottom'],

  // Actions
  Plus: ['Add', 'Create', 'New'],
  Close: ['X', 'Cancel', 'Dismiss'],
  Delete: ['Remove', 'Trash'],
  Edit: ['Modify', 'Change', 'Update'],
  Search: ['Find', 'Magnify'],
  Check: ['Done', 'Success', 'Tick'],
  Refresh: ['Reload', 'Sync', 'Rotate'],

  // Files
  Document: ['File', 'Page'],
  Folder: ['Directory'],

  // Communication
  ChatDotRound: ['Chat', 'Message', 'Comment'],
  ChatLineSquare: ['CommentSquare', 'Discussion'],

  // User
  User: ['Person', 'Profile', 'Account'],

  // Status
  Warning: ['Alert', 'Caution'],
  Star: ['Favorite', 'Like'],
  StarFilled: ['FavoriteFilled', 'LikeFilled'],
}

/**
 * Get icon SVG with alias support
 *
 * @param name - Icon name or alias
 * @returns SVG string or undefined if not found
 */
export function getIconWithAlias(name: string): string | undefined {
  // Try direct lookup first
  const icon = getIconSVG(name)
  if (icon) return icon

  // Try aliases
  for (const [canonicalName, aliases] of Object.entries(iconAliases)) {
    if (aliases.includes(name)) {
      return getIcon(canonicalName)
    }
  }

  return undefined
}
