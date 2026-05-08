<script setup lang="ts">
/**
 * Pagination 组件
 *
 * 用于数据分页展示的组件
 * 支持页码跳转、每页数量选择、总页数统计等功能
 */

import { computed, ref, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { PaginationProps, PaginationEmits, PagerItem, PaginationLayout } from './types'

// 使用 CVA 定义按钮变体
const buttonVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center rounded-md transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
        active: 'bg-primary-500 text-white hover:bg-primary-600',
        disabled: 'text-slate-300 dark:text-slate-700 cursor-not-allowed',
      },
      size: {
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
      },
      background: {
        true: 'border border-slate-200 dark:border-slate-700',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      background: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<PaginationProps>(), {
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: () => [10, 20, 30, 40, 50],
  layout: 'prev, pager, next',
  background: false,
  disabled: false,
  hideOnSinglePage: false,
})

// 组件 Emits
const emit = defineEmits<PaginationEmits>()

// 内部状态
const jumperValue = ref(props.currentPage)
const internalPageSize = ref(props.pageSize)

// 监听 props 变化
watch(() => props.currentPage, (newVal) => {
  jumperValue.value = newVal
})

watch(() => props.pageSize, (newVal) => {
  internalPageSize.value = newVal
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

// 是否隐藏组件
const isHidden = computed(() => {
  return props.hideOnSinglePage && totalPages.value <= 1
})

// 解析布局
const layoutParts = computed(() => {
  return props.layout.split(',').map(s => s.trim()) as PaginationLayout[]
})

// 检查布局中是否包含某个部分
const hasLayout = (part: PaginationLayout) => {
  return layoutParts.value.includes(part)
}

// 计算页码数组
const pagers = computed<PagerItem[]>(() => {
  const pages: PagerItem[] = []
  const current = props.currentPage
  const total = totalPages.value

  if (total === 0 || props.pageSize <= 0) return pages

  // 始终显示第一页
  pages.push({ type: 'page', value: 1 })

  if (total <= 7) {
    // 总页数小于等于7，全部显示
    for (let i = 2; i <= total; i++) {
      pages.push({ type: 'page', value: i })
    }
  } else {
    // 总页数大于7，需要省略号
    if (current <= 4) {
      // 当前页在前面
      for (let i = 2; i <= 5; i++) {
        pages.push({ type: 'page', value: i })
      }
      pages.push({ type: 'more-right', value: 0 })
      pages.push({ type: 'page', value: total })
    } else if (current >= total - 3) {
      // 当前页在后面
      pages.push({ type: 'more-left', value: 0 })
      for (let i = total - 4; i <= total; i++) {
        pages.push({ type: 'page', value: i })
      }
    } else {
      // 当前页在中间
      pages.push({ type: 'more-left', value: 0 })
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push({ type: 'page', value: i })
      }
      pages.push({ type: 'more-right', value: 0 })
      pages.push({ type: 'page', value: total })
    }
  }

  return pages
})

// 按钮类名计算
const getButtonClass = (isActive: boolean, isDisabled: boolean) => {
  return cn(
    buttonVariants({
      variant: isDisabled ? 'disabled' : isActive ? 'active' : 'default',
      size: 'sm',
      background: props.background,
    }),
    !isDisabled && 'cursor-pointer',
    props.class
  )
}

// 上一页
const handlePrev = () => {
  if (props.disabled || props.currentPage <= 1) return
  const newPage = props.currentPage - 1
  emit('update:currentPage', newPage)
  emit('currentChange', newPage)
}

// 下一页
const handleNext = () => {
  if (props.disabled || props.currentPage >= totalPages.value) return
  const newPage = props.currentPage + 1
  emit('update:currentPage', newPage)
  emit('currentChange', newPage)
}

// 点击页码
const handlePageClick = (page: number) => {
  if (props.disabled || page === props.currentPage) return
  emit('update:currentPage', page)
  emit('currentChange', page)
}

// 每页数量改变
const handleSizeChange = (e: Event) => {
  const select = e.target as HTMLSelectElement
  const newSize = Number(select.value)
  internalPageSize.value = newSize
  emit('update:pageSize', newSize)
  emit('sizeChange', newSize)

  // 调整当前页，确保不超出范围
  const newTotalPages = Math.ceil(props.total / newSize)
  if (props.currentPage > newTotalPages) {
    emit('update:currentPage', newTotalPages)
    emit('currentChange', newTotalPages)
  }
}

// 跳转输入框确认
const handleJumperConfirm = () => {
  const page = Number(jumperValue.value)
  if (isNaN(page) || page < 1) {
    jumperValue.value = 1
    return
  }
  if (page > totalPages.value) {
    jumperValue.value = totalPages.value
    return
  }
  if (page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('currentChange', page)
  }
}

// 处理跳转输入框键盘事件
const handleJumperKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleJumperConfirm()
  }
}

// 是否禁用上一页
const prevDisabled = computed(() => {
  return props.disabled || props.currentPage <= 1
})

// 是否禁用下一页
const nextDisabled = computed(() => {
  return props.disabled || props.currentPage >= totalPages.value || totalPages.value === 0
})
</script>

<template>
  <div
    v-if="!isHidden"
    class="flex flex-wrap items-center gap-2"
  >
    <!-- 总数 -->
    <div
      v-if="hasLayout('total')"
      class="text-sm text-slate-600 dark:text-slate-400"
    >
      共 {{ total }} 条
    </div>

    <!-- 每页数量选择 -->
    <div
      v-if="hasLayout('sizes')"
      class="flex items-center gap-2"
    >
      <select
        :value="internalPageSize"
        :disabled="disabled"
        class="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-600 outline-none transition-colors hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.16)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        @change="handleSizeChange"
      >
        <option
          v-for="size in pageSizes"
          :key="size"
          :value="size"
        >
          {{ size }} 条/页
        </option>
      </select>
    </div>

    <!-- 上一页按钮 -->
    <button
      v-if="hasLayout('prev')"
      type="button"
      :class="getButtonClass(false, prevDisabled)"
      :disabled="prevDisabled"
      @click="handlePrev"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <!-- 页码列表 -->
    <div
      v-if="hasLayout('pager')"
      class="flex items-center gap-1"
    >
      <button
        v-for="pager in pagers"
        :key="pager.type === 'page' ? pager.value : `more-${pager.type}`"
        type="button"
        :class="getButtonClass(pager.type === 'page' && pager.value === currentPage, disabled)"
        :disabled="disabled"
        @click="pager.type === 'page' && handlePageClick(pager.value)"
      >
        <template v-if="pager.type === 'page'">
          {{ pager.value }}
        </template>
        <template v-else>
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </template>
      </button>
    </div>

    <!-- 下一页按钮 -->
    <button
      v-if="hasLayout('next')"
      type="button"
      :class="getButtonClass(false, nextDisabled)"
      :disabled="nextDisabled"
      @click="handleNext"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>

    <!-- 跳转 -->
    <div
      v-if="hasLayout('jumper')"
      class="flex items-center gap-2"
    >
      <span class="text-sm text-slate-600 dark:text-slate-400">前往</span>
      <input
        v-model.number="jumperValue"
        type="number"
        :disabled="disabled"
        class="h-8 w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-center text-slate-600 outline-none transition-colors hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.16)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        @keydown="handleJumperKeydown"
        @blur="handleJumperConfirm"
      >
      <span class="text-sm text-slate-600 dark:text-slate-400">页</span>
    </div>
  </div>
</template>
