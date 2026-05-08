# Avatar 组件

用户头像展示组件，支持图片、fallback 文字和在线状态指示器。

## 功能特性

- 支持图片 src
- 支持 fallback 文字（自动取首字母）
- 支持多种尺寸：xs, sm, md, lg, xl, 2xl
- 支持多种形状：circle, square, rounded
- 支持在线状态指示器：online, offline, away, busy
- 响应式设计
- 支持点击事件
- 可访问性友好

## 基础用法

```vue
<script setup>
import Avatar from '@/design-system/base/Avatar'
</script>

<template>
  <!-- 图片头像 -->
  <Avatar
    src="https://example.com/avatar.jpg"
    alt="John Doe"
  />

  <!-- Fallback 文字 -->
  <Avatar
    alt="Jane Smith"
  />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | - | 头像图片 URL |
| `alt` | `string` | - | Fallback 文字或图片 alt 文本 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Avatar 尺寸 |
| `variant` | `'circle' \| 'square' \| 'rounded'` | `'circle'` | Avatar 形状 |
| `status` | `'online' \| 'offline' \| 'away' \| 'busy'` | - | 在线状态指示器 |
| `disableStatus` | `boolean` | `false` | 是否禁用状态指示器 |
| `class` | `any` | - | 自定义类名 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `(event: MouseEvent)` | 点击事件 |

## 尺寸

```vue
<template>
  <div class="flex items-center gap-2">
    <Avatar size="xs" alt="XS" />
    <Avatar size="sm" alt="SM" />
    <Avatar size="md" alt="MD" />
    <Avatar size="lg" alt="LG" />
    <Avatar size="xl" alt="XL" />
    <Avatar size="2xl" alt="2XL" />
  </div>
</template>
```

- `xs`: 24px (h-6 w-6 text-xs)
- `sm`: 32px (h-8 w-8 text-sm)
- `md`: 40px (h-10 w-10 text-base)
- `lg`: 48px (h-12 w-12 text-lg)
- `xl`: 64px (h-16 w-16 text-xl)
- `2xl`: 80px (h-20 w-20 text-2xl)

## 形状

```vue
<template>
  <div class="flex items-center gap-2">
    <Avatar variant="circle" src="avatar.jpg" alt="Circle" />
    <Avatar variant="square" src="avatar.jpg" alt="Square" />
    <Avatar variant="rounded" src="avatar.jpg" alt="Rounded" />
  </div>
</template>
```

## 状态指示器

```vue
<template>
  <div class="flex items-center gap-2">
    <Avatar status="online" src="avatar.jpg" alt="Online" />
    <Avatar status="offline" src="avatar.jpg" alt="Offline" />
    <Avatar status="away" src="avatar.jpg" alt="Away" />
    <Avatar status="busy" src="avatar.jpg" alt="Busy" />
  </div>
</template>
```

## Fallback 文字

当图片加载失败或未提供时，组件会显示 fallback 文字：

```vue
<template>
  <!-- 英文名：取首字母 -->
  <Avatar alt="John Doe" />  <!-- 显示 "JD" -->

  <!-- 单个单词：取首字母 -->
  <Avatar alt="Alice" />  <!-- 显示 "A" -->

  <!-- 中文名：取第一个字 -->
  <Avatar alt="张三" />  <!-- 显示 "张" -->

  <!-- 无 alt：显示问号 -->
  <Avatar />  <!-- 显示 "?" -->
</template>
```

## 用户列表

```vue
<template>
  <div class="flex flex-col gap-3">
    <div v-for="user in users" :key="user.id" class="flex items-center gap-3">
      <Avatar
        :src="user.avatar"
        :alt="user.name"
        :status="user.status"
      />
      <span>{{ user.name }}</span>
    </div>
  </div>
</template>

<script setup>
const users = [
  { id: 1, name: 'Alice Johnson', avatar: 'https://...', status: 'online' },
  { id: 2, name: 'Bob Smith', avatar: null, status: 'offline' },
]
</script>
```

## Avatar 组

```vue
<template>
  <div class="flex -space-x-2">
    <Avatar src="avatar1.jpg" alt="User 1" />
    <Avatar src="avatar2.jpg" alt="User 2" />
    <Avatar src="avatar3.jpg" alt="User 3" />
    <Avatar alt="+5" />
  </div>
</template>
```

## 点击事件

```vue
<template>
  <Avatar
    src="avatar.jpg"
    alt="Click me"
    class="cursor-pointer hover:ring-2 hover:ring-primary-500"
    @click="handleClick"
  />
</template>

<script setup>
const handleClick = (event) => {
  console.log('Avatar clicked!', event)
}
</script>
```

## 样式定制

使用 `class` 属性进行样式定制：

```vue
<template>
  <Avatar
    src="avatar.jpg"
    alt="Custom"
    class="ring-2 ring-primary-500"
  />
</template>
```

## 可访问性

- 组件使用 `role="img"` 和 `aria-label` 属性
- 状态指示器使用 `aria-hidden="true"` 避免干扰屏幕阅读器
- 支持键盘导航和点击事件

## 设计规范

- 默认使用圆形头像 (`circle`)
- 状态指示器位于右下角
- 状态颜色：
  - online: 绿色 (success)
  - offline: 灰色 (neutral-400)
  - away: 黄色 (warning)
  - busy: 红色 (danger)
