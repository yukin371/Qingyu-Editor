# Button 组件

基础按钮组件，支持多种变体和尺寸。

## 特性

- ✅ 多种视觉变体 (primary, secondary, ghost, danger, success, warning)
- ✅ 5 种尺寸预设 (xs, sm, md, lg, xl)
- ✅ 禁用和加载状态
- ✅ 块级按钮支持
- ✅ 完整的键盘导航支持
- ✅ 可访问性 (ARIA) 兼容

## 使用方法

### 基础用法

```vue
<script setup>
import Button from '@/design-system/base/Button/Button.vue'
</script>

<template>
  <Button>Click Me</Button>
</template>
```

### 变体

```vue
<template>
  <div class="flex gap-2">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="danger">Danger</Button>
    <Button variant="success">Success</Button>
    <Button variant="warning">Warning</Button>
  </div>
</template>
```

### 尺寸

```vue
<template>
  <div class="flex gap-2">
    <Button size="xs">XS</Button>
    <Button size="sm">SM</Button>
    <Button size="md">MD</Button>
    <Button size="lg">LG</Button>
    <Button size="xl">XL</Button>
  </div>
</template>
```

### 状态

```vue
<template>
  <div class="flex gap-2">
    <Button>Normal</Button>
    <Button :disabled="true">Disabled</Button>
    <Button :loading="true">Loading</Button>
  </div>
</template>
```

### 块级按钮

```vue
<template>
  <Button :block="true">Block Button</Button>
</template>
```

### 带图标

```vue
<template>
  <Button>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    Add New
  </Button>
</template>
```

### 事件处理

```vue
<script setup>
const handleClick = () => {
  console.log('Button clicked!')
}
</script>

<template>
  <Button @click="handleClick">Click Me</Button>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success' \| 'warning'` | `'primary'` | 按钮变体 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 按钮尺寸 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `loading` | `boolean` | `false` | 加载状态 |
| `block` | `boolean` | `false` | 块级按钮 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 按钮类型 |
| `class` | `any` | - | 自定义类名 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `(event: MouseEvent)` | 点击事件 |

### Slots

| 插槽 | 说明 |
|------|------|
| `default` | 按钮内容 |

## 可访问性

- 支持键盘导航 (`Enter`, `Space`)
- 正确的 ARIA 属性
- 禁用状态正确处理
- 加载状态提供视觉反馈

## 设计规范

### 尺寸规范

| 尺寸 | 高度 | 水平内边距 | 字体大小 |
|------|------|-----------|----------|
| xs | 28px | 8px | 12px |
| sm | 32px | 12px | 14px |
| md | 40px | 16px | 16px |
| lg | 44px | 24px | 18px |
| xl | 48px | 32px | 20px |

### 颜色规范

| 变体 | 背景色 | 文字色 | 悬停色 |
|------|--------|--------|--------|
| primary | blue-500 | white | blue-600 |
| secondary | slate-200 | slate-900 | slate-300 |
| ghost | transparent | slate-700 | slate-100 |
| danger | red-500 | white | red-600 |
| success | emerald-500 | white | emerald-600 |
| warning | amber-500 | white | amber-600 |
