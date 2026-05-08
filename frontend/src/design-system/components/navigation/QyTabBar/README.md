# QyTabBar 标签栏

青羽风格标签栏组件，支持v-model双向绑定和徽章显示。

## 基本用法

\`\`\`vue
<template>
  <QyTabBar
    v-model="activeTab"
    :tabs="tabs"
    @tab-change="handleTabChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyTabBar } from '@/design-system/components'
import type { QyTabBarTab } from '@/design-system/components'

const activeTab = ref('home')

const tabs = ref<QyTabBarTab[]>([
  {
    key: 'home',
    label: '首页',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>'
  },
  {
    key: 'books',
    label: '书籍',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
    badge: 3
  },
  {
    key: 'profile',
    label: '我的',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'
  }
])

const handleTabChange = (tab, index) => {
  console.log('Tab changed to:', tab, index)
}
</script>
\`\`\`

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| tabs | 标签数组 | \`QyTabBarTab[]\` | **必填** |
| modelValue | 当前激活的标签key (v-model) | \`string\` | **必填** |
| position | 位置 | \`'bottom' \| 'top'\` | \`'bottom'\` |
| showIcons | 显示图标 | \`boolean\` | \`true\` |
| showLabels | 显示标签 | \`boolean\` | \`true\` |

### QyTabBarTab

\`\`\`typescript
interface QyTabBarTab {
  key: string          // 唯一标识符
  label: string        // 标签文本
  icon?: string        // 图标SVG（可选）
  badge?: number       // 徽章数字（可选）
  disabled?: boolean   // 禁用状态（默认false）
}
\`\`\`

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|---------|
| update:modelValue | 更新激活标签（v-model） | \`value: string\` |
| tab-click | 点击标签时触发 | \`(tab: QyTabBarTab, index: number)\` |
| tab-change | 标签切换时触发 | \`(tab: QyTabBarTab, index: number)\` |

## 位置模式

### bottom (默认)
- 固定在底部
- 带有顶部边框
- 适配iPhone安全区域

### top
- 固定在顶部
- 带有底部边框
- 适合页面内标签切换

## 样式特性

- **玻璃拟态**: \`bg-white/80 backdrop-blur-2xl\`
- **激活指示器**: 底部/顶部青色圆角条
- **平滑过渡**: \`transition-all duration-300\`
- **青色主题**: 激活状态使用 \`text-cyan-600\`

## 示例

### 带徽章的标签

\`\`\`vue
<template>
  <QyTabBar
    v-model="activeTab"
    :tabs="[
      { key: 'home', label: '首页', icon: '...' },
      { key: 'messages', label: '消息', icon: '...', badge: 5 }
    ]"
  />
</template>
\`\`\`

### 顶部位置

\`\`\`vue
<template>
  <QyTabBar
    v-model="activeTab"
    position="top"
    :tabs="tabs"
  />
</template>
\`\`\`

### 只显示图标

\`\`\`vue
<template>
  <QyTabBar
    v-model="activeTab"
    :show-labels="false"
    :tabs="tabs"
  />
</template>
\`\`\`

### 禁用某个标签

\`\`\`vue
<template>
  <QyTabBar
    v-model="activeTab"
    :tabs="[
      { key: 'home', label: '首页', icon: '...' },
      { key: 'settings', label: '设置', icon: '...', disabled: true }
    ]"
  />
</template>
\`\`\`

### 程序化切换标签

\`\`\`vue
<template>
  <div>
    <QyTabBar v-model="activeTab" :tabs="tabs" />
    <button @click="switchToBooks">切换到书籍</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('home')

const switchToBooks = () => {
  activeTab.value = 'books'
}
</script>
\`\`\`

## 与QyBottomDock的区别

| 特性 | QyTabBar | QyBottomDock |
|------|----------|--------------|
| 定位 | 固定全宽 | 底部浮动(桌面) |
| 激活指示器 | 圆角条 | 背景色 |
| 徽章 | 支持 | 支持 |
| 突出按钮 | 不支持 | 支持 |
| 使用场景 | 页面内标签切换 | 主导航 |

## 图标推荐

使用 Heroicons 或类似的图标库，参考 QyBottomDock 的图标示例。

## 性能优化

- 使用v-model而非手动事件处理
- 图标使用SVG字符串而非组件
- CSS动画使用GPU加速属性
