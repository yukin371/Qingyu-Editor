# Input 组件

功能完整的输入框组件，支持多种类型、尺寸和状态，是表单组件系列的核心组件。

## 功能特性

- **多种输入类型**: 支持 text、password、email、number、tel、url 六种输入类型
- **多种尺寸**: 支持 sm、md、lg 三种尺寸
- **前缀/后缀图标**: 支持图标前缀和后缀
- **插槽支持**: 支持 prepend 和 append 插槽用于自定义内容
- **可清空**: 支持一键清空输入内容
- **字数统计**: 支持显示当前输入字符数和最大长度限制
- **状态支持**: 支持禁用、只读、错误等状态
- **深色模式**: 支持自定义深色模式样式
- **v-model**: 完整的双向绑定支持
- **可访问性**: 符合 WCAG 可访问性标准

## 安装使用

```vue
<script setup lang="ts">
import { Input } from '@/design-system/form'
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Input v-model="value" placeholder="请输入内容" />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------------|------|
| `modelValue` | `string \| number` | `undefined` | v-model 绑定值 |
| `type` | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url'` | `'text'` | 输入类型 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 输入框尺寸 |
| `placeholder` | `string` | `undefined` | 占位符文本 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `error` | `boolean` | `false` | 是否为错误状态 |
| `maxlength` | `number` | `undefined` | 最大输入长度 |
| `showCount` | `boolean` | `false` | 是否显示字数统计 |
| `prefix` | `string` | `undefined` | 前缀图标名称 |
| `suffix` | `string` | `undefined` | 后缀图标名称 |
| `clearable` | `boolean` | `false` | 是否可清空 |
| `class` | `any` | `undefined` | 自定义类名 |

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `update:modelValue` | `(value: string \| number)` | 值更新时触发 |
| `focus` | `(event: FocusEvent)` | 获得焦点时触发 |
| `blur` | `(event: FocusEvent)` | 失去焦点时触发 |
| `change` | `(value: string \| number)` | 值改变时触发 |
| `clear` | `()` | 清空时触发 |

### Slots

| 插槽 | 描述 |
|------|------|
| `prefix` | 前缀内容（覆盖 prefix 属性） |
| `suffix` | 后缀内容（覆盖 suffix 属性） |
| `prepend` | 前置插槽（输入框前） |
| `append` | 后置插槽（输入框后） |

### Expose

| 方法 | 描述 |
|------|------|
| `focus()` | 让输入框获得焦点 |
| `blur()` | 让输入框失去焦点 |

## 输入类型

### Text

默认文本输入类型。

```vue
<Input type="text" v-model="value" placeholder="请输入文本" />
```

### Password

密码输入类型，输入内容会被隐藏。

```vue
<Input type="password" v-model="password" placeholder="请输入密码" />
```

### Email

邮箱输入类型，移动端会显示邮箱键盘。

```vue
<Input type="email" v-model="email" placeholder="example@email.com" />
```

### Number

数字输入类型。

```vue
<Input type="number" v-model="amount" placeholder="请输入数字" />
```

### Tel

电话输入类型，移动端会显示数字键盘。

```vue
<Input type="tel" v-model="phone" placeholder="请输入电话号码" />
```

### URL

网址输入类型。

```vue
<Input type="url" v-model="website" placeholder="https://example.com" />
```

## 尺寸

### Small (sm)

小尺寸输入框，适用于紧凑布局。

```vue
<Input size="sm" v-model="value" placeholder="小尺寸" />
```

- 高度: `h-8` (32px)
- 内边距: `px-2 py-1`
- 字体: `text-sm`

### Medium (md)

中等尺寸输入框，默认尺寸。

```vue
<Input size="md" v-model="value" placeholder="中等尺寸（默认）" />
```

- 高度: `h-10` (40px)
- 内边距: `px-3 py-2`
- 字体: `text-base`

### Large (lg)

大尺寸输入框，适用于需要强调的场景。

```vue
<Input size="lg" v-model="value" placeholder="大尺寸" />
```

- 高度: `h-12` (48px)
- 内边距: `px-4 py-3`
- 字体: `text-lg`

## 前缀和后缀图标

### 前缀图标

使用 `prefix` 属性添加前缀图标。

```vue
<Input prefix="user" v-model="username" placeholder="用户名" />
<Input prefix="envelope" v-model="email" placeholder="邮箱" />
<Input prefix="lock-closed" v-model="password" type="password" placeholder="密码" />
```

### 后缀图标

使用 `suffix` 属性添加后缀图标。

```vue
<Input suffix="globe-alt" v-model="website" placeholder="网站地址" />
<Input suffix="currency-dollar" v-model="price" type="number" placeholder="金额" />
```

### 前后缀组合

同时使用前缀和后缀。

```vue
<Input 
  prefix="user" 
  suffix="check" 
  v-model="username" 
  placeholder="用户名" 
/>
```

## 插槽使用

### Prepend 和 Append 插槽

用于在输入框前后添加自定义内容。

```vue
<Input v-model="url" placeholder="example">
  <template #prepend>https://</template>
  <template #append>.com</template>
</Input>
```

### Prefix 和 Suffix 插槽

用于自定义前缀和后缀内容（覆盖图标属性）。

```vue
<Input v-model="search" placeholder="搜索...">
  <template #prefix>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </template>
</Input>
```

## 状态

### 错误状态

使用 `error` 属性显示错误状态。

```vue
<Input v-model="email" error placeholder="邮箱地址" />
<p class="text-sm text-red-500">请输入有效的邮箱地址</p>
```

### 禁用状态

使用 `disabled` 属性禁用输入框。

```vue
<Input v-model="value" disabled placeholder="禁用的输入框" />
```

### 只读状态

使用 `readonly` 属性使输入框只读。

```vue
<Input v-model="value" readonly placeholder="只读的输入框" />
```

## 特殊功能

### 可清空

使用 `clearable` 属性添加清空按钮，输入内容后会显示清空图标。

```vue
<Input v-model="value" clearable placeholder="可清空的输入框" />
```

### 字数统计

使用 `showCount` 和 `maxlength` 属性显示字符计数。

```vue
<Input 
  v-model="value" 
  :maxlength="50" 
  show-count 
  placeholder="限制50个字符" 
/>
```

## 实际应用场景

### 登录表单

```vue
<div class="space-y-4">
  <div>
    <label class="block text-sm font-medium mb-1">邮箱</label>
    <Input 
      v-model="loginForm.email" 
      type="email" 
      prefix="envelope" 
      placeholder="请输入邮箱"
      clearable
    />
  </div>
  
  <div>
    <label class="block text-sm font-medium mb-1">密码</label>
    <Input 
      v-model="loginForm.password" 
      type="password" 
      prefix="lock-closed" 
      placeholder="请输入密码"
      clearable
    />
  </div>
  
  <button class="w-full py-2 bg-primary-500 text-white rounded-lg">
    登录
  </button>
</div>
```

### 搜索框

```vue
<Input 
  v-model="searchQuery" 
  prefix="magnifying-glass" 
  placeholder="搜索..." 
  clearable 
  size="lg"
  @change="handleSearch"
/>
```

### 表单验证

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const email = ref('')
const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})
</script>

<template>
  <Input 
    v-model="email" 
    type="email" 
    prefix="envelope"
    :error="email !== '' && !isValidEmail"
    placeholder="请输入邮箱"
  />
  <p v-if="email !== '' && !isValidEmail" class="text-sm text-red-500">
    请输入有效的邮箱地址
  </p>
</template>
```

### 用户信息编辑

```vue
<div class="space-y-4">
  <Input v-model="user.name" prefix="user" placeholder="用户名" />
  <Input v-model="user.email" type="email" prefix="envelope" placeholder="邮箱" />
  <Input v-model="user.phone" type="tel" prefix="phone" placeholder="电话" />
  <Input v-model="user.website" type="url" prefix="globe-alt" placeholder="个人网站" clearable />
</div>
```

### 密码强度检测

```vue
<Input 
  v-model="password" 
  type="password" 
  prefix="lock-closed" 
  :maxlength="20"
  show-count
  placeholder="请输入密码（6-20位）"
  @change="checkPasswordStrength"
/>
```

## 样式定制

使用 `class` 属性添加自定义样式。

```vue
<Input 
  v-model="value" 
  class="shadow-lg focus:shadow-xl transition-shadow" 
  placeholder="自定义样式" 
/>
```

### 深色模式

```vue
<Input 
  v-model="value" 
  class="!bg-slate-800 !border-slate-600 !text-white !placeholder:text-slate-400"
  placeholder="深色模式输入框"
/>
```

## 事件处理

### 值变化监听

```vue
<Input 
  v-model="value" 
  @update:modelValue="handleUpdate"
  @change="handleChange"
/>
```

```typescript
const handleUpdate = (newValue: string | number) => {
  console.log('值更新:', newValue)
}

const handleChange = (newValue: string | number) => {
  console.log('值改变:', newValue)
  // 执行搜索或提交等操作
}
```

### 焦点事件

```vue
<Input 
  v-model="value" 
  @focus="handleFocus"
  @blur="handleBlur"
/>
```

```typescript
const handleFocus = (event: FocusEvent) => {
  console.log('获得焦点')
  // 显示提示或加载建议数据
}

const handleBlur = (event: FocusEvent) => {
  console.log('失去焦点')
  // 验证输入或保存数据
}
```

### 清空事件

```vue
<Input 
  v-model="value" 
  clearable
  @clear="handleClear"
/>
```

```typescript
const handleClear = () => {
  console.log('输入框已清空')
  // 重置相关状态
}
```

## 暴露方法

可以通过 ref 访问输入框的方法。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const inputRef = ref()

const focusInput = () => {
  inputRef.value?.focus()
}

const blurInput = () => {
  inputRef.value?.blur()
}
</script>

<template>
  <Input ref="inputRef" v-model="value" />
  <button @click="focusInput">聚焦</button>
  <button @click="blurInput">失焦</button>
</template>
```

## 可访问性

- 支持键盘导航
- 支持屏幕阅读器
- 焦点状态清晰可见
- 错误状态有明确的视觉反馈
- 符合 WCAG 2.1 AA 标准

## 注意事项

1. **数字输入**: `type="number"` 时，v-model 绑定的值会是数字类型，空值时为空字符串
2. **清空按钮**: 只有在有内容且未禁用、未只读时才显示
3. **字数统计**: 需要同时设置 `showCount` 和 `maxlength` 才会显示
4. **前缀/后缀图标**: 使用图标需要确保 Icon 组件已正确配置
5. **插槽优先级**: 插槽内容会覆盖对应的 prefix/suffix 属性
6. **响应式**: 输入框宽度默认为 100%，会自动适应容器宽度

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 相关组件

- [Textarea](../Textarea/README.md) - 多行文本输入组件（即将推出）
- [Select](../Select/README.md) - 下拉选择组件（即将推出）
- [Checkbox](../Checkbox/README.md) - 复选框组件（即将推出）
- [Radio](../Radio/README.md) - 单选框组件（即将推出）
- [Icon](../Icon/README.md) - 图标组件
