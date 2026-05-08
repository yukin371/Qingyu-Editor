# QyScrollbar 组件

QyScrollbar 是 Qingyu Design System 的滚动条组件，提供美化的滚动条样式和增强的滚动功能。

## 功能特性

- ✅ 自定义滚动条样式，支持浅色/深色主题
- ✅ 支持横向、纵向和双向滚动
- ✅ 支持原生滚动条模式
- ✅ 支持隐藏滚动条但保持滚动功能
- ✅ 支持自定义容器和视图样式
- ✅ 响应式设计，适配不同屏幕尺寸
- ✅ 平滑过渡动画

## 使用方式

### 基础用法

```vue
<script setup lang="ts">
import { QyScrollbar } from 'qingyu-design-system'
</script>

<template>
  <QyScrollbar style="height: 200px">
    <div style="height: 500px">
      <!-- 长内容 -->
      <p v-for="i in 50" :key="i">内容 {{ i }}</p>
    </div>
  </QyScrollbar>
</template>
```

### 横向滚动

```vue
<template>
  <QyScrollbar class="qy-scrollbar--horizontal" style="width: 300px">
    <div style="width: 800px; white-space: nowrap">
      <!-- 宽内容 -->
      <span v-for="i in 50" :key="i">内容 {{ i }} </span>
    </div>
  </QyScrollbar>
</template>
```

### 纵向滚动

```vue
<template>
  <QyScrollbar class="qy-scrollbar--vertical" style="height: 200px">
    <div style="height: 500px">
      <!-- 长内容 -->
      <p v-for="i in 50" :key="i">内容 {{ i }}</p>
    </div>
  </QyScrollbar>
</template>
```

### 原生滚动条

```vue
<template>
  <QyScrollbar :native="true" style="height: 200px">
    <div style="height: 500px">
      <!-- 长内容 -->
      <p v-for="i in 50" :key="i">内容 {{ i }}</p>
    </div>
  </QyScrollbar>
</template>
```

### 隐藏滚动条

```vue
<template>
  <QyScrollbar class="qy-scrollbar--hidden" style="height: 200px">
    <div style="height: 500px">
      <!-- 长内容 -->
      <p v-for="i in 50" :key="i">内容 {{ i }}</p>
    </div>
  </QyScrollbar>
</template>
```

### 自定义样式

```vue
<script setup lang="ts">
import { QyScrollbar } from 'qingyu-design-system'

const wrapStyle = {
  height: '300px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px'
}

const viewStyle = {
  padding: '20px'
}
</script>

<template>
  <QyScrollbar :wrap-style="wrapStyle" :view-style="viewStyle">
    <div style="height: 500px">
      <!-- 长内容 -->
      <p v-for="i in 50" :key="i">内容 {{ i }}</p>
    </div>
  </QyScrollbar>
</template>
```

### 监听滚动事件

```vue
<script setup lang="ts">
import { QyScrollbar } from 'qingyu-design-system'

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  console.log('滚动位置:', target.scrollTop, target.scrollLeft)
}
</script>

<template>
  <QyScrollbar style="height: 200px" @scroll="handleScroll">
    <div style="height: 500px">
      <!-- 长内容 -->
      <p v-for="i in 50" :key="i">内容 {{ i }}</p>
    </div>
  </QyScrollbar>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| native | 是否使用原生滚动条样式 | boolean | false |
| wrapStyle | 容器的自定义样式 | CSSProperties | - |
| wrapClass | 容器的自定义类名 | string | - |
| viewStyle | 视图的自定义样式 | CSSProperties | - |
| viewClass | 视图的自定义类名 | string | - |
| noresize | 不监听容器大小变化 | boolean | false |
| tag | 容器标签 | string | 'div' |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| scroll | 滚动时触发 | event: Event |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 默认内容 |

## 样式类名

### 滚动方向

- `qy-scrollbar--horizontal` - 横向滚动
- `qy-scrollbar--vertical` - 纵向滚动
- `qy-scrollbar--both` - 双向滚动（默认）

### 特殊模式

- `qy-scrollbar--native` - 原生滚动条模式
- `qy-scrollbar--hidden` - 隐藏滚动条但保持滚动功能

## 设计规范

### 尺寸

- 滚动条宽度/高度：6px
- 滚动条轨道圆角：3px
- 滚动条滑块圆角：3px

### 颜色（浅色模式）

- 滚动条轨道：`rgba(241, 245, 249, 0.5)` (slate-100)
- 滚动条滑块：`rgba(203, 213, 225, 0.8)` (slate-300)
- 滚动条滑块悬停：`rgba(148, 163, 184, 0.9)` (slate-400)

### 颜色（深色模式）

- 滚动条轨道：`rgba(30, 41, 59, 0.5)` (slate-800)
- 滚动条滑块：`rgba(71, 85, 105, 0.8)` (slate-600)
- 滚动条滑块悬停：`rgba(100, 116, 139, 0.9)` (slate-500)

### 过渡动画

- 滚动条滑块悬停：0.2s ease

## 浏览器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持
- Safari: ✅ 完全支持
- Opera: ✅ 完全支持

## 注意事项

1. 确保为容器设置明确的高度或宽度，否则滚动条可能无法正常显示
2. 在深色模式下，滚动条会自动适配主题
3. 如需隐藏滚动条但保持滚动功能，使用 `qy-scrollbar--hidden` 类
4. 原生滚动条模式会禁用所有自定义样式
