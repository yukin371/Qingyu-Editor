<script setup lang="ts">
import { ref } from 'vue'
import { setTheme, currentThemeName, type ThemeName } from '@/design-system/tokens/theme'

// 主题选项
const themeOptions: { label: string; value: ThemeName; color: string }[] = [
  { label: '青羽', value: 'qingyu', color: 'from-primary-500 to-secondary-600' },
  { label: '紫粉', value: 'berry', color: 'from-purple-500 to-pink-600' },
  { label: '森林', value: 'forest', color: 'from-green-600 to-primary-600' },
]

const currentTheme = ref(currentThemeName)

// 切换主题
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
              ? ['bg-gradient-to-r', 'text-white', 'border-transparent', option.color]
              : ['bg-white/80', 'text-slate-600', 'border-white/50', 'hover:bg-white', 'hover:border-slate-200']
          ]"
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
