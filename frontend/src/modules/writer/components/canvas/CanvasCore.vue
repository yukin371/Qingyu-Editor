<template>
  <div
    ref="canvasContainerRef"
    class="canvas-core"
    :class="[
      containerClass,
      {
        'is-panning': interactionMode === 'panning',
        'is-selecting': interactionMode === 'selecting',
        'is-space-down': isSpaceDown,
        'is-grid-visible': showGrid,
      },
    ]"
    @contextmenu.prevent="handleContextMenu"
  >
    <!-- SVG 连线层 -->
    <svg v-if="$slots.connections" class="canvas-core__connections" :style="transformStyle">
      <slot name="connections" :zoom="zoom" :offset="offset" />
    </svg>

    <!-- 主画布内容 -->
    <div class="canvas-core__content" :style="transformStyle">
      <slot
        :zoom="zoom"
        :offset="offset"
        :selected-ids="selectedIds"
        :interaction-mode="interactionMode"
      />
    </div>

    <!-- 选区框覆盖层 -->
    <div v-if="selectionBox" class="canvas-core__selection-box" :style="selectionBoxStyle" />

    <!-- 浮动工具栏插槽 -->
    <div v-if="$slots.toolbar" class="canvas-core__toolbar">
      <slot
        name="toolbar"
        :zoom="zoom"
        :reset-view="resetView"
        :zoom-in="zoomIn"
        :zoom-out="zoomOut"
      />
    </div>

    <!-- 缩放指示器 -->
    <div class="canvas-core__zoom-indicator">
      <button type="button" class="zoom-btn" title="缩小" @click.stop="zoomOut()">
        <span class="zoom-btn__icon">&minus;</span>
      </button>
      <span class="zoom-btn__label">{{ Math.round(zoom * 100) }}%</span>
      <button type="button" class="zoom-btn" title="放大" @click.stop="zoomIn()">
        <span class="zoom-btn__icon">&plus;</span>
      </button>
      <button
        type="button"
        class="zoom-btn zoom-btn--reset"
        title="重置视图"
        @click.stop="resetView()"
      >
        <span class="zoom-btn__icon">&#8634;</span>
      </button>
    </div>

    <!-- 覆盖层插槽 -->
    <div v-if="$slots.overlay" class="canvas-core__overlay">
      <slot name="overlay" :zoom="zoom" :offset="offset" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * CanvasCore - 核心画布组件
 *
 * 提供可复用的画布基础设施，被结构舞台、故事分支、实体图谱等画布工具共享。
 *
 * @features
 * - 画布平移（鼠标中键拖拽 / 空格+左键拖拽）
 * - 画布缩放（滚轮 / +/- 按钮 / 快捷键）
 * - 节点渲染 slot
 * - SVG 连线层 slot
 * - 选区管理
 * - 浮动工具栏 slot
 * - 覆盖层 slot
 *
 * @usage
 * ```vue
 * <CanvasCore @canvas-click="handleClick">
 *   <template #default="{ zoom, selectedIds }">
 *     <MyNode v-for="node in nodes" :key="node.id" />
 *   </template>
 *   <template #connections="{ zoom }">
 *     <line v-for="edge in edges" :key="edge.id" ... />
 *   </template>
 * </CanvasCore>
 * ```
 */

import { ref, computed } from 'vue'
import { useCanvasInteraction } from './useCanvasInteraction'
import type { CanvasPoint, CanvasCoreProps } from './canvas.types'

const props = withDefaults(defineProps<CanvasCoreProps>(), {
  minZoom: 0.1,
  maxZoom: 3.0,
  zoomStep: 0.1,
  enableSelection: true,
  showGrid: false,
  gridSize: 20,
  initialZoom: 1,
  initialOffset: () => ({ x: 0, y: 0 }),
  containerClass: '',
})

const emit = defineEmits<{
  (e: 'zoom-change', zoom: number): void
  (e: 'offset-change', offset: CanvasPoint): void
  (e: 'selection-change', ids: string[]): void
  (e: 'canvas-click', event: MouseEvent): void
  (e: 'canvas-contextmenu', event: MouseEvent): void
  (e: 'node-click', nodeId: string, event: MouseEvent): void
  (e: 'node-dblclick', nodeId: string, event: MouseEvent): void
}>()

// 画布容器引用
const canvasContainerRef = ref<HTMLElement>()

// 使用画布交互 composable
const {
  zoom,
  offset,
  isSpaceDown,
  selectedIds,
  selectionBox,
  transformStyle,
  interactionMode,
  zoomIn,
  zoomOut,
  resetView,
  zoomToFit,
  setSelectedIds,
  addToSelection,
  removeFromSelection,
  toggleSelection,
  clearSelection,
  selectAll,
} = useCanvasInteraction(canvasContainerRef, {
  minZoom: props.minZoom,
  maxZoom: props.maxZoom,
  zoomStep: props.zoomStep,
  initialZoom: props.initialZoom,
  initialOffset: props.initialOffset,
})

// 选区框样式
const selectionBoxStyle = computed(() => {
  if (!selectionBox.value) return {}
  const box = selectionBox.value
  const left = Math.min(box.startX, box.endX)
  const top = Math.min(box.startY, box.endY)
  const width = Math.abs(box.endX - box.startX)
  const height = Math.abs(box.endY - box.startY)
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  }
})

// 右键菜单
function handleContextMenu(event: MouseEvent) {
  emit('canvas-contextmenu', event)
}

// 暴露给父组件使用的方法和状态
defineExpose({
  /** 当前缩放值 */
  zoom,
  /** 当前偏移 */
  offset,
  /** 选中的节点 ID 集合 */
  selectedIds,
  /** 放大 */
  zoomIn,
  /** 缩小 */
  zoomOut,
  /** 重置视图 */
  resetView,
  /** 自适应缩放 */
  zoomToFit,
  /** 设置选中的节点 */
  setSelectedIds,
  /** 添加到选中 */
  addToSelection,
  /** 从选中移除 */
  removeFromSelection,
  /** 切换选中 */
  toggleSelection,
  /** 清除选中 */
  clearSelection,
  /** 全选 */
  selectAll,
  /** 画布容器 DOM 引用 */
  containerRef: canvasContainerRef,
})
</script>

<style scoped lang="scss">
/* ==========================================================================
   CanvasCore - 核心画布组件样式
   ========================================================================== */
.canvas-core {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--canvas-bg, #f9fafb);
  cursor: default;
  user-select: none;
  outline: none;

  /* 平移模式光标 */
  &.is-space-down:not(.is-panning) {
    cursor: grab;
  }

  &.is-panning {
    cursor: grabbing;
  }

  /* 选区模式光标 */
  &.is-selecting {
    cursor: crosshair;
  }

  /* 网格背景 */
  &.is-grid-visible {
    background-image: radial-gradient(circle, var(--canvas-grid-dot, #d1d5db) 1px, transparent 1px);
    background-size: v-bind('`${gridSize}px ${gridSize}px`');
  }
}

/* 主内容层 */
.canvas-core__content {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  will-change: transform;
}

/* SVG 连线层 */
.canvas-core__connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: visible;
  pointer-events: none;
  will-change: transform;
}

/* 选区框 */
.canvas-core__selection-box {
  position: absolute;
  border: 1.5px dashed var(--canvas-selection-border, #3b82f6);
  background: var(--canvas-selection-bg, rgba(59, 130, 246, 0.08));
  pointer-events: none;
  z-index: 50;
}

/* 浮动工具栏 */
.canvas-core__toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 缩放指示器 */
.canvas-core__zoom-indicator {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: var(--canvas-zoom-bg, rgba(255, 255, 255, 0.9));
  border: 1px solid var(--canvas-zoom-border, #e2e8f0);
  border-radius: 8px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--canvas-zoom-color, #475569);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--canvas-zoom-hover-bg, #f1f5f9);
    color: var(--canvas-zoom-hover-color, #1e293b);
  }

  &:active {
    transform: scale(0.95);
  }
}

.zoom-btn__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

.zoom-btn__label {
  min-width: 44px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--canvas-zoom-color, #475569);
  font-variant-numeric: tabular-nums;
}

.zoom-btn--reset {
  .zoom-btn__icon {
    font-size: 14px;
  }
}

/* 覆盖层 */
.canvas-core__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 60;
}
</style>
