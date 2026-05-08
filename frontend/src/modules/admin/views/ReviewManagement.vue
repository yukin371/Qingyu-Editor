<template>
  <div class="review-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">内容审核</h2>
        <p class="page-subtitle">按作者跟进审核用户提交的书籍、章节、评论等内容</p>
      </div>
      <QyButton :icon="refreshIconSvg" @click="loadReviews"> 刷新 </QyButton>
    </div>

    <!-- 统计卡片 -->
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
          <span class="stat-value">{{ stats.pending }}</span>
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
          <span class="stat-value">{{ stats.approved }}</span>
          <span class="stat-label">已通过</span>
        </div>
      </div>
      <div class="stat-item rejected">
        <div class="stat-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.rejected }}</span>
          <span class="stat-label">已拒绝</span>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <div class="filters-main">
        <div class="filter-group filter-block">
          <span class="filter-label">内容类型</span>
          <QySelect
            v-model="filters.contentType"
            :options="contentTypeOptions"
            placeholder="全部类型"
            clearable
            class="admin-select"
            @update:model-value="handleFilterChange"
          />
        </div>

        <div class="filter-group filter-block">
          <span class="filter-label">关键词</span>
          <QyInput
            v-model="filters.keyword"
            placeholder="搜索标题或内容"
            clearable
            :prefix-icon="searchIconSvg"
            @clear="handleFilterChange"
            @keyup.enter="handleFilterChange"
          />
        </div>

        <div class="filter-group filter-block">
          <span class="filter-label">作者</span>
          <QySelect
            v-model="filters.author"
            :options="authorOptionsData"
            placeholder="全部作者"
            clearable
            class="admin-select"
            @update:model-value="handleFilterChange"
          />
        </div>
      </div>

      <div class="filters-actions">
        <QyButton variant="primary" :icon="searchBtnIconSvg" @click="handleFilterChange">
          搜索
        </QyButton>
      </div>
    </div>

    <!-- 待审核列表 -->
    <div
      class="review-list"
      :class="{ 'is-loading': loading, 'is-empty': reviews.length === 0 && !loading }"
    >
      <!-- 加载遮罩 -->
      <Transition name="fade">
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner" />
        </div>
      </Transition>

      <Empty v-if="reviews.length === 0 && !loading" description="暂无待审核内容">
        <template #image>
          <svg
            class="w-16 h-16 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </template>
      </Empty>

      <ReviewCard
        v-for="item in reviews"
        :key="item.reviewId"
        :item="item"
        @approve="handleApprove"
        @reject="handleReject"
        @view="handleView"
      />
    </div>

    <!-- 分页 -->
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
            loadReviews()
          }
        "
      />
    </div>

    <!-- 审核详情对话框 -->
    <Dialog
      v-model:visible="dialogVisible"
      :title="`审核详情 - ${currentItem?.title || '无标题'}`"
      size="lg"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div v-if="currentItem" class="review-detail">
        <div class="detail-header">
          <div class="detail-type" :class="currentItem.contentType">
            {{ getTypeName(currentItem.contentType) }}
          </div>
          <div class="detail-time">{{ currentItem.submittedAt }}</div>
        </div>

        <div class="detail-info">
          <div class="info-item">
            <span class="info-label">提交者</span>
            <span class="info-value">{{ currentItem.submittedBy }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">内容ID</span>
            <span class="info-value code">{{ currentItem.contentId }}</span>
          </div>
        </div>

        <div v-if="currentItem.content" class="content-preview">
          <h4>内容预览</h4>
          <div class="content-text">{{ currentItem.content }}</div>
        </div>
      </div>

      <template #footer>
        <QyButton @click="dialogVisible = false">关闭</QyButton>
        <QyButton variant="danger" :icon="closeIconSvg" @click="handleReject(currentItem!)">
          拒绝
        </QyButton>
        <QyButton variant="primary" :icon="checkIconSvg" @click="handleApprove(currentItem!)">
          批准
        </QyButton>
      </template>
    </Dialog>

    <!-- 拒绝原因对话框 -->
    <Dialog
      v-model:visible="rejectDialogVisible"
      title="拒绝原因"
      size="md"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="reject-form">
        <label class="form-label">
          <span class="label-text">拒绝原因</span>
          <span class="label-required">*</span>
        </label>
        <div class="textarea-wrapper">
          <textarea
            v-model="rejectForm.reason"
            class="reason-textarea"
            :class="{ 'has-error': rejectForm.reason && rejectForm.reason.length > 200 }"
            placeholder="请输入拒绝原因，将通知提交者"
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
        <QyButton variant="danger" :loading="submitting" @click="confirmReject">确认拒绝</QyButton>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { QyButton } from '@/design-system/components/basic/QyButton'
import { QyInput } from '@/design-system/components/basic/QyInput'
import { QySelect } from '@/design-system/components/basic/QySelect'
import { Dialog } from '@/design-system/feedback/Dialog'
import { Empty } from '@/design-system/base/Empty'
import { Pagination } from '@/design-system/data/Pagination'
import ReviewCard from '@admin/components/ReviewCard.vue'
import * as adminAPI from '@/modules/admin/api'
import type { PendingReview } from '@/types/shared'

// === SVG 图标常量 ===
const searchIconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`
const refreshIconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`
const closeIconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`
const checkIconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`
const searchBtnIconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`

const stats = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
})

// 筛选器
const filters = reactive({
  contentType: '',
  keyword: '',
  author: '',
})

// 筛选选项 - QySelect 使用 label/value 结构
const contentTypeOptions = [
  { label: '全部', value: '' },
  { label: '书籍', value: 'book' },
  { label: '章节', value: 'chapter' },
  { label: '文档', value: 'document' },
  { label: '评论', value: 'comment' },
]

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
})

// 数据
const loading = ref(false)
const reviews = ref<any[]>([])
const total = ref(0)

// 作者选项 - 从列表动态生成，但需要 label/value 结构
const authorOptionsData = computed(() => {
  const set = new Set<string>()
  reviews.value.forEach((item) => {
    const name = String(item.submittedBy || item.submitterName || '').trim()
    if (name) set.add(name)
  })
  return [
    { label: '全部', value: '' },
    ...Array.from(set).map((name) => ({ label: name, value: name })),
  ]
})

// 对话框
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentItem = ref<PendingReview | null>(null)
const submitting = ref(false)

// 拒绝表单
const rejectForm = reactive({
  reason: '',
})

type ReviewContentType = 'book' | 'chapter' | 'document' | 'comment'

// 获取类型名称
const getTypeName = (type?: string): string => {
  if (!type) return '-'
  const typeMap: Record<string, string> = {
    book: '书籍',
    chapter: '章节',
    document: '文档',
    comment: '评论',
  }
  return typeMap[type] || type
}

const normalizeReviewItem = (item: any) => {
  const reviewId = item.reviewId || item.id || item.auditId || item.targetId || item.contentId || ''
  const contentType = (item.contentType ||
    item.type ||
    item.targetType ||
    'document') as ReviewContentType
  const submittedAt =
    item.submittedAt || item.createdAt || item.submit_time || item.created_at || ''

  return {
    ...item,
    reviewId,
    contentId: item.contentId || item.targetId || item.resourceId || item.content_id || '',
    targetId: item.targetId || item.contentId || item.resourceId || item.target_id || '',
    title: item.title || item.name || item.contentTitle || '未命名内容',
    content: item.content || item.preview || item.summary || '',
    submittedBy:
      item.submittedBy ||
      item.submitterName ||
      item.authorName ||
      item.submitter_name ||
      '未知提交者',
    submitterName:
      item.submitterName ||
      item.submittedBy ||
      item.authorName ||
      item.submitter_name ||
      '未知提交者',
    contentType,
    type: contentType,
    submittedAt,
    createdAt: item.createdAt || submittedAt,
  }
}

const applyFrontendFilters = (source: any[]) => {
  let filtered = [...source]

  if (filters.contentType) {
    filtered = filtered.filter((item) => item.contentType === filters.contentType)
  }

  const keyword = filters.keyword.trim().toLowerCase()
  if (keyword) {
    filtered = filtered.filter((item) => {
      const title = String(item.title || '').toLowerCase()
      const content = String(item.content || '').toLowerCase()
      const submitter = String(item.submittedBy || item.submitterName || '').toLowerCase()
      return title.includes(keyword) || content.includes(keyword) || submitter.includes(keyword)
    })
  }

  if (filters.author) {
    filtered = filtered.filter(
      (item) => String(item.submittedBy || item.submitterName || '') === filters.author,
    )
  }

  return filtered
}

const loadReviewStats = async () => {
  try {
    const response = await adminAPI.getAuditStatistics()
    const data = (response as any)?.data ?? response ?? {}
    stats.pending = Number(data.pending ?? 0)
    stats.approved = Number(data.approved ?? 0)
    stats.rejected = Number(data.rejected ?? 0)
  } catch (error) {
    console.error('加载审核统计失败:', error)
    stats.pending = 0
    stats.approved = 0
    stats.rejected = 0
  }
}

// 加载审核列表
const loadReviews = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      page_size: pagination.pageSize,
    }

    if (filters.contentType) {
      params.content_type = filters.contentType
    }
    if (filters.author) {
      params.submitter_name = filters.author
    }

    const response = (await adminAPI.getPendingReviews(params)) as any
    const rawData = response?.data ?? response ?? []
    const rawList = Array.isArray(rawData) ? rawData : rawData.items || rawData.list || []
    const normalized = rawList.map(normalizeReviewItem)
    const filtered = applyFrontendFilters(normalized)

    reviews.value = filtered
    total.value =
      filters.keyword || filters.author
        ? filtered.length
        : Number(rawData.total ?? rawData.pagination?.total ?? filtered.length)
  } catch (error) {
    console.error('加载审核列表失败:', error)
    reviews.value = []
    total.value = 0
    message.error('加载审核列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadReviews()
}

// 查看详情
const handleView = (item: PendingReview) => {
  currentItem.value = item
  dialogVisible.value = true
}

// 批准
const handleApprove = async (item: PendingReview) => {
  try {
    await messageBox.confirm('确认批准该内容吗？批准后将自动发布。', '确认批准', {
      confirmButtonText: '确认批准',
      cancelButtonText: '取消',
      type: 'confirm',
      center: true,
      closeOnClickModal: false,
      closeOnPressEscape: true,
    })

    await adminAPI.reviewContent(item.contentId || item.targetId, {
      approved: true,
    })

    message.success('批准成功，内容已发布')
    dialogVisible.value = false
    await Promise.all([loadReviewStats(), loadReviews()])
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批准失败:', error)
      message.error('批准失败')
    }
  }
}

// 拒绝
const handleReject = (item: PendingReview) => {
  currentItem.value = item
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    message.warning('请输入拒绝原因')
    return
  }

  if (!currentItem.value) return

  submitting.value = true
  try {
    await adminAPI.reviewContent(currentItem.value.contentId || currentItem.value.targetId, {
      approved: false,
      reason: rejectForm.reason,
    })

    message.success('已拒绝该内容')
    rejectDialogVisible.value = false
    dialogVisible.value = false
    await Promise.all([loadReviewStats(), loadReviews()])
  } catch (error) {
    console.error('拒绝失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void Promise.all([loadReviewStats(), loadReviews()])
})
</script>

<style scoped lang="scss">
.review-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  .header-info {
    .page-title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .page-subtitle {
      margin: 8px 0 0;
      color: #6b7280;
      font-size: 14px;
    }
  }
}

// 统计卡片
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #fff;
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
    color: #1a1a2e;
  }

  .stat-label {
    font-size: 13px;
    color: #9ca3af;
  }

  &.pending .stat-icon {
    background: #fef3c7;
    color: #d97706;
  }
  &.approved .stat-icon {
    background: #d1fae5;
    color: #059669;
  }
  &.rejected .stat-icon {
    background: #fee2e2;
    color: #dc2626;
  }
}

// 筛选器
.filters-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.filters-main {
  display: flex;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;

  &.filter-block {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.filters-actions {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.admin-select {
  min-width: 140px;

  :deep(.qy-select__trigger) {
    height: 36px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #fff;
  }
}

// 待审核列表
.review-list {
  position: relative;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.review-list.is-empty {
  align-items: center;
  justify-content: center;
  padding: 20px;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 分页
.pagination-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.pagination-total {
  font-size: 14px;
  color: #6b7280;
}

// 详情弹窗内容
.review-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-type {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;

  &.book {
    background: #d1fae5;
    color: #059669;
  }
  &.chapter {
    background: #fef3c7;
    color: #d97706;
  }
  &.document {
    background: #e0e7ff;
    color: #4f46e5;
  }
  &.comment {
    background: #f3e8ff;
    color: #7c3aed;
  }
}

.detail-time {
  font-size: 13px;
  color: #9ca3af;
}

.detail-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.info-value {
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

.content-preview {
  h4 {
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }
}

.content-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.7;
  background: #f9fafb;
  padding: 14px 18px;
  border-radius: 8px;
  white-space: pre-wrap;
  max-height: 240px;
  overflow-y: auto;
}

// 拒绝表单
.reject-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

// 适配 admin 模块选择器样式
:deep(.admin-select-popper) {
  z-index: 2000;
}
</style>
