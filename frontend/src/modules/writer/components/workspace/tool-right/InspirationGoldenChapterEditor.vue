<template>
  <section class="inspiration-golden-chapter-editor">
    <div class="inspiration-golden-chapter-editor__head">
      <h4>黄金三章</h4>
      <span class="inspiration-golden-chapter-editor__meta">
        {{ templateName || '未选模板' }}
      </span>
    </div>

    <div class="inspiration-golden-chapter-editor__switcher">
      <button
        v-for="chapter in chapters"
        :key="chapter.chapterNumber"
        type="button"
        class="inspiration-golden-chapter-editor__tab"
        :class="{ 'is-active': chapter.chapterNumber === activeChapterNumber }"
        :data-testid="`golden-chapter-tab-${chapter.chapterNumber}`"
        @click="$emit('update:active-chapter-number', chapter.chapterNumber)"
      >
        <span>第 {{ chapter.chapterNumber }} 章</span>
        <strong>{{ chapter.title }}</strong>
      </button>
    </div>

    <article v-if="activeChapter" class="inspiration-golden-chapter-editor__card">
      <div class="inspiration-golden-chapter-editor__chapter-head">
        <span>第 {{ activeChapter.chapterNumber }} 章</span>
        <strong>{{ activeChapter.title }}</strong>
      </div>
      <input
        :value="activeChapter.title"
        type="text"
        :placeholder="`第 ${activeChapter.chapterNumber} 章标题`"
        data-testid="golden-chapter-title"
        @input="emitUpdate(activeChapter.chapterNumber, 'title', $event)"
      />
      <textarea
        :value="activeChapter.summary"
        rows="3"
        placeholder="本章目标 / 核心场景"
        data-testid="golden-chapter-summary"
        @input="emitUpdate(activeChapter.chapterNumber, 'summary', $event)"
      ></textarea>
      <textarea
        :value="activeChapter.hook"
        rows="2"
        placeholder="章节结尾钩子"
        data-testid="golden-chapter-hook"
        @input="emitUpdate(activeChapter.chapterNumber, 'hook', $event)"
      ></textarea>
      <textarea
        :value="activeChapter.payoff"
        rows="2"
        placeholder="本章兑现点"
        data-testid="golden-chapter-payoff"
        @input="emitUpdate(activeChapter.chapterNumber, 'payoff', $event)"
      ></textarea>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { GoldenChapterPlan } from '@/modules/writer/services/creativeWorkflow.service'

defineProps<{
  chapters: GoldenChapterPlan[]
  activeChapterNumber: GoldenChapterPlan['chapterNumber']
  activeChapter: GoldenChapterPlan | null | undefined
  templateName?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:active-chapter-number', value: GoldenChapterPlan['chapterNumber']): void
  (
    e: 'update-chapter',
    payload: {
      chapterNumber: GoldenChapterPlan['chapterNumber']
      field: keyof Omit<GoldenChapterPlan, 'chapterNumber'>
      value: string
    },
  ): void
}>()

const emitUpdate = (
  chapterNumber: GoldenChapterPlan['chapterNumber'],
  field: keyof Omit<GoldenChapterPlan, 'chapterNumber'>,
  event: Event,
) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  emit('update-chapter', {
    chapterNumber,
    field,
    value: target?.value ?? '',
  })
}
</script>

<style scoped lang="scss">
.inspiration-golden-chapter-editor {
  display: grid;
  gap: 12px;
}

.inspiration-golden-chapter-editor__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h4,
  strong {
    margin: 0;
  }

  h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--editor-text-primary, #0f172a);
  }
}

.inspiration-golden-chapter-editor__meta {
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 12px;
}

.inspiration-golden-chapter-editor__switcher {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.inspiration-golden-chapter-editor__tab {
  display: grid;
  gap: 4px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.18)) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 90%, transparent);
  color: var(--editor-text-secondary, #475569);
  cursor: pointer;

  span {
    color: var(--color-warning-700, #b45309);
    font-size: 11px;
    font-weight: 700;
  }

  strong {
    font-size: 13px;
    color: var(--editor-text-primary, #0f172a);
  }

  &.is-active {
    border-color: color-mix(in srgb, var(--color-warning-500, #f59e0b) 38%, transparent);
    background: color-mix(in srgb, var(--color-warning-50, #fffbeb) 92%, transparent);
    box-shadow: var(--editor-shadow-md, 0 8px 22px rgba(245, 158, 11, 0.1));
  }
}

.inspiration-golden-chapter-editor__card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.16)) 72%, transparent);
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--editor-layer-panel, #ffffff) 98%, transparent),
      color-mix(in srgb, var(--editor-layer-strong, #f8fafc) 86%, transparent)
    ),
    color-mix(in srgb, var(--editor-layer-panel, #ffffff) 86%, transparent);

  input,
  textarea {
    width: 100%;
    border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.22)) 72%, transparent);
    border-radius: 12px;
    padding: 10px 12px;
    outline: none;
    resize: vertical;
    background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 94%, transparent);
    color: var(--editor-text-primary, #0f172a);
    font: inherit;
  }
}

.inspiration-golden-chapter-editor__chapter-head {
  display: grid;
  gap: 4px;

  strong {
    margin: 0;
  }

  span {
    color: var(--color-warning-700, #b45309);
    font-size: 12px;
    font-weight: 700;
  }
}

@media (max-width: 1200px) {
  .inspiration-golden-chapter-editor__switcher {
    grid-template-columns: 1fr;
  }
}
</style>
