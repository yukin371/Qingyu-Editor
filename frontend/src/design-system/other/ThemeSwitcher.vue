<script setup lang="ts">
import { ref } from 'vue'
import {
  THEME_OPTIONS,
  currentThemeName,
  setTheme,
  type ThemeName,
} from '@/design-system/tokens/theme'

const themeOptions = THEME_OPTIONS

const currentTheme = ref(currentThemeName)

function handleThemeChange(themeName: ThemeName) {
  setTheme(themeName)
  currentTheme.value = themeName
}
</script>

<template>
  <div class="theme-switcher">
    <div class="flex items-center gap-2">
      <span class="text-sm text-slate-600">主题:</span>
      <div class="flex gap-2">
        <button
          v-for="option in themeOptions"
          :key="option.value"
          @click="handleThemeChange(option.value)"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            'border',
            currentTheme === option.value
              ? ['text-white', 'border-transparent']
              : ['bg-white/80', 'text-slate-600', 'border-white/50', 'hover:bg-white', 'hover:border-slate-200']
          ]"
          :style="
            currentTheme === option.value
              ? {
                  background: `linear-gradient(135deg, ${option.preview.accent} 0%, ${option.preview.base} 180%)`,
                }
              : undefined
          "
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/style.css";

.theme-switcher {
  @apply flex items-center;
}
</style>
