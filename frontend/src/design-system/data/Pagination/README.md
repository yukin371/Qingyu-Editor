# Pagination 组件

用于数据分页展示的组件，支持页码跳转、每页数量选择、总页数统计等功能。

## 功能特性

- 支持**完整布局**配置（总数、每页数量、上一页、页码、下一页、跳转）
- 支持**背景色**样式
- 支持**禁用**状态
- 支持**只有一页时隐藏**
- 智能**页码省略**显示
- 支持**双向绑定** (v-model)
- 使用设计令牌，支持深色模式
- 基于 Tailwind CSS 和 CVA 构建

## 安装使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@/design-system'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
</script>

<template>
  <!-- 基础用法 -->
  <Pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="total"
  />

  <!-- 完整功能 -->
  <Pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="total"
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next, jumper"
  />

  <!-- 带背景色 -->
  <Pagination
    v-model:current-page="currentPage"
    :total="total"
    background
  />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `currentPage` | `number` | `1` | 当前页数，支持 `v-model` |
| `pageSize` | `number` | `10` | 每页显示条目个数，支持 `v-model` |
| `total` | `number` | `0` | 总条目数 |
| `pageSizes` | `number[]` | `[10, 20, 30, 40, 50]` | 每页显示个数选择器的选项设置 |
| `layout` | `string` | `'prev, pager, next'` | 组件布局，子组件名用逗号分隔 |
| `background` | `boolean` | `false` | 是否为分页按钮添加背景色 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `hideOnSinglePage` | `boolean` | `false` | 只有一页时是否隐藏 |
| `class` | `any` | `undefined` | 自定义类名 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:currentPage` | `(currentPage: number)` | 当前页改变时触发 |
| `update:pageSize` | `(pageSize: number)` | 每页数量改变时触发 |
| `sizeChange` | `(pageSize: number)` | pageSize 改变时触发 |
| `currentChange` | `(currentPage: number)` | currentPage 改变时触发 |

### 布局组件 (layout)

布局通过字符串配置，包含以下部分，用逗号分隔：

- `total`: 显示总条目数
- `sizes`: 每页数量选择器
- `prev`: 上一页按钮
- `pager`: 页码列表
- `next`: 下一页按钮
- `jumper`: 跳转输入框

## 使用示例

### 基础用法

```vue
<template>
  <Pagination
    v-model:current-page="currentPage"
    :total="100"
    :page-size="10"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentPage = ref(1)
</script>
```

### 完整功能

```vue
<template>
  <Pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="1000"
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next, jumper"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentPage = ref(1)
const pageSize = ref(10)
</script>
```

### 带背景色

```vue
<template>
  <Pagination
    v-model:current-page="currentPage"
    :total="100"
    background
  />
</template>
```

### 只有少量页码

当总页数较少（≤7）时，会显示所有页码：

```vue
<template>
  <Pagination
    v-model:current-page="currentPage"
    :total="50"
    :page-size="10"
  />
</template>
```

### 大量页码（带省略号）

当总页数较多（>7）时，会使用省略号：

```vue
<template>
  <Pagination
    v-model:current-page="currentPage"
    :total="1000"
    :page-size="10"
  />
</template>
```

### 只有一页时隐藏

```vue
<template>
  <!-- 当 total <= pageSize 时，组件会隐藏 -->
  <Pagination
    v-model:current-page="currentPage"
    :total="5"
    :page-size="10"
    hide-on-single-page
  />
</template>
```

### 禁用状态

```vue
<template>
  <Pagination
    v-model:current-page="currentPage"
    :total="100"
    :page-size="10"
    disabled
  />
</template>
```

### 事件监听

```vue
<template>
  <Pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="100"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentPage = ref(1)
const pageSize = ref(10)

const handleSizeChange = (size: number) => {
  console.log('每页数量变为:', size)
  // 重新加载数据
}

const handleCurrentChange = (page: number) => {
  console.log('当前页变为:', page)
  // 重新加载数据
}
</script>
```

### 结合表格使用

```vue
<template>
  <div>
    <!-- 数据表格 -->
    <table class="w-full">
      <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pageData" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.status }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 分页器 -->
    <div class="mt-4 flex justify-center">
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const allData = ref<any[]>([])

// 当前页的数据
const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allData.value.slice(start, end)
})

// 加载数据
const loadData = async () => {
  // 从 API 获取数据
  const response = await fetch(`/api/data?page=${currentPage.value}&size=${pageSize.value}`)
  const result = await response.json()

  total.value = result.total
  allData.value = result.data
}

// 监听页码和每页数量变化
watch([currentPage, pageSize], () => {
  loadData()
})

// 初始加载
loadData()
</script>
```

### 自定义布局

```vue
<template>
  <div class="space-y-4">
    <!-- 仅上一页、下一页 -->
    <Pagination
      v-model:current-page="currentPage"
      :total="100"
      layout="prev, next"
    />

    <!-- 仅页码 -->
    <Pagination
      v-model:current-page="currentPage"
      :total="100"
      layout="pager"
    />

    <!-- 总数 + 页码 + 跳转 -->
    <Pagination
      v-model:current-page="currentPage"
      :total="1000"
      layout="total, pager, jumper"
    />

    <!-- 每页数量 + 页码 -->
    <Pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="100"
      layout="sizes, pager"
    />
  </div>
</template>
```

## 设计规范

### 颜色

- 默认状态: `text-slate-600` (浅色), `text-slate-400` (深色)
- 悬停状态: `hover:bg-slate-100` (浅色), `hover:bg-slate-800` (深色)
- 激活状态: `bg-primary-500 text-white`
- 禁用状态: `text-slate-300` (浅色), `text-slate-700` (深色)
- 边框: `border-slate-200` (浅色), `border-slate-700` (深色)

### 尺寸

- 按钮: `h-8 w-8` (小尺寸), `h-10 w-10` (默认)
- 字体: `text-sm` (小尺寸), `text-base` (默认)
- 图标: `h-4 w-4`

### 间距

- 组件之间: `gap-2`
- 省略号边距: 自动计算

### 过渡动画

- 所有状态变化: `transition-all duration-200`

## 无障碍

- 按钮使用语义化的 `<button>` 元素
- 禁用状态使用 `disabled` 属性
- 支持键盘操作（Tab、Enter、Space）
- 输入框支持键盘导航（Enter 确认）

## 页码显示逻辑

当总页数 > 7 时，使用智能省略：

1. **当前页在前面** (1-4): 显示 `1 2 3 4 5 ... 10`
2. **当前页在后面** (7-10): 显示 `1 ... 6 7 8 9 10`
3. **当前页在中间** (5-6): 显示 `1 ... 4 5 6 ... 10`

始终显示第一页和最后一页，确保用户可以快速跳转。

## 相关组件

- [Table](../Table/) - 表格组件
- [Select](../form/Select/) - 下拉选择器
- [Button](../base/Button/) - 按钮组件
