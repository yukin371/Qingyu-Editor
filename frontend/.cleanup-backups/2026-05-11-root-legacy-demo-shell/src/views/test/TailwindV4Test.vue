<!--
  Tailwind v4 CSS-First 配置测试页面

  用于验证设计令牌是否正确加载
-->
<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <!-- 标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 mb-2">
        Tailwind v4 CSS-First 配置测试
      </h1>
      <p class="text-slate-600">
        验证设计令牌是否正确加载
      </p>
    </div>

    <!-- 颜色系统测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">品牌色测试</h2>
      <div class="flex flex-wrap gap-4">
        <!-- 主色 -->
        <div v-for="shade in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]" :key="shade"
             class="w-20 h-20 rounded-xl flex items-center justify-center text-sm font-medium"
             :class="`bg-primary-${shade}`">
          {{ shade }}
        </div>
      </div>
    </section>

    <!-- 辅助色测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">辅助色测试</h2>
      <div class="flex flex-wrap gap-4">
        <div v-for="shade in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]" :key="shade"
             class="w-20 h-20 rounded-xl flex items-center justify-center text-sm font-medium"
             :class="`bg-secondary-${shade}`">
          {{ shade }}
        </div>
      </div>
    </section>

    <!-- 功能色测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">功能色测试</h2>
      <div class="grid grid-cols-4 gap-4">
        <!-- 成功 -->
        <div class="space-y-2">
          <p class="text-sm font-medium text-slate-700">Success</p>
          <div v-for="shade in [100, 500, 700]" :key="shade"
               class="h-12 rounded-lg flex items-center justify-center text-sm"
               :class="`bg-success-${shade}`">
            {{ shade }}
          </div>
        </div>
        <!-- 警告 -->
        <div class="space-y-2">
          <p class="text-sm font-medium text-slate-700">Warning</p>
          <div v-for="shade in [100, 500, 700]" :key="shade"
               class="h-12 rounded-lg flex items-center justify-center text-sm"
               :class="`bg-warning-${shade}`">
            {{ shade }}
          </div>
        </div>
        <!-- 危险 -->
        <div class="space-y-2">
          <p class="text-sm font-medium text-slate-700">Danger</p>
          <div v-for="shade in [100, 500, 700]" :key="shade"
               class="h-12 rounded-lg flex items-center justify-center text-sm"
               :class="`bg-danger-${shade}`">
            {{ shade }}
          </div>
        </div>
        <!-- 信息 -->
        <div class="space-y-2">
          <p class="text-sm font-medium text-slate-700">Info</p>
          <div v-for="shade in [100, 500, 700]" :key="shade"
               class="h-12 rounded-lg flex items-center justify-center text-sm"
               :class="`bg-info-${shade}`">
            {{ shade }}
          </div>
        </div>
      </div>
    </section>

    <!-- 圆角系统测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">圆角系统测试</h2>
      <div class="flex flex-wrap items-end gap-4">
        <div v-for="radius in ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']" :key="radius"
             class="w-20 h-20 bg-primary-500 flex items-center justify-center text-white text-sm font-medium"
             :class="`rounded-${radius}`">
          {{ radius }}
        </div>
      </div>
    </section>

    <!-- 阴影系统测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">阴影系统测试</h2>
      <div class="flex flex-wrap gap-4">
        <div v-for="shadow in ['sm', 'md', 'lg', 'xl', '2xl']" :key="shadow"
             class="w-32 h-32 bg-white rounded-xl p-4 flex items-center justify-center"
             :class="`shadow-${shadow}`">
          {{ shadow }}
        </div>
        <!-- 品牌阴影 -->
        <div class="w-32 h-32 bg-white rounded-xl p-4 flex items-center justify-center shadow-glow">
          glow
        </div>
      </div>
    </section>

    <!-- 玻璃拟态效果测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">玻璃拟态效果测试</h2>
      <div class="flex flex-wrap gap-4">
        <div class="glass-card w-64 h-32 p-6">
          <p class="text-slate-800 font-medium">glass-card</p>
          <p class="text-slate-600 text-sm">标准玻璃卡片效果</p>
        </div>
        <div class="glass-card-light w-64 h-32 p-6">
          <p class="text-slate-800 font-medium">glass-card-light</p>
          <p class="text-slate-600 text-sm">轻量玻璃效果</p>
        </div>
        <div class="glass-nav w-64 h-32 p-6">
          <p class="text-slate-800 font-medium">glass-nav</p>
          <p class="text-slate-600 text-sm">导航栏玻璃效果</p>
        </div>
      </div>
    </section>

    <!-- 按钮样式测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">按钮样式测试</h2>
      <div class="flex flex-wrap gap-4">
        <button class="btn-primary">
          主要按钮
        </button>
        <button class="btn-secondary">
          次要按钮
        </button>
        <button class="btn-primary hover-lift">
          悬停上浮
        </button>
        <button class="btn-primary hover-scale">
          悬停放大
        </button>
      </div>
    </section>

    <!-- 渐变效果测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">渐变效果测试</h2>
      <div class="flex flex-wrap gap-4">
        <div class="gradient-primary w-48 h-24 rounded-xl flex items-center justify-center text-white font-medium">
          gradient-primary
        </div>
        <div class="gradient-soft w-48 h-24 rounded-xl flex items-center justify-center text-white font-medium">
          gradient-soft
        </div>
        <div class="w-48 h-24 rounded-xl flex items-center justify-center font-medium gradient-text">
          gradient-text
        </div>
      </div>
    </section>

    <!-- 间距系统测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">间距系统测试</h2>
      <div class="flex flex-wrap items-center gap-2">
        <div v-for="space in [1, 2, 3, 4, 6, 8]" :key="space"
             class="bg-primary-500 text-white px-4 py-2 rounded-md"
             :style="{ marginRight: `var(--spacing-${space})` }">
          spacing-{{ space }}
        </div>
      </div>
    </section>

    <!-- 动画测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">动画测试</h2>
      <div class="flex flex-wrap gap-4">
        <div class="w-20 h-20 bg-primary-500 rounded-xl flex items-center justify-center text-white animate-[float_7s_ease-in-out_infinite]">
          float
        </div>
        <div class="w-20 h-20 bg-secondary-500 rounded-xl flex items-center justify-center text-white hover-lift">
          hover-lift
        </div>
        <div class="w-20 h-20 bg-success-500 rounded-xl flex items-center justify-center text-white hover-scale">
          hover-scale
        </div>
      </div>
    </section>

    <!-- 主题切换测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">主题切换测试</h2>
      <div class="flex gap-4">
        <button
          @click="setTheme('qingyu')"
          class="px-6 py-3 rounded-xl font-medium transition-all duration-300"
          :class="currentTheme === 'qingyu' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50'">
          青羽主题
        </button>
        <button
          @click="setTheme('berry')"
          class="px-6 py-3 rounded-xl font-medium transition-all duration-300"
          :class="currentTheme === 'berry' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50'">
          紫粉主题
        </button>
        <button
          @click="setTheme('forest')"
          class="px-6 py-3 rounded-xl font-medium transition-all duration-300"
          :class="currentTheme === 'forest' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50'">
          森林主题
        </button>
      </div>
      <p class="mt-4 text-slate-600">
        当前主题: {{ currentTheme }}
      </p>
    </section>

    <!-- CSS 变量显示 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">CSS 变量测试</h2>
      <div class="glass-card p-6 space-y-2">
        <p class="text-sm">
          <code class="bg-slate-100 px-2 py-1 rounded">--color-primary-500</code>:
          <span class="inline-block w-4 h-4 rounded ml-2" style="background: var(--color-primary-500)"></span>
        </p>
        <p class="text-sm">
          <code class="bg-slate-100 px-2 py-1 rounded">--color-secondary-500</code>:
          <span class="inline-block w-4 h-4 rounded ml-2" style="background: var(--color-secondary-500)"></span>
        </p>
        <p class="text-sm">
          <code class="bg-slate-100 px-2 py-1 rounded">--radius-xl</code>: {{ getComputedStyle(document.documentElement).getPropertyValue('--radius-xl') }}
        </p>
        <p class="text-sm">
          <code class="bg-slate-100 px-2 py-1 rounded">--shadow-glow</code>: {{ getComputedStyle(document.documentElement).getPropertyValue('--shadow-glow') }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { setTheme as setThemeSystem, type ThemeName } from '@/design-system/tokens/theme'

const currentTheme = ref<ThemeName>('qingyu')

function setTheme(theme: ThemeName) {
  currentTheme.value = theme
  setThemeSystem(theme)
}

// Expose browser APIs for template usage
const getComputedStyle = window.getComputedStyle.bind(window)
const document = window.document

onMounted(() => {
  // 从 localStorage 读取保存的主题
  const saved = localStorage.getItem('qingyu-theme')
  if (saved && (saved === 'qingyu' || saved === 'berry' || saved === 'forest')) {
    currentTheme.value = saved as ThemeName
  }
})
</script>
