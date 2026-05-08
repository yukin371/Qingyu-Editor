<template>
  <div class="writer-dashboard">
    <!-- 1. 顶部欢迎区 -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="title">创作工作台</h1>
        <p class="subtitle">
          欢迎回来，<span class="username">{{ userName }}</span
          >！继续你的创作之旅
        </p>
      </div>
      <div class="header-actions">
        <!-- 可选：放置日期筛选或设置按钮 -->
      </div>
    </div>
    <!-- 2. 核心数据概览 (Stats) -->
    <div class="stats-grid">
      <div v-for="(item, index) in statCards" :key="index" class="stats-grid-item">
        <Card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ backgroundColor: item.bgColor }">
            <QyIcon :name="item.iconName" :size="24" :color="item.iconColor" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(item.value) }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </Card>
      </div>
    </div>

    <div class="data-status-banner" :class="{ 'is-degraded': hasDashboardDegraded }">
      <div class="status-main">
        <Tag
          size="sm"
          :variant="hasDashboardDegraded ? 'warning' : 'success'"
          effect="plain"
          :round="true"
        >
          {{ hasDashboardDegraded ? '部分降级' : '接口数据' }}
        </Tag>
        <span class="status-summary">{{ dashboardDataSummary }}</span>
      </div>
      <div class="status-items">
        <span>概览：{{ dashboardOverviewSourceLabel }}</span>
        <span>今日码字：{{ dashboardTodayWordsSourceLabel }}</span>
      </div>
    </div>

    <div class="main-content-grid">
      <!-- 左侧主要区域 -->
      <div class="left-pane">
        <!-- 3. 快捷操作 -->
        <Card class="section-card quick-actions" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title"> <QyIcon name="Lightning" /> 快捷操作 </span>
            </div>
          </template>
          <div class="action-grid">
            <div class="action-item" @click="createProject">
              <div class="icon-box primary"><QyIcon name="Plus" /></div>
              <span>新建作品</span>
            </div>
            <div class="action-item" @click="quickWrite">
              <div class="icon-box success"><QyIcon name="EditPen" /></div>
              <span>快速写作</span>
            </div>
          </div>
        </Card>

        <!-- 4. 最近编辑的项目 -->
        <Card class="section-card recent-projects" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title"> <QyIcon name="Timer" /> 最近编辑 </span>
              <QyButton variant="ghost" size="sm" @click="goToAllProjects">
                全部项目 <QyIcon name="ArrowRight" />
              </QyButton>
            </div>
          </template>

          <div v-if="loadingProjects" class="loading-skeleton">
            <Skeleton :rows="3" animated />
          </div>

          <Empty
            v-else-if="recentProjects.length === 0"
            description="暂无最近编辑的项目"
            iconSize="medium"
          />

          <div v-else class="project-list">
            <div
              v-for="project in recentProjects"
              :key="project.id"
              class="project-list-item"
              @click="openProject(project.id)"
            >
              <div class="item-cover" :style="getCoverStyle(project.title)">
                <Image
                  v-if="project.coverImage"
                  :src="project.coverImage"
                  fit="cover"
                  class="cover-img"
                />
                <span v-else class="cover-text">{{ project.title.charAt(0) }}</span>
              </div>

              <div class="item-content">
                <div class="item-header">
                  <h4 class="item-title">{{ project.title }}</h4>
                  <Tag
                    size="sm"
                    :variant="getStatusType(project.status)"
                    effect="plain"
                    :round="true"
                  >
                    {{ getStatusText(project.status) }}
                  </Tag>
                </div>
                <div class="item-meta">
                  <span
                    ><QyIcon name="Document" /> {{ formatNumber(project.totalWords ?? 0) }} 字</span
                  >
                  <Divider direction="vertical" />
                  <span
                    ><QyIcon name="Clock" />
                    {{ formatTime(project.lastUpdateTime || project.updatedAt || '') }}</span
                  >
                </div>
              </div>

              <QyButton variant="ghost" class="enter-btn" icon="ArrowRight" />
            </div>
          </div>
        </Card>
      </div>

      <!-- 右侧辅助区域 -->
      <div class="right-pane">
        <!-- 5. 今日目标 -->
        <Card class="section-card writing-goal" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title"> <QyIcon name="Trophy" /> 今日目标 </span>
              <QyButton variant="ghost" size="sm" @click="editGoal">设置</QyButton>
            </div>
          </template>

          <div class="goal-content">
            <QyProgress type="circle" :percentage="goalPercentage" :color="goalColor" :width="140">
              <template #default>
                <span class="progress-value">{{ goalPercentage }}%</span>
                <span class="progress-label">完成度</span>
              </template>
            </QyProgress>

            <div class="goal-stats">
              <div class="stat-row">
                <span class="label">今日新增</span>
                <span class="val highlight">{{ stats.todayWords }}</span>
              </div>
              <div class="stat-row">
                <span class="label">目标字数</span>
                <span class="val">{{ writingGoal }}</span>
              </div>
            </div>
          </div>

          <div class="goal-message" v-if="goalPercentage >= 100">🎉 太棒了！今日目标已达成！</div>
        </Card>

        <!-- 6. 每日灵感 (新增) -->
        <Card class="section-card daily-quote" shadow="hover">
          <div class="quote-content">
            <QyIcon name="ChatDotRound" class="quote-icon" />
            <p class="quote-text">写作就是把原本不存在的事物变成存在。</p>
            <p class="quote-author">—— 佚名</p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { ProjectSummary } from '@/modules/writer/api/project'
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { getTodayWordsStats, getDashboardOverview } from '@/modules/writer/api/dashboard'
import { getGlobalTodayWords } from '@/modules/writer/composables/useWritingStats'
import { QyIcon, QyButton, QyProgress, Skeleton } from '@/design-system/components'
import { Tag, type TagVariant, Divider, Image, Empty, Card } from '@/design-system/base'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()

type DashboardOverviewSource = 'api' | 'projects-fallback' | 'unavailable'
type DashboardTodayWordsSource = 'overview' | 'today-api' | 'local-fallback' | 'unavailable'

// 状态
const loadingProjects = ref(false)
const writingGoal = ref(2000)
const userName = computed(() => authStore.user?.nickname || authStore.user?.username || '作家')
const dashboardDataState = reactive<{
  overviewSource: DashboardOverviewSource
  todayWordsSource: DashboardTodayWordsSource
}>({
  overviewSource: 'unavailable',
  todayWordsSource: 'unavailable',
})

// 统计数据
const stats = ref({
  totalWords: 0,
  bookCount: 0,
  todayWords: 0, // 需要后端支持今日新增接口
  pending: 0,
})

// 统计卡片配置
const statCards = computed(() => [
  {
    label: '总字数',
    value: stats.value.totalWords,
    iconName: 'Document',
    iconColor: '#409eff',
    bgColor: 'rgba(64, 158, 255, 0.1)',
  },
  {
    label: '作品数',
    value: stats.value.bookCount,
    iconName: 'Reading',
    iconColor: '#67c23a',
    bgColor: 'rgba(103, 194, 58, 0.1)',
  },
  {
    label: '今日码字',
    value: stats.value.todayWords,
    iconName: 'EditPen',
    iconColor: '#e6a23c',
    bgColor: 'rgba(230, 162, 60, 0.1)',
  },
  {
    label: '连载中',
    value: stats.value.pending,
    iconName: 'Clock',
    iconColor: '#f56c6c',
    bgColor: 'rgba(245, 108, 108, 0.1)',
  },
])

// 目标进度
const goalPercentage = computed(() => {
  if (writingGoal.value === 0) return 100
  return Math.min(Math.round((stats.value.todayWords / writingGoal.value) * 100), 100)
})

const goalColor = computed(() => {
  if (goalPercentage.value >= 100) return '#67c23a'
  if (goalPercentage.value >= 60) return '#e6a23c'
  return '#f56c6c'
})

// 获取最近项目
const recentProjects = computed(() => (projectStore.projects || []).slice(0, 5)) // 假设 Store 已按时间排序

const hasDashboardDegraded = computed(
  () =>
    dashboardDataState.overviewSource !== 'api' ||
    dashboardDataState.todayWordsSource === 'local-fallback',
)

const dashboardOverviewSourceLabel = computed(() => {
  if (dashboardDataState.overviewSource === 'api') return '后端统计接口'
  if (dashboardDataState.overviewSource === 'projects-fallback') return '项目列表本地汇总'
  return '暂无可用数据'
})

const dashboardTodayWordsSourceLabel = computed(() => {
  if (dashboardDataState.todayWordsSource === 'overview') return '仪表盘统计接口'
  if (dashboardDataState.todayWordsSource === 'today-api') return '今日字数接口'
  if (dashboardDataState.todayWordsSource === 'local-fallback') return '本地写作记录估算'
  return '暂无可用数据'
})

const dashboardDataSummary = computed(() => {
  if (!hasDashboardDegraded.value) {
    return '当前卡片数据已直接使用作者侧真实统计接口。'
  }
  const messages: string[] = []
  if (dashboardDataState.overviewSource === 'projects-fallback') {
    messages.push('概览卡片已降级为项目列表汇总')
  }
  if (dashboardDataState.todayWordsSource === 'local-fallback') {
    messages.push('今日码字已降级为本地写作记录估算')
  }
  if (messages.length === 0) {
    messages.push('当前部分统计暂不可用')
  }
  return messages.join('；')
})

// 初始化加载
onMounted(async () => {
  loadingProjects.value = true
  try {
    // 尝试使用 dashboard overview API 获取统计数据
    let overviewLoaded = false
    try {
      const overview = await getDashboardOverview()
      if (overview && typeof overview.totalProjects === 'number') {
        stats.value.totalWords = overview.totalWords || 0
        stats.value.bookCount = overview.totalProjects || 0
        stats.value.todayWords = overview.todayWords || 0
        stats.value.pending = overview.activeProjects || 0
        overviewLoaded = true
        dashboardDataState.overviewSource = 'api'
        if (stats.value.todayWords > 0) {
          dashboardDataState.todayWordsSource = 'overview'
        }
      }
    } catch {
      // dashboard overview API 不可用，使用项目列表计算
    }

    // 并行加载项目列表
    await projectStore.loadList({ page: 1, pageSize: 5 })

    if (!overviewLoaded) {
      // 更新统计：从项目列表计算
      stats.value.bookCount = projectStore.total
      const projects = projectStore.projects || []
      stats.value.totalWords = projects.reduce((acc: number, cur: ProjectSummary) => {
        return acc + (cur.totalWords ?? cur.wordCount ?? 0)
      }, 0)
      stats.value.pending = projects.filter(
        (p: ProjectSummary) => p.status === 'serializing',
      ).length
      dashboardDataState.overviewSource = projects.length > 0 ? 'projects-fallback' : 'unavailable'
    }

    // 今日码字：后端API优先，无则前端本地计算
    if (!stats.value.todayWords) {
      try {
        const todayStats = await getTodayWordsStats()
        if (todayStats && todayStats.todayWords > 0) {
          stats.value.todayWords = todayStats.todayWords
          dashboardDataState.todayWordsSource = 'today-api'
        } else {
          // 后端无数据，使用本地计算
          stats.value.todayWords = getGlobalTodayWords()
          dashboardDataState.todayWordsSource = 'local-fallback'
        }
      } catch {
        // API 调用失败，使用本地计算
        stats.value.todayWords = getGlobalTodayWords()
        dashboardDataState.todayWordsSource = 'local-fallback'
      }
    } else if (dashboardDataState.todayWordsSource === 'unavailable') {
      dashboardDataState.todayWordsSource = 'overview'
    }
  } catch (error) {
    console.error('[WriterDashboard] 加载项目列表失败:', error)
  } finally {
    loadingProjects.value = false
  }
})

// 辅助函数
const formatNumber = (n: number) => (n >= 10000 ? (n / 10000).toFixed(1) + 'w' : n)
const formatTime = (t: string) => (t ? dayjs(t).fromNow() : '未知时间')

const getStatusType = (status: string): TagVariant => {
  const map: Record<string, TagVariant> = {
    draft: 'info',
    serializing: 'primary',
    completed: 'success',
    suspended: 'danger',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    serializing: '连载',
    completed: '完结',
    suspended: '断更',
  }
  return map[status] || status
}

const getCoverStyle = (title: string) => {
  const colors = ['#a0cfff', '#b3e19d', '#f3d19e', '#fab6b6']
  const idx = title.length % colors.length
  return { backgroundColor: colors[idx] }
}

// 导航动作
const createProject = () => router.push({ name: 'writer-projects', query: { action: 'create' } })
const quickWrite = () => {
  if (recentProjects.value.length > 0) {
    openProject(recentProjects.value[0].id)
  } else {
    createProject()
  }
}
const goToAllProjects = () => router.push({ name: 'writer-projects' })
const openProject = (id: string) =>
  router.push({ name: 'writer-project', params: { projectId: id } })
const editGoal = () => {
  /* 打开 Dialog 修改 goal */
}
</script>

<style scoped lang="scss">
.writer-dashboard {
  --card-radius: 14px;
  padding: clamp(16px, 2vw, 24px);
  max-width: 1320px;
  margin: 0 auto;
  background-color: var(--el-bg-color-page);
}

// 1. 头部
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;

  .title {
    font-size: 28px;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
  }

  .subtitle {
    color: var(--el-text-color-secondary);

    .username {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
}

// 2. 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--card-radius);
    background: linear-gradient(
      160deg,
      var(--el-bg-color) 0%,
      var(--el-fill-color-extra-light) 100%
    );
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(16, 24, 40, 0.08);
    }

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
    }
  }
}

.data-status-banner {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: -8px 0 24px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.18);
  background: rgba(240, 253, 244, 0.9);

  &.is-degraded {
    border-color: rgba(245, 158, 11, 0.28);
    background: rgba(255, 251, 235, 0.94);
  }

  .status-main,
  .status-items {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .status-summary,
  .status-items {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
}

// 通用卡片样式
.section-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--card-radius);
  box-shadow: 0 4px 16px rgba(16, 24, 40, 0.04);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
  }

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-card__body) {
    padding: 18px 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.main-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 1fr);
  gap: 20px;
  align-items: start;
}

.left-pane,
.right-pane {
  display: grid;
  gap: 20px;
}

// 3. 快捷操作
.quick-actions {
  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 16px;
    padding: 4px 0;
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 16px;
    border-radius: 10px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-border-color);
      transform: translateY(-2px);
    }

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      font-size: 24px;

      &.primary {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &.success {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.warning {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
      }

      &.info {
        background: var(--el-color-info-light-9);
        color: var(--el-color-info);
      }
    }

    span {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}

// 4. 最近项目列表
.project-list {
  display: grid;
  gap: 10px;

  .project-list-item {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--el-border-color-lighter);

    &:hover {
      background-color: var(--el-fill-color-extra-light);
      border-color: var(--el-border-color);
    }

    .item-cover {
      width: 48px;
      height: 64px;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      color: #fff;
      font-weight: bold;
      font-size: 20px;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;
      min-width: 0; // 防止溢出

      .item-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;

        .item-title {
          margin: 0;
          font-size: 15px;
          color: var(--el-text-color-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .item-meta {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .enter-btn {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .enter-btn {
      opacity: 1;
    }
  }
}

// 5. 今日目标
.writing-goal {
  :deep(.el-card__body) {
    padding-top: 16px;
  }

  .goal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
  }

  .progress-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }

  .progress-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .goal-stats {
    width: 100%;
    margin-top: 24px;

    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;

      .label {
        color: var(--el-text-color-regular);
      }

      .val {
        font-weight: 500;
      }

      .highlight {
        color: var(--el-color-primary);
        font-weight: bold;
      }
    }
  }

  .goal-message {
    margin-top: 16px;
    text-align: center;
    font-size: 13px;
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
    padding: 8px;
    border-radius: 4px;
  }
}

// 6. 每日灵感
.daily-quote {
  background: linear-gradient(
    140deg,
    var(--el-color-primary-light-9) 0%,
    var(--el-bg-color) 58%,
    var(--el-color-info-light-9) 100%
  );

  .quote-content {
    position: relative;
    padding: 10px;

    .quote-icon {
      font-size: 24px;
      color: var(--el-color-primary);
      opacity: 0.3;
      position: absolute;
      top: -5px;
      left: -5px;
    }

    .quote-text {
      font-size: 14px;
      line-height: 1.6;
      color: var(--el-text-color-primary);
      font-style: italic;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }

    .quote-author {
      text-align: right;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

// 响应式调整
@media (max-width: 1200px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .data-status-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .quick-actions .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .writer-dashboard {
    padding: 14px;
  }
}
</style>
