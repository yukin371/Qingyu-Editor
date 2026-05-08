# QyEmpty Component

A Qingyu-style empty state component for displaying no-data states with glassmorphism effects.

## Features

- ✅ Large icon or image display
- ✅ Title and description text
- ✅ Optional action button
- ✅ Glassmorphism card container
- ✅ Flexible slot-based customization
- ✅ Responsive layout

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | `''` | Icon SVG string |
| `title` | `string` | `'No Data'` | Title text |
| `description` | `string` | `'There is no data to display'` | Description text |
| `actionText` | `string` | `''` | Action button text |
| `image` | `string` | `''` | Optional image URL (overrides icon) |

## Slots

| Slot | Description |
|------|-------------|
| `icon` | Custom icon or image |
| `title` | Custom title content |
| `description` | Custom description content |
| `action` | Custom action button |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `action` | - | Emitted when action button is clicked |

## Usage

### Basic Usage

```vue
<template>
  <div>
    <QyEmpty
      title="No books found"
      description="Try adjusting your search or filters"
      action-text="Browse Books"
      @action="handleBrowse"
    />
  </div>
</template>

<script setup lang="ts">
const handleBrowse = () => {
  console.log('Browse clicked')
}
</script>
```

### With Custom Icon

```vue
<template>
  <div>
    <QyEmpty
      :icon="bookIcon"
      title="Your library is empty"
      description="Start by adding some books to your collection"
      action-text="Add Books"
      @action="handleAddBooks"
    />
  </div>
</template>

<script setup lang="ts">
const bookIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
`

const handleAddBooks = () => {
  console.log('Add books clicked')
}
</script>
```

### With Image

```vue
<template>
  <div>
    <QyEmpty
      image="/images/empty-state.png"
      title="Nothing here yet"
      description="Create your first project to get started"
      action-text="Create Project"
      @action="handleCreate"
    />
  </div>
</template>

<script setup lang="ts">
const handleCreate = () => {
  console.log('Create clicked')
}
</script>
```

### Inside a Card

```vue
<template>
  <QyCard>
    <QyEmpty
      title="No notifications"
      description="You're all caught up!"
      :action-text="null"
    />
  </QyCard>
</template>
```

### With Custom Slots

```vue
<template>
  <QyEmpty>
    <template #icon>
      <div class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
        <svg class="w-16 h-16 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
    </template>

    <template #title>
      <h3 class="text-2xl font-bold text-slate-800">Inbox Empty</h3>
    </template>

    <template #description>
      <p class="text-slate-500">
        Your inbox is empty. When you receive messages, they'll appear here.
      </p>
    </template>

    <template #action>
      <QyButton variant="primary" @click="handleCompose">
        Compose Message
      </QyButton>
    </template>
  </QyEmpty>
</template>

<script setup lang="ts">
const handleCompose = () => {
  console.log('Compose clicked')
}
</script>
```

### Different Empty States

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- No Data -->
    <QyCard>
      <QyEmpty
        title="No data"
        description="No data available for this view"
      />
    </QyCard>

    <!-- No Search Results -->
    <QyCard>
      <QyEmpty
        title="No results found"
        description="We couldn't find anything matching your search"
        action-text="Clear search"
        @action="handleClearSearch"
      />
    </QyCard>

    <!-- No Favorites -->
    <QyCard>
      <QyEmpty
        :icon="heartIcon"
        title="No favorites yet"
        description="Save items to your favorites to see them here"
        action-text="Start exploring"
      />
    </QyCard>

    <!-- Error State -->
    <QyCard>
      <QyEmpty
        :icon="errorIcon"
        title="Something went wrong"
        description="We encountered an error loading your data"
        action-text="Try again"
        @action="handleRetry"
      />
    </QyCard>
  </div>
</template>

<script setup lang="ts">
const heartIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>'

const errorIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'

const handleClearSearch = () => console.log('Clear search')
const handleRetry = () => console.log('Retry')
</script>
```

## Style Customization

The empty state uses Qingyu's design system:

- **Icon Color**: `text-slate-300` (light gray)
- **Title**: `text-xl font-medium text-slate-700`
- **Description**: `text-slate-500`
- **Spacing**: 3rem padding, centered layout
- **Action Button**: Uses QyButton with primary variant

## Common Icons

Here are some commonly used SVG icons for empty states:

### Book/Document
```html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
</svg>
```

### Search
```html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
```

### Inbox
```html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
</svg>
```

### Warning/Error
```html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
</svg>
```

## Best Practices

1. **Use clear messaging**: Be specific about why the state is empty
2. **Provide action**: Give users a clear next step when appropriate
3. **Use appropriate icons**: Match icons to the context
4. **Keep descriptions concise**: One or two sentences max
5. **Consider images**: For important empty states, consider custom illustrations

## Accessibility

- Icon is decorative (color provides visual emphasis)
- Title and description provide context
- Action button is keyboard accessible
- Semantic HTML structure

## Design Decisions

1. **Flexible content**: All major elements support slots for customization
2. **Icon vs Image**: Supports both SVG strings and image URLs
3. **Centered layout**: Standard pattern for empty states
4. **Slate colors**: Neutral tones that work in any context
5. **Optional action**: Action button only shows when actionText is provided
