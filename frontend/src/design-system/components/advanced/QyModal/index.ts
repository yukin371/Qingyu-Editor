/**
 * QyModal Component
 *
 * A Qingyu-style modal/dialog component with glassmorphism effects and smooth animations.
 *
 * @features
 * - v-model support for visibility
 * - Backdrop blur overlay
 * - Glassmorphism content
 * - Close button (X) in top-right
 * - ESC key to close
 * - Click outside to close (when maskClosable=true)
 * - Smooth fade-in/scale-up animation
 *
 * @example
 * ```vue
 * <template>
 *   <QyModal
 *     v-model:visible="visible"
 *     title="Modal Title"
 *     :width="'600px'"
 *     :closable="true"
 *     :mask-closable="true"
 *   >
 *     <p>Modal content goes here...</p>
 *     <template #footer>
 *       <QyButton variant="secondary" @click="visible = false">Cancel</QyButton>
 *       <QyButton variant="primary" @click="handleConfirm">Confirm</QyButton>
 *     </template>
 *   </QyModal>
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue'
 *
 * const visible = ref(false)
 *
 * const handleConfirm = () => {
 *   // Handle confirm action
 *   visible = false
 * }
 * </script>
 * ```
 *
 * @slots
 * - default: Main content of the modal
 * - header: Custom header (overrides title prop)
 * - footer: Action buttons area
 *
 * @events
 * - update:visible: Emitted when visibility changes (v-model)
 * - close: Emitted when modal is closed
 * - open: Emitted when modal is opened
 */

export { default } from './QyModal.vue'
