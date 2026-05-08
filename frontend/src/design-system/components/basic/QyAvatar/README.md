# QyAvatar Component

Qingyu-style avatar component with support for image, text, and group types.

## Features

- Three types: image, text, group
- Three sizes: sm, md, lg
- Seven gradient colors for text avatars
- Glassmorphism design
- Hover animations
- Group avatar with overlap effect
- Fallback placeholder for missing images

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'image' \| 'text' \| 'group'` | `'image'` | Avatar type |
| `src` | `string` | `''` | Image source URL (for image type) |
| `text` | `string` | `''` | Avatar text (for text type, displays first 2 characters) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Avatar size |
| `alt` | `string` | `'Avatar'` | Alt text for image (for image type) |
| `color` | `'cyan' \| 'blue' \| 'green' \| 'red' \| 'yellow' \| 'purple' \| 'pink'` | `'cyan'` | Background color (for text type) |
| `avatars` | `Array<{ src?: string; text?: string; alt?: string }>` | `[]` | Group of avatars (for group type) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Emitted when avatar is clicked |

## Examples

### Image Avatar

```vue
<template>
  <!-- With image -->
  <QyAvatar
    type="image"
    src="https://example.com/avatar.jpg"
    alt="User avatar"
    size="md"
  />

  <!-- Without image (fallback placeholder) -->
  <QyAvatar type="image" size="lg" />
</template>

<script setup lang="ts">
import { QyAvatar } from '@/design-system/components'
</script>
```

### Text Avatar

```vue
<template>
  <!-- Different colors -->
  <QyAvatar type="text" text="John Doe" color="cyan" size="md" />
  <QyAvatar type="text" text="Jane Smith" color="blue" size="md" />
  <QyAvatar type="text" text="Bob Wilson" color="green" size="md" />
  <QyAvatar type="text" text="Alice Brown" color="purple" size="md" />

  <!-- Different sizes -->
  <QyAvatar type="text" text="AB" color="red" size="sm" />
  <QyAvatar type="text" text="CD" color="yellow" size="md" />
  <QyAvatar type="text" text="EF" color="pink" size="lg" />
</template>
```

### Group Avatar

```vue
<template>
  <QyAvatar
    type="group"
    :avatars="[
      { src: 'https://example.com/avatar1.jpg', alt: 'User 1' },
      { src: 'https://example.com/avatar2.jpg', alt: 'User 2' },
      { src: 'https://example.com/avatar3.jpg', alt: 'User 3' },
      { text: 'John Doe' },
      { text: 'Jane Smith' }
    ]"
    size="md"
  />
</template>

<script setup lang="ts">
import { QyAvatar } from '@/design-system/components'
</script>
```

### Avatar with Click Event

```vue
<template>
  <QyAvatar
    type="image"
    src="https://example.com/avatar.jpg"
    @click="handleAvatarClick"
  />
</template>

<script setup lang="ts">
const handleAvatarClick = () => {
  console.log('Avatar clicked!')
}
</script>
```

### User List with Avatars

```vue
<template>
  <div class="space-y-3">
    <div
      v-for="user in users"
      :key="user.id"
      class="flex items-center gap-3 p-3 bg-white/60 rounded-xl"
    >
      <QyAvatar
        type="image"
        :src="user.avatar"
        :alt="user.name"
        size="md"
      />
      <div>
        <h3 class="font-semibold">{{ user.name }}</h3>
        <p class="text-sm text-slate-500">{{ user.email }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyAvatar } from '@/design-system/components'

const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', avatar: 'https://example.com/avatar1.jpg' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://example.com/avatar2.jpg' }
])
</script>
```

### Avatar Sizes Comparison

```vue
<template>
  <div class="flex items-end gap-4">
    <div class="text-center">
      <QyAvatar type="text" text="SM" size="sm" color="cyan" />
      <p class="text-xs mt-1">Small</p>
    </div>
    <div class="text-center">
      <QyAvatar type="text" text="MD" size="md" color="cyan" />
      <p class="text-xs mt-1">Medium</p>
    </div>
    <div class="text-center">
      <QyAvatar type="text" text="LG" size="lg" color="cyan" />
      <p class="text-xs mt-1">Large</p>
    </div>
  </div>
</template>
```

## Styling

The avatar uses Qingyu design system tokens:

### Base Styles
- Shape: `rounded-full`
- Border: `border-2 border-white/50`
- Background: `bg-white/60 backdrop-blur-sm`
- Shadow: `shadow-sm`
- Hover: `hover:shadow-md hover:scale-105`
- Transition: `transition-all duration-300`

### Sizes
- sm: `w-8 h-8` (32px)
- md: `w-12 h-12` (48px)
- lg: `w-16 h-16` (64px)

### Text Avatar Colors
All colors use gradient backgrounds:
- cyan: `bg-gradient-to-br from-cyan-400 to-cyan-600`
- blue: `bg-gradient-to-br from-blue-400 to-blue-600`
- green: `bg-gradient-to-br from-green-400 to-green-600`
- red: `bg-gradient-to-br from-red-400 to-red-600`
- yellow: `bg-gradient-to-br from-yellow-400 to-yellow-600`
- purple: `bg-gradient-to-br from-purple-400 to-purple-600`
- pink: `bg-gradient-to-br from-pink-400 to-pink-600`

### Group Avatar
- Overlap: `ml-[-8px]` (negative margin)
- Border: `border-2 border-white` (creates separation)
- Maximum visible: 3 avatars
- Shows "+N" for additional avatars

### Text Display
- Shows first 2 characters of text
- Uppercase transformation
- Font weight: `font-semibold`
- Color: `text-white`
