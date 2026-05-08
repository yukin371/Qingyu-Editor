/**
 * QyLoading Component
 *
 * A Qingyu-style loading spinner component with smooth rotation animation.
 *
 * @features
 * - Cyan-colored spinner (using border-cyan-600)
 * - Smooth rotation animation
 * - Optional loading text below spinner
 * - Fullscreen mode with backdrop
 * - Multiple sizes (sm, md, lg)
 * - Multiple colors (cyan, blue, white)
 *
 * @example
 * ```vue
 * <template>
 *   <!-- Basic loading -->
 *   <QyLoading />
 *
 *   <!-- With text -->
 *   <QyLoading text="Loading..." />
 *
 *   <!-- Large size with custom color -->
 *   <QyLoading size="lg" color="blue" text="Please wait..." />
 *
 *   <!-- Fullscreen -->
 *   <QyLoading
 *     fullscreen
 *     text="Loading data..."
 *     @close="handleClose"
 *   />
 * </template>
 * ```
 *
 * @props
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - color: 'cyan' | 'blue' | 'white' (default: 'cyan')
 * - text: string (loading text)
 * - fullscreen: boolean (default: false)
 */

export { default } from './QyLoading.vue'
