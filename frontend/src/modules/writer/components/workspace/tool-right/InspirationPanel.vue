<template>
  <div class="inspiration-panel">
    <header class="inspiration-panel__header">
      <h3>灵感与黄金三章</h3>
      <button type="button" class="inspiration-panel__expand" @click="$emit('open-fullscreen')">
        展开全屏 →
      </button>
    </header>

    <section class="inspiration-panel__section inspiration-panel__section--gate">
      <InspirationGateSummary :status="workflow.gate.status" :items="gateItems" />
    </section>

    <section class="inspiration-panel__section">
      <InspirationTemplateSelector
        :templates="templates"
        :active-template-id="workflow.templateId"
        :selected-template="selectedTemplate"
        @select-template="applyTemplate"
      />
    </section>

    <section class="inspiration-panel__section">
      <InspirationAnchorsEditor
        :pitch-line="workflow.pitchLine"
        :audience-draft="audienceDraft"
        :promise-draft="promiseDraft"
        :target-audience="workflow.targetAudience"
        :core-promises="workflow.corePromises"
        :pace-contract="workflow.paceContract"
        @update:pitch-line="workflow.pitchLine = $event"
        @update:audience-draft="audienceDraft = $event"
        @update:promise-draft="promiseDraft = $event"
        @update:pace-contract="workflow.paceContract = $event"
        @append-token="appendToken"
        @remove-token="removeToken"
      />
    </section>

    <section class="inspiration-panel__section">
      <InspirationGoldenChapterEditor
        :chapters="workflow.goldenChapters"
        :active-chapter-number="activeGoldenChapterNumber"
        :active-chapter="activeGoldenChapter"
        :template-name="selectedTemplate?.name ?? null"
        @update:active-chapter-number="activeGoldenChapterNumber = $event"
        @update-chapter="updateGoldenChapter($event.chapterNumber, $event.field, $event.value)"
      />
    </section>

    <section v-if="selectedTemplate" class="inspiration-panel__section inspiration-panel__section--hint">
      <div class="inspiration-panel__section-head"><h4>蓝图接力</h4></div>
      <ul class="inspiration-panel__hint-list">
        <li v-for="hint in selectedTemplate.blueprintHints" :key="hint">{{ hint }}</li>
      </ul>
    </section>

    <section class="inspiration-panel__section">
      <InspirationNotesPanel
        :notes="notes"
        :draft-title="draftTitle"
        :draft-content="draftContent"
        :can-submit="canSubmit"
        @update:draft-title="draftTitle = $event"
        @update:draft-content="draftContent = $event"
        @create="handleCreate"
        @remove="removeNote"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import InspirationAnchorsEditor from '@/modules/writer/components/workspace/tool-right/InspirationAnchorsEditor.vue'
import InspirationGateSummary from '@/modules/writer/components/workspace/tool-right/InspirationGateSummary.vue'
import InspirationGoldenChapterEditor from '@/modules/writer/components/workspace/tool-right/InspirationGoldenChapterEditor.vue'
import InspirationNotesPanel from '@/modules/writer/components/workspace/tool-right/InspirationNotesPanel.vue'
import InspirationTemplateSelector from '@/modules/writer/components/workspace/tool-right/InspirationTemplateSelector.vue'
import {
  getCreativeWorkflowTemplate,
  listCreativeWorkflowTemplates,
  loadCreativeWorkflow,
  saveCreativeWorkflow,
  type CreativeWorkflowRecord,
  type CreativeWorkflowTemplateId,
  type GoldenChapterPlan,
} from '@/modules/writer/services/creativeWorkflow.service'
import {
  createInspirationNote,
  deleteInspirationNote as deleteInspirationNoteRecord,
  listInspirationNotes,
  type InspirationNoteRecord,
} from '@/modules/writer/services/inspirationNotes.service'

type InspirationNote = InspirationNoteRecord

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
const activeGoldenChapterNumber = ref<GoldenChapterPlan['chapterNumber']>(1)
const workflow = ref<CreativeWorkflowRecord>({
  version: 1,
  projectId: props.projectId,
  templateId: null,
  pitchLine: '',
  targetAudience: [],
  corePromises: [],
  paceContract: '',
  goldenChapters: [],
  gate: {
    status: 'blocked',
    missing: [],
    nextActions: [],
    completedFields: {
      hasPrimaryGenre: false,
      hasTargetAudience: false,
      hasCorePromises: false,
      hasPaceContract: false,
    },
  },
  createdAt: '',
  updatedAt: '',
})
const isHydratingWorkflow = ref(false)

const canSubmit = computed(() => draftTitle.value.length > 0 && draftContent.value.length > 0)
const selectedTemplate = computed(() => getCreativeWorkflowTemplate(workflow.value.templateId))
const gateItems = computed(() => [
  { label: '题材模板', done: workflow.value.gate.completedFields.hasPrimaryGenre },
  { label: '目标读者', done: workflow.value.gate.completedFields.hasTargetAudience },
  { label: '核心承诺', done: workflow.value.gate.completedFields.hasCorePromises },
  { label: '节奏合约', done: workflow.value.gate.completedFields.hasPaceContract },
])
const activeGoldenChapter = computed(
  () =>
    workflow.value.goldenChapters.find(
      (chapter) => chapter.chapterNumber === activeGoldenChapterNumber.value,
    ) || workflow.value.goldenChapters[0],
)

const loadNotes = async () => {
  try {
    notes.value = await listInspirationNotes(props.projectId)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[InspirationPanel] load notes failed:', error)
    }
    notes.value = []
  }
}

const loadWorkflowState = async () => {
  isHydratingWorkflow.value = true
  workflow.value = await loadCreativeWorkflow(props.projectId)
  audienceDraft.value = ''
  promiseDraft.value = ''
  isHydratingWorkflow.value = false
}

const persistWorkflow = async () => {
  workflow.value = await saveCreativeWorkflow(props.projectId, {
    pitchLine: workflow.value.pitchLine,
    targetAudience: workflow.value.targetAudience,
    corePromises: workflow.value.corePromises,
    paceContract: workflow.value.paceContract,
    goldenChapters: workflow.value.goldenChapters,
  })
}

const applyTemplate = async (templateId: CreativeWorkflowTemplateId) => {
  workflow.value = await saveCreativeWorkflow(props.projectId, {
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
  void persistWorkflow()
}

const removeToken = (kind: 'audience' | 'promise', value: string) => {
  if (kind === 'audience') {
    workflow.value.targetAudience = workflow.value.targetAudience.filter((item) => item !== value)
  } else {
    workflow.value.corePromises = workflow.value.corePromises.filter((item) => item !== value)
  }
  void persistWorkflow()
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
  void persistWorkflow()
}

const handleCreate = async () => {
  if (!canSubmit.value) return
  const created = await createInspirationNote({
    projectId: props.projectId,
    chapterId: props.chapterId || undefined,
    chapterTitle: props.chapterTitle || undefined,
    title: draftTitle.value,
    content: draftContent.value,
  })
  notes.value = [created, ...notes.value.filter((note) => note.id !== created.id)]
  draftTitle.value = ''
  draftContent.value = ''
}

const removeNote = async (noteId: string) => {
  await deleteInspirationNoteRecord(props.projectId, noteId)
  notes.value = notes.value.filter((note) => note.id !== noteId)
}

watch(
  () => props.projectId,
  () => {
    void loadNotes()
    void loadWorkflowState()
  },
  { immediate: true },
)
watch(
  [() => workflow.value.pitchLine, () => workflow.value.paceContract],
  () => {
    if (isHydratingWorkflow.value) return
    void persistWorkflow()
  },
)

watch(
  () => workflow.value.goldenChapters.map((chapter) => chapter.chapterNumber).join('|'),
  () => {
    if (
      workflow.value.goldenChapters.some(
        (chapter) => chapter.chapterNumber === activeGoldenChapterNumber.value,
      )
    ) {
      return
    }
    activeGoldenChapterNumber.value = workflow.value.goldenChapters[0]?.chapterNumber || 1
  },
  { immediate: true },
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
    radial-gradient(circle at top right, color-mix(in srgb, var(--color-warning-400, #fbbf24) 18%, transparent), transparent 28%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--editor-layer-panel, #fffef6) 96%, transparent),
      color-mix(in srgb, var(--editor-bg-surface, #f5f7fb) 92%, transparent) 100%
    );
}

.inspiration-panel__header,
.inspiration-panel__section-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.inspiration-panel__header {
  align-items: center;

  h3,
  h4,
  strong,
  p {
    margin: 0;
  }
}

.inspiration-panel__header h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--editor-text-primary, #0f172a);
}

.inspiration-panel__section-head {
  align-items: center;

  h3,
  h4,
  strong,
  p {
    margin: 0;
  }
}

.inspiration-panel__section-head h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--editor-text-primary, #0f172a);
}

.inspiration-panel__expand {
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.22)) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 94%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.inspiration-panel__expand {
  height: 34px;
  padding: 0 12px;
  border-color: rgba(251, 191, 36, 0.28);
  color: var(--color-warning-700, #b45309);
}

.inspiration-panel__section {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.14)) 70%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 82%, transparent);
  box-shadow: var(--editor-shadow-md, 0 8px 30px rgba(15, 23, 42, 0.04));
}

.inspiration-panel__section h4,
.inspiration-panel__section p,
.inspiration-panel__section strong {
  margin: 0;
}

.inspiration-panel__section--gate {
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-warning-500, #f59e0b) 14%, transparent),
      color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent)
    ),
    color-mix(in srgb, var(--editor-layer-panel, #ffffff) 82%, transparent);
}

.inspiration-panel__hint-list {
  margin: 0;
  padding-left: 18px;
  color: var(--editor-text-secondary, #475569);
  line-height: 1.6;
}

.inspiration-panel__section--hint {
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--color-warning-600, #f97316) 10%, transparent), transparent 28%),
    color-mix(in srgb, var(--editor-layer-panel, #ffffff) 84%, transparent);
}

</style>
