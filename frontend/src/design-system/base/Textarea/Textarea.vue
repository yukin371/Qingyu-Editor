<script setup lang="ts">
/**
 * Textarea 组件
 *
 * 多行文本输入组件，支持字数统计、状态样式和自适应高度
 */

import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { cn } from '../../utils/cn'
import type { TextareaProps } from './types'

const props = withDefaults(defineProps<TextareaProps>(), {
  rows: 3,
  rowsMin: 1,
  showCount: false,
  resize: 'none',
  disabled: false,
  readonly: false,
  error: false,
  state: 'default',
  autofocus: false,
  required: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  change: [event: Event]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isFocused = ref(false)

const internalValue = computed(() => props.modelValue || '')

const computedState = computed(() => {
  if (props.error) return 'error'
  return props.state
})

const sizeClasses = {
  sm: {
    frame: 'rounded-[20px] px-3 py-2.5',
    textarea: 'text-sm leading-5',
    footer: 'mt-2 pt-2',
    counter: 'text-[11px]',
  },
  md: {
    frame: 'rounded-[24px] px-4 py-3',
    textarea: 'text-[15px] leading-6',
    footer: 'mt-2.5 pt-2.5',
    counter: 'text-xs',
  },
  lg: {
    frame: 'rounded-[28px] px-5 py-4',
    textarea: 'text-base leading-7',
    footer: 'mt-3 pt-3',
    counter: 'text-sm',
  },
} as const

const toneClasses = {
  default: 'qy-textarea-frame--default',
  error: 'qy-textarea-frame--error',
  success: 'qy-textarea-frame--success',
  warning: 'qy-textarea-frame--warning',
} as const

const focusClasses = {
  default: 'qy-textarea-frame--focus-default',
  error: 'qy-textarea-frame--focus-error',
  success: 'qy-textarea-frame--focus-success',
  warning: 'qy-textarea-frame--focus-warning',
} as const

const resizeClasses = {
  none: 'resize-none',
  both: 'resize',
  horizontal: 'resize-x',
  vertical: 'resize-y',
} as const

const effectiveRows = computed(() => Math.max(props.rows, props.rowsMin))

const currentLength = computed(() => internalValue.value.length)
const shouldShowCount = computed(() => props.showCount && props.maxlength !== undefined)
const remainingChars = computed(() => {
  if (props.maxlength === undefined) return 0
  return props.maxlength - currentLength.value
})

const frameClasses = computed(() => {
  const state = computedState.value

  return cn(
    'qy-textarea-frame relative w-full overflow-hidden border backdrop-blur-sm transition-all duration-200 ease-out',
    sizeClasses[props.size].frame,
    toneClasses[state],
    isFocused.value ? focusClasses[state] : '',
    props.disabled ? 'qy-textarea-frame--disabled cursor-not-allowed opacity-65 shadow-none' : '',
    props.readonly ? 'qy-textarea-frame--readonly' : '',
  )
})

const textareaClasses = computed(() => {
  return cn(
    'qy-textarea-control block w-full border-0 bg-transparent p-0 outline-none focus:outline-none',
    'scrollbar-thin scrollbar-thumb-slate-300/80 scrollbar-track-transparent',
    sizeClasses[props.size].textarea,
    resizeClasses[props.resize],
    props.disabled ? 'cursor-not-allowed' : '',
    props.readonly ? 'cursor-default' : '',
    props.class,
  )
})

const footerClasses = computed(() => {
  return cn(
    'qy-textarea-footer flex items-center justify-end border-t',
    sizeClasses[props.size].footer,
  )
})

const countClasses = computed(() => {
  const nearLimit = props.maxlength !== undefined && remainingChars.value <= props.maxlength * 0.12

  return cn(
    'qy-textarea-count inline-flex items-center rounded-full px-2.5 py-1 font-medium transition-colors duration-200',
    sizeClasses[props.size].counter,
    remainingChars.value < 0
      ? 'qy-textarea-count--over'
      : nearLimit
        ? 'qy-textarea-count--near'
        : 'qy-textarea-count--default',
  )
})

const syncTextareaHeight = () => {
  const textarea = textareaRef.value
  if (!textarea) return

  const lineHeightMap = { sm: 20, md: 24, lg: 28 }
  const lineHeight = lineHeightMap[props.size]
  const minHeight = effectiveRows.value * lineHeight
  const maxHeight = props.rowsMax
    ? Math.max(props.rowsMax, effectiveRows.value) * lineHeight
    : Number.POSITIVE_INFINITY

  textarea.style.height = 'auto'
  const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
  textarea.style.height = `${nextHeight}px`
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input', event)
  nextTick(syncTextareaHeight)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

watch(
  () => [props.modelValue, props.rows, props.rowsMin, props.rowsMax, props.size] as const,
  () => {
    nextTick(syncTextareaHeight)
  },
)

onMounted(() => {
  nextTick(syncTextareaHeight)
})

defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
})
</script>

<template>
  <div class="w-full">
    <div :class="frameClasses">
      <textarea
        :id="id"
        ref="textareaRef"
        :value="internalValue"
        :name="name"
        :rows="effectiveRows"
        :maxlength="maxlength"
        :minlength="minlength"
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

      <div v-if="shouldShowCount" :class="footerClasses">
        <span :class="countClasses">
          {{ currentLength }} / {{ maxlength }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qy-textarea-frame {
  border-color: color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.4)) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(15, 23, 42, 0.88)) 94%, transparent);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.08)) 58%, transparent),
    0 20px 30px -28px rgba(15, 23, 42, 0.5);
}

.qy-textarea-frame--default {
  border-color: color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.4)) 72%, transparent);
}

.qy-textarea-frame--error {
  border-color: color-mix(in srgb, rgba(244, 114, 182, 0.46) 78%, transparent);
}

.qy-textarea-frame--success {
  border-color: color-mix(in srgb, rgba(16, 185, 129, 0.42) 78%, transparent);
}

.qy-textarea-frame--warning {
  border-color: color-mix(in srgb, rgba(245, 158, 11, 0.44) 78%, transparent);
}

.qy-textarea-frame--focus-default {
  border-color: color-mix(in srgb, var(--editor-accent, rgba(96, 165, 250, 0.72)) 72%, transparent);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.12)) 62%, transparent),
    0 0 0 3px color-mix(in srgb, var(--editor-accent, rgba(96, 165, 250, 0.24)) 26%, transparent);
}

.qy-textarea-frame--focus-error {
  border-color: rgba(251, 113, 133, 0.72);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, rgba(255, 255, 255, 0.12) 62%, transparent),
    0 0 0 3px rgba(251, 113, 133, 0.18);
}

.qy-textarea-frame--focus-success {
  border-color: rgba(52, 211, 153, 0.72);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, rgba(255, 255, 255, 0.12) 62%, transparent),
    0 0 0 3px rgba(52, 211, 153, 0.18);
}

.qy-textarea-frame--focus-warning {
  border-color: rgba(251, 191, 36, 0.72);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, rgba(255, 255, 255, 0.12) 62%, transparent),
    0 0 0 3px rgba(251, 191, 36, 0.18);
}

.qy-textarea-frame--readonly {
  background: color-mix(in srgb, var(--editor-layer-soft, rgba(15, 23, 42, 0.72)) 88%, transparent);
}

.qy-textarea-frame--disabled {
  background: color-mix(in srgb, var(--editor-layer-soft, rgba(15, 23, 42, 0.68)) 92%, transparent);
}

.qy-textarea-control {
  color: var(--editor-text-primary, rgba(241, 245, 249, 0.96));
  caret-color: var(--editor-accent, rgba(96, 165, 250, 0.82));
}

.qy-textarea-control::placeholder {
  color: var(--editor-text-tertiary, rgba(148, 163, 184, 0.78));
}

.qy-textarea-control:disabled {
  color: var(--editor-text-tertiary, rgba(148, 163, 184, 0.7));
}

.qy-textarea-control[readonly] {
  color: var(--editor-text-secondary, rgba(226, 232, 240, 0.88));
}

.qy-textarea-footer {
  border-color: color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.32)) 54%, transparent);
}

.qy-textarea-count--default {
  background: color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.08)) 88%, transparent);
  color: var(--editor-text-tertiary, rgba(148, 163, 184, 0.82));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.32)) 60%, transparent);
}

.qy-textarea-count--near {
  background: rgba(245, 158, 11, 0.16);
  color: rgba(253, 224, 71, 0.96);
}

.qy-textarea-count--over {
  background: rgba(244, 63, 94, 0.16);
  color: rgba(254, 205, 211, 0.96);
}

textarea {
  resize: none !important;
}
textarea:focus,
textarea:focus-visible {
  outline: none !important;
}
</style>
