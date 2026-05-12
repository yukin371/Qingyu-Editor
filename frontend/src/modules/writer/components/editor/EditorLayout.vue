<template>
  <div
    class="editor-layout"
    :class="layoutClasses"
    role="application"
    :aria-label="`编辑器，${layoutModeLabel}`"
  >
    <!-- 移动端tab导航 -->
    <div v-if="layout.mode === 'mobile'" class="mobile-tabs" role="tablist">
      <button
        v-for="tab in mobileTabs"
        :key="tab.key"
        class="mobile-tab"
        :class="{ active: layout.activeTab === tab.key }"
        :aria-label="tab.label"
        :aria-selected="layout.activeTab === tab.key"
        role="tab"
        @click="switchTab(tab.key)"
      >
        <QyIcon :name="tab.icon" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 主内容区域 -->
    <div
      class="editor-layout__content"
      :class="contentClasses"
      @touchstart="handleContentTouchStart"
      @touchmove="handleContentTouchMove"
      @touchend="handleContentTouchEnd"
    >
      <!-- 左侧面板 - 添加过渡动画 -->
      <Transition name="panel-slide-left">
        <ResizablePanel
          v-show="leftPanelState !== 'hidden'"
          panel-id="left"
          :default-width="layout.leftPanel.width"
          :min-width="layout.leftPanel.minWidth"
          :max-width="layout.leftPanel.maxWidth"
          position="left"
          :collapsible="true"
          :resizable="!isImmersiveMode"
          :class="[
            leftPanelClasses,
            'editor-layout__left-panel',
            { 'panel-visible': leftPanelVisible },
          ]"
          :style="leftPanelStyle"
        >
          <SidePanel position="left" :class="{ 'panel-visible': leftPanelVisible }">
            <slot name="left-panel">
              <div class="editor-layout__placeholder" data-testid="editor-layout-left-placeholder">
                <strong>Left Panel Slot Recommended</strong>
                <span>请在 `EditorLayout` 中传入左侧面板插槽。</span>
              </div>
            </slot>
          </SidePanel>
        </ResizablePanel>
      </Transition>

      <!-- 中间编辑器 -->
      <div
        class="editor-layout__main"
        :class="[
          { 'panel-visible': layout.activeTab === 'editor' },
          { 'immersive-mode': isImmersiveMode },
        ]"
      >
        <slot name="editor">
          <div class="editor-layout__placeholder" data-testid="editor-layout-editor-placeholder">
            <strong>Editor Slot Required</strong>
            <span>请在 `EditorLayout` 中传入编辑器内容插槽。</span>
          </div>
        </slot>
      </div>

      <!-- 右侧AI助手 - 添加过渡动画 -->
      <Transition name="panel-slide-right">
        <ResizablePanel
          v-show="rightPanelState !== 'hidden'"
          panel-id="right"
          :default-width="layout.rightPanel.width"
          :min-width="layout.rightPanel.minWidth"
          :max-width="layout.rightPanel.maxWidth"
          position="right"
          :collapsible="true"
          :resizable="!isImmersiveMode"
          :class="[
            rightPanelClasses,
            'editor-layout__right-panel',
            { 'panel-visible': rightPanelVisible },
          ]"
          :style="rightPanelStyle"
        >
          <SidePanel
            position="right"
            :collapsible="true"
            :class="{ 'panel-visible': rightPanelVisible }"
          >
            <slot name="right-panel">
              <div class="editor-layout__placeholder" data-testid="editor-layout-right-placeholder">
                <strong>Right Panel Slot Required</strong>
                <span>请在 `EditorLayout` 中传入右侧面板插槽。</span>
              </div>
            </slot>
          </SidePanel>
        </ResizablePanel>
      </Transition>
    </div>

    <!-- 屏幕阅读器实时通知 -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ ariaAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ResizablePanel from './ResizablePanel.vue'
import SidePanel from './SidePanel.vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
import { useEditorStore, type ActiveTool } from '../../stores/editorStore'
import { usePanelStore } from '../../stores/panelStore'

// ==================== 插槽类型定义 ====================
defineSlots<{
  'left-panel'?: () => unknown
  editor?: () => unknown
  'right-panel'?: () => unknown
}>()

const editorStore = useEditorStore()
const panelStore = usePanelStore()
const activeTool = computed<ActiveTool>(() => editorStore.activeTool ?? 'writing')

// ==================== 面板可见性计算 ====================
const leftPanelVisible = computed(() => {
  if (layout.value.mode === 'mobile') {
    return layout.value.activeTab === 'left'
  }
  return true
})

const rightPanelVisible = computed(() => {
  if (layout.value.mode === 'mobile') {
    return layout.value.activeTab === 'right'
  }
  return true
})

// 左侧面板状态：'expanded' | 'collapsed' | 'hidden'
const leftPanelState = computed((): 'expanded' | 'collapsed' | 'hidden' => {
  return panelStore.leftCollapsed ? 'collapsed' : 'expanded'
})

// 右侧面板状态：'expanded' | 'collapsed' | 'hidden'
const rightPanelState = computed((): 'expanded' | 'collapsed' | 'hidden' => {
  return panelStore.rightCollapsed ? 'collapsed' : 'expanded'
})

// 是否为沉浸模式
const isImmersiveMode = computed(() => activeTool.value === 'immersive')

// 响应式布局
const { layout, switchTab, handleTouchGesture: handleGesture } = useResponsiveLayout()

const mobileTabs = computed(() => {
  type TabKey = 'left' | 'editor' | 'right'
  const base: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: 'left', label: '目录', icon: 'List' },
    { key: 'editor', label: '编辑', icon: 'Edit' },
    { key: 'right', label: 'AI', icon: 'MagicStick' },
  ]
  return base
})

// 计算属性：布局类名
const layoutClasses = computed(() => ({
  'layout-mode-mobile': layout.value.mode === 'mobile',
  'layout-mode-tablet': layout.value.mode === 'tablet',
  'layout-mode-desktop': layout.value.mode === 'desktop',
}))

const contentClasses = computed(() => ({
  'content-mobile': layout.value.mode === 'mobile',
  'content-tablet': layout.value.mode === 'tablet',
  'content-desktop': layout.value.mode === 'desktop',
}))

const leftPanelClasses = computed(() => ({
  'panel-overlay': layout.value.leftPanel.state === 'overlay',
  'panel-collapsed': leftPanelState.value === 'collapsed',
  'panel-expanded': leftPanelState.value === 'expanded',
  'panel-hidden': leftPanelState.value === 'hidden',
}))

const rightPanelClasses = computed(() => ({
  'panel-overlay': layout.value.rightPanel.state === 'overlay',
  'panel-collapsed': rightPanelState.value === 'collapsed',
  'panel-expanded': rightPanelState.value === 'expanded',
  'panel-hidden': rightPanelState.value === 'hidden',
}))

const leftPanelStyle = computed(() => {
  // 隐藏状态
  if (leftPanelState.value === 'hidden') {
    return { width: '0px', minWidth: '0px', overflow: 'hidden' }
  }
  // 展开状态由 ResizablePanel 内部宽度管理，避免覆盖拖拽结果
  return {}
})

const rightPanelStyle = computed(() => {
  // 隐藏状态
  if (rightPanelState.value === 'hidden') {
    return { width: '0px', minWidth: '0px', overflow: 'hidden' }
  }
  // 展开状态由 ResizablePanel 内部宽度管理，避免覆盖拖拽结果
  return {}
})

const layoutModeLabel = computed(() => {
  const labels = {
    mobile: '移动模式',
    tablet: '平板模式',
    desktop: '桌面模式',
  }
  const modeLabel = labels[layout.value.mode]
  // 添加工具模式信息
  const toolLabels: Record<ActiveTool, string> = {
    writing: '写作模式',
    immersive: '沉浸模式',
  }
  return `${modeLabel} - ${toolLabels[activeTool.value]}`
})

// AR通知
const ariaAnnouncement = ref('')

// 触摸手势处理
const touchStartX = ref(0)
const touchStartY = ref(0)

function handleContentTouchStart(event: TouchEvent) {
  if (layout.value.mode !== 'mobile') return
  const touch = event.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
}

function handleContentTouchMove() {
  // 仅在移动端处理
  if (layout.value.mode !== 'mobile') return
}

function handleContentTouchEnd(event: TouchEvent) {
  if (layout.value.mode !== 'mobile') return

  const touch = event.changedTouches[0]
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value

  // 检查是否是水平滑动（距离大于垂直距离）
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    const direction = deltaX > 0 ? 'right' : 'left'
    handleGesture(direction)

    // 更新AR通知
    const tabLabels: Record<string, string> = {
      left: '目录',
      editor: '编辑',
      right: 'AI助手',
    }
    ariaAnnouncement.value = `已切换到${tabLabels[layout.value.activeTab]}`
    setTimeout(() => {
      ariaAnnouncement.value = ''
    }, 1000)
  }
}
</script>

<style scoped lang="scss">
.editor-layout {
  --editor-navbar-height: 0px; // 移除顶部导航栏高度
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--editor-bg-surface);
  color: var(--editor-text-primary);
  overflow: hidden;
}

.editor-layout__content {
  display: flex;
  flex: 1;
  height: 100%; // 占满全部高度
  min-height: 0;
  overflow: hidden;
  position: relative;
  gap: 0;
  padding: 0;
  background: var(--editor-bg-surface);

  :deep(.side-panel) {
    background: transparent;
    color: var(--editor-text-primary);
    border-color: transparent;
  }

  // 兼容旧版 ProjectSidebar，强制隐藏已废弃统计行，避免和搜索框重叠
  :deep(.sidebar-header .project-stats),
  :deep(.sidebar-header .stat-item) {
    display: none !important;
  }
}

.editor-layout__main {
  order: 1;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  // 沉浸模式下编辑器占满全宽
  &.immersive-mode {
    flex: 1;
    max-width: 100%;
    margin: 0;
  }
}

.editor-layout__placeholder {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
  color: var(--editor-text-muted);
  background: var(--editor-bg-surface);
}

.editor-layout__placeholder strong {
  color: var(--editor-text-primary);
  font-size: 15px;
}

.editor-layout__placeholder span {
  max-width: 240px;
  font-size: 12px;
  line-height: 1.6;
}

// ==================== 面板过渡动画 ====================
// 左侧面板滑入滑出动画
.panel-slide-left-enter-active,
.panel-slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-left-enter-from,
.panel-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

// 右侧面板滑入滑出动画
.panel-slide-right-enter-active,
.panel-slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-right-enter-from,
.panel-slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

// ==================== 面板状态样式 ====================
.panel-collapsed {
  width: 56px !important;
  min-width: 56px !important;
  overflow: hidden;

  :deep(.side-panel) {
    .panel-header,
    .panel-content {
      opacity: 0;
      pointer-events: none;
    }
  }

  :deep(.panel-toggle) {
    display: flex;
  }
}

.panel-hidden {
  width: 0 !important;
  min-width: 0 !important;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.panel-expanded {
  :deep(.side-panel) {
    .panel-header,
    .panel-content {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.layout-mode-mobile {
  .editor-layout__content {
    flex-direction: column;
    height: auto;
    gap: 8px;
  }

  .mobile-tabs {
    display: flex;
    background: rgba(255, 251, 245, 0.96);
    border-bottom: 1px solid rgba(117, 93, 67, 0.14);
    padding: 0 8px 8px;
    gap: 6px;

    .mobile-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 8px;
      background: var(--editor-bg-surface);
      border: 1px solid var(--editor-border);
      border-radius: 8px;
      color: var(--editor-text-muted);
      cursor: pointer;
      transition: all 0.2s ease;

      &.active {
        color: var(--editor-accent);
        border-color: var(--editor-border);
        background: var(--editor-bg-elevated);
      }

      &:hover:not(.active) {
        background: var(--editor-bg-elevated);
      }
    }
  }

  .editor-layout__left-panel,
  .editor-layout__right-panel,
  .editor-layout__main {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    display: none;
    border-radius: 16px;
  }

  .editor-layout__left-panel.panel-visible,
  .editor-layout__right-panel.panel-visible,
  .editor-layout__main.panel-visible {
    display: flex;
  }

  .editor-layout__left-panel,
  .editor-layout__right-panel {
    height: min(68vh, 760px);

    :deep(.panel-content) {
      height: 100%;
    }
  }

  .editor-layout__main.panel-visible {
    position: relative;
    min-height: 58vh;
  }

  // 移动端沉浸模式
  .editor-layout__main.immersive-mode {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    border-radius: 0;
  }
}

.layout-mode-tablet {
  .left-panel,
  .right-panel {
    transition:
      width 0.3s ease,
      opacity 0.3s ease;
  }

  .panel-collapsed {
    width: 56px !important;

    :deep(.side-panel) {
      .panel-header,
      .panel-content {
        display: none;
      }
    }

    :deep(.panel-toggle) {
      display: flex;
    }
  }
}

.layout-mode-desktop {
  // 桌面端面板切换动画
  .editor-layout__main {
    transition: flex 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
