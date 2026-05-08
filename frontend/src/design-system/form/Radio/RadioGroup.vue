<script setup lang="ts">
/**
 * RadioGroup 组件
 *
 * 单选框组组件，提供统一的值管理和属性配置
 */

import { computed, provide, toRef } from 'vue'
import { cn } from '../../utils/cn'
import type { RadioGroupProps, RadioGroupEmits } from './types'

// 组件 Props
const props = withDefaults(defineProps<RadioGroupProps>(), {
  disabled: false,
  size: 'md',
  vertical: false,
  button: false,
})

// 组件 Emits
const emit = defineEmits<RadioGroupEmits>()

// 更新值
const updateModelValue = (value: string | number | boolean) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 为子 Radio 组件提供上下文
provide('radioGroup', {
  disabled: toRef(() => props.disabled),
  size: toRef(() => props.size),
  button: toRef(() => props.button),
  modelValue: toRef(() => props.modelValue),
  updateModelValue,
})

// 计算容器样式类名
const classes = computed(() => {
  if (props.button) {
    // 按钮模式
    return cn(
      'inline-flex',
      props.vertical ? 'flex-col gap-2' : 'flex-row gap-2',
      props.class
    )
  }

  // 标准模式
  return cn(
    'inline-flex',
    props.vertical ? 'flex-col gap-3' : 'flex-row flex-wrap gap-4',
    props.class
  )
})
</script>

<template>
  <div :class="classes" role="radiogroup">
    <slot />
  </div>
</template>
