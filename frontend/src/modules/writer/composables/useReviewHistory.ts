/**
 * 审核历史相关的逻辑
 */
import { ref, reactive } from 'vue'
import {
  getReviewStatistics,
  getReviewHistory,
  resubmitReview as apiResubmitReview,
} from '../api/dashboard'

export interface ReviewStats {
  total: number
  approved: number
  approvedRate: number
  rejected: number
  rejectedRate: number
  pending: number
}

export interface ReviewRecord {
  id: string
  chapter_title: string
  chapter_number: number
  status: string
  submitted_at: string
  reviewed_at: string | null
  reviewer_name: string | null
  review_comment: string | null
}

export function useReviewHistory() {
  const loadingReview = ref(false)
  const reviewHistory = ref<ReviewRecord[]>([])
  const reviewPage = ref(1)
  const reviewPageSize = ref(20)
  const reviewTotal = ref(0)
  const reviewFilter = reactive({ status: '' })
  const reviewTrendPeriod = ref('7d')
  const reviewDetailDialogVisible = ref(false)
  const currentReviewDetail = ref<ReviewRecord | null>(null)

  const reviewStats = reactive<ReviewStats>({
    total: 0,
    approved: 0,
    approvedRate: 0,
    rejected: 0,
    rejectedRate: 0,
    pending: 0,
  })

  // 加载审核统计
  const loadReviewStats = async () => {
    try {
      const stats = await getReviewStatistics()
      reviewStats.total = stats.total
      reviewStats.approved = stats.approved
      reviewStats.approvedRate = stats.approvedRate
      reviewStats.rejected = stats.rejected
      reviewStats.rejectedRate = stats.rejectedRate
      reviewStats.pending = stats.pending
    } catch (error: unknown) {
      console.error('加载审核统计失败', error)
    }
  }

  // 加载审核历史
  const loadReviewHistory = async () => {
    loadingReview.value = true
    try {
      const response = await getReviewHistory({
        page: reviewPage.value,
        pageSize: reviewPageSize.value,
        status: reviewFilter.status || undefined,
      })
      reviewHistory.value = response.items as ReviewRecord[]
      reviewTotal.value = response.total
    } catch (error: unknown) {
      console.error('加载审核历史失败', error)
      reviewHistory.value = []
    } finally {
      loadingReview.value = false
    }
  }

  // 查看审核详情
  const viewReviewDetail = (row: ReviewRecord) => {
    currentReviewDetail.value = row
    reviewDetailDialogVisible.value = true
  }

  // 关闭审核详情
  const closeReviewDetail = () => {
    reviewDetailDialogVisible.value = false
  }

  // 重新提交审核
  const resubmitReview = async () => {
    if (!currentReviewDetail.value) return
    try {
      await apiResubmitReview(currentReviewDetail.value.id)
      reviewDetailDialogVisible.value = false
      // 刷新列表
      await loadReviewHistory()
    } catch (error: unknown) {
      console.error('重新提交审核失败', error)
    }
  }

  return {
    loadingReview,
    reviewHistory,
    reviewPage,
    reviewPageSize,
    reviewTotal,
    reviewFilter,
    reviewTrendPeriod,
    reviewDetailDialogVisible,
    currentReviewDetail,
    reviewStats,
    loadReviewStats,
    loadReviewHistory,
    viewReviewDetail,
    closeReviewDetail,
    resubmitReview,
  }
}
