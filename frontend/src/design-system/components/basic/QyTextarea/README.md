# QyTextarea 多行文本框组件

Qingyu 风格的多行文本输入组件，与 Element Plus Input[type="textarea"] API 兼容。

## 功能特性

- ✅ 多行文本输入
- ✅ 字数统计显示
- ✅ 自定义行数
- ✅ 调整大小控制
- ✅ 多种状态（默认、错误、成功、警告）
- ✅ 禁用和只读状态
- ✅ 多种尺寸
- ✅ 最大/最小长度限制

## 基础用法

### 基本使用

```vue
<template>
  <QyTextarea
    v-model="value"
    placeholder="请输入内容"
    :rows="3"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
</script>
```

### 字数统计

```vue
<template>
  <QyTextarea
    v-model="value"
    placeholder="请输入内容（最多200字）"
    :rows="4"
    :maxlength="200"
    show-count
  />
</template>
```

### 禁用状态

```vue
<template>
  <QyTextarea
    v-model="value"
    placeholder="禁用状态"
    disabled
  />
</template>
```

### 只读状态

```vue
<template>
  <QyTextarea
    v-model="value"
    placeholder="只读状态"
    readonly
  />
</template>
```

### 不同尺寸

```vue
<template>
  <QyTextarea size="sm" placeholder="小尺寸" :rows="2" />
  <QyTextarea size="md" placeholder="默认尺寸" :rows="3" />
  <QyTextarea size="lg" placeholder="大尺寸" :rows="4" />
</template>
```

### 不同状态

```vue
<template>
  <QyTextarea state="default" placeholder="默认状态" />
  <QyTextarea state="error" placeholder="错误状态" />
  <QyTextarea state="success" placeholder="成功状态" />
  <QyTextarea state="warning" placeholder="警告状态" />
</template>
```

### 调整大小控制

```vue
<template>
  <QyTextarea resize="none" placeholder="不可调整大小" />
  <QyTextarea resize="vertical" placeholder="垂直调整" />
  <QyTextarea resize="horizontal" placeholder="水平调整" />
  <QyTextarea resize="both" placeholder="双向调整" />
</template>
```

### 最小/最大长度

```vue
<template>
  <QyTextarea
    v-model="value"
    placeholder="请输入10-200字"
    :minlength="10"
    :maxlength="200"
    show-count
  />
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | string | - |
| rows | 显示行数 | number | 3 |
| rowsMin | 最小行数 | number | 1 |
| rowsMax | 最大行数 | number | - |
| maxlength | 最大长度 | number | - |
| minlength | 最小长度 | number | - |
| showCount | 是否显示字数统计 | boolean | false |
| resize | 调整大小方式 | 'none' \| 'both' \| 'horizontal' \| 'vertical' | 'vertical' |
| disabled | 是否禁用 | boolean | false |
| readonly | 是否只读 | boolean | false |
| error | 是否错误状态 | boolean | false |
| state | 表单状态 | 'default' \| 'error' \| 'success' \| 'warning' | 'default' |
| placeholder | 占位符 | string | - |
| autofocus | 自动聚焦 | boolean | false |
| autocomplete | 自动完成 | string | - |
| name | 表单名称 | string | - |
| id | 表单 ID | string | - |
| required | 是否必填 | boolean | false |
| size | 尺寸 | 'sm' \| 'md' \| 'lg' | 'md' |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 值改变时触发 | 当前值 |
| focus | 获得焦点时触发 | event: FocusEvent |
| blur | 失去焦点时触发 | event: FocusEvent |
| input | 输入时触发 | event: Event |
| change | 内容改变时触发 | event: Event |

### 暴露方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| focus | 使输入框获取焦点 | - |
| blur | 使输入框失去焦点 | - |

## 样式定制

### 尺寸规范

| 尺寸 | 水平内边距 | 垂直内边距 | 字体大小 | 最小高度 |
|------|-----------|-----------|----------|----------|
| sm | 12px | 8px | 12px | 80px |
| md | 16px | 12px | 14px | 100px |
| lg | 20px | 16px | 16px | 120px |

### 颜色规范

| 状态 | 边框颜色 | 背景颜色 | 聚焦边框 | 聚焦环 |
|------|----------|----------|----------|--------|
| default | slate-300 | white | cyan-500 | cyan-500/20 |
| error | red-500 | red-50 | red-500 | red-500/20 |
| success | green-500 | green-50 | green-500 | green-500/20 |
| warning | yellow-500 | yellow-50 | yellow-500 | yellow-500/20 |

### 字数统计颜色

- 正常：`text-slate-400`
- 警告（剩余 < 10%）：`text-yellow-600`
- 超出限制：`text-red-500`

## 与 Element Plus 兼容性

QyTextarea 组件与 Element Plus Input[type="textarea"] 组件 API 兼容：

```vue
<!-- Element Plus -->
<el-input v-model="value" type="textarea" :rows="3" />

<!-- QyTextarea -->
<qy-textarea v-model="value" :rows="3" />
```

## 注意事项

1. 字数统计只在设置 `showCount` 和 `maxlength` 时才显示
2. 当剩余字符数少于 10% 时，字数统计会显示警告颜色
3. 超出最大长度限制时，字数统计会显示红色
4. `resize` 属性控制用户是否可以调整文本框大小
5. 使用 `rows` 属性设置初始显示行数

## 相关组件

- [QyInput](../QyInput/) - 单行输入框组件
- [QyForm](../../advanced/QyForm/) - 表单组件
- [QySelect](../QySelect/) - 选择器组件
