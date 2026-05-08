# QyIcon Component

A flexible icon component for rendering SVG icons with full customization.

## Features

- 🎨 **93+ Built-in Icons** - Common icons ready to use
- 🎯 **Type-Safe** - Full TypeScript support with icon name autocomplete
- 🎛️ **Customizable** - Size, color, rotation, and flip transformations
- ⚡ **Performance** - Inline SVG rendering with no external dependencies
- 🎨 **Design System** - Follows Qingyu design guidelines

## Installation

The component is already part of the Qingyu Design System.

```vue
<script setup>
import { QyIcon } from '@/design-system/components'
</script>
```

## Basic Usage

### Size

```vue
<QyIcon name="Search" :size="12" />  <!-- 12px -->
<QyIcon name="Search" :size="16" />  <!-- 16px (default) -->
<QyIcon name="Search" :size="24" />  <!-- 24px -->
<QyIcon name="Search" :size="32" />  <!-- 32px -->
<QyIcon name="Search" :size="48" />  <!-- 48px -->
```

### Color

```vue
<QyIcon name="Star" color="currentColor" />  <!-- Inherits text color -->
<QyIcon name="Star" color="cyan-600" />     <!-- Tailwind color -->
<QyIcon name="Star" color="#FFD700" />      <!-- Hex color -->
<QyIcon name="Star" color="rgb(255 0 0)" /> <!-- RGB color -->
```

### Rotation

```vue
<QyIcon name="Refresh" :rotate="0" />    <!-- No rotation -->
<QyIcon name="Refresh" :rotate="90" />   <!-- 90 degrees -->
<QyIcon name="Refresh" :rotate="180" />  <!-- 180 degrees -->
<QyIcon name="Refresh" :rotate="270" />  <!-- 270 degrees -->
```

### Flip

```vue
<QyIcon name="ArrowRight" flip="horizontal" />  <!-- Flip horizontally -->
<QyIcon name="ArrowRight" flip="vertical" />    <!-- Flip vertically -->
<QyIcon name="ArrowRight" flip="both" />        <!-- Flip both -->
```

## Available Icons

### Navigation
- `Search`, `ArrowRight`, `ArrowLeft`, `ArrowUp`, `ArrowDown`, `Back`

### Actions
- `Plus`, `Minus`, `Close`, `Edit`, `Delete`, `Check`, `Refresh`, `Share`, `Copy`

### Rating
- `Star`, `StarFilled`

### User & Account
- `User`, `UserFilled`, `Lock`, `Unlock`

### Files & Documents
- `Document`, `Folder`, `FolderOpened`, `Files`

### Communication
- `ChatDotRound`, `ChatLineSquare`

### Settings & Tools
- `Setting`, `Filter`

### Status & Feedback
- `Warning`, `WarningFilled`, `InfoFilled`, `SuccessFilled`, `CircleCheck`, `CircleClose`

### Media & View
- `View`, `Picture`

### Utility
- `Clock`, `Timer`, `Calendar`, `Trophy`

### Loading & Progress
- `Loading`

### Upload & Download
- `Upload`, `Download`

### Special Purpose
- `Collection`, `Crown`, `Present`, `ShoppingCart`, `DataAnalysis`, `TrendCharts`, `Bell`, `FullScreen`, `Sort`, `Memo`, `MagicStick`

### Navigation & Layout
- `Grid`, `HomeFilled`, `Menu`

### Additional
- `Location`, `Reading`, `MoreFilled`, `Wallet`, `QuestionFilled`, `CircleCloseFilled`, `CircleCheckFilled`, `EditPen`, `DocumentCopy`, `Expand`, `Fold`, `SwitchButton`

### Book & Library
- `BookOpen`, `BookClosed`, `Bookmark`, `BookmarkFilled`, `Library`, `Bookshelf`

### Empty State
- `BookNotFound`, `Empty`, `EmptyFolder`, `NoData`, `FileSearch`, `IllustrationPlaceholder`

### AI Feature
- `Sparkles`, `Robot`, `Bot`, `Microphone`, `VoiceInput`, `Lightbulb`, `Idea`, `Brain`, `NeuralNetwork`

### Interaction
- `cursor-click`, `hand-pointer`, `heart`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | *required* | Icon name (see available icons above) |
| `size` | `number \| string` | `16` | Icon size in pixels |
| `color` | `string` | `'currentColor'` | Icon color (any valid CSS color) |
| `class` | `string` | `''` | Additional CSS classes |
| `rotate` | `number` | `0` | Rotation in degrees |
| `flip` | `'horizontal' \| 'vertical' \| 'both' \| 'none'` | `'none'` | Flip transformation |

## Examples

### Search Bar with Icon

```vue
<template>
  <div class="relative">
    <QyIcon name="Search" :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input type="text" class="pl-10 pr-4 py-2 border rounded-lg" placeholder="Search..." />
  </div>
</template>
```

### Button with Icon

```vue
<template>
  <button class="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
    <QyIcon name="Plus" :size="16" />
    <span>Add New</span>
  </button>
</template>
```

### Icon with Action

```vue
<template>
  <button @click="handleRefresh" class="p-2 hover:bg-gray-100 rounded">
    <QyIcon name="Refresh" :size="20" class="text-gray-600" />
  </button>
</template>

<script setup>
const handleRefresh = () => {
  // Refresh logic
}
</script>
```

### Status Icons

```vue
<template>
  <div>
    <QyIcon name="CircleCheck" color="green" :size="24" />
    <QyIcon name="Warning" color="yellow" :size="24" />
    <QyIcon name="CircleClose" color="red" :size="24" />
  </div>
</template>
```

### Animated Loading Icon

```vue
<template>
  <div class="flex items-center gap-2">
    <QyIcon name="Loading" :size="20" class="animate-spin" />
    <span>Loading...</span>
  </div>
</template>
```

## Migration from Element Plus Icons

### Before

```vue
<script setup>
import { Search, Plus } from '@element-plus/icons-vue'
</script>

<template>
  <Search :size="16" />
  <Plus />
</template>
```

### After

```vue
<script setup>
import { QyIcon } from '@/design-system/components'
</script>

<template>
  <QyIcon name="Search" :size="16" />
  <QyIcon name="Plus" />
</template>
```

## Design Guidelines

### Icon Sizes

- **XS (12px)**: Compact UI elements, tags, badges
- **SM (16px)**: Default size, buttons, inputs
- **MD (20px)**: Secondary actions, navigation
- **LG (24px)**: Primary actions, featured content
- **XL (32px)**: Hero sections, illustrations
- **2XL (48px)**: Empty states, large displays

### Icon Colors

- **currentColor**: Inherits from parent text color (recommended)
- **Primary actions**: `cyan-600` or `blue-600`
- **Success**: `green-600`
- **Warning**: `yellow-600`
- **Danger**: `red-600`
- **Muted**: `gray-400` or `slate-400`

### Accessibility

- Icons are automatically marked as `aria-hidden="true"` when used decoratively
- For icon-only buttons, add `aria-label` to the parent element
- Use meaningful colors that pass WCAG contrast ratios

## Technical Details

- **Format**: Inline SVG strings
- **Grid**: 24x24 pixels
- **Stroke**: 1.5px (outline icons)
- **License**: MIT (icons from Heroicons and Tabler Icons)
- **Dependencies**: None (pure Vue 3 + TypeScript)

## Related Components

- `QyButton` - Button component with icon support
- `QyInput` - Input component with icon slots
- `QyBadge` - Badge component for status indicators
