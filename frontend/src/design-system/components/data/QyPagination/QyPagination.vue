<template>
  <div :class="containerClasses">
    <div v-if="showTotalDisplay" :class="metaTextClasses">共 {{ total }} 条</div>

    <div
      v-if="showPagerRail"
      class="flex items-center gap-2 rounded-full border border-slate-200/75 bg-white/88 px-2 py-1 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)] dark:border-slate-700/70 dark:bg-slate-900/78"
    >
      <button
        v-if="showPrevButton"
        :class="buttonClasses({ disabled: currentPage === 1 || disabled })"
        :disabled="currentPage === 1 || disabled"
        @click="handlePrev"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <template v-if="showPagerButtons">
        <template v-for="page in pagers" :key="page">
          <button
            v-if="page !== '...'"
            :class="buttonClasses({ active: page === currentPage, disabled })"
            :disabled="disabled"
            @click="handlePageClick(page)"
          >
            {{ page }}
          </button>
          <span v-else :class="ellipsisClasses">...</span>
        </template>
      </template>

      <button
        v-if="showNextButton"
        :class="buttonClasses({ disabled: currentPage === totalPages || disabled })"
        :disabled="currentPage === totalPages || disabled"
        @click="handleNext"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <div v-if="showSizesSelector" class="flex items-center gap-2" :class="metaTextClasses">
      <span>每页</span>
      <select
        :class="selectClasses"
        :value="pageSize"
        :disabled="disabled"
        @change="handleSizeChange"
      >
        <option
          v-for="size in normalizedPageSizes"
          :key="typeof size === 'number' ? size : size.value"
          :value="typeof size === 'number' ? size : size.value"
        >
          {{ typeof size === 'number' ? size : size.label }}
        </option>
      </select>
      <span>条</span>
    </div>

    <div v-if="showQuickJumpBlock" class="flex items-center gap-2" :class="metaTextClasses">
      <span>前往</span>
      <input
        type="number"
        :value="jumpInput"
        :class="jumpInputClasses"
        :disabled="disabled"
        @input="jumpInput = ($event.target as HTMLInputElement).value"
        @keyup.enter="handleJump"
      />
      <span>页</span>
      <button :class="buttonClasses({ disabled })" :disabled="disabled" @click="handleJump">
        跳转
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  paginationVariants,
  paginationButtonVariants,
  paginationTextVariants,
  paginationSelectVariants,
} from './variants'
import type { QyPaginationProps, QyPaginationEmits, PageSizeOption } from './types'

// Props
const props = withDefaults(defineProps<QyPaginationProps>(), {
  modelValue: 1,
  total: 0,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  pageCount: 7,
  background: false,
  disabled: false,
  showQuickJumper: false,
  layout: () => ['prev', 'pager', 'next'],
  showTotal: false,
  small: false,
})

// Emits
const emit = defineEmits<QyPaginationEmits>()
const layoutParts = computed(() => new Set(props.layout))

// 当前页码
const currentPage = computed({
  get: () => props.modelValue || 1,
  set: (val) => emit('update:modelValue', val),
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

// 快速跳转输入值
const jumpInput = ref('')
jumpInput.value = String(currentPage.value)

// 监听当前页码变化
watch(currentPage, (val) => {
  jumpInput.value = String(val)
})

// 标准化每页数量选项
const normalizedPageSizes = computed((): PageSizeOption[] => {
  return props.pageSizes.map((size) =>
    typeof size === 'number' ? { label: `${size} 条/页`, value: size } : size,
  )
})

// 容器类名
const containerClasses = computed(() => {
  return paginationVariants({
    size: props.small ? 'small' : 'medium',
    background: props.background,
  })
})

// 按钮类名
const buttonClasses = computed(() => {
  return (options: { active?: boolean; disabled?: boolean }) =>
    paginationButtonVariants({
      active: options.active || false,
      disabled: options.disabled || false,
      size: props.small ? 'small' : 'medium',
    })
})

// 文字类名
const textClasses = computed(() => {
  return paginationTextVariants({
    size: props.small ? 'small' : 'medium',
  })
})

const metaTextClasses = computed(
  () =>
    `${textClasses.value} rounded-full border border-slate-200/70 bg-white/82 px-3 py-2 dark:border-slate-700/70 dark:bg-slate-900/76`,
)
const ellipsisClasses = computed(() => `${textClasses.value} px-1.5 font-medium tracking-[0.2em]`)

// 选择器类名
const selectClasses = computed(() => {
  return paginationSelectVariants({
    size: props.small ? 'small' : 'medium',
  })
})

const jumpInputClasses = computed(() => `${selectClasses.value} w-16 text-center`)
const showTotalDisplay = computed(() => props.showTotal || layoutParts.value.has('total'))
const showPrevButton = computed(() => layoutParts.value.has('prev'))
const showPagerButtons = computed(() => layoutParts.value.has('pager'))
const showNextButton = computed(() => layoutParts.value.has('next'))
const showPagerRail = computed(
  () => showPrevButton.value || showPagerButtons.value || showNextButton.value,
)
const showSizesSelector = computed(() => Boolean(props.pageSizes && props.pageSizes.length > 0))
const showQuickJumpBlock = computed(() => props.showQuickJumper || layoutParts.value.has('jumper'))

// 计算显示的页码
const pagers = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const pageCount = props.pageCount

  if (total <= pageCount) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const result: (number | string)[] = []
  const half = Math.floor(pageCount / 2)

  // 总是显示第一页
  result.push(1)

  // 左边省略号
  if (current > half + 2) {
    result.push('...')
  }

  // 中间页码
  const start = Math.max(2, current - half)
  const end = Math.min(total - 1, current + half)

  for (let i = start; i <= end; i++) {
    result.push(i)
  }

  // 右边省略号
  if (current < total - half - 1) {
    result.push('...')
  }

  // 总是显示最后一页
  result.push(total)

  return result
})

// 处理上一页
const handlePrev = () => {
  if (currentPage.value > 1) {
    currentPage.value = currentPage.value - 1
    emit('change', currentPage.value, props.pageSize)
  }
}

// 处理下一页
const handleNext = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value = currentPage.value + 1
    emit('change', currentPage.value, props.pageSize)
  }
}

// 处理页码点击
const handlePageClick = (page: number | string) => {
  if (typeof page === 'number') {
    currentPage.value = page
    emit('change', page, props.pageSize)
  }
}

// 处理每页数量变化
const handleSizeChange = (e: Event) => {
  const newSize = Number((e.target as HTMLSelectElement).value)
  emit('update:pageSize', newSize)
  // 重置到第一页
  currentPage.value = 1
  emit('change', 1, newSize)
}

// 处理快速跳转
const handleJump = () => {
  const page = parseInt(jumpInput.value)
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('change', page, props.pageSize)
  }
}
</script>
