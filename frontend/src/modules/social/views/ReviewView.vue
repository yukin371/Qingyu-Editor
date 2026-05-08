<template>
  <div class="review-view">
    <!-- 顶部筛选栏 -->
    <div class="header-bar">
      <div class="filter-tabs">
        <el-radio-group v-model="currentFilter" @change="loadReviews">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="book">书籍书评</el-radio-button>
          <el-radio-button value="chapter">章节书评</el-radio-button>
          <el-radio-button value="list">书单书评</el-radio-button>
        </el-radio-group>
      </div>
      <div class="sort-options">
        <el-select v-model="sortType" @change="loadReviews" style="width: 120px">
          <el-option label="最新" value="latest" />
          <el-option label="最热" value="hot" />
          <el-option label="评分" value="rating" />
        </el-select>
        <el-button type="primary" @click="showCreateDialog = true">
          <QyIcon name="Plus"  />
          写书评
        </el-button>
      </div>
    </div>

    <!-- 评分筛选 -->
    <div class="rating-filter">
      <span class="filter-label">评分：</span>
      <el-rate
        v-model="ratingFilter"
        :max="5"
        :texts="['全部', '1星', '2星', '3星', '4星', '5星']"
        show-text
        @change="loadReviews"
      />
    </div>

    <!-- 书评列表 -->
    <div v-loading="loading" class="review-list">
      <el-empty v-if="!loading && reviews.length === 0" description="暂无书评" />

      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="review-header">
          <div class="reviewer-info">
            <img :src="review.reviewer_avatar || '/default-avatar.png'" class="reviewer-avatar" />
            <div class="reviewer-details">
              <span class="reviewer-name">{{ review.reviewer_name }}</span>
              <span class="review-time">{{ formatTime(review.created_at) }}</span>
            </div>
          </div>
          <div class="review-rating">
            <el-rate v-model="review.rating" disabled show-score />
          </div>
        </div>

        <div class="review-content">
          <h3 class="review-title">{{ review.title }}</h3>
          <p class="review-text">{{ review.content }}</p>
          <el-tag v-if="review.is_spoiler" type="warning" size="small" class="spoiler-tag">
            含剧透
          </el-tag>
        </div>

        <!-- 评论对象信息 -->
        <div v-if="review.book_id" class="review-target">
          <img v-if="review.book_cover" :src="review.book_cover" class="book-cover" />
          <div class="target-info">
            <span class="target-type">{{ getTargetTypeText(review.target_type) }}</span>
            <span class="target-title">{{ review.book_title }}</span>
            <span v-if="review.chapter_title" class="chapter-title">{{ review.chapter_title }}</span>
          </div>
        </div>

        <div class="review-actions">
          <div class="action-item" @click="toggleLike(review)">
            <el-icon :class="{ 'is-liked': isReviewLiked(review) }"><QyIcon name="Star"  /></el-icon>
            <span>{{ review.like_count || 0 }}</span>
          </div>
          <div class="action-item" @click="viewComments(review)">
            <QyIcon name="ChatDotRound"  />
            <span>{{ review.comment_count || 0 }}</span>
          </div>
          <div class="action-item" @click="shareReview(review)">
            <QyIcon name="Share"  />
            <span>分享</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="loadReviews"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 创建书评对话框 -->
    <el-dialog v-model="showCreateDialog" title="写书评" width="600px">
      <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef" label-width="100px">
        <el-form-item label="评论对象" prop="target_id">
          <el-input v-model="reviewForm.target_id" placeholder="请输入书籍/章节ID" />
        </el-form-item>
        <el-form-item label="类型" prop="target_type">
          <el-select v-model="reviewForm.target_type" placeholder="请选择类型">
            <el-option label="书籍" value="book" />
            <el-option label="章节" value="chapter" />
            <el-option label="书单" value="list" />
          </el-select>
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="reviewForm.rating" :max="5" show-text />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="reviewForm.title" placeholder="请输入书评标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="6"
            placeholder="写下你的想法..."
          />
        </el-form-item>
        <el-form-item label="含剧透">
          <el-switch v-model="reviewForm.is_spoiler" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReview" :loading="submitting">发布</el-button>
      </template>
    </el-dialog>

    <!-- 评论对话框 -->
    <el-dialog v-model="showCommentsDialog" title="书评评论" width="700px">
      <div v-if="currentReview" class="comments-container">
        <div class="review-summary">
          <h4>{{ currentReview.title }}</h4>
          <p>{{ currentReview.content }}</p>
        </div>

        <el-divider />

        <div class="add-comment">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="2"
            placeholder="写下你的评论..."
          />
          <el-button type="primary" @click="submitComment" :loading="submittingComment" style="margin-top: 8px">
            发表评论
          </el-button>
        </div>

        <div v-loading="loadingComments" class="comments-list">
          <el-empty v-if="!loadingComments && comments.length === 0" description="暂无评论" />
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <img :src="comment.commenter_avatar || '/default-avatar.png'" class="commenter-avatar" />
            <div class="comment-content">
              <div class="comment-header">
                <span class="commenter-name">{{ comment.commenter_name }}</span>
                <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import * as socialAPI from '@/modules/social/api'
import {
  getReviews,
  createReview,
  likeReview,
  type Review,
  type ReviewComment,
  type ReviewType
} from '@/modules/social/api'
import { validateComment } from '@/utils/validation'

const loading = ref(false)
const reviews = ref<Review[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const currentFilter = ref('')
const sortType = ref<'latest' | 'hot' | 'rating'>('latest')
const ratingFilter = ref(0)

const showCreateDialog = ref(false)
const showCommentsDialog = ref(false)
const submitting = ref(false)
const submittingComment = ref(false)
const loadingComments = ref(false)

const reviewFormRef = ref()
const currentReview = ref<Review | null>(null)
const comments = ref<ReviewComment[]>([])
const newComment = ref('')

const reviewForm = reactive({
  target_id: '',
  target_type: '' as ReviewType,
  title: '',
  content: '',
  rating: 5,
  is_spoiler: false
})

const reviewRules = {
  target_id: [{ required: true, message: '请输入评论对象ID', trigger: 'blur' }],
  target_type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// 加载书评列表
const loadReviews = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value,
      sort: sortType.value
    }

    if (currentFilter.value) {
      params.target_type = currentFilter.value
    }

    if (ratingFilter.value > 0) {
      params.rating = ratingFilter.value
    }

    const res: any = await getReviews(params)
    const payload = res?.data || res || {}
    reviews.value = payload.items || payload.data || []
    total.value = payload.total || reviews.value.length
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 提交书评
const submitReview = async () => {
  await reviewFormRef.value?.validate()
  submitting.value = true
  try {
    const reviewData: any = {
      target_id: reviewForm.target_id,
      target_type: reviewForm.target_type,
      title: reviewForm.title,
      content: reviewForm.content,
      rating: reviewForm.rating,
      is_spoiler: reviewForm.is_spoiler
    }
    await createReview(reviewData)
    message.success('发布成功')
    showCreateDialog.value = false
    // 重置表单
    Object.assign(reviewForm, {
      target_id: '',
      target_type: '',
      title: '',
      content: '',
      rating: 5,
      is_spoiler: false
    })
    loadReviews()
  } catch (error: any) {
    message.error(error.message || '发布失败')
  } finally {
    submitting.value = false
  }
}

// 点赞/取消点赞
const toggleLike = async (review: Review) => {
  const reviewState = review as any
  try {
    if (reviewState.is_liked) {
      review.like_count = Math.max(0, (review.like_count || 0) - 1)
    } else {
      await likeReview(review.id)
      review.like_count = (review.like_count || 0) + 1
    }
    reviewState.is_liked = !reviewState.is_liked
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

const isReviewLiked = (review: Review): boolean => {
  return Boolean((review as any).is_liked)
}

// 查看评论
const viewComments = async (review: Review) => {
  currentReview.value = review
  showCommentsDialog.value = true
  loadComments()
}

// 加载评论
const loadComments = async () => {
  if (!currentReview.value) return

  loadingComments.value = true
  try {
    const api = socialAPI as any
    const res = await api.getReviewComments?.(currentReview.value.id)
    const payload = res?.data || res || {}
    comments.value = payload.items || payload.data || []
  } catch (error: any) {
    message.error(error.message || '加载评论失败')
  } finally {
    loadingComments.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!currentReview.value) return

  // 使用验证工具验证评论
  const result = validateComment(newComment.value)
  if (!result.valid) {
    message.warning(result.error || '评论内容无效')
    return
  }

  submittingComment.value = true
  try {
    const api = socialAPI as any
    if (api.addReviewComment) {
      await api.addReviewComment(currentReview.value.id, {
        content: result.sanitized!
      })
    }
    message.success('评论成功')
    newComment.value = ''
    // 更新评论数
    if (currentReview.value) {
      currentReview.value.comment_count = (currentReview.value.comment_count || 0) + 1
    }
  } catch (error: any) {
    message.error(error.message || '评论失败')
  } finally {
    submittingComment.value = false
  }
}

// 分享
const shareReview = (_review: Review) => {
  // TODO: 实现分享功能
  message.info('分享功能开发中')
}

// 分页
const handleSizeChange = () => {
  currentPage.value = 1
  loadReviews()
}

// 获取对象类型文本
const getTargetTypeText = (type: ReviewType) => {
  const types = {
    book: '书籍',
    chapter: '章节',
    list: '书单'
  }
  return types[type] || type
}

// 时间格式化
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const oneDay = 24 * 60 * 60 * 1000

  if (diff < oneDay) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < oneDay * 2) {
    return '昨天'
  } else if (diff < oneDay * 7) {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return `周${days[date.getDay()]}`
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}

onMounted(() => {
  loadReviews()
})
</script>

<style scoped lang="scss">
.review-view {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.sort-options {
  display: flex;
  gap: 12px;
}

.rating-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background: var(--el-bg-color);
  border-radius: 8px;

  .filter-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer-name {
  font-weight: 500;
  font-size: 15px;
}

.review-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.review-content {
  margin-bottom: 12px;
}

.review-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.review-text {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  white-space: pre-wrap;
}

.spoiler-tag {
  margin-top: 8px;
}

.review-target {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  margin-bottom: 12px;
}

.book-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.target-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.target-type {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.target-title {
  font-weight: 500;
  font-size: 14px;
}

.chapter-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.review-actions {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  transition: color 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }

  .is-liked {
    color: var(--el-color-warning);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.comments-container {
  .review-summary {
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    margin-bottom: 16px;

    h4 {
      margin: 0 0 8px;
    }

    p {
      margin: 0;
      color: var(--el-text-color-secondary);
    }
  }

  .add-comment {
    margin-bottom: 20px;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 400px;
    overflow-y: auto;
  }

  .comment-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }

  .commenter-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .comment-content {
    flex: 1;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .commenter-name {
    font-weight: 500;
    font-size: 14px;
  }

  .comment-time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .comment-text {
    margin: 0;
    font-size: 14px;
  }
}
</style>
