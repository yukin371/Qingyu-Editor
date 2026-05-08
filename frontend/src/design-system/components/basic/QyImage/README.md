# QyImage 图片组件

基于 CVA (Class Variance Authority) 构建的图片组件，与 Element Plus El-Image API 兼容。

## 功能特性

- 图片适配方式 (fit)
- 圆角样式 (rounded)
- 阴影效果 (shadow)
- 懒加载支持 (lazy)
- 图片预览功能 (preview)
- 预览图片列表导航
- 加载状态占位符
- 错误状态处理
- 鼠标滚轮缩放

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | - | 图片源地址（必填） |
| `fit` | `'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | 图片适配方式 |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` | `'md'` | 圆角样式 |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'none'` | 阴影效果 |
| `width` | `string \| number` | - | 图片宽度 |
| `height` | `string \| number` | - | 图片高度 |
| `alt` | `string` | `''` | 图片替代文本 |
| `lazy` | `boolean` | `false` | 是否懒加载 |
| `preview` | `boolean` | `false` | 是否开启预览 |
| `previewSrcList` | `string[]` | - | 预览图片列表 |
| `initialIndex` | `number` | `0` | 初始预览索引 |
| `zIndex` | `number` | `2000` | 预览层 z-index |
| `errorSrc` | `string` | - | 加载失败时的图片源 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| `loading` | 自定义加载中内容 |
| `error` | 自定义加载失败内容 |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `load` | 图片加载成功时触发 | `event: Event` |
| `error` | 图片加载失败时触发 | `event: Event` |
| `click` | 点击图片时触发 | `event: MouseEvent` |

### Exposed Methods

| 方法名 | 说明 |
|--------|------|
| `openPreview()` | 打开预览 |
| `closePreview()` | 关闭预览 |
| `togglePreview()` | 切换预览状态 |

## 使用示例

### 基础用法

```vue
<template>
  <QyImage
    src="https://example.com/image.jpg"
    alt="示例图片"
    :width="200"
    :height="200"
  />
</template>

<script setup>
import { QyImage } from '@/design-system/components'
</script>
```

### 图片适配方式

```vue
<template>
  <!-- 覆盖容器 -->
  <QyImage src="..." fit="cover" :width="150" :height="150" />

  <!-- 包含在容器内 -->
  <QyImage src="..." fit="contain" :width="150" :height="150" />

  <!-- 填充容器 -->
  <QyImage src="..." fit="fill" :width="150" :height="150" />

  <!-- 缩小以适应 -->
  <QyImage src="..." fit="scale-down" :width="150" :height="150" />
</template>
```

### 圆角和阴影

```vue
<template>
  <!-- 无圆角 -->
  <QyImage src="..." rounded="none" />

  <!-- 小圆角 -->
  <QyImage src="..." rounded="sm" />

  <!-- 中圆角 -->
  <QyImage src="..." rounded="md" />

  <!-- 大圆角 -->
  <QyImage src="..." rounded="lg" />

  <!-- 完全圆形 -->
  <QyImage src="..." rounded="full" />

  <!-- 阴影效果 -->
  <QyImage src="..." shadow="lg" rounded="lg" />
</template>
```

### 预览模式

```vue
<template>
  <!-- 单图预览 -->
  <QyImage
    src="https://picsum.photos/400/300"
    :width="200"
    :height="150"
    :preview="true"
  />

  <!-- 预览列表（支持导航） -->
  <QyImage
    src="https://picsum.photos/400/300"
    :width="200"
    :height="150"
    :preview="true"
    :preview-src-list="[
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=3'
    ]"
  />
</template>
```

### 懒加载

```vue
<template>
  <QyImage
    src="https://example.com/large-image.jpg"
    :lazy="true"
    :width="400"
    :height="300"
  />
</template>
```

### 自定义插槽

```vue
<template>
  <QyImage src="..." :width="200" :height="200">
    <template #loading>
      <div class="custom-loading">加载中...</div>
    </template>
    <template #error>
      <div class="custom-error">加载失败</div>
    </template>
  </QyImage>
</template>
```

## CVA Variants

### imageVariants

```typescript
{
  fit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  loadingState: 'loading' | 'loaded' | 'error'
}
```

### imageContainerVariants

```typescript
{
  rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}
```

## 预览功能说明

当 `preview` 设置为 `true` 时：

1. 点击图片会打开全屏预览
2. 预览支持鼠标滚轮缩放
3. 提供 + / - 缩放按钮
4. 提供"重置"按钮恢复原始尺寸
5. 如果提供了 `previewSrcList`，支持左右切换图片
6. 显示当前图片索引和总数
7. 点击背景或关闭按钮关闭预览
