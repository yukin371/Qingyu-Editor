<template>
  <article :class="cardClasses" @click="handleClick">
    <div class="qy-book-card__cover">
      <div class="qy-book-card__cover-surface" role="presentation">
        <img v-if="cover" :src="cover" :alt="title" class="qy-book-card__cover-image" />
        <div v-else class="qy-book-card__cover-fallback">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="qy-book-card__cover-icon"
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
        <span class="qy-book-card__cover-glare" aria-hidden="true"></span>
        <span class="qy-book-card__cover-spine" aria-hidden="true"></span>
      </div>
      <div v-if="status" class="qy-book-card__status">
        <span :class="statusBadgeClasses">
          {{ statusText }}
        </span>
      </div>
    </div>

    <div class="qy-book-card__body">
      <div class="qy-book-card__heading">
        <h3 class="qy-book-card__title line-clamp-1">{{ title }}</h3>
        <p class="qy-book-card__author">{{ author }}</p>
      </div>

      <div v-if="tags && tags.length > 0" class="qy-book-card__tag-group">
        <span v-for="(tag, index) in tags.slice(0, 3)" :key="index" class="qy-book-card__tag">
          {{ tag }}
        </span>
        <span v-if="tags.length > 3" class="qy-book-card__tag qy-book-card__tag--more">
          +{{ tags.length - 3 }}
        </span>
      </div>

      <div v-if="rating !== undefined" class="qy-book-card__rating">
        <span class="qy-book-card__stars">{{ starDisplay }}</span>
        <span v-if="rating > 0" class="qy-book-card__score">{{ rating.toFixed(1) }}</span>
      </div>

      <p v-if="description" class="qy-book-card__description line-clamp-2">{{ description }}</p>

      <div v-if="readProgress !== undefined" class="qy-book-card__progress">
        <div class="qy-book-card__progress-label">
          <span>阅读进度</span>
          <span>{{ readProgress }}%</span>
        </div>
        <div class="qy-book-card__progress-track">
          <div class="qy-book-card__progress-fill" :style="{ width: readProgress + '%' }"></div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BookCardProps, BookCardEmits } from './types'

// Props
const props = withDefaults(defineProps<BookCardProps>(), {
  cover: '',
  description: '',
  rating: 0,
  tags: () => [],
  readProgress: undefined,
  status: undefined,
})

// Emits
const emit = defineEmits<BookCardEmits>()

// Compute card classes
const cardClasses = computed(() => {
  return [
    'qy-book-card rounded-3xl p-5',
    'group',
    'overflow-hidden',
    'transition-all duration-500',
    'cursor-pointer',
    'hover:-translate-y-0.5',
    'hover:shadow-[0_30px_60px_-24px_rgba(15,23,42,0.8)]',
  ].join(' ')
})

// Status badge classes
const statusBadgeClasses = computed(() => {
  const base = 'px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm'
  const statusStyles = {
    reading: 'bg-primary-500/90 text-white',
    completed: 'bg-green-500/90 text-white',
    planned: 'bg-slate-400/90 text-white',
  }
  return `${base} ${statusStyles[props.status || 'planned']}`
})

// Status text
const statusText = computed(() => {
  const statusMap = {
    reading: '阅读中',
    completed: '已完成',
    planned: '计划中',
  }
  return statusMap[props.status || 'planned']
})

// Star display
const starDisplay = computed(() => {
  if (!props.rating || props.rating === 0) return '☆☆☆☆☆'

  const fullStars = Math.floor(props.rating)
  const hasHalfStar = props.rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars)
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
.qy-book-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qy-book-card__cover {
  position: relative;
}

.qy-book-card__cover-surface {
  position: relative;
  border-radius: 2rem;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.05), rgba(15, 23, 42, 0.03));
  border: 1px solid rgba(15, 23, 42, 0.08);
  min-height: 192px;
}

.qy-book-card__cover-image {
  width: 100%;
  height: 192px;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.group:hover .qy-book-card__cover-image {
  transform: scale(1.05);
}

.qy-book-card__cover-fallback {
  width: 100%;
  height: 192px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(15, 23, 42, 0.4);
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.12), rgba(203, 213, 225, 0.25));
}

.qy-book-card__cover-icon {
  width: 56px;
  height: 56px;
}

.qy-book-card__cover-glare {
  position: absolute;
  inset: 12%;
  border-radius: 1.5rem;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.65), transparent 55%);
  pointer-events: none;
}

.qy-book-card__cover-spine {
  position: absolute;
  bottom: -6px;
  right: 10px;
  width: 40px;
  height: 100%;
  border-radius: 24px;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.05), rgba(15, 23, 42, 0.4));
  opacity: 0.6;
  pointer-events: none;
}

.qy-book-card__status {
  position: absolute;
  top: 12px;
  right: 12px;
}

.qy-book-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.qy-book-card__heading {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.qy-book-card__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.qy-book-card__author {
  margin: 0;
  font-size: 0.9rem;
  color: #475569;
}

.qy-book-card__tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.qy-book-card__tag {
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.15);
  color: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.35);
  backdrop-filter: blur(4px);
}

.qy-book-card__tag--more {
  background: rgba(15, 23, 42, 0.08);
  border-color: rgba(15, 23, 42, 0.15);
  color: #475569;
}

.qy-book-card__rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #475569;
}

.qy-book-card__stars {
  letter-spacing: 0.3em;
  font-size: 0.9rem;
  color: #f59e0b;
}

.qy-book-card__score {
  font-weight: 600;
  color: #0f172a;
}

.qy-book-card__description {
  margin: 0;
  font-size: 0.95rem;
  color: #475569;
}

.qy-book-card__progress {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.qy-book-card__progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #64748b;
}

.qy-book-card__progress-track {
  width: 100%;
  height: 6px;
  background: rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.qy-book-card__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #6366f1);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
