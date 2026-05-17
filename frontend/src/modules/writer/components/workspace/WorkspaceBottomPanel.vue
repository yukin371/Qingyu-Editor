<template>
  <section
    v-if="visible"
    class="workspace-bottom-panel"
    :class="{ 'workspace-bottom-panel--immersive': isImmersiveMode }"
  >
    <div class="workspace-bottom-panel__header">
      <strong>场景舞台</strong>
      <span>{{ sceneStage.sceneTitle || '未命名场景' }}</span>
      <button type="button" class="workspace-bottom-panel__close" @click="$emit('close')">
        收起
      </button>
    </div>

    <WorkspaceSceneStagePanel
      class="workspace-bottom-panel__content"
      :scene-stage="sceneStage"
      @open-assets="$emit('open-assets')"
      @send-to-ai="$emit('send-to-ai')"
    />
  </section>
</template>

<script setup lang="ts">
import WorkspaceSceneStagePanel from '@/modules/writer/components/workspace/WorkspaceSceneStagePanel.vue'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'

withDefaults(
  defineProps<{
    visible: boolean
    sceneStage: WriterSceneStageState
    isImmersiveMode?: boolean
  }>(),
  {
    isImmersiveMode: false,
  },
)

defineEmits<{
  (e: 'close'): void
  (e: 'open-assets'): void
  (e: 'send-to-ai'): void
}>()
</script>

<style scoped lang="scss">
.workspace-bottom-panel {
  border-top: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  min-height: 136px;
  max-height: 248px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-bottom-panel--immersive {
  opacity: 0.9;
}

.workspace-bottom-panel__header {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-bg-surface, #f8fafc);

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
  }

  span {
    min-width: 0;
    overflow: hidden;
    color: var(--editor-text-muted, #64748b);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.workspace-bottom-panel__close {
  height: 24px;
  margin-left: auto;
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
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
}
</style>
