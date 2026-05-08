/**
 * Qingyu Design System - Icon Mapper
 *
 * Maps Element Plus icon names to SVG icon strings
 * Provides case-insensitive icon lookup and type-safe access
 */

import { getIcon, hasIcon } from '../assets/icons'

/**
 * Get icon SVG with case-insensitive lookup
 * Maps Element Plus icon names to SVG icons
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
  // Try exact match first
  if (hasIcon(name)) {
    return getIcon(name)
  }

  // Try with first letter capitalized
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1)
  if (hasIcon(capitalized)) {
    return getIcon(capitalized)
  }

  // Try all uppercase
  const uppercased = name.toUpperCase()
  if (hasIcon(uppercased)) {
    return getIcon(uppercased)
  }

  // Try all lowercase
  const lowercased = name.toLowerCase()
  if (hasIcon(lowercased)) {
    return getIcon(lowercased)
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
 * Icon name mapping from Element Plus to our icons
 * Add any custom mappings here if icon names differ
 */
export const iconMapping: Record<string, string> = {
  // Element Plus -> Our icons
  // Add custom mappings if needed
  // Example: 'ep-search': 'Search'
}

/**
 * Get icon SVG with custom mapping
 *
 * @param name - Icon name (can use custom mapping)
 * @returns SVG string or undefined if not found
 */
export function getMappedIconSVG(name: string): string | undefined {
  // Check if there's a custom mapping
  const mappedName = iconMapping[name] || name
  return getIconSVG(mappedName)
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
