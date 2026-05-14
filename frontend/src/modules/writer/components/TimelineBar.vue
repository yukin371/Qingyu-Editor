<template>
  <div class="timeline-bar flex flex-col">
    <div
      class="timeline-bar__header flex h-10 items-center justify-between px-4"
    >
      <button
        type="button"
        class="timeline-bar__toggle flex items-center gap-2 text-sm font-medium transition-colors"
        data-testid="timeline-toggle"
        @click="toggleExpand"
      >
        <span
          class="timeline-bar__badge inline-flex h-7 w-7 items-center justify-center rounded-full"
        >
          <QyIcon name="Timer" :size="16" />
        </span>
        <span>时间线</span>
        <QyTag
          v-if="events.length"
          size="sm"
          type="info"
          effect="plain"
          class="font-medium"
        >
          {{ events.length }}
        </QyTag>
      </button>

      <div class="flex items-center gap-1">
        <button
          type="button"
          title="添加事件"
          data-testid="timeline-add-event"
          class="timeline-bar__icon-btn inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 hover:-translate-y-px"
          @click.stop="handleAddEvent"
        >
          <QyIcon name="Plus" :size="16" />
        </button>
        <button
          type="button"
          :title="isExpanded ? '收起时间线' : '展开时间线'"
          class="timeline-bar__icon-btn inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 hover:-translate-y-px"
          @click.stop="toggleExpand"
        >
          <QyIcon :name="isExpanded ? 'ArrowDown' : 'ArrowUp'" :size="16" />
        </button>
      </div>
    </div>

    <div v-show="isExpanded" class="timeline-bar__body h-[180px] overflow-hidden" @wheel.prevent="handleWheel">
      <QyScrollbar ref="scrollbarRef" class="h-full">
        <div class="relative flex h-full min-w-full items-center px-8">
          <div class="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-300" />

          <div class="relative z-10 flex gap-8 py-5">
            <button
              type="button"
              class="group flex w-[60px] shrink-0 cursor-pointer flex-col items-center"
              data-testid="timeline-create-node"
              @click="handleAddEvent"
            >
              <span
                class="timeline-bar__create inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed transition-all duration-150"
              >
                <QyIcon name="Plus" :size="16" />
              </span>
              <span class="timeline-bar__muted mt-2 text-xs">新建</span>
            </button>

            <div
              v-for="event in sortedEvents"
              :key="event.id"
              class="group flex w-[120px] shrink-0 cursor-pointer flex-col items-center transition-transform duration-150 hover:-translate-y-1"
              @click="handleEventClick(event)"
            >
              <div class="mb-2 flex h-10 flex-col items-center justify-end">
                <span class="timeline-bar__muted max-w-[110px] truncate text-xs">
                  {{ formatStoryTime(event.storyTime) || '待定时间' }}
                </span>
                <QyRate
                  :model-value="getDisplayImportance(event.importance)"
                  :max="3"
                  size="sm"
                  disabled
                  class="scale-[0.8]"
                />
              </div>

              <div
                class="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-white shadow-sm transition-all duration-150 group-hover:scale-110 group-hover:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                :title="event.description || event.title"
                :style="{
                  backgroundColor: getEventColor(event.eventType),
                  borderColor: getEventColor(event.eventType),
                }"
              >
                <QyIcon :name="getEventIconName(event.eventType)" :size="16" />
              </div>

              <div class="mt-2 flex w-full flex-col items-center text-center">
                <span
                  class="w-full truncate text-sm font-medium text-slate-700 transition-colors group-hover:text-blue-700"
                  :title="event.title"
                >
                  {{ event.title }}
                </span>
                <span
                  class="mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium"
                  :style="{
                    color: getEventColor(event.eventType),
                    borderColor: `${getEventColor(event.eventType)}55`,
                    backgroundColor: `${getEventColor(event.eventType)}12`,
                  }"
                >
                  {{ getEventLabel(event.eventType) }}
                </span>
                <div class="mt-1 hidden items-center gap-1 opacity-0 transition group-hover:flex group-hover:opacity-100">
                  <button
                    type="button"
                    title="编辑"
                  class="timeline-bar__action inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                  @click.stop="handleEditEvent(event)"
                >
                    <QyIcon name="Edit" :size="14" />
                  </button>
                  <button
                    type="button"
                    title="删除"
                    class="timeline-bar__danger inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                    @click.stop="handleDeleteEvent(event)"
                  >
                    <QyIcon name="Delete" :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </QyScrollbar>
    </div>

    <QyDialog v-model:visible="dialogVisible" :title="dialogTitle" size="lg">
      <div class="space-y-5">
        <div class="space-y-2">
          <label class="timeline-bar__field-label text-sm font-medium">标题</label>
          <QyInput v-model="eventForm.title" placeholder="事件概要 (如: 决战前夕)" />
          <p v-if="formErrors.title" class="text-xs text-rose-500">{{ formErrors.title }}</p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="timeline-bar__field-label text-sm font-medium">类型</label>
            <QySelect
              v-model="eventForm.eventType"
              :options="eventTypeOptions"
              placeholder="选择事件类型"
            />
            <p v-if="formErrors.eventType" class="text-xs text-rose-500">{{ formErrors.eventType }}</p>
          </div>
          <div class="space-y-2">
            <label class="timeline-bar__field-label text-sm font-medium">重要性</label>
            <div class="timeline-bar__field-box rounded-2xl px-4 py-3">
              <QyRate v-model="eventForm.importance" :max="10" />
            </div>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-4">
          <div class="space-y-2 md:col-span-2">
            <label class="timeline-bar__field-label text-sm font-medium">纪元</label>
            <QyInput v-model="eventForm.era" placeholder="如: 新历" />
          </div>
          <div class="space-y-2">
            <label class="timeline-bar__field-label text-sm font-medium">年份</label>
            <QyInputNumber
              v-model="eventForm.year"
              :min="0"
              :max="99999"
              placeholder="年"
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <label class="timeline-bar__field-label text-sm font-medium">月份</label>
            <QyInputNumber
              v-model="eventForm.month"
              :min="1"
              :max="12"
              placeholder="月"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="timeline-bar__field-label text-sm font-medium">日期</label>
            <QyInputNumber
              v-model="eventForm.day"
              :min="1"
              :max="31"
              placeholder="日"
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <label class="timeline-bar__field-label text-sm font-medium">时间描述</label>
            <QyInput
              v-model="eventForm.storyTimeDescription"
              placeholder="如: 第三天清晨 (可选补充)"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="timeline-bar__field-label text-sm font-medium">详情</label>
          <QyTextarea
            v-model="eventForm.description"
            :rows="3"
            placeholder="事件的具体描述、因果关系..."
          />
        </div>
      </div>

      <template #footer>
        <QyButton variant="secondary" @click="dialogVisible = false">取消</QyButton>
        <QyButton variant="primary" :loading="submitting" @click="handleSubmit">
          {{ isEditMode ? '保存' : '创建' }}
        </QyButton>
      </template>
    </QyDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  QyButton,
  QyDialog,
  QyIcon,
  QyInput,
  QyInputNumber,
  QyRate,
  QyScrollbar,
  QySelect,
  QyTag,
  QyTextarea,
} from '@/design-system/components'
import { timelineApi } from '@/modules/writer/api/timeline'
import {
  type StoryTime,
  type TimelineEvent,
  EventType,
  EVENT_TYPE_OPTIONS,
  formatStoryTime,
} from '@/modules/writer/types/timeline'
import { useWriterStore } from '@/modules/writer/stores/writerStore'

interface Props {
  timelineId?: string
}

interface TimelineEventForm {
  title: string
  description: string
  eventType: EventType | ''
  importance: number
  era: string
  year: number | undefined
  month: number | undefined
  day: number | undefined
  storyTimeDescription: string
}

interface TimelineBarFormErrors {
  title?: string
  eventType?: string
}

interface ScrollbarExpose {
  scrollbarView?: HTMLElement | { value?: HTMLElement }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  eventClick: [event: TimelineEvent]
  refresh: []
}>()

const writerStore = useWriterStore()
const scrollbarRef = ref<ScrollbarExpose | null>(null)

const isExpanded = ref(true)
const dialogVisible = ref(false)
const submitting = ref(false)
const editingEventId = ref<string | null>(null)
const formErrors = ref<TimelineBarFormErrors>({})

const createEmptyEventForm = (): TimelineEventForm => ({
  title: '',
  description: '',
  eventType: EventType.PLOT,
  importance: 5,
  era: '',
  year: undefined,
  month: undefined,
  day: undefined,
  storyTimeDescription: '',
})

const eventForm = ref<TimelineEventForm>(createEmptyEventForm())

const isEditMode = computed(() => editingEventId.value !== null)
const dialogTitle = computed(() => (isEditMode.value ? '编辑事件' : '新事件'))
const eventTypeOptions = EVENT_TYPE_OPTIONS.map((option) => ({
  label: option.label,
  value: option.value,
}))

const events = computed(() => (writerStore.timeline.events || []) as unknown as TimelineEvent[])

const getStoryTimeSortKey = (storyTime?: StoryTime): string => {
  if (!storyTime) return ''
  if (storyTime.description && storyTime.year === undefined) {
    return `zzz-${storyTime.description}`
  }

  const era = storyTime.era || ''
  const year = (storyTime.year ?? 9999).toString().padStart(5, '0')
  const month = (storyTime.month ?? 1).toString().padStart(2, '0')
  const day = (storyTime.day ?? 1).toString().padStart(2, '0')
  const hour = (storyTime.hour ?? 0).toString().padStart(2, '0')
  const minute = (storyTime.minute ?? 0).toString().padStart(2, '0')

  return `${era}-${year}-${month}-${day}-${hour}-${minute}`
}

const sortedEvents = computed(() =>
  [...events.value].sort((left, right) => {
    const leftKey = getStoryTimeSortKey(left.storyTime)
    const rightKey = getStoryTimeSortKey(right.storyTime)

    if (leftKey && rightKey) {
      return leftKey.localeCompare(rightKey)
    }

    if (leftKey) return -1
    if (rightKey) return 1

    return right.importance - left.importance
  }),
)

const resetEventForm = () => {
  eventForm.value = createEmptyEventForm()
  formErrors.value = {}
}

const validateForm = () => {
  const errors: TimelineBarFormErrors = {}

  if (!eventForm.value.title.trim()) {
    errors.title = '请输入标题'
  }

  if (!eventForm.value.eventType) {
    errors.eventType = '请选择类型'
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const buildStoryTime = (): StoryTime | undefined => {
  const storyTime: StoryTime = {}

  if (eventForm.value.year !== undefined) storyTime.year = eventForm.value.year
  if (eventForm.value.month !== undefined) storyTime.month = eventForm.value.month
  if (eventForm.value.day !== undefined) storyTime.day = eventForm.value.day
  if (eventForm.value.era.trim()) storyTime.era = eventForm.value.era.trim()
  if (eventForm.value.storyTimeDescription.trim()) {
    storyTime.description = eventForm.value.storyTimeDescription.trim()
  }

  return Object.keys(storyTime).length > 0 ? storyTime : undefined
}

const resolveScrollbarView = () => {
  const candidate = scrollbarRef.value?.scrollbarView
  if (!candidate) return null
  return candidate instanceof HTMLElement ? candidate : candidate.value ?? null
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleWheel = (event: WheelEvent) => {
  const scrollbarView = resolveScrollbarView()
  if (scrollbarView) {
    scrollbarView.scrollLeft += event.deltaY
  }
}

const handleAddEvent = () => {
  editingEventId.value = null
  resetEventForm()
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  const timelineId = props.timelineId || writerStore.timeline.currentTimeline?.id
  const projectId = writerStore.currentProjectId

  if (!timelineId || !projectId) {
    message.warning('上下文缺失 (无项目或时间线)')
    return
  }

  submitting.value = true
  try {
    const payload = {
      timelineId,
      title: eventForm.value.title.trim(),
      description: eventForm.value.description.trim(),
      eventType: eventForm.value.eventType as EventType,
      importance: eventForm.value.importance,
      storyTime: buildStoryTime(),
    }

    if (isEditMode.value && editingEventId.value) {
      await timelineApi.updateEvent(editingEventId.value, projectId, payload)
      message.success('更新成功')
    } else {
      await timelineApi.createEvent(timelineId, projectId, payload)
      message.success('创建成功')
    }

    dialogVisible.value = false
    await writerStore.loadTimelineEvents(timelineId)
    emit('refresh')
  } catch (error: any) {
    message.error(error?.message || (isEditMode.value ? '更新时间线事件失败' : '创建时间线事件失败'))
  } finally {
    submitting.value = false
  }
}

const handleEventClick = (event: TimelineEvent) => {
  emit('eventClick', event)
}

const handleEditEvent = (event: TimelineEvent) => {
  editingEventId.value = event.id
  formErrors.value = {}
  eventForm.value = {
    title: event.title,
    description: event.description || '',
    eventType: event.eventType,
    importance: event.importance,
    era: event.storyTime?.era || '',
    year: event.storyTime?.year,
    month: event.storyTime?.month,
    day: event.storyTime?.day,
    storyTimeDescription: event.storyTime?.description || '',
  }
  dialogVisible.value = true
}

const handleDeleteEvent = async (event: TimelineEvent) => {
  try {
    await messageBox.confirm(`确定删除事件「${event.title}」吗？此操作不可恢复`, '删除确认', {
      type: 'warning',
    })

    const projectId = writerStore.currentProjectId
    if (!projectId) {
      message.warning('上下文缺失 (无项目)')
      return
    }

    await timelineApi.deleteEvent(event.id, projectId)
    message.success('删除成功')

    const timelineId = props.timelineId || writerStore.timeline.currentTimeline?.id
    if (timelineId) {
      await writerStore.loadTimelineEvents(timelineId)
    }

    emit('refresh')
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      message.error(error?.message || '删除时间线事件失败')
    }
  }
}

const getDisplayImportance = (importance: number) => Math.max(1, Math.min(3, Math.round(importance / 4)))

const getEventColor = (type: EventType) =>
  EVENT_TYPE_OPTIONS.find((option) => option.value === type)?.color || '#94a3b8'

const getEventLabel = (type: EventType) =>
  EVENT_TYPE_OPTIONS.find((option) => option.value === type)?.label || type

const getEventIconName = (type: EventType) => {
  switch (type) {
    case EventType.PLOT:
      return 'Memo'
    case EventType.CHARACTER:
      return 'User'
    case EventType.WORLD:
      return 'Location'
    case EventType.BACKGROUND:
      return 'Document'
    case EventType.MILESTONE:
      return 'Trophy'
    default:
      return 'Document'
  }
}
</script>

<style scoped>
.timeline-bar {
  border-top: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 76%, transparent);
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
}

.timeline-bar__header {
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 76%, transparent);
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 90%, transparent);
}

.timeline-bar__toggle {
  color: var(--editor-text-secondary, #334155);
}

.timeline-bar__toggle:hover {
  color: var(--editor-accent, #2563eb);
}

.timeline-bar__badge {
  background: color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 82%, transparent);
  color: var(--editor-accent, #2563eb);
}

.timeline-bar__icon-btn {
  color: var(--editor-text-muted, #64748b);
}

.timeline-bar__icon-btn:hover {
  background: color-mix(in srgb, var(--editor-bg-elevated, #e2e8f0) 88%, transparent);
  color: var(--editor-text-primary, #0f172a);
}

.timeline-bar__body {
  background: color-mix(in srgb, var(--editor-bg-surface, #f1f5f9) 78%, transparent);
}

.timeline-bar__create {
  border-color: var(--editor-text-ghost, #94a3b8);
  background: var(--editor-layer-panel, #ffffff);
  color: var(--editor-text-muted, #64748b);
}

.group:hover .timeline-bar__create {
  border-color: var(--editor-accent, #2563eb);
  background: color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 78%, transparent);
  color: var(--editor-accent, #2563eb);
}

.timeline-bar__muted {
  color: var(--editor-text-muted, #64748b);
}

.timeline-bar__action {
  color: var(--editor-text-muted, #64748b);
}

.timeline-bar__action:hover {
  background: color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 78%, transparent);
  color: var(--editor-accent, #2563eb);
}

.timeline-bar__danger {
  color: var(--color-danger-500, #ef4444);
}

.timeline-bar__danger:hover {
  background: color-mix(in srgb, var(--color-danger-50, #fef2f2) 84%, transparent);
  color: var(--color-danger-600, #dc2626);
}

.timeline-bar__field-label {
  color: var(--editor-text-secondary, #334155);
}

.timeline-bar__field-box {
  border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 76%, transparent);
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 84%, transparent);
}
</style>
