<!--
  VirtualChapterList - 虚拟章节列表组件
  TDD Phase 7: 性能优化 - 虚拟滚动功能

  功能特性:
  - 使用虚拟滚动优化大列表渲染性能
  - 只渲染可见区域的项目
  - 支持自定义项目高度和容器高度
  - 支持滚动加载更多
  - 支持自定义插槽
-->
<template>
  <div
    class="virtual-chapter-list"
    :style="{ height: `${height}px` }"
    @scroll="handleScroll"
  >
    <div
      class="virtual-spacer"
      :style="{ height: `${totalHeight}px` }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id || item.index"
        class="chapter-item"
        :style="{ transform: `translateY(${item.offset}px)` }"
        @click="handleSelect(item)"
      >
        <slot name="item" :item="item">
          <div class="chapter-content">
            <span class="chapter-index">{{ item.index + 1 }}</span>
            <span class="chapter-title">{{ item.title }}</span>
          </div>
        </slot>
      </div>
    </div>

    <div v-if="chapters.length === 0" class="empty-state">
      <QyIcon name="Document" :size="48" />
      <p>暂无章节</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'

interface Chapter {
  id?: string
  title: string
  content?: string
}

interface Props {
  chapters: Chapter[]
  itemHeight?: number
  height?: number
  overscan?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 60,
  height: 400,
  overscan: 3
})

const emit = defineEmits<{
  select: [chapter: Chapter & { index: number }]
  loadMore: []
}>()

const scrollTop = ref(0)

// 计算总高度
const totalHeight = computed(() => props.chapters.length * props.itemHeight)

// 计算可见范围
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const visibleCount = Math.ceil(props.height / props.itemHeight)
  const end = start + visibleCount

  return {
    start: Math.max(0, start - props.overscan),
    end: Math.min(props.chapters.length, end + props.overscan)
  }
})

// 可见项目
const visibleItems = computed(() => {
  const { start, end } = visibleRange.value
  return props.chapters.slice(start, end).map((chapter, index) => ({
    ...chapter,
    index: start + index,
    offset: (start + index) * props.itemHeight
  }))
})

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop

  // 检查是否滚动到底部，触发加载更多
  const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight
  if (scrollBottom < 100) {
    emit('loadMore')
  }
}

const handleSelect = (item: Chapter & { index: number }) => {
  emit('select', item)
}

// 监听chapters变化，重置scrollTop
watch(() => props.chapters.length, () => {
  scrollTop.value = 0
})
</script>

<style scoped lang="scss">
.virtual-chapter-list {
  overflow-y: auto;
  position: relative;

  .virtual-spacer {
    position: relative;
  }

  .chapter-item {
    position: absolute;
    left: 0;
    right: 0;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  .chapter-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .chapter-index {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    border-radius: 50%;
    font-size: 12px;
  }

  .chapter-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--el-text-color-placeholder);
    gap: 12px;
  }
}
</style>
