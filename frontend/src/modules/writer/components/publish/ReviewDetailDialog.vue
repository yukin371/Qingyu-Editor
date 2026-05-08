<script setup lang="ts">
/**
 * 审核详情对话框
 * 使用 QyDialog (Apple 风格) 替代 el-dialog
 */
import { ref, watch } from 'vue'
import { QyDialog, QyButton } from '@/design-system/components'
import { Tag } from '@/design-system/base'

export interface ReviewDetail {
  id: string
  chapter_title: string
  chapter_number: number
  status: string
  submitted_at: string
  reviewed_at: string | null
  reviewer_name: string | null
  review_comment: string | null
}

const props = defineProps<{
  visible: boolean
  detail: ReviewDetail | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'resubmit'): void
}>()

// 本地 visible 状态
const localVisible = ref(props.visible)

watch(() => props.visible, (v) => {
  localVisible.value = v
})

watch(localVisible, (v) => {
  emit('update:visible', v)
})

// 辅助函数
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getReviewStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return map[status] || status
}

const getReviewStatusType = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status] || 'info'
}

const handleResubmit = () => {
  emit('resubmit')
}
</script>

<template>
  <QyDialog
    v-model:visible="localVisible"
    title="审核详情"
    size="md"
    :show-close="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
  >
    <div v-if="detail" class="review-detail">
      <!-- 章节信息 -->
      <div class="info-section">
        <h4 class="section-title">基本信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">章节标题</span>
            <span class="info-value">{{ detail.chapter_title }}</span>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">章节号</span>
              <span class="info-value">第 {{ detail.chapter_number }} 章</span>
            </div>
            <div class="info-item">
              <span class="info-label">审核状态</span>
              <Tag :variant="getReviewStatusType(detail.status)">
                {{ getReviewStatusLabel(detail.status) }}
              </Tag>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">提交时间</span>
              <span class="info-value">{{ formatDate(detail.submitted_at) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">审核时间</span>
              <span class="info-value">{{ detail.reviewed_at ? formatDate(detail.reviewed_at) : '-' }}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">审核人</span>
            <span class="info-value">{{ detail.reviewer_name || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 审核意见 -->
      <div v-if="detail.review_comment" class="info-section">
        <h4 class="section-title">审核意见</h4>
        <div class="review-comment">
          {{ detail.review_comment }}
        </div>
      </div>
    </div>

    <template #footer>
      <QyButton variant="secondary" @click="localVisible = false">
        关闭
      </QyButton>
      <QyButton
        v-if="detail?.status === 'rejected'"
        variant="primary"
        @click="handleResubmit"
      >
        重新提交
      </QyButton>
    </template>
  </QyDialog>
</template>

<style scoped>
.review-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin: 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #94a3b8;
}

.info-value {
  font-size: 14px;
  color: #0f172a;
}

.review-comment {
  white-space: pre-wrap;
  word-break: break-word;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
}
</style>
