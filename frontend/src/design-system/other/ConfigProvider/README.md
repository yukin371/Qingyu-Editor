# ConfigProvider 全局配置组件

用于为整个应用或特定区域的组件提供全局配置，包括尺寸、语言、方向、样式前缀等。

## 基本用法

最简单的用法，在应用根部使用 ConfigProvider：

```vue
<script setup lang="ts">
import { ConfigProvider } from '@qingyu/design-system'
</script>

<template>
  <ConfigProvider>
    <App />
  </ConfigProvider>
</template>
```

## 全局尺寸配置

通过 `size` 属性设置所有子组件的默认尺寸：

```vue
<template>
  <ConfigProvider size="large">
    <!-- 所有组件默认使用 large 尺寸 -->
    <Button>大按钮</Button>
    <Input>大输入框</Input>
  </ConfigProvider>
</template>
```

尺寸选项：
- `small` - 小尺寸
- `medium` - 中等尺寸（默认）
- `large` - 大尺寸

## 组件类名前缀

通过 `namespace` 属性设置组件类名的前缀，用于避免样式冲突：

```vue
<template>
  <ConfigProvider namespace="myapp">
    <!-- 组件类名会使用 "myapp" 作为前缀 -->
    <Button>按钮</Button>
  </ConfigProvider>
</template>
```

## 语言配置

通过 `locale` 属性设置语言包：

```vue
<script setup lang="ts">
const zhLocale = {
  confirm: '确认',
  cancel: '取消',
  submit: '提交',
  delete: '删除',
}

const enLocale = {
  confirm: 'Confirm',
  cancel: 'Cancel',
  submit: 'Submit',
  delete: 'Delete',
}
</script>

<template>
  <ConfigProvider :locale="zhLocale">
    <App />
  </ConfigProvider>

  <!-- 切换到英文 -->
  <ConfigProvider :locale="enLocale">
    <App />
  </ConfigProvider>
</template>
```

语言包类型为简单的 `Record<string, string>` 对象：

```typescript
type Locale = Record<string, string>
```

## 文本方向

通过 `direction` 属性设置文本方向：

```vue
<template>
  <!-- 从左到右（默认） -->
  <ConfigProvider direction="ltr">
    <App />
  </ConfigProvider>

  <!-- 从右到左（适合阿拉伯语、希伯来语等） -->
  <ConfigProvider direction="rtl">
    <App />
  </ConfigProvider>
</template>
```

## 按钮配置

通过 `button` 属性设置按钮的默认配置：

```vue
<script setup lang="ts">
const buttonConfig = {
  size: 'large',
  variant: 'outline',
}
</script>

<template>
  <ConfigProvider :button="buttonConfig">
    <!-- 所有按钮默认使用 large 尺寸和 outline 样式 -->
    <Button>按钮</Button>
    <Button variant="solid">可以覆盖为实心</Button>
  </ConfigProvider>
</template>
```

按钮配置选项：
- `size`: 按钮默认尺寸（`small` | `medium` | `large`）
- `variant`: 按钮默认变体（`solid` | `outline` | `ghost` | `text`）

## Z-Index 配置

通过 `zIndex` 属性设置全局的 z-index 起始值：

```vue
<script setup lang="ts">
const zIndexConfig = {
  base: 2000,
  dropdown: 2050,
  popover: 2060,
  dialog: 2070,
  notification: 2080,
  message: 2090,
}
</script>

<template>
  <ConfigProvider :z-index="zIndexConfig">
    <App />
  </ConfigProvider>
</template>
```

## 嵌套配置

ConfigProvider 支持嵌套使用，内层配置会覆盖外层配置：

```vue
<template>
  <ConfigProvider size="small">
    <div>
      <Button>小按钮</Button>

      <!-- 内层 ConfigProvider 会覆盖外层配置 -->
      <ConfigProvider size="large">
        <Button>大按钮</Button>
      </ConfigProvider>

      <Button>小按钮（不受内层影响）</Button>
    </div>
  </ConfigProvider>
</template>
```

## 组件属性优先级

组件自身的 props 属性优先级高于 ConfigProvider 提供的配置：

```vue
<template>
  <ConfigProvider size="small">
    <!-- 组件自身指定的 size 会覆盖全局配置 -->
    <Button>继承 small</Button>
    <Button size="large">组件指定 large</Button>
  </ConfigProvider>
</template>
```

优先级从高到低：
1. 组件自身的 props 属性
2. 最近的外层 ConfigProvider 配置
3. 更外层的 ConfigProvider 配置
4. 默认值

## 在子组件中使用配置

在子组件中通过 `inject` 获取 ConfigProvider 提供的配置：

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { CONFIG_PROVIDER_KEY } from '@qingyu/design-system'

// 获取配置上下文
const config = inject(CONFIG_PROVIDER_KEY, {
  size: 'medium',
  namespace: 'qy',
  direction: 'ltr',
})

// 使用配置
const buttonSize = props.size || config.size
</script>
```

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 全局尺寸 |
| namespace | `string` | `'qy'` | 组件类名前缀 |
| locale | `Record<string, string>` | - | 语言包对象 |
| direction | `'ltr' \| 'rtl'` | `'ltr'` | 文本方向 |
| button | `{ size?: string; variant?: string }` | `{ size: 'medium', variant: 'solid' }` | 按钮默认配置 |
| zIndex | `object` | - | 全局 z-index 配置 |
| class | `any` | - | 自定义类名 |
| style | `any` | - | 自定义样式 |

### zIndex 配置选项

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| base | `number` | `1000` | 全局 z-index 起始值 |
| dropdown | `number` | `1050` | 下拉菜单 z-index |
| popover | `number` | `1060` | 弹出层 z-index |
| dialog | `number` | `1070` | 对话框 z-index |
| notification | `number` | `1080` | 通知 z-index |
| message | `number` | `1090` | 消息提示 z-index |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 默认插槽，包含需要配置的组件 |

### Exposed

| 属性名 | 类型 | 说明 |
|--------|------|------|
| config | `ComputedRef<ConfigProviderContext>` | 当前配置上下文的响应式引用 |

## 完整示例

```vue
<script setup lang="ts">
import { ConfigProvider, Button } from '@qingyu/design-system'

const appLocale = {
  confirm: '确认',
  cancel: '取消',
  submit: '提交',
}

const zIndexConfig = {
  base: 2000,
  dropdown: 2050,
  popover: 2060,
  dialog: 2070,
  notification: 2080,
  message: 2090,
}

const buttonConfig = {
  size: 'large',
  variant: 'solid',
}
</script>

<template>
  <ConfigProvider
    size="large"
    namespace="myapp"
    direction="ltr"
    :locale="appLocale"
    :button="buttonConfig"
    :z-index="zIndexConfig"
  >
    <div class="app">
      <h1>我的应用</h1>
      <Button>大按钮</Button>
      <Button variant="outline">轮廓按钮</Button>
    </div>
  </ConfigProvider>
</template>
```

## 注意事项

1. **性能优化**：ConfigProvider 使用 `computed` 创建配置上下文，性能开销很小
2. **嵌套使用**：支持多层嵌套，内层配置会覆盖外层配置
3. **配置合并**：子组件可以同时使用全局配置和自身配置
4. **类型安全**：使用 TypeScript 提供完整的类型支持
5. **默认值**：所有配置项都有合理的默认值，无需全部配置
6. **动态更新**：配置支持动态更新，会自动响应变化

## 最佳实践

1. **在应用根部使用**：通常在应用的最外层使用 ConfigProvider
2. **按需配置**：只配置需要全局设置的属性，其他使用默认值
3. **模块化配置**：将配置对象抽取为单独的文件便于管理
4. **主题切换**：可以通过响应式变量实现动态主题切换
5. **避免过度嵌套**：不建议超过 3 层嵌套，会影响可读性
