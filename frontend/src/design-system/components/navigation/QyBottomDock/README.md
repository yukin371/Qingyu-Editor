# QyBottomDock 底部 Dock 导航

青羽风格底部Dock导航组件，支持移动端和桌面端响应式设计。

## 基本用法

\`\`\`vue
<template>
  <QyBottomDock
    :items="dockItems"
    @item-click="handleItemClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyBottomDock } from '@/design-system/components'
import type { QyBottomDockItem } from '@/design-system/components'

const dockItems = ref<QyBottomDockItem[]>([
  {
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
    label: '首页',
    active: true
  },
  {
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>',
    label: '书架'
  },
  {
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>',
    label: '发现',
    highlight: true
  }
])

const handleItemClick = (item, index) => {
  console.log('Item clicked:', item, index)
}
</script>
\`\`\`

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| items | Dock项数组 | \`QyBottomDockItem[]\` | **必填** |
| position | 位置模式 | \`'bottom' \| 'floating'\` | \`'floating'\` |
| showLabels | 移动端显示标签 | \`boolean\` | \`true\` |

### QyBottomDockItem

\`\`\`typescript
interface QyBottomDockItem {
  icon: string          // 图标 SVG 字符串
  label: string         // 标签文本
  active?: boolean      // 激活状态（默认false）
  highlight?: boolean   // 是否突出显示（默认false）
  badge?: number        // 徽章数字
  disabled?: boolean    // 禁用状态（默认false）
}
\`\`\`

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|---------|
| item-click | 点击项时触发 | \`(item: QyBottomDockItem, index: number)\` |

## 响应式设计

- **移动端**: 全宽底部导航栏，显示图标和标签
- **桌面端 (md+)**: 浮动圆形Dock，只显示图标

## Position 模式

### floating (默认)
- 移动端: 全宽底部
- 桌面端: 浮动Dock (距离底部8px，居中)

### bottom
- 始终全宽底部导航栏

## 样式特性

- **玻璃拟态**: \`bg-white/80 backdrop-blur-2xl\`
- **悬停动画**: 上浮效果 \`translateY(-16px)\`
- **突出按钮**: 放大1.1倍，青色光晕
- **激活状态**: 青色背景 \`bg-cyan-100\`
- **平滑过渡**: \`transition-all duration-300\`

## 示例

### 带徽章的项

\`\`\`vue
<template>
  <QyBottomDock
    :items="[
      {
        icon: '...',
        label: '消息',
        badge: 5
      }
    ]"
  />
</template>
\`\`\`

### 突出显示主操作

\`\`\`vue
<template>
  <QyBottomDock
    :items="[
      { icon: '...', label: '首页' },
      { icon: '...', label: '书架' },
      { icon: '...', label: '添加', highlight: true },
      { icon: '...', label: '我的' }
    ]"
  />
</template>
\`\`\`

### 禁用某项

\`\`\`vue
<template>
  <QyBottomDock
    :items="[
      { icon: '...', label: '首页' },
      { icon: '...', label: '设置', disabled: true }
    ]"
  />
</template>
\`\`\`

### 底部固定模式

\`\`\`vue
<template>
  <QyBottomDock
    position="bottom"
    :items="dockItems"
  />
</template>
\`\`\`

## 图标推荐

使用 Heroicons 或类似的图标库：

\`\`\`typescript
// 首页
'<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>'

// 书架
'<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>'

// 发现
'<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" /></svg>'

// 我的
'<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'
\`\`\`
