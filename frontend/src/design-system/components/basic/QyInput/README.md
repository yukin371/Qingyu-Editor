# QyInput Component

Qingyu-style input component with glassmorphism effects and support for text, search, and textarea types.

## Features

- Three types: text, search, textarea
- v-model support for two-way data binding
- Focus state with cyan ring effect
- Disabled state
- Glassmorphism design
- Qingyu rounded corners (12px)
- Smooth transitions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'text' \| 'search' \| 'textarea'` | `'text'` | Input type |
| `placeholder` | `string` | `''` | Input placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |
| `modelValue` | `string` | `''` | Input value (v-model) |
| `rows` | `number` | `3` | Number of rows for textarea (only when type='textarea') |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted when input value changes (for v-model) |
| `input` | `string` | Emitted on input event |
| `focus` | `FocusEvent` | Emitted on focus event |
| `blur` | `FocusEvent` | Emitted on blur event |

## Examples

### Basic Usage

```vue
<template>
  <QyInput v-model="text" placeholder="Enter text..." />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyInput } from '@/design-system/components'

const text = ref('')
</script>
```

### Text Input

```vue
<template>
  <QyInput
    v-model="username"
    type="text"
    placeholder="Username"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
</script>
```

### Search Input

```vue
<template>
  <QyInput
    v-model="searchQuery"
    type="search"
    placeholder="Search..."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
</script>
```

### Textarea

```vue
<template>
  <QyInput
    v-model="message"
    type="textarea"
    placeholder="Write a message..."
    :rows="5"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')
</script>
```

### Disabled State

```vue
<template>
  <QyInput
    v-model="disabledText"
    placeholder="This input is disabled"
    disabled
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const disabledText = ref('Cannot edit')
</script>
```

### With Events

```vue
<template>
  <QyInput
    v-model="email"
    type="text"
    placeholder="Email"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')

const handleFocus = () => {
  console.log('Input focused')
}

const handleBlur = () => {
  console.log('Input blurred')
}
</script>
```

## Styling

The input uses Qingyu design system tokens:
- Glassmorphism: `bg-white/80 border border-white/50`
- Rounded corners: `rounded-xl` (12px)
- Padding: `px-4 py-3`
- Focus ring: `focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500`
- Text color: `text-slate-800`
- Placeholder color: `placeholder:text-slate-400`
- Transition: `transition-all`
- Disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`
