# Empty 组件

空状态展示组件，用于在数据为空时向用户提供友好的提示信息。

## 功能特性

- 支持自定义描述和标题
- 支持自定义图标（使用 Icon 组件）
- 支持多种尺寸：sm, md, lg, xl
- 支持 Action 按钮插槽
- 支持完全自定义内容
- 响应式设计
- 支持点击事件
- 可访问性友好

## 基础用法

```vue
<script setup>
import Empty from '@/design-system/base/Empty'
</script>

<template>
  <!-- 基础空状态 -->
  <Empty />

  <!-- 带标题 -->
  <Empty
    title="还没有书单"
    description="创建你的第一个书单来收藏喜欢的书籍吧"
  />

  <!-- 带图标 -->
  <Empty
    icon="document"
    title="还没有文档"
    description="创建你的第一个文档开始写作吧"
  />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `description` | `string` | `'暂无数据'` | 空状态描述文字 |
| `title` | `string` | - | 空状态标题 |
| `icon` | `string` | - | 图标名称（使用 Icon 组件） |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Empty 尺寸 |
| `class` | `any` | - | 自定义类名 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `(event: MouseEvent)` | 点击事件 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| `action` | 操作按钮插槽 |
| `default` | 默认内容插槽（用于完全自定义） |

## 尺寸

```vue
<template>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <p class="mb-2 text-sm">Small</p>
      <Empty size="sm" icon="document" />
    </div>
    <div>
      <p class="mb-2 text-sm">Medium</p>
      <Empty size="md" icon="document" />
    </div>
    <div>
      <p class="mb-2 text-sm">Large</p>
      <Empty size="lg" icon="document" />
    </div>
    <div>
      <p class="mb-2 text-sm">Extra Large</p>
      <Empty size="xl" icon="document" />
    </div>
  </div>
</template>
```

尺寸规格：

- **sm**: 最小高度 120px，图标 32px，标题 14px，描述 12px
- **md**: 最小高度 200px，图标 48px，标题 16px，描述 14px
- **lg**: 最小高度 280px，图标 64px，标题 18px，描述 16px
- **xl**: 最小高度 360px，图标 80px，标题 20px，描述 18px

## Action 按钮

使用 `action` 插槽添加操作按钮：

```vue
<template>
  <Empty
    icon="document"
    title="还没有书单"
    description="创建你的第一个书单来收藏喜欢的书籍吧"
  >
    <template #action>
      <button class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
        创建书单
      </button>
    </template>
  </Empty>
</template>
```

## 自定义内容

使用默认插槽完全自定义内容：

```vue
<template>
  <Empty>
    <div class="flex flex-col items-center gap-3">
      <svg class="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-base font-medium text-slate-700">没有找到相关内容</p>
      <p class="text-sm text-slate-500 text-center max-w-md">
        试试调整搜索关键词或清除筛选条件
      </p>
      <button class="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
        清除筛选
      </button>
    </div>
  </Empty>
</template>
```

## 使用场景

### 列表空状态

```vue
<template>
  <div class="border border-slate-200 rounded-lg p-8">
    <Empty
      v-if="items.length === 0"
      icon="document"
      title="还没有项目"
      description="创建第一个项目开始吧"
    >
      <template #action>
        <button @click="createItem" class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          创建项目
        </button>
      </template>
    </Empty>
    <div v-else>
      <!-- 列表内容 -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([])

const createItem = () => {
  // 创建项目逻辑
}
</script>
```

### 搜索结果空状态

```vue
<template>
  <div class="border border-slate-200 rounded-lg p-8">
    <Empty
      v-if="searchResults.length === 0"
      icon="magnifying-glass"
      title="没有找到相关结果"
      description="试试使用不同的关键词进行搜索"
    >
      <template #action>
        <button @click="clearSearch" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">
          清除搜索
        </button>
      </template>
    </Empty>
  </div>
</template>
```

### 通知空状态

```vue
<template>
  <div class="border border-slate-200 rounded-lg p-8">
    <Empty
      v-if="notifications.length === 0"
      icon="bell"
      title="暂无通知"
      description="当前没有新的通知消息"
    />
  </div>
</template>
```

### 用户列表空状态

```vue
<template>
  <div class="border border-slate-200 rounded-lg p-8">
    <Empty
      v-if="users.length === 0"
      icon="user"
      title="还没有用户"
      description="添加第一个用户开始管理吧"
    >
      <template #action>
        <button @click="addUser" class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          添加用户
        </button>
      </template>
    </Empty>
  </div>
</template>
```

## 点击事件

```vue
<template>
  <Empty
    icon="plus"
    description="点击创建新内容"
    class="cursor-pointer hover:bg-slate-50 transition-colors rounded-lg"
    @click="handleClick"
  />
</template>

<script setup>
const handleClick = () => {
  console.log('Empty clicked!')
}
</script>
```

## 样式定制

使用 `class` 属性进行样式定制：

```vue
<template>
  <!-- 自定义容器样式 -->
  <Empty
    icon="document"
    description="暂无数据"
    class="min-h-[400px] bg-slate-50"
  />
</template>
```

## 可访问性

- 组件使用 `role="status"` 和 `aria-live="polite"` 属性
- 支持键盘导航和点击事件
- 图标使用 Icon 组件，继承其可访问性特性

## 设计规范

### 布局

- 居中布局：`flex flex-col items-center justify-center`
- 垂直间距：使用 Tailwind gap 工具类
- 描述文字最大宽度：`max-w-md` 确保可读性

### 颜色

- 图标：`text-slate-400`
- 标题：`text-slate-700` / `dark:text-slate-300`
- 描述：`text-slate-500` / `dark:text-slate-400`

### 尺寸关系

| Size | Icon | Title | Description | Container |
|------|------|-------|-------------|-----------|
| sm | h-8 w-8 | text-sm | text-xs | min-h-[120px] gap-3 |
| md | h-12 w-12 | text-base | text-sm | min-h-[200px] gap-4 |
| lg | h-16 w-16 | text-lg | text-base | min-h-[280px] gap-5 |
| xl | h-20 w-20 | text-xl | text-lg | min-h-[360px] gap-6 |

### 图标建议

根据不同场景使用合适的图标：

- 列表/文档：`document`
- 用户：`user`
- 搜索：`magnifying-glass`
- 通知：`bell`
- 通用空状态：`information-circle`
- 创建：`plus`

## 最佳实践

1. **提供明确的行动指引**：使用 `action` 插槽提供明确的操作按钮
2. **友好的文案**：描述文字应该友好、清晰，告诉用户为什么没有数据以及可以做什么
3. **合适的尺寸**：根据页面空间选择合适的尺寸
4. **保持一致**：在相似场景使用相同的空状态样式
