<template>
  <div class="comment-tree">
    <!-- 评论项 -->
    <div class="comment-item" :class="{ 'is-reply': isReply }">
      <!-- 用户头像 -->
      <QyAvatar :size="isReply ? 'md' : 'lg'" :src="comment.user?.avatar" :text="comment.user?.nickname || comment.user?.username" class="comment-avatar" />

      <!-- 评论内容 -->
      <div class="comment-content">
        <!-- 用户信息和时间 -->
        <div class="comment-header">
          <span class="user-name" @click="goToUserProfile(comment.user?.userId)">
            {{ comment.user?.nickname || comment.user?.username || '匿名用户' }}
          </span>
          <el-tag v-if="comment.user?.role === 'writer'" size="small" type="warning">作者</el-tag>
          <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
        </div>

        <!-- 评论文本 -->
        <div class="comment-text">{{ comment.content }}</div>

        <!-- 评论操作 -->
        <div class="comment-actions">
          <el-button
            text
            size="small"
            @click="handleLike"
            :class="{ 'is-liked': comment.isLiked }"
          >
            <QyIcon name="Star"  />
            {{ comment.likeCount || 0 }}
          </el-button>

          <el-button text size="small" @click="showReplyBox = !showReplyBox">
            <QyIcon name="ChatLineRound"  />
            回复 {{ (comment.replyCount ?? 0) > 0 ? `(${comment.replyCount})` : '' }}
          </el-button>

          <el-button
            v-if="canDelete"
            text
            size="small"
            type="danger"
            @click="handleDelete"
          >
            <QyIcon name="Delete"  />
            删除
          </el-button>
        </div>

        <!-- 回复输入框 -->
        <div v-if="showReplyBox" class="reply-box">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的回复..."
            maxlength="500"
            show-word-limit
          />
          <div class="reply-actions">
            <el-button size="small" @click="showReplyBox = false">取消</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleReply"
              :disabled="!replyContent.trim()"
            >
              发送
            </el-button>
          </div>
        </div>

        <!-- 递归渲染子评论 -->
        <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
          <CommentTree
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
            :is-reply="true"
            :max-depth="maxDepth"
            :current-depth="currentDepth + 1"
            @reply="handleReplySubmit"
            @delete="handleDeleteComment"
            @like="handleLikeComment"
          />
        </div>

        <!-- 加载更多回复 -->
        <div v-if="comment.hasMoreReplies" class="load-more-replies">
          <el-button text size="small" @click="loadMoreReplies">
            <QyIcon name="ArrowDown"  />
            加载更多回复
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import QyAvatar from '@/design-system/components/basic/QyAvatar/QyAvatar.vue'
import { useAuthStore } from '@/stores/auth'

interface Comment {
  id: string
  content: string
  user?: {
    userId: string
    username: string
    nickname?: string
    avatar?: string
    role?: string
  }
  createdAt: string
  likeCount?: number
  replyCount?: number
  isLiked?: boolean
  replies?: Comment[]
  hasMoreReplies?: boolean
}

interface Props {
  comment: Comment
  isReply?: boolean
  maxDepth?: number
  currentDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
  isReply: false,
  maxDepth: 3,
  currentDepth: 0
})

const emit = defineEmits<{
  reply: [commentId: string, content: string]
  delete: [commentId: string]
  like: [commentId: string, isLike: boolean]
}>()

const router = useRouter()
const authStore = useAuthStore()

const showReplyBox = ref(false)
const replyContent = ref('')

// 是否可以删除（自己的评论或管理员）
const canDelete = computed(() => {
  const currentUserId = authStore.user?.id
  const commentUserId = props.comment.user?.userId
  const isAdmin = authStore.user?.role === 'admin'
  return currentUserId === commentUserId || isAdmin
})

// 格式化时间
const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

  return date.toLocaleDateString('zh-CN')
}

// 前往用户主页
const goToUserProfile = (userId?: string) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}

// 处理点赞
const handleLike = () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }
  emit('like', props.comment.id, !props.comment.isLiked)
}

// 处理回复
const handleReply = () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }
  if (!replyContent.value.trim()) {
    return
  }
  emit('reply', props.comment.id, replyContent.value.trim())
  replyContent.value = ''
  showReplyBox.value = false
}

// 处理删除
const handleDelete = () => {
  emit('delete', props.comment.id)
}

// 处理子评论的回复
const handleReplySubmit = (commentId: string, content: string) => {
  emit('reply', commentId, content)
}

// 处理子评论的删除
const handleDeleteComment = (commentId: string) => {
  emit('delete', commentId)
}

// 处理子评论的点赞
const handleLikeComment = (commentId: string, isLike: boolean) => {
  emit('like', commentId, isLike)
}

// 加载更多回复
const loadMoreReplies = () => {
  // TODO: 实现加载更多回复的逻辑
  message.info('加载更多回复功能开发中')
}
</script>

<style scoped lang="scss">
.comment-tree {
  width: 100%;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;

  &.is-reply {
    padding: 12px 0;
    border-bottom: none;

    &:last-child {
      border-bottom: none;
    }
  }
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }

  .comment-time {
    font-size: 12px;
    color: #909399;
  }
}

.comment-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 16px;

  .el-button {
    padding: 4px 8px;
    color: #909399;

    &:hover {
      color: #409eff;
      background-color: #ecf5ff;
    }

    &.is-liked {
      color: #f56c6c;

      .el-icon {
        color: #f56c6c;
      }
    }
  }
}

.reply-box {
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;

  .el-textarea {
    margin-bottom: 8px;
  }

  .reply-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

.comment-replies {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid #ebeef5;
}

.load-more-replies {
  margin-top: 12px;
  text-align: center;

  .el-button {
    color: #409eff;

    &:hover {
      background-color: #ecf5ff;
    }
  }
}

@media (max-width: 768px) {
  .comment-item {
    gap: 8px;

    &.is-reply {
      padding: 8px 0;
    }
  }

  .comment-replies {
    padding-left: 12px;
  }

  .comment-actions {
    flex-wrap: wrap;
    gap: 8px;

    .el-button {
      font-size: 12px;
    }
  }
}
</style>

