<template>
  <div
    class="browse-books-view"
    :class="{ 'compact-mode': isSearchMode }"
    data-testid="browse-books-view"
  >
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">探索书库</h1>
        <p v-if="!isSearchMode" class="page-subtitle">发现你喜欢的精彩书籍</p>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <SearchBar
          v-model="browseStore.filters.q"
          @search="handleSearch"
          @clear="handleSearch"
          class="mb-6"
        />
      </div>

      <!-- 筛选器 -->
      <div class="filter-section">
        <FilterBar
          v-model:categoryId="browseStore.filters.categoryId"
          v-model:year="browseStore.filters.year"
          v-model:status="browseStore.filters.status"
          :categories="metaStore.categories"
          :years="metaStore.years"
          :statuses="statuses"
          @update:categoryId="handleFilterChange"
          @update:year="handleFilterChange"
          @update:status="handleFilterChange"
          class="mb-4"
        />
      </div>

      <!-- 标签筛选 + 重置按钮 -->
      <div class="flex-between items-center mb-6">
        <TagFilter
          v-model:selectedTags="browseStore.filters.tags"
          :available-tags="availableTags"
          :max-selected="8"
          :recommend-limit="3"
          @update:selectedTags="handleFilterChange"
          class="flex-1"
        />

        <Button
          v-if="browseStore.hasActiveFilters"
          variant="ghost"
          size="sm"
          @click="handleResetFilters"
          class="ml-4"
        >
          <Icon name="x-mark" size="sm" />
          重置筛选
        </Button>
      </div>

      <!-- 书籍列表 -->
      <div class="books-section">
        <!-- 加载中（首次加载） -->
        <div v-if="browseStore.loading && browseStore.books.length === 0" class="loading-state">
          <BookGridSkeleton :count="12" />
        </div>

        <!-- 错误状态 -->
        <div v-else-if="browseStore.error" class="error-state">
          <Empty
            :image-type="'error'"
            :description="browseStore.error.message || '加载失败，请稍后重试'"
          >
            <Button @click="fetchBooks" variant="primary">重试</Button>
          </Empty>
        </div>

        <!-- 有数据 -->
        <div v-else-if="browseStore.books.length > 0">
          <BookGrid
            :books="browseStore.books"
            :single-column="true"
            @book-click="handleBookClick"
          />

          <!-- 统一使用无限滚动加载 -->
          <div class="load-more-section">
            <div ref="loadMoreTrigger" class="load-trigger"></div>

            <!-- 加载中的状态 -->
            <div v-if="browseStore.loading" class="loading-state">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <!-- 没有更多了 -->
            <div v-else-if="!browseStore.pagination.hasMore" class="no-more">- 没有更多了 -</div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <Empty :image-type="emptyStateType" :description="emptyStateDescription">
            <Button
              v-if="browseStore.hasActiveFilters"
              @click="handleResetFilters"
              variant="primary"
            >
              清空筛选
            </Button>
          </Empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useBrowseStore } from '../stores/browse.store'
import { useMetaStore } from '../stores/meta.store'
import SearchBar from '../components/BrowseBooks/SearchBar.vue'
import FilterBar from '../components/BrowseBooks/FilterBar.vue'
import TagFilter from '../components/BrowseBooks/TagFilter.vue'
import BookGrid from '../components/BookGrid.vue'
import BookGridSkeleton from '../components/BrowseBooks/BookGridSkeleton.vue'
import { Button } from '@/design-system/base/Button'
import { Icon } from '@/design-system/base/Icon'
import { Empty } from '@/design-system/base/Empty'

const browseStore = useBrowseStore()
const metaStore = useMetaStore()
const router = useRouter()

// 状态筛选选项
const statuses = ref([
  { value: 'ongoing', label: '连载中' },
  { value: 'completed', label: '已完结' },
])

// 可用标签（优先从 metaStore 获取，// 如果 metaStore 为空，则从当前书籍列表中提取实际使用的标签
const availableTags = computed(() => {
  // 1. 优先使用 metaStore 中的标签
  if (metaStore.tags.length > 0) {
    return metaStore.tags.map((t: string | { name: string }) =>
      typeof t === 'string' ? t : t.name,
    )
  }

  // 2. 从当前书籍列表中提取实际使用的标签
  const tagSet = new Set<string>()
  browseStore.books.forEach((book) => {
    if (Array.isArray(book.tags)) {
      book.tags.forEach((tag: string) => tagSet.add(tag))
    }
  })

  if (tagSet.size > 0) {
    return Array.from(tagSet).sort()
  }

  // 3. 使用硬编码默认值作为兜底
  return ['热血', '穿越', '系统', '爽文']
})

// 空状态配置
const emptyStateConfig = computed(() => {
  const { q, categoryId, tags } = browseStore.filters

  if (q) {
    return {
      type: 'search',
      description: `没有找到与"${q}"相关的书籍，试试其他关键词`,
    }
  }

  if (categoryId || tags.length > 0) {
    return {
      type: 'filter',
      description: '没有符合条件的书籍，试试调整筛选条件',
    }
  }

  return {
    type: 'empty',
    description: '书架正在补充中，敬请期待~',
  }
})

const emptyStateType = computed(() => emptyStateConfig.value.type)
const emptyStateDescription = computed(() => emptyStateConfig.value.description)
const isSearchMode = computed(() => Boolean(browseStore.filters.q?.trim()))

// 获取书籍数据
const fetchBooks = async () => {
  await browseStore.fetchBooks()
}

// 搜索处理
const handleSearch = () => {
  browseStore.filters.page = 1
  browseStore.syncFiltersToURL()
  fetchBooks()
}

// 筛选变化处理
const handleFilterChange = () => {
  browseStore.filters.page = 1
  browseStore.syncFiltersToURL()
  fetchBooks()
}

// 重置筛选
const handleResetFilters = () => {
  browseStore.resetFilters()
  browseStore.syncFiltersToURL()
  fetchBooks()
}

const handleBookClick = (book: { id: string }) => {
  if (!book?.id) return
  router.push(`/bookstore/books/${book.id}`)
}

// 无限滚动加载更多
const loadMore = async () => {
  if (browseStore.loading || !browseStore.pagination.hasMore) return
  browseStore.filters.page++
  await browseStore.fetchBooks(true)
  browseStore.syncFiltersToURL()
}

// 无限滚动触发器（所有设备）
const loadMoreTrigger = ref<HTMLElement | null>(null)

useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (
      isIntersecting &&
      !browseStore.loading &&
      browseStore.pagination.hasMore &&
      browseStore.books.length > 0
    ) {
      loadMore()
    }
  },
  { threshold: 0.1 },
)

// 初始化
onMounted(async () => {
  // 从URL初始化筛选条件
  browseStore.syncFiltersFromURL()

  // 加载静态数据（分类、年份、标签）
  await Promise.all([metaStore.getCategories(true), metaStore.getYears(), metaStore.getTags()])

  // 获取书籍列表
  fetchBooks()
})
</script>

<style scoped lang="scss">
.browse-books-view {
  max-width: 980px;
  margin: 0 auto;
  padding: 4px 40px 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 6px;
}

.page-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
  white-space: nowrap;
  margin-bottom: 0;
}

.page-subtitle {
  display: none;
}

.search-section,
.filter-section {
  margin-bottom: 12px;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-center {
  align-items: center;
}

.mb-4 {
  margin-bottom: 10px;
}

.mb-6 {
  margin-bottom: 12px;
}

.flex-1 {
  flex: 1;
}

.ml-4 {
  margin-left: 16px;
}

.books-section {
  min-height: 320px;
}

.loading-state {
  padding: 20px 0;
}

.error-state {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-state {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* 无限滚动区域 */
.load-more-section {
  margin-top: 20px;
  text-align: center;
  padding: 20px 0;
}

.load-trigger {
  height: 1px;
}

/* 加载动画 */
.loading-state {
  padding: 20px 0;
}

.loading-dots {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  span {
    width: 8px;
    height: 8px;
    background: #409eff;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
  letter-spacing: 1px;
}

.compact-mode {
  .page-header {
    text-align: left;
    margin-bottom: 6px;
  }

  .page-title {
    font-size: 17px;
    margin-bottom: 0;
  }

  .search-section,
  .filter-section {
    margin-bottom: 8px;
  }

  .mb-4,
  .mb-6 {
    margin-bottom: 8px;
  }

  :deep(.search-bar) {
    max-width: 100%;
  }

  :deep(.search-bar .input-wrapper) {
    padding: 8px 12px;
    border-radius: 12px;
  }

  :deep(.search-bar .search-input) {
    font-size: 14px;
  }

  :deep(.filter-select .select-trigger) {
    height: 34px;
    border-radius: 10px;
  }

  :deep(.tag-filter .tag-scroll-wrapper) {
    padding: 4px 0;
  }
}

@media (max-width: 640px) {
  .browse-books-view {
    max-width: 100%;
    padding: 2px 14px 16px;
  }

  .page-header {
    margin-bottom: 4px;
  }

  .page-title {
    font-size: 15px;
  }

  .page-subtitle {
    display: none;
  }

  .search-section,
  .filter-section {
    margin-bottom: 10px;
  }

  .flex-between {
    flex-wrap: wrap;
    gap: 12px;
  }

  .ml-4 {
    margin-left: 0;
    margin-top: 8px;
  }

  .load-more-section {
    margin-top: 16px;
  }
}
</style>
