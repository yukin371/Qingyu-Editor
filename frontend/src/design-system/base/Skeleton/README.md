# Skeleton 组件

骨架屏组件，用于在内容加载时展示占位符，提升用户体验。

## 功能特性

- 支持多种类型：`text`、`circle`、`rect`、`avatar`、`image`
- 支持多种尺寸：`xs`、`sm`、`md`、`lg`、`xl`
- 支持自定义宽度和高度
- 支持动画效果（`animate-pulse`）
- 支持组合使用构建复杂的加载状态
- 支持暗色模式

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'text' \| 'circle' \| 'rect' \| 'avatar' \| 'image'` | `'text'` | Skeleton 类型 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Skeleton 尺寸 |
| `width` | `string` | `undefined` | 自定义宽度（如 `'100px'`、`'50%'`） |
| `height` | `string` | `undefined` | 自定义高度（如 `'100px'`） |
| `animated` | `boolean` | `true` | 是否显示动画 |
| `class` | `any` | `undefined` | 自定义类名 |

## 使用示例

### 基础使用

```vue
<template>
  <!-- 文本骨架 -->
  <Skeleton type="text" size="md" />

  <!-- 圆形骨架 -->
  <Skeleton type="circle" size="md" />

  <!-- 矩形骨架 -->
  <Skeleton type="rect" size="md" />
</template>
```

### 自定义尺寸

```vue
<template>
  <!-- 自定义宽度和高度 -->
  <Skeleton type="text" width="200px" height="20px" />

  <!-- 自定义宽度，高度自适应 -->
  <Skeleton type="rect" width="100%" height="120px" />
</template>
```

### 无动画

```vue
<template>
  <Skeleton type="text" :animated="false" />
</template>
```

### 组合使用 - 用户卡片

```vue
<template>
  <div class="bg-white rounded-lg shadow-md p-6 w-80">
    <div class="flex items-center gap-4 mb-4">
      <Skeleton type="avatar" size="xl" />
      <div class="flex-1 space-y-2">
        <Skeleton type="text" size="lg" />
        <Skeleton type="text" size="sm" />
      </div>
    </div>
    <div class="space-y-2">
      <Skeleton type="text" size="md" />
      <Skeleton type="text" size="md" />
      <Skeleton type="text" size="md" width="150px" />
    </div>
  </div>
</template>
```

### 组合使用 - 文章卡片

```vue
<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden w-96">
    <Skeleton type="image" size="lg" height="200px" />
    <div class="p-6 space-y-4">
      <Skeleton type="text" size="xl" />
      <div class="space-y-2">
        <Skeleton type="text" size="md" />
        <Skeleton type="text" size="md" />
        <Skeleton type="text" size="md" width="200px" />
      </div>
    </div>
  </div>
</template>
```

### 组合使用 - 列表

```vue
<template>
  <div class="bg-white rounded-lg shadow-md p-4 w-96">
    <div class="space-y-4">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4">
        <Skeleton type="avatar" size="md" />
        <div class="flex-1 space-y-2">
          <Skeleton type="text" size="md" />
          <Skeleton type="text" size="sm" width="150px" />
        </div>
      </div>
    </div>
  </div>
</template>
```

## 设计规范

### 类型说明

| 类型 | 用途 | 圆角 |
|------|------|------|
| `text` | 文本占位 | `rounded-sm` |
| `circle` | 圆形占位（头像、图标） | `rounded-full` |
| `rect` | 矩形占位（卡片、图片） | `rounded-md` |
| `avatar` | 头像占位 | `rounded-full` |
| `image` | 图片占位 | `rounded-md` |

### 尺寸映射

#### Text 尺寸

| 尺寸 | 宽度 | 高度 |
|------|------|------|
| `xs` | `w-12` (48px) | `h-3` (12px) |
| `sm` | `w-16` (64px) | `h-4` (16px) |
| `md` | `w-24` (96px) | `h-5` (20px) |
| `lg` | `w-32` (128px) | `h-6` (24px) |
| `xl` | `w-48` (192px) | `h-7` (28px) |

#### Circle/Avatar 尺寸

| 尺寸 | 宽度 | 高度 |
|------|------|------|
| `xs` | `w-6` (24px) | `h-6` (24px) |
| `sm` | `w-8` (32px) | `h-8` (32px) |
| `md` | `w-10` (40px) | `h-10` (40px) |
| `lg` | `w-12` (48px) | `h-12` (48px) |
| `xl` | `w-16` (64px) | `h-16` (64px) |

#### Rect/Image 尺寸

| 尺寸 | 宽度 | 高度 |
|------|------|------|
| `xs` | `w-full` | `h-16` (64px) |
| `sm` | `w-full` | `h-24` (96px) |
| `md` | `w-full` | `h-32` (128px) |
| `lg` | `w-full` | `h-40` (160px) |
| `xl` | `w-full` | `h-48` (192px) |

### 颜色规范

| 模式 | 背景色 |
|------|--------|
| 亮色 | `bg-slate-200` |
| 暗色 | `bg-slate-700` |

### 动画

使用 Tailwind CSS 的 `animate-pulse` 动画效果。

## 最佳实践

1. **匹配真实内容结构**：骨架屏应该尽可能匹配真实加载后的内容结构，减少视觉跳动。
2. **使用合适的尺寸**：根据实际内容选择合适的尺寸，避免骨架屏与真实内容差异过大。
3. **组合使用**：使用多个 Skeleton 组件组合构建复杂的加载状态。
4. **考虑暗色模式**：组件已内置暗色模式支持。

## 相关组件

- [Avatar](../Avatar/) - 头像组件
- [Card](../Card/) - 卡片组件
- [Image](../Image/) - 图片组件
