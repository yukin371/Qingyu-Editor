<template>
  <div :class="containerClasses">
    <!-- Tab Bar Container -->
    <div class="tab-bar-container">
      <!-- Render tabs -->
      <button
        v-for="(tab, index) in tabs"
        :key="tab.key"
        :class="getTabClasses(tab)"
        :disabled="tab.disabled"
        @click="handleTabClick(tab, index)"
      >
        <!-- Icon -->
        <div v-if="showIcons && tab.icon" v-html="tab.icon" :class="getIconClasses(tab)" />

        <!-- Label -->
        <span v-if="showLabels" :class="getLabelClasses(tab)">
          {{ tab.label }}
        </span>

        <!-- Active Indicator -->
        <span v-if="isActive(tab)" class="active-indicator" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyTabBarProps, QyTabBarEmits, QyTabBarTab } from './types'

// Props
const props = withDefaults(defineProps<QyTabBarProps>(), {
  position: 'bottom',
  showIcons: true,
  showLabels: true
})

// Emits
const emit = defineEmits<QyTabBarEmits>()

// Container classes
const containerClasses = computed(() => {
  const base = 'fixed z-50 transition-all duration-300'

  if (props.position === 'top') {
    return `${base} top-0 left-0 w-full position-top`
  } else {
    return `${base} bottom-0 left-0 w-full safe-area-bottom`
  }
})

// Check if tab is active
const isActive = (tab: QyTabBarTab) => {
  return tab.key === props.modelValue
}

// Get tab classes
const getTabClasses = (tab: QyTabBarTab) => {
  return [
    'tab-btn',
    'relative flex flex-col items-center justify-center',
    'flex-1 px-4 py-3',
    'transition-all duration-300',
    'hover:bg-slate-50',
    // Active state
    isActive(tab) && 'active',
    // Disabled state
    tab.disabled && 'opacity-50 cursor-not-allowed'
  ].filter(Boolean).join(' ')
}

// Get icon classes
const getIconClasses = (tab: QyTabBarTab) => {
  return [
    'w-6 h-6 transition-colors duration-300',
    isActive(tab) ? 'text-primary-600' : 'text-slate-500'
  ].join(' ')
}

// Get label classes
const getLabelClasses = (tab: QyTabBarTab) => {
  return [
    'text-xs font-medium mt-1 transition-colors duration-300',
    isActive(tab) ? 'text-primary-600' : 'text-slate-500'
  ].join(' ')
}

// Handle tab click
const handleTabClick = (tab: QyTabBarTab, index: number) => {
  if (tab.disabled || tab.key === props.modelValue) {
    return
  }

  emit('tab-click', tab, index)
  emit('update:modelValue', tab.key)

  // Emit change event after updating
  setTimeout(() => {
    emit('tab-change', tab, index)
  }, 0)
}
</script>

<style scoped>
@reference "@/style.css";

/* ========================================
   Tab Bar Container
   ======================================== */
.tab-bar-container {
  @apply flex items-center justify-around;
  @apply bg-white/80 backdrop-blur-2xl;
  @apply border-t border-white/50;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* Position: Top */
.position-top .tab-bar-container {
  @apply border-t-0 border-b border-white/50;
}

/* ========================================
   Tab Button
   ======================================== */
.tab-btn {
  position: relative;
}

/* Active State */
.tab-btn.active {
  @apply text-primary-600;
}

/* Active Indicator */
.active-indicator {
  @apply absolute bottom-0 left-1/2 -translate-x-1/2;
  @apply w-8 h-1 bg-primary-600 rounded-t-full;
  @apply transition-all duration-300;
}

/* Top position indicator */
.position-top .active-indicator {
  @apply bottom-auto top-0 rounded-b-full rounded-t-none;
}

/* ========================================
   Badge (if needed in future)
   ======================================== */
.tab-btn .badge {
  @apply absolute top-2 right-4;
  @apply min-w-[18px] h-[18px] px-1;
  @apply flex items-center justify-center;
  @apply bg-red-500 text-white;
  @apply text-[10px] font-bold rounded-full;
}

/* ========================================
   iPhone 安全区域适配
   ======================================== */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* ========================================
   Smooth Transitions
   ======================================== */
.tab-btn,
.tab-btn svg,
.tab-btn span {
  transition-property: color, background-color, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
