<template>
  <div :class="itemClasses">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <img
        :src="avatar"
        :alt="username"
        class="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/20"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Username and Timestamp -->
      <div class="flex items-center gap-2 mb-1">
        <span class="font-semibold text-slate-800 text-sm">{{ username }}</span>
        <span class="text-xs text-slate-500">{{ timestamp }}</span>
      </div>

      <!-- Comment Text -->
      <p class="text-sm text-slate-700 mb-3 leading-relaxed">{{ content }}</p>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <!-- Like Button -->
        <button
          v-if="likeAction !== undefined"
          :class="likeButtonClasses"
          @click="handleLike"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            :class="isLiked ? 'fill-current' : 'fill-none'"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span v-if="likeCount !== undefined" class="ml-1 text-xs">{{ likeCount }}</span>
        </button>

        <!-- Reply Button -->
        <button
          v-if="replyAction !== undefined"
          :class="replyButtonClasses"
          @click="handleReply"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
          <span class="ml-1 text-xs">回复</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CommentItemProps, CommentItemEmits } from './types'

// Props
const props = withDefaults(defineProps<CommentItemProps>(), {
  likeCount: undefined,
  replyAction: undefined,
  likeAction: undefined,
  isLiked: false
})

// Emits
const emit = defineEmits<CommentItemEmits>()

// Compute item classes
const itemClasses = computed(() => {
  return [
    // Base layout
    'flex gap-3',
    // Glassmorphism background
    'bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4',
    // Transition
    'transition-all duration-300',
    // Hover effect
    'hover:shadow-md hover:shadow-primary-500/5 hover:bg-white/70'
  ].join(' ')
})

// Like button classes
const likeButtonClasses = computed(() => {
  const base = 'inline-flex items-center transition-colors duration-200'
  const liked = props.isLiked
    ? 'text-red-500 hover:text-red-600'
    : 'text-slate-500 hover:text-primary-600'
  return `${base} ${liked}`
})

// Reply button classes
const replyButtonClasses = computed(() => {
  return [
    'inline-flex items-center',
    'text-slate-500 hover:text-primary-600',
    'transition-colors duration-200'
  ].join(' ')
})

// Handle like event
const handleLike = () => {
  if (props.likeAction) {
    props.likeAction()
  }
  emit('like')
}

// Handle reply event
const handleReply = () => {
  if (props.replyAction) {
    props.replyAction()
  }
  emit('reply')
}
</script>
