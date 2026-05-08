<template>
  <div class="mx-auto max-w-[1440px] space-y-6">
    <section
      class="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(225,29,72,0.12),_transparent_32%),linear-gradient(180deg,_#ffffff_0%,_#fff7ed_100%)] p-7 shadow-[0_26px_80px_rgba(15,23,42,0.08)]"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Alert Center
          </p>
          <h2 class="mt-3 text-3xl font-black text-slate-900">预警中心</h2>
          <p class="mt-2 text-sm text-slate-500">
            集中处理阈值、异常与一致性告警，降低配额事故响应时间。
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <el-button :loading="batchSubmitting" @click="loadAlerts">刷新</el-button>
          <el-button
            type="primary"
            :disabled="pendingAlertIds.length === 0"
            :loading="batchSubmitting"
            @click="handleBulkAcknowledge"
          >
            全部确认
          </el-button>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pending</div>
        <div class="mt-3 text-3xl font-black text-slate-900">{{ pendingCount }}</div>
        <div class="mt-2 text-sm text-slate-500">待处理预警</div>
      </article>
      <article
        class="rounded-[28px] border border-rose-100 bg-rose-50/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">Critical</div>
        <div class="mt-3 text-3xl font-black text-rose-700">{{ criticalCount }}</div>
        <div class="mt-2 text-sm text-rose-600">严重级别</div>
      </article>
      <article
        class="rounded-[28px] border border-amber-100 bg-amber-50/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Warning</div>
        <div class="mt-3 text-3xl font-black text-amber-700">{{ warningCount }}</div>
        <div class="mt-2 text-sm text-amber-600">告警级别</div>
      </article>
      <article
        class="rounded-[28px] border border-sky-100 bg-sky-50/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Window</div>
        <div class="mt-3 text-3xl font-black text-slate-900">{{ pagination.total }}</div>
        <div class="mt-2 text-sm text-slate-500">当前筛选命中总数</div>
      </article>
    </section>

    <section
      class="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
    >
      <div class="grid gap-3 md:grid-cols-[180px_180px_180px_120px]">
        <el-select v-model="filters.type" clearable placeholder="全部类型">
          <el-option label="阈值" value="threshold" />
          <el-option label="异常" value="anomaly" />
          <el-option label="滥用" value="abuse" />
          <el-option label="一致性" value="consistency" />
        </el-select>
        <el-select v-model="filters.level" clearable placeholder="全部级别">
          <el-option label="严重" value="critical" />
          <el-option label="警告" value="warning" />
          <el-option label="信息" value="info" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态筛选">
          <el-option label="未关闭" value="open" />
          <el-option label="全部状态" value="all" />
          <el-option label="待处理" value="pending" />
          <el-option label="已确认" value="acknowledged" />
          <el-option label="已解决" value="resolved" />
          <el-option label="已忽略" value="ignored" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="handleSearch">筛选</el-button>
      </div>
    </section>

    <section class="space-y-4">
      <article
        v-for="alert in alerts"
        :key="alert.id"
        class="rounded-[30px] border p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
        :class="alertShellClass(alert)"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <el-tag :type="tagType(alert.level)" effect="dark">{{ alert.level }}</el-tag>
              <el-tag :type="typeTag(alert.type)" effect="plain">{{ alert.type }}</el-tag>
              <el-tag effect="plain">{{ alert.status }}</el-tag>
            </div>
            <h3 class="mt-4 text-lg font-bold text-slate-900">{{ alert.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ alert.message }}</p>
            <div class="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>预警ID：{{ alert.id }}</span>
              <span>用户：{{ alert.userId || '全局' }}</span>
              <span>创建时间：{{ formatDate(alert.createdAt) }}</span>
              <span v-if="alert.resolvedAt">处理时间：{{ formatDate(alert.resolvedAt) }}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <el-button
              v-if="alert.status === 'pending'"
              :loading="actionLoadingId === `${alert.id}:ack`"
              @click="handleAction(alert.id, 'acknowledge')"
            >
              确认
            </el-button>
            <el-button
              v-if="alert.status !== 'resolved'"
              type="success"
              :loading="actionLoadingId === `${alert.id}:resolve`"
              @click="handleAction(alert.id, 'resolve')"
            >
              解决
            </el-button>
            <el-button
              v-if="alert.status !== 'ignored'"
              type="warning"
              :loading="actionLoadingId === `${alert.id}:ignore`"
              @click="handleAction(alert.id, 'ignore')"
            >
              忽略
            </el-button>
          </div>
        </div>
      </article>

      <article
        v-if="alerts.length === 0"
        class="rounded-[30px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400"
      >
        当前筛选条件下没有预警记录
      </article>
    </section>

    <section class="flex justify-end">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :current-page="pagination.page"
        :page-size="pagination.size"
        :total="pagination.total"
        @current-change="handlePageChange"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import {
  acknowledgeQuotaAlert,
  ignoreQuotaAlert,
  listQuotaAlerts,
  resolveQuotaAlert,
  type QuotaAlert,
  type QuotaAlertStatusFilter,
} from '@/api/admin/quota'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const batchSubmitting = ref(false)
const actionLoadingId = ref('')
const alerts = ref<QuotaAlert[]>([])
const syncingRoute = ref(false)

const allowedStatusFilters: QuotaAlertStatusFilter[] = [
  'open',
  'all',
  'pending',
  'acknowledged',
  'resolved',
  'ignored',
]

const filters = reactive({
  type: '',
  level: '',
  status: 'open' as QuotaAlertStatusFilter,
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
})

const pendingCount = computed(() => alerts.value.filter((item) => item.status === 'pending').length)
const criticalCount = computed(
  () => alerts.value.filter((item) => item.level === 'critical').length,
)
const warningCount = computed(() => alerts.value.filter((item) => item.level === 'warning').length)
const pendingAlertIds = computed(() =>
  alerts.value.filter((item) => item.status === 'pending').map((item) => item.id),
)

const formatDate = (value?: string) => {
  if (!value) return '未提供'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

const tagType = (level: string) => {
  if (level === 'critical') return 'danger'
  if (level === 'warning') return 'warning'
  return 'info'
}

const typeTag = (type: string) => {
  if (type === 'abuse') return 'danger'
  if (type === 'consistency') return 'warning'
  if (type === 'anomaly') return 'success'
  return 'info'
}

const alertShellClass = (alert: QuotaAlert) => {
  if (alert.level === 'critical') return 'border-rose-100 bg-rose-50/60'
  if (alert.level === 'warning') return 'border-amber-100 bg-amber-50/60'
  return 'border-sky-100 bg-sky-50/60'
}

const readQueryString = (value: unknown) => (typeof value === 'string' ? value : '')

const normalizeStatusFilter = (value: unknown): QuotaAlertStatusFilter => {
  const candidate = readQueryString(value) as QuotaAlertStatusFilter
  return allowedStatusFilters.includes(candidate) ? candidate : 'open'
}

const normalizePage = (value: unknown) => {
  const candidate = Number.parseInt(readQueryString(value), 10)
  return Number.isFinite(candidate) && candidate > 0 ? candidate : 1
}

const applyStateFromRoute = () => {
  filters.type = readQueryString(route.query.type)
  filters.level = readQueryString(route.query.level)
  filters.status = normalizeStatusFilter(route.query.status)
  pagination.page = normalizePage(route.query.page)
}

const buildManagedQuery = (): LocationQueryRaw => {
  const query: LocationQueryRaw = {
    status: filters.status,
  }
  if (filters.type) query.type = filters.type
  if (filters.level) query.level = filters.level
  if (pagination.page > 1) query.page = String(pagination.page)
  return query
}

const syncRouteQuery = async () => {
  const nextQuery: LocationQueryRaw = { ...route.query }
  delete nextQuery.type
  delete nextQuery.level
  delete nextQuery.status
  delete nextQuery.page
  Object.assign(nextQuery, buildManagedQuery())

  const currentQuery = JSON.stringify(route.query)
  const targetQuery = JSON.stringify(nextQuery)
  if (currentQuery === targetQuery) {
    return
  }

  syncingRoute.value = true
  try {
    await router.replace({ query: nextQuery })
  } finally {
    syncingRoute.value = false
  }
}

const loadAlerts = async () => {
  loading.value = true
  try {
    const result = await listQuotaAlerts({
      page: pagination.page,
      limit: pagination.size,
      type: filters.type || undefined,
      level: filters.level || undefined,
      status: filters.status,
    })
    alerts.value = result.items
    pagination.total = result.total
  } catch (error) {
    console.error('加载 quota alerts 失败:', error)
    alerts.value = []
    pagination.total = 0
    message.error('加载预警列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  pagination.page = 1
  await syncRouteQuery()
  await loadAlerts()
}

const handlePageChange = async (page: number) => {
  pagination.page = page
  await syncRouteQuery()
  await loadAlerts()
}

const handleAction = async (id: string, action: 'acknowledge' | 'resolve' | 'ignore') => {
  actionLoadingId.value = `${id}:${action === 'acknowledge' ? 'ack' : action}`
  try {
    if (action === 'acknowledge') {
      await acknowledgeQuotaAlert(id)
    } else if (action === 'resolve') {
      await resolveQuotaAlert(id)
    } else {
      await ignoreQuotaAlert(id)
    }
    message.success('预警状态已更新')
    await loadAlerts()
  } catch (error) {
    console.error('更新预警状态失败:', error)
    message.error('更新预警状态失败')
  } finally {
    actionLoadingId.value = ''
  }
}

const handleBulkAcknowledge = async () => {
  if (pendingAlertIds.value.length === 0) return
  try {
    await messageBox.confirm(
      `确认将当前页 ${pendingAlertIds.value.length} 条待处理预警批量标记为已确认？`,
      '批量确认预警',
      { type: 'warning' },
    )
    batchSubmitting.value = true
    for (const id of pendingAlertIds.value) {
      await acknowledgeQuotaAlert(id)
    }
    message.success('当前页待处理预警已全部确认')
    await loadAlerts()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量确认预警失败:', error)
      message.error('批量确认预警失败')
    }
  } finally {
    batchSubmitting.value = false
  }
}

onMounted(() => {
  void (async () => {
    applyStateFromRoute()
    await syncRouteQuery()
    await loadAlerts()
  })()
})

watch(
  () => route.query,
  () => {
    if (syncingRoute.value) {
      return
    }
    applyStateFromRoute()
    void loadAlerts()
  },
)
</script>
