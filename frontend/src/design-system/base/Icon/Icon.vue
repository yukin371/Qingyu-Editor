<script setup lang="ts">
/**
 * Icon 组件
 *
 * 基于 Heroicons 的图标组件，支持多种尺寸和变体
 * SVG 使用 currentColor，颜色由父级 text-* 控制
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { IconProps } from './types'
import * as iconsData from './icons/icons-data'

// 图标 SVG 数据映射
const iconSvgMap: Record<string, { solid: string; outline: string }> = {
  home: { solid: iconsData.homeIconSolidSvg, outline: iconsData.homeIconOutlineSvg },
  user: { solid: iconsData.userIconSolidSvg, outline: iconsData.userIconOutlineSvg },
  document: { solid: iconsData.documentIconSolidSvg, outline: iconsData.documentIconOutlineSvg },
  folder: { solid: iconsData.folderIconSolidSvg, outline: iconsData.folderIconOutlineSvg },
  plus: { solid: iconsData.plusIconSolidSvg, outline: iconsData.plusIconOutlineSvg },
  minus: { solid: iconsData.minusIconSolidSvg, outline: iconsData.minusIconOutlineSvg },
  check: { solid: iconsData.checkIconSolidSvg, outline: iconsData.checkIconOutlineSvg },
  'x-mark': { solid: iconsData.xMarkIconSolidSvg, outline: iconsData.xMarkIconOutlineSvg },
  pencil: { solid: iconsData.pencilIconSolidSvg, outline: iconsData.pencilIconOutlineSvg },
  trash: { solid: iconsData.trashIconSolidSvg, outline: iconsData.trashIconOutlineSvg },
  'arrow-down': {
    solid: iconsData.arrowDownIconSolidSvg,
    outline: iconsData.arrowDownIconOutlineSvg,
  },
  'arrow-up': { solid: iconsData.arrowUpIconSolidSvg, outline: iconsData.arrowUpIconOutlineSvg },
  'arrow-left': {
    solid: iconsData.arrowLeftIconSolidSvg,
    outline: iconsData.arrowLeftIconOutlineSvg,
  },
  'arrow-right': {
    solid: iconsData.arrowRightIconSolidSvg,
    outline: iconsData.arrowRightIconOutlineSvg,
  },
  'chevron-down': {
    solid: iconsData.chevronDownIconSolidSvg,
    outline: iconsData.chevronDownIconOutlineSvg,
  },
  'chevron-up': {
    solid: iconsData.chevronUpIconSolidSvg,
    outline: iconsData.chevronUpIconOutlineSvg,
  },
  'chevron-left': {
    solid: iconsData.chevronLeftIconSolidSvg,
    outline: iconsData.chevronLeftIconOutlineSvg,
  },
  'chevron-right': {
    solid: iconsData.chevronRightIconSolidSvg,
    outline: iconsData.chevronRightIconOutlineSvg,
  },
  'magnifying-glass': {
    solid: iconsData.magnifyingGlassIconSolidSvg,
    outline: iconsData.magnifyingGlassIconOutlineSvg,
  },
  'cog-6-tooth': {
    solid: iconsData.cog6ToothIconSolidSvg,
    outline: iconsData.cog6ToothIconOutlineSvg,
  },
  bell: { solid: iconsData.bellIconSolidSvg, outline: iconsData.bellIconOutlineSvg },
  heart: { solid: iconsData.heartIconSolidSvg, outline: iconsData.heartIconOutlineSvg },
  star: { solid: iconsData.starIconSolidSvg, outline: iconsData.starIconOutlineSvg },
  'lock-closed': {
    solid: iconsData.lockClosedIconSolidSvg,
    outline: iconsData.lockClosedIconOutlineSvg,
  },
  'information-circle': {
    solid: iconsData.informationCircleIconSolidSvg,
    outline: iconsData.informationCircleIconOutlineSvg,
  },
  'book-open': { solid: iconsData.bookOpenIconSolidSvg, outline: iconsData.bookOpenIconOutlineSvg },
  photo: { solid: iconsData.photoIconSolidSvg, outline: iconsData.photoIconOutlineSvg },
  // 扩展的基础图标
  sparkles: { solid: iconsData.sparklesIconSolidSvg, outline: iconsData.sparklesIconOutlineSvg },
  'question-circle': {
    solid: iconsData.questionMarkCircleIconSolidSvg,
    outline: iconsData.questionMarkCircleIconOutlineSvg,
  },
  clock: { solid: iconsData.clockIconSolidSvg, outline: iconsData.clockIconOutlineSvg },
  code: { solid: iconsData.codeIconSolidSvg, outline: iconsData.codeIconOutlineSvg },
  lightbulb: { solid: iconsData.lightbulbIconSolidSvg, outline: iconsData.lightbulbIconOutlineSvg },
  grid: { solid: iconsData.squares2X2IconSolidSvg, outline: iconsData.squares2X2IconOutlineSvg },
  'check-circle': {
    solid: iconsData.checkCircleIconSolidSvg,
    outline: iconsData.checkCircleIconOutlineSvg,
  },
  book: { solid: iconsData.bookIconSolidSvg, outline: iconsData.bookIconOutlineSvg },
  search: { solid: iconsData.searchIconSolidSvg, outline: iconsData.searchIconOutlineSvg },
  apps: { solid: iconsData.appsIconSolidSvg, outline: iconsData.appsIconOutlineSvg },
  chart: { solid: iconsData.chartBarIconSolidSvg, outline: iconsData.chartBarIconOutlineSvg },
  'rectangle-stack': {
    solid: iconsData.rectangleStackIconSolidSvg,
    outline: iconsData.rectangleStackIconOutlineSvg,
  },
  'circle-stack': {
    solid: iconsData.circleStackIconSolidSvg,
    outline: iconsData.circleStackIconOutlineSvg,
  },
  'user-circle': {
    solid: iconsData.userCircleIconSolidSvg,
    outline: iconsData.userCircleIconOutlineSvg,
  },
  'map-pin': { solid: iconsData.mapPinIconSolidSvg, outline: iconsData.mapPinIconOutlineSvg },
  'globe-alt': { solid: iconsData.globeAltIconSolidSvg, outline: iconsData.globeAltIconOutlineSvg },
  'arrow-trending-up': {
    solid: iconsData.arrowTrendingUpIconSolidSvg,
    outline: iconsData.arrowTrendingUpIconOutlineSvg,
  },
  'arrow-trending-down': {
    solid: iconsData.arrowTrendingDownIconSolidSvg,
    outline: iconsData.arrowTrendingDownIconOutlineSvg,
  },
  'exclamation-triangle': {
    solid: iconsData.exclamationTriangleIconSolidSvg,
    outline: iconsData.exclamationTriangleIconOutlineSvg,
  },
  // 移动端导航图标
  menu: { solid: '', outline: iconsData.bars3IconOutlineSvg },
  close: { solid: iconsData.xMarkIconSolidSvg, outline: iconsData.xMarkIconOutlineSvg },
  Menu: { solid: '', outline: iconsData.bars3IconOutlineSvg },
  Close: { solid: iconsData.xMarkIconSolidSvg, outline: iconsData.xMarkIconOutlineSvg },
}

// 尺寸映射
const sizeClasses: Record<string, string> = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
}

// 组件 Props
const props = withDefaults(defineProps<IconProps>(), {
  size: 'md',
  variant: 'outline',
})

// 组件 Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 查找图标 SVG 原始字符串
const rawSvg = computed(() => {
  const icon = iconSvgMap[props.name as keyof typeof iconSvgMap]
  if (!icon) return null
  return props.variant === 'solid' ? icon.solid : icon.outline
})

// 是否找到图标
const hasIcon = computed(() => rawSvg.value !== null)

// 处理 SVG 字符串：注入 width/height 与 aria-label
const svgHtml = computed(() => {
  if (!rawSvg.value) return ''
  const label = props.ariaLabel || props.name
  return rawSvg.value.replace(/<svg/, `<svg width="100%" height="100%" aria-label="${label}"`)
})

// 正常图标的样式类
const iconClasses = computed(() => {
  return cn(sizeClasses[props.size], 'inline-flex shrink-0', props.class)
})

// Fallback 容器样式
const fallbackClasses = computed(() => {
  return cn(
    sizeClasses[props.size],
    'inline-flex shrink-0 items-center justify-center',
    'ring-1 ring-slate-200/60 bg-slate-50 text-slate-400 rounded',
    props.class,
  )
})

// 点击处理
function handleClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <!-- 正常图标 -->
  <div
    v-if="hasIcon"
    :class="iconClasses"
    :aria-label="ariaLabel || name"
    v-html="svgHtml"
    @click="handleClick"
  />
  <!-- Fallback：tonal 容器 + 问号 -->
  <div v-else :class="fallbackClasses" :aria-label="ariaLabel || name" @click="handleClick">
    <span class="text-[0.65em] leading-none font-medium select-none">?</span>
  </div>
</template>
