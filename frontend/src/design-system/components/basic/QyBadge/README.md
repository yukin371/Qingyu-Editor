# QyBadge Component

Qingyu-style badge component with support for count, status, and dot types.

## Features

- Three types: count, status, dot
- Five colors: cyan, blue, green, red, yellow
- Count badge with max value display (99+)
- Status badge with custom text
- Dot badge with adjustable size
- Qingyu rounded design

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'count' \| 'status' \| 'dot'` | `'count'` | Badge type |
| `color` | `'cyan' \| 'blue' \| 'green' \| 'red' \| 'yellow'` | `'cyan'` | Badge color |
| `value` | `number` | `0` | Badge value (for count type) |
| `max` | `number` | `99` | Maximum value to display (shows 99+ for larger values) |
| `text` | `string` | `''` | Badge text (for status type) |
| `dotSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dot size (for dot type) |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Custom content for status badge (overrides text prop) |

## Examples

### Count Badge

```vue
<template>
  <!-- Basic count badge -->
  <QyBadge type="count" :value="5" color="cyan" />

  <!-- Badge with max value -->
  <QyBadge type="count" :value="150" :max="99" color="red" />

  <!-- Different colors -->
  <QyBadge type="count" :value="10" color="blue" />
  <QyBadge type="count" :value="3" color="green" />
  <QyBadge type="count" :value="7" color="yellow" />
</template>

<script setup lang="ts">
import { QyBadge } from '@/design-system/components'
</script>
```

### Status Badge

```vue
<template>
  <!-- Using text prop -->
  <QyBadge type="status" text="Active" color="green" />
  <QyBadge type="status" text="Pending" color="yellow" />
  <QyBadge type="status" text="Inactive" color="red" />

  <!-- Using slot -->
  <QyBadge type="status" color="cyan">
    Custom Status
  </QyBadge>
</template>
```

### Dot Badge

```vue
<template>
  <!-- Different sizes -->
  <QyBadge type="dot" color="cyan" dotSize="sm" />
  <QyBadge type="dot" color="blue" dotSize="md" />
  <QyBadge type="dot" color="green" dotSize="lg" />

  <!-- Different colors -->
  <QyBadge type="dot" color="red" />
  <QyBadge type="dot" color="yellow" />
</template>
```

### Badge on Button

```vue
<template>
  <div class="relative inline-block">
    <QyButton>Notifications</QyButton>
    <div class="absolute -top-2 -right-2">
      <QyBadge type="count" :value="unreadCount" color="red" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyButton, QyBadge } from '@/design-system/components'

const unreadCount = ref(5)
</script>
```

### Status List

```vue
<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <QyBadge type="dot" color="green" dotSize="sm" />
      <span>Online</span>
    </div>
    <div class="flex items-center gap-2">
      <QyBadge type="dot" color="yellow" dotSize="sm" />
      <span>Away</span>
    </div>
    <div class="flex items-center gap-2">
      <QyBadge type="dot" color="red" dotSize="sm" />
      <span>Offline</span>
    </div>
  </div>
</template>
```

## Styling

The badge uses Qingyu design system tokens:

### Count Badge
- Padding: `px-2 py-0.5`
- Size: `min-w-[20px] h-5`
- Rounded: `rounded-full`
- Font: `text-xs font-medium`

### Status Badge
- Padding: `px-3 py-1`
- Rounded: `rounded-full`
- Font: `text-sm font-medium`

### Dot Badge
- Shape: `rounded-full`
- Sizes:
  - sm: `w-2 h-2`
  - md: `w-3 h-3`
  - lg: `w-4 h-4`

### Colors
- cyan: `bg-cyan-500`
- blue: `bg-blue-500`
- green: `bg-green-500`
- red: `bg-red-500`
- yellow: `bg-yellow-500`
