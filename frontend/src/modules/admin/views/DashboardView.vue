<template>
  <div class="max-w-[1400px] mx-auto">
    <!-- Page Header -->
    <div class="mb-7">
      <h2 class="m-0 text-[28px] font-bold text-slate-900">管理仪表板</h2>
      <p class="m-0 mt-2 text-sm text-gray-500">系统运营数据概览与快捷操作入口</p>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-4 gap-5 mb-8 max-[1200px]:grid-cols-2 max-[768px]:grid-cols-1">
      <div
        class="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
        @click="goToUsers"
      >
        <div
          class="w-14 h-14 rounded-[14px] flex items-center justify-center text-white shrink-0"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-[28px] font-bold text-slate-900 leading-tight">
            {{ formatNumber(stats.totalUsers) }}
          </div>
          <div class="text-sm text-gray-500 mt-1">用户总数</div>
          <div class="text-[13px] text-gray-400 mt-2">
            今日新增 {{ formatNumber(stats.newUsersToday) }}
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-[#f5576c]"
        style="background: linear-gradient(135deg, #fff5f5 0%, #fff 100%)"
        @click="goToReviews"
      >
        <div
          class="w-14 h-14 rounded-[14px] flex items-center justify-center text-white shrink-0"
          style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-[28px] font-bold text-slate-900 leading-tight">
            {{ formatNumber(stats.pendingReviews) }}
          </div>
          <div class="text-sm text-gray-500 mt-1">待审核</div>
          <div
            class="inline-block mt-2 px-3 py-1 bg-[#f5576c] text-white text-xs font-medium rounded-xl"
          >
            需处理
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        <div
          class="w-14 h-14 rounded-[14px] flex items-center justify-center text-white shrink-0"
          style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-[28px] font-bold text-slate-900 leading-tight">
            {{ formatCurrency(stats.totalRevenue) }}
          </div>
          <div class="text-sm text-gray-500 mt-1">累计收入</div>
          <div class="text-[13px] text-gray-400 mt-2">当前后端未提供日收入趋势</div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        <div
          class="w-14 h-14 rounded-[14px] flex items-center justify-center text-white shrink-0"
          style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-[28px] font-bold text-slate-900 leading-tight">
            {{ formatNumber(stats.activeUsers) }}
          </div>
          <div class="text-sm text-gray-500 mt-1">活跃用户</div>
          <div class="text-[13px] text-gray-400 mt-2">
            作者数 {{ formatNumber(stats.authorsCount) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <h3 class="m-0 text-lg font-semibold text-slate-900">快捷操作</h3>
        <span class="ml-3 text-[13px] text-gray-400">常用管理功能入口</span>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-4 mb-8 max-[1200px]:grid-cols-2 max-[768px]:grid-cols-1">
      <div
        class="bg-white rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-200 relative hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 group"
        @click="goToReviews"
      >
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
          style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        >
          <svg
            class="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-base font-semibold text-slate-900">内容审核</div>
          <div class="text-[13px] text-gray-400 mt-1">审核书籍、章节等内容</div>
        </div>
        <div
          v-if="stats.pendingReviews > 0"
          class="absolute -top-2 -right-2 min-w-[24px] h-6 bg-[#f5576c] text-white text-xs font-semibold rounded-xl flex items-center justify-center px-2"
        >
          {{ stats.pendingReviews }}
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-200 relative hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 group"
        @click="goToWithdrawals"
      >
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
          style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        >
          <svg
            class="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-base font-semibold text-slate-900">提现审核</div>
          <div class="text-[13px] text-gray-400 mt-1">处理用户提现申请</div>
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-200 relative hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 group"
        @click="goToUsers"
      >
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        >
          <svg
            class="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-base font-semibold text-slate-900">用户管理</div>
          <div class="text-[13px] text-gray-400 mt-1">管理平台用户信息</div>
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-200 relative hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 group"
        @click="goToCategories"
      >
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
          style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        >
          <svg
            class="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-base font-semibold text-slate-900">分类管理</div>
          <div class="text-[13px] text-gray-400 mt-1">维护书城分类结构</div>
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-200 relative hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 group"
        @click="goToLogs"
      >
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center text-[#666] transition-transform duration-300 group-hover:scale-110"
          style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
        >
          <svg
            class="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-base font-semibold text-slate-900">操作日志</div>
          <div class="text-[13px] text-gray-400 mt-1">查看系统操作记录</div>
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-200 relative hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 group"
        @click="goToBanners"
      >
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center text-[#666] transition-transform duration-300 group-hover:scale-110"
          style="background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)"
        >
          <svg
            class="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-base font-semibold text-slate-900">Banner管理</div>
          <div class="text-[13px] text-gray-400 mt-1">管理首页轮播图</div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <h3 class="m-0 text-lg font-semibold text-slate-900">配额概览</h3>
        <span class="ml-3 text-[13px] text-gray-400">来自 admin quota 聚合接口</span>
      </div>
      <QyButton variant="ghost" :loading="quotaLoading" @click="loadQuotaOverview">
        查看最新
      </QyButton>
    </div>
    <div class="grid grid-cols-3 gap-4 mb-8 max-[1200px]:grid-cols-2 max-[768px]:grid-cols-1">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
        @click="goToQuotaDashboard"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Quota Dashboard
            </div>
            <div class="mt-3 text-[28px] font-bold leading-tight text-slate-900">
              {{ formatNumber(quotaSummary.totalUsers) }}
            </div>
            <div class="mt-1 text-sm text-gray-500">纳入管理用户</div>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-[16px] text-white"
            style="background: linear-gradient(135deg, #0f766e 0%, #2563eb 100%)"
          >
            Q
          </div>
        </div>
        <div class="mt-4 text-[13px] text-gray-400">
          活跃 {{ formatNumber(quotaSummary.activeUsers) }} / 暂停
          {{ formatNumber(quotaSummary.suspendedUsers) }}
        </div>
      </div>

      <div
        class="rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_100%)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
        @click="goToQuotaAlerts"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
              Risk Window
            </div>
            <div class="mt-3 text-[28px] font-bold leading-tight text-slate-900">
              {{ formatNumber(quotaSummary.nearExhaustUsers) }}
            </div>
            <div class="mt-1 text-sm text-gray-500">临近耗尽用户</div>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-[16px] text-white"
            style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
          >
            !
          </div>
        </div>
        <div class="mt-4 text-[13px] text-gray-400">
          已耗尽 {{ formatNumber(quotaSummary.exhaustedUsers) }}，建议优先复核
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
        @click="goToQuotaReports"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Consumption
            </div>
            <div class="mt-3 text-[28px] font-bold leading-tight text-slate-900">
              {{ formatNumber(quotaSummary.totalConsumption) }}
            </div>
            <div class="mt-1 text-sm text-gray-500">累计 Token 消耗</div>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-[16px] text-white"
            style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)"
          >
            T
          </div>
        </div>
        <div class="mt-4 text-[13px] text-gray-400">
          人均 {{ formatNumber(quotaSummary.avgConsumption) }}，点击查看报表
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <h3 class="m-0 text-lg font-semibold text-slate-900">数据概览</h3>
        <span class="ml-3 text-[13px] text-gray-400">当前以真实接口返回的聚合数据为准</span>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-5 mb-8 max-[1200px]:grid-cols-1">
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <span class="text-base font-semibold text-slate-900">用户规模概览</span>
          <span class="text-sm text-gray-400">概览</span>
        </div>
        <div ref="userChartRef" class="h-[280px]"></div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <span class="text-base font-semibold text-slate-900">审核状态分布</span>
          <span class="text-sm text-gray-400">概览</span>
        </div>
        <div ref="auditChartRef" class="h-[280px]"></div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="m-0 text-lg font-semibold text-slate-900">最近活动</h3>
      <QyButton variant="ghost" :loading="activitiesLoading" @click="loadActivities">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        刷新
      </QyButton>
    </div>
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <div v-if="recentActivities.length === 0" class="dashboard-empty-state">
        <Empty title="暂无操作日志" description="系统运行后将显示操作记录" iconSize="small" />
      </div>
      <div
        v-else
        v-for="activity in recentActivities"
        :key="activity.id"
        class="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0 last:pb-0 first:pt-0"
      >
        <div
          class="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
          :class="{
            'bg-blue-500': activity.type === 'primary',
            'bg-green-500': activity.type === 'success',
            'bg-amber-500': activity.type === 'warning',
            'bg-gray-400': activity.type === 'info',
          }"
        ></div>
        <div class="flex-1">
          <div class="text-sm text-gray-700">{{ activity.content }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ activity.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'
import { Empty } from '@/design-system/base'
import { echarts } from '@/utils/echarts'
import type { ECharts } from '@/utils/echarts'
import { getQuotaGlobalStatistics, type QuotaSummary } from '@/api/admin/quota'
import { getAuditStatistics, getDashboardStats, getOperationLogs } from '../api'
import type { OperationLog } from '../types/admin.types'

type DashboardMetrics = {
  totalUsers: number
  newUsersToday: number
  pendingReviews: number
  totalRevenue: number
  activeUsers: number
  authorsCount: number
  approved: number
  rejected: number
  highRisk: number
}

type ActivityItem = {
  id: string
  time: string
  type: 'primary' | 'success' | 'warning' | 'info'
  content: string
}

const router = useRouter()

const stats = ref<DashboardMetrics>({
  totalUsers: 0,
  newUsersToday: 0,
  pendingReviews: 0,
  totalRevenue: 0,
  activeUsers: 0,
  authorsCount: 0,
  approved: 0,
  rejected: 0,
  highRisk: 0,
})

const activitiesLoading = ref(false)
const quotaLoading = ref(false)
const recentActivities = ref<ActivityItem[]>([])
const quotaSummary = ref<QuotaSummary>({
  totalUsers: 0,
  activeUsers: 0,
  exhaustedUsers: 0,
  nearExhaustUsers: 0,
  suspendedUsers: 0,
  totalConsumption: 0,
  avgConsumption: 0,
})

const userChartRef = ref<HTMLElement>()
const auditChartRef = ref<HTMLElement>()

let userChart: ECharts | null = null
let auditChart: ECharts | null = null

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toLocaleString()
}

const formatCurrency = (num: number) => `¥${num.toLocaleString()}`

const formatDateTime = (value?: string | number) => {
  if (!value) return '未知时间'
  const date = typeof value === 'number' ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return date.toLocaleString('zh-CN', { hour12: false })
}

const normalizeActivityType = (log: OperationLog): ActivityItem['type'] => {
  if (log.result === 'failure') return 'warning'
  if (/(approve|create|publish|enable)/i.test(log.action)) return 'success'
  if (/(delete|ban|reject|disable)/i.test(log.action)) return 'warning'
  return 'primary'
}

const formatActivityText = (log: OperationLog) => {
  const operator = log.operatorName || log.operatorId || '管理员'
  const action = log.action || '执行操作'
  const target = log.target || log.targetId || '系统资源'
  return `${operator} ${action} ${target}`.trim()
}

const initUserChart = () => {
  if (!userChartRef.value) return
  userChart?.dispose()
  userChart = echarts.init(userChartRef.value)
  userChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['总用户', '活跃用户', '作者数', '今日新增'],
      axisTick: { alignWithLabel: true },
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: [
          stats.value.totalUsers,
          stats.value.activeUsers,
          stats.value.authorsCount,
          stats.value.newUsersToday,
        ],
        itemStyle: {
          color: (params: { dataIndex: number }) =>
            ['#667eea', '#4facfe', '#fa709a', '#67c23a'][params.dataIndex] ?? '#667eea',
        },
        barMaxWidth: 56,
      },
    ],
  })
}

const initAuditChart = () => {
  if (!auditChartRef.value) return
  auditChart?.dispose()
  auditChart = echarts.init(auditChartRef.value)
  const seriesData = [
    { value: stats.value.pendingReviews, name: '待审核' },
    { value: stats.value.approved, name: '已通过' },
    { value: stats.value.rejected, name: '已拒绝' },
    { value: stats.value.highRisk, name: '高风险' },
  ]
  const hasData = seriesData.some((item) => item.value > 0)
  auditChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        data: hasData
          ? seriesData
          : [{ value: 1, name: '暂无审核数据', itemStyle: { color: '#d1d5db' } }],
        label: { formatter: '{b}' },
      },
    ],
  })
}

const resizeCharts = () => {
  userChart?.resize()
  auditChart?.resize()
}

const loadActivities = async () => {
  activitiesLoading.value = true
  try {
    const response = await getOperationLogs({ page: 1, page_size: 5 })
    const logs = Array.isArray(response.data) ? response.data : []
    recentActivities.value = logs.map((log) => ({
      id: log.id,
      time: formatDateTime(log.timestamp),
      type: normalizeActivityType(log),
      content: formatActivityText(log),
    }))
  } catch (error) {
    recentActivities.value = []
    console.error('Failed to load admin activities:', error)
    message.error('获取操作日志失败')
  } finally {
    activitiesLoading.value = false
  }
}

const loadQuotaOverview = async () => {
  quotaLoading.value = true
  try {
    quotaSummary.value = await getQuotaGlobalStatistics()
  } catch (error) {
    console.error('Failed to load quota overview:', error)
    message.error('获取配额概览失败')
  } finally {
    quotaLoading.value = false
  }
}

const loadDashboard = async () => {
  try {
    const [dashboardResponse, auditResponse] = await Promise.all([
      getDashboardStats(),
      getAuditStatistics(),
      loadQuotaOverview(),
      loadActivities(),
    ])

    const auditData = (auditResponse as any)?.data ?? auditResponse ?? {}
    stats.value = {
      totalUsers: Number((dashboardResponse as any)?.totalUsers ?? 0),
      newUsersToday: Number((dashboardResponse as any)?.newUsersToday ?? 0),
      pendingReviews: Number((dashboardResponse as any)?.pendingAudits ?? auditData.pending ?? 0),
      totalRevenue: Number((dashboardResponse as any)?.totalRevenue ?? 0),
      activeUsers: Number((dashboardResponse as any)?.activeUsers ?? 0),
      authorsCount: Number((dashboardResponse as any)?.authorsCount ?? 0),
      approved: Number(auditData.approved ?? 0),
      rejected: Number(auditData.rejected ?? 0),
      highRisk: Number(auditData.highRisk ?? 0),
    }
  } catch (error) {
    console.error('Failed to load admin dashboard:', error)
    message.error('加载仪表盘失败')
  }
}

const goToReviews = () => router.push('/admin/reviews')
const goToWithdrawals = () => router.push('/admin/withdrawals')
const goToUsers = () => router.push('/admin/users')
const goToLogs = () => router.push('/admin/logs')
const goToCategories = () => router.push('/admin/categories')
const goToBanners = () => router.push('/admin/banners')
const goToQuotaDashboard = () => router.push('/admin/quota/dashboard')
const goToQuotaAlerts = () => router.push('/admin/quota/alerts')
const goToQuotaReports = () => router.push('/admin/quota/reports')

watch(
  stats,
  () => {
    initUserChart()
    initAuditChart()
  },
  { deep: true },
)

onMounted(async () => {
  await loadDashboard()
  await nextTick()
  initUserChart()
  initAuditChart()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  userChart?.dispose()
  auditChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard-empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 116px;
}
</style>
