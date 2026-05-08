<template>
  <div ref="cardRef" :class="cardClasses" @click="handleClick">
    <!-- Aurora 光晕效果 -->
    <div class="qy-card__aurora" aria-hidden="true"></div>

    <!-- Header Slot -->
    <div v-if="$slots.header" :class="headerClasses" class="qy-card__header">
      <slot name="header" />
    </div>

    <!-- Default Slot -->
    <div class="qy-card__body relative z-[1]">
      <slot />
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/design-system/utils/cn'
import type { QyCardProps, QyCardEmits, QyCardSlots } from './types'
import { cardVariants, cardHeaderVariants, cardFooterVariants } from './variants'

// Props
const props = withDefaults(defineProps<QyCardProps>(), {
  shadow: 'hover',
  variant: 'default',
  padding: 'md',
  hoverable: false,
})

// Emits
const emit = defineEmits<QyCardEmits>()

// Slots
defineSlots<QyCardSlots>()

// 卡片引用
const cardRef = ref<HTMLElement>()

// 计算卡片类名
const cardClasses = computed(() => {
  return cn(
    cardVariants({
      shadow: props.shadow,
      variant: props.variant,
      padding: props.padding,
    }),
    {
      // 悬停交互样式
      'cursor-pointer hover:-translate-y-1 hover:[box-shadow:var(--shadow-floating)]':
        props.hoverable,
    },
    props.class,
  )
})

// 计算头部类名
const headerClasses = computed(() => {
  return cn(
    cardHeaderVariants({
      padding: props.padding,
    }),
  )
})

// 计算底部类名
const footerClasses = computed(() => {
  return cn(
    cardFooterVariants({
      padding: props.padding,
    }),
  )
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.hoverable) {
    emit('click', event)
  }
}

// 暴露方法给父组件
defineExpose({
  focus: () => cardRef.value?.focus(),
  blur: () => cardRef.value?.blur(),
})
</script>

<style scoped>
.qy-card__aurora {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 12% 0%, rgb(37 99 235 / 0.08), transparent 38%),
    radial-gradient(circle at 88% 8%, rgb(6 182 212 / 0.08), transparent 34%),
    linear-gradient(180deg, rgb(255 255 255 / 0.06) 0%, transparent 100%);
}

.qy-card__body {
  position: relative;
  z-index: 1;
}
</style>
