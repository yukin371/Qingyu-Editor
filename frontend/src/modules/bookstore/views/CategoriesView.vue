<template>
  <div class="categories-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <QyIcon name="Grid" />
          图书分类
        </h1>
        <p class="page-subtitle">探索不同类型的精彩作品</p>
      </div>

      <!-- 分类树状导航 -->
      <div class="category-tree-section" v-loading="treeLoading">
        <Card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>分类导航</span>
              <QyButton variant="text" @click="expandAll = !expandAll">
                {{ expandAll ? '收起全部' : '展开全部' }}
              </QyButton>
            </div>
          </template>

          <CategoryTree
            :categories="categoryTree"
            :selected-id="selectedCategoryId"
            :expand-all="expandAll"
            @select="handleCategorySelect"
          />
        </Card>
      </div>

      <!-- 当前分类信息 -->
      <div v-if="currentCategory" class="current-category">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/bookstore' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentCategory.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <div class="category-info">
          <h2>{{ currentCategory.name }}</h2>
          <p v-if="currentCategory.description">{{ currentCategory.description }}</p>
          <div class="category-stats">
            <Tag variant="info">{{ bookTotal }} 本书籍</Tag>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <Card shadow="hover" class="filter-card">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8" :md="6">
            <QySelect
              v-model="filters.status"
              :options="statusOptions"
              placeholder="连载状态"
              clearable
              @change="handleFilterChange"
            />
          </el-col>

          <el-col :xs="24" :sm="8" :md="6">
            <QySelect
              v-model="filters.sortBy"
              :options="sortOptions"
              placeholder="排序方式"
              @change="handleFilterChange"
            />
          </el-col>

          <el-col :xs="24" :sm="8" :md="6">
            <QySelect
              v-model="filters.wordCountRange"
              :options="wordCountRangeOptions"
              placeholder="字数范围"
              clearable
              @change="handleFilterChange"
            />
          </el-col>

          <el-col :xs="24" :sm="8" :md="6">
            <QyButton variant="primary" @click="resetFilters">重置筛选</QyButton>
          </el-col>
        </el-row>
      </Card>

      <!-- 书籍列表 -->
      <div class="books-section" v-loading="booksLoading">
        <template v-if="!booksLoading && books.length > 0">
          <BookGrid :books="books" :loading="booksLoading" @book-click="handleBookClick" />

          <!-- 分页 -->
          <div class="pagination">
            <QyPagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 36, 48]"
              :total="bookTotal"
              :layout="['total', 'sizes', 'prev', 'pager', 'next', 'jumper']"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </template>

        <Empty v-else-if="!booksLoading" description="暂无相关书籍">
          <template #action>
            <QyButton variant="primary" @click="resetFilters">重置筛选</QyButton>
          </template>
        </Empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import { QyIcon, QyButton, QySelect, QyPagination } from '@/design-system/components'
import { Empty, Card, Tag } from '@/design-system/base'
import { getCategoryTree } from '@/modules/bookstore/api'
import { getBooksByCategory } from '@/modules/bookstore/api'
import BookGrid from '@bookstore/components/BookGrid.vue'
import CategoryTree from '@bookstore/components/CategoryTree.vue'
import type { Category, BookBrief } from '@/types/models'

// 本地筛选条件类型（与页面UI对应）
interface FilterValues {
  status?: string
  sortBy?: string
  wordCountRange?: string
}

const route = useRoute()
const router = useRouter()

// 状态
const treeLoading = ref(false)
const booksLoading = ref(false)
const expandAll = ref(false)

// 分类相关
const categoryTree = ref<Category[]>([])
const selectedCategoryId = ref<string>('')
const currentCategory = ref<Category | null>(null)

// 书籍列表
const books = ref<BookBrief[]>([])
const bookTotal = ref(0)
const currentPage = ref(1)
const pageSize = ref(24)

// 筛选条件
const filters = reactive<FilterValues>({
  status: undefined,
  sortBy: 'updateTime',
  wordCountRange: undefined,
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '连载中', value: 'ongoing' },
  { label: '已完结', value: 'completed' },
]

const sortOptions = [
  { label: '最新更新', value: 'updateTime' },
  { label: '最高评分', value: 'rating' },
  { label: '最多阅读', value: 'viewCount' },
  { label: '最多收藏', value: 'favoriteCount' },
]

const wordCountRangeOptions = [
  { label: '全部', value: '' },
  { label: '10万以下', value: '0-100000' },
  { label: '10-50万', value: '100000-500000' },
  { label: '50-100万', value: '500000-1000000' },
  { label: '100万以上', value: '1000000-' },
]

// 加载分类树
const loadCategoryTree = async () => {
  treeLoading.value = true
  try {
    const response = await getCategoryTree()

    // 处理 null 响应
    if (!response || response == null) {
      categoryTree.value = []
      return
    }

    categoryTree.value = Array.isArray(response) ? response : []
  } catch (error: any) {
    console.error('加载分类树失败:', error)
    message.error(error.message || '加载分类失败')
    categoryTree.value = []
  } finally {
    treeLoading.value = false
  }
}

// 查找分类
const findCategory = (categories: Category[], id: string): Category | null => {
  for (const cat of categories) {
    if (cat.id === id) {
      return cat
    }
    if (cat.children && cat.children.length > 0) {
      const found = findCategory(cat.children, id)
      if (found) return found
    }
  }
  return null
}

// 加载书籍列表
const loadBooks = async () => {
  if (!selectedCategoryId.value) return

  booksLoading.value = true
  try {
    const response = await getBooksByCategory({
      category: selectedCategoryId.value,
      page: currentPage.value,
      size: pageSize.value,
    })

    // 处理响应
    if (response && (response as any).code === 200) {
      const data = (response as any).data
      books.value = data?.books || data || []
      bookTotal.value =
        data?.total ||
        (response as any).pagination?.total ||
        (Array.isArray(books.value) ? books.value.length : 0)
    } else {
      books.value = Array.isArray(response) ? response : []
      bookTotal.value = books.value.length
    }
  } catch (error: any) {
    console.error('加载书籍列表失败:', error)
    message.error(error.message || '加载书籍失败')
  } finally {
    booksLoading.value = false
  }
}

// 分类选择
const handleCategorySelect = (category: Category) => {
  selectedCategoryId.value = category.id || ''
  currentCategory.value = category
  currentPage.value = 1

  // 更新URL (不直接调用loadBooks，让watch来处理)
  router.push({
    path: '/bookstore/categories',
    query: { id: selectedCategoryId.value },
  })
}

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadBooks()
}

// 重置筛选
const resetFilters = () => {
  filters.status = undefined
  filters.sortBy = 'updateTime'
  filters.wordCountRange = undefined
  currentPage.value = 1
  loadBooks()
}

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadBooks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadBooks()
}

// 书籍点击
const handleBookClick = (book: BookBrief) => {
  const bookId = book.id || ''
  router.push(`/bookstore/books/${bookId}`)
}

// 监听路由变化
watch(
  () => route.query.id,
  (newId, oldId) => {
    // 只在ID真正改变时才重新加载
    if (newId && typeof newId === 'string' && newId !== oldId) {
      selectedCategoryId.value = newId
      currentCategory.value = findCategory(categoryTree.value, newId)
      loadBooks()
    }
  },
  { immediate: false },
) // 不在初始化时立即执行

// 页面初始化
onMounted(async () => {
  await loadCategoryTree()

  // 从URL获取分类ID
  const categoryId = route.query.id as string
  if (categoryId) {
    selectedCategoryId.value = categoryId
    currentCategory.value = findCategory(categoryTree.value, categoryId)
    await loadBooks()
  } else if (categoryTree.value.length > 0) {
    // 默认选择第一个分类
    const firstCategory = categoryTree.value[0]
    selectedCategoryId.value = firstCategory.id || ''
    currentCategory.value = firstCategory
    // 直接加载书籍，不通过router.push避免触发watch
    await loadBooks()
  }
})
</script>

<style scoped lang="scss">
.categories-view {
  min-height: 100vh;
  background-color: #f8f9fb;
  padding: 40px 0 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 48px 24px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(102, 177, 255, 0.05) 100%);
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(64, 158, 255, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .page-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: #2c3e50;
    position: relative;
    z-index: 1;

    .el-icon {
      color: #409eff;
    }
  }

  .page-subtitle {
    margin: 0;
    font-size: 16px;
    color: #666;
    font-weight: 400;
  }
}

.category-tree-section {
  margin-bottom: 24px;

  :deep(.qy-card) {
    border-radius: 20px;
    border: none;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 15px 45px -10px rgba(0, 0, 0, 0.08);
    }

    .qy-card__header {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
    }

    .qy-card__body {
      padding: 24px;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
    color: #2c3e50;
  }
}

.current-category {
  background: white;
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);

  :deep(.el-breadcrumb) {
    font-size: 14px;
    margin-bottom: 16px;

    .el-breadcrumb__inner {
      color: #666;

      &:hover {
        color: #409eff;
      }
    }
  }

  .category-info {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #2c3e50;
      font-weight: 700;
    }

    p {
      margin: 0 0 16px 0;
      color: #666;
      line-height: 1.6;
      font-size: 15px;
    }

    .category-stats {
      display: flex;
      gap: 12px;

      :deep(.qy-tag) {
        background: linear-gradient(
          135deg,
          rgba(64, 158, 255, 0.1) 0%,
          rgba(102, 177, 255, 0.1) 100%
        );
        border: 1px solid rgba(64, 158, 255, 0.2);
        color: #409eff;
        padding: 6px 16px;
        border-radius: 8px;
        font-weight: 600;
      }
    }
  }
}

.filter-card {
  margin-bottom: 24px;

  :deep(.el-card) {
    border-radius: 20px;
    border: none;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);

    .el-card__body {
      padding: 20px 24px;
    }
  }

  :deep(.qy-select) {
    width: 100%;

    .qy-input__wrapper {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }
  }

  :deep(.qy-button--primary) {
    border-radius: 12px;
    padding: 12px 24px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.35);
    }
  }
}

.books-section {
  min-height: 400px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;

  :deep(.qy-pagination) {
    .qy-pager li {
      border-radius: 8px;
      font-weight: 600;

      &.is-active {
        background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      }
    }

    button {
      border-radius: 8px;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .categories-view {
    padding: 20px 0 40px;
  }

  .page-header {
    padding: 32px 20px;
    margin-bottom: 24px;

    .page-title {
      font-size: 28px;
      gap: 8px;
    }

    .page-subtitle {
      font-size: 14px;
    }
  }

  .category-tree-section,
  .current-category,
  .filter-card {
    :deep(.qy-card) {
      border-radius: 16px;
    }
  }

  .current-category {
    padding: 16px;

    .category-info {
      h2 {
        font-size: 20px;
      }

      p {
        font-size: 14px;
      }
    }
  }

  .filter-card {
    :deep(.qy-card__body) {
      padding: 16px;
    }

    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }

  .pagination {
    margin-top: 24px;
    padding-top: 20px;
  }
}
</style>
