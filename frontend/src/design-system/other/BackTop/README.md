# BackTop 返回顶部组件

用于在页面滚动时快速返回顶部的组件，支持自定义样式、动画时长、缓动函数等丰富的配置选项。

## 基本用法

最简单的用法，使用默认配置：

```vue
<script setup lang="ts">
import { BackTop } from '@qingyu/design-system'
</script>

<template>
  <div>
    <!-- 页面内容 -->
    <div style="height: 2000px">
      <p>滚动页面查看返回顶部按钮</p>
    </div>
    
    <!-- 返回顶部按钮 -->
    <BackTop />
  </div>
</template>
```

## 自定义显示高度

通过 `visibility-height` 属性设置滚动多少距离后显示返回顶部按钮：

```vue
<template>
  <BackTop :visibility-height="200" />
</template>
```

## 自定义动画时长

通过 `duration` 属性设置返回顶部的动画时长（毫秒）：

```vue
<template>
  <BackTop :duration="500" />
</template>
```

## 自定义缓动函数

通过 `easing` 属性设置滚动动画的缓动效果：

```vue
<template>
  <!-- 使用内置缓动函数 -->
  <BackTop easing="ease-in-out" />
  
  <!-- 使用自定义缓动函数 -->
  <BackTop :easing="(t) => t * t" />
</template>
```

内置缓动函数选项：
- `linear` - 线性
- `ease-in` - 加速
- `ease-out` - 减速
- `ease-in-out` - 先加速后减速

## 自定义按钮样式

### 形状

通过 `shape` 属性设置按钮形状：

```vue
<template>
  <BackTop shape="circle" />  <!-- 圆形 -->
  <BackTop shape="square" />  <!-- 方形 -->
</template>
```

### 大小

通过 `size` 属性设置按钮大小：

```vue
<template>
  <BackTop size="small" />    <!-- 小 -->
  <BackTop size="medium" />   <!-- 中 -->
  <BackTop size="large" />    <!-- 大 -->
</template>
```

### 位置

通过 `position` 属性设置按钮位置：

```vue
<template>
  <BackTop position="top-right" />     <!-- 右上角 -->
  <BackTop position="top-left" />      <!-- 左上角 -->
  <BackTop position="bottom-right" />  <!-- 右下角 -->
  <BackTop position="bottom-left" />   <!-- 左下角 -->
</template>
```

## 显示滚动进度

通过 `show-progress` 属性在按钮上显示滚动进度百分比：

```vue
<template>
  <BackTop :show-progress="true" />
</template>
```

## 平滑滚动

通过 `smooth` 属性控制是否启用平滑滚动：

```vue
<template>
  <!-- 启用平滑滚动（默认） -->
  <BackTop :smooth="true" />
  
  <!-- 禁用平滑滚动，直接跳转 -->
  <BackTop :smooth="false" />
</template>
```

## 自动隐藏

通过 `auto-hide` 属性在返回顶部后自动隐藏按钮：

```vue
<template>
  <BackTop :auto-hide="true" />
</template>
```

## 滚动到指定元素

通过 `target-element` 属性设置滚动到指定元素而非页面顶部：

```vue
<template>
  <div id="header-section">
    <!-- 头部内容 -->
  </div>
  
  <BackTop target-element="header-section" />
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
    <BackTop target="#scroll-container" />
  </div>
</template>
```

## 自定义内容

### 自定义图标

使用 `icon` 插槽自定义图标：

```vue
<template>
  <BackTop>
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    </template>
  </BackTop>
</template>
```

### 自定义文本

使用默认插槽自定义文本内容：

```vue
<template>
  <BackTop shape="square" size="large">
    <span class="text-sm font-medium">返回顶部</span>
  </BackTop>
</template>
```

## 自定义样式

通过 `class` 和 `style` 属性自定义样式：

```vue
<template>
  <BackTop 
    class="!bg-gradient-to-r !from-purple-500 !to-pink-500"
    style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)"
  />
</template>
```

## 事件监听

组件提供以下事件：

```vue
<script setup lang="ts">
const handleClick = (event: MouseEvent) => {
  console.log('点击了返回顶部按钮', event)
}

const handleShow = () => {
  console.log('返回顶部按钮已显示')
}

const handleHide = () => {
  console.log('返回顶部按钮已隐藏')
}
</script>

<template>
  <BackTop 
    @click="handleClick"
    @show="handleShow"
    @hide="handleHide"
  />
</template>
```

## 暴露方法

组件暴露了以下方法，可以通过 ref 调用：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const backTopRef = ref()

const scrollToTop = () => {
  backTopRef.value?.scrollToTop()
}

const scrollToElement = () => {
  backTopRef.value?.scrollToElement()
}
</script>

<template>
  <BackTop ref="backTopRef" />
  <button @click="scrollToTop">手动触发返回顶部</button>
</template>
```

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| visibility-height | `number` | `400` | 滚动高度达到该值时显示返回顶部按钮 |
| back-position | `number` | `0` | 返回顶部的目标位置 |
| duration | `number` | `300` | 滚动动画的持续时间（毫秒） |
| easing | `string \| function` | `'ease-in-out'` | 滚动动画的缓动函数 |
| shape | `'circle' \| 'square'` | `'circle'` | 按钮的形状 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮的大小 |
| position | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'bottom-right'` | 按钮的位置 |
| show-progress | `boolean` | `false` | 是否显示滚动进度百分比 |
| smooth | `boolean` | `true` | 是否启用平滑滚动 |
| auto-hide | `boolean` | `false` | 是否在返回顶部后自动隐藏 |
| target | `string \| function` | `window` | 滚动容器的选择器或返回容器的函数 |
| target-element | `string` | - | 滚动到目标元素的 ID |
| class | `any` | - | 自定义类名 |
| style | `any` | - | 自定义样式 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | `(event: MouseEvent)` | 点击按钮时触发 |
| show | `()` | 按钮显示时触发 |
| hide | `()` | 按钮隐藏时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义默认内容 |
| icon | 自定义图标 |

### Exposed

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| scrollToTop | - | `void` | 滚动到顶部 |
| scrollToElement | - | `void` | 滚动到指定元素 |
| visible | - | `Ref<boolean>` | 当前可见状态 |

## 样式变量

组件使用 Tailwind CSS 类名，可以通过以下方式自定义样式：

### 使用 class 属性

```vue
<BackTop class="!bg-purple-500 !hover:bg-purple-600" />
```

### 使用 style 属性

```vue
<BackTop style="background: linear-gradient(to right, #8b5cf6, #ec4899)" />
```

## 无障碍性

组件支持键盘操作：
- `Enter` 键：触发返回顶部
- `Space` 键：触发返回顶部

## 浏览器兼容性

- Chrome/Edge: 最新版本
- Firefox: 最新版本
- Safari: 最新版本
- 移动浏览器: iOS Safari, Chrome Mobile

## 注意事项

1. **性能优化**：组件使用 `passive: true` 的滚动监听器，不会阻塞页面滚动性能
2. **默认插槽优先**：如果同时使用默认插槽和 icon 插槽，默认插槽的内容会覆盖 icon 插槽
3. **自定义容器**：使用 `target` 属性时，确保目标元素是可滚动的（设置了 `overflow: auto` 或 `overflow: scroll`）
4. **目标元素**：使用 `target-element` 属性时，确保目标元素存在且有对应的 ID

## 完整示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BackTop } from '@qingyu/design-system'

const backTopRef = ref()
const handleClick = () => {
  console.log('返回顶部')
}
</script>

<template>
  <div>
    <!-- 页面内容 -->
    <div class="p-8" style="height: 2000px">
      <h1>返回顶部组件示例</h1>
      <p>向下滚动页面查看返回顶部按钮</p>
    </div>
    
    <!-- 返回顶部按钮 -->
    <BackTop 
      ref="backTopRef"
      :visibility-height="200"
      :duration="500"
      easing="ease-in-out"
      shape="circle"
      size="large"
      position="bottom-right"
      :show-progress="true"
      :smooth="true"
      @click="handleClick"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </template>
    </BackTop>
  </div>
</template>
```
