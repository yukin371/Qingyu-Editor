<template>
  <div class="mx-auto max-w-[1440px] space-y-6">
    <section
      class="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-7 shadow-[0_26px_80px_rgba(15,23,42,0.08)]"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Quota Users
          </p>
          <h2 class="mt-3 text-3xl font-black text-slate-900">用户配额列表</h2>
          <p class="mt-2 text-sm text-slate-500">
            集中查看配额消耗、冻结状态与充值入口，快速处理高风险账户。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <el-button :loading="loading" @click="loadUsers">刷新</el-button>
          <el-button type="primary" @click="goTo('/admin/quota/policies')">查看策略</el-button>
        </div>
      </div>

      <div class="mt-6 grid gap-3 md:grid-cols-[minmax(0,1.2fr)_180px_180px_120px]">
        <el-input
          v-model="filters.search"
          placeholder="搜索用户名或用户 ID"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.role" clearable placeholder="全部角色">
          <el-option label="读者" value="reader" />
          <el-option label="作者" value="writer" />
          <el-option label="管理员" value="admin" />
        </el-select>
        <el-select v-model="filters.status" clearable placeholder="全部状态">
          <el-option label="活跃" value="active" />
          <el-option label="已暂停" value="suspended" />
          <el-option label="耗尽" value="exhausted" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="handleSearch">筛选</el-button>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Current Page
        </div>
        <div class="mt-3 text-3xl font-black text-slate-900">{{ users.length }}</div>
        <div class="mt-2 text-sm text-slate-500">当前页账户数</div>
      </article>
      <article
        class="rounded-[28px] border border-amber-100 bg-amber-50/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Risk</div>
        <div class="mt-3 text-3xl font-black text-amber-700">{{ highRiskCount }}</div>
        <div class="mt-2 text-sm text-amber-600">使用率 ≥ 80%</div>
      </article>
      <article
        class="rounded-[28px] border border-rose-100 bg-rose-50/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">Suspended</div>
        <div class="mt-3 text-3xl font-black text-rose-700">{{ suspendedCount }}</div>
        <div class="mt-2 text-sm text-rose-600">当前页已暂停用户</div>
      </article>
      <article
        class="rounded-[28px] border border-sky-100 bg-sky-50/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
      >
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Avg Usage</div>
        <div class="mt-3 text-3xl font-black text-slate-900">{{ averageUsagePercent }}%</div>
        <div class="mt-2 text-sm text-slate-500">当前页平均使用率</div>
      </article>
    </section>

    <section
      class="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
    >
      <el-table :data="users" row-key="userId" v-loading="loading">
        <el-table-column label="用户" min-width="220" align="center" header-align="center">
          <template #default="{ row }">
            <div class="min-w-0 text-center">
              <div class="truncate text-sm font-semibold text-slate-900">
                {{ row.username || row.userId }}
              </div>
              <div class="mt-1 text-xs text-slate-500">{{ row.userId }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色 / 等级" min-width="160" align="center" header-align="center">
          <template #default="{ row }">
            <div class="flex flex-col items-center gap-2 text-center">
              <el-tag effect="plain">{{ row.role || 'unknown' }}</el-tag>
              <span class="text-xs text-slate-500">{{ row.memberLevel || 'normal' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="使用率" min-width="220" align="center" header-align="center">
          <template #default="{ row }">
            <div class="mx-auto max-w-[220px] text-center">
              <div class="mb-2 flex items-center justify-center gap-3 text-xs text-slate-500">
                <span>{{ formatNumber(row.dailyUsed) }} / {{ formatNumber(row.dailyQuota) }}</span>
                <span>{{ normalizePercent(row.usagePercent) }}%</span>
              </div>
              <el-progress
                :percentage="normalizePercent(row.usagePercent)"
                :stroke-width="10"
                :status="progressStatus(row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="dark">{{
              formatStatus(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="260"
          fixed="right"
          align="center"
          header-align="center"
        >
          <template #default="{ row }">
            <div class="flex flex-wrap justify-center gap-2">
              <el-button link type="primary" @click="openDetail(row)">详情</el-button>
              <el-button link type="success" @click="openRecharge(row)">充值</el-button>
              <el-button link type="warning" @click="openAdjustQuota(row)">改配额</el-button>
              <el-button
                link
                :type="row.status === 'suspended' ? 'success' : 'danger'"
                @click="toggleStatus(row)"
              >
                {{ row.status === 'suspended' ? '恢复' : '暂停' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section
      v-if="pagination.total > 0"
      class="flex flex-wrap items-center justify-center gap-4 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:justify-between"
    >
      <div class="text-sm font-medium text-slate-500">
        共 {{ pagination.total }} 条，当前第 {{ pagination.page }} 页
      </div>
      <Pagination
        :current-page="pagination.page"
        :page-size="pagination.size"
        :total="pagination.total"
        :background="true"
        hide-on-single-page
        layout="prev, pager, next"
        @update:current-page="handlePageChange"
      />
    </section>

    <el-dialog v-model="detailVisible" title="配额详情" width="720px">
      <div v-if="detailTarget" class="space-y-5">
        <section class="grid gap-4 md:grid-cols-3">
          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="text-xs uppercase tracking-[0.22em] text-slate-400">User</div>
            <div class="mt-3 text-base font-bold text-slate-900">
              {{ detailTarget.username || detailTarget.userId }}
            </div>
            <div class="mt-1 text-xs text-slate-500">{{ detailTarget.userId }}</div>
          </article>
          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="text-xs uppercase tracking-[0.22em] text-slate-400">Role</div>
            <div class="mt-3 text-base font-bold text-slate-900">
              {{ detailTarget.role || 'unknown' }}
            </div>
            <div class="mt-1 text-xs text-slate-500">
              {{ detailTarget.memberLevel || 'normal' }}
            </div>
          </article>
          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="text-xs uppercase tracking-[0.22em] text-slate-400">Status</div>
            <div class="mt-3">
              <el-tag :type="statusTagType(detailTarget.status)" effect="dark">{{
                formatStatus(detailTarget.status)
              }}</el-tag>
            </div>
            <div class="mt-1 text-xs text-slate-500">当前列表快照</div>
          </article>
        </section>

        <section class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">配额分项</h3>
            <el-button text :loading="detailLoading" @click="reloadDetail">刷新详情</el-button>
          </div>

          <article
            v-for="item in detailItems"
            :key="`${item.userId}-${item.quotaType}`"
            class="rounded-2xl border border-slate-200 bg-white px-4 py-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">
                  {{ quotaTypeText(item.quotaType) }}
                </div>
                <div class="mt-1 text-xs text-slate-500">
                  剩余 {{ formatNumber(item.remainingQuota) }} / 总额
                  {{ formatNumber(item.totalQuota) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-slate-900">
                  {{ formatStatus(item.status) }}
                </div>
                <div class="mt-1 text-xs text-slate-500">
                  {{ item.resetAt ? `重置于 ${formatDate(item.resetAt)}` : '无重置时间' }}
                </div>
              </div>
            </div>
            <div class="mt-3">
              <el-progress
                :percentage="detailUsagePercent(item)"
                :stroke-width="10"
                :status="item.remainingQuota <= 0 ? 'exception' : undefined"
              />
            </div>
          </article>

          <article
            v-if="detailItems.length === 0 && !detailLoading"
            class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-400"
          >
            当前用户暂无可展示的配额明细
          </article>
        </section>
      </div>
    </el-dialog>

    <el-dialog v-model="rechargeVisible" title="配额充值" width="480px">
      <el-form label-width="96px">
        <el-form-item label="目标用户">
          <div class="text-sm font-semibold text-slate-900">
            {{ actionTarget?.username || actionTarget?.userId || '-' }}
          </div>
        </el-form-item>
        <el-form-item label="配额类型">
          <el-segmented v-model="rechargeForm.quotaType" :options="quotaTypeOptions" />
        </el-form-item>
        <el-form-item label="充值额度">
          <el-input-number v-model="rechargeForm.amount" :min="1" :step="100" class="w-full" />
        </el-form-item>
        <el-form-item label="原因">
          <el-input
            v-model="rechargeForm.reason"
            type="textarea"
            :rows="3"
            maxlength="120"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitRecharge">确认充值</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="adjustVisible" title="修改配额" width="480px">
      <el-form label-width="96px">
        <el-form-item label="目标用户">
          <div class="text-sm font-semibold text-slate-900">
            {{ actionTarget?.username || actionTarget?.userId || '-' }}
          </div>
        </el-form-item>
        <el-form-item label="配额类型">
          <el-segmented v-model="adjustForm.quotaType" :options="quotaTypeOptions" />
        </el-form-item>
        <el-form-item label="目标额度">
          <el-input-number v-model="adjustForm.totalQuota" :min="0" :step="100" class="w-full" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitAdjust">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Pagination } from '@/design-system/data/Pagination'
import { message, messageBox } from '@/design-system/services'
import {
  activateQuotaUser,
  getQuotaUserDetails,
  listQuotaUsers,
  rechargeQuotaUser,
  suspendQuotaUser,
  updateQuotaUser,
  type QuotaListItem,
  type UserQuotaDetail,
} from '@/api/admin/quota'

const router = useRouter()
const loading = ref(false)
const detailLoading = ref(false)
const submitting = ref(false)

const users = ref<QuotaListItem[]>([])
const detailItems = ref<UserQuotaDetail[]>([])
const detailTarget = ref<QuotaListItem | null>(null)
const actionTarget = ref<QuotaListItem | null>(null)

const detailVisible = ref(false)
const rechargeVisible = ref(false)
const adjustVisible = ref(false)

const filters = reactive({
  search: '',
  role: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
})

const rechargeForm = reactive({
  amount: 1000,
  quotaType: 'daily' as 'daily' | 'monthly',
  reason: '',
})

const adjustForm = reactive({
  totalQuota: 1000,
  quotaType: 'daily' as 'daily' | 'monthly' | 'total',
})

const quotaTypeOptions = [
  { label: '日配额', value: 'daily' },
  { label: '月配额', value: 'monthly' },
  { label: '总配额', value: 'total' },
]

const highRiskCount = computed(
  () => users.value.filter((item) => normalizePercent(item.usagePercent) >= 80).length,
)
const suspendedCount = computed(
  () => users.value.filter((item) => item.status === 'suspended').length,
)
const averageUsagePercent = computed(() => {
  if (users.value.length === 0) return 0
  const total = users.value.reduce((sum, item) => sum + normalizePercent(item.usagePercent), 0)
  return Math.round(total / users.value.length)
})

const normalizePercent = (value: number) => Math.max(0, Math.min(100, Number(value || 0)))
const formatNumber = (value: number) => Number(value || 0).toLocaleString('zh-CN')

const formatDate = (value?: string) => {
  if (!value) return '未提供'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

const formatStatus = (status?: string) => {
  if (status === 'active') return '活跃'
  if (status === 'suspended') return '已暂停'
  if (status === 'exhausted') return '已耗尽'
  if (status === 'disabled') return '已停用'
  return status || '未知'
}

const statusTagType = (status?: string) => {
  if (status === 'active') return 'success'
  if (status === 'suspended') return 'warning'
  if (status === 'exhausted') return 'danger'
  return 'info'
}

const quotaTypeText = (quotaType?: string) => {
  if (quotaType === 'daily') return '日配额'
  if (quotaType === 'monthly') return '月配额'
  if (quotaType === 'total') return '总配额'
  return quotaType || '未知类型'
}

const progressStatus = (row: QuotaListItem) => {
  const percent = normalizePercent(row.usagePercent)
  if (row.status === 'suspended' || row.status === 'exhausted' || percent >= 95) return 'exception'
  if (percent >= 80) return 'warning'
  return undefined
}

const detailUsagePercent = (item: UserQuotaDetail) => {
  if (item.totalQuota <= 0) return item.usedQuota > 0 ? 100 : 0
  return normalizePercent((item.usedQuota / item.totalQuota) * 100)
}

const loadUsers = async () => {
  loading.value = true
  try {
    const result = await listQuotaUsers({
      page: pagination.page,
      limit: pagination.size,
      role: filters.role || undefined,
      status: filters.status || undefined,
      search: filters.search || undefined,
    })
    users.value = result.items
    pagination.total = result.total
  } catch (error) {
    console.error('加载 quota 用户列表失败:', error)
    users.value = []
    pagination.total = 0
    message.error('加载用户配额列表失败')
  } finally {
    loading.value = false
  }
}

const loadUserDetail = async (userId: string) => {
  detailLoading.value = true
  try {
    detailItems.value = await getQuotaUserDetails(userId)
  } catch (error) {
    console.error('加载 quota 用户详情失败:', error)
    detailItems.value = []
    message.error('加载用户配额详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  void loadUsers()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  void loadUsers()
}

const openDetail = (row: QuotaListItem) => {
  detailTarget.value = row
  detailVisible.value = true
  void loadUserDetail(row.userId)
}

const reloadDetail = () => {
  if (!detailTarget.value) return
  void loadUserDetail(detailTarget.value.userId)
}

const openRecharge = (row: QuotaListItem) => {
  actionTarget.value = row
  rechargeForm.amount = 1000
  rechargeForm.quotaType = 'daily'
  rechargeForm.reason = ''
  rechargeVisible.value = true
}

const openAdjustQuota = (row: QuotaListItem) => {
  actionTarget.value = row
  adjustForm.quotaType = 'daily'
  adjustForm.totalQuota = Math.max(0, Number(row.dailyQuota || 0))
  adjustVisible.value = true
}

const submitRecharge = async () => {
  if (!actionTarget.value) return
  if (!rechargeForm.reason.trim()) {
    message.warning('请输入充值原因')
    return
  }

  submitting.value = true
  try {
    await rechargeQuotaUser(actionTarget.value.userId, {
      amount: rechargeForm.amount,
      quotaType: rechargeForm.quotaType,
      reason: rechargeForm.reason.trim(),
    })
    rechargeVisible.value = false
    message.success('配额充值已提交')
    await loadUsers()
    if (detailVisible.value && detailTarget.value?.userId === actionTarget.value.userId) {
      await loadUserDetail(actionTarget.value.userId)
    }
  } catch (error) {
    console.error('充值 quota 失败:', error)
    message.error('配额充值失败')
  } finally {
    submitting.value = false
  }
}

const submitAdjust = async () => {
  if (!actionTarget.value) return

  submitting.value = true
  try {
    await updateQuotaUser(actionTarget.value.userId, {
      totalQuota: adjustForm.totalQuota,
      quotaType: adjustForm.quotaType,
    })
    adjustVisible.value = false
    message.success('用户配额已更新')
    await loadUsers()
    if (detailVisible.value && detailTarget.value?.userId === actionTarget.value.userId) {
      await loadUserDetail(actionTarget.value.userId)
    }
  } catch (error) {
    console.error('更新 quota 用户失败:', error)
    message.error('更新用户配额失败')
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (row: QuotaListItem) => {
  const isSuspended = row.status === 'suspended'
  try {
    await messageBox.confirm(
      isSuspended ? '确认恢复该用户的配额状态？' : '确认暂停该用户的配额状态？',
      isSuspended ? '恢复用户' : '暂停用户',
      { type: 'warning' },
    )
    if (isSuspended) {
      await activateQuotaUser(row.userId)
      message.success('用户已恢复')
    } else {
      await suspendQuotaUser(row.userId)
      message.success('用户已暂停')
    }
    await loadUsers()
    if (detailVisible.value && detailTarget.value?.userId === row.userId) {
      await loadUserDetail(row.userId)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('切换 quota 用户状态失败:', error)
      message.error('切换用户状态失败')
    }
  }
}

const goTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  void loadUsers()
})
</script>
