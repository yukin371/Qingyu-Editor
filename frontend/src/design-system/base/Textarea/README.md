# Textarea 组件

多行文本输入组件，支持字数统计、各种状态和尺寸。

## 特性

- ✅ 3 种尺寸预设 (sm, md, lg)
- ✅ 字数统计显示
- ✅ 多种状态 (default, error, success, warning)
- ✅ 调整大小控制 (none, both, horizontal, vertical)
- ✅ 禁用和只读状态
- ✅ v-model 双向绑定
- ✅ 完整的表单验证支持
- ✅ 可访问性 (ARIA) 兼容

## 使用方法

### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import Textarea from '@/design-system/base/Textarea/Textarea.vue'

const content = ref('')
</script>

<template>
  <Textarea v-model="content" placeholder="请输入内容..." />
</template>
```

### 尺寸

```vue
<template>
  <div class="flex flex-col gap-4">
    <Textarea size="sm" placeholder="小尺寸文本框" />
    <Textarea size="md" placeholder="中等尺寸文本框" />
    <Textarea size="lg" placeholder="大尺寸文本框" />
  </div>
</template>
```

### 字数统计

```vue
<template>
  <Textarea
    v-model="content"
    :maxlength="200"
    :show-count="true"
    placeholder="最多输入200个字符"
  />
</template>
```

### 状态

```vue
<template>
  <div class="flex flex-col gap-4">
    <Textarea state="default" placeholder="默认状态" />
    <Textarea state="error" placeholder="错误状态" />
    <Textarea state="success" placeholder="成功状态" />
    <Textarea state="warning" placeholder="警告状态" />
  </div>
</template>
```

### 禁用和只读

```vue
<template>
  <div class="flex flex-col gap-4">
    <Textarea disabled placeholder="禁用状态" />
    <Textarea readonly value="这是只读内容" />
  </div>
</template>
```

### 调整大小

```vue
<template>
  <div class="flex flex-col gap-4">
    <Textarea resize="none" placeholder="不可调整大小" />
    <Textarea resize="vertical" placeholder="垂直调整" />
    <Textarea resize="horizontal" placeholder="水平调整" />
    <Textarea resize="both" placeholder="自由调整" />
  </div>
</template>
```

### 自定义行数

```vue
<template>
  <Textarea :rows="6" placeholder="显示6行" />
</template>
```

### 表单验证

```vue
<script setup>
import { computed, ref } from 'vue'

const content = ref('')

const isValid = computed(() => {
  return content.value.length >= 10
})

const errorMessage = computed(() => {
  if (content.value.length === 0) return '内容不能为空'
  if (content.value.length < 10) return '至少需要10个字符'
  return ''
})
</script>

<template>
  <div>
    <Textarea
      v-model="content"
      :state="isValid ? 'success' : 'error'"
      :minlength="10"
      :maxlength="500"
      :show-count="true"
      placeholder="请输入内容（10-500字符）"
    />
    <p v-if="errorMessage" class="mt-1 text-sm text-danger-DEFAULT">
      {{ errorMessage }}
    </p>
  </div>
</template>
```

### 事件处理

```vue
<script setup>
const handleFocus = (event: FocusEvent) => {
  console.log('获得焦点', event)
}

const handleBlur = (event: FocusEvent) => {
  console.log('失去焦点', event)
}

const handleInput = (event: Event) => {
  console.log('输入中', event)
}

const handleChange = (event: Event) => {
  console.log('内容变更', event)
}
</script>

<template>
  <Textarea
    @focus="handleFocus"
    @blur="handleBlur"
    @input="handleInput"
    @change="handleChange"
  />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | - | v-model 绑定值 |
| `rows` | `number` | `3` | 显示行数 |
| `rowsMin` | `number` | `1` | 最小行数 |
| `rowsMax` | `number` | - | 最大行数 |
| `maxlength` | `number` | - | 最大长度 |
| `minlength` | `number` | - | 最小长度 |
| `showCount` | `boolean` | `false` | 显示字数统计 |
| `resize` | `'none' \| 'both' \| 'horizontal' \| 'vertical'` | `'vertical'` | 调整大小 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `readonly` | `boolean` | `false` | 只读状态 |
| `error` | `boolean` | `false` | 错误状态 |
| `state` | `'default' \| 'error' \| 'success' \| 'warning'` | `'default'` | 状态 |
| `placeholder` | `string` | - | 占位符 |
| `autofocus` | `boolean` | `false` | 自动聚焦 |
| `autocomplete` | `string` | - | 自动完成 |
| `name` | `string` | - | 名称 |
| `id` | `string` | - | 表单 ID |
| `required` | `boolean` | `false` | 是否必填 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `class` | `any` | - | 自定义类名 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string)` | 值更新 |
| `focus` | `(event: FocusEvent)` | 获得焦点 |
| `blur` | `(event: FocusEvent)` | 失去焦点 |
| `input` | `(event: Event)` | 输入事件 |
| `change` | `(event: Event)` | 变更事件 |

## 设计规范

### 尺寸规范

| 尺寸 | 垂直内边距 | 水平内边距 | 字体大小 | 边框圆角 |
|------|-----------|-----------|----------|----------|
| sm | 8px | 12px | 14px | 6px |
| md | 12px | 16px | 16px | 6px |
| lg | 16px | 20px | 18px | 6px |

### 颜色规范

#### 默认状态
- 边框: slate-300
- 背景: white
- 占位符: slate-400
- 聚焦边框: primary-500
- 聚焦环: primary-500

#### 错误状态
- 边框: danger-DEFAULT
- 背景: danger-50
- 聚焦环: danger-DEFAULT

#### 成功状态
- 边框: success-DEFAULT
- 背景: success-50
- 聚焦环: success-DEFAULT

#### 警告状态
- 边框: warning-DEFAULT
- 背景: warning-50
- 聚焦环: warning-DEFAULT

### 字数统计规范

- 字体大小: 12px
- 正常颜色: slate-500
- 警告颜色 (剩余 < 10%): warning-DEFAULT
- 错误颜色 (超出限制): danger-DEFAULT

## 可访问性

- 支持键盘导航
- 正确的 ARIA 属性
- 禁用状态正确处理
- 只读状态正确处理
- 表单验证集成
- 字数统计屏幕阅读器友好

## 最佳实践

### 1. 合理设置最大长度
```vue
<!-- 好 -->
<Textarea :maxlength="500" :show-count="true" />

<!-- 避免 -->
<Textarea :maxlength="10000" />
```

### 2. 使用状态反馈
```vue
<!-- 好 -->
<Textarea :state="hasError ? 'error' : 'default'" />

<!-- 避免 -->
<Textarea :class="hasError ? 'border-red' : ''" />
```

### 3. 提供清晰的占位符
```vue
<!-- 好 -->
<Textarea placeholder="请详细描述您的建议，帮助我们改进产品" />

<!-- 避免 -->
<Textarea placeholder="..." />
```

### 4. 合理使用字数统计
```vue
<!-- 好 -->
<Textarea :maxlength="200" :show-count="true" />

<!-- 避免 -->
<Textarea :show-count="true" />
<!-- 没有 maxlength 时显示字数统计意义不大 -->
```

## 浏览器兼容性

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## 相关组件

- [Input](../Input/) - 单行文本输入
- [Select](../Select/) - 下拉选择
- [Checkbox](../Checkbox/) - 复选框
- [Radio](../Radio/) - 单选框
