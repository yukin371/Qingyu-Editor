<template>
  <Transition name="fullscreen-overlay">
    <div v-if="visible" class="fullscreen-overlay" @click.self="handleClose">
      <div class="fullscreen-overlay__container">
        <!-- 顶部标题栏 -->
        <div class="fullscreen-overlay__header">
          <div class="fullscreen-overlay__title">
            <QyIcon :name="toolIcon" :size="20" />
            <span>{{ toolName }}</span>
          </div>
          <div class="fullscreen-overlay__actions">
            <QyGhostButton size="small" @click="handleClose">
              <QyIcon name="Close" :size="16" />
              关闭
            </QyGhostButton>
          </div>
        </div>

        <!-- 工具内容区域 -->
        <div class="fullscreen-overlay__content">
          <KeepAlive>
            <component
              :is="toolComponentMap[toolComponent]"
              :chapter-id="chapterId"
              :chapter-title="chapterTitle"
              :chapters="chapters"
              :project-id="projectId"
              @status-change="$emit('status-change', $event)"
              @open-graph="$emit('open-graph', $event)"
              @jump-to-chapter="$emit('jump-to-chapter', $event)"
            />
          </KeepAlive>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import QyGhostButton from '@/design-system/components/basic/QyGhostButton/QyGhostButton.vue'
import CharacterGraphView from '@/modules/writer/views/CharacterGraphView.vue'
import TimelineOutlineView from '@/modules/writer/views/TimelineOutlineView.vue'
import StoryBranchView from '@/modules/writer/views/StoryBranchView.vue'
import StructureStageView from '@/modules/writer/components/workspace/structure/StructureStageView.vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'

// =======================
// Props 定义
// =======================
const props = defineProps<{
  /** 是否显示覆盖层 */
  visible: boolean
  /** 工具名称 */
  toolName: string
  /** 工具图标 */
  toolIcon: string
  /** 工具组件标识 */
  toolComponent: string
  /** 当前项目 ID */
  projectId: string
  /** 当前章节 ID */
  chapterId: string
  /** 当前章节标题 */
  chapterTitle: string
  /** 章节列表 */
  chapters: SidebarChapterSummary[]
}>()

// =======================
// Emits 定义
// =======================
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status-change', chips: string[]): void
  (e: 'open-graph', chapterId: string): void
  (e: 'jump-to-chapter', chapterId: string): void
}>()

// =======================
// 工具组件映射
// =======================
const toolComponentMap = {
  relations: markRaw(CharacterGraphView),
  timeline: markRaw(TimelineOutlineView),
  branches: markRaw(StoryBranchView),
  structure: markRaw(StructureStageView),
}

// =======================
// 事件处理
// =======================
const handleClose = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.fullscreen-overlay__container {
  width: 100%;
  height: 100%;
  max-width: 1400px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fullscreen-overlay__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.fullscreen-overlay__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.fullscreen-overlay__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fullscreen-overlay__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 24px;
  background: #ffffff;
}

// 过渡动画
.fullscreen-overlay-enter-active,
.fullscreen-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.fullscreen-overlay-enter-active .fullscreen-overlay__container,
.fullscreen-overlay-leave-active .fullscreen-overlay__container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.fullscreen-overlay-enter-from,
.fullscreen-overlay-leave-to {
  opacity: 0;
}

.fullscreen-overlay-enter-from .fullscreen-overlay__container,
.fullscreen-overlay-leave-to .fullscreen-overlay__container {
  transform: scale(0.95);
  opacity: 0;
}
</style>
