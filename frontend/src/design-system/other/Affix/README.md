# Affix 固钉组件

用于将元素固定在页面特定位置的组件，常用于导航栏、操作按钮等需要固定显示的场景。

## 基本用法

最简单的用法，使用默认配置：

```vue
<script setup lang="ts">
import { Affix } from '@qingyu/design-system'
</script>

<template>
  <div style="height: 2000px">
    <Affix>
      <div class="px-6 py-3 bg-primary-500 text-white rounded-lg">
        固定在顶部
      </div>
    </Affix>
    <p>向下滚动页面查看效果</p>
  </div>
</template>
```

## 自定义偏移量

通过 `offset` 属性设置距离窗口顶部或底部的偏移量：

```vue
<template>
  <!-- 距离顶部 50px -->
  <Affix :offset="50">
    <div>固定内容</div>
  </Affix>

  <!-- 距离底部 50px -->
  <Affix position="bottom" :offset="50">
    <div>固定内容</div>
  </Affix>
</template>
```

## 固定位置

通过 `position` 属性设置固定位置：

```vue
<template>
  <!-- 固定在顶部 -->
  <Affix position="top">
    <div>固定在顶部</div>
  </Affix>

  <!-- 固定在底部 -->
  <Affix position="bottom">
    <div>固定在底部</div>
  </Affix>
</template>
```

## 自定义层级

通过 `z-index` 属性设置元素的层级：

```vue
<template>
  <Affix :z-index="1000">
    <div>高层级固定元素</div>
  </Affix>
</template>
```

## 自定义滚动容器

通过 `target` 属性指定监听滚动的容器：

```vue
<template>
  <div id="scroll-container" style="height: 400px; overflow: auto;">
    <div style="height: 2000px">
      <!-- 内容 -->
    </div>
    <Affix target="#scroll-container">
      <div>在容器内固定</div>
    </Affix>
  </div>
</template>
```

也可以使用函数返回容器：

```vue
<script setup lang="ts">
const getScrollContainer = () => {
  return document.getElementById('scroll-container')
}
</script>

<template>
  <Affix :target="getScrollContainer">
    <div>在容器内固定</div>
  </Affix>
</template>
```

## 事件监听

组件提供以下事件：

### change 事件

固定状态改变时触发：

```vue
<script setup lang="ts">
const handleChange = (fixed: boolean) => {
  console.log('固定状态:', fixed)
}
</script>

<template>
  <Affix @change="handleChange">
    <div>固定内容</div>
  </Affix>
</template>
```

### scroll 事件

滚动时触发：

```vue
<script setup lang="ts">
const handleScroll = (event: Event) => {
  console.log('滚动事件:', event)
}
</script>

<template>
  <Affix @scroll="handleScroll">
    <div>固定内容</div>
  </Affix>
</template>
```

## 暴露方法

组件暴露了以下方法和状态，可以通过 ref 调用：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const affixRef = ref()

const checkStatus = () => {
  console.log('是否固定:', affixRef.value?.isFixed)
}
</script>

<template>
  <Affix ref="affixRef">
    <div>固定内容</div>
  </Affix>
  <button @click="checkStatus">检查状态</button>
</template>
```

## 自定义样式

通过 `class` 和 `style` 属性自定义样式：

```vue
<template>
  <Affix
    class="bg-gradient-to-r from-purple-500 to-pink-500"
    style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)"
  >
    <div>自定义样式</div>
  </Affix>
</template>
```

## 应用场景

### 1. 固定导航栏

```vue
<template>
  <Affix :offset="0">
    <nav class="px-6 py-3 bg-white shadow-md">
      <div class="flex space-x-4">
        <a href="#" class="text-primary-600 hover:text-primary-800">首页</a>
        <a href="#" class="text-primary-600 hover:text-primary-800">产品</a>
        <a href="#" class="text-primary-600 hover:text-primary-800">关于</a>
      </div>
    </nav>
  </Affix>
</template>
```

### 2. 固定操作按钮

```vue
<template>
  <div style="height: 2000px">
    <!-- 页面内容 -->
  </div>

  <Affix position="bottom" :offset="20">
    <button class="px-6 py-3 bg-primary-500 text-white rounded-lg shadow-lg">
      保存
    </button>
  </Affix>
</template>
```

### 3. 侧边栏导航

```vue
<template>
  <div class="flex">
    <Affix :offset="20">
      <div class="w-48 p-4 bg-neutral-100 rounded-lg">
        <ul class="space-y-2">
          <li><a href="#section1">第一部分</a></li>
          <li><a href="#section2">第二部分</a></li>
          <li><a href="#section3">第三部分</a></li>
        </ul>
      </div>
    </Affix>

    <div class="flex-1 p-8">
      <!-- 页面内容 -->
    </div>
  </div>
</template>
```

### 4. 固定工具栏

```vue
<template>
  <Affix :offset="10">
    <div class="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow">
      <button class="p-2 hover:bg-neutral-100 rounded">📝</button>
      <button class="p-2 hover:bg-neutral-100 rounded">📁</button>
      <button class="p-2 hover:bg-neutral-100 rounded">⚙️</button>
    </div>
  </Affix>
</template>
```

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| offset | `number` | `0` | 距离窗口顶部或底部的偏移量 |
| position | `'top' \| 'bottom'` | `'top'` | 固定位置 |
| z-index | `number` | `10` | 元素的 z-index |
| target | `string \| function` | `window` | 设置 Affix 需要监听滚动事件的容器 |
| class | `any` | - | 自定义类名 |
| style | `any` | - | 自定义样式 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| change | `(fixed: boolean)` | 固定状态改变时触发 |
| scroll | `(event: Event)` | 滚动时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 需要固定的内容 |

### Exposed

| 属性名/方法名 | 类型 | 说明 |
|-------------|------|------|
| isFixed | `Ref<boolean>` | 当前是否固定 |
| checkFixed | `() => void` | 手动检查固定状态 |

## 样式变量

组件使用 Tailwind CSS 类名，可以通过以下方式自定义样式：

### 使用 class 属性

```vue
<Affix class="!bg-purple-500 !text-white">
  <div>自定义样式</div>
</Affix>
```

### 使用 style 属性

```vue
<Affix style="background: linear-gradient(to right, #8b5cf6, #ec4899)">
  <div>自定义样式</div>
</Affix>
```

## 注意事项

1. **性能优化**：组件使用 `passive: true` 的滚动监听器，不会阻塞页面滚动性能
2. **宽度保持**：固定时会保持元素的原始宽度，避免布局变化
3. **容器要求**：使用 `target` 属性时，确保目标元素是可滚动的（设置了 `overflow: auto` 或 `overflow: scroll`）
4. **嵌套使用**：不建议嵌套使用多个 Affix 组件，可能导致不可预期的行为

## 浏览器兼容性

- Chrome/Edge: 最新版本
- Firefox: 最新版本
- Safari: 最新版本
- 移动浏览器: iOS Safari, Chrome Mobile

## 完整示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Affix } from '@qingyu/design-system'

const affixRef = ref()
const isFixed = ref(false)
const scrollCount = ref(0)

const handleChange = (fixed: boolean) => {
  isFixed.value = fixed
}

const handleScroll = (event: Event) => {
  scrollCount.value++
}

const checkStatus = () => {
  console.log('当前状态:', {
    isFixed: affixRef.value?.isFixed,
    scrollCount: scrollCount.value,
  })
}
</script>

<template>
  <div style="height: 2000px">
    <!-- 状态面板 -->
    <div class="p-4 mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
      <p class="font-semibold mb-2">状态面板</p>
      <p>固定状态: {{ isFixed ? '已固定' : '未固定' }}</p>
      <p>滚动次数: {{ scrollCount }}</p>
      <button @click="checkStatus" class="mt-2 px-4 py-2 bg-primary-500 text-white rounded">
        检查状态
      </button>
    </div>

    <!-- 固钉组件 -->
    <Affix
      ref="affixRef"
      :offset="20"
      position="top"
      :z-index="100"
      @change="handleChange"
      @scroll="handleScroll"
    >
      <div class="px-6 py-3 bg-primary-500 text-white rounded-lg shadow-lg">
        <span class="font-medium">固定导航栏</span>
      </div>
    </Affix>

    <!-- 页面内容 -->
    <div class="p-8 space-y-4">
      <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
        Affix 固钉组件完整示例
      </h1>
      <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
        这是第 {{ i }} 段内容。向下滚动页面查看固钉效果。
      </p>
    </div>
  </div>
</template>
```

## 相关组件

- [BackTop](../BackTop/README.md) - 返回顶部组件
- [Drawer](../Drawer/README.md) - 抽屉组件
