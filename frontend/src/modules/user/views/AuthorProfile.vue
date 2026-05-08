<template>
  <div class="author-profile">
    <div v-if="loading" class="loading-container">
      <QyLoading />
    </div>

    <div v-else-if="!userProfile" class="error-container">
      <Empty description="用户不存在" />
    </div>

    <div v-else class="profile-container">
      <!-- 用户信息卡片 -->
      <UserCard
        :user="userProfile"
        :stats="userStats"
        :is-following="isFollowing"
        :show-message="true"
        @follow="handleFollow"
        @unfollow="handleUnfollow"
        @message="handleMessage"
      />

      <!-- 标签页 -->
      <Card class="content-card">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="作品" name="books">
            <div v-if="loadingBooks" class="tab-loading">
              <QyLoading />
            </div>

            <div v-else-if="bookList.length === 0" class="empty-content">
              <Empty description="暂无作品" />
            </div>

            <div v-else class="books-grid">
              <div
                v-for="book in bookList"
                :key="book.book_id"
                class="book-card"
                @click="goToBook(book.book_id)"
              >
                <Image
                  :src="book.cover || '/default-book-cover.jpg'"
                  fit="cover"
                  class="book-cover"
                >
                  <template #error>
                    <div class="image-slot">
                      <QyIcon name="Picture"  />
                    </div>
                  </template>
                </Image>
                <div class="book-info">
                  <h4 class="book-title">{{ book.title }}</h4>
                  <p class="book-description">{{ book.description }}</p>
                  <div class="book-meta">
                    <Tag size="sm" :variant="getTagType(book.category)">{{ book.category }}</Tag>
                    <span class="word-count">{{ formatNumber(book.word_count) }} 字</span>
                  </div>
                  <div class="book-stats">
                    <span><QyIcon name="View"  /> {{ formatNumber(book.read_count || 0) }}</span>
                    <span><QyIcon name="Star"  /> {{ formatNumber(book.favorite_count || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="bookList.length > 0" class="pagination">
              <QyPagination
                v-model="pagination.page"
                :page-size="pagination.size"
                :total="pagination.total"
                :layout="['prev', 'pager', 'next']"
                @change="loadBooks"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="动态" name="activities">
            <div class="empty-content">
              <el-empty description="暂无动态" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import { QyIcon, QyLoading, QyPagination } from '@/design-system/components'
import { Tag, Image, Empty, Card } from '@/design-system/base'
import UserCard from '@/shared/components/common/UserCard.vue'
import { useAuthStore } from '@/stores/auth'
import { httpService } from '@/core/services/http.service'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userId = computed(() => route.params.userId as string)

// 状态
const loading = ref(true)
const loadingBooks = ref(false)
const userProfile = ref<any>(null)
const userStats = ref<any>(null)
const isFollowing = ref(false)
const activeTab = ref('books')

// 作品列表
const bookList = ref<any[]>([])
const pagination = ref({
  page: 1,
  size: 12,
  total: 0
})

// 加载用户信息
const loadUserProfile = async () => {
  loading.value = true
  try {
    const response = await httpService.get(`/users/${userId.value}/profile`)
    userProfile.value = response.data

    // 模拟统计数据（实际应该从API获取）
    userStats.value = {
      bookCount: 12,
      followerCount: 3580,
      totalWords: 1250000
    }
  } catch (error: any) {
    console.error('加载用户信息失败:', error)
    message.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 加载作品列表
const loadBooks = async () => {
  loadingBooks.value = true
  try {
    const response = await httpService.get(`/users/${userId.value}/books`, {
      params: {
        page: pagination.value.page,
        size: pagination.value.size
      }
    })
    bookList.value = response.data.books || []
    pagination.value.total = response.data.total || 0
  } catch (error: any) {
    console.error('加载作品列表失败:', error)
    message.error('加载作品列表失败')
  } finally {
    loadingBooks.value = false
  }
}

// 处理关注
const handleFollow = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    router.push('/auth')
    return
  }

  try {
    // TODO: 调用关注API
    await httpService.post(`/users/${userId.value}/follow`)
    isFollowing.value = true
    message.success('关注成功')
    if (userStats.value) {
      userStats.value.followerCount++
    }
  } catch (error: any) {
    console.error('关注失败:', error)
    message.error('关注失败')
  }
}

// 处理取消关注
const handleUnfollow = async () => {
  try {
    // TODO: 调用取消关注API
    await httpService.delete(`/users/${userId.value}/follow`)
    isFollowing.value = false
    message.success('已取消关注')
    if (userStats.value && userStats.value.followerCount > 0) {
      userStats.value.followerCount--
    }
  } catch (error: any) {
    console.error('取消关注失败:', error)
    message.error('取消关注失败')
  }
}

// 处理私信
const handleMessage = () => {
  message.info('私信功能开发中')
}

// 前往书籍详情
const goToBook = (bookId: string) => {
  router.push(`/bookstore/books/${bookId}`)
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

// 获取标签类型
const getTagType = (category: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    '玄幻': 'primary',
    '都市': 'success',
    '科幻': 'info',
    '历史': 'warning',
    '仙侠': 'danger'
  }
  return typeMap[category] || 'info'
}

// 初始化
onMounted(() => {
  loadUserProfile()
  loadBooks()
})
</script>

<style scoped lang="scss">
.author-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  padding: 60px 0;
  text-align: center;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.tab-loading,
.empty-content {
  padding: 40px 0;
  text-align: center;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.book-card {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
}

.book-cover {
  width: 100%;
  height: 320px;
  display: block;

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 48px;
  }
}

.book-info {
  padding: 16px;

  .book-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .book-description {
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
    margin: 0 0 12px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .book-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .word-count {
      font-size: 12px;
      color: #909399;
    }
  }

  .book-stats {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #909399;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .author-profile {
    padding: 16px;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .book-cover {
    height: 220px;
  }

  .book-info {
    padding: 12px;

    .book-title {
      font-size: 14px;
    }

    .book-description {
      font-size: 12px;
    }
  }
}
</style>
