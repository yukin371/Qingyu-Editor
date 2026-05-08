<template>
  <div :class="containerClasses" @click="handleClick">
    <div :class="frameClasses">
      <div class="qy-book-cover__spine" aria-hidden="true"></div>
      <img v-if="src" :src="src" :alt="title" :class="imageClasses" />
      <div v-else :class="fallbackClasses">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :class="iconSize"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <span class="qy-book-cover__shine" aria-hidden="true"></span>
      <!-- Glassmorphism border overlay -->
      <div :class="overlayClasses"></div>
    </div>

    <!-- Title below cover (optional) -->
    <p v-if="showTitle" :class="titleClasses">{{ title }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BookCoverProps, BookCoverEmits } from './types'

// Props
const props = withDefaults(defineProps<BookCoverProps>(), {
  size: 'md',
  shadow: true,
})

// Emits
const emit = defineEmits<BookCoverEmits>()

// Size configurations
const sizeConfig = computed(() => {
  const sizes = {
    sm: {
      width: 'w-24',
      height: 'h-32',
      rounded: 'rounded-lg',
      icon: 'h-8 w-8',
    },
    md: {
      width: 'w-32',
      height: 'h-44',
      rounded: 'rounded-xl',
      icon: 'h-12 w-12',
    },
    lg: {
      width: 'w-48',
      height: 'h-64',
      rounded: 'rounded-2xl',
      icon: 'h-16 w-16',
    },
  }
  return sizes[props.size]
})

// Container classes
const containerClasses = computed(() => {
  return [
    'qy-book-cover inline-block transition-all duration-300',
    'space-y-2 cursor-pointer group',
  ].join(' ')
})

// Frame classes
const frameClasses = computed(() => {
  return [
    'qy-book-cover__frame relative overflow-hidden',
    'bg-white/70 backdrop-blur-xl border border-white/60',
    sizeConfig.value.width,
    sizeConfig.value.height,
    sizeConfig.value.rounded,
    'transition-all duration-300',
    // Shadow
    props.shadow && 'shadow-md',
    // Hover effects
    'group-hover:shadow-2xl group-hover:shadow-primary-500/20',
  ]
    .filter(Boolean)
    .join(' ')
})

// Image classes
const imageClasses = computed(() => {
  return [
    'w-full h-full object-cover',
    'transition-transform duration-500',
    'group-hover:scale-110',
  ].join(' ')
})

// Fallback classes
const fallbackClasses = computed(() => {
  return [
    'qy-book-cover__fallback flex items-center justify-center',
    'w-full h-full',
    'bg-gradient-to-br from-slate-100 to-slate-200',
    'text-slate-400',
  ].join(' ')
})

// Overlay classes (glassmorphism effect)
const overlayClasses = computed(() => {
  return [
    'qy-book-cover__overlay absolute inset-0 pointer-events-none',
    'bg-gradient-to-br from-primary-500/5 to-secondary-500/5',
  ].join(' ')
})

// Icon size
const iconSize = computed(() => sizeConfig.value.icon)

// Show title (only for small size)
const showTitle = computed(() => props.size === 'sm')

// Title classes
const titleClasses = computed(() => {
  return [
    'qy-book-cover__title mt-2 text-xs font-medium text-slate-700 text-center',
    'line-clamp-1',
    'max-w-full',
  ].join(' ')
})

// Handle click event
const handleClick = (event: MouseEvent) => {
  if (props.clickAction) {
    props.clickAction()
  }
  emit('click', event)
}
</script>

<style scoped>
.qy-book-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.qy-book-cover__frame {
  position: relative;
  border-radius: inherit;
  overflow: hidden;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.18);
}

.qy-book-cover__spine {
  position: absolute;
  inset: 12% auto auto 0;
  width: 18px;
  height: 76%;
  border-radius: 12px 0 0 12px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.4));
  opacity: 0.8;
  pointer-events: none;
}

.qy-book-cover__shine {
  position: absolute;
  top: 10%;
  left: 8%;
  width: 70%;
  height: 80%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.45), transparent 55%);
  filter: blur(4px);
  opacity: 0.75;
  pointer-events: none;
}

.qy-book-cover__fallback {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.05), rgba(128, 142, 155, 0.18));
  color: rgba(15, 23, 42, 0.5);
  font-size: 1rem;
  border-radius: inherit;
}

.qy-book-cover__title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  color: #0f172a;
  letter-spacing: 0.1rem;
  text-transform: uppercase;
}

.qy-book-cover__overlay {
  border-radius: inherit;
  opacity: 0.9;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
