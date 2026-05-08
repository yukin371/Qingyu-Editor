<script setup lang="ts">
/**
 * ThemePreview 组件
 *
 * 展示所有可用主题的预览效果
 */

import { ref, computed } from 'vue'
import { setTheme, themes, type ThemeName } from '../../tokens/theme'
import type { ThemePreviewProps } from './types'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'

// Props
const props = withDefaults(defineProps<ThemePreviewProps>(), {
  showApplyButton: true,
  layout: 'grid',
})

// 当前选中的主题
const selectedTheme = ref<ThemeName>('qingyu')

// 主题显示名称映射
const themeDisplayNames: Record<ThemeName, string> = {
  qingyu: '青羽',
  berry: '紫粉',
  forest: '森林',
}

// 主题列表
const themeList = Object.entries(themes).map(([name, theme]) => ({
  name: name as ThemeName,
  displayName: themeDisplayNames[name as ThemeName],
  primary: theme.primary[500],
  secondary: theme.secondary[500],
  gradientFrom: theme.gradient.from,
  gradientTo: theme.gradient.to,
}))

// 使用 CVA 定义容器变体
const containerVariants = cva(
  'gap-4',
  {
    variants: {
      layout: {
        grid: 'grid grid-cols-1 md:grid-cols-3',
        horizontal: 'flex flex-row',
      },
    },
    defaultVariants: {
      layout: 'grid',
    },
  }
)

// 使用 CVA 定义卡片变体
const cardVariants = cva(
  'relative overflow-hidden rounded-xl p-6 shadow-lg transition-all duration-200',
  {
    variants: {
      selected: {
        true: 'ring-4 ring-offset-2',
        false: 'hover:scale-105 hover:shadow-xl',
      },
    },
  }
)

// 计算容器类名
const containerClasses = computed(() => {
  return cn(
    containerVariants({
      layout: props.layout,
    })
  )
})

// 计算卡片类名
const getCardClasses = (themeName: ThemeName) => {
  const isSelected = selectedTheme.value === themeName

  return cn(
    cardVariants({
      selected: isSelected,
    }),
    isSelected && 'ring-primary-500'
  )
}

// 处理主题应用
const handleApplyTheme = (themeName: ThemeName) => {
  selectedTheme.value = themeName
  setTheme(themeName)
}
</script>

<template>
  <div :class="containerClasses">
    <!-- 主题卡片 -->
    <div
      v-for="theme in themeList"
      :key="theme.name"
      :class="getCardClasses(theme.name)"
      :style="{
        background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
      }"
    >
      <!-- 主题名称 -->
      <h3 class="mb-4 text-xl font-bold text-white">
        {{ theme.displayName }}
      </h3>

      <!-- 颜色预览 -->
      <div class="mb-4 flex gap-2">
        <!-- Primary 颜色 -->
        <div
          class="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-xs font-medium text-white"
          :style="{ backgroundColor: theme.primary }"
        >
          主色
        </div>

        <!-- Secondary 颜色 -->
        <div
          class="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-xs font-medium text-white"
          :style="{ backgroundColor: theme.secondary }"
        >
          辅色
        </div>
      </div>

      <!-- 颜色示例 -->
      <div class="mb-4 space-y-2">
        <!-- 按钮 -->
        <button
          class="w-full rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          :style="{ backgroundColor: theme.primary }"
        >
          按钮
        </button>

        <!-- 输入框 -->
        <input
          type="text"
          placeholder="输入框"
          class="w-full rounded-lg border-2 bg-white/20 px-4 py-2 text-sm text-white placeholder-white/60 backdrop-blur-sm"
          :style="{ borderColor: theme.secondary }"
        />
      </div>

      <!-- 应用按钮 -->
      <button
        v-if="showApplyButton"
        @click="handleApplyTheme(theme.name)"
        class="w-full rounded-lg bg-white px-4 py-2 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50"
        :class="{
          'opacity-50 cursor-not-allowed': selectedTheme === theme.name,
        }"
        :disabled="selectedTheme === theme.name"
      >
        {{ selectedTheme === theme.name ? '当前主题' : '应用主题' }}
      </button>

      <!-- 选中标记 -->
      <div
        v-if="selectedTheme === theme.name"
        class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white"
      >
        <svg
          class="h-5 w-5 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
