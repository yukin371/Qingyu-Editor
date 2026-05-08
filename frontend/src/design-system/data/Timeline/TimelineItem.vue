<script setup lang="ts">
/**
 * TimelineItem 组件
 *
 * 时间线中的单个节点，支持左侧/右侧/交替居中布局
 * 交替模式下：节点居中，内容在两侧，箭头指向中心
 */

import { computed, inject, onMounted, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { TimelineItemProps } from './types'

const props = withDefaults(defineProps<TimelineItemProps>(), {
  type: 'primary',
  hollow: false,
  hideLine: false,
  pending: false,
  disabled: false,
  size: 'default',
})

const timelinePlacement = inject<string>('timelinePlacement', 'left')
const timelineOrientation = inject<string>('timelineOrientation', 'vertical')
const getNextAlternateIndex = inject<() => number>('timelineNextIndex', () => 0)

// 获取当前item的索引
const itemIndex = ref(-1)
onMounted(() => {
  itemIndex.value = getNextAlternateIndex()
})

// 判断是否为交替模式
const isHorizontal = computed(() => timelineOrientation === 'horizontal')
const isAlternate = computed(() => timelinePlacement === 'alternate')

// 交替模式下，判断当前item是否在左侧（奇数索引=左侧，偶数索引=右侧）
const isAlternateLeft = computed(() => {
  if (!isAlternate.value || itemIndex.value < 0) return true
  return itemIndex.value % 2 === 0
})

// 节点颜色变体 - 支持 default 和 big 尺寸
const nodeVariants = cva(
  'relative z-10 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 ring-4 ring-slate-50 dark:ring-slate-900 transition-all duration-200',
  {
    variants: {
      size: {
        default: 'w-5 h-5 ring-4',
        big: 'w-6 h-6 ring-6',
      },
      type: {
        primary: 'bg-blue-500 dark:bg-blue-400',
        success: 'bg-emerald-500 dark:bg-emerald-400',
        warning: 'bg-amber-500 dark:bg-amber-400',
        danger: 'bg-red-500 dark:bg-red-400',
        info: 'bg-slate-400 dark:bg-slate-500',
      },
      hollow: {
        true: 'bg-white dark:bg-slate-800',
        false: '',
      },
    },
    compoundVariants: [
      {
        size: 'default',
        type: 'primary',
        hollow: true,
        class: 'border-blue-500 dark:border-blue-400',
      },
      {
        size: 'default',
        type: 'success',
        hollow: true,
        class: 'border-emerald-500 dark:border-emerald-400',
      },
      {
        size: 'default',
        type: 'warning',
        hollow: true,
        class: 'border-amber-500 dark:border-amber-400',
      },
      {
        size: 'default',
        type: 'danger',
        hollow: true,
        class: 'border-red-500 dark:border-red-400',
      },
      {
        size: 'default',
        type: 'info',
        hollow: true,
        class: 'border-slate-400 dark:border-slate-500',
      },
      { size: 'big', type: 'primary', hollow: true, class: 'border-blue-500 dark:border-blue-400' },
      {
        size: 'big',
        type: 'success',
        hollow: true,
        class: 'border-emerald-500 dark:border-emerald-400',
      },
      {
        size: 'big',
        type: 'warning',
        hollow: true,
        class: 'border-amber-500 dark:border-amber-400',
      },
      { size: 'big', type: 'danger', hollow: true, class: 'border-red-500 dark:border-red-400' },
      { size: 'big', type: 'info', hollow: true, class: 'border-slate-400 dark:border-slate-500' },
    ],
    defaultVariants: {
      size: 'default',
      type: 'primary',
      hollow: false,
    },
  },
)

// 内容区颜色 - 小圆点
const dotVariants = cva('rounded-full', {
  variants: {
    size: {
      default: 'w-2 h-2',
      big: 'w-3 h-3',
    },
    type: {
      primary: 'bg-blue-600 dark:bg-blue-300',
      success: 'bg-emerald-600 dark:bg-emerald-300',
      warning: 'bg-amber-600 dark:bg-amber-300',
      danger: 'bg-red-600 dark:bg-red-300',
      info: 'bg-slate-500 dark:bg-slate-400',
    },
  },
  defaultVariants: {
    size: 'default',
    type: 'primary',
  },
})

// Pending 闪烁动画
const pendingVariants = cva('animate-pulse', {
  variants: {
    pending: {
      true: '',
      false: '',
    },
  },
})

// 计算节点样式
const nodeClasses = computed(() =>
  cn(
    nodeVariants({
      size: props.size,
      type: props.type,
      hollow: props.hollow,
    }),
    pendingVariants({ pending: props.pending }),
    props.class,
  ),
)

const dotClasses = computed(() =>
  cn(
    dotVariants({ size: props.size, type: props.type }),
    props.hollow ? 'opacity-0' : 'opacity-100',
  ),
)

// 左侧模式
const isLeft = computed(() => timelinePlacement === 'left')

// ========== 交替模式布局 ==========
// 容器类 - 交替模式下使用相对定位
const alternateContainerClasses = computed(() => {
  if (!isAlternate.value) return ''
  return 'relative mb-12 last:mb-0'
})

// 节点容器 - 居中定位
const alternateNodeClasses = computed(() => {
  if (!isAlternate.value) return ''
  const sizeClass = props.size === 'big' ? 'w-6 h-6' : 'w-5 h-5'
  return cn(
    'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center',
    sizeClass,
  )
})

// 内容区容器 - 宽度 45%，根据左右侧调整位置
const alternateContentClasses = computed(() => {
  if (!isAlternate.value) return ''
  return cn(
    'relative w-[45%] p-5 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-100 dark:border-slate-700',
    isAlternateLeft.value ? 'mr-auto text-left' : 'ml-auto text-right',
  )
})

// 箭头颜色
const arrowColorClassRight = computed(() => {
  const colorMap: Record<string, string> = {
    primary: 'border-r-blue-500 dark:border-r-blue-400',
    success: 'border-r-emerald-500 dark:border-r-emerald-400',
    warning: 'border-r-amber-500 dark:border-r-amber-400',
    danger: 'border-r-red-500 dark:border-r-red-400',
    info: 'border-r-slate-400 dark:border-r-slate-500',
  }
  return colorMap[props.type] || colorMap.primary
})

// 箭头类
const arrowClasses = computed(() => {
  if (!isAlternate.value) return ''
  if (isAlternateLeft.value) {
    // 内容在左侧，箭头在右侧边缘，指右
    return cn(
      'absolute top-7 -right-5 border-l-8 border-r-0 border-t-8 border-b-8 border-t-transparent border-b-transparent border-l-slate-300 dark:border-l-slate-600',
    )
  } else {
    // 内容在右侧，箭头在左侧边缘，指左
    return cn(
      'absolute top-7 -left-5 border-r-8 border-l-0 border-t-8 border-b-8 border-t-transparent border-b-transparent',
      arrowColorClassRight.value,
    )
  }
})

// ========== 左侧/右侧模式布局 ==========
const basicContainerClasses = computed(() => {
  if (isAlternate.value || isHorizontal.value) return ''
  return cn(
    'relative flex items-start py-3',
    isLeft.value ? 'flex-row' : 'flex-row sm:flex-row-reverse',
  )
})

const basicNodeClasses = computed(() => {
  if (isAlternate.value || isHorizontal.value) return ''
  return cn('relative z-10 flex h-6 w-10 flex-shrink-0 items-start justify-center pt-0.5')
})

const basicContentClasses = computed(() => {
  if (isAlternate.value || isHorizontal.value) return ''
  return cn('flex-1 min-w-0 px-4 pt-0.5', isLeft.value ? 'text-left' : 'text-left sm:text-right')
})

const basicSurfaceClasses = computed(() => {
  if (isAlternate.value || isHorizontal.value) return ''
  return cn(
    'relative rounded-[1.35rem] border border-slate-200/70 bg-white/92 px-5 py-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] backdrop-blur-md transition-all duration-200 dark:border-slate-700/70 dark:bg-slate-900/88',
    props.disabled && 'opacity-60',
    props.pending &&
      'shadow-[0_18px_45px_-24px_rgba(59,130,246,0.28)] dark:shadow-[0_20px_55px_-24px_rgba(96,165,250,0.24)]',
  )
})

const basicArrowClasses = computed(() => {
  if (isAlternate.value || isHorizontal.value) return ''
  return cn(
    'pointer-events-none absolute top-5 h-3.5 w-3.5 rotate-45 rounded-[3px] border border-slate-200/70 bg-white/92 dark:border-slate-700/70 dark:bg-slate-900/88',
    isLeft.value
      ? 'left-0 -translate-x-1/2'
      : 'left-0 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-1/2',
  )
})

const horizontalContainerClasses = computed(() => {
  if (!isHorizontal.value) return ''
  return 'group relative w-[16rem] shrink-0 snap-start'
})

const horizontalSurfaceClasses = computed(() => {
  if (!isHorizontal.value) return ''
  return cn(
    'relative rounded-[1.5rem] border border-slate-200/75 bg-white/94 px-5 py-4 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.5)] backdrop-blur-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_54px_-28px_rgba(15,23,42,0.28)] dark:border-slate-700/75 dark:bg-slate-900/90',
    props.disabled && 'opacity-60',
    props.pending &&
      'ring-1 ring-blue-200/70 shadow-[0_24px_54px_-28px_rgba(59,130,246,0.22)] dark:ring-blue-500/30 dark:shadow-[0_24px_64px_-28px_rgba(96,165,250,0.18)]',
  )
})

const horizontalArrowClasses = computed(() => {
  if (!isHorizontal.value) return ''
  return 'pointer-events-none absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-[4px] border border-slate-200/75 bg-white/94 dark:border-slate-700/75 dark:bg-slate-900/90'
})

const horizontalNodeWrapClasses = computed(() => {
  if (!isHorizontal.value) return ''
  return 'relative z-10 flex h-10 items-center justify-center'
})

const horizontalNodeClasses = computed(() => {
  if (!isHorizontal.value) return ''
  return cn(
    'shadow-[0_10px_24px_-14px_rgba(15,23,42,0.55)] transition-transform duration-300 group-hover:scale-[1.08]',
    nodeClasses.value,
  )
})
</script>

<template>
  <!-- 交替模式 -->
  <div v-if="isAlternate" :class="alternateContainerClasses">
    <!-- 节点 - 居中定位 -->
    <div :class="alternateNodeClasses">
      <div :class="nodeClasses">
        <div v-if="!hollow" :class="dotClasses" />
        <slot name="icon" />
      </div>
    </div>

    <!-- 内容区 -->
    <div :class="alternateContentClasses">
      <!-- 箭头 -->
      <div :class="arrowClasses" />

      <!-- 时间戳 -->
      <div v-if="timestamp" class="text-xs text-slate-400 dark:text-slate-500 mb-1 font-mono">
        {{ timestamp }}
      </div>
      <!-- 标题 -->
      <div v-if="title" class="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {{ title }}
      </div>
      <!-- 描述 -->
      <div v-if="description" class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {{ description }}
      </div>
      <!-- 默认插槽 -->
      <slot />
    </div>
  </div>

  <!-- 横向模式 -->
  <div v-else-if="isHorizontal" :class="horizontalContainerClasses">
    <div class="mb-4 flex h-10 items-end justify-center text-center">
      <div
        v-if="timestamp"
        class="text-[11px] font-mono uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500"
      >
        {{ timestamp }}
      </div>
    </div>

    <div :class="horizontalNodeWrapClasses">
      <div :class="horizontalNodeClasses">
        <div v-if="!hollow" :class="dotClasses" />
        <slot name="icon" />
      </div>
    </div>

    <div class="mt-5 px-3">
      <div :class="horizontalSurfaceClasses">
        <div :class="horizontalArrowClasses" aria-hidden="true" />

        <div v-if="title" class="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {{ title }}
        </div>
        <div
          v-if="description"
          class="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
        >
          {{ description }}
        </div>
        <slot />
      </div>
    </div>
  </div>

  <!-- 左侧/右侧模式 -->
  <div v-else :class="basicContainerClasses">
    <!-- 节点 -->
    <div :class="basicNodeClasses">
      <div :class="nodeClasses">
        <div v-if="!hollow" :class="dotClasses" />
        <slot name="icon" />
      </div>
    </div>

    <!-- 内容区 -->
    <div :class="basicContentClasses">
      <div :class="basicSurfaceClasses">
        <div :class="basicArrowClasses" aria-hidden="true" />

        <!-- 时间戳 -->
        <div
          v-if="timestamp"
          class="mb-1 text-xs font-mono tracking-[0.18em] text-slate-400 dark:text-slate-500"
        >
          {{ timestamp }}
        </div>
        <!-- 标题 -->
        <div v-if="title" class="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {{ title }}
        </div>
        <!-- 描述 -->
        <div
          v-if="description"
          class="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
        >
          {{ description }}
        </div>
        <!-- 默认插槽 -->
        <slot />
      </div>
    </div>
  </div>
</template>
