<script setup lang="ts">
/**
 * TransferPanel 组件
 *
 * 穿梭框面板组件，包含搜索框和列表容器
 */

import { computed, ref, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import TransferItem from './TransferItem.vue'
import type { TransferPanelProps, TransferPanelEmits, TransferPropsOption } from './types'

// 使用 CVA 定义面板变体
const panelVariants = cva('flex-1 flex flex-col rounded-lg border bg-white', {
  variants: {
    disabled: {
      true: 'opacity-60',
      false: '',
    },
  },
})

// 组件 Props
const props = withDefaults(defineProps<TransferPanelProps>(), {
  filterable: false,
  filterPlaceholder: '请输入搜索内容',
  format: '{label}',
  itemProps: () => ({
    key: 'key',
    label: 'label',
    disabled: 'disabled',
  }),
})

// 组件 Emits
const emit = defineEmits<TransferPanelEmits>()

// 搜索关键词
const query = ref('')

// 内部选中状态
const internalChecked = ref<(string | number)[]>([...props.checkedKeys])

// 监听外部选中状态变化
watch(
  () => props.checkedKeys,
  (newVal) => {
    internalChecked.value = [...newVal]
  },
)

// 计算样式类
const panelClasses = computed(() =>
  cn(
    panelVariants({
      disabled: false,
    }),
  ),
)

// 过滤后的数据
const filteredData = computed(() => {
  if (!query.value) {
    return props.data
  }

  if (props.filterMethod) {
    return props.data.filter((item) => props.filterMethod!(query.value, item))
  }

  const labelKey = props.itemProps.label ?? 'label'
  return props.data.filter((item) => {
    const label = String(item[labelKey] || '').toLowerCase()
    return label.includes(query.value.toLowerCase())
  })
})

// 处理选中变化
const handleCheckChange = (checkedValues: (string | number)[]) => {
  internalChecked.value = checkedValues

  // 获取选中的项
  const keyField = props.itemProps.key ?? 'key'
  const checkedItems = props.data.filter((item) => {
    const key = item[keyField]
    return checkedValues.includes(key)
  })

  emit('check-change', checkedValues, checkedItems)
}

// 处理单个项的选中变化
const handleItemChange = (item: TransferPropsOption, checked: boolean) => {
  const keyField = props.itemProps.key ?? 'key'
  const key = item[keyField]
  const newChecked = [...internalChecked.value]

  if (checked) {
    if (!newChecked.includes(key)) {
      newChecked.push(key)
    }
  } else {
    const index = newChecked.indexOf(key)
    if (index > -1) {
      newChecked.splice(index, 1)
    }
  }

  handleCheckChange(newChecked)
}

// 是否全选
const isAllChecked = computed(() => {
  const disabledField = props.itemProps.disabled ?? 'disabled'
  const keyField = props.itemProps.key ?? 'key'
  const availableData = filteredData.value.filter((item) => !item[disabledField])
  return (
    availableData.length > 0 &&
    availableData.every((item) => {
      const key = item[keyField]
      return internalChecked.value.includes(key)
    })
  )
})

// 是否部分选中
const isIndeterminate = computed(() => {
  const disabledField = props.itemProps.disabled ?? 'disabled'
  const keyField = props.itemProps.key ?? 'key'
  const availableData = filteredData.value.filter((item) => !item[disabledField])
  const checkedCount = availableData.filter((item) => {
    const key = item[keyField]
    return internalChecked.value.includes(key)
  }).length

  return checkedCount > 0 && checkedCount < availableData.length
})

// 处理全选/取消全选
const handleCheckAll = () => {
  const disabledField = props.itemProps.disabled ?? 'disabled'
  const keyField = props.itemProps.key ?? 'key'
  const availableData = filteredData.value.filter((item) => !item[disabledField])

  if (isAllChecked.value) {
    // 取消全选
    const keysToRemove = availableData.map((item) => item[keyField])
    const newChecked = internalChecked.value.filter((key) => !keysToRemove.includes(key))
    handleCheckChange(newChecked)
  } else {
    // 全选
    const keysToAdd = availableData.map((item) => item[keyField])
    const newChecked = [...internalChecked.value]
    keysToAdd.forEach((key) => {
      if (!newChecked.includes(key)) {
        newChecked.push(key)
      }
    })
    handleCheckChange(newChecked)
  }
}

// 清空搜索
const clearQuery = () => {
  query.value = ''
}

// 头部样式
const headerVariants = cva('px-4 py-3 border-b bg-slate-50 rounded-t-lg', {
  variants: {
    panel: {
      left: 'bg-slate-50',
      right: 'bg-primary-50',
    },
  },
})

const headerClasses = computed(() =>
  cn(
    headerVariants({
      panel: props.panel,
    }),
  ),
)

// 输入框样式
const inputVariants = cva(
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:shadow-[0_0_0_3px_rgba(14,165,233,0.16)] focus:border-transparent transition-all duration-200',
)

// 列表容器样式
const listVariants = cva('flex-1 overflow-y-auto p-2 space-y-1', {
  variants: {},
})

// 获取 item 的 key
const getItemKey = (item: TransferPropsOption) => {
  const keyField = props.itemProps.key ?? 'key'
  return item[keyField]
}

// 获取 item 的 disabled 状态
const getItemDisabled = (item: TransferPropsOption) => {
  const disabledField = props.itemProps.disabled ?? 'disabled'
  return item[disabledField]
}
</script>

<template>
  <div :class="panelClasses">
    <!-- 头部 -->
    <div :class="headerClasses">
      <!-- 标题和全选 -->
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-slate-700">
          {{ title }}
          <span class="ml-2 text-xs font-normal text-slate-500">
            {{ filteredData.length }} / {{ data.length }}
          </span>
        </h3>
        <!-- 全选复选框 -->
        <button
          v-if="filteredData.length > 0"
          @click="handleCheckAll"
          :disabled="isAllChecked && !isIndeterminate"
          class="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <div class="relative flex items-center">
            <input
              type="checkbox"
              :checked="isAllChecked"
              :indeterminate="isIndeterminate"
              class="w-4 h-4 rounded border-slate-300 text-primary-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.16)] cursor-pointer"
            />
          </div>
          <span>全选</span>
        </button>
      </div>

      <!-- 搜索框 -->
      <div v-if="filterable" class="relative">
        <input
          v-model="query"
          type="text"
          :placeholder="filterPlaceholder"
          :class="inputVariants"
        />
        <button
          v-if="query"
          @click="clearQuery"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <div v-else class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- 列表内容 -->
    <div :class="listVariants">
      <div
        v-if="filteredData.length === 0"
        class="flex items-center justify-center h-full text-slate-400"
      >
        <div class="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 mx-auto mb-2 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p class="text-sm">{{ query ? '暂无匹配数据' : '暂无数据' }}</p>
        </div>
      </div>

      <TransferItem
        v-for="item in filteredData"
        :key="getItemKey(item)"
        :item="item"
        :checked="internalChecked.includes(getItemKey(item))"
        :disabled="getItemDisabled(item)"
        :render-content="renderContent"
        :format="format"
        :item-props="itemProps"
        @change="(checked) => handleItemChange(item, checked)"
      />
    </div>
  </div>
</template>
