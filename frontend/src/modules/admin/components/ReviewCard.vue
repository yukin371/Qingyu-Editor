<template>
  <div class="review-card">
    <div class="review-header">
      <div class="review-type">
        <div class="type-icon" :class="item.contentType || item.type">
          <el-icon :size="16">
            <Notebook v-if="(item.contentType || item.type) === 'book'" />
            <DocumentCopy v-else-if="(item.contentType || item.type) === 'chapter'" />
            <ChatDotRound v-else-if="(item.contentType || item.type) === 'comment'" />
            <Document v-else />
          </el-icon>
        </div>
        <span class="type-name">{{ contentTypeName }}</span>
      </div>
      <span class="review-time">{{ formatTime(item.submittedAt) }}</span>
    </div>

    <div class="review-content">
      <h4 class="review-title">{{ item.title || '无标题' }}</h4>
      <p v-if="item.content" class="review-text">{{ truncatedContent }}</p>
      <div class="review-meta">
        <span class="meta-item">
          <el-icon><User /></el-icon>
          {{ item.submittedBy }}
        </span>
      </div>
    </div>

    <div class="review-actions">
      <el-button type="success" size="default" @click="handleApprove">
        <el-icon><Select /></el-icon>
        批准
      </el-button>
      <el-button type="danger" size="default" @click="handleReject">
        <el-icon><CloseBold /></el-icon>
        拒绝
      </el-button>
      <el-button size="default" @click="handleView">
        <el-icon><View /></el-icon>
        详情
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document, Notebook, DocumentCopy, ChatDotRound, User, Select, CloseBold, View } from '@element-plus/icons-vue'
import type { PendingReview } from '@/types/shared'
import { formatRelativeTime } from '@/utils/format.ts'

interface Props {
  item: PendingReview
}

interface Emits {
  (e: 'approve', _item: PendingReview): void
  (e: 'reject', _item: PendingReview): void
  (e: 'view', _item: PendingReview): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 内容类型名称
const contentTypeName = computed(() => {
  const typeMap: Record<string, string> = {
    document: '文档',
    book: '书籍',
    chapter: '章节',
    comment: '评论'
  }
  const contentType = props.item.contentType || props.item.type || 'document'
  return typeMap[contentType] || contentType
})

// 截断内容
const truncatedContent = computed(() => {
  if (!props.item.content) return ''
  const maxLength = 150
  return props.item.content.length > maxLength
    ? props.item.content.substring(0, maxLength) + '...'
    : props.item.content
})

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return '-'
  try {
    return formatRelativeTime(time)
  } catch {
    return time
  }
}

// 事件处理
const handleApprove = () => emit('approve', props.item)
const handleReject = () => emit('reject', props.item)
const handleView = () => emit('view', props.item)
</script>

<style scoped lang="scss">
.review-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;

  &:hover {
    border-color: transparent;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.review-type {
  display: flex;
  align-items: center;
  gap: 10px;

  .type-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &.document { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    &.book { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    &.chapter { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    &.comment { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
  }

  .type-name {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }
}

.review-time {
  font-size: 13px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 4px;
}

.review-content {
  margin-bottom: 20px;
}

.review-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
}

.review-text {
  margin: 0 0 14px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.7;
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 8px;
}

.review-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #9ca3af;
}

.review-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}
</style>
