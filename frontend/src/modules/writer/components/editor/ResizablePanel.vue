<template>
  <div
    class="resizable-panel"
    :class="[
      'resizable-panel--' + position,
      isCollapsed ? 'resizable-panel--collapsed' : '',
      isCollapsed && panelId === 'left' ? 'resizable-panel--collapsed-left' : '',
      isCollapsed && panelId === 'right' ? 'resizable-panel--collapsed-right' : '',
      isDragging ? 'resizable-panel--dragging' : ''
    ]"
    :style="panelStyle"
    :data-testid="`resizable-panel-${panelId}`"
  >
    <!-- 左侧面板: 内容在前，手柄在后 -->
    <template v-if="position === 'left'">
      <div class="panel-content">
        <slot />
      </div>
      <DragHandle
        v-if="resizable"
        :position="position"
        @drag-start="handleDragStart"
      />
    </template>

    <!-- 右侧面板: 手柄在前，内容在后（手柄贴近编辑区） -->
    <template v-else>
      <DragHandle
        v-if="resizable"
        :position="position"
        @drag-start="handleDragStart"
      />
      <div class="panel-content">
        <slot />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * ResizablePanel 可调整大小面板组件
 *
 * 提供可拖拽调整大小的面板功能：
 * - 集成DragHandle组件
 * - 使用usePanelResize组合式函数
 * - 支持左右面板
 * - 宽度约束（200-600px，可自定义）
 * - collapsible功能支持
 * - panelStore集成
 * - localStorage持久化
 *
 * @features
 * - 拖拽调整宽度
 * - 折叠/展开功能
 * - 宽度约束
 * - 响应式样式
 * - 无障碍支持
 */

import { computed } from 'vue'
import { usePanelResize, type DragStartEvent } from '@/modules/writer/composables/usePanelResize'
import DragHandle from '@/modules/writer/components/DragHandle.vue'

// ============================================
// Props 定义
// ============================================

interface Props {
  /** 面板ID */
  panelId: 'left' | 'right'
  /** 默认宽度 */
  defaultWidth: number
  /** 最小宽度（默认200px） */
  minWidth?: number
  /** 最大宽度（默认600px） */
  maxWidth?: number
  /** 手柄位置 */
  position: 'left' | 'right'
  /** 是否可折叠 */
  collapsible?: boolean
  /** 是否启用拖拽调宽 */
  resizable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  minWidth: 200,
  maxWidth: 600,
  collapsible: false,
  resizable: true,
})

// ============================================
// usePanelResize 集成
// ============================================

const {
  currentWidth,
  isDragging,
  isCollapsed,
  startDrag
} = usePanelResize({
  panelId: props.panelId,
  defaultWidth: props.defaultWidth,
  minWidth: props.minWidth,
  maxWidth: props.maxWidth,
  collapsible: props.collapsible
})

// ============================================
// 计算属性
// ============================================

/**
 * 面板样式
 */
const panelStyle = computed(() => {
  const width = currentWidth.value
  return {
    width: `${width}px`,
    minWidth: `${props.minWidth}px`,
    maxWidth: `${props.maxWidth}px`
  }
})

// ============================================
// 事件处理
// ============================================

/**
 * 处理DragHandle的drag-start事件
 */
const handleDragStart = (event: DragStartEvent) => {
  // 更新事件中的position为当前面板的position
  const updatedEvent: DragStartEvent = {
    ...event,
    position: props.position
  }
  startDrag(updatedEvent)
}

// ============================================
// 导出（用于测试）
// ============================================

defineExpose({
  isDragging,
  isCollapsed,
  currentWidth
})
</script>

<style scoped lang="scss">
/**
 * ResizablePanel 样式
 *
 * 使用 VSCode 主题 CSS 变量
 */

.resizable-panel {
  /* 布局 */
  position: relative;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 100%;
  min-height: 0;

  /* 过渡动画 - 使用统一变量 */
  transition: width 0.2s ease;
  background: transparent;
  border: none;

  /* 防止内容溢出 */
  overflow: hidden;
}

/* 左侧面板 */
.resizable-panel--left {
  order: 0;
  border: none;
}

/* 右侧面板 */
.resizable-panel--right {
  order: 2;
  border: none;
}

/* 折叠状态 */
.resizable-panel--collapsed-right {
  width: 66px !important;
  min-width: 66px !important;
  overflow: visible;
  border: none;
}

.resizable-panel--collapsed-left {
  width: 66px !important;
  min-width: 66px !important;
  overflow: visible;
  border: none;
}

.resizable-panel--collapsed-left .panel-content,
.resizable-panel--collapsed-right .panel-content {
  overflow: visible;
}

/* 拖拽状态 */
.resizable-panel--dragging {
  /* 拖拽时禁用过渡动画，提高性能 */
  transition: none;

  /* 视觉反馈 */
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4);
}

/* 面板内容 */
.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  height: 100%;

  /* 过渡动画 - 使用统一变量 */
  transition: opacity 0.2s ease;

  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 5px;
    border: 2px solid #f1f5f9;

    &:hover {
      background-color: #94a3b8;
    }
  }
}

/* 折叠状态下的内容 */
.panel-content--collapsed {
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .resizable-panel {
    /* 移动端默认折叠 */
    &.resizable-panel--left[data-collapsible="true"] {
      width: 0 !important;
    }
  }

}
</style>
