# QyTopNav 顶部导航栏

青羽风格顶部导航栏组件，支持响应式设计和自定义插槽。

## 基本用法

\`\`\`vue
<template>
  <QyTopNav
    :links="links"
    :avatar-url="avatarUrl"
    @link-click="handleLinkClick"
    @avatar-click="handleAvatarClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyTopNav } from '@/design-system/components'

const links = ref([
  { label: '首页', path: '/', active: true },
  { label: '书架', path: '/bookshelf' },
  { label: '发现', path: '/discover' }
])

const avatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')

const handleLinkClick = (link) => {
  console.log('Link clicked:', link)
}

const handleAvatarClick = () => {
  console.log('Avatar clicked')
}
</script>
\`\`\`

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| logo | Logo文字或图片URL | \`string\` | \`'Qingyu'\` |
| links | 导航链接数组 | \`QyTopNavLink[]\` | \`[]\` |
| userMenu | 用户菜单项（仅PC） | \`QyTopNavUserMenuItem[]\` | \`[]\` |
| avatarUrl | 头像URL | \`string\` | DiceBear默认头像 |
| fixed | 是否固定定位 | \`boolean\` | \`true\` |

### QyTopNavLink

\`\`\`typescript
interface QyTopNavLink {
  label: string      // 链接标签文本
  path: string       // 链接路径/路由
  active?: boolean   // 激活状态（默认false）
}
\`\`\`

### QyTopNavUserMenuItem

\`\`\`typescript
interface QyTopNavUserMenuItem {
  label: string      // 菜单项标签
  action: string     // 操作标识符
  icon?: string      // 图标（可选）
}
\`\`\`

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| logo | 自定义Logo区域 | - |
| links | 自定义链接区域 | - |
| actions | 自定义操作区域 | - |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|---------|
| link-click | 点击链接时触发 | \`link: QyTopNavLink\` |
| user-menu-click | 点击用户菜单项时触发 | \`item: QyTopNavUserMenuItem\` |
| avatar-click | 点击头像时触发 | - |

## 响应式设计

- **移动端**: 只显示Logo和头像
- **桌面端 (md+)**: 显示完整导航链接和操作按钮

## 样式特性

- 玻璃拟态效果: \`bg-white/60 backdrop-blur-md\`
- 平滑过渡动画: \`transition-all duration-300\`
- 悬停效果: 按钮上浮和缩放
- 青色主题: \`shadow-cyan-500/20\`

## 示例

### 自定义Logo

\`\`\`vue
<template>
  <QyTopNav logo="MyApp">
    <template #logo>
      <img src="/logo.png" alt="Logo" class="h-8" />
    </template>
  </QyTopNav>
</template>
\`\`\`

### 自定义操作区域

\`\`\`vue
<template>
  <QyTopNav>
    <template #actions>
      <QyButton variant="primary">登录</QyButton>
    </template>
  </QyTopNav>
</template>
\`\`\`

### 非固定定位

\`\`\`vue
<template>
  <QyTopNav :fixed="false" />
</template>
\`\`\`
