/**
 * Qingyu Design System - QyIcon Component
 *
 * A flexible icon component for rendering SVG icons with full customization.
 *
 * @example
 * ```vue
 * <script setup>
 * import { QyIcon } from '@/design-system/components'
 * </script>
 *
 * <template>
 *   <QyIcon name="Search" :size="16" />
 *   <QyIcon name="Star" color="yellow" :size="24" />
 *   <QyIcon name="Check" color="green" />
 * </template>
 * ```
 */

export { default } from './QyIcon.vue'
export { default as QyIcon } from './QyIcon.vue'
export type { QyIconProps, IconName, IconSize, IconColor, IconVariant } from './types'
