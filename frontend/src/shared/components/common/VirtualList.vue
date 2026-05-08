<template>
  <div class="virtual-list" ref="containerRef" @scroll="handleScroll">
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="virtual-list-content" :style="{ transform: `translateY(${offsetY}px)` }">
      <div
        v-for="item in visibleItems"
        :key="getItemKey(item)"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item" :index="item.__index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

type ItemType = Record<string, any>

interface VirtualListProps {
  items: ItemType[]
  itemHeight: number
  bufferSize?: number
  itemKey?: keyof ItemType | ((item: ItemType) => string | number)
}

const props = withDefaults(defineProps<VirtualListProps>(), {
  bufferSize: 5,
  itemKey: () => 'id' as keyof ItemType,
})

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(0)

/**
 * 总高度
 */
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

/**
 * 可见区域的起始索引
 */
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight)
  return Math.max(0, index - props.bufferSize)
})

/**
 * 可见区域的结束索引
 */
const endIndex = computed(() => {
  const visibleCount = Math.ceil(containerHeight.value / props.itemHeight)
  return Math.min(props.items.length, startIndex.value + visibleCount + props.bufferSize * 2)
})

/**
 * 可见的项目列表
 */
const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value).map((item, index) => ({
    ...item,
    __index: startIndex.value + index,
  }))
})

/**
 * 偏移量
 */
const offsetY = computed(() => {
  return startIndex.value * props.itemHeight
})

/**
 * 获取项目的key
 */
const getItemKey = (item: ItemType & { __index?: number }): string | number => {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item)
  }
  return item[props.itemKey as keyof ItemType] as string | number
}

/**
 * 处理滚动
 */
const handleScroll = () => {
  if (!containerRef.value) return
  scrollTop.value = containerRef.value.scrollTop
}

/**
 * 更新容器高度
 */
const updateContainerHeight = () => {
  if (!containerRef.value) return
  containerHeight.value = containerRef.value.clientHeight
}

/**
 * 滚动到指定索引
 */
const scrollToIndex = (index: number) => {
  if (!containerRef.value) return
  const targetScrollTop = index * props.itemHeight
  containerRef.value.scrollTop = targetScrollTop
}

/**
 * 滚动到顶部
 */
const scrollToTop = () => {
  scrollToIndex(0)
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  scrollToIndex(props.items.length - 1)
}

// 暴露方法
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
})

// 监听items变化，重置滚动位置
watch(
  () => props.items.length,
  () => {
    if (scrollTop.value > totalHeight.value) {
      scrollTop.value = 0
      if (containerRef.value) {
        containerRef.value.scrollTop = 0
      }
    }
  },
)

// 监听窗口大小变化
const resizeObserver = new ResizeObserver(() => {
  updateContainerHeight()
})

onMounted(() => {
  if (containerRef.value) {
    updateContainerHeight()
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    resizeObserver.unobserve(containerRef.value)
  }
  resizeObserver.disconnect()
})
</script>

<style scoped lang="scss">
.virtual-list {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.virtual-list-item {
  width: 100%;
}

/* 滚动条样式 */
.virtual-list::-webkit-scrollbar {
  width: 8px;
}

.virtual-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.virtual-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;

  &:hover {
    background: #a8a8a8;
  }
}
</style>
