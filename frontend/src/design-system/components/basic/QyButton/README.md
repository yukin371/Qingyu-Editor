# QyButton Component

Qingyu-style button component with glassmorphism effects and gradient backgrounds.

## Features

- Multiple variants: primary, secondary, danger, ghost
- Three sizes: sm, md, lg
- Loading state with spinner
- Disabled state
- Hover animations
- Qingyu glassmorphism styling

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Button variant style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state (shows spinner) |
| `icon` | `string` | `undefined` | SVG icon string |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Emitted when button is clicked |

## Examples

### Basic Usage

```vue
<template>
  <QyButton>Click me</QyButton>
</template>

<script setup lang="ts">
import { QyButton } from '@/design-system/components'
</script>
```

### Variants

```vue
<template>
  <QyButton variant="primary">Primary</QyButton>
  <QyButton variant="secondary">Secondary</QyButton>
  <QyButton variant="danger">Danger</QyButton>
  <QyButton variant="ghost">Ghost</QyButton>
</template>
```

### Sizes

```vue
<template>
  <QyButton size="sm">Small</QyButton>
  <QyButton size="md">Medium</QyButton>
  <QyButton size="lg">Large</QyButton>
</template>
```

### Loading State

```vue
<template>
  <QyButton :loading="isLoading" @click="handleClick">
    Submit
  </QyButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isLoading = ref(false)

const handleClick = async () => {
  isLoading.value = true
  // Perform async operation
  await new Promise(resolve => setTimeout(resolve, 2000))
  isLoading.value = false
}
</script>
```

### With Icons

```vue
<template>
  <QyButton :icon="homeIcon">返回首页</QyButton>
  <QyButton :icon="refreshIcon" icon-position="right">刷新</QyButton>
  <QyButton variant="danger" :icon="deleteIcon">删除</QyButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const homeIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>')
const refreshIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>')
const deleteIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>')
</script>
```

## Styling

The button uses Qingyu design system tokens:
- Primary gradient: `bg-gradient-to-r from-cyan-600 to-blue-600`
- Secondary glassmorphism: `bg-white/60 backdrop-blur-xl border border-white/50`
- Hover effect: `hover:-translate-y-1` with `transition-all duration-300`
- Rounded corners: `rounded-xl` (md), `rounded-lg` (sm), `rounded-2xl` (lg)
