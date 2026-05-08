# Carousel 轮播图组件

一个功能完整、高度可定制的轮播图组件，支持自动播放、方向控制、指示器、箭头导航等功能。

## 特性

- 🎯 **多种播放模式**：支持水平和垂直两个方向
- ⚡ **自动播放**：可配置自动播放和播放间隔
- 🔄 **循环播放**：支持循环和非循环模式
- 🎨 **指示器**：支持多种指示器位置和触发方式
- 🔘 **箭头导航**：可自定义箭头按钮和显示方式
- 📱 **响应式**：自适应不同屏幕尺寸
- ⚡ **懒加载**：支持内容懒加载，提升性能
- 🎭 **插槽支持**：提供灵活的自定义能力

## 基础用法

```vue
<script setup lang="ts">
import Carousel from '@/design-system/other/Carousel'
</script>

<template>
  <Carousel height="400px">
    <div class="w-full h-full bg-blue-500 flex items-center justify-center text-white">
      Slide 1
    </div>
    <div class="w-full h-full bg-purple-500 flex items-center justify-center text-white">
      Slide 2
    </div>
    <div class="w-full h-full bg-pink-500 flex items-center justify-center text-white">
      Slide 3
    </div>
  </Carousel>
</template>
```

## 自动播放

设置 `autoplay` 属性即可启用自动播放，通过 `interval` 设置播放间隔。

```vue
<Carousel :autoplay="true" :interval="3000">
  <!-- 轮播内容 -->
</Carousel>
```

## 方向控制

通过 `direction` 属性设置播放方向。

```vue
<!-- 水平方向（默认） -->
<Carousel direction="horizontal">
  <!-- 轮播内容 -->
</Carousel>

<!-- 垂直方向 -->
<Carousel direction="vertical">
  <!-- 轮播内容 -->
</Carousel>
```

## 指示器

通过 `indicator-position` 设置指示器位置，通过 `trigger` 设置触发方式。

```vue
<!-- 内部指示器（默认） -->
<Carousel indicator-position="inside">
  <!-- 轮播内容 -->
</Carousel>

<!-- 外部指示器 -->
<Carousel indicator-position="outside">
  <!-- 轮播内容 -->
</Carousel>

<!-- 无指示器 -->
<Carousel indicator-position="none">
  <!-- 轮播内容 -->
</Carousel>

<!-- Hover 触发 -->
<Carousel trigger="hover">
  <!-- 轮播内容 -->
</Carousel>
```

## 箭头导航

通过 `arrow` 属性控制箭头显示方式。

```vue
<!-- 始终显示 -->
<Carousel arrow="always">
  <!-- 轮播内容 -->
</Carousel>

<!-- 悬停显示（默认） -->
<Carousel arrow="hover">
  <!-- 轮播内容 -->
</Carousel>

<!-- 不显示 -->
<Carousel arrow="never">
  <!-- 轮播内容 -->
</Carousel>
```

## 自定义箭头

使用 `prev` 和 `next` 插槽自定义箭头按钮。

```vue
<Carousel arrow="always">
  <template #prev>
    <button class="custom-prev">←</button>
  </template>
  <template #next>
    <button class="custom-next">→</button>
  </template>
  <!-- 轮播内容 -->
</Carousel>
```

## 循环播放

通过 `loop` 属性控制是否循环播放。

```vue
<!-- 循环播放（默认） -->
<Carousel :loop="true">
  <!-- 轮播内容 -->
</Carousel>

<!-- 不循环 -->
<Carousel :loop="false">
  <!-- 轮播内容 -->
</Carousel>
```

## 暂停播放

鼠标悬停时暂停自动播放。

```vue
<Carousel :autoplay="true" :pause-on-hover="true">
  <!-- 轮播内容 -->
</Carousel>
```

## 事件监听

监听 `change` 事件获取当前索引变化。

```vue
<script setup lang="ts">
import Carousel from '@/design-system/other/Carousel'

const handleChange = (current: number, prev: number) => {
  console.log(\`从 \${prev} 切换到 \${current}\`)
}
</script>

<template>
  <Carousel @change="handleChange">
    <!-- 轮播内容 -->
  </Carousel>
</template>
```

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| height | string | '400px' | 轮播容器高度 |
| initialIndex | number | 0 | 初始激活的索引 |
| trigger | 'click' \| 'hover' | 'click' | 指示器的触发方式 |
| autoplay | boolean | false | 是否自动切换 |
| interval | number | 3000 | 自动切换的时间间隔（毫秒） |
| loop | boolean | true | 是否循环切换 |
| direction | 'horizontal' \| 'vertical' | 'horizontal' | 播放方向 |
| indicatorPosition | 'none' \| 'inside' \| 'outside' | 'inside' | 指示器位置 |
| arrow | 'always' \| 'hover' \| 'never' | 'hover' | 箭头显示方式 |
| pauseOnHover | boolean | true | 鼠标悬停时是否暂停自动切换 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| change | (current: number, prev: number) | 当前活跃的索引发生变化时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 轮播项内容 |
| prev | 自定义上一张按钮 |
| next | 自定义下一张按钮 |

## 最佳实践

### 1. 图片轮播

```vue
<Carousel height="500px" :autoplay="true" :interval="5000">
  <img
    v-for="(image, index) in images"
    :key="index"
    :src="image.url"
    :alt="image.alt"
    class="w-full h-full object-cover"
  />
</Carousel>
```

### 2. 产品展示

```vue
<Carousel height="600px" :loop="true" arrow="always">
  <div
    v-for="product in products"
    :key="product.id"
    class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white p-12"
  >
    <div class="text-center">
      <h2 class="text-4xl font-bold mb-4">{{ product.name }}</h2>
      <p class="text-xl opacity-90">{{ product.description }}</p>
    </div>
  </div>
</Carousel>
```

### 3. 垂直轮播

```vue
<Carousel
  height="400px"
  direction="vertical"
  :autoplay="true"
  indicator-position="outside"
  class="w-[500px]"
>
  <!-- 轮播内容 -->
</Carousel>
```

### 4. 性能优化（懒加载）

对于图片较多的轮播，建议使用懒加载：

```vue
<Carousel :autoplay="true">
  <img
    v-for="(image, index) in images"
    :key="index"
    :src="image.url"
    loading="lazy"
    class="w-full h-full object-cover"
  />
</Carousel>
```

## 注意事项

1. **高度设置**：建议始终设置 `height` 属性，确保布局稳定
2. **图片优化**：使用适当的图片尺寸和格式，避免加载过大图片
3. **自动播放**：建议设置合理的 `interval` 值（3-5秒）
4. **触摸设备**：在触摸设备上，建议启用 `pause-on-hover` 以避免自动播放干扰用户操作
5. **循环播放**：如果轮播项很少，建议启用 `loop` 提升体验

## 相关组件

- [Card](../Card/README.md) - 卡片组件
- [Image](../../base/Image/README.md) - 图片组件
