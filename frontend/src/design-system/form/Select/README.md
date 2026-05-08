# Select 选择器组件

功能完整的下拉选择组件，支持单选、多选、可搜索、可清空等特性。

## 特性

- ✅ 单选和多选模式
- ✅ 可搜索选项（本地过滤）
- ✅ 远程搜索支持
- ✅ 可清空选择
- ✅ 3 种尺寸预设 (sm, md, lg)
- ✅ 禁用选项支持
- ✅ 加载状态
- ✅ 空状态自定义
- ✅ 完整的键盘导航支持
- ✅ 可访问性 (ARIA) 兼容
- ✅ 自定义选项内容

## 使用方法

### 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Select from '@/design-system/form/Select/Select.vue'

const value = ref()
const options = [
  { label: '选项 1', value: 1 },
  { label: '选项 2', value: 2 },
  { label: '选项 3', value: 3 },
]
</script>

<template>
  <Select v-model="value" :options="options" placeholder="请选择" />
</template>
```

### 可清空

```vue
<template>
  <Select 
    v-model="value" 
    :options="options" 
    placeholder="请选择"
    clearable
  />
</template>
```

### 可搜索

```vue
<template>
  <Select 
    v-model="value" 
    :options="options" 
    placeholder="搜索选项"
    filterable
  />
</template>
```

### 多选

```vue
<script setup lang="ts">
const value = ref([1, 2])
</script>

<template>
  <Select 
    v-model="value" 
    :options="options" 
    placeholder="请选择多个选项"
    multiple
    clearable
  />
</template>
```

### 多选 + 可搜索

```vue
<template>
  <Select 
    v-model="value" 
    :options="options" 
    placeholder="选择编程语言"
    multiple
    filterable
    clearable
  />
</template>
```

### 禁用选项

```vue
<script setup lang="ts">
const options = [
  { label: '可用选项', value: 1 },
  { label: '禁用选项', value: 2, disabled: true },
  { label: '可用选项 2', value: 3 },
]
</script>

<template>
  <Select v-model="value" :options="options" />
</template>
```

### 禁用状态

```vue
<template>
  <Select 
    v-model="value" 
    :options="options" 
    disabled
  />
</template>
```

### 尺寸

```vue
<template>
  <div class="space-y-2">
    <Select size="sm" :options="options" placeholder="小尺寸" />
    <Select size="md" :options="options" placeholder="中等尺寸" />
    <Select size="lg" :options="options" placeholder="大尺寸" />
  </div>
</template>
```

### 加载状态

```vue
<template>
  <Select 
    v-model="value" 
    :options="[]" 
    loading
    placeholder="加载中..."
  />
</template>
```

### 远程搜索

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref()
const options = ref([])
const loading = ref(false)

const remoteMethod = async (query: string) => {
  if (query) {
    loading.value = true
    // 调用 API 获取数据
    const result = await fetchOptions(query)
    options.value = result
    loading.value = false
  } else {
    options.value = []
  }
}
</script>

<template>
  <Select 
    v-model="value" 
    :options="options" 
    :loading="loading"
    :remote-method="remoteMethod"
    remote
    filterable
    placeholder="输入关键词搜索"
  />
</template>
```

### 带前缀图标

```vue
<template>
  <Select v-model="value" :options="options">
    <template #prefix>
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>
    </template>
  </Select>
</template>
```

### 自定义选项内容

```vue
<template>
  <Select v-model="value" :options="options">
    <template #default="{ option }">
      <div class="flex items-center justify-between w-full">
        <span>{{ option.label }}</span>
        <span class="text-xs text-muted-foreground">{{ option.role }}</span>
      </div>
    </template>
  </Select>
</template>
```

### 自定义空状态

```vue
<template>
  <Select v-model="value" :options="[]">
    <template #empty>
      <div class="py-4 text-center">
        <svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <p class="mt-2 text-sm">暂无数据</p>
      </div>
    </template>
  </Select>
</template>
```

### 自定义加载状态

```vue
<template>
  <Select v-model="value" :options="[]" :loading="true">
    <template #loading>
      <div class="flex items-center justify-center py-4">
        <svg class="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span class="ml-2 text-sm">加载中...</span>
      </div>
    </template>
  </Select>
</template>
```

### 事件处理

```vue
<script setup lang="ts">
const handleChange = (value: any) => {
  console.log('选项改变:', value)
}

const handleFocus = (event: FocusEvent) => {
  console.log('获得焦点')
}

const handleBlur = (event: FocusEvent) => {
  console.log('失去焦点')
}

const handleClear = () => {
  console.log('清空选择')
}

const handleVisibleChange = (visible: boolean) => {
  console.log('下拉菜单显示:', visible)
}
</script>

<template>
  <Select 
    v-model="value" 
    :options="options"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
    @visible-change="handleVisibleChange"
  />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| (string \| number)[]` | - | v-model 绑定值 |
| `options` | `SelectOption[]` | `[]` | 选项数组 |
| `placeholder` | `string` | `'请选择'` | 占位符 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `clearable` | `boolean` | `false` | 可清空 |
| `multiple` | `boolean` | `false` | 多选 |
| `filterable` | `boolean` | `false` | 可搜索 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `loading` | `boolean` | `false` | 加载状态 |
| `remote` | `boolean` | `false` | 远程搜索 |
| `remoteMethod` | `(query: string) => void` | - | 远程搜索方法 |
| `popperMaxHeight` | `number` | `200` | 下拉菜单最大高度 |

### SelectOption

```typescript
interface SelectOption {
  label: string           // 选项标签
  value: string | number  // 选项值
  disabled?: boolean      // 是否禁用
  [key: string]: any      // 自定义属性
}
```

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string \| number \| (string \| number)[] \| undefined)` | 值更新事件 |
| `change` | `(value: string \| number \| (string \| number)[] \| undefined)` | 选项改变事件 |
| `focus` | `(event: FocusEvent)` | 获得焦点事件 |
| `blur` | `(event: FocusEvent)` | 失去焦点事件 |
| `clear` | `()` | 清空事件 |
| `visibleChange` | `(visible: boolean)` | 下拉显示/隐藏事件 |

### Slots

| 插槽 | 参数 | 说明 |
|------|------|------|
| `default` | `{ option: SelectOption, index: number }` | 自定义选项内容 |
| `prefix` | - | 前缀内容 |
| `empty` | - | 空状态内容 |
| `loading` | - | 加载状态内容 |
| `tag` | `{ option: SelectOption, index: number, handleClose: () => void }` | 多选标签内容 |

### 暴露方法

| 方法 | 说明 |
|------|------|
| `focus()` | 让输入框获得焦点 |
| `blur()` | 让输入框失去焦点 |

## 可访问性

- 支持键盘导航 (`Escape` 关闭下拉框)
- 正确的 ARIA 属性
- 禁用状态正确处理
- 清空按钮提供视觉反馈

## 设计规范

### 尺寸规范

| 尺寸 | 高度 | 水平内边距 | 字体大小 |
|------|------|-----------|----------|
| sm | 32px | 8px | 12px |
| md | 40px | 12px | 14px |
| lg | 48px | 16px | 16px |

### 颜色规范

| 状态 | 背景色 | 边框色 | 文字色 |
|------|--------|--------|--------|
| 默认 | white | border | foreground |
| 悬停 | white | border | foreground |
| 焦点 | white | ring | foreground |
| 禁用 | slate-50 | slate-200 | slate-400 |
| 选中 | slate-50 | primary | primary |

### 交互状态

- **悬停**: 边框颜色加深，显示可点击提示
- **焦点**: 显示 focus ring，提升可访问性
- **禁用**: 透明度降低，不可交互
- **加载**: 显示加载动画，选项列表禁用

## 使用建议

1. **选项数量**: 当选项超过 10 个时，建议启用 `filterable` 可搜索功能
2. **多选场景**: 多选时建议同时启用 `clearable`，方便清空所有选择
3. **远程数据**: 大数据量场景使用 `remote` + `remoteMethod` 实现远程搜索
4. **表单验证**: 配合 FormItem 使用时，注意验证值的类型
5. **性能优化**: 大量选项时建议设置合理的 `popperMaxHeight` 限制高度
