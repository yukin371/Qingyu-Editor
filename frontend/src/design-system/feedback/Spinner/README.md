# Spinner 加载中组件

用于显示加载状态和进度反馈的组件，支持多种动画类型和尺寸。

## 特性

- 支持 4 种动画类型：旋转圆圈、点动画、条形动画、波浪动画
- 支持 3 种尺寸：小、中、大
- 自定义颜色和线条粗细
- 支持加载文字说明
- 完全可定制的插槽内容

## 安装

```bash
npm install @qingyu/design-system
```

## 基础用法

```vue
<template>
  <Spinner />
</template>

<script setup>
import { Spinner } from '@qingyu/design-system'
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 动画类型 | `SpinnerType` | `'default' \| 'dots' \| 'bars' \| 'wave'` | `'default'` |
| size | 尺寸 | `SpinnerSize` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| color | 自定义颜色 | `string` | - | - |
| strokeWidth | 线条粗细（仅 default 类型） | `number` | - | `3` |
| label | 加载文字说明 | `string` | - | - |
| class | 自定义类名 | `string` | - | - |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义加载内容 |

## 类型定义

```typescript
type SpinnerType = 'default' | 'dots' | 'bars' | 'wave'
type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  type?: SpinnerType
  size?: SpinnerSize
  color?: string
  strokeWidth?: number
  label?: string
  class?: any
}
```

## 示例

### 不同类型

```vue
<template>
  <div class="space-y-4">
    <Spinner type="default" />
    <Spinner type="dots" />
    <Spinner type="bars" />
    <Spinner type="wave" />
  </div>
</template>
```

### 不同尺寸

```vue
<template>
  <div class="space-y-4">
    <Spinner size="sm" label="小尺寸" />
    <Spinner size="md" label="中等尺寸" />
    <Spinner size="lg" label="大尺寸" />
  </div>
</template>
```

### 带文字说明

```vue
<template>
  <Spinner label="正在加载..." />
</template>
```

### 自定义颜色

```vue
<template>
  <div class="space-x-4">
    <Spinner color="#3b82f6" />
    <Spinner color="#ef4444" />
    <Spinner color="#10b981" />
  </div>
</template>
```

### 内联显示

```vue
<template>
  <p>
    正在保存您的更改 <Spinner type="dots" size="sm" />
  </p>
</template>
```

### 按钮内加载

```vue
<template>
  <button class="px-4 py-2 bg-blue-500 text-white rounded">
    <span class="flex items-center gap-2">
      <Spinner size="sm" color="white" />
      提交中...
    </span>
  </button>
</template>
```

### 全屏加载

```vue
<template>
  <div class="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
    <Spinner type="default" size="lg" label="正在加载..." />
  </div>
</template>
```

### 自定义插槽内容

```vue
<template>
  <Spinner type="default">
    <template #default>
      <span class="text-blue-600 font-semibold">自定义加载文字</span>
    </template>
  </Spinner>
</template>
```

### 暗色主题

```vue
<template>
  <div class="bg-slate-900 p-8">
    <Spinner type="default" color="white" label="暗色主题" />
  </div>
</template>
```

## 无障碍访问

组件内置了无障碍访问支持：

- `role="status"`: 标识为状态指示器
- `aria-label`: 自动使用 label 或默认为"加载中"

## 样式定制

组件使用 Tailwind CSS 构建，可以通过 `class` 属性进行样式定制：

```vue
<template>
  <Spinner class="my-custom-class" />
</template>

<style>
.my-custom-class {
  /* 自定义样式 */
}
</style>
```

## 设计指南

### 何时使用

- 数据加载时
- 表单提交时
- 文件上传时
- 页面初始化时
- 异步操作处理中

### 类型选择建议

- **default**: 适用于大多数场景，旋转动画清晰明确
- **dots**: 适用于轻量级加载，占用空间小
- **bars**: 适用于数据处理场景，条形动画更有节奏感
- **wave**: 适用于创意场景，波浪动画更具动感

### 尺寸选择建议

- **sm**: 适用于内联显示、按钮内
- **md**: 适用于一般场景（默认）
- **lg**: 适用于全屏加载、独立页面

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 更新日志

### v1.0.0

- 初始版本
- 支持 4 种动画类型
- 支持 3 种尺寸
- 支持自定义颜色和样式

## 许可证

MIT
