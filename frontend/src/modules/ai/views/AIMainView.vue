<template>
  <Container maxWidth="xl" padding>
    <Section title="AI系统管理" spacing="lg">
      <!-- 页面头部操作 -->
      <template #extra>
        <div class="header-actions">
          <el-button :icon="Refresh" @click="refreshData" :loading="refreshing">
            刷新数据
          </el-button>
          <el-button type="primary" :icon="Plus" @click="goToProviders">
            添加提供商
          </el-button>
        </div>
      </template>

      <!-- 统计卡片 -->
      <Grid :cols="{ md: 4, sm: 2 }" gap="lg" class="stats-grid">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon providers-icon">
              <el-icon :size="32"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">AI提供商</div>
              <div class="stat-value">{{ systemStats?.totalProviders || 0 }}</div>
              <div class="stat-sub">
                活跃: {{ systemStats?.activeProviders || 0 }}
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon models-icon">
              <el-icon :size="32"><Cpu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">AI模型</div>
              <div class="stat-value">{{ systemStats?.totalModels || 0 }}</div>
              <div class="stat-sub">
                活跃: {{ systemStats?.activeModels || 0 }}
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon requests-icon">
              <el-icon :size="32"><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">今日请求</div>
              <div class="stat-value">{{ formatNumber(systemStats?.todayRequests || 0) }}</div>
              <div class="stat-sub">
                费用: ¥{{ formatMoney(systemStats?.todayCost || 0) }}
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :class="healthIconClass">
              <el-icon :size="32"><QyIcon name="CircleCheckFilled" v-if="overallHealthStatus === 'healthy'"  /><QyIcon name="WarningFilled" v-else  /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">系统状态</div>
              <div class="stat-value" :class="healthTextClass">
                {{ healthText }}
              </div>
              <div class="stat-sub">
                响应: {{ systemStats?.avgResponseTime || 0 }}ms
              </div>
            </div>
          </div>
        </el-card>
      </Grid>

      <!-- 提供商状态列表 -->
      <el-card shadow="hover" class="providers-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">提供商状态</span>
            <el-button text type="primary" @click="goToProviders">
              查看全部 <QyIcon name="ArrowRight"  />
            </el-button>
          </div>
        </template>

        <div v-loading="providersLoading" class="providers-list">
          <el-empty v-if="providers.length === 0 && !providersLoading" description="暂无提供商" />

          <div
            v-for="provider in providers.slice(0, 5)"
            :key="provider.id"
            class="provider-item"
            @click="goToProviderDetail(provider.id)"
          >
            <div class="provider-info">
              <div class="provider-name">{{ provider.displayName }}</div>
              <div class="provider-meta">
                <el-tag :type="getProviderStatusType(provider.status)" size="small">
                  {{ getProviderStatusText(provider.status) }}
                </el-tag>
                <span class="provider-models">{{ provider.modelCount }} 个模型</span>
              </div>
            </div>
            <el-icon class="provider-arrow"><QyIcon name="ArrowRight"  /></el-icon>
          </div>
        </div>
      </el-card>

      <!-- 最近活动 -->
      <el-card shadow="hover" class="activities-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">最近活动</span>
            <el-button text type="primary" @click="refreshActivities">
              刷新
            </el-button>
          </div>
        </template>

        <div v-loading="activitiesLoading" class="activities-list">
          <el-empty v-if="activities.length === 0 && !activitiesLoading" description="暂无活动记录" />

          <div
            v-for="activity in activities"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon" :class="`activity-${activity.type}`">
              <el-icon>
                <QyIcon name="SuccessFilled" v-if="activity.type === 'request'"  />
                <QyIcon name="CircleCloseFilled" v-else-if="activity.type === 'error'"  />
                <QyIcon name="Setting" v-else-if="activity.type === 'config_change'"  />
                <Monitor v-else />
              </el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-message">{{ activity.message }}</div>
              <div class="activity-meta">
                <span v-if="activity.provider" class="activity-provider">{{ activity.provider }}</span>
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </Section>

    <LoadingOverlay :visible="pageLoading" text="加载中..." />
  </Container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAIAdminStore } from '../stores/aiAdmin'
import { Container, Section, Grid, LoadingOverlay } from '@/shared/components/design-system'
import { QyIcon } from '@/design-system/components'
import { Refresh, Plus, OfficeBuilding, Cpu } from '@element-plus/icons-vue'

const router = useRouter()
const aiStore = useAIAdminStore()

// 加载状态
const pageLoading = ref(false)
const refreshing = ref(false)

// 计算属性
const providers = computed(() => aiStore.providers)
const providersLoading = computed(() => aiStore.providersLoading)
const activities = computed(() => aiStore.activities)
const activitiesLoading = computed(() => aiStore.activitiesLoading)
const systemStats = computed(() => aiStore.systemStats)
const overallHealthStatus = computed(() => aiStore.overallHealthStatus)

// 健康状态相关
const healthText = computed(() => {
  const status = overallHealthStatus.value
  if (status === 'healthy') return '正常'
  if (status === 'degraded') return '降级'
  if (status === 'down') return '异常'
  return '未知'
})

const healthTextClass = computed(() => {
  const status = overallHealthStatus.value
  if (status === 'healthy') return 'status-healthy'
  if (status === 'degraded') return 'status-warning'
  if (status === 'down') return 'status-error'
  return ''
})

const healthIconClass = computed(() => {
  const status = overallHealthStatus.value
  if (status === 'healthy') return 'icon-healthy'
  if (status === 'degraded') return 'icon-warning'
  if (status === 'down') return 'icon-error'
  return ''
})

// 格式化函数
function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

function formatMoney(amount: number): string {
  return amount.toFixed(2)
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

function getProviderStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    error: 'danger'
  }
  return typeMap[status] || 'info'
}

function getProviderStatusText(status: string): string {
  const textMap: Record<string, string> = {
    active: '活跃',
    inactive: '未启用',
    error: '错误'
  }
  return textMap[status] || status
}

// 导航方法
function goToProviders() {
  router.push('/admin/ai/providers')
}

function goToProviderDetail(providerId: string) {
  router.push(`/admin/ai/providers/${providerId}`)
}

// 刷新数据
async function refreshData() {
  refreshing.value = true
  try {
    await aiStore.initialize()
  } finally {
    refreshing.value = false
  }
}

async function refreshActivities() {
  await aiStore.loadActivities({ limit: 10 })
}

// 初始化
onMounted(async () => {
  pageLoading.value = true
  try {
    await aiStore.initialize()
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.header-actions {
  display: flex;
  gap: 0.75rem;
}

.stats-grid {
  margin-bottom: 1.5rem;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;

  &.providers-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }

  &.models-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: #fff;
  }

  &.requests-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: #fff;
  }

  &.icon-healthy {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: #fff;
  }

  &.icon-warning {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    color: #fff;
  }

  &.icon-error {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: #fff;
  }
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #757575;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212121;
  margin-bottom: 0.25rem;

  &.status-healthy {
    color: #4caf50;
  }

  &.status-warning {
    color: #ff9800;
  }

  &.status-error {
    color: #f44336;
  }
}

.stat-sub {
  font-size: 0.75rem;
  color: #9e9e9e;
}

.providers-card,
.activities-card {
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #212121;
}

.providers-list,
.activities-list {
  min-height: 200px;
}

.provider-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f5f5f5;
  }
}

.provider-info {
  flex: 1;
}

.provider-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #212121;
  margin-bottom: 0.25rem;
}

.provider-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #757575;
}

.provider-models {
  margin-left: 0.5rem;
}

.provider-arrow {
  color: #9e9e9e;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;

  &.activity-request {
    background-color: #e8f5e9;
    color: #4caf50;
  }

  &.activity-error {
    background-color: #ffebee;
    color: #f44336;
  }

  &.activity-config_change {
    background-color: #e3f2fd;
    color: #2196f3;
  }

  &.activity-health_check {
    background-color: #fff3e0;
    color: #ff9800;
  }
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-size: 0.875rem;
  color: #212121;
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #9e9e9e;
}

.activity-provider {
  color: #2196f3;
}

@media (max-width: 768px) {
  .stats-grid {
    :deep(.qy-grid) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
