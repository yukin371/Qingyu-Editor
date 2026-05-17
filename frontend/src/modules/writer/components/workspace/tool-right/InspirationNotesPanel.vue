<template>
  <section class="inspiration-notes-panel">
    <div class="inspiration-notes-panel__head">
      <h4>灵感便签</h4>
      <span class="inspiration-notes-panel__meta">{{ notes.length }} 条</span>
    </div>

    <form class="inspiration-notes-panel__composer" @submit.prevent="$emit('create')">
      <div class="inspiration-notes-panel__composer-row">
        <input
          :value="draftTitle"
          type="text"
          placeholder="灵感标题"
          @input="$emit('update:draftTitle', ($event.target as HTMLInputElement).value)"
        />
        <button type="submit" :disabled="!canSubmit">+ 新建灵感</button>
      </div>
      <textarea
        :value="draftContent"
        rows="3"
        placeholder="记录剧情反转、意象、台词或节奏想法"
        @input="$emit('update:draftContent', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </form>

    <div v-if="notes.length === 0" class="inspiration-notes-panel__empty">
      <span>暂无灵感便签</span>
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

defineProps<{
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
}>()
</script>

<style scoped lang="scss">
.inspiration-notes-panel {
  display: grid;
  gap: 12px;
}

.inspiration-notes-panel__head,
.inspiration-notes-panel__card-head,
.inspiration-notes-panel__card-meta {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.inspiration-notes-panel__head {
  align-items: center;

  h4,
  strong,
  p {
    margin: 0;
  }

  h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--editor-text-primary, #0f172a);
  }
}

.inspiration-notes-panel__meta {
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 12px;
}

.inspiration-notes-panel__composer {
  display: grid;
  gap: 10px;
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
  padding: 10px 12px;
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
  height: 34px;
  padding: 0 12px;
  color: var(--editor-text-secondary, #475569);
}

.inspiration-notes-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 72px;
  border-top: 1px solid var(--editor-border, #e2e8f0);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
}

.inspiration-notes-panel__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inspiration-notes-panel__item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 0;
  border-top: 1px solid var(--editor-border, #e2e8f0);
}

.inspiration-notes-panel__card-head {
  strong,
  p {
    margin: 0;
  }

  p {
    margin-top: 8px;
    color: var(--editor-text-secondary, #475569);
    line-height: 1.5;
  }

  button {
    height: 32px;
    padding: 0 12px;
  }
}

.inspiration-notes-panel__card-meta {
  flex-wrap: wrap;
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 12px;
}

@media (max-width: 1200px) {
  .inspiration-notes-panel__composer-row {
    grid-template-columns: 1fr;
  }
}
</style>
