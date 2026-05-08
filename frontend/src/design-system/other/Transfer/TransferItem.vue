<script setup lang="ts">
/**
 * TransferItem 组件
 *
 * 穿梭框列表项组件，负责渲染单个列表项
 */

import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { TransferItemProps, TransferItemEmits } from './types'

// 使用 CVA 定义列表项变体
const itemVariants = cva(
  'flex items-center px-4 py-3 cursor-pointer transition-all duration-200 border-l-4',
  {
    variants: {
      checked: {
        true: 'bg-primary-50 border-primary-500',
        false: 'bg-white border-transparent hover:bg-slate-50',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    compoundVariants: [
      {
        checked: true,
        disabled: false,
        class: 'hover:bg-primary-100',
      },
    ],
    defaultVariants: {
      checked: false,
      disabled: false,
    },
  },
)

// 组件 Props
const props = withDefaults(defineProps<TransferItemProps>(), {
  checked: false,
  disabled: false,
  format: '{label}',
  itemProps: () => ({
    key: 'key',
    label: 'label',
    disabled: 'disabled',
  }),
})

// 组件 Emits
const emit = defineEmits<TransferItemEmits>()

// 计算样式类
const itemClasses = computed(() =>
  cn(
    itemVariants({
      checked: props.checked,
      disabled: props.disabled,
    }),
  ),
)

// 处理点击事件
const handleClick = () => {
  if (!props.disabled) {
    emit('change', !props.checked)
  }
}

// 格式化显示文本
const displayLabel = computed(() => {
  const labelField = props.itemProps.label ?? 'label'
  const label = props.item[labelField] || ''
  return props.format.replace('{label}', label)
})

// 复选框样式
const checkboxVariants = cva(
  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
  {
    variants: {
      checked: {
        true: 'bg-primary-500 border-primary-500',
        false: 'border-slate-300 bg-white',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    compoundVariants: [
      {
        checked: true,
        disabled: false,
        class: 'hover:bg-primary-600 hover:border-primary-600',
      },
    ],
    defaultVariants: {
      checked: false,
      disabled: false,
    },
  },
)

const checkboxClasses = computed(() =>
  cn(
    checkboxVariants({
      checked: props.checked,
      disabled: props.disabled,
    }),
  ),
)
</script>

<template>
  <div :class="itemClasses" @click="handleClick">
    <!-- 自定义渲染函数 -->
    <slot :item="item" :checked="checked">
      <!-- 默认渲染 -->
      <div :class="checkboxClasses">
        <svg
          v-if="checked"
          xmlns="http://www.w3.org/2000/svg"
          class="h-3.5 w-3.5 text-white"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <span class="ml-3 flex-1 truncate text-sm text-slate-700">
        <slot name="default" :item="item" :label="displayLabel">
          {{ displayLabel }}
        </slot>
      </span>
    </slot>
  </div>
</template>
