<template>
  <div class="mx-auto max-w-[1440px] space-y-6">
    <section
      class="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.16),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f0fdf4_100%)] p-7 shadow-[0_26px_80px_rgba(15,23,42,0.08)]"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Quota Report
          </p>
          <h2 class="mt-3 text-3xl font-black text-slate-900">消耗报表</h2>
          <p class="mt-2 text-sm text-slate-500">
            输出趋势、结构和重点账号，支撑策略调整与异常复盘。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <el-segmented v-model="days" :options="dayOptions" />
          <el-button :loading="loading" @click="loadReport">刷新</el-button>
          <el-button type="primary" @click="exportCsv">导出 CSV</el-button>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Consumption
        </div>
        <div class="mt-3 text-3xl font-black text-slate-900">
          {{ formatNumber(summary.totalConsumption) }}
        </div>
        <div class="mt-2 text-sm text-slate-500">累计真实 Token 消耗</div>
      </article>
      <article
        class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Avg/User</div>
        <div class="mt-3 text-3xl font-black text-slate-900">
          {{ formatNumber(summary.avgConsumption) }}
        </div>
        <div class="mt-2 text-sm text-slate-500">人均消耗</div>
      </article>
      <article
        class="rounded-[28px] border border-amber-100 bg-amber-50/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Near Exhaust
        </div>
        <div class="mt-3 text-3xl font-black text-amber-700">
          {{ formatNumber(summary.nearExhaustUsers) }}
        </div>
        <div class="mt-2 text-sm text-amber-600">临近耗尽用户</div>
      </article>
      <article
        class="rounded-[28px] border border-rose-100 bg-rose-50/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">Exhausted</div>
        <div class="mt-3 text-3xl font-black text-rose-700">
          {{ formatNumber(summary.exhaustedUsers) }}
        </div>
        <div class="mt-2 text-sm text-rose-600">已耗尽用户</div>
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.55fr_0.95fr]">
      <article
        class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">每日消耗趋势</h3>
            <p class="text-sm text-slate-500">柱状 + 折线，观察消耗与活跃用户同步变化</p>
          </div>
          <el-tag effect="plain">近 {{ days }} 天</el-tag>
        </div>
        <QuotaTrendChart :points="trendData" mode="report" height="360px" />
      </article>

      <article
        class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">角色分布</h3>
            <p class="text-sm text-slate-500">当前采用仪表板聚合结果</p>
          </div>
          <el-button
            text
            @click="distributionMode = distributionMode === 'role' ? 'service' : 'role'"
          >
            切换到{{ distributionMode === 'role' ? '服务' : '角色' }}
          </el-button>
        </div>
        <QuotaDistributionChart :data="distributionSource" height="360px" />
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <article
        class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">高消耗用户排行</h3>
            <p class="text-sm text-slate-500">当前配额周期内的高消耗用户</p>
          </div>
          <el-button text @click="goToUsers">去用户列表</el-button>
        </div>
        <div
          v-if="topConsumers.length === 0"
          class="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400"
        >
          暂无排行数据
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(user, index) in topConsumers"
            :key="user.userId"
            class="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-4 md:grid-cols-[56px_1fr_140px_110px]"
          >
            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white"
            >
              {{ index + 1 }}
            </div>
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold text-slate-900">
                {{ user.username || user.userId }}
              </div>
              <div class="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{{ user.userId }}</span>
                <span>{{ user.role || 'unknown' }}</span>
              </div>
            </div>
            <div class="self-center">
              <el-progress :percentage="clampPercent(user.usagePercent)" :stroke-width="10" />
            </div>
            <div class="self-center text-right">
              <div class="text-sm font-semibold text-slate-900">
                {{ formatNumber(user.usedQuota) }}
              </div>
              <div class="text-xs text-slate-500">/ {{ formatNumber(user.totalQuota) }}</div>
            </div>
          </div>
        </div>
      </article>

      <article
        class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">状态分布</h3>
            <p class="text-sm text-slate-500">按账户当前配额状态聚合</p>
          </div>
          <el-tag type="warning" effect="plain">运营视图</el-tag>
        </div>
        <QuotaDistributionChart :data="distribution.byStatus" type="bar" height="360px" />
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import {
  getQuotaDashboard,
  getQuotaGlobalStatistics,
  getQuotaTrend,
  type QuotaDashboard,
  type QuotaTopConsumer,
  type QuotaTrendPoint,
} from '@/api/admin/quota'
import QuotaDistributionChart from '../components/quota/QuotaDistributionChart.vue'
import QuotaTrendChart from '../components/quota/QuotaTrendChart.vue'

const router = useRouter()
const loading = ref(false)
const days = ref(7)
const distributionMode = ref<'role' | 'service'>('role')
const summary = ref<QuotaDashboard['summary']>({
  totalUsers: 0,
  activeUsers: 0,
  exhaustedUsers: 0,
  nearExhaustUsers: 0,
  suspendedUsers: 0,
  totalConsumption: 0,
  avgConsumption: 0,
})
const distribution = ref<QuotaDashboard['distribution']>({
  byRole: {},
  byLevel: {},
  byService: {},
  byStatus: {},
})
const topConsumers = ref<QuotaTopConsumer[]>([])
const trendData = ref<QuotaTrendPoint[]>([])

const dayOptions = [
  { label: '7 天', value: 7 },
  { label: '30 天', value: 30 },
  { label: '90 天', value: 90 },
]

const distributionSource = computed(() =>
  distributionMode.value === 'role' ? distribution.value.byRole : distribution.value.byService,
)

const formatNumber = (value: number) => Number(value || 0).toLocaleString('zh-CN')
const clampPercent = (value: number) => Math.max(0, Math.min(100, Number(value || 0)))

const loadReport = async () => {
  loading.value = true
  try {
    const [stats, dashboard, trend] = await Promise.all([
      getQuotaGlobalStatistics(),
      getQuotaDashboard(),
      getQuotaTrend(days.value),
    ])
    summary.value = stats
    distribution.value = dashboard.distribution
    topConsumers.value = dashboard.topConsumers ?? []
    trendData.value = trend.length > 0 ? trend : (dashboard.trendData ?? [])
  } catch (error) {
    console.error('加载 quota report 失败:', error)
    message.error('加载消耗报表失败')
  } finally {
    loading.value = false
  }
}

const exportCsv = () => {
  const header = ['date', 'consumption', 'users']
  const rows = trendData.value.map((item) => [item.date, item.consumption, item.users])
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).split('"').join('""')}"`).join(','))
    .join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `quota-report-${days.value}d.csv`
  link.click()
  URL.revokeObjectURL(url)
  message.success('CSV 已导出')
}

const goToUsers = () => {
  router.push('/admin/quota/users')
}

watch(days, () => {
  void loadReport()
})

onMounted(() => {
  void loadReport()
})
</script>
