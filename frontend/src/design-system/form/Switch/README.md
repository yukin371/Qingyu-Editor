# Switch 组件

开关切换组件，用于在两个互斥状态之间进行切换。

## 功能特性

- **多种尺寸**: 支持 sm、md、lg 三种尺寸
- **多种颜色**: 支持 primary、success、warning、danger 四种颜色
- **状态管理**: 支持 v-model 双向绑定
- **禁用状态**: 支持禁用状态
- **加载状态**: 支持加载状态，防止误操作
- **切换前回调**: 支持通过 beforeChange 回调阻止切换
- **自定义插槽**: 支持自定义选中/未选中状态的内容
- **文本标签**: 支持显示标签和状态文本
- **深色模式**: 自动适配深色主题
- **可访问性**: 符合 WCAG 可访问性标准

## 安装使用

```vue
<script setup lang="ts">
import { Switch } from '@/design-system/form'
import { ref } from 'vue'

const enabled = ref(false)
</script>

<template>
  <Switch v-model="enabled" label="Enable feature" />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------------|------|
| `modelValue` | `boolean` | `false` | v-model 绑定值 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `loading` | `boolean` | `false` | 加载状态 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Switch 尺寸 |
| `color` | `'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Switch 颜色 |
| `label` | `string` | `undefined` | 标签文本 |
| `activeText` | `string` | `undefined` | 选中时文本 |
| `inactiveText` | `string` | `undefined` | 未选中时文本 |
| `activeValue` | `boolean` | `true` | 选中值 |
| `inactiveValue` | `boolean` | `false` | 未选中值 |
| `class` | `any` | `undefined` | 自定义类名 |

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `update:modelValue` | `(value: boolean)` | 值更新事件 |
| `change` | `(value: boolean)` | 状态改变事件 |
| `click` | `(event: MouseEvent)` | 点击事件 |

### Slots

| 插槽 | 描述 |
|------|------|
| `label` | 标签内容 |
| `active` | 选中时内容（显示在滑块内） |
| `inactive` | 未选中时内容（显示在滑块内） |

## 尺寸

### Small (sm)

小尺寸开关，适用于紧凑布局。

```vue
<Switch size="sm" v-model="value" />
```

- 高度: `h-5` (20px)
- 宽度: `w-9` (36px)
- 滑块: `h-4 w-4` (16px)

### Medium (md)

中等尺寸开关，默认尺寸。

```vue
<Switch size="md" v-model="value" />
```

- 高度: `h-6` (24px)
- 宽度: `w-11` (44px)
- 滑块: `h-5 w-5` (20px)

### Large (lg)

大尺寸开关，适用于需要强调的场景。

```vue
<Switch size="lg" v-model="value" />
```

- 高度: `h-7` (28px)
- 宽度: `w-13` (52px)
- 滑块: `h-6 w-6` (24px)

## 颜色

### Primary

主要颜色，蓝色主题。

```vue
<Switch color="primary" v-model="value" />
```

### Success

成功状态，绿色。

```vue
<Switch color="success" v-model="value" />
```

### Warning

警告状态，橙黄色。

```vue
<Switch color="warning" v-model="value" />
```

### Danger

危险状态，红色。

```vue
<Switch color="danger" v-model="value" />
```

## 状态

### 禁用状态

```vue
<Switch disabled v-model="value" />
```

禁用状态下，开关不可点击，样式变为半透明。

### 加载状态

```vue
<Switch loading v-model="value" />
```

加载状态下，开关不可点击，显示加载动画。

## 标签和文本

### 带标签

使用 `label` 属性在开关旁边添加标签。

```vue
<Switch v-model="value" label="Enable notifications" />
```

### 带状态文本

使用 `activeText` 和 `inactiveText` 显示当前状态的文本。

```vue
<Switch
  v-model="value"
  active-text="On"
  inactive-text="Off"
/>
```

### 自定义标签插槽

使用 `label` 插槽自定义标签内容。

```vue
<Switch v-model="value">
  <template #label>
    <span class="font-bold">Custom Label</span>
  </template>
</Switch>
```

## 切换前回调

使用 `beforeChange` 回调在切换前执行确认逻辑。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref(false)

const handleBeforeChange = () => {
  return confirm('Are you sure you want to change this setting?')
}
</script>

<template>
  <Switch
    v-model="value"
    :before-change="handleBeforeChange"
    label="Confirm before change"
  />
</template>
```

`beforeChange` 可以返回：
- `boolean`: 同步确认结果
- `Promise<boolean>`: 异步确认结果

返回 `false` 或被拒绝的 Promise 会阻止切换。

## 自定义插槽内容

使用 `active` 和 `inactive` 插槽自定义滑块内的内容。

```vue
<Switch v-model="value" color="success">
  <template #active>
    <svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
    </svg>
  </template>
  <template #inactive>
    <svg class="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </template>
</Switch>
```

## 实际应用场景

### 设置页面

```vue
<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  notifications: true,
  emailAlerts: false,
  darkMode: false,
  autoSave: true,
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-sm text-slate-700">Push notifications</span>
      <Switch v-model="settings.notifications" />
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm text-slate-700">Email alerts</span>
      <Switch v-model="settings.emailAlerts" color="success" />
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm text-slate-700">Dark mode</span>
      <Switch v-model="settings.darkMode" color="primary" />
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm text-slate-700">Auto-save</span>
      <Switch v-model="settings.autoSave" color="success" />
    </div>
  </div>
</template>
```

### 功能开关

```vue
<script setup lang="ts">
import { ref } from 'vue'

const features = ref([
  { id: 1, name: 'Feature A', enabled: true },
  { id: 2, name: 'Feature B', enabled: false },
  { id: 3, name: 'Feature C', enabled: true },
])
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="feature in features"
      :key="feature.id"
      class="flex items-center justify-between p-3 bg-white rounded-lg"
    >
      <span class="text-sm font-medium">{{ feature.name }}</span>
      <Switch v-model="feature.enabled" />
    </div>
  </div>
</template>
```

## 样式定制

使用 `class` 属性添加自定义样式。

```vue
<Switch
  v-model="value"
  class="shadow-lg"
/>
```

## 可访问性

- 使用语义化的 `role="switch"` 属性
- 包含 `aria-checked` 属性表示开关状态
- 包含 `aria-disabled` 属性表示禁用状态
- 支持键盘导航和屏幕阅读器
- 符合 WCAG 2.1 AA 标准

## 设计规范

### 尺寸对比

| 尺寸 | 高度 | 宽度 | 滑块大小 | 使用场景 |
|------|------|------|----------|----------|
| sm | 20px | 36px | 16px | 紧凑布局、表单密集场景 |
| md | 24px | 44px | 20px | 默认尺寸、通用场景 |
| lg | 28px | 52px | 24px | 需要强调的场景、移动端 |

### 颜色系统

- **Primary**: Primary 色系，蓝色主题，用于主要功能
- **Success**: Emerald 色系，绿色，表示启用/成功状态
- **Warning**: Amber 色系，橙黄色，表示需要注意的功能
- **Danger**: Red 色系，红色，表示危险或敏感功能

### 间距

- 开关与标签之间: `gap-2` (8px) 或 `gap-3` (12px)
- 多个开关之间: `gap-4` (16px) 或 `space-y-3/4`

### 过渡动画

- 颜色过渡: `duration-200` (200ms)
- 滑块移动: `duration-200` (200ms)
- 缓动函数: `ease-in-out`

## 注意事项

1. **明确的状态**: 确保开关的状态对用户来说是清晰明确的
2. **即时生效**: 开关状态改变应该立即生效，不需要额外的确认步骤
3. **重要功能**: 对于重要功能的开关，建议使用 `beforeChange` 回调添加确认步骤
4. **标签文本**: 使用简短、清晰的标签文本，避免使用技术术语
5. **加载状态**: 在异步操作时使用加载状态，防止用户重复操作
6. **移动端**: 在移动端使用时，确保开关的触摸区域足够大（至少 44x44px）
7. **状态反馈**: 如果开关状态的改变需要时间，使用加载状态提供视觉反馈

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 相关组件

- [Checkbox](../Checkbox/README.md) - 复选框组件
- [Radio](../Radio/README.md) - 单选框组件
- [Input](../Input/README.md) - 输入框组件
- [Select](../Select/README.md) - 选择器组件
