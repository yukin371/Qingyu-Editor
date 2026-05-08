<template>
  <label
    :class="checkboxClasses"
    :aria-disabled="actualDisabled ? 'true' : undefined"
  >
    <!-- 复选框输入 -->
    <input
      ref="inputRef"
      v-model="isChecked"
      type="checkbox"
      :class="inputClasses"
      :value="value"
      :disabled="actualDisabled"
      :indeterminate="indeterminate ? true : undefined"
      @change="handleChange"
    />

    <!-- 复选框图标 -->
    <span
      v-if="isChecked && !indeterminate"
      :class="iconContainerClasses"
      aria-hidden="true"
    >
      <svg :class="iconClasses" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 6L9 17L4 12"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>

    <!-- 半选状态图标 -->
    <span
      v-if="indeterminate"
      :class="iconContainerClasses"
      aria-hidden="true"
    >
      <svg :class="iconClasses" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5 12H19"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      </svg>
    </span>

    <!-- Label -->
    <span v-if="label || $slots.default" :class="labelClasses">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { cn } from '@/design-system/utils/cn'
import type { QyCheckboxProps, QyCheckboxEmits } from './types'
import {
  checkboxVariants,
  checkboxInputVariants,
  iconContainerVariants,
  iconVariants,
  labelVariants
} from './variants'

// Props
const props = withDefaults(defineProps<QyCheckboxProps>(), {
  disabled: false,
  indeterminate: false,
  size: 'md',
  color: 'primary',
  variant: 'default'
})

// Emits
const emit = defineEmits<QyCheckboxEmits>()

// 注入组上下文
import { CHECKBOX_GROUP_KEY, type QyCheckboxGroupContext } from './contextKey'
const groupContext = inject<QyCheckboxGroupContext | undefined>(CHECKBOX_GROUP_KEY, undefined)

// 是否在组中
const isInGroup = computed(() => groupContext !== undefined)

// 实际的 disabled、size 值（优先使用组的设置）
const actualDisabled = computed(() => 
  isInGroup.value ? groupContext!.disabled.value : props.disabled
)
const actualSize = computed(() => 
  isInGroup.value ? groupContext!.size.value : props.size
)

// 内部值（用于处理半选状态）
const indeterminate = ref(props.indeterminate)

// 监听 indeterminate prop 变化
watch(() => props.indeterminate, (newVal) => {
  indeterminate.value = newVal
})

// 计算当前是否选中
const isChecked = computed({
  get() {
    if (isInGroup.value && props.value !== undefined) {
      return groupContext!.modelValue.value.includes(props.value)
    }
    
    // 数组模式
    if (Array.isArray(props.modelValue) && props.value !== undefined) {
      return props.modelValue.includes(props.value)
    }
    
    // 布尔模式
    return Boolean(props.modelValue)
  },
  set() {
    // 只是为了触发 v-model，实际值在 handleChange 中处理
  }
})

// 计算容器类名
const checkboxClasses = computed(() => {
  return cn(
    checkboxVariants({
      size: actualSize.value,
      disabled: actualDisabled.value,
      variant: props.variant
    }),
    {
      // 按钮样式
      'px-3 py-1.5 rounded-md border-2 border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-colors':
        props.variant === 'button',
      // 边框样式
      'px-3 py-2 rounded-lg border-2 border-slate-300 hover:border-primary-500 transition-colors':
        props.variant === 'border'
    },
    props.class
  )
})

// 计算输入框类名
const inputClasses = computed(() => {
  return cn(
    checkboxInputVariants({
      size: actualSize.value,
      color: props.color,
      disabled: actualDisabled.value,
      variant: props.variant
    })
  )
})

// 计算图标容器类名
const iconContainerClasses = computed(() => {
  return iconContainerVariants({
    size: actualSize.value
  })
})

// 计算图标类名
const iconClasses = computed(() => {
  return iconVariants({
    size: actualSize.value
  })
})

// 计算label类名
const labelClasses = computed(() => {
  return cn(
    labelVariants({
      size: actualSize.value,
      disabled: actualDisabled.value
    })
  )
})

// 输入框引用
const inputRef = ref<HTMLInputElement>()

// 设置 indeterminate 状态
watch([isChecked, indeterminate, inputRef], ([checked, indet, ref]) => {
  if (ref) {
    ref.indeterminate = indet && !checked
  }
}, { immediate: true })

// 处理变化事件
const handleChange = (e: Event) => {
  if (props.value === undefined) {
    // 如果没有value，作为布尔模式处理
    const target = e.target as HTMLInputElement
    const checked = target.checked
    emit('update:modelValue', checked)
    emit('change', checked)
    return
  }

  const target = e.target as HTMLInputElement
  const checked = target.checked
  
  if (isInGroup.value) {
    // 组模式
    groupContext!.handleChange(props.value, checked)
  } else {
    // 独立模式
    let newValue: boolean | string[]
    
    if (Array.isArray(props.modelValue)) {
      // 数组模式
      newValue = [...props.modelValue]
      if (checked) {
        newValue.push(props.value)
      } else {
        const index = newValue.indexOf(props.value)
        if (index > -1) {
          newValue.splice(index, 1)
        }
      }
    } else {
      // 布尔模式
      newValue = checked
    }
    
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }
}

// 暴露方法给父组件
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>
