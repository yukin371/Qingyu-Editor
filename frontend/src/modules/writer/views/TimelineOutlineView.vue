<template>
  <section class="timeline-outline-view">
    <header class="timeline-outline-view__header">
      <div class="timeline-outline-view__masthead">
        <p>Timeline</p>
        <h2>{{ currentTimelineTitle }}</h2>
      </div>
      <div class="timeline-outline-view__context">
        <ToolAssetSummaryChips :items="visibleAssetSummaryItems" />
        <div class="timeline-outline-view__metrics" aria-label="时间线统计">
          <span>{{ timelines.length }} 条时间线</span>
          <span>{{ events.length }} 个事件</span>
          <span>{{ highPriorityEvents }} 个关键点</span>
        </div>
      </div>
      <div class="timeline-outline-view__actions">
        <QyButton variant="secondary" size="sm" @click="handleRefresh">
          <QyIcon name="Refresh" :size="14" />
          刷新
        </QyButton>
      </div>
    </header>

    <div class="timeline-outline-view__body">
      <aside class="timeline-list">
        <div class="timeline-list__title">容器</div>
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
          <div v-if="timelines.length === 0" class="timeline-list__empty">
            <div class="timeline-empty-card">
              <span class="timeline-empty-card__eyebrow">Timeline</span>
              <strong>当前项目暂无时间线</strong>
              <p>这里会显示主时间线、支线或事件容器。创建后可按章节窗口快速定位。</p>
            </div>
          </div>
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
            @click="selectedEventId = event.id"
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
          <div v-if="timelineWindowEvents.length === 0" class="timeline-events__empty">
            <div class="timeline-empty-card timeline-empty-card--soft">
              <span class="timeline-empty-card__eyebrow">Event Window</span>
              <strong>{{ emptyTimelineTitle }}</strong>
              <p>{{ emptyTimelineDescription }}</p>
              <div
                v-if="currentChapterAnchorTitle || visibleAssetSummaryItems.length"
                class="timeline-empty-card__anchor"
                data-testid="timeline-empty-chapter-anchor"
              >
                <span>{{ currentChapterAnchorLabel }}</span>
                <strong>{{ currentChapterAnchorTitle || '当前章节' }}</strong>
                <div v-if="visibleAssetSummaryItems.length" class="timeline-empty-card__chips">
                  <span
                    v-for="item in visibleAssetSummaryItems"
                    :key="`${item.label}-${item.count}`"
                    class="timeline-empty-card__chip"
                  >
                    {{ item.label }} {{ item.count }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="timeline-inspector">
        <div class="timeline-inspector__title">
          <span>检视</span>
          <strong>{{ selectedEventIndexLabel }}</strong>
        </div>
        <div v-if="selectedEvent" class="timeline-inspector__body">
          <QyTag
            size="sm"
            :type="
              selectedEvent.importance >= 8
                ? 'danger'
                : selectedEvent.importance >= 5
                  ? 'warning'
                  : 'info'
            "
          >
            P{{ selectedEvent.importance || 0 }}
          </QyTag>
          <h3>{{ selectedEvent.title }}</h3>
          <p>{{ selectedEvent.description || '暂无描述' }}</p>
          <dl>
            <div>
              <dt>故事时间</dt>
              <dd>{{ formatStoryTime(selectedEvent.storyTime) }}</dd>
            </div>
            <div>
              <dt>类型</dt>
              <dd>{{ selectedEvent.eventType || 'plot' }}</dd>
            </div>
            <div>
              <dt>关联章节</dt>
              <dd>{{ selectedEventChapterLabel }}</dd>
            </div>
          </dl>
          <QyButton
            variant="secondary"
            size="sm"
            data-testid="timeline-inspector-send-to-ai"
            @click="handleSendEventToAI(selectedEvent)"
          >
            交给 AI 分析
          </QyButton>
        </div>
        <div v-else class="timeline-inspector__empty">
          选择一个事件后查看时间、章节、类型和 AI 分析入口。
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QyButton, QyIcon, QyTag } from '@/design-system/components'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import ToolAssetSummaryChips from '@/modules/writer/components/workspace/tool-overlay/ToolAssetSummaryChips.vue'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'
import { useWriterAssetSummary } from '@/modules/writer/composables/useWriterAssetSummary'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import { buildWriterToolAIHandoff } from '@/modules/writer/utils/writerToolAIHandoff'
import {
  locateWriterCandidate,
  resolveStableWriterSegmentId,
  resolveWriterWindowRange,
} from '@/modules/writer/utils/longformLocate'
import type { Timeline, TimelineEvent } from '@/types/writer'
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
const currentTimelineTitle = computed(() => writerStore.timeline.currentTimeline?.name || '主时间线')
const { visibleAssetSummaryItems } = useWriterAssetSummary({
  projectId: effectiveProjectId,
  chapterId: computed(() => props.chapterId),
  chapters: computed(() => props.chapters || []),
  activeEntities: computed(() => props.activeEntities || []),
})
const currentChapterSummary = computed(() =>
  props.chapterId ? props.chapters.find((chapter) => chapter.id === props.chapterId) || null : null,
)
const currentChapterAnchorTitle = computed(
  () => props.chapterTitle || currentChapterSummary.value?.title || '',
)
const currentChapterAnchorLabel = computed(() => {
  if (currentChapterSummary.value?.chapterNum) return `第 ${currentChapterSummary.value.chapterNum} 章锚点`
  return props.chapterId ? '当前章节锚点' : '待拆事件入口'
})
const emptyTimelineTitle = computed(() =>
  props.chapterId ? '当前章节还没有时间线事件' : '当前窗口暂无事件',
)
const emptyTimelineDescription = computed(() =>
  props.chapterId
    ? '这里先保留当前章节锚点和资产上下文。等事件拆出来后，会按章节窗口显示冲突、转折和伏笔顺序。'
    : '可以切换左侧时间线容器，或用定位器搜索事件标题、类型和时间来跳转到相邻区段。',
)

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
const selectedEvent = computed(() => selectedEventRow.value?.event || timelineWindowEvents.value[0] || null)
const selectedEventIndexLabel = computed(() =>
  selectedEventRow.value ? `#${selectedEventRow.value.index + 1}` : '未选择',
)
const selectedEventChapterLabel = computed(() => {
  const ids = selectedEvent.value?.chapterIds || []
  if (!ids.length) return '未绑定'
  return ids
    .slice(0, 3)
    .map((id) => props.chapters.find((chapter) => chapter.id === id)?.title || id)
    .join(' / ')
})
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

const buildEventAIHandoff = (event: TimelineEvent): WriterWorkflowActionRequest => {
  const currentTimeline = timelines.value.find(
    (timeline) => timeline.id === currentTimelineId.value,
  )
  const lines = [
    `时间线事件：${event.title}`,
    currentTimeline?.name ? `所属时间线：${currentTimeline.name}` : '',
    event.description ? `事件描述：${event.description}` : '',
    event.eventType ? `事件类型：${event.eventType}` : '',
    `故事时间：${formatStoryTime(event.storyTime)}`,
  ].filter(Boolean)

  return buildWriterToolAIHandoff({
    toolLabel: '时间线',
    title: `时间线事件分析：${event.title}`,
    focusLines: lines,
    workflowContext: props.workflowContext,
    activeEntities: props.activeEntities,
    instructions:
      '请基于这条时间线事件分析它对当前章节推进的影响，优先给出冲突升级、节奏衔接和后续伏笔建议。',
  })
}

const handleSendEventToAI = (event: TimelineEvent) => {
  emit('trigger-ai-action', buildEventAIHandoff(event))
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
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 22%, transparent), transparent 36%),
    linear-gradient(180deg, var(--editor-layer-soft, var(--editor-bg-surface, #f5f8ff)) 0%, color-mix(in srgb, var(--editor-layer-soft, #f5f8ff) 86%, var(--editor-bg-base, #ffffff)) 100%);
}

.timeline-outline-view__header {
  padding: 14px 16px 12px;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--editor-border, #d9e2f1);
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.timeline-outline-view__masthead {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-outline-view__masthead p {
  margin: 0;
  color: var(--editor-text-muted, #6f7f9b);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.timeline-outline-view__masthead h2 {
  margin: 0;
  color: var(--editor-text-primary, #21365c);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.timeline-outline-view__context {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.timeline-outline-view__metrics {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  color: var(--editor-text-muted, #6f7f9b);
  font-size: 12px;
}

.timeline-outline-view__metrics span {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--editor-border, #dbe5f5);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 90%, transparent);
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
  padding: 12px 16px 16px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 280px;
  gap: 12px;
}

.timeline-list,
.timeline-events,
.timeline-inspector {
  border: 1px solid var(--editor-border, #d6e1f3);
  border-radius: 16px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 24px color-mix(in srgb, var(--editor-shadow, #0f172a) 8%, transparent);
}

.timeline-list__title,
.timeline-events__title,
.timeline-inspector__title {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--editor-text-muted, #5f7090);
  border-bottom: 1px solid var(--editor-border, #e1e9f6);
}

.timeline-events__title {
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
  padding: 12px;
  border-bottom: 1px solid var(--editor-border, #e1e9f6);
}

.timeline-events__segment {
  min-width: 144px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid var(--editor-border, #dbe5f5);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--editor-layer-panel, #ffffff) 96%, transparent), color-mix(in srgb, var(--editor-layer-soft, #f8fbff) 92%, transparent));
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
    border-color: color-mix(in srgb, var(--editor-accent, #06b6d4) 34%, transparent);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 86%, transparent), color-mix(in srgb, var(--editor-layer-panel, #ffffff) 88%, transparent));
    box-shadow: 0 8px 18px color-mix(in srgb, var(--editor-accent, #06b6d4) 10%, transparent);
  }
}

.timeline-events__locator {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--editor-border, #e1e9f6);

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 240px;
    min-height: 36px;
    padding: 0 12px;
    border-radius: 999px;
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
    padding: 0 12px;
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
.timeline-events__content,
.timeline-inspector__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px;
}

.timeline-list__empty,
.timeline-events__empty {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 10px;
}

.timeline-empty-card {
  width: 100%;
  min-height: 148px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border: 1px dashed color-mix(in srgb, var(--editor-border, #dbe5f5) 88%, var(--editor-accent, #4f79d8));
  border-radius: 16px;
  padding: 18px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 34%, transparent), transparent 42%),
    color-mix(in srgb, var(--editor-layer-panel, #ffffff) 88%, transparent);
  color: var(--editor-text-secondary, #5f7191);
}

.timeline-empty-card--soft {
  max-width: 520px;
  min-height: 180px;
  text-align: center;
  align-items: center;
}

.timeline-empty-card__eyebrow {
  width: fit-content;
  border-radius: 999px;
  padding: 4px 9px;
  background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 76%, transparent);
  color: var(--editor-accent, #2563eb);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.timeline-empty-card strong {
  color: var(--editor-text-primary, #21365c);
  font-size: 14px;
  font-weight: 800;
}

.timeline-empty-card p {
  margin: 0;
  color: var(--editor-text-muted, #7485a3);
  font-size: 12px;
  line-height: 1.7;
}

.timeline-empty-card__anchor {
  width: min(420px, 100%);
  margin-top: 8px;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #2563eb) 18%, var(--editor-border, #dbe5f5));
  border-radius: 14px;
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 84%, var(--editor-accent-soft, #ecfeff));
  text-align: left;
}

.timeline-empty-card__anchor > span {
  display: block;
  color: var(--editor-text-muted, #7485a3);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.timeline-empty-card__anchor > strong {
  display: block;
  margin-top: 4px;
  color: var(--editor-text-primary, #21365c);
  font-size: 15px;
}

.timeline-empty-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}

.timeline-empty-card__chip {
  padding: 4px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 70%, var(--editor-layer-panel, #ffffff));
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 700;
}

.timeline-list__item {
  width: 100%;
  text-align: left;
  border-radius: 12px;
  border: 1px solid var(--editor-border, #dbe5f5);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-panel, #ffffff) 90%, transparent),
    color-mix(in srgb, var(--editor-bg-elevated, #f8fbff) 92%, transparent)
  );
  padding: 11px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.timeline-list__item.active {
  border-color: color-mix(in srgb, var(--editor-accent, #6690e8) 36%, transparent);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--editor-accent-soft, #edf4ff) 88%, transparent), color-mix(in srgb, var(--editor-layer-panel, #ffffff) 90%, transparent));
  box-shadow: 0 10px 20px color-mix(in srgb, var(--editor-accent, #6690e8) 12%, transparent);
  transform: translateY(-1px);
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
  padding-left: 22px;
  margin-bottom: 12px;

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
  top: 18px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--editor-accent, #4f79d8);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--editor-accent, #4f79d8) 16%, transparent);
}

.timeline-event__card {
  border: 1px solid var(--editor-border, #dbe5f5);
  border-radius: 14px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--editor-layer-panel, #ffffff) 96%, transparent), color-mix(in srgb, var(--editor-layer-soft, #fbfdff) 92%, transparent));
  padding: 12px 14px;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
}

.timeline-event:hover .timeline-event__card {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px color-mix(in srgb, var(--editor-shadow, #0f172a) 10%, transparent);
}

.timeline-event__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.timeline-event__head h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: var(--editor-text-primary, #21365c);
}

.timeline-event__desc {
  margin: 7px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--editor-text-secondary, #5f7191);
}

.timeline-event__meta {
  margin-top: 9px;
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

.timeline-inspector__title strong {
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;
  letter-spacing: 0;
  text-transform: none;
}

.timeline-inspector__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-inspector__body h3 {
  margin: 0;
  color: var(--editor-text-primary, #21365c);
  font-size: 15px;
  font-weight: 800;
}

.timeline-inspector__body p {
  margin: 0;
  color: var(--editor-text-secondary, #5f7191);
  line-height: 1.7;
  font-size: 12px;
}

.timeline-inspector__body dl {
  margin: 0;
  display: grid;
  gap: 10px;
}

.timeline-inspector__body dl div {
  padding: 10px 12px;
  border: 1px solid var(--editor-border, #dbe5f5);
  border-radius: 12px;
  background: var(--editor-bg-elevated, #f8fbff);
}

.timeline-inspector__body dt {
  margin: 0 0 4px;
  color: var(--editor-text-muted, #7485a3);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.timeline-inspector__body dd {
  margin: 0;
  color: var(--editor-text-primary, #21365c);
  font-size: 12px;
  line-height: 1.6;
}

.timeline-inspector__empty {
  padding: 16px 14px;
  color: var(--editor-text-muted, #7485a3);
  font-size: 12px;
  line-height: 1.7;
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
  .timeline-events,
  .timeline-inspector {
    background: var(--editor-bg-base);
  }

  .timeline-list__title,
  .timeline-events__title,
  .timeline-inspector__title {
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

  .timeline-inspector__body dl div {
    background: var(--editor-bg-elevated);
    border-color: var(--editor-border);
  }

  .timeline-empty-card {
    background: var(--editor-bg-elevated);
    border-color: var(--editor-border);
  }
}

@media (max-width: 1100px) {
  .timeline-outline-view__body {
    grid-template-columns: 1fr;
  }

  .timeline-outline-view__context {
    align-items: flex-start;
  }

  .timeline-outline-view__metrics {
    justify-content: flex-start;
  }
}
</style>
