<template>
  <section class="timeline-outline-view">
    <header class="timeline-outline-view__header">
      <ToolAssetSummaryChips :items="visibleAssetSummaryItems" />
      <div class="timeline-outline-view__actions">
        <QyButton variant="secondary" size="sm" @click="handleRefresh">
          <QyIcon name="Refresh" :size="14" />
          刷新
        </QyButton>
      </div>
    </header>

    <div class="timeline-outline-view__stats">
      <SystemStatCard
        label="时间线数量"
        :value="timelines.length"
        hint="当前项目时间线容器"
        tone="info"
      />
      <SystemStatCard
        label="事件总数"
        :value="events.length"
        hint="已收录剧情节点"
        tone="success"
      />
      <SystemStatCard
        label="高优先级事件"
        :value="highPriorityEvents"
        hint="重要性 >= 8"
        tone="warning"
      />
    </div>

    <div class="timeline-outline-view__body">
      <aside class="timeline-list">
        <div class="timeline-list__title">时间线列表</div>
        <div class="timeline-list__content">
          <button
            v-for="timeline in timelines"
            :key="timeline.id"
            type="button"
            class="timeline-list__item"
            :class="{ active: timeline.id === currentTimelineId }"
            @click="selectTimeline(timeline.id)"
          >
            <div class="timeline-list__name">{{ timeline.name }}</div>
            <div class="timeline-list__meta">{{ timeline.description || '暂无描述' }}</div>
          </button>
          <Empty v-if="timelines.length === 0" description="暂无时间线" iconSize="medium" />
        </div>
      </aside>

      <section class="timeline-events">
        <div class="timeline-events__title">
          <span>事件轴</span>
          <strong>{{ timelineWindowRangeLabel }}</strong>
        </div>
        <div class="timeline-events__segment-map">
          <button
            v-for="segment in eventSegments"
            :key="segment.id"
            type="button"
            class="timeline-events__segment"
            :class="{ 'is-active': segment.id === activeEventSegmentId }"
            @click="activateEventSegment(segment.id)"
          >
            <strong>{{ segment.title }}</strong>
            <span>{{ segment.total }} 事件</span>
          </button>
        </div>
        <div class="timeline-events__locator">
          <label>
            <QyIcon name="Search" :size="14" />
            <input
              v-model.trim="eventLocatorQuery"
              type="text"
              placeholder="定位事件标题、类型或时间"
              @keyup.enter="handleEventLocate"
            />
          </label>
          <button type="button" @click="handleEventLocate">定位</button>
          <button
            v-for="option in eventFilterOptions"
            :key="option.value"
            type="button"
            class="timeline-events__filter"
            :class="{ 'is-active': eventFilterMode === option.value }"
            @click="eventFilterMode = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <div class="timeline-events__content">
          <article
            v-for="event in timelineWindowEvents"
            :key="event.id"
            class="timeline-event"
            :class="{ 'is-selected': event.id === selectedEventId }"
          >
            <div class="timeline-event__dot" />
            <div class="timeline-event__card">
              <div class="timeline-event__head">
                <h3>{{ event.title }}</h3>
                <QyTag
                  size="sm"
                  :type="
                    event.importance >= 8 ? 'danger' : event.importance >= 5 ? 'warning' : 'info'
                  "
                >
                  P{{ event.importance || 0 }}
                </QyTag>
              </div>
              <p class="timeline-event__desc">{{ event.description || '暂无描述' }}</p>
              <div class="timeline-event__meta">
                <span>{{ formatStoryTime(event.storyTime) }}</span>
                <span>类型：{{ event.eventType }}</span>
              </div>
              <div class="timeline-event__actions">
                <QyButton
                  variant="text"
                  size="sm"
                  data-testid="timeline-send-to-ai"
                  @click="handleSendEventToAI(event)"
                >
                  交给 AI
                </QyButton>
              </div>
            </div>
          </article>
          <Empty
            v-if="timelineWindowEvents.length === 0"
            description="当前时间线暂无事件"
            iconSize="medium"
          />
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QyButton, QyIcon, QyTag } from '@/design-system/components'
import { Empty } from '@/design-system/base'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import ToolAssetSummaryChips from '@/modules/writer/components/workspace/tool-overlay/ToolAssetSummaryChips.vue'
import {
  formatActiveEntitiesPrompt,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
import { useWriterAssetSummary } from '@/modules/writer/composables/useWriterAssetSummary'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import {
  locateWriterCandidate,
  resolveStableWriterSegmentId,
  resolveWriterWindowRange,
} from '@/modules/writer/utils/longformLocate'
import type { Timeline, TimelineEvent } from '@/types/writer'
import SystemStatCard from '@/modules/writer/components/system-design/SystemStatCard.vue'
import type {
  WriterWorkflowActionRequest,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'

interface TimelineStoryTime {
  year?: number
  month?: number
  day?: number
  era?: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    projectId?: string
    chapterId?: string
    chapterTitle?: string
    chapters?: SidebarChapterSummary[]
    workflowContext?: WriterWorkflowContext
    activeEntities?: ActiveEntitySummary[]
  }>(),
  {
    projectId: '',
    chapterId: '',
    chapterTitle: '',
    chapters: () => [],
    workflowContext: undefined,
    activeEntities: () => [],
  },
)

const emit = defineEmits<{
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
}>()

const writerStore = useWriterStore()
type EventFilterMode = 'all' | 'nearby' | 'high-priority' | 'current-chapter'
const EVENT_SEGMENT_SIZE = 50
const EVENT_WINDOW_BEFORE_COUNT = 20
const EVENT_WINDOW_AFTER_COUNT = 20
const EVENT_SEGMENT_INITIAL_LIMIT = 40
const EVENT_WINDOW_OPTIONS = {
  beforeCount: EVENT_WINDOW_BEFORE_COUNT,
  afterCount: EVENT_WINDOW_AFTER_COUNT,
  initialCount: EVENT_SEGMENT_INITIAL_LIMIT,
} as const
const activeEventSegmentId = ref('')
const selectedEventId = ref('')
const eventLocatorQuery = ref('')
const eventFilterMode = ref<EventFilterMode>('nearby')
const eventFilterOptions: Array<{ value: EventFilterMode; label: string }> = [
  { value: 'nearby', label: '当前窗口' },
  { value: 'all', label: '本区段' },
  { value: 'high-priority', label: '高优先级' },
  { value: 'current-chapter', label: '当前章节' },
]

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')
const timelines = computed<Timeline[]>(() => writerStore.timeline.list || [])
const events = computed<TimelineEvent[]>(() => writerStore.timeline.events || [])
const currentTimelineId = computed(() => writerStore.timeline.currentTimeline?.id || '')
const { visibleAssetSummaryItems } = useWriterAssetSummary({
  projectId: effectiveProjectId,
  chapterId: computed(() => props.chapterId),
  chapters: computed(() => props.chapters || []),
  activeEntities: computed(() => props.activeEntities || []),
})

const orderedEvents = computed(() =>
  [...events.value].sort((a, b) => {
    const orderA =
      Number(a.storyTime?.year || 0) * 10000 +
      Number(a.storyTime?.month || 0) * 100 +
      Number(a.storyTime?.day || 0)
    const orderB =
      Number(b.storyTime?.year || 0) * 10000 +
      Number(b.storyTime?.month || 0) * 100 +
      Number(b.storyTime?.day || 0)
    return orderA - orderB
  }),
)

const highPriorityEvents = computed(
  () => events.value.filter((event) => (event.importance || 0) >= 8).length,
)
const orderedEventRows = computed(() =>
  orderedEvents.value.map((event, index) => ({
    event,
    index,
    segmentId: `segment:${Math.floor(index / EVENT_SEGMENT_SIZE)}`,
  })),
)
const eventSegments = computed(() => {
  const segments = new Map<
    string,
    { id: string; title: string; startIndex: number; endIndex: number; total: number }
  >()

  for (const row of orderedEventRows.value) {
    const segmentIndex = Math.floor(row.index / EVENT_SEGMENT_SIZE)
    const segment =
      segments.get(row.segmentId) ||
      ({
        id: row.segmentId,
        title: `第 ${segmentIndex * EVENT_SEGMENT_SIZE + 1}-${Math.min(
          (segmentIndex + 1) * EVENT_SEGMENT_SIZE,
          orderedEventRows.value.length,
        )} 事件`,
        startIndex: row.index,
        endIndex: row.index,
        total: 0,
      } as { id: string; title: string; startIndex: number; endIndex: number; total: number })

    segment.endIndex = row.index
    segment.total += 1
    segments.set(row.segmentId, segment)
  }

  return [...segments.values()]
})
const activeEventSegment = computed(
  () => eventSegments.value.find((segment) => segment.id === activeEventSegmentId.value) || null,
)
const selectedEventRow = computed(
  () => orderedEventRows.value.find((row) => row.event.id === selectedEventId.value) || null,
)
const currentChapterEventRow = computed(() =>
  props.chapterId
    ? orderedEventRows.value.find((row) => row.event.chapterIds?.includes(props.chapterId)) || null
    : null,
)
const timelineWindowEvents = computed(() => {
  const segment = activeEventSegment.value
  if (!segment) return []

  let rows = orderedEventRows.value.filter((row) => row.segmentId === segment.id)
  if (eventFilterMode.value === 'nearby') {
    const anchor =
      selectedEventRow.value?.segmentId === segment.id
        ? selectedEventRow.value.index
        : currentChapterEventRow.value?.segmentId === segment.id
          ? currentChapterEventRow.value.index
          : null
    const windowRange = resolveWriterWindowRange(
      rows.map((row) => ({
        id: row.event.id,
        order: row.index,
        segmentId: row.segmentId,
        title: row.event.title,
      })),
      anchor === null
        ? null
        : {
            id: selectedEventRow.value?.segmentId === segment.id
              ? selectedEventRow.value.event.id
              : currentChapterEventRow.value?.event.id || '',
            order: anchor,
            segmentId: segment.id,
            title: '',
          },
      anchor === null ? 'segment' : 'around-target',
      EVENT_WINDOW_OPTIONS,
    )
    if (!windowRange) return []
    rows = rows.filter(
      (row) => row.index >= windowRange.startOrder && row.index <= windowRange.endOrder,
    )
  }
  if (eventFilterMode.value === 'high-priority') {
    rows = rows.filter((row) => (row.event.importance || 0) >= 8)
  }
  if (eventFilterMode.value === 'current-chapter') {
    rows = rows.filter(
      (row) => !!props.chapterId && row.event.chapterIds?.includes(props.chapterId),
    )
  }
  return rows.map((row) => row.event)
})
const timelineWindowRangeLabel = computed(() => {
  if (!activeEventSegment.value) return '无事件'
  if (!timelineWindowEvents.value.length) return `${activeEventSegment.value.title} · 无匹配`
  const first = orderedEventRows.value.find(
    (row) => row.event.id === timelineWindowEvents.value[0].id,
  )
  const last = orderedEventRows.value.find(
    (row) => row.event.id === timelineWindowEvents.value[timelineWindowEvents.value.length - 1].id,
  )
  return `${activeEventSegment.value.title} · #${(first?.index ?? 0) + 1}-#${(last?.index ?? 0) + 1}`
})

const formatStoryTime = (storyTime?: TimelineStoryTime) => {
  if (!storyTime) return '未设置时间'
  const year = storyTime.year ? `${storyTime.year}年` : ''
  const month = storyTime.month ? `${storyTime.month}月` : ''
  const day = storyTime.day ? `${storyTime.day}日` : ''
  const era = storyTime.era ? `${storyTime.era} ` : ''
  const fallback = storyTime.description || '未设置时间'
  const text = `${era}${year}${month}${day}`.trim()
  return text || fallback
}

const buildEventAIContextText = (event: TimelineEvent) => {
  const currentTimeline = timelines.value.find(
    (timeline) => timeline.id === currentTimelineId.value,
  )
  const lines = [
    `时间线事件：${event.title}`,
    currentTimeline?.name ? `所属时间线：${currentTimeline.name}` : '',
    props.chapterTitle ? `当前章节：${props.chapterTitle}` : '',
    props.workflowContext?.scopeLabel ? `场景作用域：${props.workflowContext.scopeLabel}` : '',
    formatActiveEntitiesPrompt(props.activeEntities),
    event.description ? `事件描述：${event.description}` : '',
    event.eventType ? `事件类型：${event.eventType}` : '',
    `故事时间：${formatStoryTime(event.storyTime)}`,
  ].filter(Boolean)

  return lines.join('\n')
}

const handleSendEventToAI = (event: TimelineEvent) => {
  emit('trigger-ai-action', {
    source: 'workspace',
    action: 'add_to_chat',
    title: `时间线事件分析：${event.title}`,
    text: buildEventAIContextText(event),
    instructions:
      '请基于这条时间线事件分析它对当前章节推进的影响，优先给出冲突升级、节奏衔接和后续伏笔建议。',
  })
}

const activateEventSegment = (segmentId: string) => {
  activeEventSegmentId.value = segmentId
  eventFilterMode.value = 'nearby'
  const firstRow = orderedEventRows.value.find((row) => row.segmentId === segmentId)
  selectedEventId.value = firstRow?.event.id || ''
}

const handleEventLocate = () => {
  const located = locateWriterCandidate(
    orderedEventRows.value.map((row) => ({
      id: row.event.id,
      order: row.index,
      segmentId: row.segmentId,
      title: row.event.title,
      description: row.event.description,
      chapterNumber: row.event.chapterIds?.[0]
        ? props.chapters.find((chapter) => chapter.id === row.event.chapterIds?.[0])?.chapterNum
        : undefined,
      chapterTitle: row.event.chapterIds?.[0]
        ? props.chapters.find((chapter) => chapter.id === row.event.chapterIds?.[0])?.title
        : undefined,
      aliases: [row.event.eventType, formatStoryTime(row.event.storyTime)],
    })),
    eventLocatorQuery.value,
    (segmentId) =>
      orderedEventRows.value
        .filter((row) => row.segmentId === segmentId)
        .map((row) => ({
          id: row.event.id,
          order: row.index,
          segmentId: row.segmentId,
          title: row.event.title,
        })),
    EVENT_WINDOW_OPTIONS,
  )
  if (!located) return
  activeEventSegmentId.value = located.segmentId
  selectedEventId.value = located.candidate.id
  eventFilterMode.value = 'nearby'
}

const selectTimeline = (timelineId: string) => {
  const target = timelines.value.find((item) => item.id === timelineId)
  if (!target) return
  writerStore.setCurrentTimeline(target)
}

const handleRefresh = async () => {
  const projectId = effectiveProjectId.value
  if (!projectId) return
  await writerStore.loadTimelines(projectId)
  if (writerStore.timeline.currentTimeline?.id) {
    await writerStore.loadTimelineEvents(writerStore.timeline.currentTimeline.id)
  }
}

watch(
  () => effectiveProjectId.value,
  async (projectId) => {
    if (!projectId) return
    await handleRefresh()
  },
  { immediate: true },
)

watch(
  () => [eventSegments.value.map((segment) => segment.id).join('|'), props.chapterId] as const,
  () => {
    if (
      activeEventSegmentId.value &&
      eventSegments.value.some((segment) => segment.id === activeEventSegmentId.value)
    ) {
      return
    }
    activeEventSegmentId.value = resolveStableWriterSegmentId(
      activeEventSegmentId.value,
      eventSegments.value.map((segment) => segment.id),
      [selectedEventRow.value?.segmentId, currentChapterEventRow.value?.segmentId],
    )
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.timeline-outline-view {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-layer-soft, var(--editor-bg-surface, #f5f8ff));
}

.timeline-outline-view__header {
  padding: 14px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--editor-border, #d9e2f1);
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.timeline-outline-view__stats {
  padding: 12px 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.timeline-outline-view__body {
  flex: 1;
  min-height: 0;
  padding: 0 16px 16px;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 12px;
}

.timeline-list,
.timeline-events {
  border: 1px solid var(--editor-border, #d6e1f3);
  border-radius: var(--editor-radius-lg, 14px);
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.timeline-list__title,
.timeline-events__title {
  padding: 12px 14px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--editor-text-muted, #5f7090);
  border-bottom: 1px solid var(--editor-border, #e1e9f6);
}

.timeline-events__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  strong {
    color: var(--editor-text-secondary, #475569);
    font-size: 11px;
    letter-spacing: 0;
    text-transform: none;
  }
}

.timeline-events__segment-map {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 12px;
  border-bottom: 1px solid var(--editor-border, #e1e9f6);
}

.timeline-events__segment {
  min-width: 136px;
  padding: 9px 11px;
  border-radius: 12px;
  border: 1px solid var(--editor-border, #dbe5f5);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent);
  color: var(--editor-text-secondary, #475569);
  text-align: left;
  cursor: pointer;

  strong,
  span {
    display: block;
  }

  strong {
    color: var(--editor-text-primary, #21365c);
    font-size: 12px;
  }

  span {
    margin-top: 3px;
    color: var(--editor-text-muted, #7485a3);
    font-size: 11px;
  }

  &.is-active {
    border-color: color-mix(in srgb, var(--editor-accent, #06b6d4) 32%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 78%, transparent);
  }
}

.timeline-events__locator {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--editor-border, #e1e9f6);

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 240px;
    min-height: 34px;
    padding: 0 10px;
    border-radius: 12px;
    border: 1px solid var(--editor-border, #dbe5f5);
    background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 94%, transparent);
  }

  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--editor-text-primary, #21365c);
    font-size: 12px;
  }

  button {
    min-height: 32px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid var(--editor-border, #dbe5f5);
    background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 94%, transparent);
    color: var(--editor-text-secondary, #475569);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
}

.timeline-events__filter.is-active {
  border-color: color-mix(in srgb, var(--editor-accent, #06b6d4) 32%, transparent);
  background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 78%, transparent);
  color: var(--editor-accent, #06b6d4);
}

.timeline-list__content,
.timeline-events__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px;
}

.timeline-list__item {
  width: 100%;
  text-align: left;
  border-radius: var(--editor-radius-md, 10px);
  border: 1px solid var(--editor-border, #dbe5f5);
  background: var(--editor-bg-elevated, #f8fbff);
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
}

.timeline-list__item.active {
  border-color: var(--editor-accent, #6690e8);
  background: var(--editor-accent-soft, #edf4ff);
  box-shadow: 0 8px 16px rgba(57, 101, 197, 0.12);
}

.timeline-list__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-primary, #21365c);
}

.timeline-list__meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--editor-text-muted, #6f7f9b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timeline-event {
  position: relative;
  padding-left: 20px;
  margin-bottom: 10px;

  &.is-selected .timeline-event__card {
    border-color: color-mix(in srgb, var(--editor-accent, #06b6d4) 34%, transparent);
    background: color-mix(
      in srgb,
      var(--editor-accent-soft, #ecfeff) 58%,
      var(--editor-layer-panel, var(--editor-bg-base, #fff)) 42%
    );
  }
}

.timeline-event__dot {
  position: absolute;
  left: 2px;
  top: 16px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--editor-accent, #4f79d8);
  box-shadow: 0 0 0 4px rgba(79, 121, 216, 0.15);
}

.timeline-event__card {
  border: 1px solid var(--editor-border, #dbe5f5);
  border-radius: var(--editor-radius-lg, 12px);
  background: var(--editor-layer-soft, var(--editor-bg-elevated, #fbfdff));
  padding: 10px 12px;
}

.timeline-event__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.timeline-event__head h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--editor-text-primary, #21365c);
}

.timeline-event__desc {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--editor-text-secondary, #5f7191);
}

.timeline-event__meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  font-size: 11px;
  color: var(--editor-text-muted, #7485a3);
}

.timeline-event__actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

/* 非默认主题兼容层 */
[data-editor-theme='graphite'],
[data-editor-theme='amber'],
[data-editor-theme='forest'] {
  .timeline-outline-view {
    background: var(--editor-bg-surface);
  }

  .timeline-outline-view__header {
    background: var(--editor-bg-base);
  }

  .timeline-list,
  .timeline-events {
    background: var(--editor-bg-base);
  }

  .timeline-list__title,
  .timeline-events__title {
    color: var(--editor-text-muted);
    border-bottom-color: var(--editor-border);
  }

  .timeline-list__item {
    background: var(--editor-bg-elevated);
    border-color: var(--editor-border);
  }

  .timeline-list__item.active {
    background: var(--editor-accent-soft);
  }

  .timeline-list__name {
    color: var(--editor-text-primary);
  }

  .timeline-list__meta {
    color: var(--editor-text-muted);
  }

  .timeline-event__dot {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--editor-accent) 15%, transparent);
  }

  .timeline-event__card {
    background: var(--editor-bg-elevated);
    border-color: var(--editor-border);
  }

  .timeline-event__head h3 {
    color: var(--editor-text-primary);
  }

  .timeline-event__desc {
    color: var(--editor-text-secondary);
  }

  .timeline-event__meta {
    color: var(--editor-text-muted);
  }
}

@media (max-width: 1100px) {
  .timeline-outline-view__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .timeline-outline-view__body {
    grid-template-columns: 1fr;
  }
}
</style>
