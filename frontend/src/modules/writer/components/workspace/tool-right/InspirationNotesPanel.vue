<template>
  <section class="inspiration-notes-panel">
    <div class="inspiration-notes-panel__head">
      <div class="inspiration-notes-panel__head-copy">
        <h4>灵感便签</h4>
        <span class="inspiration-notes-panel__meta">{{ notesSummary }}</span>
      </div>
      <button
        type="button"
        class="inspiration-notes-panel__toggle"
        data-testid="inspiration-notes-toggle"
        @click="$emit('toggle-expanded')"
      >
        {{ expanded ? '收起' : '展开' }}
      </button>
    </div>

    <form
      v-if="expanded"
      class="inspiration-notes-panel__composer"
      @submit.prevent="$emit('create')"
    >
      <div class="inspiration-notes-panel__composer-row">
        <input
          :value="draftTitle"
          type="text"
          placeholder="标题"
          @input="$emit('update:draftTitle', ($event.target as HTMLInputElement).value)"
        />
        <button type="submit" :disabled="!canSubmit">记录</button>
      </div>
      <textarea
        :value="draftContent"
        rows="2"
        placeholder="反转、台词、意象..."
        @input="$emit('update:draftContent', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </form>

    <div v-if="notes.length === 0 && expanded" class="inspiration-notes-panel__empty">
      <span>暂无便签</span>
    </div>

    <div v-else class="inspiration-notes-panel__list">
      <article v-for="note in notes" :key="note.id" class="inspiration-notes-panel__item">
        <div class="inspiration-notes-panel__card-head">
          <div>
            <strong>{{ note.title }}</strong>
            <p>{{ note.content }}</p>
          </div>
          <button type="button" @click="$emit('remove', note.id)">删除</button>
        </div>
        <div class="inspiration-notes-panel__card-meta">
          <span>{{ note.createdAt }}</span>
          <span v-if="note.chapterTitle">关联章节 {{ note.chapterTitle }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { InspirationNoteRecord } from '@/modules/writer/services/inspirationNotes.service'
import { computed } from 'vue'

const props = defineProps<{
  expanded: boolean
  notes: InspirationNoteRecord[]
  draftTitle: string
  draftContent: string
  canSubmit: boolean
}>()

defineEmits<{
  (e: 'update:draftTitle', value: string): void
  (e: 'update:draftContent', value: string): void
  (e: 'create'): void
  (e: 'remove', noteId: string): void
  (e: 'toggle-expanded'): void
}>()

const notesSummary = computed(() =>
  props.notes.length > 0 ? `${props.notes.length} 条` : '随手记',
)
</script>

<style scoped lang="scss">
.inspiration-notes-panel {
  display: grid;
  gap: 8px;
}

.inspiration-notes-panel__head,
.inspiration-notes-panel__head-copy,
.inspiration-notes-panel__card-head,
.inspiration-notes-panel__card-meta {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.inspiration-notes-panel__head {
  align-items: center;
}

.inspiration-notes-panel__head-copy {
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.inspiration-notes-panel__head h4,
.inspiration-notes-panel__head strong,
.inspiration-notes-panel__head p {
  margin: 0;
}

.inspiration-notes-panel__head h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-primary, #0f172a);
}

.inspiration-notes-panel__meta {
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
}

.inspiration-notes-panel__toggle {
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 8px;
  background: transparent;
  color: var(--editor-text-secondary, #475569);
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
}

.inspiration-notes-panel__composer {
  display: grid;
  gap: 6px;
}

.inspiration-notes-panel__composer-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.inspiration-notes-panel__composer input,
.inspiration-notes-panel__composer textarea {
  width: 100%;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 8px;
  padding: 7px 9px;
  outline: none;
  resize: vertical;
  background: var(--editor-bg-surface, #f8fafc);
  color: var(--editor-text-primary, #0f172a);
  font: inherit;
}

.inspiration-notes-panel__composer button,
.inspiration-notes-panel__card-head button {
  border-radius: 8px;
  border: 1px solid var(--editor-border, #d9dee6);
  background: transparent;
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.inspiration-notes-panel__composer button {
  height: 28px;
  padding: 0 9px;
  color: var(--editor-text-secondary, #475569);
}

.inspiration-notes-panel__empty {
  min-height: 32px;
  padding: 6px 0 0;
  border-top: 1px solid var(--editor-border, #e2e8f0);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
}

.inspiration-notes-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inspiration-notes-panel__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 7px 0;
  border-top: 1px solid var(--editor-border, #e2e8f0);
}

.inspiration-notes-panel__card-head {
  strong,
  p {
    margin: 0;
  }

  p {
    margin-top: 4px;
    color: var(--editor-text-secondary, #475569);
    line-height: 1.5;
    font-size: 12px;
  }

  button {
    height: 26px;
    padding: 0 9px;
  }
}

.inspiration-notes-panel__card-meta {
  flex-wrap: wrap;
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 11px;
}

@media (max-width: 1200px) {
  .inspiration-notes-panel__composer-row {
    grid-template-columns: 1fr;
  }
}
</style>
