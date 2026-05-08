/**
 * QyEmpty Component
 *
 * A Qingyu-style empty state component for displaying no-data states.
 *
 * @features
 * - Large icon or image display
 * - Title and description text
 * - Optional action button
 * - Glassmorphism card container
 * - Flexible slot-based customization
 *
 * @example
 * ```vue
 * <template>
 *   <!-- Basic usage -->
 *   <QyEmpty
 *     title="No books found"
 *     description="Try adjusting your search or filters"
 *     action-text="Browse Books"
 *     @action="handleBrowse"
 *   />
 *
 *   <!-- With custom icon -->
 *   <QyEmpty
 *     :icon="bookIcon"
 *     title="Your library is empty"
 *     description="Start by adding some books to your collection"
 *     action-text="Add Books"
 *   />
 *
 *   <!-- With image -->
 *   <QyEmpty
 *     image="/empty-state.png"
 *     title="Nothing here yet"
 *   />
 * </template>
 * ```
 *
 * @slots
 * - icon: Custom icon or image
 * - title: Custom title
 * - description: Custom description
 * - action: Custom action button
 *
 * @events
 * - action: Emitted when action button is clicked
 */

export { default } from './QyEmpty.vue'
