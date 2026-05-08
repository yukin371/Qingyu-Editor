<template>
  <div
    :class="groupClasses"
    role="group"
    aria-label="checkbox-group"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, computed, watch } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils/cn'
import { CHECKBOX_GROUP_KEY } from './contextKey'
import type { QyCheckboxGroupProps, QyCheckboxGroupEmits } from './group-types'

/**
 * QyCheckboxGroup CVA variants configuration
 */
const checkboxGroupVariants = cva(
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

export type CheckboxGroupVariants = VariantProps<typeof checkboxGroupVariants>

// Props
const props = withDefaults(defineProps<QyCheckboxGroupProps>(), {
  modelValue: () => [],
  disabled: false,
  size: 'md',
  direction: 'horizontal'
})

// Emits
const emit = defineEmits<QyCheckboxGroupEmits>()

// 内部值
const modelValue = ref<string[]>([...props.modelValue])

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  modelValue.value = [...newVal]
})

// 处理变化
const handleChange = (value: string, checked: boolean) => {
  const newValue = [...modelValue.value]
  
  if (checked) {
    if (!newValue.includes(value)) {
      newValue.push(value)
    }
  } else {
    const index = newValue.indexOf(value)
    if (index > -1) {
      newValue.splice(index, 1)
    }
  }
  
  modelValue.value = newValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// 提供上下文
provide(CHECKBOX_GROUP_KEY, {
  modelValue,
  disabled: computed(() => props.disabled),
  size: computed(() => props.size),
  handleChange
})

// 计算容器类名
const groupClasses = computed(() => {
  return cn(
    checkboxGroupVariants({
      direction: props.direction
    }),
    props.class
  )
})
</script>
