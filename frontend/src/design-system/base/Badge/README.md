# Badge 组件

用于徽章和通知数量展示的基础组件。

## 特性

- 支持数字和点模式
- 多种颜色变体（default、primary、success、warning、danger）
- 三种尺寸（sm、md、lg）
- 支持最大值限制（max 属性）
- 支持绝对定位（用于附加到其他元素）

## 安装

```typescript
import { Badge } from '@/design-system'
```

## 基础用法

### 数字徽章

```vue
<template>
  <Badge :content="5" />
  <Badge :content="99" />
  <Badge :content="100" :max="99" />
</template>
```

### 点徽章

```vue
<template>
  <Badge variant="danger" :dot="true" />
</template>
```

### 空内容（自动显示为红点）

```vue
<template>
  <Badge variant="danger" />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| content | 徽章内容（数字或字符串） | `number \| string \| null` | `null` |
| variant | 颜色变体 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` |
| size | 尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| max | 最大显示数字 | `number` | `99` |
| absolute | 是否绝对定位 | `boolean` | `false` |
| position | 定位偏移 | `string` | `'top-0 right-0 -translate-y-1/2 translate-x-1/2'` |
| dot | 是否显示为点 | `boolean` | `false` |

### Variant 说明

- `default`: 默认灰色
- `primary`: 主色（蓝色）
- `success`: 成功色（绿色）
- `warning`: 警告色（橙色）
- `danger`: 危险色（红色）

### Size 说明

| 尺寸 | 高度/宽度 | 字体大小 |
|------|-----------|----------|
| sm | 16px | 10px |
| md | 20px | 12px |
| lg | 24px | 14px |

## 使用示例

### 不同变体

```vue
<template>
  <div class="space-x-2">
    <Badge variant="default" :content="5" />
    <Badge variant="primary" :content="10" />
    <Badge variant="success" :content="3" />
    <Badge variant="warning" :content="8" />
    <Badge variant="danger" :content="12" />
  </div>
</template>
```

### 不同尺寸

```vue
<template>
  <div class="space-x-2">
    <Badge size="sm" :content="5" />
    <Badge size="md" :content="10" />
    <Badge size="lg" :content="99" />
  </div>
</template>
```

### 绝对定位（附加到按钮）

```vue
<template>
  <div class="relative inline-block">
    <button class="px-4 py-2 bg-primary-500 text-white rounded-md">
      Messages
    </button>
    <Badge variant="danger" :content="5" :absolute="true" />
  </div>
</template>
```

### Max 属性

```vue
<template>
  <div class="space-x-2">
    <Badge :content="99" :max="99" /> <!-- 显示: 99 -->
    <Badge :content="100" :max="99" /> <!-- 显示: 99+ -->
    <Badge :content="999" :max="99" /> <!-- 显示: 99+ -->
  </div>
</template>
```

### 点模式（用于通知指示）

```vue
<template>
  <div class="relative">
    <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
      Inbox
    </div>
    <Badge variant="danger" :dot="true" :absolute="true" />
  </div>
</template>
```

## 设计规范

### 颜色

- **Default**: 浅灰色背景，深灰色文字
- **Primary**: 主色背景，白色文字
- **Success**: 绿色背景，白色文字
- **Warning**: 橙色背景，白色文字
- **Danger**: 红色背景，白色文字

### 尺寸

- **sm**: 16px × 16px，字体 10px
- **md**: 20px × 20px，字体 12px
- **lg**: 24px × 24px，字体 14px

### 形状

- 圆形（`rounded-full`）
- 居中对齐（`flex items-center justify-center`）

## 无障碍

- 徽章主要用于视觉提示，不应作为唯一的信息来源
- 建议配合文字说明使用
- 对于重要通知，建议使用其他更明显的通知方式

## 注意事项

1. 当 `content` 为 `null`、`undefined` 或 `dot` 为 `true` 时，徽章显示为圆点
2. `max` 属性只对数字类型的 `content` 生效
3. 使用绝对定位时，父元素需要设置 `relative` 类
4. 数字徽章会根据内容自动调整宽度，最小宽度等于对应尺寸

## 相关组件

- [Button](../Button/) - 按钮组件
- [Icon](../Icon/) - 图标组件
- [Tag](../Tag/) - 标签组件
