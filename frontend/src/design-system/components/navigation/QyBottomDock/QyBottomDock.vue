<template>
  <div :class="containerClasses">
    <!-- Dock Container -->
    <div class="dock-container">
      <!-- Render items -->
      <button
        v-for="(item, index) in items"
        :key="index"
        :class="getItemClasses(item)"
        :disabled="item.disabled"
        @click="handleItemClick(item, index)"
      >
        <!-- Icon -->
        <div v-html="item.icon" :class="iconClasses(item)" />

        <!-- Badge -->
        <span
          v-if="item.badge && item.badge > 0"
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full"
        >
          {{ item.badge > 99 ? '99+' : item.badge }}
        </span>

        <!-- Label (mobile only) -->
        <span v-if="showLabels" class="text-[10px] md:hidden mt-1 font-medium">
          {{ item.label }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyBottomDockProps, QyBottomDockEmits, QyBottomDockItem } from './types'

// Props
const props = withDefaults(defineProps<QyBottomDockProps>(), {
  position: 'floating',
  showLabels: true
})

// Emits
const emit = defineEmits<QyBottomDockEmits>()

// Container classes
const containerClasses = computed(() => {
  const base = 'fixed z-50 transition-all duration-300'

  if (props.position === 'floating') {
    // Floating: full width on mobile, centered dock on desktop
    return `${base} bottom-0 left-0 w-full md:bottom-8 md:left-1/2 md:w-auto md:-translate-x-1/2`
  } else {
    // Bottom: always full width
    return `${base} bottom-0 left-0 w-full`
  }
})

// Get item classes
const getItemClasses = (item: QyBottomDockItem) => {
  return [
    // Base styles
    'dock-btn',
    'relative',
    // Disabled state
    item.disabled && 'opacity-50 cursor-not-allowed',
    // Active state
    item.active && 'active',
    // Highlight state
    item.highlight && 'dock-btn-highlight'
  ].filter(Boolean).join(' ')
}

// Get icon classes
const iconClasses = (item: QyBottomDockItem) => {
  const base = item.highlight ? 'w-7 h-7' : 'w-6 h-6'
  const color = item.active ? 'text-primary-600' : 'text-slate-500'

  return [base, color].join(' ')
}

// Handle item click
const handleItemClick = (item: QyBottomDockItem, index: number) => {
  if (!item.disabled) {
    emit('item-click', item, index)
  }
}
</script>

<style scoped>
@reference "@/style.css";

/* ========================================
   Dock Container
   ======================================== */
.dock-container {
  position: relative;
}

/* ========================================
   Dock Button Styles
   ======================================== */
.dock-btn {
  @apply flex flex-col items-center justify-center;
  @apply p-3 rounded-2xl transition-all duration-300;
  @apply hover:scale-105;
  position: relative;
  transform: translateY(-8px); /* 让图标略微上浮在胶囊上方 */
}

@media (min-width: 768px) {
  .dock-btn {
    flex-direction: row;
  }
}

/* 普通按钮悬停 - 上浮效果 */
.dock-btn:not(:disabled):hover {
  transform: translateY(-16px) scale(1.05); /* 悬停时上浮到 -16px 并放大 */
}

/* 中间按钮特殊样式 - 放大并突出显示 */
.dock-btn-highlight {
  transform: scale(1.1) translateY(-12px); /* 放大且上浮更多 */
  box-shadow: 0 4px 20px rgba(var(--color-primary-500-rgb), 0.3);
}

/* 中间按钮悬停时的光晕效果 */
.dock-btn-highlight:not(:disabled):hover {
  transform: scale(1.15) translateY(-20px); /* 悬停时上浮到 -20px */
  box-shadow: 0 6px 30px rgba(var(--color-primary-500-rgb), 0.5);
}

/* 中间按钮点击时的效果 */
.dock-btn-highlight:not(:disabled):active {
  transform: scale(1.05) translateY(-12px); /* 点击时回到默认上浮位置 */
}

/* 激活状态 */
.dock-btn.active {
  @apply text-primary-600 bg-primary-100;
}

/* 悬停状态（非激活） */
.dock-btn:not(.active):not(:disabled):hover {
  @apply text-slate-900 bg-slate-100;
}

/* ========================================
   iPhone 安全区域适配
   ======================================== */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
