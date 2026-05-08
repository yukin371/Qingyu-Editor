# List 组件

列表容器组件，用于展示列表数据，支持边框、分割线、加载状态和空状态。

## 特性

- ✅ 支持数据驱动渲染
- ✅ 支持自定义列表项渲染
- ✅ 可选的边框和分割线
- ✅ 内置加载和空状态
- ✅ 支持列表项点击事件
- ✅ 支持禁用状态
- ✅ 灵活的插槽系统

## 使用方法

### 基础用法

```vue
<script setup>
import List from '@/design-system/base/List/List.vue'

const items = ['项目 1', '项目 2', '项目 3']
</script>

<template>
  <List :data="items" />
</template>
```

### 使用 ListItem 组件

```vue
<script setup>
import List from '@/design-system/base/List/List.vue'
import ListItem from '@/design-system/base/List/ListItem.vue'
</script>

<template>
  <List>
    <ListItem>项目 1</ListItem>
    <ListItem>项目 2</ListItem>
    <ListItem>项目 3</ListItem>
  </List>
</template>
```

### 带边框

```vue
<template>
  <List :data="items" :border="true" />
</template>
```

### 无分割线

```vue
<template>
  <List :data="items" :split="false" :border="true" />
</template>
```

### 加载状态

```vue
<template>
  <List :loading="true" />
</template>
```

### 自定义加载状态

```vue
<template>
  <List :loading="true">
    <template #loading>
      <div class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        <p class="mt-2 text-slate-600">正在加载数据...</p>
      </div>
    </template>
  </List>
</template>
```

### 空状态

```vue
<template>
  <List :data="[]" />
</template>
```

### 自定义空状态

```vue
<template>
  <List :data="[]">
    <template #empty>
      <div class="p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-slate-600">暂无数据，请稍后再试</p>
      </div>
    </template>
  </List>
</template>
```

### 自定义列表项

```vue
<script setup>
const users = [
  { name: '张三', email: 'zhangsan@example.com', role: '管理员' },
  { name: '李四', email: 'lisi@example.com', role: '用户' },
  { name: '王五', email: 'wangwu@example.com', role: '用户' },
]
</script>

<template>
  <List :data="users" :border="true">
    <template #item="{ item }">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-slate-900">{{ item.name }}</p>
          <p class="text-sm text-slate-500">{{ item.email }}</p>
        </div>
        <span class="text-sm text-slate-600">{{ item.role }}</span>
      </div>
    </template>
  </List>
</template>
```

### 点击事件

```vue
<script setup>
const items = ['项目 1', '项目 2', '项目 3']

const handleItemClick = (item, index) => {
  console.log('点击了:', item, '索引:', index)
}
</script>

<template>
  <List :data="items" @item-click="handleItemClick" />
</template>
```

### 禁用列表项

```vue
<template>
  <List :border="true">
    <ListItem>可用项目 1</ListItem>
    <ListItem :disabled="true">禁用项目 2</ListItem>
    <ListItem>可用项目 3</ListItem>
  </List>
</template>
```

### 带图标的列表

```vue
<template>
  <List :border="true">
    <ListItem>
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>首页</span>
      </div>
    </ListItem>
    <ListItem>
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>文档</span>
      </div>
    </ListItem>
    <ListItem>
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>设置</span>
      </div>
    </ListItem>
  </List>
</template>
```

## API

### List Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `any[]` | `[]` | 列表数据 |
| `border` | `boolean` | `false` | 是否显示边框 |
| `split` | `boolean` | `true` | 是否显示分割线 |
| `loading` | `boolean` | `false` | 加载状态 |
| `class` | `any` | - | 自定义类名 |

### List Slots

| 插槽 | 说明 | 参数 |
|------|------|------|
| `default` | 自定义列表渲染 | `{ data: any[], onItemClick: (item, index) => void }` |
| `item` | 自定义列表项 | `{ item: any, index: number }` |
| `loading` | 自定义加载状态 | - |
| `empty` | 自定义空状态 | - |

### List Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `itemClick` | `(item: any, index: number)` | 列表项点击事件 |

### ListItem Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `disabled` | `boolean` | `false` | 是否禁用 |
| `class` | `any` | - | 自定义类名 |

### ListItem Slots

| 插槽 | 说明 |
|------|------|
| `default` | 列表项内容 |

## 设计规范

### 尺寸规范

| 属性 | 值 | 说明 |
|------|-----|------|
| 内边距 | px-4 py-3 | 水平 1rem，垂直 0.75rem |
| 圆角 | rounded-lg | 0.5rem (8px) |

### 颜色规范

| 状态 | 背景色 | 文字色 | 说明 |
|------|--------|--------|------|
| 默认 | white | slate-900 | 默认状态 |
| 悬停 | slate-50 | - | 悬停状态 |
| 禁用 | - | opacity-50 | 禁用状态 |
| 边框 | - | slate-200 | 边框颜色 |
| 分割线 | - | slate-100 | 分割线颜色 |

### 过渡动画

| 属性 | 值 | 说明 |
|------|-----|------|
| 过渡 | transition-colors duration-150 | 150ms 颜色过渡 |

## 可访问性

- 使用语义化的 HTML 结构 (`<ul>`, `<li>`)
- 支持键盘导航和鼠标交互
- 禁用状态有视觉反馈
- 悬停状态有视觉反馈
