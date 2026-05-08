<template>
  <!-- Dot Badge / isDot 模式 -->
  <span v-if="actualType === 'dot'" :class="badgeClasses" aria-hidden="true" />

  <!-- Number Badge -->
  <span v-else-if="actualType === 'number'" :class="badgeClasses">
    {{ displayValue }}
  </span>

  <!-- Text Badge -->
  <span v-else :class="badgeClasses">
    <slot>{{ displayValue }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { badgeVariants } from './variants'
import type { QyBadgeProps, QyBadgeSlots, QyBadgeInstance } from './types'

// Props
const props = withDefaults(defineProps<QyBadgeProps>(), {
  type: 'number',
  color: 'primary',
  size: 'md',
  max: 99,
  showZero: true,
  isDot: false,
})

// Slots
defineSlots<QyBadgeSlots>()

// 计算实际的类型（isDot 优先级更高）
const actualType = computed(() => {
  return props.isDot ? 'dot' : props.type
})

// 计算显示的值
const displayValue = computed(() => {
  // dot 类型没有值
  if (actualType.value === 'dot') {
    return ''
  }

  // number 类型处理数字
  if (actualType.value === 'number') {
    const rawValue = props.value ?? 0
    const numValue = typeof rawValue === 'string' ? parseInt(rawValue, 10) : rawValue

    if (isNaN(numValue)) {
      return '0'
    }

    // 检查是否显示0
    if (numValue === 0 && !props.showZero) {
      return ''
    }

    // 超过最大值
    if (numValue > props.max) {
      return `${props.max}+`
    }

    return numValue.toString()
  }

  // text 类型直接返回 value 或使用 slot
  return props.text || props.value?.toString() || ''
})

// 计算是否应该渲染
const shouldRender = computed(() => {
  // dot 类型始终渲染
  if (actualType.value === 'dot') {
    return true
  }

  // 如果没有内容且不显示0，则不渲染
  if (!displayValue.value) {
    return false
  }

  return true
})

// 计算徽章类名
const badgeClasses = computed(() => {
  return cn(
    badgeVariants({
      type: actualType.value,
      color: props.color,
      size: props.size,
    }),
    {
      hidden: !shouldRender.value,
    },
    props.class,
  )
})

// 获取显示值的方法
const getDisplayValue = () => displayValue.value

// 暴露给父组件的方法
defineExpose<QyBadgeInstance>({
  getDisplayValue,
})
</script>
