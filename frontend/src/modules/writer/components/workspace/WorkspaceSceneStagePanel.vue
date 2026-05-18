<template>
  <div class="workspace-scene-stage">
    <section class="workspace-scene-stage__summary-row">
      <div class="workspace-scene-stage__identity">
        <span>当前场景</span>
        <strong>{{ sceneStage.sceneTitle || '未命名场景' }}</strong>
      </div>

      <div class="workspace-scene-stage__center">
        <p class="workspace-scene-stage__summary">
          {{ sceneStage.summaryLine || '还没有写入当前场景摘要。' }}
        </p>
        <div class="workspace-scene-stage__chips">
          <span class="workspace-scene-stage__chip">当前章节：{{ sceneStage.chapterTitle || '未选择' }}</span>
          <span class="workspace-scene-stage__chip">系统覆盖：{{ sceneStage.coverageLabel || '未关联章节' }}</span>
          <span class="workspace-scene-stage__chip">
            {{ sceneStage.currentChapterLinked ? '当前章节已纳入' : '当前章节未纳入' }}
          </span>
          <span class="workspace-scene-stage__chip">{{ sceneStage.chapterCount || 0 }} 章覆盖</span>
        </div>
      </div>

      <div class="workspace-scene-stage__controls">
        <select
          class="workspace-scene-stage__status-select"
          :value="sceneStage.beatStatus"
          name="scene-stage-beat-status"
          aria-label="当前场景状态"
          @change="handleDraftInput('beatStatus', $event)"
        >
          <option value="planned">未开始</option>
          <option value="active">进行中</option>
          <option value="done">已完成</option>
        </select>
        <div class="workspace-scene-stage__actions">
          <button type="button" @click="$emit('advance-beat')">进入下一拍</button>
          <button type="button" @click="$emit('start-scene')">新场景</button>
          <button type="button" @click="$emit('send-to-ai')">交给 AI</button>
          <button type="button" @click="$emit('open-assets')">查看设定</button>
        </div>
      </div>
    </section>

    <section class="workspace-scene-stage__editor-row">
      <div class="workspace-scene-stage__edit-grid">
        <div class="workspace-scene-stage__edit-zone workspace-scene-stage__edit-zone--basic">
          <label class="workspace-scene-stage__field">
            <span>场景</span>
            <input
              :value="sceneStage.sceneTitle === '未命名场景' ? '' : sceneStage.sceneTitle"
              aria-label="场景名称"
              name="scene-stage-title"
              placeholder="例如：雨夜祠堂"
              @input="handleDraftInput('sceneTitle', $event)"
            />
          </label>
          <label class="workspace-scene-stage__field">
            <span>覆盖章节</span>
            <select
              :value="sceneStage.coverageChapterCount"
              name="scene-stage-coverage-count"
              @change="handleDraftInput('coverageChapterCount', $event)"
            >
              <option
                v-for="option in sceneStage.coverageOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>
          <div class="workspace-scene-stage__detected-range">
            <span>系统覆盖</span>
            <strong>{{ sceneStage.coverageLabel || '未关联章节' }}</strong>
          </div>
          <label class="workspace-scene-stage__field">
            <span>范围备注</span>
            <input
              :value="sceneStage.rangeLabel || ''"
              name="scene-stage-range"
              placeholder="可选，例如：雨夜逃亡段"
              @input="handleDraftInput('rangeLabel', $event)"
            />
          </label>
        </div>
        <div class="workspace-scene-stage__edit-zone workspace-scene-stage__edit-zone--beat">
          <label class="workspace-scene-stage__field">
            <span>当前拍</span>
            <input
              :value="sceneStage.beatTitle || ''"
              aria-label="当前拍"
              name="scene-stage-beat-title"
              placeholder="当前拍，例如：旧友现身"
              @input="handleDraftInput('beatTitle', $event)"
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
        </div>
        <div class="workspace-scene-stage__edit-zone workspace-scene-stage__edit-zone--stakes">
          <label class="workspace-scene-stage__field workspace-scene-stage__field--stacked">
            <span>目标</span>
            <textarea
              :value="sceneStage.goal || ''"
              name="scene-stage-goal"
              placeholder="这一拍要推进什么"
              rows="2"
              @input="handleDraftInput('goal', $event)"
            ></textarea>
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
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { WriterSceneStageDraft, WriterSceneStageState } from '@/modules/writer/types/sceneStage'

defineProps<{
  sceneStage: WriterSceneStageState
}>()

const emit = defineEmits<{
  (e: 'send-to-ai'): void
  (e: 'open-assets'): void
  (e: 'update-draft', patch: Partial<WriterSceneStageDraft>): void
  (e: 'advance-beat'): void
  (e: 'start-scene'): void
}>()

const handleDraftInput = (field: keyof WriterSceneStageDraft, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
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
  grid-template-columns: 1fr;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0;
  overflow: hidden;
  overscroll-behavior: contain;
}

.workspace-scene-stage__summary-row,
.workspace-scene-stage__editor-row {
  min-width: 0;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.workspace-scene-stage__summary-row {
  min-height: 46px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 0;
  padding: 0;
  overflow: hidden;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 88%, transparent);
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.workspace-scene-stage__editor-row {
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

.workspace-scene-stage__identity {
  min-width: 0;
  max-width: 100%;
  min-height: 46px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 7px 12px;
  background: color-mix(in srgb, var(--editor-accent, #2563eb) 5%, transparent);

  span {
    flex: 0 0 auto;
    color: var(--editor-text-ghost, #94a3b8);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  strong {
    min-width: 0;
    color: var(--editor-text-primary, #0f172a);
    font-size: 15px;
    font-weight: 800;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.workspace-scene-stage__center {
  min-width: 0;
  max-width: 100%;
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-left: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 88%, transparent);
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 42%, transparent);
}

.workspace-scene-stage__summary {
  min-width: 120px;
  flex: 1 1 auto;
  margin: 0;
  color: var(--editor-text-secondary, #334155);
  font-size: 12px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-scene-stage__chips {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 48%;
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow: hidden;
}

.workspace-scene-stage__chip {
  flex: 0 0 auto;
  max-width: 170px;
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 82%, transparent);
  color: var(--editor-text-secondary, #334155);
  font-size: 11px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-scene-stage__controls {
  min-width: 0;
  max-width: 100%;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 7px 10px 7px 12px;
  border-left: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 88%, transparent);
  background: color-mix(in srgb, var(--editor-bg-elevated, #f1f5f9) 36%, transparent);
}

.workspace-scene-stage__actions {
  min-width: 0;
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: thin;

  button {
    flex: 0 0 auto;
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

.workspace-scene-stage__status-select,
.workspace-scene-stage__field select,
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

.workspace-scene-stage__status-select {
  width: auto;
  min-width: 88px;
  height: 26px;
  padding: 0 20px 0 9px;
  color: var(--editor-text-secondary, #334155);
  font-size: 11px;
  font-weight: 800;
}

.workspace-scene-stage__edit-grid {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.workspace-scene-stage__edit-zone {
  min-width: 0;
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 7px;
  padding: 10px 12px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.workspace-scene-stage__edit-zone--basic {
  background: color-mix(in srgb, var(--editor-accent, #2563eb) 6%, transparent);
}

.workspace-scene-stage__edit-zone--beat {
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 48%, transparent);
}

.workspace-scene-stage__edit-zone--stakes {
  background: color-mix(in srgb, var(--editor-bg-elevated, #f1f5f9) 36%, transparent);
}

.workspace-scene-stage__edit-zone + .workspace-scene-stage__edit-zone {
  border-left: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 88%, transparent);
}

.workspace-scene-stage__edit-zone--stakes {
  grid-template-columns: 1fr;
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
    min-height: 28px;
    padding: 5px 8px;
  }

  textarea {
    min-height: 42px;
    max-height: 72px;
    resize: vertical;
    line-height: 1.45;
  }
}

.workspace-scene-stage__detected-range {
  min-width: 0;
  min-height: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  border-radius: var(--editor-radius-sm, 6px);
  background: color-mix(in srgb, var(--editor-bg-elevated, #f1f5f9) 64%, transparent);
  color: var(--editor-text-secondary, #334155);

  span {
    flex: 0 0 auto;
    color: var(--editor-text-ghost, #94a3b8);
    font-size: 11px;
    font-weight: 700;
  }

  strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }
}

.workspace-scene-stage__field--stacked {
  grid-template-columns: 1fr;
  align-items: stretch;
  gap: 5px;
}

@media (max-width: 760px) {
  .workspace-scene-stage__summary-row {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .workspace-scene-stage__identity,
  .workspace-scene-stage__center,
  .workspace-scene-stage__controls {
    min-height: 0;
    padding: 7px 10px;
    border-left: none;
  }

  .workspace-scene-stage__center,
  .workspace-scene-stage__controls {
    border-top: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 68%, transparent);
  }

  .workspace-scene-stage__center,
  .workspace-scene-stage__controls {
    align-items: flex-start;
  }

  .workspace-scene-stage__controls {
    justify-content: flex-start;
  }

  .workspace-scene-stage__actions,
  .workspace-scene-stage__chips {
    flex-wrap: wrap;
  }

  .workspace-scene-stage__edit-grid {
    grid-template-columns: 1fr;
  }

  .workspace-scene-stage__edit-zone + .workspace-scene-stage__edit-zone {
    border-top: 2px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 92%, transparent);
    border-left: none;
  }

  .workspace-scene-stage__edit-zone--stakes {
    grid-template-columns: 1fr;
  }
}
</style>
