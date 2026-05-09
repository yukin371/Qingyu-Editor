<template>
  <div class="inspiration-panel">
    <header class="inspiration-panel__header">
      <div>
        <p class="inspiration-panel__eyebrow">Inspiration</p>
        <h3>灵感收纳</h3>
        <p>临时想法先落在这里，写作不中断，再决定是否展开成故事分支。</p>
      </div>
      <button type="button" class="inspiration-panel__expand" @click="$emit('open-fullscreen')">
        展开全屏 →
      </button>
    </header>

    <form class="inspiration-panel__composer" @submit.prevent="handleCreate">
      <input v-model.trim="draftTitle" type="text" placeholder="灵感标题" />
      <textarea
        v-model.trim="draftContent"
        rows="4"
        placeholder="记录剧情反转、意象、台词或节奏想法"
      ></textarea>
      <button type="submit" :disabled="!canSubmit">+ 新建灵感</button>
    </form>

    <div v-if="notes.length === 0" class="inspiration-panel__empty">
      <QyIcon name="Lightbulb" :size="18" />
      <span>还没有灵感卡片，先记下第一个想法。</span>
    </div>

    <div v-else class="inspiration-panel__list">
      <article v-for="note in notes" :key="note.id" class="inspiration-panel__card">
        <div class="inspiration-panel__card-head">
          <div>
            <strong>{{ note.title }}</strong>
            <p>{{ note.content }}</p>
          </div>
          <button type="button" @click="removeNote(note.id)">删除</button>
        </div>
        <div class="inspiration-panel__meta">
          <span>{{ note.createdAt }}</span>
          <span v-if="note.chapterTitle">关联章节 {{ note.chapterTitle }}</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'

interface InspirationNote {
  id: string
  title: string
  content: string
  chapterId?: string
  chapterTitle?: string
  createdAt: string
}

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
}>()

defineEmits<{
  (e: 'open-fullscreen'): void
}>()

const draftTitle = ref('')
const draftContent = ref('')
const notes = ref<InspirationNote[]>([])

const storageKey = computed(() => `qingyu_writer_inspirations_${props.projectId || 'global'}`)
const canSubmit = computed(() => draftTitle.value.length > 0 && draftContent.value.length > 0)

const loadNotes = () => {
  try {
    const raw = localStorage.getItem(storageKey.value)
    notes.value = raw ? (JSON.parse(raw) as InspirationNote[]) : []
  } catch {
    notes.value = []
  }
}

const saveNotes = () => {
  localStorage.setItem(storageKey.value, JSON.stringify(notes.value))
}

const handleCreate = () => {
  if (!canSubmit.value) return
  notes.value = [
    {
      id: `${Date.now()}`,
      title: draftTitle.value,
      content: draftContent.value,
      chapterId: props.chapterId || undefined,
      chapterTitle: props.chapterTitle || undefined,
      createdAt: dayjs().format('MM-DD HH:mm'),
    },
    ...notes.value,
  ]
  draftTitle.value = ''
  draftContent.value = ''
  saveNotes()
}

const removeNote = (noteId: string) => {
  notes.value = notes.value.filter((note) => note.id !== noteId)
  saveNotes()
}

watch(storageKey, loadNotes, { immediate: true })
</script>

<style scoped lang="scss">
.inspiration-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background:
    radial-gradient(circle at top right, rgba(251, 191, 36, 0.14), transparent 30%),
    linear-gradient(180deg, #fffef6, #f7fafc 100%);
}

.inspiration-panel__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;

  h3 {
    margin: 0;
  }

  p {
    margin: 8px 0 0;
    color: var(--editor-text-secondary, #475569);
    line-height: 1.6;
  }
}

.inspiration-panel__eyebrow {
  margin: 0 0 6px;
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.inspiration-panel__expand,
.inspiration-panel__composer button,
.inspiration-panel__card-head button {
  height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.92);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.inspiration-panel__expand,
.inspiration-panel__composer button {
  border-color: rgba(251, 191, 36, 0.24);
  color: #b45309;
}

.inspiration-panel__composer {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.82);

  input,
  textarea {
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    padding: 10px 12px;
    outline: none;
    resize: vertical;
    background: rgba(255, 255, 255, 0.92);
    color: var(--editor-text-primary, #0f172a);
    font: inherit;
  }

  button {
    justify-self: start;
  }
}

.inspiration-panel__empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.66);
  color: var(--editor-text-secondary, #475569);
}

.inspiration-panel__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow: auto;
}

.inspiration-panel__card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.82);
}

.inspiration-panel__card-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;

  strong,
  p {
    margin: 0;
  }

  p {
    margin-top: 8px;
    color: var(--editor-text-secondary, #475569);
    line-height: 1.5;
  }
}

.inspiration-panel__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 12px;
}
</style>
