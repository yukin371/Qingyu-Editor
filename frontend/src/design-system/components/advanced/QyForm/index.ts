/**
 * QyForm Components
 *
 * Qingyu-style form components with validation support.
 *
 * @features
 * - QyForm: Form container with context provider
 * - QyFormItem: Individual form item with label and error display
 * - Form validation support
 * - Error message display (text-red-500)
 * - Label positioning (left, top, right)
 * - Integration with QyInput
 *
 * @example
 * ```vue
 * <template>
 *   <QyForm
 *     v-model="formData"
 *     :rules="rules"
 *     label-width="120px"
 *     label-position="top"
 *   >
 *     <QyFormItem prop="name" label="Name" required>
 *       <QyInput v-model="formData.name" placeholder="Enter your name" />
 *     </QyFormItem>
 *
 *     <QyFormItem prop="email" label="Email" required>
 *       <QyInput v-model="formData.email" type="email" placeholder="Enter your email" />
 *     </QyFormItem>
 *
 *     <QyFormItem prop="bio" label="Bio">
 *       <QyInput v-model="formData.bio" type="textarea" placeholder="Tell us about yourself" />
 *     </QyFormItem>
 *
 *     <QyButton type="submit" variant="primary">Submit</QyButton>
 *   </QyForm>
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import QyForm, { QyFormItem } from '@/design-system/components'
 *
 * const formData = ref({
 *   name: '',
 *   email: '',
 *   bio: ''
 * })
 *
 * const rules = {
 *   name: [
 *     { required: true, message: 'Name is required' },
 *     { min: 2, message: 'Name must be at least 2 characters' }
 *   ],
 *   email: [
 *     { required: true, message: 'Email is required' },
 *     { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
 *   ]
 * }
 * </script>
 * ```
 */

export { default as QyForm } from './QyForm.vue'
export { default as QyFormItem } from './QyFormItem.vue'
