<template>
  <div class="workspace-scene-stage">
    <section class="workspace-scene-stage__section workspace-scene-stage__section--overview">
      <div class="workspace-scene-stage__section-head">
        <span>当前拍</span>
        <select
          class="workspace-scene-stage__status-select"
          :value="sceneStage.beatStatus"
          name="scene-stage-beat-status"
          aria-label="当前拍状态"
          @change="handleDraftInput('beatStatus', $event)"
        >
          <option value="planned">未开始</option>
          <option value="active">进行中</option>
          <option value="done">已完成</option>
        </select>
      </div>
      <input
        class="workspace-scene-stage__title-input"
        :value="sceneStage.beatTitle || ''"
        aria-label="当前拍"
        name="scene-stage-beat-title"
        placeholder="当前拍，例如：旧友现身"
        @input="handleDraftInput('beatTitle', $event)"
      />
      <div class="workspace-scene-stage__meta-grid">
        <label class="workspace-scene-stage__field">
          <span>场景</span>
          <input
            :value="sceneStage.sceneTitle"
            aria-label="场景名称"
            name="scene-stage-title"
            placeholder="场景名"
            @input="handleDraftInput('sceneTitle', $event)"
          />
        </label>
        <label class="workspace-scene-stage__field">
          <span>范围</span>
          <input
            :value="sceneStage.rangeLabel || ''"
            name="scene-stage-range"
            placeholder="第3-5章"
            @input="handleDraftInput('rangeLabel', $event)"
          />
        </label>
        <div class="workspace-scene-stage__row">
          <span>章节</span>
          <strong>{{ sceneStage.chapterTitle || '未选择章节' }}</strong>
        </div>
        <div class="workspace-scene-stage__row">
          <span>视角</span>
          <strong>{{ sceneStage.povCharacterName || '未指定' }}</strong>
        </div>
      </div>
      <div class="workspace-scene-stage__asset-strip">
        <span class="workspace-scene-stage__asset-label">在场 {{ sceneStage.assets.length }}</span>
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
        <p v-else class="workspace-scene-stage__empty">暂无资产</p>
      </div>
    </section>

    <section class="workspace-scene-stage__section workspace-scene-stage__section--editor">
      <div class="workspace-scene-stage__section-head">
        <span>节拍推进</span>
        <strong>{{ sceneStage.nextBeatTitle ? '已规划下一拍' : '下一拍未定' }}</strong>
      </div>
      <div class="workspace-scene-stage__edit-grid">
        <label class="workspace-scene-stage__field">
          <span>目标</span>
          <input
            :value="sceneStage.goal || ''"
            name="scene-stage-goal"
            placeholder="这一拍要推进什么"
            @input="handleDraftInput('goal', $event)"
          />
        </label>
        <label class="workspace-scene-stage__field">
          <span>下一拍</span>
          <input
            :value="sceneStage.nextBeatTitle || ''"
            name="scene-stage-next-beat-title"
            placeholder="当前拍完成后接什么"
            @input="handleDraftInput('nextBeatTitle', $event)"
          />
        </label>
        <label class="workspace-scene-stage__field workspace-scene-stage__field--stacked">
          <span>冲突</span>
          <textarea
            :value="sceneStage.conflict || ''"
            name="scene-stage-conflict"
            placeholder="本拍阻力、对抗或压力"
            rows="2"
            @input="handleDraftInput('conflict', $event)"
          ></textarea>
        </label>
        <label class="workspace-scene-stage__field workspace-scene-stage__field--stacked">
          <span>完成条件</span>
          <textarea
            :value="sceneStage.doneCondition || ''"
            name="scene-stage-done-condition"
            placeholder="发生什么才算这一拍完成"
            rows="2"
            @input="handleDraftInput('doneCondition', $event)"
          ></textarea>
        </label>
      </div>
      <div class="workspace-scene-stage__actions">
        <button type="button" @click="$emit('advance-beat')">进入下一拍</button>
        <button type="button" @click="$emit('send-to-ai')">交给 AI</button>
        <button type="button" @click="$emit('open-assets')">查看设定</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  WriterSceneStageDraft,
  WriterSceneStageState,
} from '@/modules/writer/types/sceneStage'

const props = defineProps<{
  sceneStage: WriterSceneStageState
}>()

const emit = defineEmits<{
  (e: 'send-to-ai'): void
  (e: 'open-assets'): void
  (e: 'update-draft', patch: WriterSceneStageDraft): void
  (e: 'advance-beat'): void
}>()

const visibleAssets = computed(() => props.sceneStage.assets.slice(0, 6))
const hiddenAssetCount = computed(() => Math.max(props.sceneStage.assets.length - visibleAssets.value.length, 0))

const handleDraftInput = (field: keyof WriterSceneStageDraft, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  emit('update-draft', {
    [field]: target?.value ?? '',
  })
}
</script>

<style scoped lang="scss">
.workspace-scene-stage {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(260px, 0.78fr) minmax(420px, 1.22fr);
  gap: 0;
  overflow: hidden;
}

.workspace-scene-stage__section {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 2px 14px 4px;
  border-right: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  overflow: hidden;
}

.workspace-scene-stage__section:last-child {
  border-right: none;
}

.workspace-scene-stage__section--overview {
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--editor-accent, #2563eb) 5%, transparent),
      transparent 48%
    );
}

.workspace-scene-stage__section--editor {
  overflow-y: auto;
  overscroll-behavior: contain;
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

.workspace-scene-stage__meta-grid,
.workspace-scene-stage__edit-grid {
  display: grid;
  gap: 8px;
}

.workspace-scene-stage__meta-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.workspace-scene-stage__edit-grid {
  min-height: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

.workspace-scene-stage__title-input,
.workspace-scene-stage__status-select,
.workspace-scene-stage__field input,
.workspace-scene-stage__field textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: var(--editor-radius-sm, 6px);
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 78%, transparent);
  color: var(--editor-text-primary, #0f172a);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  outline: none;

  &:hover,
  &:focus {
    border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 36%, transparent);
    background: var(--editor-bg-elevated, #f1f5f9);
  }
}

.workspace-scene-stage__title-input {
  height: 32px;
  padding: 0 9px;
  font-size: 14px;
  font-weight: 800;
}

.workspace-scene-stage__status-select {
  width: auto;
  height: 24px;
  padding: 0 22px 0 8px;
  color: var(--editor-text-secondary, #334155);
  font-size: 11px;
  font-weight: 800;
}

.workspace-scene-stage__row {
  min-width: 0;
  min-height: 30px;
  padding: 0 7px;
  border-radius: var(--editor-radius-sm, 6px);
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 62%, transparent);
}

.workspace-scene-stage__field {
  min-width: 0;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 8px;

  span {
    color: var(--editor-text-ghost, #94a3b8);
    font-size: 11px;
    font-weight: 700;
  }

  input,
  textarea {
    min-height: 30px;
    padding: 5px 7px;
  }

  textarea {
    min-height: 54px;
    max-height: 92px;
    resize: vertical;
    line-height: 1.45;
  }
}

.workspace-scene-stage__field--stacked {
  grid-template-columns: 1fr;
  align-items: stretch;
  gap: 5px;
}

.workspace-scene-stage__asset-strip {
  min-height: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 8px;
  padding-top: 2px;
}

.workspace-scene-stage__asset-label {
  height: 24px;
  display: inline-flex;
  align-items: center;
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.workspace-scene-stage__asset-list {
  min-width: 0;
  min-height: 0;
  max-height: 64px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-content: flex-start;
  overflow: hidden;
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

.workspace-scene-stage__empty {
  margin: 0;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.6;
}

.workspace-scene-stage__actions {
  justify-content: flex-start;
  flex-wrap: wrap;
  padding-top: 2px;

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
    height: auto;
    max-height: 100%;
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .workspace-scene-stage__section {
    padding: 4px 0 10px;
    border-right: none;
    border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  }

  .workspace-scene-stage__section:last-child {
    border-bottom: none;
  }

  .workspace-scene-stage__section--editor {
    overflow: visible;
  }

  .workspace-scene-stage__meta-grid,
  .workspace-scene-stage__edit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
