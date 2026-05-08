<template>
  <div class="mx-auto max-w-[1440px] space-y-6">
    <section
      class="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-7 shadow-[0_26px_80px_rgba(15,23,42,0.08)]"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Admin Quota
          </p>
          <h2 class="mt-3 text-3xl font-black text-slate-900">AI 配额仪表板</h2>
          <p class="mt-2 text-sm text-slate-500">
            汇总实时消耗、配额风险和跨服务对账结果，供管理员快速处理。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <el-segmented v-model="days" :options="dayOptions" />
          <el-button :loading="reconciliationRunning" @click="runConsistencyCheck">
            立即对账
          </el-button>
          <el-button :loading="loading" @click="loadDashboard">刷新</el-button>
          <el-button type="primary" @click="goTo('/admin/quota/reports')">查看报表</el-button>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <QuotaStatCard
        eyebrow="总览"
        title="纳入配额管理用户"
        :value="formatNumber(summary.totalUsers)"
        subtitle="全量 quota 账户"
        icon="用户"
        clickable
        @click="goTo('/admin/quota/users')"
      />
      <QuotaStatCard
        eyebrow="累计"
        title="Token 消耗"
        :value="formatNumber(summary.totalConsumption)"
        subtitle="基于真实消费流水聚合"
        icon="Tok"
        :accent="'linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%)'"
        :accent-glow="'radial-gradient(circle at top right, rgba(14,165,233,0.16), transparent 40%)'"
      />
      <QuotaStatCard
        eyebrow="风险"
        title="临近耗尽用户"
        :value="formatNumber(summary.nearExhaustUsers)"
        subtitle="建议优先复核充值/策略"
        icon="预警"
        clickable
        :accent="'linear-gradient(135deg, #d97706 0%, #f97316 100%)'"
        :accent-glow="'radial-gradient(circle at top right, rgba(249,115,22,0.18), transparent 38%)'"
        @click="goTo('/admin/quota/alerts')"
      />
      <QuotaStatCard
        eyebrow="状态"
        title="已暂停用户"
        :value="formatNumber(summary.suspendedUsers)"
        subtitle="可批量恢复或保持冻结"
        icon="冻结"
        :accent="'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'"
        :accent-glow="'radial-gradient(circle at top right, rgba(124,58,237,0.16), transparent 40%)'"
      />
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <article
        class="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">消耗趋势</h3>
            <p class="text-sm text-slate-500">近 {{ days }} 天 Token 消耗与活跃用户数</p>
          </div>
          <el-tag type="success" effect="plain">缓存聚合</el-tag>
        </div>
        <QuotaTrendChart :points="trendData" mode="dashboard" height="340px" />
      </article>

      <article
        class="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">配额分布</h3>
            <p class="text-sm text-slate-500">当前以角色分布为主视图</p>
          </div>
          <el-button
            text
            @click="distributionMode = distributionMode === 'role' ? 'status' : 'role'"
          >
            切换到{{ distributionMode === 'role' ? '状态' : '角色' }}
          </el-button>
        </div>
        <QuotaDistributionChart :data="distributionSource" height="340px" />
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.4fr_0.95fr]">
      <article
        class="overflow-hidden rounded-[30px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(15,118,110,0.16),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#ecfeff_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Reconciliation
            </p>
            <h3 class="mt-3 text-2xl font-black text-slate-900">跨服务聚合对账</h3>
            <p class="mt-2 text-sm text-slate-500">
              {{ reconciliationDescription }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <el-segmented v-model="reconciliationTimeRange" :options="reconciliationTimeOptions" />
            <el-segmented v-model="reconciliationGroupBy" :options="reconciliationGroupOptions" />
          </div>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-3">
          <div class="rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              差异 Token
            </div>
            <div class="mt-3 text-2xl font-black text-slate-900">
              {{ formatNumber(reconciliation.differenceTokens) }}
            </div>
            <div class="mt-2 text-sm text-slate-500">backend 与 AI service 的聚合差值</div>
          </div>
          <div class="rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              差异比例
            </div>
            <div class="mt-3 text-2xl font-black text-slate-900">
              {{ formatPercent(reconciliation.differenceRatio) }}
            </div>
            <div class="mt-2 text-sm text-slate-500">超过 10% 会进入预警阈值</div>
          </div>
          <div class="rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              当前结论
            </div>
            <div class="mt-3 flex items-center gap-3">
              <el-tag :type="reconciliationTagType(reconciliation.alertLevel)" effect="dark">
                {{ reconciliationTagText }}
              </el-tag>
              <span class="text-sm text-slate-500">
                {{ reconciliation.shouldAlert ? '建议尽快排查' : '目前一致性可接受' }}
              </span>
            </div>
            <div class="mt-3 text-xs text-slate-400">最近检查：{{ checkedAtText }}</div>
          </div>
        </div>

        <div class="mt-6 rounded-[24px] border border-slate-200/80 bg-white/90 p-4">
          <div
            class="mb-3 hidden grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,0.8fr))_110px] gap-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:grid"
          >
            <span>{{ reconciliationGroupBy === 'workflow' ? '工作流' : '用户' }}</span>
            <span class="text-right">backend tokens</span>
            <span class="text-right">AI tokens</span>
            <span class="text-right">差值</span>
            <span class="text-right">差异比</span>
            <span class="text-right">级别</span>
          </div>
          <div
            v-if="reconciliation.items.length === 0"
            class="rounded-2xl bg-slate-50 px-4 py-12 text-center text-sm text-slate-400"
          >
            当前筛选条件下暂无可展示的对账分组
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="item in reconciliation.items"
              :key="`${reconciliation.groupBy}-${item.groupKey}`"
              class="grid gap-3 rounded-[22px] border border-slate-100 bg-slate-50/90 px-4 py-4 md:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,0.8fr))_110px]"
            >
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold text-slate-900">
                  {{ groupKeyLabel(item.groupKey) }}
                </div>
                <div class="mt-1 text-xs text-slate-500">
                  {{ reconciliation.groupBy === 'workflow' ? '工作流键' : '用户 ID' }} ·
                  {{ item.groupKey }}
                </div>
              </div>
              <div class="text-sm text-slate-600 md:text-right">
                <div class="font-semibold text-slate-900">
                  {{ formatNumber(item.backendTokens) }}
                </div>
                <div class="mt-1 text-xs text-slate-400">
                  {{ formatNumber(item.backendRecords) }} 条
                </div>
              </div>
              <div class="text-sm text-slate-600 md:text-right">
                <div class="font-semibold text-slate-900">
                  {{ formatNumber(item.aiServiceTokens) }}
                </div>
                <div class="mt-1 text-xs text-slate-400">
                  {{ formatNumber(item.aiServiceRecords) }} 条
                </div>
              </div>
              <div
                class="text-sm font-semibold md:text-right"
                :class="differenceTextClass(item.alertLevel)"
              >
                {{ formatNumber(item.differenceTokens) }}
              </div>
              <div class="text-sm font-semibold text-slate-900 md:text-right">
                {{ formatPercent(item.differenceRatio) }}
              </div>
              <div class="md:text-right">
                <el-tag :type="reconciliationTagType(item.alertLevel)" effect="plain">
                  {{ tagText(item.alertLevel) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article
        class="rounded-[30px] border border-slate-200 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Consistency Snapshot
            </p>
            <h3 class="mt-3 text-xl font-black text-slate-900">总量快照</h3>
            <p class="mt-2 text-sm text-slate-500">用同一时间窗直接比较两侧聚合总量。</p>
          </div>
          <el-tag :type="reconciliationTagType(reconciliation.alertLevel)" effect="dark">
            {{ reconciliationTagText }}
          </el-tag>
        </div>

        <div class="mt-5 grid gap-3">
          <div class="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>Backend 总 tokens</span>
              <span>{{ formatNumber(reconciliation.backendTotalTokens) }}</span>
            </div>
          </div>
          <div class="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>AI Service 总 tokens</span>
              <span>{{ formatNumber(reconciliation.aiServiceTotalTokens) }}</span>
            </div>
          </div>
          <div class="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>聚合分组数</span>
              <span>{{ formatNumber(reconciliation.totalGroups) }}</span>
            </div>
          </div>
          <div class="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>后端记录数</span>
              <span>{{ formatNumber(reconciliation.backendTotalRecords) }}</span>
            </div>
          </div>
          <div class="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>AI 记录数</span>
              <span>{{ formatNumber(reconciliation.aiServiceTotalRecords) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div
            class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            <span>差异热区</span>
            <span>{{ formatPercent(reconciliation.differenceRatio) }}</span>
          </div>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full transition-all" :style="differenceBarStyle"></div>
          </div>
          <div class="mt-3 text-sm text-slate-500">
            {{ reconciliationInsight }}
          </div>
        </div>

        <div class="mt-5 rounded-[24px] border border-dashed border-slate-200 px-4 py-4">
          <div class="flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>当前维度</span>
            <span>{{ reconciliationGroupLabel }}</span>
          </div>
          <div class="mt-3 flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>当前时间窗</span>
            <span>{{ reconciliationTimeLabel }}</span>
          </div>
          <div class="mt-3 flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>拉取条数</span>
            <span
              >{{ formatNumber(reconciliation.items.length) }} /
              {{ formatNumber(reconciliation.totalGroups) }}</span
            >
          </div>
        </div>
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <article
        class="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">消耗排行 TOP 10</h3>
            <p class="text-sm text-slate-500">当前配额周期内的高消耗用户</p>
          </div>
          <el-button text @click="goTo('/admin/quota/users')">用户列表</el-button>
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
            class="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3"
          >
            <div
              class="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white"
            >
              {{ index + 1 }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-semibold text-slate-900">
                {{ user.username || user.userId }}
              </div>
              <div class="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{{ user.userId }}</span>
                <span>{{ user.role || 'unknown' }}</span>
              </div>
            </div>
            <div class="w-28">
              <el-progress
                :percentage="clampPercent(user.usagePercent)"
                :stroke-width="10"
                :show-text="false"
              />
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-slate-900">
                {{ formatNumber(user.usedQuota) }}
              </div>
              <div class="text-xs text-slate-500">/ {{ formatNumber(user.totalQuota) }}</div>
            </div>
          </div>
        </div>
      </article>

      <article
        class="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">最新预警</h3>
            <p class="text-sm text-slate-500">异常、阈值与一致性事件</p>
          </div>
          <el-button text @click="goTo('/admin/quota/alerts')">预警中心</el-button>
        </div>
        <div
          v-if="recentAlerts.length === 0"
          class="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400"
        >
          当前没有新预警
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="alert in recentAlerts"
            :key="alert.id"
            class="rounded-2xl border px-4 py-3"
            :class="alertCardClass(alert.level)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">{{ alert.title }}</div>
                <div class="mt-1 text-xs opacity-80">
                  {{ alert.userId || '全局预警' }} · {{ alert.createdAt }}
                </div>
              </div>
              <el-tag :type="tagType(alert.level)" effect="dark">{{ alert.level }}</el-tag>
            </div>
          </div>
        </div>
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
  getQuotaReconciliationSummary,
  getQuotaTrend,
  runQuotaConsistencyCheck,
  type QuotaAlertSummary,
  type QuotaDashboard,
  type QuotaReconciliationGroupBy,
  type QuotaReconciliationSummary,
  type QuotaReconciliationTimeRange,
  type QuotaTopConsumer,
  type QuotaTrendPoint,
} from '@/api/admin/quota'
import QuotaDistributionChart from '../components/quota/QuotaDistributionChart.vue'
import QuotaStatCard from '../components/quota/QuotaStatCard.vue'
import QuotaTrendChart from '../components/quota/QuotaTrendChart.vue'

const router = useRouter()
const loading = ref(false)
const reconciliationRunning = ref(false)
const days = ref(7)
const distributionMode = ref<'role' | 'status'>('role')
const reconciliationTimeRange = ref<QuotaReconciliationTimeRange>('day')
const reconciliationGroupBy = ref<QuotaReconciliationGroupBy>('user')

const createEmptyReconciliation = (): QuotaReconciliationSummary => ({
  timeRange: 'day',
  groupBy: 'user',
  page: 1,
  pageSize: 6,
  totalGroups: 0,
  backendTotalTokens: 0,
  backendTotalRecords: 0,
  aiServiceTotalTokens: 0,
  aiServiceTotalRecords: 0,
  differenceTokens: 0,
  differenceRatio: 0,
  alertLevel: 'info',
  shouldAlert: false,
  checkedAt: '',
  items: [],
})

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
const recentAlerts = ref<QuotaAlertSummary[]>([])
const trendData = ref<QuotaTrendPoint[]>([])
const reconciliation = ref<QuotaReconciliationSummary>(createEmptyReconciliation())

const dayOptions = [
  { label: '7 天', value: 7 },
  { label: '30 天', value: 30 },
  { label: '90 天', value: 90 },
]

const reconciliationTimeOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '全部', value: 'all' },
]

const reconciliationGroupOptions = [
  { label: '按用户', value: 'user' },
  { label: '按工作流', value: 'workflow' },
]

const timeRangeLabelMap: Record<QuotaReconciliationTimeRange, string> = {
  day: '当天',
  week: '最近 7 天',
  month: '当月',
  all: '全量历史',
}

const workflowLabelMap: Record<string, string> = {
  chat: '对话补写',
  rewrite: '章节改写',
  outline: '结构规划',
  analysis: '文本分析',
}

const distributionSource = computed(() =>
  distributionMode.value === 'role' ? distribution.value.byRole : distribution.value.byStatus,
)

const reconciliationTagText = computed(() => tagText(reconciliation.value.alertLevel))

const reconciliationDescription = computed(() =>
  reconciliationGroupBy.value === 'workflow'
    ? '按 AI 工作流聚合 backend 与 AI service 的 token 消费，用于快速判断哪条链路更容易漂移。'
    : '按用户聚合 backend 与 AI service 的 token 消费，便于直接定位异常账号或回补问题。',
)

const reconciliationInsight = computed(() => {
  if (reconciliation.value.alertLevel === 'critical') {
    return '当前差值已经达到高风险阈值，建议优先检查消费入库、批处理补账和 AI service usage 记录链路。'
  }
  if (reconciliation.value.alertLevel === 'warning') {
    return '当前存在可见偏差，建议结合用户明细和工作流维度继续缩小范围。'
  }
  return '当前聚合对账差值处于可接受区间，可继续观察后续批次和阈值策略。'
})

const checkedAtText = computed(() => {
  if (!reconciliation.value.checkedAt) return '--'
  const date = new Date(reconciliation.value.checkedAt)
  return Number.isNaN(date.getTime())
    ? reconciliation.value.checkedAt
    : date.toLocaleString('zh-CN', { hour12: false })
})

const reconciliationGroupLabel = computed(() =>
  reconciliation.value.groupBy === 'workflow' ? '按工作流聚合' : '按用户聚合',
)

const reconciliationTimeLabel = computed(
  () => timeRangeLabelMap[reconciliation.value.timeRange] || reconciliation.value.timeRange,
)

const differenceBarStyle = computed(() => {
  const width = Math.min(100, Math.max(reconciliation.value.differenceRatio * 100, 4))
  const background =
    reconciliation.value.alertLevel === 'critical'
      ? 'linear-gradient(90deg, #e11d48 0%, #fb7185 100%)'
      : reconciliation.value.alertLevel === 'warning'
        ? 'linear-gradient(90deg, #d97706 0%, #fb923c 100%)'
        : 'linear-gradient(90deg, #0f766e 0%, #22c55e 100%)'
  return { width: `${width}%`, background }
})

const formatNumber = (value: number) => Number(value || 0).toLocaleString('zh-CN')

const formatPercent = (value: number) => {
  const percent = Number(value || 0) * 100
  return `${percent >= 10 ? percent.toFixed(0) : percent.toFixed(1)}%`
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, Number(value || 0)))

const tagType = (level?: string) => {
  if (level === 'critical') return 'danger'
  if (level === 'warning') return 'warning'
  return 'info'
}

const tagText = (level?: string) => {
  if (level === 'critical') return '高风险'
  if (level === 'warning') return '预警'
  return '正常'
}

const differenceTextClass = (level?: string) => {
  if (level === 'critical') return 'text-rose-600'
  if (level === 'warning') return 'text-amber-600'
  return 'text-emerald-600'
}

const alertCardClass = (level?: string) => {
  if (level === 'critical') return 'border-rose-100 bg-rose-50 text-rose-700'
  if (level === 'warning') return 'border-amber-100 bg-amber-50 text-amber-700'
  return 'border-sky-100 bg-sky-50 text-sky-700'
}

const reconciliationTagType = (level?: string) => tagType(level)

const groupKeyLabel = (groupKey: string) => {
  if (reconciliation.value.groupBy === 'workflow') {
    return workflowLabelMap[groupKey] || groupKey
  }
  const matchedUser = topConsumers.value.find((item) => item.userId === groupKey)
  return matchedUser?.username || groupKey
}

const goTo = (path: string) => {
  router.push(path)
}

const loadDashboard = async () => {
  loading.value = true
  try {
    const [dashboard, trend, reconciliationSummary] = await Promise.all([
      getQuotaDashboard(),
      getQuotaTrend(days.value),
      getQuotaReconciliationSummary({
        timeRange: reconciliationTimeRange.value,
        groupBy: reconciliationGroupBy.value,
        page: 1,
        pageSize: 6,
      }),
    ])
    summary.value = dashboard.summary
    distribution.value = dashboard.distribution
    topConsumers.value = dashboard.topConsumers ?? []
    recentAlerts.value = dashboard.recentAlerts ?? []
    trendData.value = trend.length > 0 ? trend : (dashboard.trendData ?? [])
    reconciliation.value = reconciliationSummary
  } catch (error) {
    console.error('加载 quota dashboard 失败:', error)
    message.error('加载配额仪表板失败')
  } finally {
    loading.value = false
  }
}

const runConsistencyCheck = async () => {
  reconciliationRunning.value = true
  try {
    await runQuotaConsistencyCheck()
    message.success('一致性检查已触发')
    await loadDashboard()
  } catch (error) {
    console.error('执行 quota consistency check 失败:', error)
    message.error('执行一致性检查失败')
  } finally {
    reconciliationRunning.value = false
  }
}

watch([days, reconciliationTimeRange, reconciliationGroupBy], () => {
  void loadDashboard()
})

onMounted(() => {
  void loadDashboard()
})
</script>
