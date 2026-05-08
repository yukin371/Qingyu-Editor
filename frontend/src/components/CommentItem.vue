<template>
  <div class="comment-item">
    <div class="comment-header">
      <div class="user-info">
        <QyAvatar :src="comment.userAvatar" size="lg" :text="comment.userName" />
        <div class="user-details">
          <div class="user-name">{{ comment.userName }}</div>
          <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
        </div>
      </div>
      <div v-if="isOwner || isAdmin" class="comment-actions">
        <el-button text size="small" @click="handleEdit">
          <QyIcon name="Edit" :size="14" />
          编辑
        </el-button>
        <el-button text size="small" type="danger" @click="handleDelete">
          <QyIcon name="Delete" :size="14" />
          删除
        </el-button>
      </div>
    </div>

    <div class="comment-body">
      <!-- 编辑模式 -->
      <div v-if="isEditing" class="edit-mode">
        <el-input
          v-model="editContent"
          type="textarea"
          :rows="3"
          placeholder="编辑评论..."
          maxlength="1000"
          show-word-limit
        />
        <div class="edit-actions">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitting"> 保存 </el-button>
        </div>
      </div>

      <!-- 显示模式 -->
      <div v-else class="comment-text">
        {{ comment.content }}
      </div>
    </div>

    <div class="comment-footer">
      <!-- 评分（如果有） -->
      <div v-if="comment.rating" class="comment-rating">
        <el-rate
          v-model="comment.rating"
          disabled
          :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
          size="small"
        />
      </div>

      <!-- 点赞/反踩 -->
      <div class="comment-interaction">
        <el-button text size="small">
          <QyIcon name="CircleCheck" :size="14" />
          {{ comment.likes || 0 }}
        </el-button>
        <el-button text size="small">
          <QyIcon name="CircleCheck" :size="14" />
          {{ comment.dislikes || 0 }}
        </el-button>
      </div>
    </div>

    <!-- 回复列表 -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
      <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
        <div class="reply-header">
          <QyAvatar :src="reply.userAvatar" size="md" :text="reply.userName" />
          <div class="reply-info">
            <span class="reply-user">{{ reply.userName }}</span>
            <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
          </div>
        </div>
        <div class="reply-content">{{ reply.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import QyAvatar from '@/design-system/components/basic/QyAvatar/QyAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import { commentsAPI } from '@/modules/reader/api/manual/comments'

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  rating?: number
  likes?: number
  dislikes?: number
  createdAt: Date | string
  updatedAt?: Date | string
  replies?: Comment[]
}

interface Emits {
  delete: [commentId: string]
  update: [commentId: string, content: string]
}

const props = defineProps<{
  comment: Comment
}>()

const emit = defineEmits<Emits>()

// 状态
const authStore = useAuthStore()
const isEditing = ref(false)
const editContent = ref('')
const submitting = ref(false)

// 从 auth store 获取用户身份
const isOwner = computed(() => authStore.user?.id === props.comment.userId)
const isAdmin = computed(() => authStore.isAdmin)

// 方法
const formatTime = (date: Date | string): string => {
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date
    // 计算相对时间
    const now = new Date()
    const diffMs = now.getTime() - parsedDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 30) return `${diffDays}天前`
    return parsedDate.toLocaleDateString('zh-CN')
  } catch {
    return '刚刚'
  }
}

const handleEdit = () => {
  editContent.value = props.comment.content
  isEditing.value = true
}

const handleDelete = () => {
  messageBox
    .confirm('确定要删除评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    .then(async () => {
      try {
        await commentsAPI.deleteComment(props.comment.id)
        emit('delete', props.comment.id)
        message.success('评论已删除')
      } catch (error: any) {
        message.error(error.message || '删除失败，请重试')
      }
    })
    .catch(() => {})
}

const submitEdit = async () => {
  if (!editContent.value.trim()) {
    message.error('评论不能为空')
    return
  }

  submitting.value = true
  try {
    await commentsAPI.updateComment(props.comment.id, {
      content: editContent.value,
    })
    emit('update', props.comment.id, editContent.value)
    isEditing.value = false
    message.success('评论已更新')
  } catch (error: any) {
    message.error(error.message || '更新失败，请重试')
  } finally {
    submitting.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}
</script>

<style scoped lang="scss">
.comment-item {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9fafb;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .user-info {
      display: flex;
      gap: 12px;
      align-items: flex-start;

      .user-details {
        .user-name {
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }

        .comment-time {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }

    .comment-actions {
      display: flex;
      gap: 8px;
    }
  }

  .comment-body {
    margin-bottom: 12px;
    margin-left: 52px;

    .edit-mode {
      :deep(.el-textarea) {
        margin-bottom: 8px;
      }

      .edit-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }

    .comment-text {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      word-break: break-word;
    }
  }

  .comment-footer {
    margin-left: 52px;
    display: flex;
    gap: 16px;
    align-items: center;
    font-size: 12px;

    .comment-rating {
      :deep(.el-rate) {
        vertical-align: middle;
      }
    }

    .comment-interaction {
      display: flex;
      gap: 8px;
    }
  }

  .replies-container {
    margin-left: 52px;
    margin-top: 16px;
    padding-left: 16px;
    border-left: 2px solid #e5e7eb;

    .reply-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .reply-header {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;

        .reply-info {
          display: flex;
          gap: 8px;
          align-items: center;

          .reply-user {
            font-weight: 600;
            color: #303133;
            font-size: 13px;
          }

          .reply-time {
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .reply-content {
        font-size: 13px;
        color: #606266;
        margin-left: 40px;
        line-height: 1.6;
      }
    }
  }
}
</style>
