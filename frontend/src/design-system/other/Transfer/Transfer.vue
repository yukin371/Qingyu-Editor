<script setup lang="ts">
/**
 * Transfer 组件
 *
 * 穿梭框组件，用于在两个列表间移动数据项
 */

import { computed, ref, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import TransferPanel from './TransferPanel.vue'
import type { TransferProps, TransferEmits } from './types'

// 使用 CVA定义按钮变体
const buttonVariants = cva(
  'flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
        outline: 'border-2 border-slate-300 text-slate-700 hover:border-primary-500 hover:text-primary-500',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<TransferProps>(), {
  filterable: false,
  filterPlaceholder: '请输入搜索内容',
  format: '{label}',
  leftDefaultChecked: () => [],
  rightDefaultChecked: () => [],
  targetOrder: 'original',
})

// 组件 Emits
const emit = defineEmits<TransferEmits>()

// 内部目标列表值
const internalValue = ref<(string | number)[]>(props.modelValue ? [...props.modelValue] : [])

// 左侧选中状态
const leftChecked = ref<(string | number)[]>(props.leftDefaultChecked ? [...props.leftDefaultChecked] : [])

// 右侧选中状态
const rightChecked = ref<(string | number)[]>(props.rightDefaultChecked ? [...props.rightDefaultChecked] : [])

// 获取 props 配置
const itemProps = computed(() => props.props ?? { key: 'key', label: 'label', disabled: 'disabled' })

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      internalValue.value = [...newVal]
    }
  }
)

// 源数据（左侧，未在目标列表中的数据）
const sourceData = computed(() => {
  if (!props.data) return []
  return props.data.filter((item) => {
    const key = item[itemProps.value.key!]
    return !internalValue.value.includes(key)
  })
})

// 目标数据（右侧，在目标列表中的数据）
const targetData = computed(() => {
  if (!props.data) return []

  // 根据 targetOrder 和 internalValue 的顺序来构建目标数据
  if (props.targetOrder === 'original') {
    // original: 按原始数据顺序排序
    return props.data
      .filter((item) => {
        const key = item[itemProps.value.key!]
        return internalValue.value.includes(key)
      })
      .sort((a, b) => {
        const aIndex = props.data!.indexOf(a)
        const bIndex = props.data!.indexOf(b)
        return aIndex - bIndex
      })
  } else if (props.targetOrder === 'push') {
    // push: 按 internalValue 中的顺序（追加到末尾）
    return internalValue.value
      .map((key) => props.data!.find((item) => item[itemProps.value.key!] === key))
      .filter((item) => item !== undefined)
  } else if (props.targetOrder === 'unshift') {
    // unshift: 按 internalValue 的相反顺序（插入到开头）
    return [...internalValue.value]
      .reverse()
      .map((key) => props.data!.find((item) => item[itemProps.value.key!] === key))
      .filter((item) => item !== undefined)
  }

  return []
})

// 是否可以向右移动
const canMoveRight = computed(() => leftChecked.value.length > 0)

// 是否可以向左移动
const canMoveLeft = computed(() => rightChecked.value.length > 0)

// 向右移动
const moveToRight = () => {
  if (!canMoveRight.value) return

  const movedKeys = [...leftChecked.value]
  const newValue = [...internalValue.value]

  movedKeys.forEach((key) => {
    if (!newValue.includes(key)) {
      if (props.targetOrder === 'unshift') {
        newValue.unshift(key)
      } else {
        newValue.push(key)
      }
    }
  })

  internalValue.value = newValue
  emit('update:modelValue', newValue)
  emit('change', newValue, 'right', movedKeys)

  // 清空左侧选中
  leftChecked.value = []
}

// 向左移动
const moveToLeft = () => {
  if (!canMoveLeft.value) return

  const movedKeys = [...rightChecked.value]
  const newValue = internalValue.value.filter((key) => !movedKeys.includes(key))

  internalValue.value = newValue
  emit('update:modelValue', newValue)
  emit('change', newValue, 'left', movedKeys)

  // 清空右侧选中
  rightChecked.value = []
}

// 处理左侧选中变化
const handleLeftCheckChange = (checkedValues: (string | number)[], checkedItems: any[]) => {
  leftChecked.value = checkedValues
  emit('left-check-change', checkedValues, checkedItems)
}

// 处理右侧选中变化
const handleRightCheckChange = (checkedValues: (string | number)[], checkedItems: any[]) => {
  rightChecked.value = checkedValues
  emit('right-check-change', checkedValues, checkedItems)
}

// 计算样式类
const containerClasses = computed(() =>
  cn('flex items-center gap-4')
)

// 按钮容器样式
const buttonsVariants = cva(
  'flex flex-col gap-2',
  {
    variants: {},
  }
)

const buttonsClasses = computed(() =>
  cn(buttonsVariants())
)
</script>

<template>
  <div :class="containerClasses">
    <!-- 左侧面板 -->
    <TransferPanel
      :data="sourceData"
      :checked-keys="leftChecked"
      :title="titles?.[0] || '源列表'"
      :filterable="filterable"
      :filter-placeholder="filterPlaceholder"
      :filter-method="filterMethod"
      :render-content="renderContent"
      :format="format"
      :item-props="itemProps"
      panel="left"
      @check-change="handleLeftCheckChange"
    />

    <!-- 操作按钮 -->
    <div :class="buttonsClasses">
      <button
        type="button"
        :disabled="!canMoveRight"
        :class="buttonVariants({ variant: 'primary' })"
        @click="moveToRight"
        :title="buttonTexts?.[0] || '移动到右侧'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <button
        type="button"
        :disabled="!canMoveLeft"
        :class="buttonVariants({ variant: 'primary' })"
        @click="moveToLeft"
        :title="buttonTexts?.[1] || '移动到左侧'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- 右侧面板 -->
    <TransferPanel
      :data="targetData"
      :checked-keys="rightChecked"
      :title="titles?.[1] || '目标列表'"
      :filterable="filterable"
      :filter-placeholder="filterPlaceholder"
      :filter-method="filterMethod"
      :render-content="renderContent"
      :format="format"
      :item-props="itemProps"
      panel="right"
      @check-change="handleRightCheckChange"
    />
  </div>
</template>
