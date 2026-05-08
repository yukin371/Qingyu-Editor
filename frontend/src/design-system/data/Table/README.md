# Table 组件

用于数据表格展示的组件，支持边框、斑马纹、排序、固定列、自定义渲染等功能。

## 功能特性

- 支持**边框**样式
- 支持**斑马纹**样式
- 支持**多种尺寸** (sm/md/lg)
- 支持**列宽自适应**
- 支持**表头显示/隐藏**
- 支持**行高亮**
- 支持**自定义单元格渲染**
- 支持**自定义行样式**
- 支持**列对齐** (左/中/右)
- 支持**列排序**
- 支持**空数据状态**
- 使用设计令牌，支持深色模式
- 基于 Tailwind CSS 和 CVA 构建

## 安装使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Table } from '@/design-system'

const data = ref([
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com' },
])

const columns = [
  { prop: 'id', label: 'ID', width: 80, align: 'center' },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'age', label: '年龄', width: 80, align: 'center' },
  { prop: 'email', label: '邮箱' },
]
</script>

<template>
  <!-- 基础用法 -->
  <Table :data="data" :columns="columns" />

  <!-- 带边框和斑马纹 -->
  <Table :data="data" :columns="columns" border stripe />

  <!-- 高亮当前行 -->
  <Table :data="data" :columns="columns" highlight-current-row />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `TableRowData[]` | `[]` | 表格数据 |
| `columns` | `Column[]` | `[]` | 列配置 |
| `border` | `boolean` | `false` | 是否显示纵向边框 |
| `stripe` | `boolean` | `false` | 是否显示斑马纹 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 表格尺寸 |
| `fit` | `boolean` | `true` | 列宽度是否自撑开 |
| `showHeader` | `boolean` | `true` | 是否显示表头 |
| `highlightCurrentRow` | `boolean` | `false` | 是否高亮当前行 |
| `emptyText` | `string` | `'暂无数据'` | 空数据时显示的文本内容 |
| `defaultSort` | `{ prop: string; order: SortOrder }` | `undefined` | 默认的排序列和顺序 |
| `rowClassName` | `string \| ((row: TableRowData, index: number) => string)` | `undefined` | 行样式的回调函数 |
| `rowKey` | `string \| ((row: TableRowData) => string)` | `undefined` | 行的 key 的函数 |
| `cellClassName` | `string \| ((row: TableRowData, column: Column, rowIndex: number, columnIndex: number) => string)` | `undefined` | 单元格样式的回调函数 |
| `class` | `any` | `undefined` | 自定义类名 |

### Column 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prop` | `string` | - | 列的唯一标识 |
| `label` | `string` | - | 列标题 |
| `width` | `number` | - | 列宽度 |
| `minWidth` | `number` | - | 列最小宽度 |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 对齐方式 |
| `sortable` | `boolean` | `false` | 是否可排序 |
| `fixed` | `'left' \| 'right'` | - | 固定列 |
| `render` | `(row: TableRowData, column: Column, index: number) => any` | - | 自定义列渲染函数 |
| `className` | `string \| ((row: TableRowData, column: Column, index: number) => string)` | - | 列类名 |
| `headerClassName` | `string` | - | 表头类名 |
| `type` | `'selection' \| 'index' \| 'expand'` | - | 列类型 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `select` | `(selection: TableRowData[], row: TableRowData)` | 当用户手动勾选数据行的 Checkbox 时触发 |
| `selectionChange` | `(selection: TableRowData[])` | 当选择项发生变化时会触发 |
| `sortChange` | `(sort: { prop: string; order: SortOrder })` | 当表格的排序条件发生变化时触发 |
| `rowClick` | `(row: TableRowData, column: Column \| undefined, event: Event)` | 当某一行被点击时触发 |
| `rowContextmenu` | `(row: TableRowData, column: Column \| undefined, event: Event)` | 当某一行被鼠标右键点击时触发 |
| `rowDblclick` | `(row: TableRowData, column: Column \| undefined, event: Event)` | 当某一行被双击时触发 |
| `cellMouseEnter` | `(row: TableRowData, column: Column, cell: EventTarget, event: Event)` | 当单元格 hover 进入时触发 |
| `cellMouseLeave` | `(row: TableRowData, column: Column, cell: EventTarget, event: Event)` | 当单元格 hover 退出时触发 |
| `rowMouseEnter` | `(row: TableRowData, column: Column \| undefined, event: Event)` | 当某一行被 hover 进入时触发 |
| `rowMouseLeave` | `(row: TableRowData, column: Column \| undefined, event: Event)` | 当某一行被 hover 退出时触发 |

## 使用示例

### 基础用法

```vue
<template>
  <Table :data="data" :columns="columns" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const data = ref([
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com' },
])

const columns = [
  { prop: 'id', label: 'ID', width: 80, align: 'center' },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'age', label: '年龄', width: 80, align: 'center' },
  { prop: 'email', label: '邮箱' },
]
</script>
```

### 带边框和斑马纹

```vue
<template>
  <Table :data="data" :columns="columns" border stripe />
</template>
```

### 可排序表格

```vue
<template>
  <Table
    :data="data"
    :columns="columns"
    @sort-change="handleSortChange"
  />
</template>

<script setup lang="ts">
const columns = [
  { prop: 'id', label: 'ID', width: 80, align: 'center', sortable: true },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'age', label: '年龄', width: 80, align: 'center', sortable: true },
  { prop: 'email', label: '邮箱' },
]

const handleSortChange = (sort: any) => {
  console.log('排序:', sort.prop, sort.order)
}
</script>
```

### 自定义单元格渲染

```vue
<template>
  <Table :data="data" :columns="columns" />
</template>

<script setup lang="ts">
import { h } from 'vue'

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', width: 120 },
  {
    prop: 'status',
    label: '状态',
    width: 120,
    render: (row: any) => {
      return row.status === '在职'
        ? h('span', { class: 'text-green-600' }, '在职')
        : h('span', { class: 'text-red-600' }, '离职')
    },
  },
  {
    prop: 'actions',
    label: '操作',
    width: 150,
    render: (row: any) => {
      return h('div', { class: 'flex gap-2' }, [
        h('button', {
          class: 'text-primary-600',
          onClick: () => console.log('编辑', row)
        }, '编辑'),
        h('button', {
          class: 'text-red-600',
          onClick: () => console.log('删除', row)
        }, '删除'),
      ])
    },
  },
]
</script>
```

### 自定义行样式

```vue
<template>
  <Table
    :data="data"
    :columns="columns"
    :row-class-name="rowClassName"
    stripe
  />
</template>

<script setup lang="ts">
const rowClassName = (row: any) => {
  if (row.status === '离职') {
    return 'bg-red-50 dark:bg-red-900/10'
  }
  return ''
}
</script>
```

### 不同尺寸

```vue
<template>
  <div class="space-y-4">
    <!-- 小尺寸 -->
    <Table :data="data" :columns="columns" size="sm" />

    <!-- 默认尺寸 -->
    <Table :data="data" :columns="columns" size="md" />

    <!-- 大尺寸 -->
    <Table :data="data" :columns="columns" size="lg" />
  </div>
</template>
```

### 高亮当前行

```vue
<template>
  <Table
    :data="data"
    :columns="columns"
    highlight-current-row
    @row-click="handleRowClick"
  />
</template>

<script setup lang="ts">
const handleRowClick = (row: any) => {
  console.log('点击了行:', row)
}
</script>
```

### 列对齐

```vue
<template>
  <Table :data="data" :columns="columns" border />
</template>

<script setup lang="ts">
const columns = [
  { prop: 'id', label: 'ID', width: 100, align: 'center' },
  { prop: 'name', label: '姓名', width: 150, align: 'left' },
  { prop: 'age', label: '年龄', width: 100, align: 'center' },
  { prop: 'salary', label: '薪资', width: 120, align: 'right' },
]
</script>
```

### 空数据状态

```vue
<template>
  <Table
    :data="[]"
    :columns="columns"
    empty-text="暂无员工数据"
  />
</template>
```

### 隐藏表头

```vue
<template>
  <Table :data="data" :columns="columns" :show-header="false" />
</template>
```

### 结合 Pagination 使用

```vue
<template>
  <div>
    <Table :data="pageData" :columns="columns" border stripe />
    <div class="mt-4 flex justify-center">
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const allData = ref<any[]>([])

const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allData.value.slice(start, end)
})
</script>
```

## 设计规范

### 颜色

- 默认文本: `text-slate-600` (浅色), `text-slate-400` (深色)
- 表头文本: `text-slate-700` (浅色), `text-slate-300` (深色)
- 表头背景: `bg-slate-50` (浅色), `bg-slate-800` (深色)
- 行背景: `bg-white` (浅色), `bg-slate-900` (深色)
- 斑马纹: `bg-slate-50` (浅色), `bg-slate-800/50` (深色)
- 高亮行: `bg-primary-50` (浅色), `bg-primary-900/20` (深色)
- 边框: `border-slate-200` (浅色), `border-slate-700` (深色)

### 尺寸

- 小尺寸 (sm): 内边距 `px-3 py-2`, 字体 `text-sm`
- 默认尺寸 (md): 内边距 `px-4 py-2.5`, 字体 `text-sm`
- 大尺寸 (lg): 内边距 `px-4 py-3`, 字体 `text-base`

### 间距

- 单元格内边距: 根据尺寸变化
- 列间距: 通过 border 实现

### 过渡动画

- 行 hover: `transition-colors duration-150`

## 无障碍

- 表格使用语义化的 `<table>` 元素
- 表头使用 `<thead>` 和 `<th>` 元素
- 表格内容使用 `<tbody>` 和 `<td>` 元素
- 支持键盘操作（Tab、Enter、Space）
- 行点击事件可被触发

## 相关组件

- [Pagination](../Pagination/) - 分页组件
- [Empty](../../base/Empty/) - 空状态组件
- [Button](../../base/Button/) - 按钮组件
