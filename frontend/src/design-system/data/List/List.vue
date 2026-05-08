<script setup lang="ts">
/**
 * List 组件
 *
 * 列表容器组件，用于展示列表数据
 * 支持边框、分割线、加载状态
 * 支持自定义列表项渲染
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { ListProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<ListProps>(), {
  data: () => [],
  border: false,
  split: true,
  loading: false,
})

// 定义事件
const emit = defineEmits<{
  itemClick: [item: any, index: number]
}>()

// 处理列表项点击
const handleItemClick = (item: any, index: number) => {
  emit('itemClick', item, index)
}

// 计算容器样式类名
const containerClasses = computed(() =>
  cn(
    'bg-white rounded-lg overflow-hidden',
    {
      'border border-slate-200': props.border,
    },
    props.class
  )
)

// 计算列表样式类名
const listClasses = computed(() =>
  cn(
    'w-full',
    {
      'divide-y divide-slate-100': props.split,
    }
  )
)
</script>

<template>
  <div :class="containerClasses">
    <!-- 加载状态 -->
    <div v-if="loading" class="p-8 flex items-center justify-center">
      <slot name="loading">
        <div class="flex items-center gap-2 text-slate-500">
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>加载中...</span>
        </div>
      </slot>
    </div>

    <!-- 空状态 (只在没有默认插槽内容时显示) -->
    <div
      v-else-if="data && data.length === 0 && !$slots.default"
      class="p-8 flex items-center justify-center"
    >
      <slot name="empty">
        <div class="text-center text-slate-400">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p>暂无数据</p>
        </div>
      </slot>
    </div>

    <!-- 列表内容 -->
    <ul v-else :class="listClasses">
      <slot :data="data" :on-item-click="handleItemClick">
        <li
          v-for="(item, index) in data"
          :key="index"
          @click="handleItemClick(item, index)"
          class="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors duration-150"
        >
          <slot name="item" :item="item" :index="index">
            {{ item }}
          </slot>
        </li>
      </slot>
    </ul>
  </div>
</template>
