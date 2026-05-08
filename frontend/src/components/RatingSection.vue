<template>
  <div class="rating-section">
    <div class="rating-overview">
      <div class="rating-display">
        <div class="rating-score">
          <span class="score-value">{{ averageRating.toFixed(1) }}</span>
          <span class="score-unit">/5</span>
        </div>
        <div class="rating-stars">
          <el-rate
            v-model="averageRating"
            disabled
            :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
            :allow-half="true"
          />
        </div>
        <div class="rating-count">基于 {{ totalRatings }} 个评分</div>
      </div>
    </div>

    <div class="rating-distribution">
      <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="distribution-item">
        <span class="star-label">{{ star }} 星</span>
        <el-progress :percentage="getRatingPercentage(star)" :show-text="false" :stroke-width="8" />
        <span class="star-count">{{ getRatingCount(star) }}</span>
      </div>
    </div>

    <div v-if="!isLoggedIn" class="login-hint">
      <p>登录后可为本书评分</p>
    </div>

    <div v-else-if="userRating && !editing" class="your-rating">
      <p>你的评分：</p>
      <el-rate
        :model-value="userRating.score"
        disabled
        :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
      />
      <p v-if="userRating.review" class="your-review">{{ userRating.review }}</p>
      <div class="rating-actions">
        <el-button text @click="startEditing">修改评分</el-button>
        <el-button text type="danger" :loading="deleting" @click="removeRating">删除评分</el-button>
      </div>
    </div>

    <div v-else class="user-rating">
      <div class="rating-prompt">
        <p>{{ userRating ? '修改你的评分' : '还没有评分？分享你的看法' }}</p>
        <el-rate v-model="draft.score" :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']" size="large" />
      </div>
      <el-input
        v-model="draft.review"
        type="textarea"
        :rows="3"
        maxlength="300"
        show-word-limit
        placeholder="可选：写下你的评分理由"
      />
      <div class="rating-actions">
        <el-button
          type="primary"
          @click="submitRating"
          :loading="submitting"
          :disabled="draft.score === 0"
        >
          {{ userRating ? '更新评分' : '提交评分' }}
        </el-button>
        <el-button v-if="userRating" @click="cancelEditing">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { message } from '@/design-system/services'
import { useAuthStore } from '@/stores/auth'
import {
  deleteRating,
  getBookRating,
  getUserBookRating,
  rateBook,
  updateRating,
} from '@/modules/reader/api/manual/rating'

interface Props {
  bookId: string
}

interface UserRatingState {
  id?: string
  score: number
  review?: string
}

const props = defineProps<Props>()
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
const userRating = ref<UserRatingState | null>(null)
const draft = ref({
  score: 0,
  review: '',
})
const editing = ref(false)
const submitting = ref(false)
const deleting = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)

const getRatingCount = (star: number): number => ratingDistribution.value[star] || 0

const getRatingPercentage = (star: number): number => {
  if (totalRatings.value <= 0) return 0
  return Math.round((getRatingCount(star) / totalRatings.value) * 100)
}

const normalizeDistribution = (value: unknown): Record<number, number> => {
  const base = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  }

  if (Array.isArray(value)) {
    return value.reduce<Record<number, number>>((acc, item) => {
      const score = Number((item as any)?.score)
      const count = Number((item as any)?.count)
      if (score >= 1 && score <= 5) {
        acc[score] = Number.isFinite(count) ? count : 0
      }
      return acc
    }, base)
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

  return base
}

const loadRatingSummary = async () => {
  const response = await getBookRating(props.bookId)
  const data = response.data || response
  averageRating.value = Number((data as any).averageRating ?? (data as any).averageScore ?? 0)
  totalRatings.value = Number((data as any).totalRatings ?? (data as any).totalCount ?? 0)
  ratingDistribution.value = normalizeDistribution(
    (data as any).distribution ?? (data as any).scoreDistribution,
  )
}

const loadUserRating = async () => {
  if (!isLoggedIn.value) {
    userRating.value = null
    editing.value = false
    return
  }

  const response = await getUserBookRating(props.bookId)
  const data = response.data || response
  if (!data) {
    userRating.value = null
    editing.value = false
    draft.value = { score: 0, review: '' }
    return
  }

  const score = Number((data as any).score ?? (data as any).rating ?? 0)
  const review = String((data as any).review ?? '')
  const id = (data as any).id ? String((data as any).id) : ''

  if (!id && score <= 0 && !review) {
    userRating.value = null
    editing.value = false
    draft.value = { score: 0, review: '' }
    return
  }

  userRating.value = {
    id,
    score,
    review,
  }

  if (!editing.value) {
    draft.value = {
      score: userRating.value.score,
      review: userRating.value.review || '',
    }
  }
}

const loadAll = async () => {
  try {
    await loadRatingSummary()
    await loadUserRating()
  } catch (error) {
    console.error('加载评分失败:', error)
  }
}

const startEditing = () => {
  if (!userRating.value) return
  draft.value = {
    score: userRating.value.score,
    review: userRating.value.review || '',
  }
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
  draft.value = {
    score: userRating.value?.score || 0,
    review: userRating.value?.review || '',
  }
}

const submitRating = async () => {
  if (draft.value.score <= 0) {
    message.warning('请选择评分')
    return
  }

  submitting.value = true
  try {
    if (userRating.value?.id) {
      await updateRating(userRating.value.id, draft.value.score, draft.value.review)
      message.success('评分已更新')
    } else {
      await rateBook(props.bookId, draft.value.score, draft.value.review)
      message.success('评分提交成功')
    }
    editing.value = false
    await loadAll()
  } catch (error: any) {
    message.error(error?.message || '评分失败，请重试')
  } finally {
    submitting.value = false
  }
}

const removeRating = async () => {
  if (!userRating.value?.id) {
    message.error('评分记录不存在')
    return
  }

  deleting.value = true
  try {
    await deleteRating(userRating.value.id)
    userRating.value = null
    draft.value = { score: 0, review: '' }
    editing.value = false
    message.success('评分已删除')
    await loadRatingSummary()
  } catch (error: any) {
    message.error(error?.message || '删除评分失败')
  } finally {
    deleting.value = false
  }
}

watch(
  () => props.bookId,
  () => {
    void loadAll()
  },
)

watch(
  () => isLoggedIn.value,
  () => {
    void loadUserRating()
  },
)

onMounted(() => {
  void loadAll()
})
</script>

<style scoped lang="scss">
.rating-section {
  padding: 20px;

  .rating-overview {
    text-align: center;
    margin-bottom: 32px;

    .rating-score {
      font-size: 48px;
      font-weight: bold;
      color: #f7ba2a;
      margin-bottom: 12px;

      .score-unit {
        font-size: 24px;
        color: #999;
      }
    }

    .rating-stars {
      margin-bottom: 12px;
    }

    .rating-count {
      color: #999;
      font-size: 14px;
    }
  }

  .rating-distribution {
    margin-bottom: 32px;

    .distribution-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .star-label {
        min-width: 40px;
        text-align: right;
      }

      :deep(.el-progress) {
        flex: 1;
      }

      .star-count {
        min-width: 40px;
        text-align: right;
        color: #999;
      }
    }
  }

  .login-hint,
  .user-rating,
  .your-rating {
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;

    p {
      margin-bottom: 12px;
      font-weight: 500;
    }
  }

  .user-rating {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .your-rating {
    .your-review {
      margin-top: 12px;
      font-weight: 400;
      color: #666;
    }
  }

  .rating-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
