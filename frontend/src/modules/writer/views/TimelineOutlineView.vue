<template>
  <section class="timeline-outline-view">
    <header class="timeline-outline-view__header">
      <div class="timeline-outline-view__title-wrap">
        <h2 class="timeline-outline-view__title">时间线大纲</h2>
        <p class="timeline-outline-view__subtitle">聚焦关键事件与节奏推进，辅助主线与支线校准。</p>
      </div>
      <div class="timeline-outline-view__context-anchors">
        <span v-if="chapterTitle" class="context-anchor">
          <QyIcon name="Document" :size="12" />
          章节：{{ chapterTitle }}
        </span>
        <span v-if="workflowContext?.scopeLabel" class="context-anchor">
          <QyIcon name="Grid" :size="12" />
          场景：{{ workflowContext.scopeLabel }}
        </span>
      </div>
      <div class="timeline-outline-view__actions">
        <el-button size="small" @click="handleRefresh">
          <QyIcon name="Refresh" :size="14" />
          刷新
        </el-button>
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
        <div class="timeline-events__title">事件轴</div>
        <div class="timeline-events__content">
          <article v-for="event in orderedEvents" :key="event.id" class="timeline-event">
            <div class="timeline-event__dot" />
            <div class="timeline-event__card">
              <div class="timeline-event__head">
                <h3>{{ event.title }}</h3>
                <el-tag
                  size="small"
                  :type="
                    event.importance >= 8 ? 'danger' : event.importance >= 5 ? 'warning' : 'info'
                  "
                >
                  P{{ event.importance || 0 }}
                </el-tag>
              </div>
              <p class="timeline-event__desc">{{ event.description || '暂无描述' }}</p>
              <div class="timeline-event__meta">
                <span>{{ formatStoryTime(event.storyTime) }}</span>
                <span>类型：{{ event.eventType }}</span>
              </div>
              <div class="timeline-event__actions">
                <el-button
                  size="small"
                  text
                  data-testid="timeline-send-to-ai"
                  @click="handleSendEventToAI(event)"
                >
                  交给 AI
                </el-button>
              </div>
            </div>
          </article>
          <Empty
            v-if="orderedEvents.length === 0"
            description="当前时间线暂无事件"
            iconSize="medium"
          />
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { QyIcon } from '@/design-system/components'
import { Empty } from '@/design-system/base'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import {
  formatActiveEntitiesPrompt,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
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
    workflowContext?: WriterWorkflowContext
    activeEntities?: ActiveEntitySummary[]
  }>(),
  {
    projectId: '',
    chapterId: '',
    chapterTitle: '',
    workflowContext: undefined,
    activeEntities: () => [],
  },
)

const emit = defineEmits<{
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
}>()

const writerStore = useWriterStore()

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')
const timelines = computed<Timeline[]>(() => writerStore.timeline.list || [])
const events = computed<TimelineEvent[]>(() => writerStore.timeline.events || [])
const currentTimelineId = computed(() => writerStore.timeline.currentTimeline?.id || '')

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
</script>

<style scoped lang="scss">
.timeline-outline-view {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg-surface, #f5f8ff);
}

.timeline-outline-view__header {
  padding: 14px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--editor-border, #d9e2f1);
  background: var(--editor-bg-base, #fff);
}

.timeline-outline-view__title-wrap {
  flex: 1;
  min-width: 200px;
}

.timeline-outline-view__context-anchors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.context-anchor {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.16);
  color: var(--editor-accent, #06b6d4);
  font-size: 11px;
  font-weight: 600;
}

.timeline-outline-view__title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--editor-text-primary, #1f3254);
}

.timeline-outline-view__subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--editor-text-muted, #667795);
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
  background: var(--editor-bg-base, #fff);
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
  background: var(--editor-bg-elevated, #fbfdff);
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

/* 深色/暖纸/专注模式 */
[data-editor-theme='dark'],
[data-editor-theme='sepia'],
[data-editor-theme='focus'] {
  .timeline-outline-view {
    background: var(--editor-bg-surface);
  }

  .timeline-outline-view__header {
    background: var(--editor-bg-base);
  }

  .timeline-outline-view__title {
    color: var(--editor-text-primary);
  }

  .timeline-outline-view__subtitle {
    color: var(--editor-text-muted);
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
