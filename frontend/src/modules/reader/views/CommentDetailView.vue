<template>
  <div class="comment-detail-view">
    <div class="container">
      <!-- 面包屑导航 -->
      <BreadcrumbNav :items="breadcrumbs" :auto-generate="false" />

      <!-- 加载状态 -->
      <SkeletonLoader :loading="loading" :rows="8">
        <div v-if="!comment" class="error-container">
          <el-empty description="评论不存在" />
        </div>

        <div v-else class="content-wrapper">
          <!-- 返回按钮 -->
          <el-button class="back-button" @click="goBack">
            <QyIcon name="ArrowLeft" />
            返回
          </el-button>

          <!-- 主评论卡片 -->
          <el-card class="main-comment-card" shadow="never">
            <div class="main-comment">
              <!-- 用户头像 -->
              <Avatar
                size="xl"
                :src="comment.user?.avatar"
                :alt="comment.user?.nickname || comment.user?.username"
                class="user-avatar"
              />

              <!-- 评论内容 -->
              <div class="comment-content">
                <!-- 用户信息 -->
                <div class="comment-header">
                  <span class="user-name" @click="goToUserProfile(comment.user?.userId)">
                    {{ comment.user?.nickname || comment.user?.username || '匿名用户' }}
                  </span>
                  <el-tag v-if="comment.user?.role === 'writer'" size="small" type="warning">
                    作者
                  </el-tag>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>

                <!-- 评论文本 -->
                <div class="comment-text">{{ comment.content }}</div>

                <!-- 评论统计 -->
                <div class="comment-stats">
                  <el-button text @click="handleLike" :class="{ 'is-liked': comment.isLiked }">
                    <QyIcon name="Star" />
                    {{ comment.likeCount || 0 }} 点赞
                  </el-button>

                  <el-button text>
                    <QyIcon name="ChatLineRound" />
                    {{ comment.replyCount || 0 }} 回复
                  </el-button>
                </div>

                <!-- 回复输入框 -->
                <div v-if="showReplyBox" class="reply-box">
                  <el-input
                    v-model="replyContent"
                    type="textarea"
                    :rows="4"
                    placeholder="写下你的回复..."
                    maxlength="500"
                    show-word-limit
                  />
                  <div class="reply-actions">
                    <el-button size="small" @click="showReplyBox = false"> 取消 </el-button>
                    <el-button
                      type="primary"
                      size="small"
                      @click="handleReply"
                      :disabled="!replyContent.trim()"
                      :loading="submitting"
                    >
                      发送回复
                    </el-button>
                  </div>
                </div>

                <!-- 回复按钮 -->
                <el-button v-else class="reply-trigger" @click="showReplyBox = true">
                  <QyIcon name="Edit" />
                  回复这条评论
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- 回复列表 -->
          <el-card class="replies-card" shadow="never">
            <template #header>
              <div class="card-header">
                <h3>全部回复 ({{ replies.length }})</h3>
                <el-select v-model="sortBy" size="small" @change="loadReplies" style="width: 120px">
                  <el-option label="最新" value="latest" />
                  <el-option label="最热" value="hot" />
                </el-select>
              </div>
            </template>

            <div v-if="loadingReplies" class="loading-container">
              <el-skeleton :rows="5" animated />
            </div>

            <div v-else-if="replies.length === 0" class="empty-container">
              <el-empty description="还没有回复" />
            </div>

            <div v-else class="replies-list">
              <CommentTree
                v-for="reply in replies"
                :key="reply.id"
                :comment="reply"
                :is-reply="true"
                @reply="handleReplySubmit"
                @delete="handleDeleteComment"
                @like="handleLikeComment"
              />

              <!-- 加载更多 -->
              <div v-if="hasMore" class="load-more">
                <el-button @click="loadMoreReplies" :loading="loadingMore">
                  加载更多回复
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </SkeletonLoader>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { Avatar } from '@/design-system/base'
import BreadcrumbNav from '@/shared/components/common/BreadcrumbNav.vue'
import SkeletonLoader from '@/shared/components/common/SkeletonLoader.vue'
import CommentTree from '@/shared/components/common/CommentTree.vue'
import { useAuthStore } from '@/stores/auth'
import { httpService } from '@/core/services/http.service'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const commentId = computed(() => route.params.commentId as string)

// 用户信息类型定义
interface UserType {
  userId: string
  nickname?: string
  username: string
  avatar?: string
  role?: string
}

// 评论类型定义
interface CommentType {
  id: string
  content: string
  userId: string
  userName: string
  userAvatar?: string
  user?: UserType
  bookId: string
  chapterId?: string
  likeCount: number
  replyCount: number
  isLiked: boolean
  createdAt: string
  replies?: CommentType[]
}

interface ReplyType extends CommentType {
  replyToId?: string
  replyToName?: string
}

// 面包屑
const breadcrumbs = computed(() => [{ title: '首页', path: '/' }, { title: '评论详情' }])

// 状态
const loading = ref(true)
const loadingReplies = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)

// 评论数据
const comment = ref<CommentType | null>(null)
const replies = ref<ReplyType[]>([])
const sortBy = ref('latest')
const hasMore = ref(false)
const currentPage = ref(1)

// 回复相关
const showReplyBox = ref(false)
const replyContent = ref('')

// 加载评论详情
const loadComment = async () => {
  loading.value = true
  try {
    const response = await httpService.get(`/reader/comments/${commentId.value}`)
    comment.value = response.data
  } catch (error: unknown) {
    console.error('加载评论失败:', error)
    message.error('加载评论失败')
  } finally {
    loading.value = false
  }
}

// 加载回复列表
const loadReplies = async () => {
  loadingReplies.value = true
  currentPage.value = 1
  try {
    const response = await httpService.get(`/reader/comments/${commentId.value}/replies`, {
      params: {
        page: currentPage.value,
        size: 20,
        sortBy: sortBy.value,
      },
    })
    replies.value = response.data.replies || []
    hasMore.value = response.data.total > currentPage.value * 20
  } catch (error: unknown) {
    console.error('加载回复失败:', error)
    message.error('加载回复失败')
  } finally {
    loadingReplies.value = false
  }
}

// 加载更多回复
const loadMoreReplies = async () => {
  loadingMore.value = true
  currentPage.value++
  try {
    const response = await httpService.get(`/reader/comments/${commentId.value}/replies`, {
      params: {
        page: currentPage.value,
        size: 20,
        sortBy: sortBy.value,
      },
    })
    replies.value.push(...(response.data.replies || []))
    hasMore.value = response.data.total > currentPage.value * 20
  } catch (error: unknown) {
    console.error('加载回复失败:', error)
    message.error('加载回复失败')
  } finally {
    loadingMore.value = false
  }
}

// 处理点赞
const handleLike = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  if (!comment.value) {
    return
  }

  try {
    if (comment.value.isLiked) {
      await httpService.delete(`/reader/comments/${commentId.value}/like`)
      comment.value.isLiked = false
      comment.value.likeCount = Math.max(0, (comment.value.likeCount || 0) - 1)
      message.success('已取消点赞')
    } else {
      await httpService.post(`/reader/comments/${commentId.value}/like`)
      comment.value.isLiked = true
      comment.value.likeCount = (comment.value.likeCount || 0) + 1
      message.success('点赞成功')
    }
  } catch (error: unknown) {
    console.error('点赞操作失败:', error)
    message.error('操作失败')
  }
}

// 处理回复
const handleReply = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  if (!replyContent.value.trim()) {
    return
  }

  submitting.value = true
  try {
    await httpService.post(`/reader/comments/${commentId.value}/reply`, {
      content: replyContent.value.trim(),
    })
    message.success('回复成功')
    replyContent.value = ''
    showReplyBox.value = false

    // 刷新回复列表
    loadReplies()

    // 更新评论的回复数
    if (comment.value) {
      comment.value.replyCount = (comment.value.replyCount || 0) + 1
    }
  } catch (error: unknown) {
    console.error('回复失败:', error)
    message.error('回复失败')
  } finally {
    submitting.value = false
  }
}

// 处理子评论的回复
const handleReplySubmit = async (replyCommentId: string, content: string) => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  try {
    await httpService.post(`/reader/comments/${replyCommentId}/reply`, {
      content,
    })
    message.success('回复成功')

    // 刷新回复列表
    loadReplies()
  } catch (error: unknown) {
    console.error('回复失败:', error)
    message.error('回复失败')
  }
}

// 处理删除评论
const handleDeleteComment = async (deleteCommentId: string) => {
  try {
    await messageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await httpService.delete(`/reader/comments/${deleteCommentId}`)
    message.success('删除成功')

    // 刷新回复列表
    loadReplies()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }
}

// 处理点赞评论
const handleLikeComment = async (likeCommentId: string, isLike: boolean) => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  try {
    if (isLike) {
      await httpService.post(`/reader/comments/${likeCommentId}/like`)
    } else {
      await httpService.delete(`/reader/comments/${likeCommentId}/like`)
    }

    // 更新本地数据
    const updateCommentLike = (comments: ReplyType[]) => {
      for (const c of comments) {
        if (c.id === likeCommentId) {
          c.isLiked = isLike
          c.likeCount = isLike ? (c.likeCount || 0) + 1 : Math.max(0, (c.likeCount || 0) - 1)
        }
        if (c.replies) {
          updateCommentLike(c.replies)
        }
      }
    }
    updateCommentLike(replies.value)
  } catch (error: unknown) {
    console.error('点赞操作失败:', error)
    message.error('操作失败')
  }
}

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

// 返回
const goBack = () => {
  router.back()
}

// 初始化
onMounted(() => {
  loadComment()
  loadReplies()
})
</script>

<style scoped lang="scss">
.comment-detail-view {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.error-container {
  padding: 60px 0;
  text-align: center;
  background: #fff;
  border-radius: 12px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-button {
  align-self: flex-start;
}

.main-comment-card,
.replies-card {
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.main-comment {
  display: flex;
  gap: 16px;

  .user-avatar {
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.05);
    }
  }

  .comment-content {
    flex: 1;
    min-width: 0;
  }
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .user-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }

  .comment-time {
    font-size: 13px;
    color: #909399;
  }
}

.comment-text {
  font-size: 15px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 16px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;

  .el-button {
    padding: 8px 16px;
    color: #606266;

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

.reply-trigger {
  width: 100%;
  justify-content: center;
  border-style: dashed;
}

.reply-box {
  margin-top: 16px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;

  .el-textarea {
    margin-bottom: 12px;
  }

  .reply-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.replies-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .loading-container,
  .empty-container {
    padding: 40px 0;
    text-align: center;
  }

  .replies-list {
    .load-more {
      display: flex;
      justify-content: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #ebeef5;
    }
  }
}

@media (max-width: 768px) {
  .comment-detail-view {
    padding: 16px 0;
  }

  .container {
    padding: 0 16px;
  }

  .main-comment-card,
  .replies-card {
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .main-comment {
    gap: 12px;

    .user-avatar {
      width: 40px;
      height: 40px;
    }
  }

  .comment-header {
    flex-wrap: wrap;

    .user-name {
      font-size: 15px;
    }
  }

  .comment-text {
    font-size: 14px;
  }

  .comment-stats {
    gap: 16px;

    .el-button {
      font-size: 13px;
      padding: 6px 12px;
    }
  }
}
</style>
