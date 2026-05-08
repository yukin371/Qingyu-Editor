# QyModal Component

A Qingyu-style modal/dialog component with glassmorphism effects and smooth animations.

## Features

- ✅ v-model support for visibility
- ✅ Backdrop blur overlay (`bg-slate-900/50 backdrop-blur-sm`)
- ✅ Glassmorphism content (`bg-white rounded-3xl shadow-glow`)
- ✅ Close button (X) in top-right
- ✅ ESC key to close
- ✅ Click outside to close (when `maskClosable=true`)
- ✅ Smooth fade-in/scale-up animation
- ✅ Customizable width
- ✅ Prevents body scroll when open

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `false` | Modal visibility (v-model supported) |
| `title` | `string` | `''` | Modal title |
| `width` | `string` | `'500px'` | Modal width |
| `closable` | `boolean` | `true` | Show close button |
| `maskClosable` | `boolean` | `true` | Close modal when clicking overlay |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Main content of the modal |
| `header` | Custom header (overrides title prop) |
| `footer` | Action buttons area |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:visible` | `boolean` | Emitted when visibility changes (v-model) |
| `close` | - | Emitted when modal is closed |
| `open` | - | Emitted when modal is opened |

## Usage

### Basic Usage

```vue
<template>
  <div>
    <QyButton @click="visible = true">Open Modal</QyButton>

    <QyModal
      v-model:visible="visible"
      title="Basic Modal"
    >
      <p>This is a basic modal with Qingyu styling.</p>
    </QyModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>
```

### With Custom Width

```vue
<template>
  <QyModal
    v-model:visible="visible"
    title="Wide Modal"
    :width="'800px'"
  >
    <p>This modal is wider than default.</p>
  </QyModal>
</template>
```

### With Footer Actions

```vue
<template>
  <QyModal
    v-model:visible="visible"
    title="Confirm Action"
  >
    <p>Are you sure you want to proceed?</p>

    <template #footer>
      <QyButton variant="secondary" @click="visible = false">
        Cancel
      </QyButton>
      <QyButton variant="primary" @click="handleConfirm">
        Confirm
      </QyButton>
    </template>
  </QyModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

const handleConfirm = () => {
  // Handle confirm action
  console.log('Confirmed!')
  visible = false
}
</script>
```

### With Custom Header

```vue
<template>
  <QyModal v-model:visible="visible">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-800">Information</h3>
          <p class="text-sm text-slate-500">Additional details</p>
        </div>
      </div>
    </template>

    <p>This modal has a custom header with icon and description.</p>
  </QyModal>
</template>
```

### Disable Mask Click

```vue
<template>
  <QyModal
    v-model:visible="visible"
    title="Non-closable Modal"
    :mask-closable="false"
  >
    <p>This modal can only be closed by clicking the X button or pressing ESC.</p>
  </QyModal>
</template>
```

## Style Customization

The modal uses Qingyu's design system:

- **Overlay**: `bg-slate-900/50 backdrop-blur-sm`
- **Content**: `bg-white rounded-3xl` with shadow
- **Animation**: Smooth fade-in with scale-up effect
- **Close Button**: Hover state with `bg-slate-100`

## Accessibility

- ESC key closes the modal
- Body scroll is prevented when modal is open
- Proper focus management (future enhancement)
- ARIA attributes can be added as needed

## Design Decisions

1. **Teleport to Body**: Modal is rendered at document root to avoid z-index issues
2. **Backdrop Blur**: Uses `backdrop-blur-sm` for glassmorphism effect
3. **Animation Timing**: 300ms transitions for smooth but responsive feel
4. **Max Dimensions**: 90vw/90vh to ensure visibility on small screens
5. **Close Button Position**: Top-right corner for standard UX pattern
