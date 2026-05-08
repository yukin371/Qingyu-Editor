<template>
  <div class="book-lists-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <h1>书单广场</h1>
          <p class="subtitle">发现精彩书单，分享阅读乐趣</p>
        </div>
        <QyButton variant="primary" @click="showCreateDialog = true">
          <QyIcon name="Plus" :size="16" />
          创建书单
        </QyButton>
      </div>

      <!-- 筛选标签 -->
      <div class="filter-section">
        <div class="filter-tags">
          <Badge
            :variant="currentTag === '' ? 'primary' : 'secondary'"
            class="filter-tag"
            @click="selectTag('')"
          >
            全部
          </Badge>
          <Badge
            v-for="tag in popularTags.slice(0, 10)"
            :key="tag"
            :variant="currentTag === tag ? 'primary' : 'secondary'"
            class="filter-tag"
            @click="selectTag(tag)"
          >
            {{ tag }}
          </Badge>
        </div>
        <div class="sort-options">
          <QyButton
            v-for="option in sortOptions"
            :key="option.value"
            :variant="currentSort === option.value ? 'primary' : 'ghost'"
            size="sm"
            @click="selectSort(option.value)"
          >
            {{ option.label }}
          </QyButton>
        </div>
      </div>

      <!-- 书单列表 -->
      <div class="booklists-section">
        <!-- 加载中 -->
        <div v-if="booklistStore.loading && !booklistStore.booklists.length" class="loading-state">
          <div class="skeleton-grid">
            <div v-for="i in 6" :key="i" class="booklist-skeleton">
              <el-skeleton animated>
                <template #template>
                  <div class="skeleton-content">
                    <el-skeleton-item variant="image" style="width: 120px; height: 160px;" />
                    <div class="skeleton-info">
                      <el-skeleton-item variant="text" style="width: 60%;" />
                      <el-skeleton-item variant="text" style="width: 80%;" />
                      <el-skeleton-item variant="text" style="width: 40%;" />
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </div>
          </div>
        </div>

        <!-- 书单列表 -->
        <div v-else-if="booklistStore.booklists.length > 0" class="booklists-grid">
          <BooklistCard
            v-for="booklist in booklistStore.booklists"
            :key="booklist.id"
            :booklist="booklist"
            @click="goToDetail"
            @favorite="handleFavorite"
          />
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <Empty description="暂无书单，快来创建第一个书单吧~">
            <template #image>
              <QyIcon name="Collection" :size="80" />
            </template>
            <template #action>
              <QyButton variant="primary" @click="showCreateDialog = true">
                创建书单
              </QyButton>
            </template>
          </Empty>
        </div>

        <!-- 加载更多 -->
        <div v-if="booklistStore.booklists.length > 0" class="load-more">
          <QyButton
            v-if="hasMore"
            :loading="booklistStore.loading"
            variant="secondary"
            @click="loadMore"
          >
            加载更多
          </QyButton>
          <span v-else class="no-more">没有更多了</span>
        </div>
      </div>
    </div>

    <!-- 创建书单对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建书单"
      width="600px"
      destroy-on-close
    >
      <BooklistForm
        :loading="creating"
        :popular-tags="popularTags"
        @submit="handleCreate"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElDialog, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { QyButton, QyIcon } from '@/design-system/components'
import { Empty } from '@/design-system/base'
import { Badge } from '@/design-system/base/Badge'
import { useBooklistStore } from '../stores/booklist.store'
import BooklistCard from '../components/BooklistCard.vue'
import BooklistForm from '../components/BooklistForm.vue'
import type { BookList } from '@/types/booklist'

const router = useRouter()
const booklistStore = useBooklistStore()

// 状态
const currentTag = ref('')
const currentSort = ref<'latest' | 'hottest' | 'mostBooks'>('latest')
const showCreateDialog = ref(false)
const creating = ref(false)
const page = ref(1)
const pageSize = ref(12)

// 排序选项
const sortOptions = [
  { value: 'latest', label: '最新' },
  { value: 'hottest', label: '最热' },
  { value: 'mostBooks', label: '最多书籍' }
]

// 热门标签
const popularTags = computed(() => booklistStore.popularTags)

// 是否还有更多
const hasMore = computed(() => {
  return booklistStore.booklists.length < booklistStore.total
})

// 获取书单列表
async function fetchBooklists(loadMore = false) {
  if (!loadMore) {
    page.value = 1
  }
  await booklistStore.fetchBooklists({
    tag: currentTag.value || undefined,
    sort: currentSort.value,
    page: page.value,
    size: pageSize.value
  })
}

// 选择标签
function selectTag(tag: string) {
  currentTag.value = tag
  fetchBooklists()
}

// 选择排序
function selectSort(sort: string) {
  currentSort.value = sort as 'latest' | 'hottest' | 'mostBooks'
  fetchBooklists()
}

// 加载更多
async function loadMore() {
  page.value++
  await fetchBooklists(true)
}

// 跳转到详情
function goToDetail(booklist: BookList) {
  router.push(`/booklists/${booklist.id}`)
}

// 收藏/取消收藏
async function handleFavorite(booklist: BookList) {
  try {
    if (booklist.isLiked) {
      await booklistStore.unfavoriteBooklist(booklist.id)
    } else {
      await booklistStore.favoriteBooklist(booklist.id)
    }
  } catch (err) {
    console.error('操作失败:', err)
  }
}

// 创建书单
async function handleCreate(data: {
  title: string
  description: string
  cover: string
  isPublic: boolean
  tags: string[]
}) {
  creating.value = true
  try {
    const newBooklist = await booklistStore.createBooklist(data)
    if (newBooklist) {
      showCreateDialog.value = false
      // 跳转到新书单详情
      router.push(`/booklists/${newBooklist.id}`)
    }
  } catch (err) {
    console.error('创建书单失败:', err)
  } finally {
    creating.value = false
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchBooklists(),
    booklistStore.fetchPopularTags()
  ])
})
</script>

<style scoped lang="scss">
.book-lists-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .header-content {
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #999;
      margin: 0;
    }
  }
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
  gap: 12px;
}

.filter-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .filter-tag {
    cursor: pointer;
    transition: all 0.2s;
  }
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 4px;
}

.booklists-section {
  min-height: 400px;
}

.loading-state {
  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 16px;
  }

  .booklist-skeleton {
    padding: 16px;
    background: #fff;
    border-radius: 16px;
  }

  .skeleton-content {
    display: flex;
    gap: 16px;
  }

  .skeleton-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.booklists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.empty-state {
  padding: 80px 20px;
  background: #fff;
  border-radius: 16px;
  text-align: center;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;

  .no-more {
    color: #999;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .book-lists-view {
    padding: 16px 0;
  }

  .container {
    padding: 0 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;

    .header-content h1 {
      font-size: 24px;
    }
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .booklists-grid {
    grid-template-columns: 1fr;
  }

  .skeleton-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
