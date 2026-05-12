<template>
  <div class="inspiration-panel">
    <header class="inspiration-panel__header">
      <div>
        <p class="inspiration-panel__eyebrow">Stage 1 / Inspiration Gate</p>
        <h3>灵感与黄金三章</h3>
        <p>先选题材模板，明确节奏合约，再把前三章的第一轮兑现钉下来。</p>
      </div>
      <button type="button" class="inspiration-panel__expand" @click="$emit('open-fullscreen')">
        展开全屏 →
      </button>
    </header>

    <section class="inspiration-panel__section inspiration-panel__section--gate">
      <div class="inspiration-panel__gate-card" :class="`is-${workflow.gate.status}`">
        <div>
          <p class="inspiration-panel__section-label">Gate 状态</p>
          <strong>{{ workflow.gate.status === 'ready' ? '可推进到阶段 2' : '仍有阻塞项' }}</strong>
        </div>
        <span class="inspiration-panel__gate-pill">
          {{ workflow.gate.status === 'ready' ? 'READY' : 'BLOCKED' }}
        </span>
      </div>

      <div class="inspiration-panel__gate-grid">
        <div
          class="inspiration-panel__gate-check"
          :class="{ 'is-done': workflow.gate.completedFields.hasPrimaryGenre }"
        >
          <span>题材模板</span>
          <strong>{{ workflow.gate.completedFields.hasPrimaryGenre ? '已完成' : '待补齐' }}</strong>
        </div>
        <div
          class="inspiration-panel__gate-check"
          :class="{ 'is-done': workflow.gate.completedFields.hasTargetAudience }"
        >
          <span>目标读者</span>
          <strong>{{ workflow.gate.completedFields.hasTargetAudience ? '已完成' : '待补齐' }}</strong>
        </div>
        <div
          class="inspiration-panel__gate-check"
          :class="{ 'is-done': workflow.gate.completedFields.hasCorePromises }"
        >
          <span>核心承诺</span>
          <strong>{{ workflow.gate.completedFields.hasCorePromises ? '已完成' : '待补齐' }}</strong>
        </div>
        <div
          class="inspiration-panel__gate-check"
          :class="{ 'is-done': workflow.gate.completedFields.hasPaceContract }"
        >
          <span>节奏合约</span>
          <strong>{{ workflow.gate.completedFields.hasPaceContract ? '已完成' : '待补齐' }}</strong>
        </div>
      </div>

      <ul v-if="workflow.gate.missing.length > 0" class="inspiration-panel__gate-list">
        <li v-for="item in workflow.gate.missing" :key="item">{{ item }}</li>
      </ul>
      <ul v-else class="inspiration-panel__gate-list inspiration-panel__gate-list--ready">
        <li>阶段 1 基础门禁已达标，可以继续补阶段 2 的角色/世界骨架。</li>
      </ul>
    </section>

    <section class="inspiration-panel__section">
      <div class="inspiration-panel__section-head">
        <div>
          <p class="inspiration-panel__section-label">题材模板</p>
          <h4>先决定开篇骨架</h4>
        </div>
        <span class="inspiration-panel__section-meta">5 类模板</span>
      </div>

      <div class="inspiration-panel__template-grid">
        <button
          v-for="template in templates"
          :key="template.id"
          type="button"
          class="inspiration-panel__template-card"
          :class="{ 'is-active': workflow.templateId === template.id }"
          :data-testid="`template-${template.id}`"
          @click="applyTemplate(template.id)"
        >
          <strong>{{ template.name }}</strong>
          <p>{{ template.tagline }}</p>
          <span>{{ template.applicableTo.join(' / ') }}</span>
        </button>
      </div>

      <div v-if="selectedTemplate" class="inspiration-panel__template-brief">
        <div>
          <p class="inspiration-panel__section-label">情绪曲线</p>
          <strong>{{ selectedTemplate.emotionCurve }}</strong>
        </div>
        <div>
          <p class="inspiration-panel__section-label">爽点重点</p>
          <strong>{{ selectedTemplate.payoffFocus.join(' / ') }}</strong>
        </div>
      </div>
    </section>

    <section class="inspiration-panel__section inspiration-panel__section--compact">
      <div class="inspiration-panel__section-head">
        <div>
          <p class="inspiration-panel__section-label">定位声明</p>
          <h4>一句话钉住项目方向</h4>
        </div>
      </div>
      <textarea
        v-model.trim="workflow.pitchLine"
        rows="3"
        placeholder="例如：一个被流放的调查员，要在会吃人的规则副本里查清自己的父亲为什么消失。"
      ></textarea>
    </section>

    <section class="inspiration-panel__section inspiration-panel__section--compact">
      <div class="inspiration-panel__section-head">
        <div>
          <p class="inspiration-panel__section-label">目标读者</p>
          <h4>谁会为这本书留下来</h4>
        </div>
      </div>

      <div class="inspiration-panel__token-entry">
        <input
          v-model.trim="audienceDraft"
          type="text"
          placeholder="输入一个读者偏好，例如：喜欢高压反转"
          @keydown.enter.prevent="appendToken('audience')"
        />
        <button type="button" @click="appendToken('audience')">添加</button>
      </div>

      <div class="inspiration-panel__token-list">
        <span
          v-for="audience in workflow.targetAudience"
          :key="audience"
          class="inspiration-panel__token"
        >
          {{ audience }}
          <button type="button" @click="removeToken('audience', audience)">×</button>
        </span>
      </div>
    </section>

    <section class="inspiration-panel__section inspiration-panel__section--compact">
      <div class="inspiration-panel__section-head">
        <div>
          <p class="inspiration-panel__section-label">核心承诺</p>
          <h4>前三章必须兑现什么</h4>
        </div>
      </div>

      <div class="inspiration-panel__token-entry">
        <input
          v-model.trim="promiseDraft"
          type="text"
          placeholder="输入一个承诺，例如：第三章先兑现一次打脸"
          @keydown.enter.prevent="appendToken('promise')"
        />
        <button type="button" @click="appendToken('promise')">添加</button>
      </div>

      <div class="inspiration-panel__token-list">
        <span
          v-for="promise in workflow.corePromises"
          :key="promise"
          class="inspiration-panel__token inspiration-panel__token--promise"
        >
          {{ promise }}
          <button type="button" @click="removeToken('promise', promise)">×</button>
        </span>
      </div>
    </section>

    <section class="inspiration-panel__section inspiration-panel__section--compact">
      <div class="inspiration-panel__section-head">
        <div>
          <p class="inspiration-panel__section-label">节奏合约</p>
          <h4>明确前三章的推进速度</h4>
        </div>
      </div>
      <textarea
        v-model.trim="workflow.paceContract"
        rows="3"
        placeholder="例如：前 3000 字建立压制，第三章必须完成第一次反击兑现。"
      ></textarea>
    </section>

    <section class="inspiration-panel__section">
      <div class="inspiration-panel__section-head">
        <div>
          <p class="inspiration-panel__section-label">黄金三章</p>
          <h4>把首次兑现拆成可写任务</h4>
        </div>
        <span class="inspiration-panel__section-meta">
          {{ selectedTemplate ? selectedTemplate.name : '未选模板' }}
        </span>
      </div>

      <div class="inspiration-panel__chapter-grid">
        <article
          v-for="chapter in workflow.goldenChapters"
          :key="chapter.chapterNumber"
          class="inspiration-panel__chapter-card"
        >
          <div class="inspiration-panel__chapter-head">
            <span>第 {{ chapter.chapterNumber }} 章</span>
            <strong>{{ chapter.title }}</strong>
          </div>
          <input
            :value="chapter.title"
            type="text"
            :placeholder="`第 ${chapter.chapterNumber} 章标题`"
            @input="updateGoldenChapterFromEvent(chapter.chapterNumber, 'title', $event)"
          />
          <textarea
            :value="chapter.summary"
            rows="3"
            placeholder="本章目标 / 核心场景"
            @input="updateGoldenChapterFromEvent(chapter.chapterNumber, 'summary', $event)"
          ></textarea>
          <textarea
            :value="chapter.hook"
            rows="2"
            placeholder="章节结尾钩子"
            @input="updateGoldenChapterFromEvent(chapter.chapterNumber, 'hook', $event)"
          ></textarea>
          <textarea
            :value="chapter.payoff"
            rows="2"
            placeholder="本章兑现点"
            @input="updateGoldenChapterFromEvent(chapter.chapterNumber, 'payoff', $event)"
          ></textarea>
        </article>
      </div>
    </section>

    <section v-if="selectedTemplate" class="inspiration-panel__section inspiration-panel__section--hint">
      <div class="inspiration-panel__section-head">
        <div>
          <p class="inspiration-panel__section-label">蓝图接力</p>
          <h4>给阶段 3 的结构提示</h4>
        </div>
      </div>
      <ul class="inspiration-panel__hint-list">
        <li v-for="hint in selectedTemplate.blueprintHints" :key="hint">{{ hint }}</li>
      </ul>
    </section>

    <section class="inspiration-panel__section">
      <div class="inspiration-panel__section-head">
        <div>
          <p class="inspiration-panel__section-label">灵感便签</p>
          <h4>零散想法先收住</h4>
        </div>
        <span class="inspiration-panel__section-meta">{{ notes.length }} 条</span>
      </div>

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
        <article v-for="note in notes" :key="note.id" class="inspiration-panel__note-card">
          <div class="inspiration-panel__note-head">
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import {
  getCreativeWorkflowTemplate,
  listCreativeWorkflowTemplates,
  loadCreativeWorkflow,
  saveCreativeWorkflow,
  type CreativeWorkflowRecord,
  type CreativeWorkflowTemplateId,
  type GoldenChapterPlan,
} from '@/modules/writer/services/creativeWorkflow.service'

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

const templates = listCreativeWorkflowTemplates()
const draftTitle = ref('')
const draftContent = ref('')
const notes = ref<InspirationNote[]>([])
const audienceDraft = ref('')
const promiseDraft = ref('')
const workflow = ref<CreativeWorkflowRecord>(loadCreativeWorkflow(props.projectId))
const isHydratingWorkflow = ref(false)

const notesStorageKey = computed(() => `qingyu_writer_inspirations_${props.projectId || 'global'}`)
const canSubmit = computed(() => draftTitle.value.length > 0 && draftContent.value.length > 0)
const selectedTemplate = computed(() => getCreativeWorkflowTemplate(workflow.value.templateId))

const loadNotes = () => {
  try {
    const raw = localStorage.getItem(notesStorageKey.value)
    notes.value = raw ? (JSON.parse(raw) as InspirationNote[]) : []
  } catch {
    notes.value = []
  }
}

const saveNotes = () => {
  localStorage.setItem(notesStorageKey.value, JSON.stringify(notes.value))
}

const loadWorkflowState = () => {
  isHydratingWorkflow.value = true
  workflow.value = loadCreativeWorkflow(props.projectId)
  audienceDraft.value = ''
  promiseDraft.value = ''
  isHydratingWorkflow.value = false
}

const persistWorkflow = () => {
  workflow.value = saveCreativeWorkflow(props.projectId, {
    pitchLine: workflow.value.pitchLine,
    targetAudience: workflow.value.targetAudience,
    corePromises: workflow.value.corePromises,
    paceContract: workflow.value.paceContract,
    goldenChapters: workflow.value.goldenChapters,
  })
}

const applyTemplate = (templateId: CreativeWorkflowTemplateId) => {
  workflow.value = saveCreativeWorkflow(props.projectId, {
    templateId,
    pitchLine: workflow.value.pitchLine,
  })
}

const appendToken = (kind: 'audience' | 'promise') => {
  const draft = kind === 'audience' ? audienceDraft : promiseDraft
  const nextValue = draft.value.trim()
  if (!nextValue) return

  if (kind === 'audience') {
    workflow.value.targetAudience = [...workflow.value.targetAudience, nextValue]
    audienceDraft.value = ''
  } else {
    workflow.value.corePromises = [...workflow.value.corePromises, nextValue]
    promiseDraft.value = ''
  }
  persistWorkflow()
}

const removeToken = (kind: 'audience' | 'promise', value: string) => {
  if (kind === 'audience') {
    workflow.value.targetAudience = workflow.value.targetAudience.filter((item) => item !== value)
  } else {
    workflow.value.corePromises = workflow.value.corePromises.filter((item) => item !== value)
  }
  persistWorkflow()
}

const updateGoldenChapter = (
  chapterNumber: GoldenChapterPlan['chapterNumber'],
  field: keyof Omit<GoldenChapterPlan, 'chapterNumber'>,
  value: string,
) => {
  workflow.value.goldenChapters = workflow.value.goldenChapters.map((chapter) =>
    chapter.chapterNumber === chapterNumber
      ? {
          ...chapter,
          [field]: value,
        }
      : chapter,
  )
  persistWorkflow()
}

const updateGoldenChapterFromEvent = (
  chapterNumber: GoldenChapterPlan['chapterNumber'],
  field: keyof Omit<GoldenChapterPlan, 'chapterNumber'>,
  event: Event,
) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  updateGoldenChapter(chapterNumber, field, target?.value ?? '')
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

watch(notesStorageKey, loadNotes, { immediate: true })
watch(
  () => props.projectId,
  () => {
    loadWorkflowState()
  },
  { immediate: true },
)
watch(
  [() => workflow.value.pitchLine, () => workflow.value.paceContract],
  () => {
    if (isHydratingWorkflow.value) return
    persistWorkflow()
  },
)
</script>

<style scoped lang="scss">
.inspiration-panel {
  height: 100%;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background:
    radial-gradient(circle at top right, rgba(251, 191, 36, 0.16), transparent 28%),
    linear-gradient(180deg, #fffef6, #f5f7fb 100%);
}

.inspiration-panel__header,
.inspiration-panel__section-head,
.inspiration-panel__template-brief,
.inspiration-panel__gate-card,
.inspiration-panel__gate-grid,
.inspiration-panel__note-head,
.inspiration-panel__meta,
.inspiration-panel__token-entry,
.inspiration-panel__chapter-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.inspiration-panel__header {
  h3,
  h4,
  strong,
  p {
    margin: 0;
  }

  p:last-child {
    margin-top: 8px;
    color: var(--editor-text-secondary, #475569);
    line-height: 1.6;
  }
}

.inspiration-panel__eyebrow,
.inspiration-panel__section-label {
  margin: 0 0 6px;
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.inspiration-panel__expand,
.inspiration-panel__token-entry button,
.inspiration-panel__composer button,
.inspiration-panel__note-head button,
.inspiration-panel__template-card,
.inspiration-panel__token button {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.94);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.inspiration-panel__expand,
.inspiration-panel__token-entry button,
.inspiration-panel__composer button {
  height: 34px;
  padding: 0 12px;
  border-color: rgba(251, 191, 36, 0.28);
  color: #b45309;
}

.inspiration-panel__section {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
}

.inspiration-panel__section h4,
.inspiration-panel__section p,
.inspiration-panel__section strong {
  margin: 0;
}

.inspiration-panel__section-meta {
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 12px;
}

.inspiration-panel__section--gate {
  background:
    linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(255, 255, 255, 0.92)),
    rgba(255, 255, 255, 0.82);
}

.inspiration-panel__gate-card {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);

  &.is-ready {
    border-color: rgba(34, 197, 94, 0.35);
    background: rgba(240, 253, 244, 0.86);
  }

  &.is-blocked {
    border-color: rgba(245, 158, 11, 0.3);
    background: rgba(255, 251, 235, 0.9);
  }
}

.inspiration-panel__gate-pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: #92400e;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.inspiration-panel__gate-grid,
.inspiration-panel__template-grid,
.inspiration-panel__chapter-grid {
  display: grid;
  gap: 10px;
}

.inspiration-panel__gate-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.inspiration-panel__gate-check {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.78);
  color: var(--editor-text-secondary, #475569);

  &.is-done {
    border-color: rgba(34, 197, 94, 0.24);
    background: rgba(240, 253, 244, 0.86);
    color: #166534;
  }

  strong {
    font-size: 13px;
  }
}

.inspiration-panel__gate-list,
.inspiration-panel__hint-list {
  margin: 0;
  padding-left: 18px;
  color: var(--editor-text-secondary, #475569);
  line-height: 1.6;
}

.inspiration-panel__gate-list--ready {
  color: #166534;
}

.inspiration-panel__template-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.inspiration-panel__template-card {
  display: grid;
  gap: 8px;
  text-align: left;
  padding: 14px;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;

  p,
  span {
    color: var(--editor-text-secondary, #475569);
    line-height: 1.5;
  }

  span {
    font-size: 12px;
  }

  &.is-active {
    border-color: rgba(245, 158, 11, 0.42);
    background: linear-gradient(135deg, rgba(255, 251, 235, 0.95), rgba(255, 255, 255, 0.96));
    box-shadow: 0 10px 28px rgba(245, 158, 11, 0.12);
    transform: translateY(-1px);
  }
}

.inspiration-panel__template-brief {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.82);
  color: var(--editor-text-secondary, #475569);
}

.inspiration-panel__section--compact textarea,
.inspiration-panel__section--compact input,
.inspiration-panel__composer input,
.inspiration-panel__composer textarea,
.inspiration-panel__chapter-card input,
.inspiration-panel__chapter-card textarea,
.inspiration-panel__token-entry input {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  padding: 10px 12px;
  outline: none;
  resize: vertical;
  background: rgba(255, 255, 255, 0.94);
  color: var(--editor-text-primary, #0f172a);
  font: inherit;
}

.inspiration-panel__token-entry {
  align-items: center;
}

.inspiration-panel__token-entry input {
  flex: 1;
}

.inspiration-panel__token-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.inspiration-panel__token {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 247, 237, 0.94);
  color: #9a3412;
  font-size: 12px;
  font-weight: 600;

  button {
    border: none;
    background: transparent;
    padding: 0;
    color: inherit;
  }
}

.inspiration-panel__token--promise {
  background: rgba(254, 242, 242, 0.94);
  color: #b91c1c;
}

.inspiration-panel__chapter-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.inspiration-panel__chapter-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.86)),
    rgba(255, 255, 255, 0.86);
}

.inspiration-panel__chapter-head {
  display: grid;
  gap: 4px;

  span {
    color: #b45309;
    font-size: 12px;
    font-weight: 700;
  }
}

.inspiration-panel__section--hint {
  background:
    radial-gradient(circle at top left, rgba(249, 115, 22, 0.08), transparent 28%),
    rgba(255, 255, 255, 0.84);
}

.inspiration-panel__composer {
  display: grid;
  gap: 10px;
}

.inspiration-panel__composer button {
  justify-self: start;
}

.inspiration-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 120px;
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.66);
  color: var(--editor-text-secondary, #475569);
}

.inspiration-panel__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inspiration-panel__note-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.86);
}

.inspiration-panel__note-head {
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

.inspiration-panel__meta {
  flex-wrap: wrap;
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 12px;
}

@media (max-width: 1200px) {
  .inspiration-panel__template-grid,
  .inspiration-panel__chapter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
