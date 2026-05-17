<template>
  <div class="workspace-scene-stage">
    <section class="workspace-scene-stage__section workspace-scene-stage__section--scene">
      <div class="workspace-scene-stage__section-head">
        <span>当前场景</span>
        <strong>{{ sceneStage.sceneTitle }}</strong>
      </div>
      <div class="workspace-scene-stage__rows">
        <div class="workspace-scene-stage__row">
          <span>章节</span>
          <strong>{{ sceneStage.chapterTitle || '未选择章节' }}</strong>
        </div>
        <div class="workspace-scene-stage__row">
          <span>地点</span>
          <strong>{{ sceneStage.locationName || '未标记' }}</strong>
        </div>
        <div class="workspace-scene-stage__row">
          <span>视角</span>
          <strong>{{ sceneStage.povCharacterName || '未指定' }}</strong>
        </div>
      </div>
    </section>

    <section class="workspace-scene-stage__section workspace-scene-stage__section--assets">
      <div class="workspace-scene-stage__section-head">
        <span>在场资产</span>
        <strong>{{ sceneStage.assets.length }}</strong>
      </div>
      <div v-if="sceneStage.assets.length" class="workspace-scene-stage__asset-list">
        <button
          v-for="asset in visibleAssets"
          :key="asset.key"
          type="button"
          class="workspace-scene-stage__asset"
          :title="asset.summary || asset.assetName"
          @click="$emit('open-assets')"
        >
          <span>{{ asset.typeLabel }}</span>
          <strong>{{ asset.assetName }}</strong>
        </button>
        <span v-if="hiddenAssetCount > 0" class="workspace-scene-stage__more">
          +{{ hiddenAssetCount }}
        </span>
      </div>
      <p v-else class="workspace-scene-stage__empty">暂无在场资产</p>
    </section>

    <section class="workspace-scene-stage__section workspace-scene-stage__section--beat">
      <div class="workspace-scene-stage__section-head">
        <span>下一拍</span>
        <strong>{{ sceneStage.nextBeat ? '已定位' : '未定' }}</strong>
      </div>
      <p class="workspace-scene-stage__beat-text">
        {{ sceneStage.nextBeat || sceneStage.conflict || '暂无下一拍' }}
      </p>
      <div class="workspace-scene-stage__actions">
        <button type="button" @click="$emit('send-to-ai')">交给 AI</button>
        <button type="button" @click="$emit('open-assets')">查看设定</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'

const props = defineProps<{
  sceneStage: WriterSceneStageState
}>()

defineEmits<{
  (e: 'send-to-ai'): void
  (e: 'open-assets'): void
}>()

const visibleAssets = computed(() => props.sceneStage.assets.slice(0, 6))
const hiddenAssetCount = computed(() => Math.max(props.sceneStage.assets.length - visibleAssets.value.length, 0))
</script>

<style scoped lang="scss">
.workspace-scene-stage {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(220px, 0.9fr) minmax(240px, 1fr) minmax(260px, 1.1fr);
  gap: 0;
}

.workspace-scene-stage__section {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 16px;
  border-right: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
}

.workspace-scene-stage__section:last-child {
  border-right: none;
}

.workspace-scene-stage__section-head,
.workspace-scene-stage__row,
.workspace-scene-stage__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.workspace-scene-stage__section-head span,
.workspace-scene-stage__row span {
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 11px;
  font-weight: 700;
}

.workspace-scene-stage__section-head strong,
.workspace-scene-stage__row strong {
  min-width: 0;
  color: var(--editor-text-primary, #0f172a);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-scene-stage__rows {
  display: grid;
  gap: 7px;
}

.workspace-scene-stage__asset-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-content: flex-start;
}

.workspace-scene-stage__asset {
  max-width: 132px;
  min-width: 0;
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  border-radius: 999px;
  background: var(--editor-layer-strong, #f1f5f9);
  color: var(--editor-text-secondary, #334155);
  cursor: pointer;

  span {
    color: var(--editor-accent, #2563eb);
    font-size: 10px;
    font-weight: 800;
  }

  strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }

  &:hover {
    border-color: var(--editor-accent-soft-border, #93c5fd);
    color: var(--editor-text-primary, #0f172a);
  }
}

.workspace-scene-stage__more {
  height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--editor-bg-elevated, #f1f5f9);
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 700;
}

.workspace-scene-stage__empty,
.workspace-scene-stage__beat-text {
  margin: 0;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.6;
}

.workspace-scene-stage__beat-text {
  flex: 1;
  min-height: 0;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.workspace-scene-stage__actions {
  justify-content: flex-start;

  button {
    height: 26px;
    padding: 0 9px;
    border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
    border-radius: 999px;
    background: transparent;
    color: var(--editor-text-secondary, #334155);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      background: var(--editor-bg-elevated, #f1f5f9);
      color: var(--editor-text-primary, #0f172a);
    }
  }
}

@media (max-width: 1100px) {
  .workspace-scene-stage {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .workspace-scene-stage__section {
    padding: 4px 0;
    border-right: none;
    border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  }

  .workspace-scene-stage__section:last-child {
    border-bottom: none;
  }
}
</style>
