<template>
  <Container maxWidth="xl" padding>
    <Section title="AI系统健康检查" spacing="lg">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-info">
          <span class="last-check">最后检查: {{ healthStatus?.lastCheck ? formatDate(healthStatus.lastCheck) : '未检查' }}</span>
        </div>
        <div class="toolbar-actions">
          <el-button :icon="Refresh" @click="loadHealthStatus" :loading="healthLoading">
            刷新
          </el-button>
          <el-button type="primary" :icon="Monitor" @click="triggerCheck" :loading="checking">
            立即检查
          </el-button>
        </div>
      </div>

      <!-- 整体健康状态 -->
      <el-card shadow="hover" class="overall-card">
        <div class="overall-status">
          <div class="status-icon" :class="`status-${overallStatus}`">
            <el-icon :size="64">
              <QyIcon name="CircleCheckFilled" v-if="overallStatus === 'healthy'"  />
              <QyIcon name="WarningFilled" v-else-if="overallStatus === 'degraded'"  />
              <QyIcon name="CircleCloseFilled" v-else  />
            </el-icon>
          </div>
          <div class="status-info">
            <div class="status-title">系统状态</div>
            <div class="status-text" :class="`text-${overallStatus}`">
              {{ getStatusText(overallStatus) }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 提供商健康详情 -->
      <Grid :cols="{ md: 2, sm: 1 }" gap="lg" class="providers-grid">
        <el-card
          v-for="provider in providerHealth"
          :key="provider.provider"
          shadow="hover"
          class="provider-card"
        >
          <div class="provider-header">
            <div class="provider-name">{{ getProviderDisplayName(provider.provider) }}</div>
            <el-tag :type="getHealthStatusType(provider.status)">
              {{ getHealthStatusText(provider.status) }}
            </el-tag>
          </div>

          <div class="provider-metrics">
            <div class="metric">
              <div class="metric-label">响应时间</div>
              <div class="metric-value" :class="getMetricClass('responseTime', provider.responseTime)">
                {{ provider.responseTime }}ms
              </div>
            </div>

            <div class="metric">
              <div class="metric-label">错误率</div>
              <div class="metric-value" :class="getMetricClass('errorRate', provider.errorRate)">
                {{ (provider.errorRate * 100).toFixed(2) }}%
              </div>
            </div>

            <div class="metric">
              <div class="metric-label">可用性</div>
              <div class="metric-value" :class="getMetricClass('uptime', provider.uptime)">
                {{ (provider.uptime * 100).toFixed(2) }}%
              </div>
            </div>
          </div>

          <div v-if="provider.lastError" class="provider-error">
            <div class="error-label">最近错误:</div>
            <div class="error-message">{{ provider.lastError }}</div>
          </div>
        </el-card>
      </Grid>
    </Section>

    <LoadingOverlay :visible="pageLoading" text="加载中..." />
  </Container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from '@/design-system/services'
import { useAIAdminStore } from '../stores/aiAdmin'
import { Container, Section, Grid, LoadingOverlay } from '@/shared/components/design-system'
import { QyIcon } from '@/design-system/components'
import { Refresh, Monitor } from '@element-plus/icons-vue'

const aiStore = useAIAdminStore()

// 状态
const pageLoading = ref(false)
const healthLoading = computed(() => aiStore.healthLoading)
const checking = ref(false)

// 计算属性
const healthStatus = computed(() => aiStore.healthStatus)
const overallStatus = computed(() => healthStatus.value?.overall || 'unknown')
const providerHealth = computed(() => healthStatus.value?.providers || [])
const providers = computed(() => aiStore.providers)

// 格式化函数
function formatDate(date: string): string {
  return new Date(date).toLocaleString('zh-CN')
}

function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    healthy: '系统正常',
    degraded: '性能降级',
    down: '系统异常',
    unknown: '未知状态'
  }
  return textMap[status] || status
}

function getProviderDisplayName(providerName: string): string {
  const provider = providers.value.find(p => p.name === providerName)
  return provider?.displayName || providerName
}

function getHealthStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    healthy: 'success',
    degraded: 'warning',
    down: 'danger'
  }
  return typeMap[status] || 'info'
}

function getHealthStatusText(status: string): string {
  const textMap: Record<string, string> = {
    healthy: '正常',
    degraded: '降级',
    down: '异常'
  }
  return textMap[status] || status
}

function getMetricClass(metric: string, value: number): string {
  if (metric === 'responseTime') {
    return value < 500 ? 'metric-good' : value < 1000 ? 'metric-warning' : 'metric-error'
  }
  if (metric === 'errorRate') {
    return value < 0.01 ? 'metric-good' : value < 0.05 ? 'metric-warning' : 'metric-error'
  }
  if (metric === 'uptime') {
    return value > 0.99 ? 'metric-good' : value > 0.95 ? 'metric-warning' : 'metric-error'
  }
  return ''
}

// 加载健康状态
async function loadHealthStatus() {
  await aiStore.loadHealthStatus()
}

// 触发检查
async function triggerCheck() {
  checking.value = true
  try {
    await aiStore.triggerHealthCheck()
    message.success('健康检查完成')
  } catch (error: any) {
    message.error(error.message || '健康检查失败')
  } finally {
    checking.value = false
  }
}

// 初始化
onMounted(async () => {
  pageLoading.value = true
  try {
    await Promise.all([
      aiStore.loadProviders(),
      loadHealthStatus()
    ])
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.toolbar-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.last-check {
  font-size: 0.875rem;
  color: #757575;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
}

.overall-card {
  margin-bottom: 1.5rem;
}

.overall-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  &.status-healthy {
    color: #4caf50;
  }

  &.status-degraded {
    color: #ff9800;
  }

  &.status-down {
    color: #f44336;
  }

  &.status-unknown {
    color: #9e9e9e;
  }
}

.status-info {
  text-align: center;
}

.status-title {
  font-size: 0.875rem;
  color: #757575;
  margin-bottom: 0.5rem;
}

.status-text {
  font-size: 2rem;
  font-weight: 700;

  &.text-healthy {
    color: #4caf50;
  }

  &.text-degraded {
    color: #ff9800;
  }

  &.text-down {
    color: #f44336;
  }

  &.text-unknown {
    color: #9e9e9e;
  }
}

.providers-grid {
  margin-top: 1.5rem;
}

.provider-card {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.provider-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #212121;
}

.provider-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.metric {
  text-align: center;
}

.metric-label {
  font-size: 0.75rem;
  color: #757575;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 600;

  &.metric-good {
    color: #4caf50;
  }

  &.metric-warning {
    color: #ff9800;
  }

  &.metric-error {
    color: #f44336;
  }
}

.provider-error {
  padding: 0.75rem;
  background-color: #ffebee;
  border-radius: 4px;
}

.error-label {
  font-size: 0.75rem;
  color: #d32f2f;
  margin-bottom: 0.25rem;
}

.error-message {
  font-size: 0.875rem;
  color: #c62828;
}

@media (max-width: 768px) {
  .overall-status {
    flex-direction: column;
    gap: 1rem;
  }

  .provider-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
