<template>
  <div class="rating-section">
    <div class="rating-header">
      <h3>评分与评价</h3>
    </div>

    <!-- 评分统计 -->
    <div class="rating-stats">
      <div class="rating-score">
        <div class="score-number">{{ averageRating.toFixed(1) }}</div>
        <el-rate v-model="averageRating" disabled show-score text-color="#ff9900" :max="5" />
        <div class="rating-count">{{ totalRatings }} 人评分</div>
      </div>

      <!-- 评分分布 -->
      <div class="rating-distribution">
        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="distribution-item">
          <span class="star-label">{{ star }}星</span>
          <el-progress
            :percentage="getRatingPercentage(star)"
            :show-text="false"
            :stroke-width="8"
          />
          <span class="count">{{ getRatingCount(star) }}</span>
        </div>
      </div>
    </div>

    <!-- 用户评分 -->
    <div v-if="isLoggedIn" class="user-rating">
      <div v-if="!userRating" class="rate-prompt">
        <p>给这本书打个分吧</p>
        <el-rate
          v-model="tempRating"
          :texts="['极差', '失望', '一般', '满意', '惊喜']"
          show-text
          @change="handleRatingChange"
          :max="5"
          :min="1"
        />
      </div>
      <div v-else class="user-rated">
        <p>你的评分</p>
        <el-rate v-model="userRating.score" disabled :max="5" />
        <el-button text type="primary" @click="editRating">修改评分</el-button>
      </div>
    </div>
    <div v-else class="login-prompt">
      <el-button type="primary" @click="goToLogin">登录后评分</el-button>
    </div>

    <!-- 评分对话框 -->
    <el-dialog v-model="showRatingDialog" title="评价这本书" width="500px">
      <el-form :model="ratingForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate
            v-model="ratingForm.score"
            :texts="['极差', '失望', '一般', '满意', '惊喜']"
            show-text
            :max="5"
            :min="1"
          />
        </el-form-item>
        <el-form-item label="评价">
          <el-input
            v-model="ratingForm.review"
            type="textarea"
            :rows="4"
            placeholder="分享你的阅读感受（选填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRatingDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRating" :loading="submitting"> 提交 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from '@/design-system/services'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  getBookRating,
  rateBook,
  getUserBookRating,
  updateRating,
} from '@/modules/reader/api/manual/rating'

interface Props {
  bookId: string
}

const props = defineProps<Props>()

const router = useRouter()
const authStore = useAuthStore()

const averageRating = ref(0)
const totalRatings = ref(0)
const ratingDistribution = ref<Record<number, number>>({
  5: 0,
  4: 0,
  3: 0,
  2: 0,
  1: 0,
})

const userRating = ref<{ score: number; review?: string } | null>(null)
const tempRating = ref(0)
const showRatingDialog = ref(false)
const submitting = ref(false)

const ratingForm = ref({
  score: 0,
  review: '',
})

const isLoggedIn = computed(() => authStore.isLoggedIn)

// 获取评分百分比
const getRatingPercentage = (star: number) => {
  if (totalRatings.value === 0) return 0
  return (ratingDistribution.value[star] / totalRatings.value) * 100
}

// 获取评分数量
const getRatingCount = (star: number) => {
  return ratingDistribution.value[star] || 0
}

// 加载评分数据
const loadRatingData = async () => {
  try {
    const response = await getBookRating(props.bookId)
    const data = response.data || response
    averageRating.value = (data as any).averageRating || (data as any).averageScore || 0
    totalRatings.value = (data as any).totalRatings || (data as any).totalCount || 0
    ratingDistribution.value = normalizeDistribution(
      (data as any).distribution || (data as any).scoreDistribution,
    )
  } catch (error) {
    console.error('加载评分数据失败:', error)
  }
}

const normalizeDistribution = (value: unknown): Record<number, number> => {
  if (Array.isArray(value)) {
    return value.reduce<Record<number, number>>(
      (acc, item) => {
        const score = Number((item as any)?.score)
        const count = Number((item as any)?.count)
        if (score >= 1 && score <= 5) {
          acc[score] = Number.isFinite(count) ? count : 0
        }
        return acc
      },
      {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    )
  }

  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>
    return {
      5: Number(source['5'] ?? source[5] ?? 0),
      4: Number(source['4'] ?? source[4] ?? 0),
      3: Number(source['3'] ?? source[3] ?? 0),
      2: Number(source['2'] ?? source[2] ?? 0),
      1: Number(source['1'] ?? source[1] ?? 0),
    }
  }

  return {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  }
}

// 加载用户评分
const loadUserRating = async () => {
  if (!isLoggedIn.value) return

  try {
    const response = await getUserBookRating(props.bookId)
    const data = response.data || response
    if (data) {
      userRating.value = data as { score: number; review?: string }
    }
  } catch (error) {
    // 用户未评分
  }
}

// 处理评分变化
const handleRatingChange = (value: number) => {
  if (value > 0) {
    ratingForm.value.score = value
    showRatingDialog.value = true
  }
}

// 编辑评分
const editRating = () => {
  ratingForm.value.score = userRating.value?.score || 0
  ratingForm.value.review = userRating.value?.review || ''
  showRatingDialog.value = true
}

// 提交评分
const submitRating = async () => {
  if (ratingForm.value.score === 0) {
    message.warning('请选择评分')
    return
  }

  submitting.value = true
  try {
    if (userRating.value) {
      await updateRating(props.bookId, ratingForm.value.score, ratingForm.value.review)
      message.success('评分已更新')
    } else {
      await rateBook(props.bookId, ratingForm.value.score, ratingForm.value.review)
      message.success('评分成功')
    }

    showRatingDialog.value = false
    tempRating.value = 0

    // 重新加载数据
    await Promise.all([loadRatingData(), loadUserRating()])
  } catch (error: any) {
    message.error(error.message || '评分失败')
  } finally {
    submitting.value = false
  }
}

// 跳转登录
const goToLogin = () => {
  router.push({ path: '/auth', query: { redirect: router.currentRoute.value.fullPath } })
}

onMounted(() => {
  loadRatingData()
  if (isLoggedIn.value) {
    loadUserRating()
  }
})
</script>

<style scoped lang="scss">
.rating-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.rating-header {
  h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.rating-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.rating-score {
  text-align: center;

  .score-number {
    font-size: 48px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 8px;
  }

  .rating-count {
    margin-top: 8px;
    font-size: 14px;
    color: #909399;
  }
}

.rating-distribution {
  flex: 1;

  .distribution-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .star-label {
      width: 40px;
      font-size: 14px;
      color: #606266;
    }

    .el-progress {
      flex: 1;
    }

    .count {
      width: 40px;
      text-align: right;
      font-size: 13px;
      color: #909399;
    }
  }
}

.user-rating {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;

  p {
    margin: 0 0 12px 0;
    font-size: 15px;
    color: #606266;
  }
}

.user-rated {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rate-prompt {
  p {
    font-size: 16px;
    font-weight: 500;
  }
}

.login-prompt {
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .rating-stats {
    flex-direction: column;
    gap: 24px;
  }
}
</style>
