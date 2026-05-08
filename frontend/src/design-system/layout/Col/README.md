# Col 组件

基于 12 列网格系统的列布局组件，支持响应式断点、偏移和排序。

## 功能特性

- 基于 **12 列网格系统**
- 支持 **响应式断点**（xs, sm, md, lg, xl）
- 支持 **列偏移**（offset）
- 支持 **排序**（order）
- 支持 **嵌套布局**
- 使用设计令牌，支持深色模式
- 基于 Tailwind CSS 构建

## 安装使用

```vue
<script setup lang="ts">
import { Col } from '@/design-system'
</script>

<template>
  <!-- 基础用法 -->
  <div class="flex gap-2">
    <Col :span="6">
      <div>占 6 列</div>
    </Col>
    <Col :span="6">
      <div>占 6 列</div>
    </Col>
  </div>

  <!-- 响应式 -->
  <div class="flex gap-2">
    <Col :xs="12" :md="6" :lg="4">
      <div>响应式列</div>
    </Col>
  </div>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `span` | `number` | `12` | 列宽度（1-12） |
| `offset` | `number` | `0` | 左侧偏移列数（0-11） |
| `order` | `number` | `undefined` | 排序顺序 |
| `xs` | `number` | `undefined` | 断点 xs 下的 span |
| `sm` | `number` | `undefined` | 断点 sm 下的 span |
| `md` | `number` | `undefined` | 断点 md 下的 span |
| `lg` | `number` | `undefined` | 断点 lg 下的 span |
| `xl` | `number` | `undefined` | 断点 xl 下的 span |
| `class` | `any` | `undefined` | 自定义类名 |

### Span 值

span 属性接受 1-12 的数值，对应不同的宽度：

| span | 宽度 | Tailwind 类 |
|------|------|-------------|
| 1 | 8.33% | `w-1/12` |
| 2 | 16.67% | `w-2/12` |
| 3 | 25% | `w-3/12` |
| 4 | 33.33% | `w-4/12` |
| 5 | 41.67% | `w-5/12` |
| 6 | 50% | `w-6/12` |
| 7 | 58.33% | `w-7/12` |
| 8 | 66.67% | `w-8/12` |
| 9 | 75% | `w-9/12` |
| 10 | 83.33% | `w-10/12` |
| 11 | 91.67% | `w-11/12` |
| 12 | 100% | `w-full` |

### 响应式断点

| 断点 | 屏幕宽度 |
|------|----------|
| `xs` | < 640px |
| `sm` | ≥ 640px |
| `md` | ≥ 768px |
| `lg` | ≥ 1024px |
| `xl` | ≥ 1280px |

## 使用示例

### 基础用法

```vue
<template>
  <div class="flex gap-2">
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">占 6 列</div>
    </Col>
    <Col :span="6">
      <div class="bg-green-500 text-white p-4">占 6 列</div>
    </Col>
  </div>
</template>
```

### 三列布局

```vue
<template>
  <div class="flex gap-2">
    <Col :span="4">
      <div>左侧栏</div>
    </Col>
    <Col :span="4">
      <div>中间栏</div>
    </Col>
    <Col :span="4">
      <div>右侧栏</div>
    </Col>
  </div>
</template>
```

### 列偏移

```vue
<template>
  <div class="flex gap-2">
    <Col :span="4" :offset="2">
      <div>占 4 列，偏移 2 列</div>
    </Col>
    <Col :span="6">
      <div>占 6 列</div>
    </Col>
  </div>
</template>
```

### 响应式布局

```vue
<template>
  <!-- 移动端全宽，平板 6 列，桌面 4 列 -->
  <div class="flex gap-2">
    <Col :xs="12" :md="6" :lg="4">
      <div>响应式列 1</div>
    </Col>
    <Col :xs="12" :md="6" :lg="4">
      <div>响应式列 2</div>
    </Col>
    <Col :xs="12" :md="6" :lg="4">
      <div>响应式列 3</div>
    </Col>
  </div>
</template>
```

### 排序

```vue
<template>
  <div class="flex gap-2">
    <Col :span="4" :order="3">
      <div>第一列（视觉上最后）</div>
    </Col>
    <Col :span="4" :order="2">
      <div>第二列（视觉上中间）</div>
    </Col>
    <Col :span="4" :order="1">
      <div>第三列（视觉上最前）</div>
    </Col>
  </div>
</template>
```

### 嵌套布局

```vue
<template>
  <div class="flex gap-2">
    <Col :span="8">
      <div class="p-4 bg-blue-500">
        <p>外层列</p>
        <div class="flex gap-2 mt-2">
          <Col :span="6">
            <div class="p-2 bg-blue-400">内层 1</div>
          </Col>
          <Col :span="6">
            <div class="p-2 bg-blue-400">内层 2</div>
          </Col>
        </div>
      </div>
    </Col>
    <Col :span="4">
      <div class="p-4 bg-green-500">右侧栏</div>
    </Col>
  </div>
</template>
```

### 卡片网格

```vue
<template>
  <div class="flex gap-4 flex-wrap">
    <Col :xs="12" :sm="6" :md="4" :lg="3" v-for="i in 6" :key="i">
      <div class="border rounded-lg p-4">
        <h3>卡片 {{ i }}</h3>
        <p>内容描述</p>
      </div>
    </Col>
  </div>
</template>
```

### 圣杯布局

```vue
<template>
  <div class="space-y-4">
    <!-- 头部 -->
    <div class="flex gap-2">
      <Col :span="12">
        <header class="p-4 bg-red-500 text-white">头部</header>
      </Col>
    </div>

    <!-- 主体 -->
    <div class="flex gap-2">
      <Col :span="3">
        <nav class="p-4 bg-blue-500 text-white">左侧导航</nav>
      </Col>
      <Col :span="6">
        <main class="p-4 border">主内容</main>
      </Col>
      <Col :span="3">
        <aside class="p-4 bg-green-500 text-white">右侧边栏</aside>
      </Col>
    </div>

    <!-- 底部 -->
    <div class="flex gap-2">
      <Col :span="12">
        <footer class="p-4 bg-slate-700 text-white">底部</footer>
      </Col>
    </div>
  </div>
</template>
```

## 设计规范

### 网格系统

- 基于 12 列网格系统
- 使用 `flex` 布局，需要配合父容器使用
- 列之间建议使用 `gap-2` 或 `gap-4` 设置间距

### 响应式设计

- 移动优先设计思路
- 使用 Tailwind 的响应式前缀
- 断点与 Tailwind 默认配置一致

### 样式类

- 基础容器: `min-w-0`（防止内容溢出）
- span 使用 `w-*` 百分比类
- offset 使用 `ml-*` 百分比类
- order 使用 `order-*` 类

## 无障碍

Col 组件使用语义化的 `div` 元素。在使用时，建议：

1. 为内容区域添加适当的 ARIA 标签
2. 确保响应式布局在不同屏幕尺寸下都可访问
3. 使用语义化的 HTML 元素作为列内容（如 `<main>`, `<nav>`, `<aside>` 等）

## 最佳实践

1. **使用 gap 设置间距**：在父容器上使用 `gap-2` 或 `gap-4` 而非 margin
2. **移动优先**：先设置移动端布局，再使用断点扩展到大屏幕
3. **合理使用 span**：确保一行内的 span 总和不超过 12
4. **嵌套布局**：内层 Col 会相对于外层 Col 计算宽度

## 相关组件

- [Container](../Container/) - 内容容器组件
- [Row](../Row/) - 行布局组件
- [Card](../../base/Card/) - 卡片组件
