<template>
  <div class="withdrawal-management">
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">提现审核</h2>
        <p class="page-subtitle">集中处理钱包提现和作者收益提现申请</p>
      </div>
      <QyButton :icon="refreshIconSvg" @click="reloadAll"> 刷新 </QyButton>
    </div>

    <div class="stats-row">
      <div class="stat-item pending">
        <div class="stat-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pending_count }}</span>
          <span class="stat-label">待审核</span>
        </div>
      </div>
      <div class="stat-item approved">
        <div class="stat-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.approved_today_count }}</span>
          <span class="stat-label">今日已审核</span>
        </div>
      </div>
      <div class="stat-item amount">
        <div class="stat-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ formatCurrency(stats.pending_amount) }}</span>
          <span class="stat-label">待处理金额</span>
        </div>
      </div>
      <div class="stat-item total">
        <div class="stat-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total_count }}</span>
          <span class="stat-label">总申请数</span>
        </div>
      </div>
    </div>

    <div class="priority-board">
      <div class="priority-copy">
        <span class="priority-kicker">审核队列</span>
        <h3 class="priority-title">{{ currentViewTitle }}</h3>
        <p class="priority-description">{{ currentViewDescription }}</p>
      </div>

      <div class="priority-chips">
        <button
          v-for="item in quickFilterItems"
          :key="item.key"
          type="button"
          class="priority-chip"
          :class="{ 'is-active': activePresetKey === item.key }"
          @click="applyPreset(item.key)"
        >
          <span class="priority-chip__label">{{ item.label }}</span>
          <span class="priority-chip__meta">{{ item.meta }}</span>
        </button>
      </div>
    </div>

    <div class="filters-card">
      <div class="filter-group">
        <span class="filter-label">来源</span>
        <QySelect
          v-model="filters.source"
          :options="sourceOptions"
          placeholder="全部来源"
          clearable
          class="filter-select"
          @update:model-value="handleFilterChange"
        />
      </div>

      <div class="filter-group">
        <span class="filter-label">状态</span>
        <QySelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="全部状态"
          clearable
          class="filter-select"
          @update:model-value="handleFilterChange"
        />
      </div>

      <div class="filter-group">
        <span class="filter-label">日期范围</span>
        <DatePicker
          v-model="filters.dateRange"
          type="daterange"
          :placeholder="['开始日期', '结束日期']"
          class="filter-datepicker"
          @update:model-value="handleFilterChange"
        />
      </div>

      <div class="filter-actions">
        <QyButton variant="primary" :icon="searchIconSvg" @click="handleSearch"> 搜索 </QyButton>
        <QyButton :icon="refreshIconSvg" @click="handleReset"> 重置 </QyButton>
      </div>
    </div>

    <div class="withdrawal-card">
      <div class="loading-overlay" :class="{ 'is-active': loading }">
        <div class="loading-spinner" />
      </div>

      <div class="table-toolbar">
        <div class="table-toolbar__copy">
          <span class="table-toolbar__eyebrow">列表视图</span>
          <div class="table-toolbar__headline">
            <h3 class="table-toolbar__title">提现申请列表</h3>
            <span class="table-toolbar__badge">{{ total }} 条结果</span>
          </div>
          <p class="table-toolbar__description">
            当前页有 {{ pendingRowsInPage }} 条待审核申请，可直接在列表完成通过或拒绝。
          </p>
        </div>

        <div class="table-toolbar__stats">
          <div class="table-toolbar__stat">
            <span class="table-toolbar__stat-label">今日处理</span>
            <strong>{{ stats.approved_today_count }}</strong>
          </div>
          <div class="table-toolbar__stat">
            <span class="table-toolbar__stat-label">待处理金额</span>
            <strong>¥{{ formatCurrency(stats.pending_amount) }}</strong>
          </div>
        </div>
      </div>

      <Table
        :data="withdrawals"
        :columns="tableColumns"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
        :row-class-name="getRowClass"
        empty-text="当前筛选条件下没有提现申请"
      />

      <div v-if="total > 0" class="pagination-card">
        <div class="pagination-total">共 {{ total }} 条</div>
        <Pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="total"
          layout="prev, pager, next"
          class="admin-pagination"
          @update:current-page="
            (p: number) => {
              pagination.page = p
              loadWithdrawals()
            }
          "
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <Dialog
      v-model:visible="detailDialogVisible"
      title="提现申请详情"
      size="lg"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div v-if="currentWithdrawal" class="detail-panel">
        <div class="detail-top">
          <span class="source-tag" :class="currentWithdrawal.source">
            {{ getSourceText(currentWithdrawal.source) }}
          </span>
          <span class="status-tag" :class="currentWithdrawal.status">
            {{ getStatusText(currentWithdrawal.status) }}
          </span>
        </div>

        <div class="detail-hero">
          <div class="detail-amount-card is-primary">
            <span class="detail-amount-card__label">申请金额</span>
            <strong class="detail-amount-card__value"
              >¥{{ formatCurrency(currentWithdrawal.amount) }}</strong
            >
          </div>
          <div class="detail-amount-card">
            <span class="detail-amount-card__label">实际到账</span>
            <strong class="detail-amount-card__value"
              >¥{{ formatCurrency(currentWithdrawal.actual_amount) }}</strong
            >
          </div>
          <div class="detail-amount-card">
            <span class="detail-amount-card__label">手续费</span>
            <strong class="detail-amount-card__value"
              >¥{{ formatCurrency(currentWithdrawal.fee) }}</strong
            >
          </div>
        </div>

        <div class="review-summary" :class="`is-${currentWithdrawal.status}`">
          {{ getReviewSummary(currentWithdrawal) }}
        </div>

        <div class="detail-timeline">
          <div
            v-for="step in detailTimeline"
            :key="step.key"
            class="timeline-step"
            :class="`is-${step.state}`"
          >
            <span class="timeline-step__dot" />
            <div class="timeline-step__content">
              <span class="timeline-step__title">{{ step.title }}</span>
              <span class="timeline-step__meta">{{ step.meta }}</span>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">申请人</span>
            <span class="detail-value">
              {{
                currentWithdrawal.display_name ||
                currentWithdrawal.username ||
                currentWithdrawal.user_id
              }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">用户ID</span>
            <div class="detail-value-row">
              <span class="detail-value code">{{ currentWithdrawal.user_id }}</span>
              <button
                type="button"
                class="mini-copy-btn"
                @click="copyText(currentWithdrawal.user_id, '用户ID')"
              >
                复制
              </button>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-label">提现金额</span>
            <span class="detail-value">¥{{ formatCurrency(currentWithdrawal.amount) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">实际到账</span>
            <span class="detail-value">¥{{ formatCurrency(currentWithdrawal.actual_amount) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">手续费</span>
            <span class="detail-value">¥{{ formatCurrency(currentWithdrawal.fee) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">申请时间</span>
            <span class="detail-value">{{ formatDate(currentWithdrawal.created_at) }}</span>
          </div>
          <div class="detail-item detail-item-full">
            <span class="detail-label">收款信息</span>
            <div class="detail-value-row detail-value-row--top">
              <span class="detail-value">
                {{ currentWithdrawal.account_name || '-' }} /
                {{ currentWithdrawal.account_type || currentWithdrawal.method || '-' }} /
                {{ currentWithdrawal.account || '-' }}
              </span>
              <button
                v-if="currentWithdrawal.account"
                type="button"
                class="mini-copy-btn"
                @click="copyText(currentWithdrawal.account, '收款账号')"
              >
                复制账号
              </button>
            </div>
          </div>
          <div v-if="currentWithdrawal.bank_name" class="detail-item detail-item-full">
            <span class="detail-label">银行</span>
            <span class="detail-value">{{ currentWithdrawal.bank_name }}</span>
          </div>
          <div class="detail-item detail-item-full">
            <span class="detail-label">审核信息</span>
            <span class="detail-value">
              {{ currentWithdrawal.reviewed_by || '-' }}
              <template v-if="currentWithdrawal.reviewed_at">
                / {{ formatDate(currentWithdrawal.reviewed_at) }}
              </template>
            </span>
          </div>
          <div v-if="currentWithdrawal.reject_reason" class="detail-item detail-item-full">
            <span class="detail-label">拒绝原因</span>
            <span class="detail-value reject-text">{{ currentWithdrawal.reject_reason }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <QyButton @click="detailDialogVisible = false">关闭</QyButton>
        <template v-if="currentWithdrawal?.status === 'pending'">
          <QyButton
            variant="danger"
            :icon="closeIconSvg"
            @click="openRejectDialog(currentWithdrawal)"
          >
            拒绝
          </QyButton>
          <QyButton
            variant="primary"
            :icon="checkIconSvg"
            :loading="submittingId === currentWithdrawal?.id && submittingAction === 'approve'"
            @click="handleApprove(currentWithdrawal)"
          >
            通过
          </QyButton>
        </template>
      </template>
    </Dialog>

    <!-- 拒绝对话框 -->
    <Dialog
      v-model:visible="rejectDialogVisible"
      title="拒绝提现申请"
      size="md"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="reject-form">
        <div v-if="currentWithdrawal" class="reject-context">
          <span class="reject-context__name">
            {{
              currentWithdrawal.display_name ||
              currentWithdrawal.username ||
              currentWithdrawal.user_id
            }}
          </span>
          <span class="reject-context__amount">
            ¥{{ formatCurrency(currentWithdrawal.amount) }}
          </span>
        </div>

        <label class="form-label">
          <span class="label-text">拒绝原因</span>
          <span class="label-required">*</span>
        </label>
        <div class="textarea-wrapper">
          <textarea
            v-model="rejectForm.reason"
            class="reason-textarea"
            placeholder="请输入拒绝原因，系统将记录到提现申请"
            maxlength="200"
            rows="5"
          />
          <div class="word-count" :class="{ 'over-limit': rejectForm.reason.length > 200 }">
            {{ rejectForm.reason.length }}/200
          </div>
        </div>
      </div>

      <template #footer>
        <QyButton @click="rejectDialogVisible = false">取消</QyButton>
        <QyButton
          variant="danger"
          :loading="submittingId === currentWithdrawal?.id && submittingAction === 'reject'"
          @click="confirmReject"
        >
          确认拒绝
        </QyButton>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { formatDate } from '@/utils/format'
import { QyButton } from '@/design-system/components/basic/QyButton'
import { QySelect } from '@/design-system/components/basic/QySelect'
import { Dialog } from '@/design-system/feedback/Dialog'
import { Pagination } from '@/design-system/data/Pagination'
import { Table } from '@/design-system/data/Table'
import { DatePicker } from '@/design-system/form/DatePicker'
import type { Column } from '@/design-system/data/Table/types'
import {
  getWithdrawalList,
  getWithdrawalStats,
  handleWithdrawal,
  type AdminWithdrawalItem,
  type AdminWithdrawalStats,
} from '../api'

// === SVG 图标常量 ===
const refreshIconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`
const searchIconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`
const closeIconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`
const checkIconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`

type DateRange = [string, string] | null
type PresetKey = 'all' | 'pending' | 'author-pending' | 'wallet-pending' | 'rejected' | 'custom'

const filters = reactive({
  source: '',
  status: '',
  dateRange: null as DateRange,
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
})

const loading = ref(false)
const withdrawals = ref<AdminWithdrawalItem[]>([])
const total = ref(0)
const stats = reactive<AdminWithdrawalStats>({
  total_count: 0,
  pending_count: 0,
  approved_count: 0,
  rejected_count: 0,
  approved_today_count: 0,
  pending_amount: 0,
  approved_amount: 0,
})

const detailDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentWithdrawal = ref<AdminWithdrawalItem | null>(null)
const rejectForm = reactive({ reason: '' })
const submittingId = ref('')
const submittingAction = ref<'approve' | 'reject' | ''>('')

// === 筛选选项 ===
const sourceOptions = [
  { label: '全部', value: '' },
  { label: '钱包提现', value: 'wallet' },
  { label: '作者收益', value: 'author' },
]

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已处理', value: 'processed' },
]

// === 辅助函数 ===
declare global {
  interface Window {
    __openWithdrawalDetail?: (id: string) => void
    __approveWithdrawal?: (id: string) => void
    __rejectWithdrawal?: (id: string) => void
  }
}

const esc = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
const encodeActionId = (value: unknown) => encodeURIComponent(String(value ?? ''))
const decodeActionId = (value: string) => decodeURIComponent(value)

const getRowClass = (row: Record<string, unknown>) => {
  const status = String(row.status || '')
  if (status === 'pending') return 'row-status-pending cursor-pointer'
  if (status === 'approved' || status === 'processed') return 'row-status-approved cursor-pointer'
  if (status === 'rejected' || status === 'failed') return 'row-status-rejected cursor-pointer'
  return 'cursor-pointer'
}

const activePresetKey = computed<PresetKey>(() => {
  if (!filters.status && !filters.source) return 'all'
  if (filters.status === 'pending' && !filters.source) return 'pending'
  if (filters.status === 'pending' && filters.source === 'author') return 'author-pending'
  if (filters.status === 'pending' && filters.source === 'wallet') return 'wallet-pending'
  if (filters.status === 'rejected' && !filters.source) return 'rejected'
  return 'custom'
})

const quickFilterItems = computed(() => [
  { key: 'all' as const, label: '全部申请', meta: `${stats.total_count} 笔` },
  { key: 'pending' as const, label: '待审核优先', meta: `${stats.pending_count} 笔待处理` },
  { key: 'author-pending' as const, label: '作者收益待审', meta: `聚焦作者提现` },
  { key: 'wallet-pending' as const, label: '钱包提现待审', meta: `聚焦钱包出款` },
  { key: 'rejected' as const, label: '拒绝复核', meta: `${stats.rejected_count} 笔` },
])

const pendingRowsInPage = computed(
  () => withdrawals.value.filter((item) => item.status === 'pending').length,
)

const currentViewTitle = computed(() => {
  switch (activePresetKey.value) {
    case 'pending':
      return '优先处理所有待审核申请'
    case 'author-pending':
      return '作者收益提现进入单独快审通道'
    case 'wallet-pending':
      return '钱包提现按待审队列集中处理'
    case 'rejected':
      return '回看拒绝记录，确认原因是否充分'
    case 'custom':
      return '按自定义条件筛选提现审核列表'
    default:
      return `当前共有 ${stats.pending_count} 笔申请等待管理员确认`
  }
})

const currentViewDescription = computed(() => {
  if (activePresetKey.value === 'rejected') {
    return '拒绝记录会直接暴露原因与审核人，方便复核和追踪。'
  }
  return `待处理金额 ¥${formatCurrency(stats.pending_amount)}，今日已审核 ${stats.approved_today_count} 笔。`
})

const detailTimeline = computed(() => {
  const item = currentWithdrawal.value
  if (!item) return []

  const reviewMeta = item.reviewed_at
    ? formatDate(item.reviewed_at)
    : item.status === 'pending'
      ? '等待管理员处理'
      : '暂无审核时间'

  return [
    {
      key: 'submitted',
      title: '提交申请',
      meta: formatDate(item.created_at),
      state: 'done',
    },
    {
      key: 'review',
      title: item.status === 'rejected' ? '审核驳回' : '审核阶段',
      meta: reviewMeta,
      state:
        item.status === 'pending' ? 'current' : item.status === 'rejected' ? 'blocked' : 'done',
    },
    {
      key: 'settlement',
      title: '打款结果',
      meta:
        item.status === 'processed'
          ? `完成于 ${formatDate(item.processed_at || item.reviewed_at || item.updated_at)}`
          : item.status === 'approved'
            ? '已批准，等待出款完成'
            : item.status === 'rejected'
              ? '已终止'
              : '待审核后进入出款',
      state:
        item.status === 'processed'
          ? 'done'
          : item.status === 'approved'
            ? 'current'
            : item.status === 'rejected'
              ? 'blocked'
              : 'upcoming',
    },
  ]
})

const getReviewSummary = (item: AdminWithdrawalItem) => {
  const applicant = item.display_name || item.username || item.user_id
  const reviewer = item.reviewed_by || '管理员'
  switch (item.status) {
    case 'pending':
      return `${applicant} 的提现申请尚未审核，建议先核对收款信息与金额。`
    case 'approved':
      return `该申请已由 ${reviewer} 审核通过，当前处于待出款确认阶段。`
    case 'processed':
      return `该申请已完成审核与打款，可用于财务台账复核。`
    case 'rejected':
      return `该申请已被 ${reviewer} 驳回，拒绝原因会同步给申请人。`
    default:
      return `当前状态：${getStatusText(item.status)}。`
  }
}

// === 表格列配置 ===
const tableColumns: Column[] = [
  {
    prop: 'applicant',
    label: '申请人',
    minWidth: 190,
    render: (row) => {
      const name = esc(row.display_name || row.username || row.user_id)
      const sub = esc(row.email || row.user_id || '')
      return `<div class="user-meta"><span class="display-name">${name}</span><span class="sub-line" style="word-break:break-all">${sub}</span></div>`
    },
  },
  {
    prop: 'source',
    label: '来源',
    width: 110,
    render: (row) => {
      const cls = `source-tag ${esc(row.source || '')}`
      const text = esc(getSourceText(row.source))
      return `<span class="${cls}">${text}</span>`
    },
  },
  {
    prop: 'amount',
    label: '提现金额',
    width: 120,
    render: (row) =>
      `<div class="amount-block"><span class="amount-main">¥${formatCurrency(row.amount)}</span><span class="amount-sub">到账 ¥${formatCurrency(row.actual_amount)}</span></div>`,
  },
  {
    prop: 'account',
    label: '收款信息',
    minWidth: 230,
    render: (row) => {
      const name = esc(row.account_name || row.account || '-')
      const info = esc(
        [row.account_type, row.method, row.bank_name].filter(Boolean).join(' / ') || '-',
      )
      const acct = esc(row.account || '-')
      return `<div class="account-block"><span class="account-name">${name}</span><span class="sub-line">${info}</span><span class="sub-line" style="word-break:break-all">${acct}</span></div>`
    },
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    render: (row) => {
      const cls = `status-tag ${esc(row.status || '')}`
      const text = esc(getStatusText(row.status))
      return `<span class="${cls}">${text}</span>`
    },
  },
  {
    prop: 'created_at',
    label: '申请时间',
    width: 160,
    render: (row) => esc(formatDate(row.created_at)),
  },
  {
    prop: 'review',
    label: '审核信息',
    minWidth: 180,
    render: (row) => {
      const isPending = row.status === 'pending'
      const reviewer = esc(row.reviewed_by || (isPending ? '待分配' : '-'))
      const time = row.reviewed_at ? esc(formatDate(row.reviewed_at)) : isPending ? '等待处理' : '-'
      const reason = row.reject_reason
        ? `<span class="reject-text">${esc(row.reject_reason)}</span>`
        : isPending
          ? '<span class="review-pending-hint">可直接在右侧操作列处理</span>'
          : ''
      return `<div class="review-meta"><span>${reviewer}</span><span class="sub-line">${time}</span>${reason}</div>`
    },
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 210,
    fixed: 'right',
    render: (row) => {
      const actionId = encodeActionId(row.id)
      const detailBtn = `<button class="table-action-btn table-action-btn--ghost" onclick="window.__openWithdrawalDetail('${actionId}')">详情</button>`

      if (row.status === 'pending') {
        return `<div class="action-btns"><button class="table-action-btn table-action-btn--approve" onclick="window.__approveWithdrawal('${actionId}')">通过</button><button class="table-action-btn table-action-btn--danger" onclick="window.__rejectWithdrawal('${actionId}')">拒绝</button>${detailBtn}</div>`
      }

      return `<div class="action-btns">${detailBtn}</div>`
    },
  },
]

const getQueryParams = () => {
  const [startDate, endDate] = filters.dateRange || [undefined, undefined]
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    source: filters.source || undefined,
    status: filters.status || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  }
}

const loadStats = async () => {
  try {
    const [startDate, endDate] = filters.dateRange || [undefined, undefined]
    const response = await getWithdrawalStats({
      source: filters.source || undefined,
      status: filters.status || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    })
    Object.assign(stats, response)
  } catch (error) {
    console.error('加载提现统计失败:', error)
    Object.assign(stats, {
      total_count: 0,
      pending_count: 0,
      approved_count: 0,
      rejected_count: 0,
      approved_today_count: 0,
      pending_amount: 0,
      approved_amount: 0,
    })
  }
}

const loadWithdrawals = async () => {
  loading.value = true
  try {
    const response = await getWithdrawalList(getQueryParams())
    withdrawals.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('加载提现列表失败:', error)
    withdrawals.value = []
    total.value = 0
    message.error('加载提现列表失败')
  } finally {
    loading.value = false
  }
}

const reloadAll = async () => {
  await Promise.all([loadStats(), loadWithdrawals()])
}

const handleSearch = () => {
  pagination.page = 1
  void reloadAll()
}

const applyPreset = (key: Exclude<PresetKey, 'custom'>) => {
  pagination.page = 1

  switch (key) {
    case 'pending':
      filters.source = ''
      filters.status = 'pending'
      break
    case 'author-pending':
      filters.source = 'author'
      filters.status = 'pending'
      break
    case 'wallet-pending':
      filters.source = 'wallet'
      filters.status = 'pending'
      break
    case 'rejected':
      filters.source = ''
      filters.status = 'rejected'
      break
    default:
      filters.source = ''
      filters.status = ''
      break
  }

  void reloadAll()
}

const handleFilterChange = () => {
  pagination.page = 1
  void reloadAll()
}

const handleReset = () => {
  filters.source = ''
  filters.status = ''
  filters.dateRange = null
  pagination.page = 1
  void reloadAll()
}

const openDetail = (row: AdminWithdrawalItem) => {
  currentWithdrawal.value = row
  detailDialogVisible.value = true
}

const openRejectDialog = (row: AdminWithdrawalItem) => {
  currentWithdrawal.value = row
  rejectForm.reason = row.reject_reason || ''
  rejectDialogVisible.value = true
}

const handleApprove = async (row: AdminWithdrawalItem) => {
  if (submittingId.value) return
  try {
    await messageBox.confirm('确认通过该提现申请吗？', '审核提现', {
      type: 'warning',
      confirmButtonText: '确认通过',
    })

    submittingId.value = row.id
    submittingAction.value = 'approve'
    await handleWithdrawal({ withdraw_id: row.id, approved: true })
    message.success('提现申请已通过')
    detailDialogVisible.value = false
    await reloadAll()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('通过提现失败:', error)
      message.error('通过提现失败')
    }
  } finally {
    submittingId.value = ''
    submittingAction.value = ''
  }
}

const confirmReject = async () => {
  if (!currentWithdrawal.value) return
  if (submittingId.value) return
  if (!rejectForm.reason.trim()) {
    message.warning('请输入拒绝原因')
    return
  }

  try {
    submittingId.value = currentWithdrawal.value.id
    submittingAction.value = 'reject'
    await handleWithdrawal({
      withdraw_id: currentWithdrawal.value.id,
      approved: false,
      reason: rejectForm.reason.trim(),
    })
    message.success('提现申请已拒绝')
    rejectDialogVisible.value = false
    detailDialogVisible.value = false
    await reloadAll()
  } catch (error) {
    console.error('拒绝提现失败:', error)
    message.error('拒绝提现失败')
  } finally {
    submittingId.value = ''
    submittingAction.value = ''
  }
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    processed: '已处理',
    failed: '失败',
  }
  return map[status] || status
}

const getSourceText = (source: string) => {
  const map: Record<string, string> = { wallet: '钱包提现', author: '作者收益' }
  return map[source] || source
}

const formatCurrency = (value?: number) => Number(value ?? 0).toFixed(2)

const copyText = async (value: string | undefined, label: string) => {
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    message.success(`${label}已复制`)
  } catch (error) {
    console.error(`复制${label}失败:`, error)
    message.warning('当前环境不支持复制，请手动复制')
  }
}

onMounted(() => {
  // 注册全局处理器，供表格操作列 HTML 按钮调用
  window.__openWithdrawalDetail = (id: string) => {
    const item = withdrawals.value.find((w) => w.id === decodeActionId(id))
    if (item) openDetail(item)
  }
  window.__approveWithdrawal = (id: string) => {
    const item = withdrawals.value.find((w) => w.id === decodeActionId(id))
    if (item) void handleApprove(item)
  }
  window.__rejectWithdrawal = (id: string) => {
    const item = withdrawals.value.find((w) => w.id === decodeActionId(id))
    if (item) openRejectDialog(item)
  }
  void reloadAll()
})

onUnmounted(() => {
  delete window.__openWithdrawalDetail
  delete window.__approveWithdrawal
  delete window.__rejectWithdrawal
})
</script>

<style scoped lang="scss">
.withdrawal-management {
  --panel-bg: #ffffff;
  --panel-border: #e6eaf2;
  --ink-strong: #162033;
  --ink-muted: #6b7280;
  --accent-blue: #3b82f6;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-plum: #8b5cf6;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  .page-title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--ink-strong);
  }

  .page-subtitle {
    margin: 8px 0 0;
    color: var(--ink-muted);
    font-size: 14px;
  }
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: var(--panel-bg);
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  border: 1px solid #e5e7eb;

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--ink-strong);
  }

  .stat-label {
    font-size: 13px;
    color: #9ca3af;
  }

  &.pending {
    .stat-icon {
      background: rgba(245, 158, 11, 0.1);
      color: var(--accent-amber);
    }
    .stat-value {
      color: var(--accent-amber);
    }
  }

  &.approved {
    .stat-icon {
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent-emerald);
    }
    .stat-value {
      color: var(--accent-emerald);
    }
  }

  &.amount {
    .stat-icon {
      background: rgba(59, 130, 246, 0.1);
      color: var(--accent-blue);
    }
    .stat-value {
      color: var(--accent-blue);
    }
  }

  &.total {
    .stat-icon {
      background: rgba(99, 102, 241, 0.1);
      color: var(--accent-plum);
    }
    .stat-value {
      color: var(--accent-plum);
    }
  }
}

.priority-board {
  display: grid;
  grid-template-columns: minmax(280px, 1.2fr) minmax(0, 1.8fr);
  gap: 20px;
  margin-bottom: 20px;
  padding: 22px 24px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 34%),
    radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.15), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #f8fbff 54%, #f6f4ff 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
}

.priority-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.priority-kicker {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.1);
}

.priority-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.3;
  color: var(--ink-strong);
}

.priority-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink-muted);
}

.priority-chips {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.priority-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-height: 88px;
  padding: 16px 18px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--ink-strong);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(96, 165, 250, 0.95);
    box-shadow: 0 14px 28px rgba(37, 99, 235, 0.1);
  }

  &.is-active {
    border-color: rgba(59, 130, 246, 0.95);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(255, 255, 255, 0.95));
    box-shadow: 0 16px 30px rgba(59, 130, 246, 0.14);
  }
}

.priority-chip__label {
  font-size: 15px;
  font-weight: 700;
}

.priority-chip__meta {
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}

.filters-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  background: var(--panel-bg);
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--panel-border);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;

  .filter-label {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
  }
}

.filter-select {
  width: 140px;
}

.filter-datepicker {
  width: 280px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.withdrawal-card {
  background: var(--panel-bg);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--panel-border);
  position: relative;
}

.table-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 0 0 18px;
}

.table-toolbar__copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-toolbar__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #64748b;
  text-transform: uppercase;
}

.table-toolbar__headline {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.table-toolbar__title {
  margin: 0;
  font-size: 20px;
  color: var(--ink-strong);
}

.table-toolbar__badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.1);
}

.table-toolbar__description {
  margin: 0;
  font-size: 13px;
  color: var(--ink-muted);
}

.table-toolbar__stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.table-toolbar__stat {
  min-width: 132px;
  padding: 12px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #fbfcfe 0%, #f2f6fb 100%);
  border: 1px solid rgba(226, 232, 240, 0.9);

  strong {
    display: block;
    margin-top: 6px;
    font-size: 18px;
    color: var(--ink-strong);
  }
}

.table-toolbar__stat-label {
  font-size: 12px;
  color: #64748b;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;

  &.is-active {
    opacity: 1;
    pointer-events: auto;
  }
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
}

.pagination-total {
  font-size: 14px;
  color: #6b7280;
}

// 表格内部样式
.user-meta,
.account-block,
.review-meta,
.amount-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.display-name,
.account-name,
.amount-main {
  font-weight: 600;
  color: #1f2937;
}

.sub-line,
.amount-sub {
  font-size: 12px;
  color: #94a3b8;
}

.reject-text {
  color: #dc2626;
  font-size: 12px;
}

.review-pending-hint {
  color: #b45309;
  font-size: 12px;
}

.source-tag,
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.source-tag.wallet {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}
.source-tag.author {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}
.status-tag.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}
.status-tag.approved,
.status-tag.processed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}
.status-tag.rejected,
.status-tag.failed {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

// 表格状态行颜色
:deep(.row-status-pending) {
  background-color: rgba(245, 158, 11, 0.06) !important;
  &:hover {
    background-color: rgba(245, 158, 11, 0.1) !important;
  }
}
:deep(.row-status-approved) {
  background-color: rgba(16, 185, 129, 0.05) !important;
  &:hover {
    background-color: rgba(16, 185, 129, 0.09) !important;
  }
}
:deep(.row-status-rejected) {
  background-color: rgba(220, 38, 38, 0.04) !important;
  &:hover {
    background-color: rgba(220, 38, 38, 0.08) !important;
  }
}

.action-btns {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.table-action-btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #475569;
  color: #fff;
  border: none;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s,
    box-shadow 0.2s;
  white-space: nowrap;

  &:hover {
    background: #334155;
    box-shadow: 0 10px 18px rgba(51, 65, 85, 0.18);
  }
  &:active {
    transform: scale(0.97);
  }
}

.table-action-btn--approve {
  background: #059669;

  &:hover {
    background: #047857;
    box-shadow: 0 10px 18px rgba(5, 150, 105, 0.2);
  }
}

.table-action-btn--danger {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid rgba(251, 207, 232, 0.95);

  &:hover {
    background: #ffe4e6;
    box-shadow: none;
  }
}

.table-action-btn--ghost {
  background: #eef2ff;
  color: #4338ca;

  &:hover {
    background: #e0e7ff;
    box-shadow: none;
  }
}

// 详情弹窗
.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-top {
  display: flex;
  gap: 8px;
}

.detail-hero {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.detail-amount-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;

  &.is-primary {
    background: linear-gradient(135deg, rgba(29, 78, 216, 0.08), rgba(255, 255, 255, 0.96));
    border-color: rgba(147, 197, 253, 0.9);
  }
}

.detail-amount-card__label {
  font-size: 12px;
  color: #64748b;
}

.detail-amount-card__value {
  font-size: 22px;
  color: var(--ink-strong);
}

.review-summary {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
  background: #f8fafc;

  &.is-pending {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.22);
    color: #9a6700;
  }

  &.is-approved,
  &.is-processed {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.22);
    color: #047857;
  }

  &.is-rejected,
  &.is-failed {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.2);
    color: #b91c1c;
  }
}

.detail-timeline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.timeline-step {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.timeline-step__dot {
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: 999px;
  background: #cbd5e1;
  flex-shrink: 0;
}

.timeline-step__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-step__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-strong);
}

.timeline-step__meta {
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}

.timeline-step.is-done {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.07);

  .timeline-step__dot {
    background: #10b981;
  }
}

.timeline-step.is-current {
  border-color: rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.07);

  .timeline-step__dot {
    background: #3b82f6;
  }
}

.timeline-step.is-blocked {
  border-color: rgba(239, 68, 68, 0.22);
  background: rgba(239, 68, 68, 0.06);

  .timeline-step__dot {
    background: #ef4444;
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.detail-item-full {
    grid-column: 1 / -1;
  }
}

.detail-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;

  &.code {
    font-family: 'Courier New', monospace;
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 13px;
    word-break: break-all;
  }
}

.detail-value-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  &.detail-value-row--top {
    align-items: flex-start;
  }
}

.mini-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    background: #f8fafc;
    border-color: rgba(96, 165, 250, 0.6);
  }
}

.reject-text {
  color: #dc2626;
}

// 拒绝表单
.reject-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reject-context {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.reject-context__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-strong);
}

.reject-context__amount {
  font-size: 14px;
  font-weight: 700;
  color: #b91c1c;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.label-required {
  color: #ef4444;
}

.textarea-wrapper {
  position: relative;
}

.reason-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  background: #fff;
  resize: vertical;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  font-family: inherit;

  &::placeholder {
    color: #9ca3af;
  }
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
  }
  &.has-error {
    border-color: #fca5a5;
  }
}

.word-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: #9ca3af;
  pointer-events: none;

  &.over-limit {
    color: #ef4444;
    font-weight: 500;
  }
}

@media (max-width: 1180px) {
  .priority-board,
  .detail-hero,
  .detail-timeline {
    grid-template-columns: 1fr;
  }

  .table-toolbar {
    flex-direction: column;
  }
}

@media (max-width: 960px) {
  .stats-row,
  .priority-chips,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    display: grid;
  }

  .filters-card,
  .pagination-card,
  .reject-context {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .withdrawal-card,
  .filters-card,
  .priority-board {
    padding: 18px;
  }

  .filter-select,
  .filter-datepicker {
    width: 100%;
  }

  .detail-value-row {
    align-items: flex-start;
  }
}
</style>
