<template>
  <div class="timeline-bar" :class="{ 'is-collapsed': !isExpanded }">
    <!-- 1. 头部控制栏 -->
    <div class="timeline-header">
      <div class="header-left" @click="toggleExpand">
        <div class="icon-wrapper">
          <QyIcon name="Timer"  />
        </div>
        <span class="title">时间线</span>
        <el-tag v-if="events.length" size="small" type="info" round effect="plain" class="count-tag">
          {{ events.length }}
        </el-tag>
      </div>

      <div class="header-right">
        <el-tooltip content="添加事件">
          <el-button link :icon="Plus" @click.stop="handleAddEvent" />
        </el-tooltip>
        <el-button link :icon="isExpanded ? ArrowDown : ArrowUp" @click.stop="toggleExpand" />
      </div>
    </div>

    <!-- 2. 时间轴主体 (横向滚动) -->
    <div v-show="isExpanded" class="timeline-body" @wheel.prevent="handleWheel">
      <el-scrollbar ref="scrollbarRef" always>
        <div class="timeline-track-wrapper">
          <!-- 背景横线 -->
          <div class="track-line"></div>

          <div class="track-nodes">
            <!-- 新建按钮节点 (最左侧) -->
            <div class="timeline-node add-node" @click="handleAddEvent">
              <div class="node-dot">
                <QyIcon name="Plus"  />
              </div>
              <div class="node-label">新建</div>
            </div>

            <!-- 事件节点列表 -->
            <div v-for="event in sortedEvents" :key="event.id" class="timeline-node" @click="handleEventClick(event)">
              <!-- 上方：时间/重要性 -->
              <div class="node-top">
                <span class="time-label">{{ formatStoryTime(event.storyTime) || '待定时间' }}</span>
                <el-rate v-model="event.importance" disabled :max="3" size="small" class="mini-rate" />
              </div>

              <!-- 中间：圆点图标 -->
              <el-tooltip :content="event.description || event.title" placement="top" :show-after="500">
                <div class="node-dot" :style="{
                  backgroundColor: getEventColor(event.eventType),
                  borderColor: getEventColor(event.eventType)
                }">
                  <el-icon class="node-icon">
                    <component :is="getEventIcon(event.eventType)" />
                  </el-icon>
                </div>
              </el-tooltip>

              <!-- 下方：标题 + 操作按钮 -->
              <div class="node-bottom">
                <span class="event-title" :title="event.title">{{ event.title }}</span>
                <span class="event-type-tag" :style="{ color: getEventColor(event.eventType) }">
                  {{ getEventLabel(event.eventType) }}
                </span>
                <div class="node-actions" @click.stop>
                  <el-tooltip content="编辑" placement="top">
                    <el-button link size="small" :icon="Edit" @click="handleEditEvent(event)" />
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button link size="small" :icon="Delete" class="delete-btn" @click="handleDeleteEvent(event)" />
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 3. 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑事件' : '新事件'" width="500px" destroy-on-close append-to-body>
      <el-form ref="formRef" :model="eventForm" :rules="formRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="eventForm.title" placeholder="事件概要 (如: 决战前夕)" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" prop="eventType">
              <el-select v-model="eventForm.eventType" style="width: 100%">
                <el-option v-for="opt in EVENT_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重要性">
              <el-rate v-model="eventForm.importance" :max="10" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 结构化时间输入 -->
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="纪元">
              <el-input v-model="eventForm.era" placeholder="如: 新历" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="年份">
              <el-input-number v-model="eventForm.year" :min="0" :max="99999" controls-position="right" style="width: 100%" placeholder="年" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="月">
              <el-input-number v-model="eventForm.month" :min="1" :max="12" controls-position="right" style="width: 100%" placeholder="月" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="日">
              <el-input-number v-model="eventForm.day" :min="1" :max="31" controls-position="right" style="width: 100%" placeholder="日" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="时间描述">
          <el-input v-model="eventForm.storyTimeDescription" placeholder="如: 第三天清晨 (可选补充)" />
        </el-form-item>

        <el-form-item label="详情">
          <el-input v-model="eventForm.description" type="textarea" :rows="3" placeholder="事件的具体描述、因果关系..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">{{ isEditMode ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, messageBox, type FormInstance } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { timelineApi } from '@/modules/writer/api'
import {
  type TimelineEvent,
  EventType,
  EVENT_TYPE_OPTIONS,
  formatStoryTime
} from '@/modules/writer/types/timeline'
import { Plus, ArrowDown, ArrowUp, Stamp, User, Trophy, Document, Location, Edit, Delete } from '@element-plus/icons-vue'

// 引入 Store
import { useWriterStore } from '@/modules/writer/stores/writerStore'  // 假设还没拆分，或者 import { useTimelineStore }

interface Props {
  timelineId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  eventClick: [event: TimelineEvent]
  refresh: []
}>()

const writerStore = useWriterStore()
const scrollbarRef = ref()
const formRef = ref<FormInstance>()

// 状态
const isExpanded = ref(true)
const dialogVisible = ref(false)
const submitting = ref(false)
const editingEventId = ref<string | null>(null)

// 表单数据
const eventForm = ref({
  title: '',
  description: '',
  eventType: EventType.PLOT,
  importance: 5,
  era: '',
  year: undefined as number | undefined,
  month: undefined as number | undefined,
  day: undefined as number | undefined,
  storyTimeDescription: ''
})

const isEditMode = computed(() => !!editingEventId.value)

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  eventType: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

// 获取事件列表
// TODO: Store 中的类型可能是旧的，或者缺少字段。这里强制断言为新的 TimelineEvent[]
// 这样做是为了让 TypeScript 通过编译，前提是你确信后端返回的数据里包含 projectId/createdAt 等字段
// 如果后端还没返回这些，需要去 types/timeline.ts 把那些字段设为可选 (?:)
const events = computed(() => (writerStore.timeline.events || []) as unknown as TimelineEvent[])

// 故事时间比较函数：将 StoryTime 转换为可比较的字符串
const getStoryTimeSortKey = (st?: { era?: string; year?: number; month?: number; day?: number; hour?: number; minute?: number; description?: string }): string => {
  if (!st) return ''
  // 如果有自定义描述，无法排序，放到最后
  if (st.description && !st.year) return 'zzz' + st.description
  // 格式化为可排序的字符串: 纪元-年-月-日-时-分
  const era = st.era || ''
  const year = (st.year ?? 9999).toString().padStart(5, '0')
  const month = (st.month ?? 1).toString().padStart(2, '0')
  const day = (st.day ?? 1).toString().padStart(2, '0')
  const hour = (st.hour ?? 0).toString().padStart(2, '0')
  const minute = (st.minute ?? 0).toString().padStart(2, '0')
  return `${era}-${year}-${month}-${day}-${hour}-${minute}`
}

// 排序：优先按 storyTime 正序排列，没有时间则按重要性降序作为 fallback
const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    const keyA = getStoryTimeSortKey(a.storyTime)
    const keyB = getStoryTimeSortKey(b.storyTime)
    // 都有 storyTime，按时间排序
    if (keyA && keyB) {
      return keyA.localeCompare(keyB)
    }
    // 只有一个有 storyTime，有时间的排前面
    if (keyA) return -1
    if (keyB) return 1
    // 都没有 storyTime，按重要性降序
    return b.importance - a.importance
  })
})

// =======================
// 交互逻辑
// =======================

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 鼠标滚轮横向滚动
const handleWheel = (e: WheelEvent) => {
  if (scrollbarRef.value) {
    const wrap = scrollbarRef.value.wrapRef
    if (wrap) {
      wrap.scrollLeft += e.deltaY
    }
  }
}

// =======================
// 业务逻辑
// =======================

const handleAddEvent = () => {
  editingEventId.value = null
  eventForm.value = {
    title: '',
    description: '',
    eventType: EventType.PLOT,
    importance: 5,
    era: '',
    year: undefined,
    month: undefined,
    day: undefined,
    storyTimeDescription: ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    const timelineId = props.timelineId || writerStore.timeline.currentTimeline?.id
    const projectId = writerStore.currentProjectId

    if (!timelineId || !projectId) {
      message.warning('上下文缺失 (无项目或时间线)')
      return
    }

    // 构建结构化的 storyTime 对象
    const storyTime: { year?: number; month?: number; day?: number; era?: string; description?: string } = {}
    if (eventForm.value.year !== undefined) storyTime.year = eventForm.value.year
    if (eventForm.value.month !== undefined) storyTime.month = eventForm.value.month
    if (eventForm.value.day !== undefined) storyTime.day = eventForm.value.day
    if (eventForm.value.era) storyTime.era = eventForm.value.era
    if (eventForm.value.storyTimeDescription) storyTime.description = eventForm.value.storyTimeDescription

    submitting.value = true
    try {
      if (isEditMode.value && editingEventId.value) {
        // 编辑模式
        await timelineApi.updateEvent(editingEventId.value, projectId, {
          timelineId,
          title: eventForm.value.title,
          description: eventForm.value.description,
          eventType: eventForm.value.eventType,
          importance: eventForm.value.importance,
          storyTime: Object.keys(storyTime).length > 0 ? storyTime : undefined,
        })
        message.success('更新成功')
      } else {
        // 创建模式
        await timelineApi.createEvent(timelineId, projectId, {
          timelineId,
          title: eventForm.value.title,
          description: eventForm.value.description,
          eventType: eventForm.value.eventType,
          importance: eventForm.value.importance,
          storyTime: Object.keys(storyTime).length > 0 ? storyTime : undefined,
        })
        message.success('创建成功')
      }

      dialogVisible.value = false

      // 刷新数据
      await writerStore.loadTimelineEvents(timelineId)
      emit('refresh')

    } catch (error: any) {
      message.error(error?.message || (isEditMode.value ? '更新时间线事件失败' : '创建时间线事件失败'))
    } finally {
      submitting.value = false
    }
  })
}

const handleEventClick = (event: TimelineEvent) => {
  emit('eventClick', event)
}

const handleEditEvent = (event: TimelineEvent) => {
  editingEventId.value = event.id
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
    await messageBox.confirm(`确定删除事件「${event.title}」吗？此操作不可恢复`, '删除确认', { type: 'warning' })
    const projectId = writerStore.currentProjectId
    if (!projectId) {
      message.warning('上下文缺失 (无项目)')
      return
    }
    await timelineApi.deleteEvent(event.id, projectId)
    message.success('删除成功')
    // 刷新数据
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

// =======================
// 样式辅助
// =======================

const getEventColor = (type: EventType) => {
  const opt = EVENT_TYPE_OPTIONS.find(o => o.value === type)
  return opt?.color || '#909399'
}

const getEventLabel = (type: EventType) => {
  const opt = EVENT_TYPE_OPTIONS.find(o => o.value === type)
  return opt?.label || type
}

const getEventIcon = (type: string) => {
  switch (type) {
    case EventType.PLOT: return Stamp
    case EventType.CHARACTER: return User
    case EventType.WORLD: return Location
    case EventType.BACKGROUND: return Document
    case EventType.MILESTONE: return Trophy
    default: return Document
  }
}
</script>

<style scoped lang="scss">
.timeline-bar {
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &.is-collapsed {
    .timeline-body {
      display: none;
    }
  }
}

// 1. 头部
.timeline-header {
  height: 40px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-lighter);
  user-select: none;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: var(--el-text-color-primary);

    .icon-wrapper {
      color: var(--el-color-primary);
      display: flex;
      align-items: center;
    }

    .title {
      font-weight: 600;
      font-size: 14px;
    }
  }
}

// 2. 主体区
.timeline-body {
  height: 180px; // 固定高度
  position: relative;
  background-color: var(--el-fill-color-light);
  overflow: hidden;
}

.timeline-track-wrapper {
  display: flex;
  align-items: center;
  padding: 0 32px;
  height: 100%;
  min-width: 100%;
  position: relative;

  // 背景横线
  .track-line {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    background-color: var(--el-border-color-darker);
    z-index: 0;
    margin-top: -1px;
  }
}

.track-nodes {
  display: flex;
  gap: 32px; // 节点间距
  position: relative;
  z-index: 1;
  padding: 20px 0; // 上下留白给 tooltip
}

// 3. 节点样式
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 120px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);

    .node-dot {
      transform: scale(1.2);
      box-shadow: 0 0 0 4px var(--el-color-primary-light-9);
    }

    .event-title {
      color: var(--el-color-primary);
    }
  }

  // 上半部分：时间
  .node-top {
    height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 8px;

    .time-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 2px;
    }

    .mini-rate {
      transform: scale(0.8);
    }
  }

  // 中间：圆点
  .node-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-bg-color);
    border: 2px solid var(--el-border-color);
    color: #fff;
    box-shadow: var(--el-box-shadow-light);
    transition: all 0.3s;
    z-index: 2;

    .node-icon {
      font-size: 16px;
    }
  }

  // 下半部分：标题
  .node-bottom {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;

    .event-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }

    .event-type-tag {
      font-size: 12px;
      padding: 2px 6px;
      background-color: var(--el-bg-color);
      border-radius: 10px;
      border: 1px solid currentColor;
      opacity: 0.8;
    }

    .node-actions {
      display: none;
      gap: 2px;
      margin-top: 4px;

      .delete-btn {
        color: var(--el-color-danger);
      }
    }

    &:hover .node-actions {
      display: flex;
    }
  }
}

// 新建节点特殊样式
.add-node {
  width: 60px;

  .node-dot {
    background-color: var(--el-bg-color);
    border: 2px dashed var(--el-text-color-secondary);
    color: var(--el-text-color-secondary);
  }

  &:hover .node-dot {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    box-shadow: none;
  }

  .node-label {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
