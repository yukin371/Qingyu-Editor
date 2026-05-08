<script setup lang="ts">
/**
 * QyTextarea 多行文本框组件
 *
 * Qingyu 风格的多行文本输入组件，支持字数统计、各种状态和尺寸
 * 与 Element Plus Input[type="textarea"] API 兼容
 */

import { computed, ref } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { textareaVariants } from './variants'
import type { QyTextareaProps, QyTextareaEmits } from './types'

const props = withDefaults(defineProps<QyTextareaProps>(), {
  rows: 3,
  rowsMin: 1,
  showCount: false,
  resize: 'vertical',
  disabled: false,
  readonly: false,
  error: false,
  state: 'default',
  autofocus: false,
  required: false,
  size: 'md',
})

const emit = defineEmits<QyTextareaEmits>()

const internalValue = computed({
  get: () => props.modelValue || '',
  set: (value) => emit('update:modelValue', value),
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const computedState = computed(() => {
  if (props.error) return 'error'
  return props.state
})

const textareaClasses = computed(() => {
  return cn(
    textareaVariants({
      size: props.size,
      resize: props.resize,
      state: computedState.value
    }),
    'qy-textarea',
    props.class
  )
})

const shouldShowCount = computed(() => props.showCount && props.maxlength !== undefined)
const currentLength = computed(() => internalValue.value.length)
const isOverLimit = computed(() => {
  if (!props.maxlength) return false
  return currentLength.value > props.maxlength
})
const remainingCount = computed(() => {
  if (!props.maxlength) return 0
  return props.maxlength - currentLength.value
})

const countColorClass = computed(() => {
  if (isOverLimit.value) return 'text-red-500'
  if (props.maxlength && remainingCount.value <= props.maxlength * 0.1) return 'text-amber-600'
  return 'text-slate-400'
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('input', event)
  emit('update:modelValue', target.value)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
})
</script>

<template>
  <div class="relative w-full">
    <textarea
      ref="textareaRef"
      :id="id"
      :name="name"
      :value="internalValue"
      :rows="rows"
      :minlength="minlength"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :autofocus="autofocus"
      :autocomplete="autocomplete"
      :required="required"
      :class="textareaClasses"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <div
      v-if="shouldShowCount"
      class="absolute bottom-2.5 right-3 text-xs font-medium transition-colors duration-200"
      :class="countColorClass"
    >
      {{ currentLength }}{{ maxlength ? ` / ${maxlength}` : '' }}
    </div>
  </div>
</template>

<style scoped>
.qy-textarea {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.55) transparent;
}

.qy-textarea::-webkit-scrollbar {
  width: 7px;
}

.qy-textarea::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.55);
  border-radius: 9999px;
}
</style>
