# Composables (组合式函数)

组合式函数是封装和复用有状态逻辑的函数，是 Vue 3 Composition API 的重要组成部分。

## 目录

- [useResponsive](#useresponsive) - 响应式布局检测
- [useTouch](#usetouch) - 触摸手势处理
- [useLazyLoad](#uselazyload) - 懒加载和无限滚动

## useResponsive

响应式布局检测，判断当前屏幕尺寸和设备类型。

### 基本用法

```vue
<script setup lang="ts">
import { useResponsive } from '@/composables/useResponsive'

const {
  isMobile,
  isTablet,
  isDesktop,
  currentBreakpoint,
  windowWidth
} = useResponsive()
</script>

<template>
  <div>
    <div v-if="isMobile">移动端视图</div>
    <div v-else-if="isTablet">平板视图</div>
    <div v-else>桌面端视图</div>
  </div>
</template>
```

### API

#### 返回值

| 属性                | 类型                         | 说明                        |
| ------------------- | ---------------------------- | --------------------------- |
| `windowWidth`       | `Ref<number>`                | 窗口宽度                    |
| `windowHeight`      | `Ref<number>`                | 窗口高度                    |
| `currentBreakpoint` | `ComputedRef<BreakpointKey>` | 当前断点                    |
| `isMobile`          | `ComputedRef<boolean>`       | 是否为移动端 (< 992px)      |
| `isTablet`          | `ComputedRef<boolean>`       | 是否为平板 (768px ~ 1200px) |
| `isDesktop`         | `ComputedRef<boolean>`       | 是否为桌面端 (>= 1200px)    |
| `isSmallScreen`     | `ComputedRef<boolean>`       | 是否为小屏幕 (< 768px)      |
| `isLargeScreen`     | `ComputedRef<boolean>`       | 是否为大屏幕 (>= 1920px)    |

#### 断点配置

```typescript
{
  xs: 0,      // 超小屏幕
  sm: 768,    // 小屏幕
  md: 992,    // 中等屏幕
  lg: 1200,   // 大屏幕
  xl: 1920,   // 超大屏幕
  xxl: 2560   // 超超大屏幕
}
```

### 工具函数

```typescript
// 防抖
import { debounce } from '@/composables/useResponsive'
const debouncedFn = debounce(() => {
  console.log('执行')
}, 300)

// 节流
import { throttle } from '@/composables/useResponsive'
const throttledFn = throttle(() => {
  console.log('执行')
}, 300)
```

## useTouch

触摸手势处理，支持滑动、点击、双击、长按等手势。

### 基本用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTouch } from '@/composables/useTouch'

const containerRef = ref()

useTouch(containerRef, {
  onSwipeLeft: () => console.log('向左滑动'),
  onSwipeRight: () => console.log('向右滑动'),
  onTap: () => console.log('点击'),
  onDoubleTap: () => console.log('双击'),
  onLongPress: () => console.log('长按')
})
</script>

<template>
  <div ref="containerRef">触摸区域</div>
</template>
```

### API

#### 选项

| 选项             | 类型         | 默认值 | 说明           |
| ---------------- | ------------ | ------ | -------------- |
| `threshold`      | `number`     | `50`   | 滑动阈值（px） |
| `onSwipeLeft`    | `() => void` | -      | 向左滑动回调   |
| `onSwipeRight`   | `() => void` | -      | 向右滑动回调   |
| `onSwipeUp`      | `() => void` | -      | 向上滑动回调   |
| `onSwipeDown`    | `() => void` | -      | 向下滑动回调   |
| `onTap`          | `() => void` | -      | 点击回调       |
| `onDoubleTap`    | `() => void` | -      | 双击回调       |
| `onLongPress`    | `() => void` | -      | 长按回调       |
| `longPressDelay` | `number`     | `500`  | 长按延迟（ms） |

### 下拉刷新

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { usePullRefresh } from '@/composables/useTouch'

const containerRef = ref()

const { isPulling, isRefreshing, pullDistance } = usePullRefresh(containerRef, {
  threshold: 80,
  onRefresh: async () => {
    await fetchData()
  }
})
</script>

<template>
  <div ref="containerRef">
    <div v-if="isRefreshing">加载中...</div>
    <div v-else-if="isPulling">释放刷新（{{ pullDistance }}px）</div>
    <!-- 内容 -->
  </div>
</template>
```

## useLazyLoad

懒加载和无限滚动。

### 图片懒加载

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

const imgRef = ref()
const imageUrl = ref('')

useLazyLoad(imgRef, {
  onIntersect: () => {
    imageUrl.value = '/path/to/image.jpg'
  }
})
</script>

<template>
  <img ref="imgRef" :src="imageUrl" alt="">
</template>
```

### 无限滚动

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useInfiniteScroll } from '@/composables/useLazyLoad'

const containerRef = ref()
const items = ref([])

const { isLoading, hasMore, setHasMore } = useInfiniteScroll(containerRef, {
  distance: 100,
  onLoadMore: async () => {
    const newItems = await fetchMoreItems()
    if (newItems.length === 0) {
      setHasMore(false)
    } else {
      items.value.push(...newItems)
    }
  }
})
</script>

<template>
  <div ref="containerRef" class="scroll-container">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
    <div v-if="isLoading">加载中...</div>
    <div v-if="!hasMore">没有更多了</div>
  </div>
</template>
```

### 图片预加载

```typescript
import { useImagePreload } from '@/composables/useLazyLoad'

const urls = ['/image1.jpg', '/image2.jpg', '/image3.jpg']
const { isLoading, loadedCount, totalCount, progress, preload } = useImagePreload(urls)

// 开始预加载
await preload()

console.log(`加载进度: ${progress()}%`)
```

### 虚拟滚动

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useVirtualScroll } from '@/composables/useLazyLoad'

const containerRef = ref()
const allItems = ref([/* 大量数据 */])

const { visibleItems, visibleStart, totalHeight, offsetY } = useVirtualScroll(
  containerRef,
  {
    itemHeight: 50,
    buffer: 5,
    items: allItems.value
  }
)
</script>

<template>
  <div ref="containerRef" class="virtual-scroll-container">
    <div :style="{ height: totalHeight + 'px' }">
      <div :style="{ transform: `translateY(${offsetY()}px)` }">
        <div
          v-for="(item, index) in visibleItems"
          :key="visibleStart + index"
          class="virtual-item"
        >
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>
```

## 最佳实践

1. **性能优化**
   - 使用防抖/节流优化频繁触发的事件
   - 使用虚拟滚动处理大列表
   - 使用懒加载优化图片加载

2. **移动端优化**
   - 使用触摸手势替代鼠标事件
   - 实现下拉刷新提升用户体验
   - 添加无限滚动减少分页

3. **响应式设计**
   - 根据设备类型显示不同布局
   - 使用断点控制组件渲染
   - 优化移动端触摸交互

## 注意事项

1. 组合式函数应在 `setup()` 或 `<script setup>` 中调用
2. 返回的响应式引用需要在模板中使用 `.value` 访问（setup 中）
3. 确保清理副作用（组合式函数内部已处理）
4. 注意浏览器兼容性（部分 API 可能不支持旧浏览器）


