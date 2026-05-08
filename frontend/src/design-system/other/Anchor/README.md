# Anchor 锚点组件

用于展示页面锚点，支持点击滚动到对应位置的导航组件喵~

## 基础用法

最简单的用法，点击锚点导航会平滑滚动到对应位置喵~

```vue
<template>
  <div class="flex">
    <!-- 左侧锚点导航 -->
    <Anchor :items="anchorItems" />
    
    <!-- 右侧内容区域 -->
    <div>
      <section id="basic">基础用法</section>
      <section id="static">静态位置</section>
      <section id="affix">固定模式</section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Anchor from '@/design-system/other/Anchor'
import type { AnchorItem } from '@/design-system/other/Anchor'

const anchorItems: AnchorItem[] = [
  { key: '1', title: '基础用法', href: '#basic' },
  { key: '2', title: '静态位置', href: '#static' },
  { key: '3', title: '固定模式', href: '#affix' },
]
</script>
```

## 水平方向

设置 `direction` 为 `horizontal` 可以显示水平方向的锚点导航喵~

```vue
<template>
  <div class="sticky top-0">
    <Anchor direction="horizontal" :marker="false" :show-line="false" :items="anchorItems" />
  </div>
</template>
```

## 固定模式

通过 `affix` 属性开启固定模式，滚动时锚点导航会固定在指定位置喵~

```vue
<template>
  <Anchor :affix="true" :offset-top="20" :items="anchorItems" />
</template>
```

## 自定义容器

可以指定自定义的滚动容器喵~

```vue
<template>
  <div id="custom-container" class="overflow-auto" style="height: 600px;">
    <Anchor container="#custom-container" :items="anchorItems" />
  </div>
</template>
```

## 偏移量

设置 `offset` 可以调整滚动位置的偏移量喵~

```vue
<template>
  <Anchor :offset="100" :items="anchorItems" />
</template>
```

## 事件监听

监听 `click` 和 `change` 事件来处理用户交互喵~

```vue
<template>
  <Anchor 
    :items="anchorItems" 
    @click="handleClick"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
const handleClick = (e: MouseEvent, link: any) => {
  console.log('点击锚点:', link)
}

const handleChange = (currentActiveLink: string) => {
  console.log('当前激活锚点:', currentActiveLink)
}
</script>
```

## 嵌套锚点

支持多级嵌套的锚点导航喵~

```vue
<template>
  <Anchor :items="nestedItems" />
</template>

<script setup lang="ts">
const nestedItems: AnchorItem[] = [
  {
    key: '1',
    title: '快速开始',
    href: '#getting-started',
    children: [
      { key: '1-1', title: '安装', href: '#install' },
      { key: '1-2', title: '引入', href: '#import' },
      { key: '1-3', title: '使用', href: '#usage' },
    ],
  },
]
</script>
```

## API

### Anchor Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 锚点列表 | `AnchorItem[]` | `[]` |
| container | 滚动容器选择器 | `string \| (() => HTMLElement)` | `'body'` |
| offset | 滚动触发的偏移量 | `number` | `0` |
| bounds | 锚点区域边界 | `number` | `5` |
| direction | 锚点方向 | `'vertical' \| 'horizontal'` | `'vertical'` |
| getCurrentAnchor | 自定义获取当前激活锚点的方法 | `(activeLink: string) => string` | - |
| marker | 是否显示小圆点标记 | `boolean` | `true` |
| showLine | 是否显示线条连接 | `boolean` | `true` |
| affix | 是否固定定位 | `boolean` | `false` |
| offsetTop | 固定定位的偏移距离 | `number` | `0` |
| smooth | 点击锚点是否平滑滚动 | `boolean` | `true` |
| activeLink | 当前激活的锚点（受控模式） | `string` | - |
| class | 自定义类名 | `any` | - |
| style | 自定义样式 | `any` | - |

### Anchor Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| click | 点击锚点时触发 | `(e: MouseEvent, link: object) => void` |
| change | 当前激活锚点变化时触发 | `(currentActiveLink: string) => void` |

### AnchorItem Type

```typescript
interface AnchorItem {
  key: string          // 锚点的唯一标识
  title: string        // 锚点的标题
  href: string         // 锚点的链接 href
  target?: string      // 目标（可选）
  children?: AnchorItem[]  // 子锚点（可选）
}
```

### Anchor Methods

通过 ref 可以调用以下方法喵~

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| scrollToAnchor | 滚动到指定锚点 | `(href: string) => void` |

```vue
<template>
  <Anchor ref="anchorRef" :items="anchorItems" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const anchorRef = ref()

// 滚动到指定锚点
const scrollToBasic = () => {
  anchorRef.value.scrollToAnchor('#basic')
}
</script>
```

## 样式定制

### 禁用标记

```vue
<Anchor :marker="false" :items="anchorItems" />
```

### 禁用线条

```vue
<Anchor :show-line="false" :items="anchorItems" />
```

### 自定义样式

```vue
<Anchor 
  :items="anchorItems"
  class="custom-anchor"
  style="font-size: 16px;"
/>
```

## 注意事项

1. 确保页面中存在对应的锚点元素（通过 `id` 属性）喵~
2. 使用 `offset` 属性可以避免被固定头部遮挡喵~
3. 自定义容器需要确保容器可滚动喵~
4. 嵌套锚点最多支持 3 级喵~

## 更新日志

### 1.0.0

- 初始版本发布喵~
- 支持垂直/水平方向喵~
- 支持嵌套锚点喵~
- 支持固定定位喵~
- 支持自定义容器喵~
- 支持平滑滚动喵~

## 相关组件

- [BackTop](./BackTop.md) - 返回顶部组件
