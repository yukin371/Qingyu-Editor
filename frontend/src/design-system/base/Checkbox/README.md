# Checkbox 组件

复选框组件，用于选择一个或多个选项。

## 特性

- ✅ 支持布尔值和数组值两种模式
- ✅ 3 种尺寸预设 (sm, md, lg)
- ✅ 4 种颜色变体 (primary, success, warning, danger)
- ✅ 半选状态 (indeterminate) 支持
- ✅ 禁用状态支持
- ✅ CheckboxGroup 组件支持
- ✅ 全选/取消全选功能
- ✅ 完整的键盘导航支持
- ✅ 可访问性 (ARIA) 兼容

## 使用方法

### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import Checkbox from '@/design-system/base/Checkbox/Checkbox.vue'

const checked = ref(false)
</script>

<template>
  <Checkbox v-model="checked" label="记住我" />
</template>
```

### 布尔模式

```vue
<script setup>
import { ref } from 'vue'

const terms = ref(false)
const newsletter = ref(true)
</script>

<template>
  <div class="space-y-2">
    <Checkbox v-model="terms" label="我同意服务条款" />
    <Checkbox v-model="newsletter" label="订阅新闻通讯" />
  </div>
</template>
```

### 数组模式

```vue
<script setup>
import { ref } from 'vue'

const selectedFruits = ref(['apple'])
</script>

<template>
  <div class="space-y-2">
    <Checkbox v-model="selectedFruits" value="apple" label="苹果" />
    <Checkbox v-model="selectedFruits" value="banana" label="香蕉" />
    <Checkbox v-model="selectedFruits" value="orange" label="橙子" />
  </div>
  <div>已选择: {{ selectedFruits }}</div>
</template>
```

### 使用 CheckboxGroup

```vue
<script setup>
import { ref } from 'vue'
import CheckboxGroup from '@/design-system/base/Checkbox/CheckboxGroup.vue'
import Checkbox from '@/design-system/base/Checkbox/Checkbox.vue'

const features = ref<string[]>([])
</script>

<template>
  <CheckboxGroup v-model="features">
    <Checkbox value="dashboard" label="仪表盘" />
    <Checkbox value="analytics" label="数据分析" />
    <Checkbox value="reports" label="报表生成" />
  </CheckboxGroup>
</template>
```

### 垂直排列

```vue
<template>
  <CheckboxGroup v-model="items" vertical>
    <Checkbox value="a" label="选项 A" />
    <Checkbox value="b" label="选项 B" />
    <Checkbox value="c" label="选项 C" />
  </CheckboxGroup>
</template>
```

### 尺寸

```vue
<template>
  <div class="space-y-2">
    <Checkbox size="sm" label="小尺寸" />
    <Checkbox size="md" label="中尺寸" />
    <Checkbox size="lg" label="大尺寸" />
  </div>
</template>
```

### 颜色

```vue
<template>
  <div class="space-y-2">
    <Checkbox color="primary" label="Primary" />
    <Checkbox color="success" label="Success" />
    <Checkbox color="warning" label="Warning" />
    <Checkbox color="danger" label="Danger" />
  </div>
</template>
```

### 禁用状态

```vue
<template>
  <div class="space-y-2">
    <Checkbox :disabled="true" label="禁用未选中" />
    <Checkbox :model-value="true" :disabled="true" label="禁用已选中" />
  </div>
</template>
```

### 半选状态

```vue
<script setup>
import { ref, computed } from 'vue'

const options = ['a', 'b', 'c', 'd']
const selected = ref(['a', 'b'])

const allSelected = computed(() => selected.value.length === options.length)
const indeterminate = computed(() => 
  selected.value.length > 0 && selected.value.length < options.length
)

const toggleAll = () => {
  selected.value = allSelected.value ? [] : [...options]
}
</script>

<template>
  <div class="space-y-2">
    <Checkbox
      :model-value="allSelected"
      :indeterminate="indeterminate"
      label="全选"
      @change="toggleAll"
    />
    <Checkbox v-for="option in options" :key="option" v-model="selected" :value="option" :label="option" />
  </div>
</template>
```

### 全选/取消全选

```vue
<script setup>
import { ref, computed } from 'vue'
import CheckboxGroup from '@/design-system/base/Checkbox/CheckboxGroup.vue'
import Checkbox from '@/design-system/base/Checkbox/Checkbox.vue'

const options = ['apple', 'banana', 'orange', 'grape']
const selected = ref<string[]>([])

const allSelected = computed(() => selected.value.length === options.length)
const indeterminate = computed(() => 
  selected.value.length > 0 && selected.value.length < options.length
)

const toggleAll = () => {
  if (allSelected.value) {
    selected.value = []
  } else {
    selected.value = [...options]
  }
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <Checkbox
        :model-value="allSelected"
        :indeterminate="indeterminate"
        label="全选"
        @change="toggleAll"
      />
      <span class="ml-2 text-sm text-slate-500">
        已选择 {{ selected.length }} / {{ options.length }} 项
      </span>
    </div>
    
    <CheckboxGroup v-model="selected">
      <Checkbox v-for="option in options" :key="option" :value="option" :label="option" />
    </CheckboxGroup>
  </div>
</template>
```

### 组级别禁用

```vue
<template>
  <CheckboxGroup v-model="items" :disabled="true">
    <Checkbox value="a" label="选项 A" />
    <Checkbox value="b" label="选项 B" />
    <Checkbox value="c" label="选项 C" />
  </CheckboxGroup>
</template>
```

### 统一尺寸

```vue
<template>
  <CheckboxGroup v-model="items" size="lg">
    <Checkbox value="a" label="选项 A" />
    <Checkbox value="b" label="选项 B" />
    <Checkbox value="c" label="选项 C" />
  </CheckboxGroup>
</template>
```

## API

### Checkbox Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `boolean \| string[]` | - | v-model 绑定值 |
| `value` | `string \| number \| boolean` | - | 复选框的值（数组模式需要） |
| `label` | `string` | - | 标签文本 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `indeterminate` | `boolean` | `false` | 半选状态 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 复选框尺寸 |
| `color` | `'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | 复选框颜色 |
| `class` | `any` | - | 自定义类名 |

### Checkbox Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: boolean \| string[])` | 值更新 |
| `change` | `(value: boolean \| string[])` | 状态改变 |

### Checkbox Slots

| 插槽 | 说明 |
|------|------|
| `default` | 自定义标签内容 |

### CheckboxGroup Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string[]` | - | v-model 绑定值数组 |
| `disabled` | `boolean` | `false` | 全局禁用状态 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 统一尺寸 |
| `vertical` | `boolean` | `false` | 垂直排列 |
| `class` | `any` | - | 自定义类名 |

### CheckboxGroup Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string[])` | 值更新 |
| `change` | `(value: string[])` | 状态改变 |

### CheckboxGroup Slots

| 插槽 | 说明 |
|------|------|
| `default` | Checkbox 组件列表 |

## 可访问性

- 支持键盘导航 (`Enter`, `Space`)
- 正确的 ARIA 属性
- 禁用状态正确处理
- 标签正确关联

## 设计规范

### 尺寸规范

| 尺寸 | 输入框大小 | 字体大小 | 图标大小 |
|------|-----------|----------|----------|
| sm | 16px | 14px | 12px |
| md | 20px | 16px | 16px |
| lg | 24px | 18px | 20px |

### 颜色规范

| 颜色 | 边框色 | 选中背景色 | Focus Ring |
|------|--------|-----------|------------|
| primary | slate-300 | primary-500 | primary-500 |
| success | slate-300 | success-500 | success-500 |
| warning | slate-300 | warning-500 | warning-500 |
| danger | slate-300 | danger-500 | danger-500 |

### 状态规范

- **未选中**: 空心方框，灰色边框
- **选中**: 实心方框，主题色背景，白色对勾
- **半选**: 实心方框，主题色背景，白色横线
- **禁用**: 降低透明度，禁止交互
- **Focus**: 显示 focus ring

## 最佳实践

### 1. 使用明确的标签文本

```vue
<!-- ✅ 好 -->
<Checkbox label="我同意服务条款和隐私政策" />

<!-- ❌ 不好 -->
<Checkbox label="我同意" />
```

### 2. 合理使用 CheckboxGroup

当有多个相关选项时，使用 CheckboxGroup 可以更好地组织代码：

```vue
<!-- ✅ 好 -->
<CheckboxGroup v-model="features">
  <Checkbox value="dashboard" label="仪表盘" />
  <Checkbox value="analytics" label="数据分析" />
  <Checkbox value="reports" label="报表生成" />
</CheckboxGroup>

<!-- ❌ 不好 - 重复代码 -->
<div>
  <Checkbox v-model="features" value="dashboard" label="仪表盘" />
  <Checkbox v-model="features" value="analytics" label="数据分析" />
  <Checkbox v-model="features" value="reports" label="报表生成" />
</div>
```

### 3. 提供视觉反馈

显示已选择的数量或状态：

```vue
<template>
  <div>
    <CheckboxGroup v-model="selected">
      <Checkbox value="a" label="选项 A" />
      <Checkbox value="b" label="选项 B" />
      <Checkbox value="c" label="选项 C" />
    </CheckboxGroup>
    <div class="text-sm text-slate-500">
      已选择 {{ selected.length }} 项
    </div>
  </div>
</template>
```

### 4. 正确使用半选状态

半选状态表示部分子项被选中：

```vue
<script setup>
const indeterminate = computed(() => 
  selected.value.length > 0 && selected.value.length < allOptions.length
)
</script>

<Checkbox
  :model-value="allSelected"
  :indeterminate="indeterminate"
  label="全选"
/>
```
