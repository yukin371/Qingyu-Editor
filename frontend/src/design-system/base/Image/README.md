# Image 组件

基础图片组件，支持多种尺寸、形状和加载状态。

## 特性

- ✅ 多种尺寸预设 (xs, sm, md, lg, xl, 2xl, full)
- ✅ 3 种形状变体 (rect, circle, rounded)
- ✅ 5 种对象填充方式 (cover, contain, fill, none, scale-down)
- ✅ 懒加载支持
- ✅ 骨架屏加载状态
- ✅ 错误状态 Fallback
- ✅ 自定义尺寸支持
- ✅ 完整的事件支持

## 使用方法

### 基础用法

```vue
<script setup>
import Image from '@/design-system/base/Image/Image.vue'
</script>

<template>
  <Image
    src="https://example.com/image.jpg"
    alt="示例图片"
  />
</template>
```

### 尺寸

```vue
<template>
  <div class="flex items-center gap-4">
    <Image
      src="https://example.com/image.jpg"
      alt="XS"
      size="xs"
    />
    <Image
      src="https://example.com/image.jpg"
      alt="SM"
      size="sm"
    />
    <Image
      src="https://example.com/image.jpg"
      alt="MD"
      size="md"
    />
    <Image
      src="https://example.com/image.jpg"
      alt="LG"
      size="lg"
    />
    <Image
      src="https://example.com/image.jpg"
      alt="XL"
      size="xl"
    />
  </div>
</template>
```

### 形状

```vue
<template>
  <div class="flex items-center gap-4">
    <Image
      src="https://example.com/avatar.jpg"
      alt="矩形"
      shape="rect"
    />
    <Image
      src="https://example.com/avatar.jpg"
      alt="圆形"
      shape="circle"
    />
    <Image
      src="https://example.com/avatar.jpg"
      alt="圆角"
      shape="rounded"
    />
  </div>
</template>
```

### 对象填充方式

```vue
<template>
  <div class="space-y-4">
    <Image
      src="https://example.com/image.jpg"
      alt="Cover"
      width="300px"
      height="300px"
      fit="cover"
    />
    <Image
      src="https://example.com/image.jpg"
      alt="Contain"
      width="300px"
      height="300px"
      fit="contain"
    />
    <Image
      src="https://example.com/image.jpg"
      alt="Fill"
      width="300px"
      height="300px"
      fit="fill"
    />
  </div>
</template>
```

### 自定义尺寸

```vue
<template>
  <Image
    src="https://example.com/image.jpg"
    alt="自定义尺寸"
    width="400px"
    height="300px"
  />
</template>
```

### 全宽图片

```vue
<template>
  <div class="w-full">
    <Image
      src="https://example.com/banner.jpg"
      alt="横幅图片"
      size="full"
      height="300px"
    />
  </div>
</template>
```

### 加载和错误状态

```vue
<template>
  <div class="flex items-center gap-4">
    <!-- 加载状态会自动显示骨架屏 -->
    <Image
      src="https://example.com/image.jpg"
      alt="加载中"
      :show-skeleton="true"
    />

    <!-- 错误状态会显示 fallback 图标 -->
    <Image
      src="https://invalid-url.com/image.jpg"
      alt="错误"
      fallback-icon="photo"
    />
  </div>
</template>
```

### 懒加载

```vue
<template>
  <!-- 默认开启懒加载 -->
  <Image
    src="https://example.com/image.jpg"
    alt="懒加载图片"
    :lazy="true"
  />

  <!-- 关闭懒加载 -->
  <Image
    src="https://example.com/hero.jpg"
    alt="首屏图片"
    :lazy="false"
  />
</template>
```

### 事件处理

```vue
<script setup>
const handleLoad = (event) => {
  console.log('图片加载完成', event)
}

const handleError = (event) => {
  console.log('图片加载失败', event)
}

const handleClick = () => {
  console.log('图片被点击')
}
</script>

<template>
  <Image
    src="https://example.com/image.jpg"
    alt="事件示例"
    @load="handleLoad"
    @error="handleError"
    @click="handleClick"
  />
</template>
```

### 头像使用

```vue
<template>
  <div class="flex items-center gap-4">
    <Image
      src="https://example.com/avatar1.jpg"
      alt="用户 1"
      size="sm"
      shape="circle"
    />
    <Image
      src="https://example.com/avatar2.jpg"
      alt="用户 2"
      size="md"
      shape="circle"
    />
    <Image
      src="https://example.com/avatar3.jpg"
      alt="用户 3"
      size="lg"
      shape="circle"
    />
  </div>
</template>
```

### 可点击图片

```vue
<template>
  <Image
    src="https://example.com/image.jpg"
    alt="点击查看大图"
    class="cursor-pointer hover:opacity-80 transition-opacity"
    @click="handleClick"
  />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | - | 图片 URL |
| `alt` | `string` | - | 图片替代文本 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` | `'md'` | 图片尺寸 |
| `shape` | `'rect' \| 'circle' \| 'rounded'` | `'rect'` | 图片形状 |
| `fit` | `'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | 对象填充方式 |
| `width` | `string` | - | 自定义宽度 (如 '400px') |
| `height` | `string` | - | 自定义高度 (如 '300px') |
| `lazy` | `boolean` | `true` | 是否懒加载 |
| `showSkeleton` | `boolean` | `true` | 加载中是否显示骨架屏 |
| `fallbackIcon` | `string` | `'image'` | 错误状态图标名称 |
| `class` | `any` | - | 自定义类名 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `load` | `(event: Event)` | 图片加载完成事件 |
| `error` | `(event: Event)` | 图片加载错误事件 |
| `click` | `(event: MouseEvent)` | 点击事件 |

## 设计规范

### 尺寸规范

| 尺寸 | 宽度 | 高度 |
|------|------|------|
| xs | 64px | 64px |
| sm | 96px | 96px |
| md | 128px | 128px |
| lg | 192px | 192px |
| xl | 256px | 256px |
| 2xl | 384px | 384px |
| full | 100% | 100% |

### 形状规范

| 形状 | 圆角 |
|------|------|
| rect | rounded-md |
| circle | rounded-full |
| rounded | rounded-lg |

### 对象填充方式

| 值 | 说明 |
|------|------|
| cover | 缩放图片以填充容器，裁剪超出部分 |
| contain | 缩放图片以适应容器，保持完整 |
| fill | 拉伸图片以填充容器 |
| none | 不缩放图片 |
| scale-down | 图片缩小以适应容器 |

### 加载状态

- 骨架屏使用 `Skeleton` 组件
- 默认开启骨架屏加载状态
- 错误状态显示 fallback 图标
- 支持懒加载优化性能

### 可访问性

- 支持 `alt` 属性提供替代文本
- 正确的 `role="img"` ARIA 属性
- 错误状态提供视觉反馈
- 加载状态提供占位内容

## 最佳实践

1. **始终提供 alt 文本**：为所有图片提供有意义的替代文本
2. **使用合适的 fit 值**：根据图片类型选择合适的对象填充方式
3. **启用懒加载**：对于非首屏图片，启用懒加载提升性能
4. **处理错误状态**：为可能加载失败的图片提供 fallback
5. **头像使用圆形**：用户头像使用 `shape="circle"`
6. **横幅使用全宽**：横幅图片使用 `size="full"` 并设置高度
7. **自定义尺寸优先**：当预设尺寸不满足时，使用 `width` 和 `height` 自定义
