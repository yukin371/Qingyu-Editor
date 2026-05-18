<template>
  <section
    v-if="visible"
    class="workspace-bottom-panel"
    :class="{ 'workspace-bottom-panel--immersive': isImmersiveMode }"
    :style="{ height: `${height}px` }"
  >
    <div
      class="workspace-bottom-panel__resize-handle"
      :class="{ 'workspace-bottom-panel__resize-handle--active': isResizing }"
      role="separator"
      aria-orientation="horizontal"
      aria-label="调整场景舞台高度"
      @mousedown="startResize"
    ></div>

    <div class="workspace-bottom-panel__header">
      <button type="button" class="workspace-bottom-panel__close" @click="$emit('close')">
        收起
      </button>
    </div>

    <WorkspaceSceneStagePanel
      class="workspace-bottom-panel__content"
      :scene-stage="sceneStage"
      @update-draft="$emit('update-draft', $event)"
      @advance-beat="$emit('advance-beat')"
      @start-scene="$emit('start-scene')"
      @open-assets="$emit('open-assets')"
      @send-to-ai="$emit('send-to-ai')"
    />
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import WorkspaceSceneStagePanel from '@/modules/writer/components/workspace/WorkspaceSceneStagePanel.vue'
import type {
  WriterSceneStageDraft,
  WriterSceneStageState,
} from '@/modules/writer/types/sceneStage'

const props = withDefaults(
  defineProps<{
    visible: boolean
    sceneStage: WriterSceneStageState
    isImmersiveMode?: boolean
    height?: number
  }>(),
  {
    isImmersiveMode: false,
    height: 220,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-assets'): void
  (e: 'send-to-ai'): void
  (e: 'resize', height: number): void
  (e: 'update-draft', patch: Partial<WriterSceneStageDraft>): void
  (e: 'advance-beat'): void
  (e: 'start-scene'): void
}>()

const isResizing = ref(false)
const resizeStartY = ref(0)
const resizeStartHeight = ref(0)

const stopResize = () => {
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('blur', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return
  const deltaY = event.clientY - resizeStartY.value
  emit('resize', resizeStartHeight.value - deltaY)
}

const startResize = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isResizing.value = true
  resizeStartY.value = event.clientY
  resizeStartHeight.value = props.height
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
  window.addEventListener('blur', stopResize)
}

onBeforeUnmount(stopResize)
</script>

<style scoped lang="scss">
.workspace-bottom-panel {
  border-top: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  min-height: 136px;
  max-height: 360px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-bottom-panel--immersive {
  opacity: 0.9;
}

.workspace-bottom-panel__resize-handle {
  position: relative;
  height: var(--drag-handle-width, 6px);
  flex-shrink: 0;
  cursor: row-resize;
  user-select: none;

  &::before {
    content: '';
    position: absolute;
    right: 0;
    bottom: 50%;
    left: 0;
    height: 1px;
    transform: translateY(50%);
    background: var(--editor-border, #e2e8f0);
    transition:
      background-color var(--transition-fast, 100ms) ease-out,
      height var(--transition-fast, 100ms) ease-out;
  }

  &:hover::before {
    height: 2px;
    background: var(--drag-handle-hover-bg, var(--editor-accent, #2563eb));
  }
}

.workspace-bottom-panel__resize-handle--active::before {
  height: 3px;
  background: var(--drag-handle-hover-bg, var(--editor-accent, #2563eb));
}

.workspace-bottom-panel__header {
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-bg-surface, #f8fafc);
}

.workspace-bottom-panel__close {
  height: 24px;
  padding: 0 10px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-primary, #0f172a);
  }
}

.workspace-bottom-panel__content {
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
}
</style>
