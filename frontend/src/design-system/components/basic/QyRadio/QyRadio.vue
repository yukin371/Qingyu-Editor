<template>
  <label
    :class="radioClasses"
    :aria-disabled="actualDisabled ? 'true' : undefined"
  >
    <!-- 单选框输入 -->
    <input
      ref="inputRef"
      :checked="isChecked"
      type="radio"
      :class="inputClasses"
      :value="value"
      :disabled="actualDisabled"
      :name="actualName"
      @change="handleChange"
    />

    <!-- Label -->
    <span v-if="label || $slots.default" :class="labelClasses">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { RADIO_GROUP_KEY, type QyRadioGroupContext } from './contextKey'
import type { QyRadioProps, QyRadioEmits } from './types'
import {
  radioVariants,
  radioInputVariants,
  labelVariants
} from './variants'

// Props
const props = withDefaults(defineProps<QyRadioProps>(), {
  disabled: false,
  size: 'md',
  color: 'primary',
  variant: 'default'
})

// Emits
const emit = defineEmits<QyRadioEmits>()

// 注入组上下文
const groupContext = inject<QyRadioGroupContext | undefined>(RADIO_GROUP_KEY, undefined)

// 是否在组中
const isInGroup = computed(() => groupContext !== undefined)

// 实际的 disabled、size、name 值（优先使用组的设置）
const actualDisabled = computed(() => 
  isInGroup.value ? groupContext!.disabled.value : props.disabled
)
const actualSize = computed(() => 
  isInGroup.value ? groupContext!.size.value : props.size
)
const actualName = computed(() => 
  isInGroup.value ? groupContext!.name.value : props.name
)

// 计算当前是否选中
const isChecked = computed(() => {
  if (isInGroup.value) {
    return groupContext!.modelValue.value === props.value
  }
  return props.modelValue === props.value
})

// 计算容器类名
const radioClasses = computed(() => {
  return cn(
    radioVariants({
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
    radioInputVariants({
      size: actualSize.value,
      color: props.color,
      disabled: actualDisabled.value,
      variant: props.variant
    })
  )
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

// 处理变化事件
const handleChange = () => {
  if (actualDisabled.value) return
  
  if (isInGroup.value) {
    // 组模式
    groupContext!.handleChange(props.value)
  } else {
    // 独立模式
    emit('update:modelValue', props.value)
    emit('change', props.value)
  }
}

// 暴露方法给父组件
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style scoped>
</style>
