<template>
  <div class="comment-item">
    <div class="comment-header">
      <Avatar size="lg" :src="comment.userAvatar" :alt="comment.username" />
      <div class="comment-info">
        <div class="user-name">{{ comment.username }}</div>
        <div class="comment-meta">
          <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          <el-rate
            v-if="comment.rating"
            v-model="comment.rating"
            disabled
            size="small"
            style="display: inline-block; margin-left: 12px;"
          />
        </div>
      </div>
      <div class="comment-actions">
        <el-dropdown v-if="isOwnComment" @command="handleCommand">
          <el-button text>
            <QyIcon name="More"  />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="delete">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="comment-content">
      {{ comment.content }}
    </div>

    <div class="comment-footer">
      <el-button text size="small" @click="toggleLike">
        <el-icon :class="{ 'is-liked': comment.isLiked }">
          <component :is="comment.isLiked ? StarFilled : Star" />
        </el-icon>
        {{ comment.likes || 0 }}
      </el-button>
      <el-button text size="small" @click="showReply = !showReply">
        <QyIcon name="ChatDotRound"  />
        回复
      </el-button>
    </div>

    <!-- 回复输入框 -->
    <div v-if="showReply" class="reply-box">
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="2"
        placeholder="写下你的回复..."
        maxlength="500"
        show-word-limit
      />
      <div class="reply-actions">
        <el-button size="small" @click="showReply = false">取消</el-button>
        <el-button size="small" type="primary" @click="submitReply" :loading="replyLoading">
          发送
        </el-button>
      </div>
    </div>

    <!-- 回复列表 -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
      <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
        <Avatar size="md" :src="reply.userAvatar" :alt="reply.username" />
        <div class="reply-content">
          <div class="reply-header">
            <span class="reply-username">{{ reply.username }}</span>
            <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
          </div>
          <div class="reply-text">{{ reply.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { StarFilled, Star } from '@element-plus/icons-vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { Avatar } from '@/design-system/base'
import { replyComment, likeComment, unlikeComment } from '@/modules/reader/api/manual/comments'
import { useAuthStore } from '@/stores/auth'

interface Comment {
  id: string
  username: string
  userAvatar?: string
  userId: string
  content: string
  rating?: number
  likes?: number
  isLiked?: boolean
  createdAt: string
  replies?: Array<{
    id: string
    username: string
    userAvatar?: string
    content: string
    createdAt: string
  }>
}

interface Props {
  comment: Comment
}

const props = defineProps<Props>()
const emit = defineEmits<{
  delete: [commentId: string]
  update: []
}>()

const authStore = useAuthStore()
const showReply = ref(false)
const replyContent = ref('')
const replyLoading = ref(false)

// 是否是自己的评论
const isOwnComment = computed(() => {
  return authStore.user?.id === props.comment.userId
})

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 点赞/取消点赞
const toggleLike = async () => {
  try {
    if (props.comment.isLiked) {
      await unlikeComment(props.comment.id)
      props.comment.likes = (props.comment.likes || 1) - 1
      props.comment.isLiked = false
    } else {
      await likeComment(props.comment.id)
      props.comment.likes = (props.comment.likes || 0) + 1
      props.comment.isLiked = true
    }
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    message.warning('请输入回复内容')
    return
  }

  replyLoading.value = true
  try {
    await replyComment(props.comment.id, replyContent.value)
    message.success('回复成功')
    replyContent.value = ''
    showReply.value = false
    emit('update')
  } catch (error: any) {
    message.error(error.message || '回复失败')
  } finally {
    replyLoading.value = false
  }
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'delete') {
    emit('delete', props.comment.id)
  }
}
</script>

<style scoped lang="scss">
.comment-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.comment-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-info {
  flex: 1;

  .user-name {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .comment-meta {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #909399;
  }
}

.comment-content {
  margin-left: 52px;
  line-height: 1.6;
  color: #606266;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.comment-footer {
  margin-left: 52px;
  display: flex;
  gap: 16px;

  .is-liked {
    color: #f56c6c;
  }
}

.reply-box {
  margin-left: 52px;
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .reply-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
}

.replies-list {
  margin-left: 52px;
  margin-top: 16px;
  padding-left: 20px;
  border-left: 2px solid #e4e7ed;
}

.reply-item {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.reply-content {
  flex: 1;

  .reply-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    .reply-username {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .reply-time {
      font-size: 12px;
      color: #909399;
    }
  }

  .reply-text {
    font-size: 14px;
    line-height: 1.6;
    color: #606266;
  }
}
</style>

