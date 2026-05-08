<template>
  <div class="books-view">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>书籍列表</h1>
        <p class="subtitle">探索精彩内容</p>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar" data-testid="bookstore-filter-bar">
        <Row :gutter="16">
          <Col :xs="24" :sm="8" :md="6">
            <Select
              v-model="filters.categoryId"
              placeholder="选择分类"
              clearable
              @change="handleFilterChange"
              data-testid="category-filter"
            >
              <option value="">全部分类</option>
              <option
                v-for="cat in categories"
                :key="cat.id || (cat as any)._id"
                :value="cat.id || (cat as any)._id"
              >
                {{ cat.name }}
              </option>
            </Select>
          </Col>

          <Col :xs="24" :sm="8" :md="6">
            <Select
              v-model="filters.status"
              placeholder="连载状态"
              clearable
              @change="handleFilterChange"
              data-testid="status-filter"
            >
              <option value="">全部状态</option>
              <option value="ongoing">连载中</option>
              <option value="completed">已完结</option>
            </Select>
          </Col>

          <Col :xs="24" :sm="8" :md="6">
            <Select
              v-model="filters.sortBy"
              placeholder="排序方式"
              @change="handleFilterChange"
              data-testid="sort-filter"
            >
              <option value="updateTime">最新更新</option>
              <option value="rating">最高评分</option>
              <option value="viewCount">最多阅读</option>
              <option value="wordCount">字数最多</option>
            </Select>
          </Col>

          <Col :xs="24" :sm="8" :md="6">
            <Radio.Group v-model="viewMode" size="md">
              <Radio.Button value="grid">
                <Icon name="squares-2x2" size="sm" />
              </Radio.Button>
              <Radio.Button value="list">
                <Icon name="list" size="sm" />
              </Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
      </div>

      <!-- 书籍列表 -->
      <div class="books-container" data-testid="books-list">
        <Spinner v-if="loading" size="lg" class="loading-spinner" />

        <!-- 网格视图 -->
        <Row v-else-if="viewMode === 'grid'" :gutter="20">
          <Col v-for="book in books" :key="book.id" :xs="12" :sm="8" :md="6" :lg="4">
            <div class="book-card" @click="goToDetail(book.id)" data-testid="book-card">
              <div class="book-cover">
                <Image :src="book.coverUrl" fit="cover">
                  <template #error>
                    <div class="image-slot">
                      <Icon name="photo" size="md" />
                    </div>
                  </template>
                </Image>
                <Tag
                  v-if="book.status === 'completed'"
                  class="status-tag"
                  variant="success"
                  size="sm"
                >
                  完结
                </Tag>
              </div>
              <div class="book-info">
                <h4 class="book-title" :title="book.title">{{ book.title }}</h4>
                <p class="book-author">{{ book.author }}</p>
                <div class="book-meta">
                  <span class="rating">
                    <Icon name="star" size="xs" class="text-yellow-400" />
                    {{ formatRating(book.rating) }}
                  </span>
                  <span class="words">{{ formatNumber(book.wordCount) }}字</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <!-- 列表视图 -->
        <div v-else class="books-list">
          <div
            v-for="book in books"
            :key="book.id"
            class="book-list-item"
            @click="goToDetail(book.id)"
            data-testid="book-card"
          >
            <div class="item-cover">
              <Image :src="book.coverUrl" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <Icon name="photo" size="lg" />
                  </div>
                </template>
              </Image>
            </div>
            <div class="item-info">
              <h3 class="item-title">{{ book.title }}</h3>
              <p class="item-author">{{ book.author }} · {{ book.categoryName }}</p>
              <p class="item-desc">{{ book.title }}</p>
              <div class="item-meta">
                <span class="rating">
                  <Icon name="star" size="xs" class="text-yellow-400" />
                  {{ formatRating(book.rating) }}分
                </span>
                <span>{{ formatNumber(book.wordCount) }}字</span>
                <span>{{ formatNumber(book.viewCount) }}阅读</span>
                <Tag v-if="book.status === 'completed'" variant="success" size="sm"> 完结 </Tag>
                <Tag v-else variant="warning" size="sm"> 连载 </Tag>
              </div>
            </div>
            <div class="item-action">
              <Button variant="primary">阅读</Button>
            </div>
          </div>
        </div>

        <!-- 空状态 - 数据库为空 -->
        <Empty
          v-if="!loading && !error && books.length === 0"
          title="暂无书籍数据"
          :image-size="200"
        >
          <template #description>
            <p class="empty-description">书库中暂无书籍</p>
            <p class="empty-hint">数据库中还没有添加任何书籍</p>
          </template>
          <Button variant="primary" @click="loadBooks">刷新页面</Button>
        </Empty>

        <!-- 错误状态 -->
        <div v-if="!loading && error" class="error-result">
          <Icon name="x-circle" size="64" class="error-icon" />
          <h3 class="error-title">{{ error.title }}</h3>
          <p class="error-message">{{ error.message }}</p>
          <div class="error-actions">
            <Button variant="primary" @click="loadBooks">重试</Button>
            <Button variant="outline" @click="handleBackHome">返回首页</Button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination">
        <Pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 40, 60, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBookList } from '@/modules/bookstore/api'
import { getAllCategories } from '@/modules/bookstore/api'
import {
  Button,
  Select,
  Radio,
  Pagination,
  Empty,
  Image,
  Tag,
  Spinner,
  Row,
  Col,
} from '@/design-system'
import { Icon } from '@/design-system'
import type { Category } from '@/types/models'
import type { Book } from '@/types/bookstore'
import {
  isEmptyData,
  handleError as handleApiError,
  isNetworkError,
  isPermissionError,
  isServerError,
} from '@/utils/errorHandler'

const router = useRouter()

const loading = ref(false)
const books = ref<Book[]>([]) // 后端返回完整的 Book 对象
const categories = ref<Category[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const viewMode = ref<'grid' | 'list'>('grid')

// 错误状态
const error = ref<{
  title: string
  message: string
  type: 'network' | 'server' | 'permission' | 'not_found'
} | null>(null)

const filters = reactive({
  categoryId: '',
  status: '' as '' | 'ongoing' | 'completed',
  sortBy: 'updateTime' as 'updateTime' | 'rating' | 'viewCount' | 'wordCount',
})

// 格式化数字
const formatNumber = (num?: number): string => {
  const safeNumber = typeof num === 'number' && !Number.isNaN(num) ? num : 0
  if (safeNumber >= 10000) {
    return (safeNumber / 10000).toFixed(1) + '万'
  }
  return safeNumber.toString()
}

const formatRating = (rating?: number): string => {
  const safeRating = typeof rating === 'number' && !Number.isNaN(rating) ? rating : 0
  return safeRating.toFixed(1)
}

// 跳转到详情页
const goToDetail = (id: string) => {
  router.push(`/bookstore/books/${id}`)
}

// 加载书籍列表
const loadBooks = async () => {
  loading.value = true
  error.value = null

  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      category: filters.categoryId,
      status: filters.status,
      sort: filters.sortBy,
      order: 'desc' as const,
    }

    const response: any = await getBookList(params)

    // 处理多种可能的响应格式
    // 格式1: response 直接是书籍数组 (httpService 默认行为)
    if (Array.isArray(response)) {
      books.value = response
      total.value = response.length
      return
    }

    // 格式2: 标准 APIResponse { code, message, data, total }
    if (response && typeof response === 'object') {

      // 检查是否为空数据（数据库中没有书籍）
      if (isEmptyData(response)) {
        books.value = []
        total.value = 0
        return
      }

      // API调用成功且有数据
      if (response.code === 200) {
        // 后端返回格式: { code, message, data: [...], total, page, size }
        // data 直接是书籍数组，total/page/size 在根级别
        if (Array.isArray(response.data)) {
          books.value = response.data
          total.value =
            (response as any).pagination?.total || (response as any).total || response.data.length
        } else if (response.data && (response.data as any).list) {
          // 兼容 { data: { list: [...], total? } }
          books.value = (response.data as any).list
          total.value =
            (response.data as any).total || response.total || (response.data as any).list.length
        } else if (response.data && (response.data as any).items) {
          // 兼容可能的嵌套格式 { data: { items: [...], total, ... } }
          books.value = (response.data as any).items
          total.value = (response.data as any).total || 0
        } else if (response.data && (response.data as any).books) {
          // 兼容另一种格式 { data: { books: [...], total, ... } }
          books.value = (response.data as any).books
          total.value = (response.data as any).total || 0
        } else {
          if (import.meta.env.DEV) console.warn('[BooksView] Unexpected data structure:', response.data)
          books.value = []
          total.value = 0
        }
      }
    } else {
      // API返回错误状态码 - 静默处理，只显示UI错误状态
      const appError = handleApiError(response, { showMessage: false })
      const details = appError.details as Record<string, unknown> | undefined
      error.value = {
        title: appError.message,
        message: (details?.message as string) || appError.message,
        type: isNetworkError(response)
          ? 'network'
          : isPermissionError(response)
            ? 'permission'
            : isServerError(response)
              ? 'server'
              : 'not_found',
      }
    }
  } catch (err: any) {
    console.error('[BooksView] 加载书籍列表失败:', err)
    console.error('[BooksView] Error details:', {
      message: err.message,
      code: err.code,
      response: err.response?.data,
    })

    // 使用统一的错误处理 - 静默处理，只显示UI错误状态，避免重复提示
    const appError = handleApiError(err, { showMessage: false })

    // 根据错误类型设置UI状态
    const details = appError.details as Record<string, unknown> | undefined
    error.value = {
      title: appError.message,
      message: (details?.message as string) || appError.message,
      type: isNetworkError(err)
        ? 'network'
        : isPermissionError(err)
          ? 'permission'
          : isServerError(err)
            ? 'server'
            : 'not_found',
    }
  } finally {
    loading.value = false
  }
}

// 返回首页
const handleBackHome = () => {
  router.push('/bookstore')
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await getAllCategories()

    // 处理 null 响应或空数据
    if (!response || response == null) {
      categories.value = []
      return
    }

    if (response.code === 200) {
      // 处理分类树数据，展平为一维数组供选择器使用
      if (Array.isArray(response.data)) {
        // 递归提取所有分类（包括子分类）
        const flattenCategories = (cats: Category[]): Category[] => {
          const result: Category[] = []
          for (const cat of cats as any[]) {
            result.push({
              ...cat,
              id: cat.id || cat._id || '',
            })
            if (cat.children && cat.children.length > 0) {
              result.push(...flattenCategories(cat.children))
            }
          }
          return result
        }
        categories.value = flattenCategories(response.data)
      } else {
        categories.value = []
      }
    } else {
      categories.value = []
    }
  } catch (error) {
    // 静默处理错误，不影响书籍列表的显示
    console.error('加载分类失败:', error)
    categories.value = []
  }
}

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadBooks()
}

// 页码变化
const handlePageChange = () => {
  loadBooks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 每页数量变化
const handleSizeChange = () => {
  currentPage.value = 1
  loadBooks()
}

onMounted(() => {
  loadCategories()
  loadBooks()
})
</script>

<style scoped lang="scss">
.books-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #303133;
  }

  .subtitle {
    font-size: 16px;
    color: #909399;
  }
}

.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .select,
  :deep(.select),
  .radio-group,
  :deep(.radio-group) {
    width: 100%;
  }
}

.books-container {
  min-height: 400px;
  margin-bottom: 32px;
  position: relative;

  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 20px;
  }
}

// 网格视图样式
.book-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .book-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 3/4;

    .image-wrapper {
      width: 100%;
      height: 100%;
    }

    .status-tag {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }

  .book-info {
    padding: 12px;

    .book-title {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #303133;
    }

    .book-author {
      font-size: 12px;
      color: #909399;
      margin: 0 0 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .book-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #606266;

      .rating {
        display: flex;
        align-items: center;
        gap: 2px;
        color: #f56c6c;
      }
    }
  }
}

// 列表视图样式
.books-list {
  .book-list-item {
    display: flex;
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .item-cover {
      width: 100px;
      height: 133px;
      flex-shrink: 0;
      border-radius: 4px;
      overflow: hidden;

      .image-wrapper {
        width: 100%;
        height: 100%;
      }
    }

    .item-info {
      flex: 1;
      padding: 0 16px;
      min-width: 0;

      .item-title {
        font-size: 18px;
        font-weight: bold;
        margin: 0 0 8px 0;
        color: #303133;
      }

      .item-author {
        font-size: 14px;
        color: #909399;
        margin: 0 0 8px 0;
      }

      .item-desc {
        font-size: 14px;
        color: #606266;
        margin: 0 0 12px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .item-meta {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: #909399;
        flex-wrap: wrap;

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #f56c6c;
        }
      }
    }

    .item-action {
      display: flex;
      align-items: center;
      padding-left: 16px;
    }
  }
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

// 空状态和错误状态样式
.empty-description {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin: 8px 0 4px 0;
}

.empty-hint {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.error-result {
  padding: 60px 20px;
  text-align: center;

  .error-icon {
    color: #f56c6c;
    margin-bottom: 16px;
  }

  .error-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }

  .error-message {
    font-size: 14px;
    color: #909399;
    margin: 0 0 24px 0;
  }

  .error-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}

.empty,
:deep(.empty) {
  padding: 60px 20px;

  :deep(.empty-description) {
    font-size: 14px;
  }

  .button {
    margin-top: 16px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

// 响应式
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }

  .filter-bar {
    .col {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .books-list .book-list-item {
    flex-direction: column;

    .item-cover {
      width: 100%;
      height: auto;
      aspect-ratio: 3/4;
      margin-bottom: 12px;
    }

    .item-info {
      padding: 0;
    }

    .item-action {
      padding: 12px 0 0 0;
      justify-content: stretch;

      .button {
        width: 100%;
      }
    }
  }
}
</style>
