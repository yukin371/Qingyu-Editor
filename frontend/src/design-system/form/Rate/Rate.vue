<script setup lang="ts">
/**
 * Rate 组件
 *
 * 星级评分组件，支持多种尺寸、半星评分和自定义颜色
 */

import { computed, ref, h } from 'vue'
import { cn } from '../../utils/cn'
import type { RateProps, RateEmits } from './types'
import { rateVariants, starSizeVariants } from './variants'

// Heroicons Star 图标组件
const StarIcon = {
  filled: () =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'currentColor',
        'aria-hidden': 'true',
      },
      [
        h('path', {
          'fill-rule': 'evenodd',
          d: 'M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z',
          'clip-rule': 'evenodd',
        }),
      ],
    ),
  half: () =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': 'true',
      },
      [
        h('defs', {}, [
          h('linearGradient', { id: 'half-gradient', x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, [
            h('stop', { offset: '50%', 'stop-color': 'currentColor' }),
            h('stop', { offset: '50%', 'stop-color': 'currentColor', 'stop-opacity': '0.3' }),
          ]),
        ]),
        h('path', {
          fill: 'url(#half-gradient)',
          'fill-rule': 'evenodd',
          d: 'M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z',
          'clip-rule': 'evenodd',
        }),
      ],
    ),
  outline: () =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'aria-hidden': 'true',
      },
      [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
        }),
      ],
    ),
}

// 组件 Props
const props = withDefaults(defineProps<RateProps>(), {
  modelValue: 0,
  max: 5,
  disabled: false,
  allowHalf: false,
  readonly: false,
  size: 'md',
  color: 'amber-400',
  voidColor: 'slate-300 dark:slate-600',
  showScore: false,
})

// 组件 Emits
const emit = defineEmits<RateEmits>()

// 悬浮值（用于半星支持）
const hoverValue = ref<number | null>(null)

// 当前显示的值
const currentValue = computed(() => {
  return hoverValue.value !== null ? hoverValue.value : props.modelValue
})

// 计算每个星星的状态
const getStarState = (index: number) => {
  const value = currentValue.value
  const starValue = index + 1

  if (props.allowHalf) {
    // 半星模式
    if (value >= starValue - 0.5 && value < starValue) {
      return 'half'
    } else if (value >= starValue) {
      return 'full'
    } else {
      return 'empty'
    }
  } else {
    // 整星模式
    return value >= starValue ? 'full' : 'empty'
  }
}

// 处理星星点击
const handleClick = (event: MouseEvent, index: number) => {
  if (props.disabled || props.readonly) {
    return
  }

  let newValue: number

  if (props.allowHalf) {
    // 半星模式：根据鼠标位置判断是整星还是半星
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = event.clientX - rect.left
    const width = rect.width
    const isHalf = x < width / 2
    newValue = isHalf ? index + 0.5 : index + 1
  } else {
    // 整星模式
    newValue = index + 1
  }

  // 更新值
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent, index: number) => {
  if (props.disabled || props.readonly) {
    return
  }

  if (props.allowHalf) {
    // 半星模式：根据鼠标位置计算悬浮值
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = event.clientX - rect.left
    const width = rect.width
    const isHalf = x < width / 2
    hoverValue.value = isHalf ? index + 0.5 : index + 1
  } else {
    // 整星模式
    hoverValue.value = index + 1
  }
}

// 处理鼠标离开
const handleMouseLeave = () => {
  if (props.disabled || props.readonly) {
    return
  }

  hoverValue.value = null
}

// 计算星星容器类名
const classes = computed(() =>
  cn(
    rateVariants({
      size: props.size,
    }),
    props.disabled && 'opacity-50 cursor-not-allowed',
    !props.disabled && !props.readonly && 'cursor-pointer',
    props.class,
  ),
)

// 计算星星图标类名
const getStarClasses = (index: number) => {
  const state = getStarState(index)
  const sizeClasses = starSizeVariants[props.size]

  const baseClasses = `${sizeClasses.container} transition-colors duration-150 ease-in-out`

  if (state === 'full') {
    return cn(baseClasses, `text-${props.color}`)
  } else if (state === 'half') {
    return cn(baseClasses, `text-${props.color}`)
  } else {
    return cn(baseClasses, `text-${props.voidColor}`)
  }
}

// 获取当前文字
const currentText = computed(() => {
  if (!props.texts || props.texts.length === 0) {
    return ''
  }
  const index = Math.ceil(currentValue.value) - 1
  return props.texts[index] || ''
})
</script>

<template>
  <div :class="classes">
    <!-- 星星列表 -->
    <div
      v-for="index in max"
      :key="index"
      class="relative"
      :class="[starSizeVariants[size].container]"
      @click="handleClick($event, index - 1)"
      @mousemove="handleMouseMove($event, index - 1)"
      @mouseleave="handleMouseLeave"
    >
      <!-- 自定义插槽 -->
      <slot v-if="$slots.default" :state="getStarState(index - 1)" :index="index - 1" />

      <!-- 默认星星图标 -->
      <component
        v-else
        :is="
          StarIcon[
            getStarState(index - 1) === 'full'
              ? 'filled'
              : getStarState(index - 1) === 'half'
                ? 'half'
                : 'outline'
          ]()
        "
        :class="getStarClasses(index - 1)"
      />
    </div>

    <!-- 显示分数 -->
    <span v-if="showScore" class="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ currentValue }}
    </span>

    <!-- 显示文字 -->
    <span v-if="currentText" class="ml-2 text-sm text-slate-600 dark:text-slate-400">
      {{ currentText }}
    </span>
  </div>
</template>
