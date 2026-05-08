<template>
  <div
    :class="cardClasses"
    @click="handleCardClick"
  >
    <!-- Avatar Section -->
    <div class="flex justify-center mb-4">
      <div class="relative">
        <img
          :src="avatar"
          :alt="username"
          class="w-24 h-24 rounded-full ring-4 ring-primary-500/20 object-cover transition-all duration-300 group-hover:ring-primary-500/40"
        />
        
        <!-- Level Badge -->
        <div
          v-if="level !== undefined"
          class="absolute -bottom-2 -right-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
        >
          Lv{{ level }}
        </div>
      </div>
    </div>

    <!-- Username -->
    <h3 class="text-xl font-bold text-slate-800 text-center mb-2">{{ username }}</h3>

    <!-- Bio -->
    <p v-if="bio" class="text-sm text-slate-600 text-center mb-4 line-clamp-2">{{ bio }}</p>

    <!-- Stats -->
    <div v-if="followerCount !== undefined || followingCount !== undefined" class="flex justify-center gap-8 mb-4">
      <div v-if="followerCount !== undefined" class="text-center">
        <p class="text-xl font-bold text-slate-800">{{ formatNumber(followerCount) }}</p>
        <p class="text-xs text-slate-500">关注者</p>
      </div>
      <div v-if="followingCount !== undefined" class="text-center">
        <p class="text-xl font-bold text-slate-800">{{ formatNumber(followingCount) }}</p>
        <p class="text-xs text-slate-500">关注中</p>
      </div>
    </div>

    <!-- Follow Button -->
    <QyButton
      v-if="followAction"
      variant="primary"
      size="md"
      block
      @click.stop="handleFollow"
    >
      关注
    </QyButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import QyButton from '@/design-system/components/basic/QyButton'
import type { UserCardProps, UserCardEmits } from './types'

// Props
const props = withDefaults(defineProps<UserCardProps>(), {
  bio: '',
  followerCount: undefined,
  followingCount: undefined,
  level: undefined
})

// Emits
const emit = defineEmits<UserCardEmits>()

// Compute card classes
const cardClasses = computed(() => {
  return [
    // Base styles - glassmorphism
    'bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6',
    // Group for hover effects on children
    'group',
    // Transition
    'transition-all duration-500',
    // Hover effects
    'cursor-pointer hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1'
  ].join(' ')
})

// Format number (e.g., 1000 -> 1k)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Handle card click event
const handleCardClick = (event: MouseEvent) => {
  if (props.clickAction) {
    props.clickAction()
  }
  emit('click', event)
}

// Handle follow event
const handleFollow = () => {
  if (props.followAction) {
    props.followAction()
  }
  emit('follow')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
