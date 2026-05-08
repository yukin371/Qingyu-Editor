# Collapse 组件

折叠面板容器组件，支持手风琴模式和多个面板同时展开。

## 功能特性

- 支持**手风琴模式**，同时只能展开一个面板
- 支持**多面板展开**，可以同时展开多个面板
- 支持**禁用状态**，禁用的面板无法展开
- 支持**自定义标题**和**箭头图标**
- 使用 Icon 组件显示箭头，展开时有动画效果
- 使用设计令牌，支持深色模式
- 基于 Tailwind CSS 和 CVA 构建

## 安装使用

```vue
<script setup lang="ts">
import { Collapse, CollapseItem } from '@/design-system'
import { ref } from 'vue'

const activeNames = ref(['1'])
</script>

<template>
  <!-- 基本用法 -->
  <Collapse v-model="activeNames">
    <CollapseItem name="1" title="面板 1">
      内容 1
    </CollapseItem>
    <CollapseItem name="2" title="面板 2">
      内容 2
    </CollapseItem>
  </Collapse>

  <!-- 手风琴模式 -->
  <Collapse v-model="activeNames" accordion>
    <CollapseItem name="1" title="第一章">
      第一章内容
    </CollapseItem>
    <CollapseItem name="2" title="第二章">
      第二章内容
    </CollapseItem>
  </Collapse>
</template>
```

## API

### Collapse Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `(string \| number)[]` | `[]` | v-model 绑定值（激活的面板） |
| `accordion` | `boolean` | `false` | 手风琴模式（只能展开一个） |
| `class` | `any` | `undefined` | 自定义类名 |

### Collapse Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: (string \| number)[])` | 值更新事件 |
| `change` | `(activeNames: (string \| number)[])` | 面板展开/收起事件 |

### CollapseItem Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string \| number` | `undefined` | 面板标识 |
| `title` | `string` | `undefined` | 标题 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `class` | `any` | `undefined` | 自定义类名 |

### CollapseItem Slots

| 插槽 | 说明 |
|------|------|
| `title` | 自定义标题 |
| `default` | 面板内容 |
| `arrow` | 自定义箭头图标 |

## 使用示例

### 基础用法

```vue
<template>
  <Collapse>
    <CollapseItem name="1" title="面板 1">
      这是面板 1 的内容。可以包含任何内容，如文本、图片、表单等。
    </CollapseItem>
    <CollapseItem name="2" title="面板 2">
      这是面板 2 的内容。点击标题可以展开或收起面板。
    </CollapseItem>
    <CollapseItem name="3" title="面板 3">
      这是面板 3 的内容。支持多个面板同时展开。
    </CollapseItem>
  </Collapse>
</template>
```

### 手风琴模式

```vue
<template>
  <Collapse accordion>
    <CollapseItem name="1" title="第一章：简介">
      这是第一章的内容。在手风琴模式下，展开一个面板会自动收起其他面板。
    </CollapseItem>
    <CollapseItem name="2" title="第二章：基础概念">
      这是第二章的内容。适用于需要逐步展示信息的场景。
    </CollapseItem>
    <CollapseItem name="3" title="第三章：高级用法">
      这是第三章的内容。可以配合 v-model 实现双向绑定。
    </CollapseItem>
  </Collapse>
</template>
```

### 默认展开

```vue
<template>
  <Collapse v-model="activeNames">
    <CollapseItem name="1" title="默认展开的面板 1">
      这个面板默认是展开的。
    </CollapseItem>
    <CollapseItem name="2" title="默认收起的面板 2">
      点击标题可以展开这个面板。
    </CollapseItem>
    <CollapseItem name="3" title="默认展开的面板 3">
      这个面板也是默认展开的。
    </CollapseItem>
  </Collapse>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeNames = ref(['1', '3'])
</script>
```

### 禁用状态

```vue
<template>
  <Collapse>
    <CollapseItem name="1" title="可展开的面板">
      这个面板可以正常展开和收起。
    </CollapseItem>
    <CollapseItem name="2" title="禁用的面板" :disabled="true">
      这个面板被禁用了，无法点击展开。
    </CollapseItem>
    <CollapseItem name="3" title="另一个可展开的面板">
      这个面板也可以正常展开和收起。
    </CollapseItem>
  </Collapse>
</template>
```

### 自定义内容

```vue
<template>
  <Collapse>
    <CollapseItem name="1">
      <template #title>
        <div class="flex items-center gap-2">
          <span class="text-lg">📝</span>
          <span>自定义标题</span>
        </div>
      </template>
      <div class="space-y-3">
        <p>这是面板的内容区域，可以放置任何内容。</p>
        <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded">
          代码块、图片、表格等都可以放在这里
        </div>
      </div>
    </CollapseItem>
    <CollapseItem name="2" title="自定义箭头">
      <template #arrow>
        <span class="text-sm">切换</span>
      </template>
      <div>这个面板使用了自定义的箭头插槽。</div>
    </CollapseItem>
  </Collapse>
</template>
```

### 事件监听

```vue
<template>
  <Collapse @change="handleChange">
    <CollapseItem name="1" title="面板 1">
      内容 1
    </CollapseItem>
    <CollapseItem name="2" title="面板 2">
      内容 2
    </CollapseItem>
  </Collapse>
</template>

<script setup lang="ts">
const handleChange = (activeNames: (string | number)[]) => {
  console.log('当前展开的面板：', activeNames)
}
</script>
```

## 设计规范

### 颜色

**容器边框：**
- 浅色模式: `border-slate-200` (#e2e8f0)
- 深色模式: `border-slate-700` (#334155)

**标题：**
- 浅色模式: `text-slate-700` (#334155)
- 深色模式: `text-slate-300` (#cbd5e1)
- 禁用状态: `text-slate-400` (#94a3b8)

**内容：**
- 浅色模式: `text-slate-600` (#475569)
- 深色模式: `text-slate-400` (#94a3b8)

**箭头图标：**
- 浅色模式: `text-slate-400` (#94a3b8)
- 深色模式: `text-slate-500` (#64748b)

### 背景色

- 浅色模式: `bg-white` (#ffffff)
- 深色模式: `bg-slate-800` (#1e293b)
- 悬停状态: `bg-slate-50` (浅色), `bg-slate-750` (深色)

### 间距

- 头部内边距: `px-4 py-3`
- 内容内边距: `px-4 py-3`
- 面板间距: 通过边框实现 `border-b`

### 动画

- 展开动画: `transition-all duration-300 ease-in-out`
- 箭头旋转: `transition-transform duration-300`
- 最大高度（展开）: `max-h-96`
- 最大高度（收起）: `max-h-0`

## 无障碍

- 箭头图标使用 Icon 组件，带有 `aria-label` 属性
- 禁用状态添加了视觉反馈和 `cursor-not-allowed`
- 键盘导航支持（可聚焦）

## 使用场景

- **FAQ 问答列表**：常见问题的折叠展示
- **文档章节导航**：长文档的分章节折叠
- **设置面板分组**：系统设置的分组展示
- **产品特性展示**：产品功能的详细介绍
- **表单分组**：复杂表单的分步填写

## 相关组件

- [Card](../Card/) - 卡片容器
- [Divider](../Divider/) - 分隔线组件
- [Badge](../Badge/) - 徽章组件
