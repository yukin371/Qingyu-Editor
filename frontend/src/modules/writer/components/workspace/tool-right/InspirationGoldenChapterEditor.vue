<template>
  <section class="inspiration-golden-chapter-editor">
    <div v-if="showHeader" class="inspiration-golden-chapter-editor__head">
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

withDefaults(defineProps<{
  chapters: GoldenChapterPlan[]
  activeChapterNumber: GoldenChapterPlan['chapterNumber']
  activeChapter: GoldenChapterPlan | null | undefined
  templateName?: string | null
  showHeader?: boolean
}>(), {
  showHeader: true,
})

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
  display: flex;
  gap: 6px;
}

.inspiration-golden-chapter-editor__tab {
  display: grid;
  gap: 2px;
  text-align: left;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--editor-border, #d9dee6);
  background: transparent;
  color: var(--editor-text-secondary, #475569);
  cursor: pointer;

  span {
    color: var(--editor-text-muted, #64748b);
    font-size: 11px;
    font-weight: 700;
  }

  strong {
    font-size: 13px;
    color: var(--editor-text-primary, #0f172a);
  }

  &.is-active {
    border-color: var(--editor-accent, #1d4ed8);
    background: var(--editor-accent-soft, #eff6ff);
  }
}

.inspiration-golden-chapter-editor__card {
  display: grid;
  gap: 10px;
  padding-top: 2px;

  input,
  textarea {
    width: 100%;
    border: 1px solid var(--editor-border, #d9dee6);
    border-radius: 8px;
    padding: 10px 12px;
    outline: none;
    resize: vertical;
    background: var(--editor-bg-surface, #f8fafc);
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
    color: var(--editor-text-muted, #64748b);
    font-size: 12px;
    font-weight: 700;
  }
}

@media (max-width: 1200px) {
  .inspiration-golden-chapter-editor__switcher {
    flex-direction: column;
  }
}
</style>
