# QyDropdown 下拉菜单组件

Apple 风格下拉菜单组件，数据驱动，支持 click/hover 触发。

## 特性

- 数据驱动：通过 items 属性传入菜单项
- 支持 click / hover 触发
- 3 种弹出位置 (bottom-start, bottom, bottom-end)
- 图标 / 快捷键 / 分隔线 / danger 样式
- 禁用单项或整体禁用
- ESC 关闭、点击外部关闭
- Teleport to body，z-[1000]
- 200ms scale+opacity 过渡动画

## 使用方法

### 基础用法

```vue
<script setup>
import { QyDropdown } from '@/design-system/navigation/Dropdown'
import type { DropdownItem } from '@/design-system/navigation/Dropdown'

const items: DropdownItem[] = [
  { key: 'profile', label: '个人资料' },
  { key: 'settings', label: '设置' },
  { key: 'logout', label: '退出登录' },
]

const handleSelect = (key: string) => {
  console.log('Selected:', key)
}
</script>

<template>
  <QyDropdown :items="items" @select="handleSelect">
    <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
      打开菜单
    </button>
  </QyDropdown>
</template>
```

### 触发方式

```vue
<template>
  <!-- 点击触发 -->
  <QyDropdown :items="items" trigger="click" @select="handleSelect">
    <button>Click</button>
  </QyDropdown>

  <!-- 悬停触发 -->
  <QyDropdown :items="items" trigger="hover" @select="handleSelect">
    <button>Hover</button>
  </QyDropdown>
</template>
```

### 带图标和快捷键

```vue
<script setup>
const items: DropdownItem[] = [
  { key: 'user', label: '个人资料', icon: 'i-heroicons-user' },
  { key: 'cog', label: '偏好设置', icon: 'i-heroicons-cog' },
  { key: 'new', label: '新建文件', shortcut: '\u2318N' },
]
</script>
```

### 带分隔线和 danger 样式

```vue
<script setup>
const items: DropdownItem[] = [
  { key: 'edit', label: '编辑' },
  { key: 'duplicate', label: '复制', divider: true },
  { key: 'delete', label: '删除', danger: true },
]
</script>
```

### 禁用状态

```vue
<template>
  <!-- 禁用单项 -->
  <QyDropdown :items="items" @select="handleSelect">
    <button>菜单</button>
  </QyDropdown>

  <!-- 整体禁用 -->
  <QyDropdown :items="items" disabled>
    <button>禁用菜单</button>
  </QyDropdown>
</template>
```

## API

### QyDropdown Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `DropdownItem[]` | - | 菜单项列表（必填） |
| `trigger` | `'click' \| 'hover'` | `'click'` | 触发方式 |
| `placement` | `'bottom-start' \| 'bottom' \| 'bottom-end'` | `'bottom-start'` | 弹出位置 |
| `disabled` | `boolean` | `false` | 整体禁用 |

### QyDropdown Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `select` | `(key: string)` | 点击菜单项时触发 |

### QyDropdown Slots

| 插槽 | 说明 |
|------|------|
| `default` | 触发元素 |

### DropdownItem 类型

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | `string` | - | 唯一标识（必填） |
| `label` | `string` | - | 显示文本（必填） |
| `icon` | `string` | - | 图标类名 |
| `shortcut` | `string` | - | 快捷键提示 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `danger` | `boolean` | `false` | 危险操作样式 |
| `divider` | `boolean` | `false` | 是否在此项后显示分隔线 |
