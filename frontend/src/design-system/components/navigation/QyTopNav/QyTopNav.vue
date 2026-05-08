<template>
  <nav :class="navClasses">
    <!-- Logo Slot or Default Logo -->
    <div class="flex items-center gap-2">
      <slot name="logo">
        <span v-if="logo && !isImage(logo)" class="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
          {{ logo.charAt(0).toUpperCase() }}
        </span>
        <img
          v-else-if="logo && isImage(logo)"
          :src="logo"
          alt="Logo"
          class="w-8 h-8 rounded-lg"
        />
        <span v-else class="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
          Q
        </span>
        <div class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
          {{ logo && !isImage(logo) ? logo : 'Qingyu' }}
        </div>
      </slot>
    </div>

    <!-- PC Menu Links (hidden on mobile) -->
    <div v-if="links && links.length > 0" class="hidden md:flex space-x-3">
      <slot name="links">
        <button
          v-for="link in links"
          :key="link.path"
          :class="linkClasses(link.active)"
          @click="handleLinkClick(link)"
        >
          {{ link.label }}
        </button>
      </slot>
    </div>

    <!-- Actions Slot or Default Actions -->
    <slot name="actions">
      <!-- PC Actions -->
      <div class="hidden md:flex space-x-3">
        <!-- Search Button -->
        <button
          class="nav-btn group"
          aria-label="Search"
          @click="handleAction('search')"
        >
          <svg class="w-5 h-5 text-slate-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <!-- Notifications Button -->
        <button
          class="nav-btn group"
          aria-label="Notifications"
          @click="handleAction('notifications')"
        >
          <svg class="w-5 h-5 text-slate-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <!-- Avatar -->
        <div
          v-if="avatarUrl"
          class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-400 to-primary-300 p-[2px] cursor-pointer hover:scale-105 transition-transform"
          @click="handleAvatarClick"
        >
          <img
            :src="avatarUrl"
            class="w-full h-full rounded-full bg-white"
            alt="Avatar"
          />
        </div>
      </div>

      <!-- Mobile Avatar Only -->
      <div v-if="avatarUrl" class="md:hidden">
        <div
          class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-400 to-primary-300 p-[2px] cursor-pointer hover:scale-105 transition-transform"
          @click="handleAvatarClick"
        >
          <img
            :src="avatarUrl"
            class="w-full h-full rounded-full bg-white"
            alt="Avatar"
          />
        </div>
      </div>
    </slot>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyTopNavProps, QyTopNavEmits, QyTopNavLink, QyTopNavUserMenuItem } from './types'

// Props
const props = withDefaults(defineProps<QyTopNavProps>(), {
  logo: 'Qingyu',
  links: () => [],
  userMenu: () => [],
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  fixed: true
})

// Emits
const emit = defineEmits<QyTopNavEmits>()

// Navigation classes
const navClasses = computed(() => {
  const base = 'transition-all duration-300 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-white/30'
  return props.fixed ? `${base} fixed top-0 w-full z-50` : base
})

// Link button classes
const linkClasses = (active = false) => {
  return [
    'nav-btn',
    active && 'bg-primary-50 text-primary-600 border-primary-200'
  ].filter(Boolean).join(' ')
}

// Check if logo is an image URL
const isImage = (logo: string) => {
  return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(logo)
}

// Handle link click
const handleLinkClick = (link: QyTopNavLink) => {
  emit('link-click', link)
}

// Handle action button click
const handleAction = (action: string) => {
  const item: QyTopNavUserMenuItem = {
    label: action.charAt(0).toUpperCase() + action.slice(1),
    action
  }
  emit('user-menu-click', item)
}

// Handle avatar click
const handleAvatarClick = () => {
  emit('avatar-click')
}
</script>

<style scoped>
@reference "@/style.css";

.nav-btn {
  @apply p-2.5 rounded-xl bg-white/50 border border-white/50 shadow-sm;
  @apply hover:bg-white transition-all duration-300 active:scale-95;
}
</style>
