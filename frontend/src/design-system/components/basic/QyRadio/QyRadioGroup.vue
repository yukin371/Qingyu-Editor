<template>
  <div
    :class="groupClasses"
    role="radiogroup"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, computed, watch } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils/cn'
import { RADIO_GROUP_KEY } from './contextKey'
import type { QyRadioGroupProps, QyRadioGroupEmits } from './group-types'

/**
 * QyRadioGroup CVA variants configuration
 */
const radioGroupVariants = cva(
  [
    'inline-flex flex-wrap gap-3'
  ],
  {
    variants: {
      direction: {
        horizontal: 'flex-row',
        vertical: 'flex-col'
      }
    },
    defaultVariants: {
      direction: 'horizontal'
    }
  }
)

export type RadioGroupVariants = VariantProps<typeof radioGroupVariants>

// Props
const props = withDefaults(defineProps<QyRadioGroupProps>(), {
  modelValue: '',
  disabled: false,
  size: 'md',
  direction: 'horizontal'
})

// Emits
const emit = defineEmits<QyRadioGroupEmits>()

// 内部值
const modelValue = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  modelValue.value = newVal
})

// 生成唯一名称
const groupName = computed(() => 
  props.name || `qy-radio-group-${Math.random().toString(36).slice(2, 11)}`
)

// 处理变化
const handleChange = (value: string | number | boolean) => {
  modelValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

// 提供上下文
provide(RADIO_GROUP_KEY, {
  modelValue,
  disabled: computed(() => props.disabled),
  size: computed(() => props.size),
  name: computed(() => groupName.value),
  handleChange
})

// 计算容器类名
const groupClasses = computed(() => {
  return cn(
    radioGroupVariants({
      direction: props.direction
    }),
    props.class
  )
})

// 计算无障碍标签
const ariaLabel = computed(() => 
  props.ariaLabel || props.label
)
</script>
