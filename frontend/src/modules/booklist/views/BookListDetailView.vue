<template>
  <div class="booklist-detail-view">
    <div class="container">
      <!-- 加载中 -->
      <div v-if="booklistStore.loading" class="loading-state">
        <el-skeleton animated>
          <template #template>
            <div class="detail-skeleton">
              <el-skeleton-item variant="image" style="width: 200px; height: 280px;" />
              <div class="skeleton-info">
                <el-skeleton-item variant="text" style="width: 50%; height: 32px;" />
                <el-skeleton-item variant="text" style="width: 80%;" />
                <el-skeleton-item variant="text" style="width: 60%;" />
                <el-skeleton-item variant="text" style="width: 40%;" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 书单详情 -->
      <template v-else-if="booklistStore.currentBooklist">
        <!-- 头部信息 -->
        <div class="booklist-header">
          <div class="header-cover">
            <img
              v-if="booklistStore.currentBooklist.cover"
              :src="booklistStore.currentBooklist.cover"
              :alt="booklistStore.currentBooklist.title"
            />
            <div v-else class="cover-placeholder">
              <QyIcon name="Collection" :size="64" />
            </div>
          </div>

          <div class="header-info">
            <h1 class="booklist-title">{{ booklistStore.currentBooklist.title }}</h1>
            <p class="booklist-description">{{ booklistStore.currentBooklist.description }}</p>

            <!-- 创建者信息 -->
            <div class="creator-info">
              <Avatar
                :src="booklistStore.currentBooklist.creator?.avatar"
                :alt="booklistStore.currentBooklist.creator?.nickname"
                size="md"
              />
              <div class="creator-meta">
                <span class="creator-name">{{ booklistStore.currentBooklist.creator?.nickname }}</span>
                <span class="create-time">创建于 {{ formatDate(booklistStore.currentBooklist.createdAt) }}</span>
              </div>
            </div>

            <!-- 标签 -->
            <div v-if="booklistStore.currentBooklist.tags?.length" class="booklist-tags">
              <Badge v-for="tag in booklistStore.currentBooklist.tags" :key="tag" variant="secondary">
                {{ tag }}
              </Badge>
            </div>

            <!-- 统计 -->
            <div class="booklist-stats">
              <div class="stat-item">
                <QyIcon name="Document" :size="16" />
                <span>{{ booklistStore.currentBooklist.bookCount }} 本书</span>
              </div>
              <div class="stat-item">
                <QyIcon name="View" :size="16" />
                <span>{{ formatNumber(booklistStore.currentBooklist.viewCount) }} 次浏览</span>
              </div>
              <div class="stat-item">
                <QyIcon name="Star" :size="16" />
                <span>{{ formatNumber(booklistStore.currentBooklist.likeCount) }} 次收藏</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="header-actions">
              <QyButton
                :variant="booklistStore.currentBooklist.isLiked ? 'primary' : 'secondary'"
                @click="handleFavorite"
              >
                <QyIcon :name="booklistStore.currentBooklist.isLiked ? 'StarFilled' : 'Star'" :size="16" />
                {{ booklistStore.currentBooklist.isLiked ? '已收藏' : '收藏' }}
              </QyButton>
              <QyButton variant="secondary" @click="handleShare">
                <QyIcon name="Share" :size="16" />
                分享
              </QyButton>
              <QyButton
                v-if="isCreator"
                variant="secondary"
                @click="showEditDialog = true"
              >
                <QyIcon name="Edit" :size="16" />
                编辑
              </QyButton>
            </div>
          </div>
        </div>

        <!-- 书籍列表 -->
        <div class="books-section">
          <h2 class="section-title">
            包含书籍
            <span class="book-count">({{ booklistStore.currentBooklist.bookCount }})</span>
          </h2>

          <div v-if="booklistStore.currentBooklist.books?.length" class="books-list">
            <div
              v-for="(item, index) in booklistStore.currentBooklist.books"
              :key="item.id"
              class="book-item"
              @click="goToBook(item.bookId)"
            >
              <div class="book-rank">{{ index + 1 }}</div>
              <img
                v-if="item.book?.cover"
                :src="item.book.cover"
                :alt="item.book.title"
                class="book-cover"
              />
              <div v-else class="book-cover-placeholder">
                <QyIcon name="Document" :size="32" />
              </div>
              <div class="book-info">
                <h3 class="book-title">{{ item.book?.title }}</h3>
                <p class="book-author">{{ item.book?.author }}</p>
                <p v-if="item.note" class="book-note">{{ item.note }}</p>
                <div class="book-meta">
                  <QyIcon name="StarFilled" :size="12" />
                  <span>{{ item.book?.rating || '暂无评分' }}</span>
                </div>
              </div>
              <QyButton
                v-if="isCreator"
                variant="ghost"
                size="sm"
                class="remove-btn"
                @click.stop="handleRemoveBook(item.bookId)"
              >
                <QyIcon name="Delete" :size="16" />
              </QyButton>
            </div>
          </div>

          <div v-else class="empty-books">
            <Empty description="书单还没有书籍">
              <template #image>
                <QyIcon name="Document" :size="64" />
              </template>
            </Empty>
          </div>
        </div>
      </template>

      <!-- 未找到 -->
      <div v-else class="not-found">
        <Empty description="书单不存在或已被删除">
          <template #image>
            <QyIcon name="Warning" :size="80" />
          </template>
          <template #action>
            <QyButton variant="primary" @click="goBack">
              返回书单广场
            </QyButton>
          </template>
        </Empty>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑书单"
      width="600px"
      destroy-on-close
    >
      <BooklistForm
        v-if="booklistStore.currentBooklist"
        :booklist="booklistStore.currentBooklist"
        :loading="updating"
        :popular-tags="booklistStore.popularTags"
        @submit="handleUpdate"
        @cancel="showEditDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElDialog, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { QyButton, QyIcon } from '@/design-system/components'
import { Avatar, Empty, Badge } from '@/design-system/base'
import { useBooklistStore } from '../stores/booklist.store'
import BooklistForm from '../components/BooklistForm.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const booklistStore = useBooklistStore()
const userStore = useUserStore()

// 状态
const showEditDialog = ref(false)
const updating = ref(false)

// 计算属性
const booklistId = computed(() => route.params.id as string)
const isCreator = computed(() => {
  const userInfo = userStore.userInfo as { id?: string } | null
  return booklistStore.currentBooklist?.creatorId === userInfo?.id
})

// 格式化日期
function formatDate(date: string): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化数字
function formatNumber(num: number): string {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 收藏/取消收藏
async function handleFavorite() {
  if (!booklistStore.currentBooklist) return
  try {
    if (booklistStore.currentBooklist.isLiked) {
      await booklistStore.unfavoriteBooklist(booklistStore.currentBooklist.id)
    } else {
      await booklistStore.favoriteBooklist(booklistStore.currentBooklist.id)
    }
  } catch (err) {
    console.error('操作失败:', err)
  }
}

// 分享
function handleShare() {
  // 复制链接到剪贴板
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    // 可以显示一个提示
    alert('链接已复制到剪贴板')
  })
}

// 更新书单
async function handleUpdate(data: {
  title: string
  description: string
  cover: string
  isPublic: boolean
  tags: string[]
}) {
  if (!booklistStore.currentBooklist) return
  updating.value = true
  try {
    await booklistStore.updateBooklist(booklistStore.currentBooklist.id, data)
    showEditDialog.value = false
    // 刷新详情
    await booklistStore.fetchBooklistDetail(booklistId.value)
  } catch (err) {
    console.error('更新书单失败:', err)
  } finally {
    updating.value = false
  }
}

// 移除书籍
async function handleRemoveBook(bookId: string) {
  if (!booklistStore.currentBooklist) return
  if (!confirm('确定要从书单中移除这本书吗？')) return
  try {
    await booklistStore.removeBookFromList(booklistStore.currentBooklist.id, bookId)
  } catch (err) {
    console.error('移除书籍失败:', err)
  }
}

// 跳转到书籍详情
function goToBook(bookId: string) {
  router.push(`/bookstore/books/${bookId}`)
}

// 返回书单广场
function goBack() {
  router.push('/booklists')
}

// 初始化
onMounted(async () => {
  if (booklistId.value) {
    await Promise.all([
      booklistStore.fetchBooklistDetail(booklistId.value),
      booklistStore.fetchPopularTags()
    ])
  }
})
</script>

<style scoped lang="scss">
.booklist-detail-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 24px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading-state {
  padding: 40px;
  background: #fff;
  border-radius: 16px;

  .detail-skeleton {
    display: flex;
    gap: 32px;
  }

  .skeleton-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.booklist-header {
  display: flex;
  gap: 32px;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 24px;
}

.header-cover {
  flex-shrink: 0;
  width: 200px;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: rgba(255, 255, 255, 0.8);
  }
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booklist-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.booklist-description {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.creator-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .creator-name {
    font-size: 15px;
    font-weight: 500;
    color: #1a1a1a;
  }

  .create-time {
    font-size: 13px;
    color: #999;
  }
}

.booklist-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.booklist-stats {
  display: flex;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #666;

    i {
      color: #999;
    }
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.books-section {
  padding: 24px;
  background: #fff;
  border-radius: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;

  .book-count {
    font-size: 14px;
    color: #999;
    font-weight: normal;
  }
}

.books-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f0f2f5;
  }
}

.book-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e6f7ff;
  color: #1890ff;
  font-weight: 600;
  border-radius: 8px;
  font-size: 14px;
}

.book-cover {
  width: 60px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

.book-cover-placeholder {
  width: 60px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e8e8;
  border-radius: 4px;
  color: #ccc;
}

.book-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.book-title {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.book-note {
  font-size: 13px;
  color: #666;
  font-style: italic;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #f7ba2a;

  i {
    color: #f7ba2a;
  }
}

.remove-btn {
  opacity: 0;
  transition: opacity 0.3s;

  .book-item:hover & {
    opacity: 1;
  }
}

.empty-books,
.not-found {
  padding: 60px 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .booklist-detail-view {
    padding: 16px 0;
  }

  .container {
    padding: 0 16px;
  }

  .booklist-header {
    flex-direction: column;
    gap: 24px;
    padding: 20px;
  }

  .header-cover {
    width: 100%;
    height: 200px;
  }

  .booklist-title {
    font-size: 22px;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .book-item {
    gap: 12px;
    padding: 12px;
  }

  .book-rank {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .book-cover,
  .book-cover-placeholder {
    width: 50px;
    height: 66px;
  }

  .remove-btn {
    opacity: 1;
  }
}
</style>
