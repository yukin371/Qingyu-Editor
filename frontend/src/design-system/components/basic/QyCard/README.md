# QyCard Component

Qingyu-style card component with glassmorphism effects and optional hover animations.

## Features

- Glassmorphism design with backdrop blur
- Optional hoverable state with lift effect
- Optional shadow
- Three slots: default, title, footer
- Qingyu rounded corners (24px)
- Smooth transitions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hoverable` | `boolean` | `false` | Enable hover effect (adds cursor pointer and lift animation) |
| `shadow` | `boolean` | `true` | Enable shadow |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Emitted when card is clicked (only if hoverable) |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Main card content |
| `title` | Card title (displayed above main content) |
| `footer` | Card footer (displayed below main content with separator) |

## Examples

### Basic Usage

```vue
<template>
  <QyCard>
    <p>This is the card content</p>
  </QyCard>
</template>

<script setup lang="ts">
import { QyCard } from '@/design-system/components'
</script>
```

### With Title and Footer

```vue
<template>
  <QyCard>
    <template #title>
      <h2 class="text-xl font-bold">Card Title</h2>
    </template>

    <p>This is the main content</p>

    <template #footer>
      <div class="flex justify-between">
        <QyButton variant="ghost">Cancel</QyButton>
        <QyButton>Confirm</QyButton>
      </div>
    </template>
  </QyCard>
</template>
```

### Hoverable Card

```vue
<template>
  <QyCard hoverable @click="handleCardClick">
    <h3 class="text-lg font-semibold mb-2">Clickable Card</h3>
    <p>This card has a hover effect and can be clicked</p>
  </QyCard>
</template>

<script setup lang="ts">
const handleCardClick = () => {
  console.log('Card clicked!')
}
</script>
```

### Without Shadow

```vue
<template>
  <QyCard :shadow="false">
    <p>Card without shadow</p>
  </QyCard>
</template>
```

## Styling

The card uses Qingyu design system tokens:
- Glassmorphism: `bg-white/60 backdrop-blur-xl border border-white/50`
- Rounded corners: `rounded-3xl` (24px)
- Padding: `p-6`
- Hover effect: `hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1`
- Transition: `transition-all duration-500`
- Footer separator: `border-t border-white/30`
