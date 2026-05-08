# Transfer 穿梭框组件

双栏列表选择组件，用于在两个列表间移动数据项。

## 功能特性

- 基本的数据穿梭功能
- 可搜索/过滤
- 自定义数据字段名
- 自定义渲染内容
- 自定义标题和按钮文本
- 支持禁用项
- 支持目标列表排序
- 全选/取消全选
- 响应式设计
- 完整的事件系统

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Transfer from '@/design-system/other/Transfer'

const data = ref([
  { key: 1, label: '选项 1' },
  { key: 2, label: '选项 2' },
  { key: 3, label: '选项 3' },
  { key: 4, label: '选项 4', disabled: true },
  { key: 5, label: '选项 5' },
])

const value = ref([1, 3])
</script>

<template>
  <Transfer v-model="value" :data="data" />
</template>
```

## 可搜索

设置 `filterable` 属性即可启用搜索功能。

```vue
<Transfer v-model="value" :data="data" :filterable="true" />
```

## 自定义搜索

使用 `filter-method` 自定义搜索逻辑。

```vue
<script setup lang="ts">
const filterMethod = (query: string, item: any) => {
  return item.label.toLowerCase().includes(query.toLowerCase())
}
</script>

<template>
  <Transfer
    v-model="value"
    :data="data"
    :filterable="true"
    :filter-method="filterMethod"
  />
</template>
```

## 自定义字段名

使用 `props` 属性自定义数据字段名。

```vue
<script setup lang="ts">
const data = [
  { id: 1, name: '张三', disabled: false },
  { id: 2, name: '李四', disabled: false },
]

const customProps = {
  key: 'id',
  label: 'name',
  disabled: 'disabled',
}
</script>

<template>
  <Transfer v-model="value" :data="data" :props="customProps" />
</template>
```

## 自定义渲染

使用 `render-content` 插槽自定义列表项渲染。

```vue
<script setup lang="ts">
import { h } from 'vue'

const renderContent = (item: any) => {
  return h('div', { class: 'flex items-center' }, [
    h('span', { class: 'text-2xl mr-3' }, item.icon),
    h('div', [
      h('div', { class: 'font-semibold' }, item.name),
      h('div', { class: 'text-xs text-slate-500' }, item.desc),
    ]),
  ])
}
</script>

<template>
  <Transfer v-model="value" :data="data" :render-content="renderContent" />
</template>
```

## 自定义标题和按钮

使用 `titles` 和 `button-texts` 自定义标题和按钮文本。

```vue
<Transfer
  v-model="value"
  :data="data"
  :titles="['所有用户', '已选用户']"
  :button-texts="['添加', '移除']"
/>
```

## 目标排序

使用 `target-order` 控制目标列表的排序方式。

```vue
<!-- 原始顺序（默认） -->
<Transfer v-model="value" :data="data" target-order="original" />

<!-- 追加到末尾 -->
<Transfer v-model="value" :data="data" target-order="push" />

<!-- 插入到开头 -->
<Transfer v-model="value" :data="data" target-order="unshift" />
```

## 事件监听

```vue
<script setup lang="ts">
const handleChange = (
  targetValue: (string | number)[],
  direction: 'left' | 'right',
  movedKeys: (string | number)[]
) => {
  console.log('目标列表:', targetValue)
  console.log('移动方向:', direction)
  console.log('移动的项:', movedKeys)
}

const handleLeftCheckChange = (
  checkedValues: (string | number)[],
  checkedItems: any[]
) => {
  console.log('左侧选中:', checkedValues, checkedItems)
}

const handleRightCheckChange = (
  checkedValues: (string | number)[],
  checkedItems: any[]
) => {
  console.log('右侧选中:', checkedValues, checkedItems)
}
</script>

<template>
  <Transfer
    v-model="value"
    :data="data"
    @change="handleChange"
    @left-check-change="handleLeftCheckChange"
    @right-check-change="handleRightCheckChange"
  />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `TransferPropsOption[]` | `[]` | 数据源 |
| `modelValue` | `(string \| number)[]` | `[]` | 目标列表的键数组 |
| `filterable` | `boolean` | `false` | 是否可搜索 |
| `filterPlaceholder` | `string` | `'请输入搜索内容'` | 搜索框占位文本 |
| `filterMethod` | `(query: string, item: TransferPropsOption) => boolean` | - | 自定义搜索方法 |
| `titles` | `string[]` | `['源列表', '目标列表']` | 自定义标题列表 |
| `buttonTexts` | `string[]` | `[]` | 按钮文本列表 |
| `renderContent` | `RenderFunction` | - | 自定义项渲染函数 |
| `format` | `string` | `'{label}'` | 列表项展示格式 |
| `props` | `{ key: string, label: string, disabled: string }` | `{ key: 'key', label: 'label', disabled: 'disabled' }` | 数据项字段配置 |
| `leftDefaultChecked` | `(string \| number)[]` | `[]` | 左侧默认选中 |
| `rightDefaultChecked` | `(string \| number)[]` | `[]` | 右侧默认选中 |
| `targetOrder` | `'original' \| 'push' \| 'unshift'` | `'original'` | 目标列表排序方式 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: (string \| number)[])` | 更新 modelValue |
| `change` | `(targetValue, direction, movedKeys)` | 变化时触发 |
| `left-check-change` | `(checkedValues, checkedItems)` | 左侧选中变化 |
| `right-check-change` | `(checkedValues, checkedItems)` | 右侧选中变化 |

### Types

```typescript
// 数据项配置
interface TransferPropsOption {
  key?: string | number
  label?: string
  disabled?: boolean
  [key: string]: any
}

// 目标列表排序方式
type TransferTargetOrder = 'original' | 'push' | 'unshift'
```

## 最佳实践

### 1. 用户角色选择

```vue
<script setup lang="ts">
import { ref, h } from 'vue'

const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '开发者' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '设计师' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '产品经理' },
]

const selectedUsers = ref<number[]>([])

const renderContent = (item: any) => {
  return h('div', { class: 'flex items-center justify-between w-full' }, [
    h('div', { class: 'flex items-center' }, [
      h('div', {
        class: 'w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm mr-3'
      }, item.name[0]),
      h('div', [
        h('div', { class: 'text-sm font-medium' }, item.name),
        h('div', { class: 'text-xs text-slate-500' }, item.email),
      ]),
    ]),
    h('span', { class: 'px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded' }, item.role),
  ])
}
</script>

<template>
  <Transfer
    v-model="selectedUsers"
    :data="users"
    :props="{ key: 'id', label: 'name', disabled: 'disabled' }"
    :titles="['所有用户', '团队成员']"
    :filterable="true"
    :render-content="renderContent"
  />
</template>
```

### 2. 权限配置

```vue
<script setup lang="ts">
const permissions = [
  { key: 'read', label: '读取权限', description: '允许查看数据' },
  { key: 'write', label: '写入权限', description: '允许修改数据' },
  { key: 'delete', label: '删除权限', description: '允许删除数据' },
  { key: 'admin', label: '管理权限', description: '允许管理用户' },
]

const userPermissions = ref(['read'])
</script>

<template>
  <Transfer
    v-model="userPermissions"
    :data="permissions"
    :titles="['可用权限', '已分配权限']"
    target-order="push"
  />
</template>
```

### 3. 商品分类选择

```vue
<script setup lang="ts">
const categories = [
  { key: 'electronics', label: '电子产品', icon: '📱' },
  { key: 'clothing', label: '服装鞋帽', icon: '👔' },
  { key: 'food', label: '食品饮料', icon: '🍔' },
  { key: 'books', label: '图书音像', icon: '📚' },
  { key: 'sports', label: '运动户外', icon: '⚽' },
]

const selectedCategories = ref<string[]>([])
</script>

<template>
  <Transfer
    v-model="selectedCategories"
    :data="categories"
    :filterable="true"
    :titles="['所有分类', '已选分类']"
  />
</template>
```

### 4. 表单验证

```vue
<script setup lang="ts">
const value = ref<number[]>([])
const error = ref('')

const validate = () => {
  if (value.value.length === 0) {
    error.value = '请至少选择一项'
    return false
  }
  if (value.value.length > 5) {
    error.value = '最多只能选择 5 项'
    return false
  }
  error.value = ''
  return true
}
</script>

<template>
  <div>
    <Transfer
      v-model="value"
      :data="data"
      @change="validate"
    />
    <div v-if="error" class="mt-4 text-red-500 text-sm">
      {{ error }}
    </div>
  </div>
</template>
```

### 5. 大数据量优化

```vue
<script setup lang="ts">
const data = ref<any[]>([])

// 分页加载数据
const loadData = async (page: number, pageSize: number) => {
  const response = await fetch(`/api/data?page=${page}&size=${pageSize}`)
  const result = await response.json()
  data.value = [...data.value, ...result.items]
}

onMounted(() => {
  loadData(1, 50)
})
</script>

<template>
  <Transfer
    v-model="value"
    :data="data"
    :filterable="true"
    filter-placeholder="搜索以快速定位"
  />
</template>
```

## 注意事项

1. **唯一键**：确保每个数据项的 `key` 值唯一
2. **性能优化**：大数据量时配合 `filterable` 使用搜索功能
3. **禁用项**：禁用的项无法被选中或移动
4. **响应式**：组件会自动适应容器宽度
5. **表单验证**：建议配合验证逻辑使用

## 可访问性

- 支持键盘导航
- 清晰的视觉反馈
- 语义化的 HTML 结构
- 适当的 ARIA 属性

## 相关组件

- [Checkbox](../../form/Checkbox/README.md) - 复选框组件
- [Select](../../form/Select/README.md) - 选择器组件
- [Form](../../form/Form/README.md) - 表单组件
