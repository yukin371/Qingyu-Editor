<template>
  <span
    :class="iconClasses"
    :style="iconStyle"
    v-html="svgContent"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getIconSVG } from '../../../utils/icon-mapper'
import type { QyIconProps } from './types'
import { iconSizePresets } from './types'

/**
 * QyIcon - Qingyu Design System Icon Component
 * 
 * A flexible icon component that renders SVG icons with full customization.
 * 
 * @example
 * ```vue
 * <QyIcon name="Search" :size="16" />
 * <QyIcon name="Star" color="yellow" :size="24" />
 * <QyIcon name="Check" color="green" />
 * ```
 */
const props = withDefaults(defineProps<QyIconProps>(), {
  size: 16,
  color: 'currentColor',
  class: '',
  rotate: 0,
  flip: 'none',
})

// Get SVG content
const svgContent = computed(() => {
  const icon = getIconSVG(props.name)
  if (!icon) {
    console.warn(`[QyIcon] Icon "${props.name}" not found`)
    return ''
  }
  return icon
})

// Compute icon classes
const iconClasses = computed(() => {
  const classes = ['qy-icon', 'inline-flex', 'items-center', 'justify-center']
  
  // Add custom class
  if (props.class) {
    classes.push(props.class)
  }
  
  return classes.join(' ')
})

// Compute icon size with proper preset handling
const computedSize = computed(() => {
  // 如果是数字，直接使用
  if (typeof props.size === 'number') {
    return props.size
  }

  // 如果是字符串，从预设映射表获取
  const sizeStr = props.size as keyof typeof iconSizePresets
  if (props.size && iconSizePresets[sizeStr]) {
    return iconSizePresets[sizeStr]
  }

  // 默认值
  return 16
})

// Compute icon style
const iconStyle = computed(() => {
  const style: Record<string, string> = {}

  // Size
  style.width = `${computedSize.value}px`
  style.height = `${computedSize.value}px`
  
  // Color
  style.color = props.color
  
  // Rotation
  if (props.rotate !== 0) {
    style.transform = `rotate(${props.rotate}deg)`
  }
  
  // Flip
  if (props.flip === 'horizontal') {
    const currentTransform = style.transform || 'none'
    style.transform = `${currentTransform} scaleX(-1)`
  } else if (props.flip === 'vertical') {
    const currentTransform = style.transform || 'none'
    style.transform = `${currentTransform} scaleY(-1)`
  } else if (props.flip === 'both') {
    const currentTransform = style.transform || 'none'
    style.transform = `${currentTransform} scaleX(-1) scaleY(-1)`
  }
  
  return style
})
</script>

<style scoped>
.qy-icon {
  display: inline-flex;
  align-items: center;
  justify-center: center;
  flex-shrink: 0;
  line-height: 1;
}

.qy-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.qy-icon :deep(svg[stroke='currentColor']) {
  stroke: currentColor;
}

.qy-icon :deep(svg[fill='currentColor']) {
  fill: currentColor;
}
</style>
