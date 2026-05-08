# Divider 组件

用于内容分割的分隔线组件，支持水平/垂直方向、标签文字和多种线型。

## 功能特性

- 支持**水平**和**垂直**两种方向
- 支持**实线**、**虚线**、**点线**三种线型
- 支持**标签文字**显示
- 使用设计令牌，支持深色模式
- 基于 Tailwind CSS 和 CVA 构建

## 安装使用

```vue
<script setup lang="ts">
import { Divider } from '@/design-system'
</script>

<template>
  <!-- 水平分隔线 -->
  <Divider />

  <!-- 带标签的分隔线 -->
  <Divider label="文字标签" />

  <!-- 垂直分隔线 -->
  <div class="flex h-20">
    <div>左侧</div>
    <Divider direction="vertical" />
    <div>右侧</div>
  </div>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 分隔线方向 |
| `variant` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | 线型变体 |
| `label` | `string` | `undefined` | 标签文字 |
| `class` | `any` | `undefined` | 自定义类名 |

### 方向 (direction)

- `horizontal`: 水平分隔线（默认）
- `vertical`: 垂直分隔线

### 线型 (variant)

- `solid`: 实线（默认）
- `dashed`: 虚线
- `dotted`: 点线

## 使用示例

### 基础用法

```vue
<template>
  <div>
    <p>上方内容</p>
    <Divider />
    <p>下方内容</p>
  </div>
</template>
```

### 线型变体

```vue
<template>
  <div>
    <!-- 实线 -->
    <Divider variant="solid" />

    <!-- 虚线 -->
    <Divider variant="dashed" />

    <!-- 点线 -->
    <Divider variant="dotted" />
  </div>
</template>
```

### 带标签的分隔线

```vue
<template>
  <div>
    <p>第一章</p>
    <Divider label="分隔" />
    <p>第二章</p>
  </div>
</template>
```

### 垂直分隔线

```vue
<template>
  <div class="flex h-20">
    <div class="flex-1">左侧</div>
    <Divider direction="vertical" />
    <div class="flex-1">右侧</div>
  </div>
</template>
```

### 垂直分隔线带标签

```vue
<template>
  <div class="flex h-24">
    <div class="flex-1">选项 A</div>
    <Divider direction="vertical" label="OR" />
    <div class="flex-1">选项 B</div>
  </div>
</template>
```

## 设计规范

### 颜色

- 浅色模式: `border-slate-200` (#e2e8f0)
- 深色模式: `border-slate-700` (#334155)

### 尺寸

- 水平: `h-px w-full` + `border-t`
- 垂直: `h-full w-px` + `border-l`

### 标签样式

- 字体大小: `text-sm`
- 颜色: `text-slate-500` (浅色), `text-slate-400` (深色)
- 间距: `px-3` (水平), `py-3` (垂直)

## 无障碍

Divider 组件默认使用语义化的 `div` 元素，不包含 ARIA 属性。如果需要在屏幕阅读器中提供更好的语义，可以结合 `role="separator"` 使用。

## 相关组件

- [Card](../Card/) - 卡片容器
- [Badge](../Badge/) - 徽章组件
- [Tag](../Tag/) - 标签组件
