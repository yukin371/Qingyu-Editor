# Icon 组件

基于 Heroicons 的图标组件，支持多种尺寸和变体。

## 特性

- 基于 Heroicons v2 (MIT 许可)
- 25+ 常用图标
- 5 种尺寸预设 (xs, sm, md, lg, xl)
- 两种变体 (solid, outline)
- 内联 SVG 渲染，无需额外请求
- 完整的可访问性支持
- 支持点击事件

## 使用方法

### 基础用法

```vue
<script setup>
import Icon from '@/design-system/base/Icon/Icon.vue'
</script>

<template>
  <Icon name="home" />
</template>
```

### 尺寸

```vue
<template>
  <div class="flex items-center gap-4">
    <Icon name="home" size="xs" />
    <Icon name="home" size="sm" />
    <Icon name="home" size="md" />
    <Icon name="home" size="lg" />
    <Icon name="home" size="xl" />
  </div>
</template>
```

### 变体

```vue
<template>
  <div class="flex items-center gap-4">
    <Icon name="heart" variant="outline" />
    <Icon name="heart" variant="solid" />
  </div>
</template>
```

### 带文字

```vue
<template>
  <div class="flex items-center gap-2">
    <Icon name="check" variant="solid" />
    <span>Task completed</span>
  </div>
</template>
```

### 交互

```vue
<script setup>
const handleClick = () => {
  console.log('Icon clicked!')
}
</script>

<template>
  <Icon
    name="heart"
    class="cursor-pointer hover:text-red-500 transition-colors"
    @click="handleClick"
  />
</template>
```

### 自定义颜色

```vue
<template>
  <div class="flex items-center gap-4">
    <Icon name="heart" class="text-red-500" />
    <Icon name="star" class="text-yellow-500" />
    <Icon name="check" class="text-green-500" />
  </div>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `IconName` | (必需) | 图标名称 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 图标尺寸 |
| `variant` | `'solid' \| 'outline'` | `'outline'` | 图标变体 |
| `ariaLabel` | `string` | - | ARIA 标签（可访问性） |
| `class` | `any` | - | 自定义类名 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `(event: MouseEvent)` | 点击事件 |

## 可用图标

### 导航类
- `home` - 首页

### 用户相关
- `user` - 用户

### 文件/文档
- `document` - 文档
- `folder` - 文件夹

### 操作类
- `plus` - 添加
- `minus` - 减少
- `check` - 勾选
- `x-mark` - 关闭/取消
- `pencil` - 编辑
- `trash` - 删除

### 导航箭头
- `arrow-down` - 下箭头
- `arrow-up` - 上箭头
- `arrow-left` - 左箭头
- `arrow-right` - 右箭头
- `chevron-down` - 下展开
- `chevron-up` - 上收起
- `chevron-left` - 左翻页
- `chevron-right` - 右翻页

### 搜索和设置
- `magnifying-glass` - 搜索
- `cog-6-tooth` - 设置

### 通信
- `bell` - 通知/铃铛

### 其他
- `heart` - 爱心/收藏
- `star` - 星标
- `lock-closed` - 锁定
- `information-circle` - 信息

## 设计规范

### 尺寸规范

| 尺寸 | 宽高 | 用途 |
|------|------|------|
| xs | 16px | 紧凑布局、按钮内 |
| sm | 20px | 小型文本旁 |
| md | 24px | 默认、常规使用 |
| lg | 32px | 标题、强调 |
| xl | 40px | 大型展示 |

### 变体使用指南

- **outline**: 适用于大多数场景，视觉轻盈
- **solid**: 适用于需要强调的场景，如选中状态、重要操作

## 可访问性

- 自动使用图标名称作为 `aria-label`
- 支持自定义 `ariaLabel` 提供更详细的描述
- 正确的 ARIA 属性确保屏幕阅读器可访问
- 支持键盘导航和点击事件

## 最佳实践

1. **选择合适的尺寸**
   - 按钮内使用 xs 或 sm
   - 文本旁使用 sm 或 md
   - 独立使用使用 md 或 lg

2. **保持一致性**
   - 同一功能使用相同的图标
   - 同一区域使用相同的尺寸

3. **可访问性**
   - 为功能图标提供有意义的 `ariaLabel`
   - 确保图标和文字的组合有清晰的语义

4. **性能优化**
   - 图标是内联 SVG，无需额外请求
   - 可以通过 CSS 控制颜色和大小

## 示例代码

### 按钮组图标

```vue
<template>
  <div class="flex gap-2">
    <button class="p-2 hover:bg-slate-100 rounded">
      <Icon name="pencil" size="sm" />
    </button>
    <button class="p-2 hover:bg-slate-100 rounded">
      <Icon name="trash" size="sm" />
    </button>
  </div>
</template>
```

### 状态指示

```vue
<template>
  <div class="flex items-center gap-2">
    <Icon name="check" variant="solid" class="text-green-500" />
    <span class="text-sm">Published</span>
  </div>
</template>
```

### 导航菜单

```vue
<template>
  <nav>
    <a href="#" class="flex items-center gap-2">
      <Icon name="home" size="sm" />
      <span>Home</span>
    </a>
  </nav>
</template>
```

## 许可证

本组件使用的图标来自 [Heroicons](https://heroicons.com/)，遵循 MIT 许可证。
