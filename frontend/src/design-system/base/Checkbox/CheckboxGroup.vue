<script setup lang="ts">
/**
 * CheckboxGroup 组件
 *
 * 复选框组组件，管理多个复选框的值
 */

import { computed, provide, ref, watch } from 'vue'
import { cn } from '../../utils/cn'
import { CHECKBOX_GROUP_KEY } from './contextKey'
import type { CheckboxGroupProps, CheckboxGroupEmits } from './types'

// 组件 Props
const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  disabled: false,
  size: 'md',
  vertical: false,
})

// 组件 Emits
const emit = defineEmits<CheckboxGroupEmits>()

// 内部值
const internalValue = ref<string[]>([...(props.modelValue || [])])

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) {
    internalValue.value = [...newVal]
  }
}, { deep: true })

// 更新选中值
const updateValue = (value: string[]) => {
  internalValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

// 切换某个选项
const toggle = (value: string | number | boolean) => {
  const valueStr = String(value)
  const newValue = internalValue.value.includes(valueStr)
    ? internalValue.value.filter(v => v !== valueStr)
    : [...internalValue.value, valueStr]
  
  updateValue(newValue)
}

// 检查是否选中
const isChecked = (value: string | number | boolean) => {
  return internalValue.value.includes(String(value))
}

// 提供上下文给子组件
provide(CHECKBOX_GROUP_KEY, {
  modelValue: internalValue,
  disabled: computed(() => props.disabled),
  size: computed(() => props.size),
  toggle,
  isChecked,
})

// 计算容器样式类名
const containerClasses = computed(() =>
  cn(
    'flex',
    {
      'flex-col gap-2': props.vertical,
      'flex-row flex-wrap gap-4': !props.vertical,
    },
    props.class
  )
)
</script>

<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>
