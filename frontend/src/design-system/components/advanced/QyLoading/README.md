# QyLoading Component

A Qingyu-style loading spinner component with smooth rotation animation.

## Features

- ✅ Cyan-colored spinner (using `border-cyan-600`)
- ✅ Smooth rotation animation
- ✅ Optional loading text below spinner
- ✅ Fullscreen mode with backdrop
- ✅ Multiple sizes (sm, md, lg)
- ✅ Multiple colors (cyan, blue, white)
- ✅ Glassmorphism backdrop in fullscreen mode

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Spinner size |
| `color` | `'cyan'` \| `'blue'` \| `'white'` | `'cyan'` | Spinner color |
| `text` | `string` | `''` | Loading text to display below spinner |
| `fullscreen` | `boolean` | `false` | Display in fullscreen with backdrop |

## Sizes

| Size | Spinner Size | Border Width |
|------|--------------|--------------|
| `sm` | 24px | 3px |
| `md` | 40px | 4px |
| `lg` | 56px | 5px |

## Colors

| Color | Border | Active Border |
|-------|--------|---------------|
| `cyan` | cyan-200 | cyan-600 |
| `blue` | blue-200 | blue-600 |
| `white` | white/30% | white |

## Usage

### Basic Usage

```vue
<template>
  <div>
    <QyLoading />
  </div>
</template>
```

### With Text

```vue
<template>
  <div>
    <QyLoading text="Loading data..." />
  </div>
</template>
```

### Size Variants

```vue
<template>
  <div class="space-y-4">
    <QyLoading size="sm" text="Small" />
    <QyLoading size="md" text="Medium" />
    <QyLoading size="lg" text="Large" />
  </div>
</template>
```

### Color Variants

```vue
<template>
  <div class="space-y-4 bg-slate-900 p-8">
    <QyLoading color="cyan" text="Cyan" />
    <QyLoading color="blue" text="Blue" />
    <QyLoading color="white" text="White" />
  </div>
</template>
```

### Fullscreen Mode

```vue
<template>
  <div>
    <QyButton @click="loading = true">Load Data</QyButton>

    <QyLoading
      v-if="loading"
      fullscreen
      text="Loading data, please wait..."
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

// Simulate data loading
const loadData = async () => {
  loading.value = true
  try {
    // Your async operation
    await new Promise(resolve => setTimeout(resolve, 2000))
  } finally {
    loading.value = false
  }
}
</script>
```

### Combined Example

```vue
<template>
  <div class="flex items-center justify-center min-h-[200px]">
    <QyLoading
      size="lg"
      color="cyan"
      text="Processing your request..."
    />
  </div>
</template>
```

### Inside a Card

```vue
<template>
  <QyCard>
    <div class="py-12">
      <QyLoading
        size="md"
        text="Loading card content..."
      />
    </div>
  </QyCard>
</template>
```

## Style Customization

The loading spinner uses Qingyu's design system:

- **Animation**: CSS `spin` animation with smooth rotation
- **Colors**: Cyan-600 for active state, cyan-200 for border
- **Fullscreen Backdrop**: `bg-slate-900/50 backdrop-blur-sm`
- **Text Color**: slate-500 (white in fullscreen mode)

## Animation Details

The spinner uses Tailwind's built-in `animate-spin` utility:

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## Best Practices

1. **Use descriptive text**: Always provide meaningful loading text to inform users
2. **Choose appropriate size**: Match spinner size to context (sm for inline, lg for fullscreen)
3. **Consider color**: Use cyan for light backgrounds, white for dark backgrounds
4. **Fullscreen for operations**: Use fullscreen mode for long-running operations
5. **Don't overuse**: Only show loading when actual work is being done

## Accessibility

- Loading text provides context for screen readers
- Spinner is purely decorative (aria-hidden could be added if needed)
- Fullscreen mode prevents interaction with background

## Design Decisions

1. **Border-based spinner**: Uses border trick for smooth rotation instead of SVG
2. **Size mapping**: Three fixed sizes for consistency across the app
3. **Color options**: Cyan (brand), Blue (alternative), White (for dark backgrounds)
4. **Fullscreen backdrop**: Uses backdrop blur for glassmorphism effect
5. **Text positioning**: Always below spinner for consistent layout
