<template>
  <div class="inspiration-panel">
    <header class="inspiration-panel__header">
      <h3>灵感</h3>
      <button type="button" class="inspiration-panel__expand" @click="$emit('open-fullscreen')">
        全屏
      </button>
    </header>

    <section class="inspiration-panel__section inspiration-panel__section--gate">
      <InspirationGateSummary :status="workflow.gate.status" :items="gateItems" />
    </section>

    <section class="inspiration-panel__section">
      <div class="inspiration-panel__fold-head">
        <div>
          <h4>模板</h4>
          <span>{{ templateSummary }}</span>
        </div>
        <button
          type="button"
          data-testid="inspiration-toggle-template"
          @click="templateExpanded = !templateExpanded"
        >
          {{ templateExpanded ? '收起' : '展开' }}
        </button>
      </div>
      <InspirationTemplateSelector
        v-if="templateExpanded"
        :templates="templates"
        :active-template-id="workflow.templateId"
        :selected-template="selectedTemplate"
        @select-template="applyTemplate"
      />
    </section>

    <section class="inspiration-panel__section">
      <div class="inspiration-panel__fold-head">
        <div>
          <h4>锚点</h4>
          <span>{{ anchorsSummary }}</span>
        </div>
        <button
          type="button"
          data-testid="inspiration-toggle-anchors"
          @click="anchorsExpanded = !anchorsExpanded"
        >
          {{ anchorsExpanded ? '收起' : '展开' }}
        </button>
      </div>
      <InspirationAnchorsEditor
        v-if="anchorsExpanded"
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

    <section class="inspiration-panel__section inspiration-panel__section--golden">
      <div class="inspiration-panel__fold-head">
        <div>
          <h4>三章</h4>
          <span>{{ goldenChapterSummary }}</span>
        </div>
        <button
          type="button"
          data-testid="inspiration-toggle-golden"
          @click="goldenChaptersExpanded = !goldenChaptersExpanded"
        >
          {{ goldenChaptersExpanded ? '收起' : '展开' }}
        </button>
      </div>
      <InspirationGoldenChapterEditor
        v-if="goldenChaptersExpanded"
        :chapters="workflow.goldenChapters"
        :active-chapter-number="activeGoldenChapterNumber"
        :active-chapter="activeGoldenChapter"
        :template-name="selectedTemplate?.name ?? null"
        :show-header="false"
        @update:active-chapter-number="activeGoldenChapterNumber = $event"
        @update-chapter="updateGoldenChapter($event.chapterNumber, $event.field, $event.value)"
      />
    </section>

    <section class="inspiration-panel__section">
      <InspirationNotesPanel
        :expanded="notesExpanded"
        :notes="notes"
        :draft-title="draftTitle"
        :draft-content="draftContent"
        :can-submit="canSubmit"
        @update:draft-title="draftTitle = $event"
        @update:draft-content="draftContent = $event"
        @create="handleCreate"
        @remove="removeNote"
        @toggle-expanded="notesExpanded = !notesExpanded"
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

const CHINESE_DIGIT_MAP: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
}

const parseChineseChapterNumber = (value: string): number => {
  if (!value) return 0
  if (value === '十') return 10

  const tenIndex = value.indexOf('十')
  if (tenIndex >= 0) {
    const left = value.slice(0, tenIndex)
    const right = value.slice(tenIndex + 1)
    const tens = left ? CHINESE_DIGIT_MAP[left] || 0 : 1
    const ones = right ? CHINESE_DIGIT_MAP[right] || 0 : 0
    return tens * 10 + ones
  }

  return CHINESE_DIGIT_MAP[value] || 0
}

const extractChapterNumber = (title: string): number => {
  const normalized = title.trim()
  const arabicMatch = normalized.match(/第\s*(\d+)\s*章/)
  if (arabicMatch?.[1]) {
    return Number(arabicMatch[1]) || 0
  }

  const chineseMatch = normalized.match(/第\s*([零一二两三四五六七八九十]+)\s*章/)
  if (chineseMatch?.[1]) {
    return parseChineseChapterNumber(chineseMatch[1])
  }

  return 0
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
const activeGoldenChapterNumber = ref<GoldenChapterPlan['chapterNumber']>(1)
const templateExpanded = ref(false)
const anchorsExpanded = ref(false)
const goldenChaptersExpanded = ref(false)
const notesExpanded = ref(false)
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
const currentChapterNumber = computed(() => extractChapterNumber(props.chapterTitle))
const shouldCollapseGoldenChapters = computed(
  () => Boolean(currentChapterNumber.value && currentChapterNumber.value > 3),
)
const templateSummary = computed(() =>
  selectedTemplate.value
    ? `${selectedTemplate.value.name} · ${selectedTemplate.value.tagline}`
    : '未选',
)
const anchorsSummary = computed(() => {
  const parts: string[] = []
  if (workflow.value.pitchLine.trim()) parts.push('已写定位')
  if (workflow.value.targetAudience.length > 0) {
    parts.push(`读者 ${workflow.value.targetAudience.length}`)
  }
  if (workflow.value.corePromises.length > 0) {
    parts.push(`承诺 ${workflow.value.corePromises.length}`)
  }
  if (workflow.value.paceContract.trim()) parts.push('已定节奏')
  return parts.length > 0 ? parts.join(' · ') : '待补'
})
const goldenChapterSummary = computed(() =>
  shouldCollapseGoldenChapters.value
    ? '后段'
    : '钩子',
)
const gateItems = computed(() => [
  { label: '模板', done: workflow.value.gate.completedFields.hasPrimaryGenre },
  { label: '读者', done: workflow.value.gate.completedFields.hasTargetAudience },
  { label: '承诺', done: workflow.value.gate.completedFields.hasCorePromises },
  { label: '节奏', done: workflow.value.gate.completedFields.hasPaceContract },
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
  [() => props.projectId, currentChapterNumber],
  () => {
    goldenChaptersExpanded.value = false
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
  gap: 0;
  padding: 8px 9px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
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
  padding-bottom: 6px;

  h3,
  h4,
  strong,
  p {
    margin: 0;
  }
}

.inspiration-panel__header h3 {
  font-size: 14px;
  font-weight: 700;
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
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.22)) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 94%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.inspiration-panel__expand {
  height: 24px;
  padding: 0 8px;
  border-color: rgba(251, 191, 36, 0.28);
  color: var(--color-warning-700, #b45309);
}

.inspiration-panel__section {
  display: grid;
  gap: 7px;
  padding: 7px 0;
  border-top: 1px solid var(--editor-border, #e2e8f0);
}

.inspiration-panel__section h4,
.inspiration-panel__section p,
.inspiration-panel__section strong {
  margin: 0;
}

.inspiration-panel__fold-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  div {
    display: grid;
    gap: 2px;
  }

  h4 {
    margin: 0;
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
    font-weight: 700;
  }

  span {
    color: var(--editor-text-muted, #64748b);
    font-size: 11px;
  }

  button {
    height: 22px;
    padding: 0 7px;
    border: 1px solid var(--editor-border, #d9dee6);
    border-radius: 8px;
    background: transparent;
    color: var(--editor-text-secondary, #475569);
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
  }
}

</style>
