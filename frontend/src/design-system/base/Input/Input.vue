<script setup lang="ts">
/**
 * Input 组件
 *
 * Apple 风格的输入框组件，支持密码切换、前缀/后缀插槽
 */

import { computed, ref, useSlots } from 'vue'
import { cn } from '../../utils/cn'
import type { InputProps } from './types'

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  clearable: false,
  showPassword: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const passwordVisible = ref(false)

const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

const baseClasses = `
  qy-input-surface w-full rounded-xl border
  font-medium
  transition-all duration-200
  focus:outline-none
  disabled:opacity-50 disabled:cursor-not-allowed
`

const actualType = computed(() => {
  if (props.type === 'password' && props.showPassword && passwordVisible.value) {
    return 'text'
  }
  return props.type
})

const hasPrefix = computed(() => Boolean(useSlots().prefix))
const hasSuffix = computed(() => Boolean(useSlots().suffix) || (props.type === 'password' && props.showPassword))

const classes = computed(() =>
  cn(
    baseClasses.trim(),
    sizeClasses[props.size || 'md'],
    hasPrefix.value ? 'pl-9' : '',
    hasSuffix.value ? 'pr-9' : '',
    props.class
  )
)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleFocus = (e: FocusEvent) => {
  isFocused.value = true
  emit('focus', e)
}

const handleBlur = (e: FocusEvent) => {
  isFocused.value = false
  emit('blur', e)
}

const clear = () => {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}

const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value
}

const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="relative inline-flex items-center w-full">
    <!-- Prefix slot -->
    <div v-if="$slots.prefix" class="qy-input-affix absolute left-3 top-1/2 -translate-y-1/2">
      <slot name="prefix" />
    </div>

    <input
      ref="inputRef"
      :type="actualType"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :class="classes"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- Password toggle -->
    <button
      v-if="type === 'password' && showPassword"
      type="button"
      class="qy-input-action absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors"
      aria-label="切换密码可见性"
      @click="togglePassword"
    >
      <svg v-if="passwordVisible" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Clear button -->
    <button
      v-else-if="clearable && modelValue"
      type="button"
      class="qy-input-action absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors"
      aria-label="清空"
      @click="clear"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Suffix slot -->
    <div v-if="$slots.suffix && !showPassword" class="qy-input-affix absolute right-3 top-1/2 -translate-y-1/2">
      <slot name="suffix" />
    </div>
  </div>
</template>

<style scoped>
.qy-input-surface {
  border-color: color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.42)) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(15, 23, 42, 0.88)) 94%, transparent);
  color: var(--editor-text-primary, rgba(241, 245, 249, 0.96));
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.08)) 56%, transparent),
    0 10px 24px -20px rgba(15, 23, 42, 0.55);
}

.qy-input-surface::placeholder {
  color: var(--editor-text-tertiary, rgba(148, 163, 184, 0.78));
}

.qy-input-surface:focus {
  border-color: color-mix(in srgb, var(--editor-accent, rgba(96, 165, 250, 0.72)) 72%, transparent);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.12)) 62%, transparent),
    0 0 0 3px color-mix(in srgb, var(--editor-accent, rgba(96, 165, 250, 0.24)) 26%, transparent);
}

.qy-input-surface:disabled {
  background: color-mix(in srgb, var(--editor-layer-soft, rgba(15, 23, 42, 0.68)) 92%, transparent);
  color: var(--editor-text-tertiary, rgba(148, 163, 184, 0.7));
  box-shadow: none;
}

.qy-input-surface[readonly] {
  background: color-mix(in srgb, var(--editor-layer-soft, rgba(15, 23, 42, 0.72)) 88%, transparent);
}

.qy-input-affix,
.qy-input-action {
  color: var(--editor-text-tertiary, rgba(148, 163, 184, 0.8));
}

.qy-input-action:hover {
  background: color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.08)) 82%, transparent);
}
</style>
