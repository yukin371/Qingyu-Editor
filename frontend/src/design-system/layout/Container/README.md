# Container 组件

响应式内容容器组件，用于包裹和居中页面内容，支持多种尺寸和配置选项。

## 功能特性

- **多种尺寸**：支持 xs/sm/md/lg/xl/full 多种最大宽度
- **流体宽度**：可选 100% 宽度模式
- **响应式内边距**：自动适配不同屏幕尺寸
- **水平居中**：默认居中显示，可选左对齐
- **灵活配置**：可控制内边距和居中行为
- **嵌套支持**：支持嵌套使用
- 基于 Tailwind CSS 构建

## 安装使用

```vue
<script setup lang="ts">
import { Container } from '@/design-system'
</script>

<template>
  <!-- 基础用法 -->
  <Container>
    <h1>页面内容</h1>
  </Container>

  <!-- 指定尺寸 -->
  <Container size="lg">
    <p>最大宽度 512px</p>
  </Container>

  <!-- 流体宽度 -->
  <Container :fluid="true">
    <p>100% 宽度</p>
  </Container>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'full'` | 最大宽度尺寸 |
| `fluid` | `boolean` | `false` | 是否流体宽度（100%） |
| `padding` | `boolean` | `true` | 是否添加内边距 |
| `centered` | `boolean` | `true` | 是否水平居中 |
| `class` | `any` | `undefined` | 自定义类名 |

### Size 值

size 属性控制容器的最大宽度：

| size | 最大宽度 | Tailwind 类 | 适用场景 |
|------|----------|-------------|----------|
| `xs` | 320px (20rem) | `max-w-xs` | 小型组件、窄栏 |
| `sm` | 384px (24rem) | `max-w-sm` | 侧边栏、小卡片 |
| `md` | 448px (28rem) | `max-w-md` | 文章内容、表单 |
| `lg` | 512px (32rem) | `max-w-lg` | 中型内容区 |
| `xl` | 576px (36rem) | `max-w-xl` | 大型内容区 |
| `full` | 无限制 | `max-w-full` | 全宽容器（默认） |

### 响应式内边距

当 `padding` 为 `true` 时，容器会自动应用响应式内边距：

| 断点 | 内边距 | 说明 |
|------|--------|------|
| 默认 | `px-4` (16px) | 移动端 |
| `sm` (≥640px) | `px-6` (24px) | 平板 |
| `lg` (≥1024px) | `px-8` (32px) | 桌面 |

## 使用示例

### 基础用法

```vue
<template>
  <Container>
    <h1 class="text-2xl font-bold">页面标题</h1>
    <p class="mt-4">页面内容会自动居中并带有响应式内边距</p>
  </Container>
</template>
```

### 不同尺寸

```vue
<template>
  <!-- 小尺寸容器 -->
  <Container size="xs">
    <div class="bg-blue-500 text-white p-4 rounded">
      小型容器 (320px)
    </div>
  </Container>

  <!-- 中等尺寸 -->
  <Container size="md">
    <div class="bg-green-500 text-white p-4 rounded">
      中等容器 (448px)
    </div>
  </Container>

  <!-- 大尺寸 -->
  <Container size="xl">
    <div class="bg-purple-500 text-white p-4 rounded">
      大型容器 (576px)
    </div>
  </Container>
</template>
```

### 流体宽度

```vue
<template>
  <!-- 100% 宽度容器，适合全宽背景 -->
  <Container :fluid="true">
    <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
      <h2 class="text-2xl font-bold">全宽横幅</h2>
    </div>
  </Container>

  <!-- 普通容器（默认） -->
  <Container>
    <div class="bg-white p-6 rounded shadow">
      <p>居中容器内容</p>
    </div>
  </Container>
</template>
```

### 无内边距

```vue
<template>
  <Container size="md" :padding="false">
    <div class="p-6 bg-slate-100 rounded">
      <!-- 容器本身没有内边距，适合自定义内边距的场景 -->
      <p>内容贴边显示</p>
    </div>
  </Container>
</template>
```

### 不居中

```vue
<template>
  <Container size="sm" :centered="false">
    <div class="bg-blue-500 text-white p-4 rounded">
      左对齐容器
    </div>
  </Container>
</template>
```

### 配合 Col 组件

```vue
<template>
  <Container size="lg">
    <div class="flex gap-2">
      <Col :span="8">
        <main class="bg-white p-6 rounded shadow">
          <h2>主内容</h2>
        </main>
      </Col>
      <Col :span="4">
        <aside class="bg-slate-100 p-6 rounded">
          <h3>侧边栏</h3>
        </aside>
      </Col>
    </div>
  </Container>
</template>
```

### 嵌套布局

```vue
<template>
  <!-- 外层大容器 -->
  <Container size="xl">
    <div class="bg-blue-500 text-white p-6 rounded mb-4">
      <h2>外层容器</h2>
    </div>

    <!-- 中层容器 -->
    <Container size="md" :padding="false">
      <div class="bg-green-500 text-white p-6 rounded mb-4">
        <h3>中层容器</h3>

        <!-- 内层容器 -->
        <Container size="sm" :padding="false">
          <div class="bg-orange-500 text-white p-4 rounded">
            <h4>内层容器</h4>
          </div>
        </Container>
      </div>
    </Container>
  </Container>
</template>
```

### 完整页面布局

```vue
<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <Container>
      <!-- 页面头部 -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">页面标题</h1>
        <p class="text-slate-600 mt-2">页面副标题或描述</p>
      </header>

      <!-- 主内容区 -->
      <main class="flex gap-2 mb-8">
        <Col :span="8">
          <article class="bg-white p-6 rounded shadow">
            <h2 class="text-xl font-bold mb-4">文章标题</h2>
            <p class="text-slate-600">文章内容...</p>
          </article>
        </Col>
        <Col :span="4">
          <aside class="bg-slate-100 p-6 rounded">
            <h3 class="font-bold mb-4">侧边栏</h3>
            <nav>
              <ul class="space-y-2">
                <li><a href="#" class="text-blue-600">链接 1</a></li>
                <li><a href="#" class="text-blue-600">链接 2</a></li>
              </ul>
            </nav>
          </aside>
        </Col>
      </main>

      <!-- 页面底部 -->
      <footer class="flex gap-2">
        <Col :span="12">
          <div class="bg-slate-700 text-white p-6 rounded text-center">
            <p>© 2024 页面底部</p>
          </div>
        </Col>
      </footer>
    </Container>
  </div>
</template>
```

### 卡式布局

```vue
<template>
  <Container size="md">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <!-- 卡片头部 -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <h2 class="text-2xl font-bold">卡片标题</h2>
      </div>

      <!-- 卡片内容 -->
      <div class="p-6">
        <p class="text-slate-600 mb-4">卡片内容描述</p>
        <button class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          操作按钮
        </button>
      </div>
    </div>
  </Container>
</template>
```

### 响应式布局

```vue
<template>
  <Container>
    <!-- 移动端全宽，桌面端分栏 -->
    <div class="flex gap-2">
      <Col :xs="12" :md="6">
        <div class="bg-blue-500 text-white p-4 rounded">
          响应式列 1
        </div>
      </Col>
      <Col :xs="12" :md="6">
        <div class="bg-green-500 text-white p-4 rounded">
          响应式列 2
        </div>
      </Col>
    </div>
  </Container>
</template>
```

## 设计规范

### 宽度限制

- 使用 Tailwind 的 `max-w-*` 类限制最大宽度
- `fluid` 模式使用 `w-full` 实现全宽
- 默认使用 `w-full mx-auto` 实现居中

### 内边距

- 默认启用响应式内边距
- 移动端使用 `px-4`（16px）
- 平板使用 `px-6`（24px）
- 桌面使用 `px-8`（32px）

### 居中对齐

- 默认使用 `mx-auto` 实现水平居中
- `centered: false` 时移除居中效果

## 最佳实践

1. **合理选择尺寸**：
   - 小型组件使用 `xs` 或 `sm`
   - 文章内容使用 `md`
   - 大型内容区使用 `lg` 或 `xl`
   - 全宽内容使用 `full` 或 `fluid`

2. **嵌套使用**：
   - 外层使用较大尺寸，内层使用较小尺寸
   - 嵌套时建议使用 `:padding="false"` 避免内边距累积

3. **响应式设计**：
   - 配合 Col 组件的响应式断点使用
   - 利用 Container 的响应式内边距

4. **性能优化**：
   - 避免过深的嵌套层级
   - 合理使用 `padding` 属性控制内边距

## 无障碍

Container 组件使用语义化的 `div` 元素。在使用时，建议：

1. 在 Container 内部使用语义化的 HTML 元素（`<header>`, `<main>`, `<footer>` 等）
2. 确保内容在不同尺寸下都可访问
3. 为交互元素添加适当的 ARIA 标签

## 相关组件

- [Col](../Col/) - 列布局组件
- [Row](../Row/) - 行布局组件（待开发）
- [Card](../../base/Card/) - 卡片组件

## 浏览器兼容性

- 支持所有现代浏览器
- 依赖 Tailwind CSS，请确保项目已正确配置
