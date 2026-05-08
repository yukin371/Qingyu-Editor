# Qingyu Component Library

青羽风格组件库 - 基于 Vue 3 + TypeScript + Tailwind CSS

## 特性

- 🎨 **青蓝渐变主题** - 采用 cyan-blue 品牌色系
- 🪟 **玻璃拟态设计** - Glassmorphism 效果带来现代感
- 📱 **响应式布局** - 完美适配移动端和桌面端
- ⚡️ **高性能** - 轻量级组件,快速渲染
- 🔒 **完整的 TypeScript 类型** - 类型安全,开发体验优秀
- 🎯 **简单易用** - 清晰的 API 和丰富的文档

## 设计理念

Qingyu 组件库遵循以下设计原则:

1. **青蓝美学** - 采用 cyan-600 到 blue-600 的渐变作为品牌色
2. **玻璃拟态** - 使用 `bg-white/60 backdrop-blur-xl` 创造现代感
3. **大圆角** - 使用 `rounded-xl/2xl/3xl` 营造柔和视觉
4. **流畅动画** - `duration-300/500` 过渡动画,交互自然
5. **品牌阴影** - `shadow-cyan-500/20` 彩色投影增强品牌感

## 安装

组件库已集成到项目中,无需额外安装:

```bash
# 组件已存在于 src/design-system 目录
# 直接导入使用即可
```

## 快速开始

### 导入组件

```vue
<template>
  <div class="p-6 space-y-4">
    <QyButton variant="primary">点击我</QyButton>
    
    <QyCard hoverable>
      <template #title>卡片标题</template>
      <p>这是卡片内容</p>
    </QyCard>
    
    <QyInput v-model="text" placeholder="输入内容..." />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyButton, QyCard, QyInput } from '@/design-system/components'

const text = ref('')
</script>
```

### 按需导入

```typescript
// 导入单个组件
import { QyButton } from '@/design-system/components/basic/QyButton'
import { QyCard } from '@/design-system/components/basic/QyCard'

// 或导入所有基础组件
import { QyButton, QyCard, QyInput, QyBadge, QyAvatar } from '@/design-system/components'

// 导入类型
import type { QyButtonProps, QyCardProps } from '@/design-system/components'
```

## 组件列表

### 基础组件 (Phase 1)

| 组件 | 说明 | 状态 |
|------|------|------|
| [QyButton](./components/basic/QyButton/README.md) | 按钮 - 多种变体和尺寸 | ✅ 完成 |
| [QyCard](./components/basic/QyCard/README.md) | 卡片 - 玻璃拟态效果 | ✅ 完成 |
| [QyInput](./components/basic/QyInput/README.md) | 输入框 - 支持文本/搜索/多行 | ✅ 完成 |
| [QyBadge](./components/basic/QyBadge/README.md) | 徽章 - 计数/状态/圆点 | ✅ 完成 |
| [QyAvatar](./components/basic/QyAvatar/README.md) | 头像 - 图片/文本/群组 | ✅ 完成 |

### 导航组件 (Phase 2)

| 组件 | 说明 | 状态 |
|------|------|------|
| [QyTopNav](./components/navigation/QyTopNav/README.md) | 顶部导航 - 响应式设计 | ✅ 完成 |
| [QyBottomDock](./components/navigation/QyBottomDock/README.md) | 底部 Dock - 浮动效果 | ✅ 完成 |
| [QyTabBar](./components/navigation/QyTabBar/README.md) | 标签栏 - 移动端优化 | ✅ 完成 |

### 其他组件 (开发中)

以下组件正在开发中,计划在 Phase 3 完成:

- **反馈组件**: QyModal, QyLoading, QyEmpty, QyAlert
- **表单组件**: QyForm, QySelect, QySwitch, QySlider, QyDatePicker
- **数据展示**: QyTable, QyList, QyPagination, QyTabs
- **布局组件**: QyContainer, QyRow, QyCol
- **其他**: QyDivider, QySkeleton, QyTag

## 设计规范

### 色彩系统

```css
/* 品牌色 - 青蓝渐变 */
--brand-primary: from-cyan-600 to-blue-600
--brand-light: from-cyan-400 to-blue-500

/* 状态色 */
--color-success: green-500
--color-danger: red-500
--color-warning: yellow-500
--color-info: blue-500
```

### 玻璃拟态

```css
/* 轻量级 */
bg-white/40 backdrop-blur-sm

/* 标准级 */
bg-white/60 backdrop-blur-md

/* 重量级 */
bg-white/80 backdrop-blur-xl

/* 边框 */
border border-white/50
```

### 圆角系统

```css
rounded-xl    /* 12px - 按钮、输入框 */
rounded-2xl   /* 16px - 卡片 */
rounded-3xl   /* 24px - 大容器 */
rounded-full  /* 圆形 - 徽章、头像 */
```

### 阴影系统

```css
/* 品牌阴影 */
shadow-cyan-500/20    /* 轻量 */
shadow-cyan-500/30    /* 标准 */

/* 悬停阴影 */
hover:shadow-xl hover:shadow-cyan-500/10

/* 自定义阴影 */
shadow-[0_8px_32px_rgba(0,0,0,0.12)]
```

### 动画标准

```css
/* 过渡时长 */
duration-300  /* 快速 - 按钮悬停 */
duration-500  /* 慢速 - 卡片动画 */

/* 缓动函数 */
ease-out      /* 标准缓动 */
cubic-bezier(0.25, 1, 0.5, 1)  /* iOS 风格 */

/* 悬停效果 */
hover:-translate-y-1    /* 上浮 */
hover:scale-105         /* 放大 */
```

## 文档

- 📖 [快速开始](../../docs/guides/qingyu-components-quickstart.md)
- 📚 [API 参考](../../docs/api/qingyu-components-api.md)
- 🔄 [迁移指南](../../docs/guides/qingyu-migration-guide.md)
- 🎨 [设计系统](../../docs/design-system/qingyu-design-system.md)

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90
- iOS Safari >= 14
- Android Chrome >= 90

## 贡献

欢迎贡献代码、报告问题或提出建议!

## 许可证

MIT License

---

**版本**: v1.0.0  
**更新日期**: 2026-01-25  
**状态**: Phase 1 & 2 完成, Phase 3 开发中
