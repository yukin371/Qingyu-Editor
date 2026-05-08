# Tag 组件

用于标签和分类展示的基础组件，支持多种变体、尺寸和可关闭功能。

## 功能特性

- **多种变体**: 支持 default、primary、success、warning、danger 五种变体
- **多种尺寸**: 支持 sm、md、lg 三种尺寸
- **可关闭**: 支持关闭按钮，可移除标签
- **图标前缀**: 支持在标签前添加图标
- **深色模式**: 自动适配深色主题
- **可访问性**: 符合 WCAG 可访问性标准

## 安装使用

```vue
<script setup lang="ts">
import { Tag } from '@/design-system/base'
</script>

<template>
  <Tag variant="primary">Primary Tag</Tag>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------------|
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Tag 变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tag 尺寸 |
| `removable` | `boolean` | `false` | 是否可关闭 |
| `icon` | `string` | `undefined` | 图标名称（使用 Icon 组件） |
| `class` | `any` | `undefined` | 自定义类名 |

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `close` | `()` | 关闭标签时触发 |
| `click` | `(event: MouseEvent)` | 点击标签时触发 |

### Slots

| 插槽 | 描述 |
|------|------|
| `default` | 标签内容 |

## 变体

### Default

默认样式的标签，适用于一般性标签。

```vue
<Tag variant="default">Default</Tag>
```

### Primary

主要标签，用于重要分类或主要标签。

```vue
<Tag variant="primary">Primary</Tag>
```

### Success

成功状态标签，用于表示成功、已完成等正面状态。

```vue
<Tag variant="success">Success</Tag>
```

### Warning

警告状态标签，用于表示警告、待处理等需要注意的状态。

```vue
<Tag variant="warning">Warning</Tag>
```

### Danger

危险状态标签，用于表示错误、失败等负面状态。

```vue
<Tag variant="danger">Danger</Tag>
```

## 尺寸

### Small (sm)

小尺寸标签，适用于紧凑布局。

```vue
<Tag size="sm">Small Tag</Tag>
```

- 高度: `h-6` (24px)
- 内边距: `px-2`
- 字体: `text-xs`

### Medium (md)

中等尺寸标签，默认尺寸。

```vue
<Tag size="md">Medium Tag</Tag>
```

- 高度: `h-7` (28px)
- 内边距: `px-2.5`
- 字体: `text-sm`

### Large (lg)

大尺寸标签，适用于需要强调的场景。

```vue
<Tag size="lg">Large Tag</Tag>
```

- 高度: `h-8` (32px)
- 内边距: `px-3`
- 字体: `text-base`

## 可关闭标签

使用 `removable` 属性添加关闭按钮。

```vue
<Tag variant="primary" :removable="true" @close="handleClose">
  Removable Tag
</Tag>
```

```typescript
const handleClose = () => {
  console.log('Tag closed')
}
```

## 带图标的标签

使用 `icon` 属性添加前缀图标（需要 Icon 组件）。

```vue
<Tag variant="success" icon="check">Completed</Tag>
<Tag variant="warning" icon="bell">Pending</Tag>
<Tag variant="danger" icon="x-mark">Failed</Tag>
```

## 实际应用场景

### 文章标签

```vue
<div class="flex flex-wrap gap-2">
  <Tag variant="primary" :removable="true">Vue.js</Tag>
  <Tag variant="primary" :removable="true">TypeScript</Tag>
  <Tag variant="primary" :removable="true">Tailwind CSS</Tag>
</div>
```

### 状态标签

```vue
<Tag variant="success" icon="check">已发布</Tag>
<Tag variant="warning" icon="bell">审核中</Tag>
<Tag variant="danger" icon="x-mark">已拒绝</Tag>
<Tag variant="default" icon="document">草稿</Tag>
```

### 用户角色

```vue
<Tag variant="primary" icon="user">管理员</Tag>
<Tag variant="default" icon="user">编辑</Tag>
<Tag variant="default" icon="user">作者</Tag>
```

### 优先级

```vue
<Tag variant="danger" size="sm">高优先级</Tag>
<Tag variant="warning" size="sm">中优先级</Tag>
<Tag variant="success" size="sm">低优先级</Tag>
```

## 样式定制

使用 `class` 属性添加自定义样式。

```vue
<Tag
  variant="primary"
  class="shadow-lg hover:shadow-xl transition-shadow"
>
  Custom Style Tag
</Tag>
```

## 可访问性

- 关闭按钮包含 `aria-label` 属性
- 支持键盘导航和屏幕阅读器
- 符合 WCAG 2.1 AA 标准

## 设计规范

### 颜色系统

- **Default**: Slate 色系，中性灰色
- **Primary**: Primary 色系，蓝色主题
- **Success**: Emerald 色系，绿色
- **Warning**: Amber 色系，橙黄色
- **Danger**: Red 色系，红色

### 间距

- 标签之间: `gap-2` (8px) 或 `gap-3` (12px)
- 图标与文字: `gap-1.5` (6px)

### 圆角

- 使用 `rounded-full` 实现完全圆角

## 注意事项

1. **长文本**: 标签内容过长时会自动截断，建议控制文本长度
2. **关闭事件**: 关闭按钮点击会阻止事件冒泡，不会触发 Tag 的点击事件
3. **图标使用**: 需要确保 Icon 组件已正确配置
4. **响应式**: 标签使用 `inline-flex`，会自动换行适应容器

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 相关组件

- [Button](../Button/README.md) - 按钮组件
- [Icon](../Icon/README.md) - 图标组件
- [Badge](../Badge/README.md) - 徽章组件
