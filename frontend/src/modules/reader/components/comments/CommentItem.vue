<template>
  <div class="comment-item">
    <Avatar class="user-avatar" :src="comment.avatar" :alt="comment.username" size="lg" />

    <div class="comment-content">
      <div class="comment-header">
        <span class="username">{{ comment.username }}</span>
        <span class="time">{{ formatTime(comment.createdAt) }}</span>
      </div>

      <!-- 文字评论 -->
      <p v-if="comment.content" class="text">
        {{ comment.content }}
      </p>

      <!-- 表情评论 -->
      <div v-else-if="comment.emoji" class="emoji">
        {{ comment.emoji }}
      </div>

      <div v-if="comment.replyToUsername" class="reply-to">
        回复 @{{ comment.replyToUsername }}
      </div>

      <div class="comment-actions">
        <el-button
          text
          :type="comment.likedByMe ? 'primary' : 'default'"
          @click="$emit('like', comment.id)"
        >
          点赞 {{ comment.likes || 0 }}
        </el-button>
        <el-button
          text
          @click="$emit('reply', { commentId: comment.id, username: comment.username })"
        >
          回复
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ParagraphComment } from '@/types/reader/index'
import { Avatar } from '@/design-system/base'

interface Props {
  comment: ParagraphComment
}

defineProps<Props>()

defineEmits<{
  like: [commentId: string]
  reply: [data: { commentId: string; username: string }]
}>()

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
}
</script>

<style scoped lang="scss">
.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--el-fill-color-light, #f8fafc);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

:deep(.user-avatar) {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .username {
    font-weight: 500;
    color: var(--el-text-color-primary, #111827);
  }

  .time {
    font-size: 12px;
    color: var(--el-text-color-secondary, #6b7280);
  }
}

.text {
  margin: 8px 0;
  line-height: 1.6;
  word-break: break-word;
}

.emoji {
  font-size: 32px;
  margin: 8px 0;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.reply-to {
  margin-top: 2px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
}
</style>
