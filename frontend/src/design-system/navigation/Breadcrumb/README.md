# Breadcrumb 面包屑组件

面包屑导航组件，用于显示当前页面在层级结构中的位置，帮助用户快速导航回上级页面。

## 特性

- 支持路由链接集成
- 自定义分隔符
- 可配置点击行为
- 支持图标和自定义内容
- 最后一项自动加粗显示
- 响应式设计

## 安装

```bash
npm install @qingyu/design-system
```

## 基础用法

```vue
<template>
  <Breadcrumb>
    <BreadcrumbItem to="/">首页</BreadcrumbItem>
    <BreadcrumbItem to="/products">产品</BreadcrumbItem>
    <BreadcrumbItem>详情</BreadcrumbItem>
  </Breadcrumb>
</template>

<script setup>
import { Breadcrumb, BreadcrumbItem } from '@qingyu/design-system'
</script>
```

## API

### Breadcrumb Props

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| separator | `string` | `'/'` | 分隔符 |
| separatorClass | `string` | - | 分隔符的自定义类名 |
| class | `any` | - | 自定义类名 |

### BreadcrumbItem Props

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| to | `RouteLocationRaw` | - | 路由链接，使用 router-link |
| replace | `boolean` | `false` | 是否使用 replace 模式导航 |
| clickable | `boolean` | `true` | 是否可点击 |
| class | `any` | - | 自定义类名 |

### BreadcrumbItem Events

| 事件名 | 参数 | 描述 |
|--------|------|------|
| click | `(event: MouseEvent)` | 点击时触发 |

### Breadcrumb Slots

| 插槽名 | 描述 |
|--------|------|
| default | 面包屑项内容 |

### BreadcrumbItem Slots

| 插槽名 | 描述 |
|--------|------|
| default | 面包屑项内容 |
| separator | 自定义分隔符 |

## 示例

### 自定义分隔符

```vue
<template>
  <Breadcrumb separator="›">
    <BreadcrumbItem to="/">首页</BreadcrumbItem>
    <BreadcrumbItem to="/docs">文档</BreadcrumbItem>
    <BreadcrumbItem>指南</BreadcrumbItem>
  </Breadcrumb>
</template>
```

### 使用自定义分隔符组件

```vue
<template>
  <Breadcrumb separator="">
    <BreadcrumbItem to="/">首页</BreadcrumbItem>
    <template #separator>
      <BreadcrumbSeparator>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </BreadcrumbSeparator>
    </template>
    <BreadcrumbItem to="/products">产品</BreadcrumbItem>
    <BreadcrumbItem>详情</BreadcrumbItem>
  </Breadcrumb>
</template>
```

### 带图标的面包屑

```vue
<template>
  <Breadcrumb>
    <BreadcrumbItem to="/">
      <Icon name="home" />
      首页
    </BreadcrumbItem>
    <BreadcrumbItem to="/users">
      <Icon name="users" />
      用户
    </BreadcrumbItem>
    <BreadcrumbItem>
      <Icon name="user" />
      个人资料
    </BreadcrumbItem>
  </Breadcrumb>
</template>
```

### 路由集成

```vue
<template>
  <Breadcrumb>
    <BreadcrumbItem to="/">首页</BreadcrumbItem>
    <BreadcrumbItem to="/dashboard">控制台</BreadcrumbItem>
    <BreadcrumbItem :to="{ name: 'analytics' }">分析</BreadcrumbItem>
    <BreadcrumbItem :clickable="false">当前页面</BreadcrumbItem>
  </Breadcrumb>
</template>
```

### 点击事件

```vue
<template>
  <Breadcrumb>
    <BreadcrumbItem to="/" @click="handleClick">
      首页
    </BreadcrumbItem>
    <BreadcrumbItem to="/settings" @click="handleClick">
      设置
    </BreadcrumbItem>
    <BreadcrumbItem :clickable="false" @click="handleClick">
      当前页面
    </BreadcrumbItem>
  </Breadcrumb>
</template>

<script setup>
const handleClick = (event) => {
  console.log('面包屑项被点击', event)
}
</script>
```

### 自定义样式

```vue
<template>
  <!-- 大号字体 -->
  <Breadcrumb class="text-lg">
    <BreadcrumbItem to="/" class="text-blue-600 hover:text-blue-700">
      首页
    </BreadcrumbItem>
    <BreadcrumbItem class="text-blue-900 font-bold">
      当前页面
    </BreadcrumbItem>
  </Breadcrumb>

  <!-- 自定义颜色 -->
  <Breadcrumb separator=">" class="text-purple-600">
    <BreadcrumbItem to="/" class="hover:text-purple-800">
      首页
    </BreadcrumbItem>
    <BreadcrumbItem class="text-purple-900">
      当前页面
    </BreadcrumbItem>
  </Breadcrumb>
</template>
```

## 样式定制

Breadcrumb 组件使用 Tailwind CSS 构建，可以通过以下方式定制样式：

### 使用 class 属性

```vue
<template>
  <Breadcrumb class="text-base">
    <BreadcrumbItem class="text-slate-800">
      首页
    </BreadcrumbItem>
  </Breadcrumb>
</template>
```

### 使用 separatorClass 属性

```vue
<template>
  <Breadcrumb separator="/" separatorClass="text-red-500">
    <BreadcrumbItem to="/">首页</BreadcrumbItem>
    <BreadcrumbItem>当前</BreadcrumbItem>
  </Breadcrumb>
</template>
```

## 无障碍性

- 组件使用 `<nav>` 标签并设置 `aria-label="Breadcrumb"`
- 面包屑列表使用语义化的 `<ol>` 和 `<li>` 标签
- 最后一项自动应用加粗样式，表示当前页面位置

## 注意事项

1. 最后一项面包屑通常设置为不可点击（`:clickable="false"`），因为它代表当前页面
2. 使用 `to` 属性时，组件会自动使用 Vue Router 的 `<router-link>` 组件
3. 分隔符可以通过 `separator` 属性全局设置，也可以在每个 `BreadcrumbItem` 中使用 `separator` 插槽单独设置

## 相关组件

- [Menu](../Menu/README.md) - 导航菜单
- [Dropdown](../Dropdown/README.md) - 下拉菜单
