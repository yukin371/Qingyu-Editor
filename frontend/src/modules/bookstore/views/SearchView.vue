<template>
  <div class="search-view">
    <div class="container">
      <!-- 搜索框 -->
      <div class="search-header">
        <!-- 搜索类型切换 -->
        <div class="search-type-tabs">
          <Button
            :variant="searchType === 'book' ? 'primary' : 'ghost'"
            @click="setSearchType('book')"
            class="type-tab"
          >
            <Icon name="book-open" size="sm" />
            书籍
          </Button>
          <Button
            :variant="searchType === 'author' ? 'primary' : 'ghost'"
            @click="setSearchType('author')"
            class="type-tab"
          >
            <Icon name="user" size="sm" />
            作者
          </Button>
        </div>

        <Input
          v-model="searchKeyword"
          :placeholder="searchType === 'book' ? '搜索书名、作者、标签...' : '搜索作者名称...'"
          size="lg"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <Icon name="magnifying-glass" size="md" />
          </template>
          <template #append>
            <Button @click="handleSearch">搜索</Button>
          </template>
        </Input>
      </div>

      <!-- 搜索历史和热门搜索 -->
      <div v-if="!hasSearched" class="search-suggestions">
        <Row :gutter="20">
          <!-- 搜索历史 -->
          <Col :xs="24" :sm="12">
            <div v-if="searchHistory.length > 0" class="suggestion-section">
              <div class="section-header">
                <h3>搜索历史</h3>
                <Button variant="text" className="text-red-500" @click="clearHistory">
                  <Icon name="trash" size="sm" />
                  清空
                </Button>
              </div>
              <div class="tags-list">
                <Tag v-for="(item, index) in searchHistory" :key="index" clickable
                  @click="searchKeyword = item; handleSearch()" style="cursor: pointer; margin: 4px;">
                  {{ item }}
                </Tag>
              </div>
            </div>
          </Col>

          <!-- 热门搜索 -->
          <Col :xs="24" :sm="12">
            <div class="suggestion-section">
              <div class="section-header">
                <h3>热门搜索</h3>
              </div>
              <div class="tags-list">
                <Tag v-for="(item, index) in hotSearches" :key="index" :variant="index < 3 ? 'danger' : 'default'"
                  @click="searchKeyword = item; handleSearch()" clickable style="cursor: pointer; margin: 4px;">
                  {{ index + 1 }}. {{ item }}
                </Tag>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <!-- 搜索结果 -->
      <div v-if="hasSearched" class="search-results">
        <!-- 书籍筛选栏 -->
        <div v-if="searchType === 'book'" class="filter-bar">
          <Row :gutter="16">
            <Col :xs="24" :sm="8" :md="6">
              <Select v-model="filters.categoryId" placeholder="分类" clearable @change="handleSearch">
                <option value="">全部分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </Select>
            </Col>

            <Col :xs="24" :sm="8" :md="6">
              <Select v-model="filters.status" placeholder="状态" clearable @change="handleSearch">
                <option value="">全部状态</option>
                <option value="ongoing">连载中</option>
                <option value="completed">已完结</option>
              </Select>
            </Col>

            <Col :xs="24" :sm="8" :md="6">
              <Select v-model="filters.sortBy" placeholder="排序" @change="handleSearch">
                <option value="relevance">相关度</option>
                <option value="updateTime">最新更新</option>
                <option value="rating">最高评分</option>
                <option value="viewCount">最多阅读</option>
              </Select>
            </Col>
          </Row>
        </div>

        <!-- 结果统计 -->
        <div class="result-info">
          <span v-if="searchType === 'book'">找到 <strong>{{ totalResults }}</strong> 个结果</span>
          <span v-else>找到 <strong>{{ authorsCount }}</strong> 位作者</span>
          <span v-if="searchKeyword" class="keyword-highlight">"{{ searchKeyword }}"</span>
        </div>

        <!-- 结果列表 -->
        <div class="results-list">
          <Spinner v-if="loading" size="lg" class="loading-spinner" />

          <!-- 书籍搜索结果 -->
          <template v-else-if="searchType === 'book'">
            <div v-for="book in searchResults" :key="book.id" class="result-item" data-testid="book-item" @click="goToDetail(book.id)">
              <div class="item-cover">
                <Image :src="book.cover || ''" fit="cover">
                  <template #error>
                    <div class="image-slot">
                      <Icon name="photo" size="md" />
                    </div>
                  </template>
                </Image>
              </div>

              <div class="item-content">
                <h3 class="item-title" v-safe-html="highlightKeyword(book.title)"></h3>
                <p class="item-author">
                  <Icon name="user" size="sm" />
                  <span v-safe-html="highlightKeyword(book.author)"></span>
                  <Tag size="sm" variant="info">{{ book.category || '未分类' }}</Tag>
                </p>

                <div class="item-meta">
                  <span class="rating">
                    <Icon name="star" size="xs" class="text-yellow-400" />
                    {{ (book.rating ?? 0).toFixed(1) }}
                  </span>
                  <span>{{ formatNumber(book.wordCount ?? 0) }}字</span>
                  <span>{{ formatNumber(book.viewCount ?? 0) }}阅读</span>
                  <Tag v-if="book.status === 'completed'" size="sm" variant="success">
                    完结
                  </Tag>
                  <Tag v-else size="sm" variant="warning">
                    连载
                  </Tag>
                </div>

                <p v-if="book.latestChapter" class="latest-chapter">
                  最新: {{ book.latestChapter }}
                </p>
              </div>

              <div class="item-action">
                <Button variant="primary" data-testid="read-now" @click.stop="handleStartReading(book.id)">
                  阅读
                </Button>
              </div>
            </div>

            <!-- 空状态 -->
            <Empty v-if="searchResults.length === 0" title="没有找到相关书籍">
              <Button @click="clearSearch">清空搜索</Button>
            </Empty>
          </template>

          <!-- 作者搜索结果 -->
          <template v-else>
            <AuthorList
              v-if="!authorsLoading"
              :authors="displayedAuthors"
              :is-loading="authorsLoading"
              :has-more="authorsHasMore"
              @author-click="handleAuthorClick"
            />
            <Empty v-else-if="displayedAuthors.length === 0" title="没有找到相关作者">
              <Button @click="clearSearch">清空搜索</Button>
            </Empty>
          </template>
        </div>

        <!-- 分页 -->
        <div v-if="totalResults > 0" class="pagination">
          <Pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
            :total="totalResults" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
            @current-change="handlePageChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCategoryTree } from '@/modules/bookstore/api'
import { getFirstChapter } from '@/modules/reader/api'
import { message } from '@/design-system/services'
import { Button, Select, Pagination, Empty, Image, Tag, Spinner, Row, Col, Input } from '@/design-system'
import { Icon } from '@/design-system'
import type { BookBrief, CategoryTreeNode, SearchFilter } from '../types/bookstore.types'
import { useBookstoreStore } from '../stores/bookstore.store'
import { useAuthorsResultStore } from '../stores/authors-result.store'
import AuthorList from '../components/AuthorList.vue'
import type { AuthorCard } from '../types/search.types'
import type { SearchType } from '../types/search.types'

const router = useRouter()
const route = useRoute()
const bookstoreStore = useBookstoreStore()
const authorsResultStore = useAuthorsResultStore()

const searchKeyword = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const searchResults = ref<BookBrief[]>([])
const totalResults = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const categories = ref<CategoryTreeNode[]>([])

// 搜索类型
const searchType = ref<SearchType>('book')

// 搜索历史（从localStorage读取）
const searchHistory = ref<string[]>([])

// 热门搜索（模拟数据，实际应从API获取）
const hotSearches = ref([
  '斗罗大陆',
  '遮天',
  '完美世界',
  '凡人修仙传',
  '诛仙',
  '斗破苍穹',
  '盘龙',
  '神墓'
])

type SearchViewFilters = {
  categoryId: string
  status: SearchFilter['status'] | ''
  sortBy: 'relevance' | 'updateTime' | 'rating' | 'viewCount'
}

const filters = reactive<SearchViewFilters>({
  categoryId: '',
  status: '',
  sortBy: 'relevance'
})

// 作者相关状态
const displayedAuthors = computed<AuthorCard[]>(() => authorsResultStore.authors)
const authorsLoading = computed(() => authorsResultStore.isLoading)
const authorsHasMore = computed(() => authorsResultStore.hasMore)
const authorsCount = computed(() => authorsResultStore.authorsCount)

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 高亮关键词
const highlightKeyword = (text: string): string => {
  if (!searchKeyword.value) return text
  const regex = new RegExp(`(${searchKeyword.value})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 设置搜索类型
const setSearchType = (type: SearchType) => {
  searchType.value = type
  // 切换类型时清空搜索结果
  if (hasSearched.value) {
    if (type === 'book') {
      authorsResultStore.clearResults()
    } else {
      searchResults.value = []
      totalResults.value = 0
    }
  }
}

// 处理作者点击 - 切换到书籍搜索并搜索该作者的书
const handleAuthorClick = async (author: AuthorCard) => {
  searchType.value = 'book'
  searchKeyword.value = author.name
  await handleSearch()
}

// 加载分类
const loadCategories = async () => {
  try {
    const response = await getCategoryTree()

    // 处理 null 响应
    if (!response || response == null) {
      categories.value = []
      return
    }

    if (Array.isArray(response)) {
      // 展平分类树
      const flatten = (cats: CategoryTreeNode[]): CategoryTreeNode[] => {
        const result: CategoryTreeNode[] = []
        for (const cat of cats) {
          result.push(cat)
          if (cat.children && cat.children.length > 0) {
            result.push(...flatten(cat.children))
          }
        }
        return result
      }
      categories.value = flatten(response)
    } else {
      categories.value = []
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = []
  }
}

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('search_history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
const saveSearchHistory = (keyword: string) => {
  if (!keyword.trim()) return

  // 去重并添加到开头
  const history = searchHistory.value.filter(item => item !== keyword)
  history.unshift(keyword)

  // 只保留最近10条
  searchHistory.value = history.slice(0, 10)

  // 保存到localStorage
  localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('search_history')
  message.success('已清空搜索历史')
}

// 执行搜索
const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    message.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  hasSearched.value = true

  try {
    // 保存搜索历史
    saveSearchHistory(keyword)

    // 根据搜索类型执行不同的搜索
    if (searchType.value === 'author') {
      // 搜索作者
      await authorsResultStore.search(keyword)
      console.log('[SearchView] Author search completed:', {
        keyword,
        count: authorsResultStore.authorsCount
      })
    } else {
      // 搜索书籍
      // 更新URL查询参数（支持分享链接）
      const query: any = { q: keyword }
      if (filters.categoryId) query.category = filters.categoryId
      if (filters.status) query.status = filters.status
      if (filters.sortBy) query.sort = filters.sortBy
      query.page = currentPage.value

      router.push({ path: '/bookstore/search', query })

      // 通过 bookstoreStore 与模块服务交互，内部已封装 searchBooks 逻辑
      const normalizedFilters: Partial<SearchFilter> = {
        category: filters.categoryId || undefined,
        status: filters.status || undefined,
        sort_by:
          filters.sortBy === 'updateTime'
            ? 'update_time'
            : filters.sortBy === 'rating'
              ? 'rating'
              : undefined,
      }

      await bookstoreStore.searchBooks(keyword, normalizedFilters)

      // 使用 store 中的搜索结果
      const resultList = bookstoreStore.books.searchResults || []
      searchResults.value = Array.isArray(resultList) ? resultList as BookBrief[] : []
      totalResults.value = bookstoreStore.searchResultsCount || searchResults.value.length
    }
  } catch (error) {
    console.error('搜索失败:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  hasSearched.value = false
  searchResults.value = []
  totalResults.value = 0
  currentPage.value = 1
  filters.categoryId = ''
  filters.status = '' as any
  filters.sortBy = 'relevance' as any
  // 清空作者搜索结果
  authorsResultStore.clearResults()
}

// 跳转到详情
const goToDetail = (id: string) => {
  router.push(`/bookstore/books/${id}`)
}

// 开始阅读（点击搜索结果中的阅读按钮）
const handleStartReading = async (bookId: string) => {
  try {
    // 获取第一章
    const response = await getFirstChapter(bookId) as any
    const firstChapter = response?.data || response

    if (firstChapter?.id) {
      // 跳转到阅读页面
      await router.push(`/reader/${firstChapter.id}`)
    } else {
      // 如果没有章节，直接跳转到书籍详情页
      await router.push(`/bookstore/books/${bookId}`)
    }
  } catch (error) {
    console.error('开始阅读失败:', error)
    // 出错时跳转到书籍详情页
    await router.push(`/bookstore/books/${bookId}`)
  }
}

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  handleSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  handleSearch()
}

onMounted(() => {
  loadCategories()
  loadSearchHistory()

  // 如果URL带有搜索参数，自动搜索
  const keyword = route.query.q as string
  if (keyword) {
    searchKeyword.value = keyword
    handleSearch()
  }
})
</script>

<style scoped lang="scss">
.search-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-header {
  background: white;
  padding: 40px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .search-type-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    .type-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 100px;
      justify-content: center;
    }
  }
}

.search-suggestions {
  .suggestion-section {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
      }
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

.search-results {
  .filter-bar {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 16px;

    .select,
    :deep(.select) {
      width: 100%;
    }
  }

  .result-info {
    padding: 16px 0;
    font-size: 14px;
    color: #606266;

    strong {
      color: #409eff;
      font-size: 18px;
    }

    .keyword-highlight {
      margin-left: 8px;
      color: #f56c6c;
      font-weight: 500;
    }
  }

  .results-list {
    min-height: 400px;
    position: relative;

    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px 20px;
    }

    .result-item {
      display: flex;
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .item-cover {
        width: 120px;
        height: 160px;
        flex-shrink: 0;
        border-radius: 4px;
        overflow: hidden;

        .image-wrapper {
          width: 100%;
          height: 100%;
        }
      }

      .item-content {
        flex: 1;
        padding: 0 20px;
        min-width: 0;

        .item-title {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 12px 0;
          color: #303133;

          :deep(.highlight) {
            color: #f56c6c;
            background-color: #fff1f0;
            padding: 2px 4px;
            border-radius: 2px;
          }
        }

        .item-author {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #606266;
          margin: 0 0 12px 0;

          :deep(.highlight) {
            color: #f56c6c;
            background-color: #fff1f0;
            padding: 2px 4px;
            border-radius: 2px;
          }
        }

        .item-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #909399;
          margin-bottom: 8px;
          flex-wrap: wrap;

          .rating {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #f56c6c;
          }
        }

        .latest-chapter {
          font-size: 13px;
          color: #909399;
          margin: 0;
        }
      }

      .item-action {
        display: flex;
        align-items: center;
        padding-left: 20px;
      }
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
  font-size: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

// 响应式
@media (max-width: 768px) {
  .search-header {
    padding: 20px;
  }

  .search-results .results-list .result-item {
    flex-direction: column;

    .item-cover {
      width: 100%;
      height: auto;
      aspect-ratio: 3/4;
      margin-bottom: 16px;
    }

    .item-content {
      padding: 0;
    }

    .item-action {
      padding: 16px 0 0 0;

      .button {
        width: 100%;
      }
    }
  }
}
</style>
