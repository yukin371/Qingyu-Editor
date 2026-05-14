<template>
  <QyModal
    :visible="visible"
    :title="title"
    :width="width"
    :closable="closable"
    :mask-closable="maskClosable"
    @update:visible="$emit('update:visible', $event)"
    @close="handleClose"
    @open="handleOpen"
  >
    <!-- 表单内容 -->
    <form class="qy-form-modal__body" @submit.prevent="handleSubmit">
      <div
        v-for="field in fields"
        :key="field.key"
        class="qy-form-modal__field"
      >
        <label :for="field.key" class="qy-form-modal__label">
          {{ field.label }}
          <span v-if="field.required" class="qy-form-modal__required">*</span>
        </label>

        <!-- 文本输入 -->
        <input
          v-if="field.type === 'text' || field.type === 'number'"
          :id="field.key"
          v-model="formData[field.key]"
          :type="field.type"
          :placeholder="field.placeholder"
          class="qy-form-modal__input"
          :required="field.required"
        />

        <!-- 文本域 -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="field.key"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          class="qy-form-modal__textarea"
          :rows="field.rows || 3"
          :required="field.required"
        />

        <!-- 下拉选择 -->
        <select
          v-else-if="field.type === 'select'"
          :id="field.key"
          v-model="formData[field.key]"
          class="qy-form-modal__select"
          :required="field.required"
        >
          <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </form>

    <!-- 底部按钮 -->
    <template #footer>
      <QyButton variant="ghost" @click="handleCancel">
        {{ cancelText }}
      </QyButton>
      <QyButton variant="primary" :loading="loading" @click="handleSubmit">
        {{ confirmText }}
      </QyButton>
    </template>
  </QyModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import QyModal from '../QyModal/QyModal.vue'
import QyButton from '../../basic/QyButton/QyButton.vue'

// =======================
// 类型定义
// =======================
export interface FormFieldOption {
  label: string
  value: string | number
}

export interface FormField {
  key: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  options?: FormFieldOption[]
  rows?: number
  defaultValue?: unknown
}

export interface QyFormModalProps {
  visible: boolean
  title: string
  fields: FormField[]
  width?: string
  closable?: boolean
  maskClosable?: boolean
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

// =======================
// Props
// =======================
const props = withDefaults(defineProps<QyFormModalProps>(), {
  width: '440px',
  closable: true,
  maskClosable: true,
  confirmText: '确认',
  cancelText: '取消',
  loading: false,
})

// =======================
// Emits
// =======================
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: Record<string, unknown>): void
  (e: 'cancel'): void
  (e: 'close'): void
}>()

// =======================
// 响应式数据
// =======================
const formData = ref<Record<string, string | number>>({})

// =======================
// 初始化表单数据
// =======================
const initFormData = () => {
  const data: Record<string, string | number> = {}
  for (const field of props.fields) {
    data[field.key] = (field.defaultValue as string | number) ?? ''
  }
  formData.value = data
}

// =======================
// 事件处理
// =======================
const handleSubmit = () => {
  // 验证必填字段
  for (const field of props.fields) {
    if (field.required && !formData.value[field.key]) {
      return
    }
  }
  emit('submit', { ...formData.value } as Record<string, unknown>)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleClose = () => {
  emit('close')
}

const handleOpen = () => {
  initFormData()
}

// =======================
// 监听 visible 变化
// =======================
watch(
  () => props.visible,
  (val) => {
    if (val) {
      initFormData()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.qy-form-modal__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qy-form-modal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.qy-form-modal__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--editor-text-secondary, rgba(226, 232, 240, 0.88));
}

.qy-form-modal__required {
  color: #ef4444;
  margin-left: 2px;
}

.qy-form-modal__input,
.qy-form-modal__textarea,
.qy-form-modal__select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.42)) 72%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(15, 23, 42, 0.88)) 94%, transparent);
  color: var(--editor-text-primary, rgba(241, 245, 249, 0.96));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.08)) 56%, transparent);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: color-mix(in srgb, var(--editor-accent, rgba(96, 165, 250, 0.72)) 72%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--editor-accent, rgba(96, 165, 250, 0.24)) 26%, transparent);
  }

  &::placeholder {
    color: var(--editor-text-tertiary, rgba(148, 163, 184, 0.78));
  }
}

.qy-form-modal__textarea {
  resize: vertical;
  min-height: 80px;
}

.qy-form-modal__select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 36px;
}
</style>
