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
  default:
    'border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_20px_30px_-28px_rgba(15,23,42,0.4)] hover:border-slate-300/80',
  error:
    'border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,241,242,0.94),rgba(255,255,255,0.97))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_20px_30px_-28px_rgba(225,29,72,0.26)]',
  success:
    'border-emerald-200/90 bg-[linear-gradient(180deg,rgba(236,253,245,0.94),rgba(255,255,255,0.97))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_20px_30px_-28px_rgba(5,150,105,0.24)]',
  warning:
    'border-amber-200/90 bg-[linear-gradient(180deg,rgba(255,251,235,0.95),rgba(255,255,255,0.97))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_20px_30px_-28px_rgba(217,119,6,0.24)]',
} as const

const focusClasses = {
  default:
    'border-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_0_0_3px_rgba(125,211,252,0.24),0_12px_24px_-16px_rgba(56,189,248,0.22)]',
  error:
    'border-rose-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_0_0_3px_rgba(253,164,175,0.24),0_12px_24px_-16px_rgba(244,63,94,0.22)]',
  success:
    'border-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_0_0_3px_rgba(110,231,183,0.24),0_12px_24px_-16px_rgba(16,185,129,0.22)]',
  warning:
    'border-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_0_0_3px_rgba(253,230,138,0.24),0_12px_24px_-16px_rgba(245,158,11,0.22)]',
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
    'relative w-full overflow-hidden border backdrop-blur-sm transition-all duration-200 ease-out',
    sizeClasses[props.size].frame,
    toneClasses[state],
    isFocused.value ? focusClasses[state] : '',
    props.disabled ? 'cursor-not-allowed opacity-65 shadow-none hover:border-slate-200/80' : '',
    props.readonly ? 'bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.94))]' : '',
  )
})

const textareaClasses = computed(() => {
  return cn(
    'block w-full border-0 bg-transparent p-0 text-slate-900 outline-none placeholder:text-slate-400 focus:outline-none',
    'scrollbar-thin scrollbar-thumb-slate-300/80 scrollbar-track-transparent',
    sizeClasses[props.size].textarea,
    resizeClasses[props.resize],
    props.disabled ? 'cursor-not-allowed text-slate-400 placeholder:text-slate-300' : '',
    props.readonly ? 'cursor-default text-slate-600' : '',
    props.class,
  )
})

const footerClasses = computed(() => {
  return cn(
    'flex items-center justify-end border-t border-white/70',
    sizeClasses[props.size].footer,
  )
})

const countClasses = computed(() => {
  const nearLimit = props.maxlength !== undefined && remainingChars.value <= props.maxlength * 0.12

  return cn(
    'inline-flex items-center rounded-full px-2.5 py-1 font-medium transition-colors duration-200',
    sizeClasses[props.size].counter,
    remainingChars.value < 0
      ? 'bg-rose-50 text-rose-600'
      : nearLimit
        ? 'bg-amber-50 text-amber-700'
        : 'bg-white/80 text-slate-500 ring-1 ring-slate-200/80',
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
textarea {
  resize: none !important;
}
textarea:focus,
textarea:focus-visible {
  outline: none !important;
}
</style>
