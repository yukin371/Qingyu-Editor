import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { BookBrief } from '@/types/models'
import type { BrowseFilters } from '@/types/models/browse'
import { filtersToQuery, queryToFilters } from '../utils/url-sync'
import { browseService } from '../services/browse.service'
import { SEARCH_CONFIG } from '../config/search.config'
import { listPublishedBookBriefs } from '@/modules/workflow/publishedBridge'

export const useBrowseStore = defineStore('browse', () => {
  const router = useRouter()
  // State
  const books = ref<BookBrief[]>([])
  
  const filters = reactive<BrowseFilters>({
    q: '',
    categoryId: '',
    year: '',
    status: '',
    tags: [],
    sortBy: SEARCH_CONFIG.DEFAULT_SORT_BY,
    page: 1,
    pageSize: SEARCH_CONFIG.DISPLAY_STEP + 4, // 24
    tagMode: 'and'
  })
  
  const pagination = reactive({
    total: 0,
    hasMore: false
  })
  
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Getters
  const hasActiveFilters = computed(() => {
    return !!(
      filters.q ||
      filters.categoryId ||
      filters.year ||
      filters.status ||
      filters.tags.length > 0
    )
  })

  const isMobile = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 640
  })

  // Actions
  const updateFilters = (newFilters: Partial<BrowseFilters>) => {
    Object.assign(filters, newFilters)
    
    // 非page字段变化时重置page
    if (!newFilters.page) {
      filters.page = 1
    }
  }

  const resetFilters = () => {
    filters.q = ''
    filters.categoryId = ''
    filters.year = ''
    filters.status = ''
    filters.tags = []
    filters.sortBy = 'updateTime'
    filters.page = 1
    filters.tagMode = 'and'
    error.value = null
  }

  // URL同步方法
  const syncFiltersFromURL = () => {
    const query = router.currentRoute.value.query
    const urlFilters = queryToFilters(query as Record<string, string | string[]>)
    updateFilters(urlFilters)
  }

  const syncFiltersToURL = () => {
    const query = filtersToQuery(filters)
    router.replace({ query })
  }

  // Data fetching
  const fetchBooks = async (append = false) => {
    loading.value = true
    error.value = null

    try {
      const response = await browseService.getBooks(filters)
      const payload = response as unknown as {
        data?: unknown
        list?: unknown[]
        items?: unknown[]
        books?: unknown[]
        total?: number
        pagination?: { total?: number; has_next?: boolean; hasMore?: boolean }
      }
      const rawData = payload?.data
      const nextBooks = Array.isArray(rawData)
        ? rawData
        : Array.isArray((rawData as { items?: unknown[] } | undefined)?.items)
          ? ((rawData as { items?: unknown[] }).items as BookBrief[])
          : Array.isArray((rawData as { books?: unknown[] } | undefined)?.books)
            ? ((rawData as { books?: unknown[] }).books as BookBrief[])
          : Array.isArray((rawData as { list?: unknown[] } | undefined)?.list)
            ? ((rawData as { list?: unknown[] }).list as BookBrief[])
          : Array.isArray(payload?.list)
            ? (payload.list as BookBrief[])
          : Array.isArray(payload?.items)
            ? (payload.items as BookBrief[])
          : Array.isArray(payload?.books)
            ? (payload.books as BookBrief[])
          : []

      const workflowBooks = listPublishedBookBriefs({
        q: filters.q,
        status: filters.status,
        tags: filters.tags
      }) as unknown as BookBrief[]

      const merged = append ? [...books.value, ...nextBooks] : [...workflowBooks, ...nextBooks]
      books.value = merged.filter((item, index, list) => list.findIndex(v => v.id === item.id) === index)

      const total = payload?.pagination?.total ?? payload?.total ?? nextBooks.length
      pagination.total = typeof total === 'number' ? Math.max(total, books.value.length) : books.value.length
      pagination.hasMore = Boolean(
        payload?.pagination?.has_next ??
        payload?.pagination?.hasMore ??
        (pagination.total > filters.page * filters.pageSize)
      )

      // 清除之前的错误
      error.value = null
    } catch (err) {
      error.value = err as Error
      books.value = []
      pagination.total = 0
      pagination.hasMore = false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    books,
    filters,
    pagination,
    loading,
    error,
    // Getters
    hasActiveFilters,
    isMobile,
    // Actions
    updateFilters,
    resetFilters,
    syncFiltersFromURL,
    syncFiltersToURL,
    fetchBooks
  }
})
