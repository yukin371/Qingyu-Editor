# Radio 组件

单选框组件，支持标准模式和按钮模式，提供多种尺寸和状态。

## 特性

- ✅ 标准模式和按钮模式
- ✅ 3 种尺寸预设 (sm, md, lg)
- ✅ 禁用状态支持
- ✅ 垂直/水平排列
- ✅ 完整的键盘导航支持
- ✅ v-model 双向绑定
- ✅ RadioGroup 统一管理
- ✅ 可访问性 (ARIA) 兼容

## 使用方法

### 基础用法

使用 `RadioGroup` 和 `Radio` 组件创建单选框组：

```vue
<script setup>
import { ref } from 'vue'
import Radio from '@/design-system/form/Radio/Radio.vue'
import RadioGroup from '@/design-system/form/Radio/RadioGroup.vue'

const selected = ref('option1')
</script>

<template>
  <RadioGroup v-model="selected">
    <Radio value="option1" label="选项 1" />
    <Radio value="option2" label="选项 2" />
    <Radio value="option3" label="选项 3" />
  </RadioGroup>
</template>
```

### 尺寸

提供三种尺寸：`sm`、`md`、`lg`。

```vue
<template>
  <RadioGroup v-model="selected" size="sm">
    <Radio value="small1" label="小尺寸选项 1" />
    <Radio value="small2" label="小尺寸选项 2" />
  </RadioGroup>

  <RadioGroup v-model="selected" size="md">
    <Radio value="medium1" label="中尺寸选项 1" />
    <Radio value="medium2" label="中尺寸选项 2" />
  </RadioGroup>

  <RadioGroup v-model="selected" size="lg">
    <Radio value="large1" label="大尺寸选项 1" />
    <Radio value="large2" label="大尺寸选项 2" />
  </RadioGroup>
</template>
```

### 按钮模式

启用按钮模式，单选框显示为按钮样式：

```vue
<template>
  <RadioGroup v-model="selected" :button="true">
    <Radio value="button1" label="按钮 1" />
    <Radio value="button2" label="按钮 2" />
    <Radio value="button3" label="按钮 3" />
  </RadioGroup>
</template>
```

### 禁用状态

可以禁用单个选项或整个组：

```vue
<template>
  <!-- 禁用单个选项 -->
  <RadioGroup v-model="selected">
    <Radio value="opt1" label="可用选项" />
    <Radio value="opt2" label="禁用选项" :disabled="true" />
    <Radio value="opt3" label="可用选项" />
  </RadioGroup>

  <!-- 禁用整个组 -->
  <RadioGroup v-model="selected" :disabled="true">
    <Radio value="disabled1" label="全部禁用 1" />
    <Radio value="disabled2" label="全部禁用 2" />
  </RadioGroup>
</template>
```

### 垂直排列

使用 `vertical` 属性启用垂直排列：

```vue
<template>
  <RadioGroup v-model="selected" :vertical="true">
    <Radio value="vertical1" label="垂直选项 1" />
    <Radio value="vertical2" label="垂直选项 2" />
    <Radio value="vertical3" label="垂直选项 3" />
  </RadioGroup>
</template>
```

### 自定义内容

使用插槽自定义选项内容：

```vue
<template>
  <RadioGroup v-model="selected">
    <Radio value="custom1">
      <span class="font-semibold">加粗标题 1</span>
      <span class="text-sm text-slate-500">- 描述文本</span>
    </Radio>
    <Radio value="custom2">
      <span class="font-semibold">加粗标题 2</span>
      <span class="text-sm text-slate-500">- 描述文本</span>
    </Radio>
  </RadioGroup>
</template>
```

### 事件处理

```vue
<script setup>
const handleChange = (value) => {
  console.log('选择改变:', value)
}
</script>

<template>
  <RadioGroup v-model="selected" @change="handleChange">
    <Radio value="event1" label="事件选项 1" />
    <Radio value="event2" label="事件选项 2" />
  </RadioGroup>
</template>
```

## API

### Radio Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| boolean` | - | v-model 绑定值 |
| `value` | `string \| number \| boolean` | - | 单选框的值 |
| `label` | `string` | - | 标签文本 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 单选框尺寸 |
| `button` | `boolean` | `false` | 按钮模式 |
| `class` | `any` | - | 自定义类名 |

### Radio Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string \| number \| boolean)` | 值更新 |
| `change` | `(value: string \| number \| boolean)` | 状态改变 |

### RadioGroup Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| boolean` | - | v-model 绑定值 |
| `disabled` | `boolean` | `false` | 全局禁用 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 统一尺寸 |
| `vertical` | `boolean` | `false` | 垂直排列 |
| `button` | `boolean` | `false` | 按钮模式 |
| `class` | `any` | - | 自定义类名 |

### RadioGroup Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string \| number \| boolean)` | 值更新 |
| `change` | `(value: string \| number \| boolean)` | 状态改变 |

### Slots

| 插槽 | 说明 |
|------|------|
| `default` | 单选框内容 |

## 设计规范

### 尺寸规范

#### 标准模式

| 尺寸 | 单选框大小 | 字体大小 | 间距 |
|------|-----------|----------|------|
| sm | 16px | 14px | 12px |
| md | 20px | 16px | 16px |
| lg | 24px | 18px | 16px |

#### 按钮模式

| 尺寸 | 高度 | 水平内边距 | 字体大小 |
|------|------|-----------|----------|
| sm | 32px | 12px | 14px |
| md | 40px | 16px | 16px |
| lg | 44px | 24px | 18px |

### 颜色规范

#### 标准模式

| 状态 | 边框色 | 背景色 | 选中色 |
|------|--------|--------|--------|
| 默认 | slate-300 | white | - |
| 选中 | primary-500 | primary-500 | white |
| 禁用 | slate-300 | - | - |
| 焦点 | - | - | primary-500 (ring) |

#### 按钮模式

| 状态 | 边框色 | 背景色 | 文字色 |
|------|--------|--------|--------|
| 未选中 | slate-300 | white | slate-700 |
| 已选中 | primary-500 | primary-500 | white |
| 禁用 | slate-300 | - | slate-400 |

## 可访问性

- 支持键盘导航 (`Arrow Keys`, `Enter`, `Space`)
- 正确的 ARIA 属性 (`role="radiogroup"`, `role="radio"`)
- 禁用状态正确处理
- 焦点可见性指示器
- 标签关联正确

## 示例

### 配送方式选择

```vue
<template>
  <div class="max-w-md">
    <h3 class="text-lg font-semibold mb-4">配送方式</h3>
    <RadioGroup v-model="shipping" :vertical="true">
      <Radio value="standard" label="标准配送 (3-5 个工作日)" />
      <Radio value="express" label="加急配送 (1-2 个工作日)" />
      <Radio value="overnight" label="次日达" />
    </RadioGroup>
  </div>
</template>
```

### 尺寸选择器

```vue
<template>
  <div>
    <h3 class="text-lg font-semibold mb-4">选择尺寸</h3>
    <RadioGroup v-model="size" size="sm" :button="true">
      <Radio value="s" label="S" />
      <Radio value="m" label="M" />
      <Radio value="l" label="L" />
      <Radio value="xl" label="XL" />
    </RadioGroup>
  </div>
</template>
```

### 通知方式

```vue
<template>
  <div>
    <h3 class="text-lg font-semibold mb-4">通知方式</h3>
    <RadioGroup v-model="notification" :button="true">
      <Radio value="email" label="邮件" />
      <Radio value="sms" label="短信" />
      <Radio value="push" label="推送" />
    </RadioGroup>
  </div>
</template>
```
