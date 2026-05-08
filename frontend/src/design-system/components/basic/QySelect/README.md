# QySelect 选择器组件

Qingyu 风格的下拉选择器组件，与 Element Plus Select API 兼容。

## 功能特性

- ✅ 单选模式
- ✅ 多选模式
- ✅ 可搜索（本地过滤）
- ✅ 远程搜索支持
- ✅ 可清空
- ✅ 禁用选项支持
- ✅ 加载状态
- ✅ 键盘导航
- ✅ 自定义插槽

## 基础用法

### 单选

```vue
<template>
  <QySelect
    v-model="value"
    :options="options"
    placeholder="请选择"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QySelect from '@/design-system/components/basic/QySelect'

const value = ref('')
const options = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]
</script>
```

### 多选

```vue
<template>
  <QySelect
    v-model="value"
    :options="options"
    multiple
    placeholder="请选择多个选项"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref([])
const options = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]
</script>
```

### 可搜索

```vue
<template>
  <QySelect
    v-model="value"
    :options="options"
    filterable
    placeholder="搜索选项..."
  />
</template>
```

### 可清空

```vue
<template>
  <QySelect
    v-model="value"
    :options="options"
    clearable
    placeholder="可清空选择"
  />
</template>
```

### 禁用状态

```vue
<template>
  <QySelect
    v-model="value"
    :options="options"
    disabled
    placeholder="禁用状态"
  />
</template>
```

### 不同尺寸

```vue
<template>
  <QySelect size="sm" placeholder="小尺寸" />
  <QySelect size="md" placeholder="默认尺寸" />
  <QySelect size="lg" placeholder="大尺寸" />
</template>
```

### 禁用选项

```vue
<template>
  <QySelect
    v-model="value"
    :options="options"
    placeholder="包含禁用选项"
  />
</template>

<script setup lang="ts">
const options = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2', disabled: true },
  { label: '选项3', value: '3' },
]
</script>
```

### 远程搜索

```vue
<template>
  <QySelect
    v-model="value"
    :options="options"
    filterable
    remote
    :remote-method="remoteMethod"
    :loading="loading"
    placeholder="远程搜索..."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
const options = ref([])
const loading = ref(false)

const remoteMethod = (query: string) => {
  if (query) {
    loading.value = true
    // 模拟异步搜索
    setTimeout(() => {
      options.value = [
        { label: `${query} 选项1`, value: '1' },
        { label: `${query} 选项2`, value: '2' },
      ]
      loading.value = false
    }, 500)
  } else {
    options.value = []
  }
}
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | string \| number \| boolean \| Array | - |
| options | 选项数组 | `QySelectOption[]` | [] |
| placeholder | 占位符 | string | '请选择' |
| disabled | 是否禁用 | boolean | false |
| clearable | 是否可清空 | boolean | false |
| multiple | 是否多选 | boolean | false |
| filterable | 是否可搜索 | boolean | false |
| size | 尺寸 | 'sm' \| 'md' \| 'lg' | 'md' |
| loading | 是否加载中 | boolean | false |
| remote | 是否远程搜索 | boolean | false |
| remoteMethod | 远程搜索方法 | (query: string) => void | - |
| popperMaxHeight | 下拉菜单最大高度 | number | 200 |

### QySelectOption

```typescript
interface QySelectOption {
  label: string           // 选项标签
  value: string | number  // 选项值
  disabled?: boolean      // 是否禁用
  [key: string]: any      // 自定义属性
}
```

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 值改变时触发 | 当前值 |
| change | 选项改变时触发 | 当前值 |
| focus | 获得焦点时触发 | event: FocusEvent |
| blur | 失去焦点时触发 | event: FocusEvent |
| clear | 清空时触发 | - |
| visibleChange | 下拉菜单显示/隐藏时触发 | visible: boolean |

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 自定义选项 | option: QySelectOption, index: number |
| prefix | 前缀内容 | - |
| empty | 空状态内容 | - |
| loading | 加载状态内容 | - |
| tag | 多选标签内容 | option: QySelectOption, index: number, handleClose: Function |

### 暴露方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| focus | 使输入框获取焦点 | - |
| blur | 使输入框失去焦点 | - |

## 样式定制

组件使用 Tailwind CSS 构建，可以通过以下方式定制：

### 尺寸规范

| 尺寸 | 高度 | 水平内边距 | 字体大小 |
|------|------|-----------|----------|
| sm | 32px | 8px | 12px |
| md | 40px | 12px | 14px |
| lg | 48px | 16px | 16px |

### 颜色规范

- 默认边框：`border-slate-300`
- 悬停边框：`border-cyan-400`
- 聚焦边框：`border-cyan-500`
- 聚焦环：`ring-cyan-500/20`
- 选中背景：`bg-cyan-100`
- 选中文字：`text-cyan-700`

## 键盘操作

| 按键 | 说明 |
|------|------|
| Enter | 打开下拉菜单 / 选择高亮选项 |
| Space | 打开下拉菜单 |
| Escape | 关闭下拉菜单 |
| ↑ | 向上移动高亮 |
| ↓ | 向下移动高亮 |

## 与 Element Plus 兼容性

QySelect 组件与 Element Plus Select 组件 API 完全兼容，可以直接替换：

```vue
<!-- Element Plus -->
<el-select v-model="value" :options="options" />

<!-- QySelect -->
<qy-select v-model="value" :options="options" />
```

## 注意事项

1. 多选模式下，`modelValue` 应该是数组类型
2. 远程搜索时，需要同时设置 `remote` 和 `remoteMethod`
3. `options` 数组中的每个对象必须有 `label` 和 `value` 属性
4. 下拉菜单使用 Teleport 渲染到 body，确保正确的层级

## 相关组件

- [QyInput](../QyInput/) - 输入框组件
- [QyForm](../../advanced/QyForm/) - 表单组件
- [QyTextarea](../QyTextarea/) - 多行文本输入组件
