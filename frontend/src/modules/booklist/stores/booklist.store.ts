/**
 * 书单状态管理
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as booklistApi from '../api'
import type { BookList, BookListQuery, MyBookListStats } from '@/types/booklist'

export const useBooklistStore = defineStore('booklist', () => {
  // State
  const booklists = ref<BookList[]>([])
  const currentBooklist = ref<BookList | null>(null)
  const myBooklists = ref<BookList[]>([])
  const favoriteBooklists = ref<BookList[]>([])
  const myStats = ref<MyBookListStats | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const total = ref(0)

  // Getters
  const hasBooklists = computed(() => booklists.value.length > 0)
  const popularTags = ref<string[]>([])

  // Actions
  /**
   * 获取书单列表
   */
  async function fetchBooklists(params?: BookListQuery) {
    loading.value = true
    error.value = null
    try {
      const data = await booklistApi.getBookLists(params)
      if (data && data.list) {
        booklists.value = data.list
        total.value = data.total
      }
    } catch (err) {
      error.value = err as Error
      console.error('获取书单列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取书单详情
   */
  async function fetchBooklistDetail(id: string) {
    loading.value = true
    error.value = null
    try {
      const data = await booklistApi.getBookListDetail(id)
      if (data) {
        currentBooklist.value = data
      }
    } catch (err) {
      error.value = err as Error
      console.error('获取书单详情失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取我的书单
   */
  async function fetchMyBooklists() {
    loading.value = true
    error.value = null
    try {
      const data = await booklistApi.getBookLists({ sort: 'latest' })
      if (data && data.list) {
        myBooklists.value = data.list
      }
    } catch (err) {
      error.value = err as Error
      console.error('获取我的书单失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取收藏的书单
   */
  async function fetchFavoriteBooklists() {
    loading.value = true
    error.value = null
    try {
      // 这里应该调用专门的收藏API，暂时使用列表API
      const data = await booklistApi.getBookLists({ sort: 'hottest' })
      if (data && data.list) {
        favoriteBooklists.value = data.list
      }
    } catch (err) {
      error.value = err as Error
      console.error('获取收藏书单失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取我的书单统计
   */
  async function fetchMyStats() {
    try {
      const data = await booklistApi.getMyBookListStats()
      if (data) {
        myStats.value = data
      }
    } catch (err) {
      console.error('获取书单统计失败:', err)
    }
  }

  /**
   * 获取热门标签
   */
  async function fetchPopularTags() {
    try {
      const data = await booklistApi.getPopularTags(20)
      if (data && Array.isArray(data)) {
        popularTags.value = data.map((item: { tag: string }) => item.tag)
      }
    } catch (err) {
      console.error('获取热门标签失败:', err)
    }
  }

  /**
   * 创建书单
   */
  async function createBooklist(data: {
    title: string
    description: string
    cover?: string
    isPublic: boolean
    tags?: string[]
  }) {
    loading.value = true
    try {
      const result = await booklistApi.createBookList(data)
      if (result) {
        return result
      }
    } catch (err) {
      console.error('创建书单失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新书单
   */
  async function updateBooklist(id: string, data: {
    title?: string
    description?: string
    cover?: string
    isPublic?: boolean
    tags?: string[]
  }) {
    loading.value = true
    try {
      const result = await booklistApi.updateBookList(id, data)
      if (result) {
        return result
      }
    } catch (err) {
      console.error('更新书单失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除书单
   */
  async function deleteBooklist(id: string) {
    loading.value = true
    try {
      const result = await booklistApi.deleteBookList(id)
      if (result) {
        // 从列表中移除
        booklists.value = booklists.value.filter(item => item.id !== id)
        myBooklists.value = myBooklists.value.filter(item => item.id !== id)
        return true
      }
    } catch (err) {
      console.error('删除书单失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 收藏书单
   */
  async function favoriteBooklist(id: string) {
    try {
      const result = await booklistApi.favoriteBookList(id)
      if (result) {
        // 更新本地状态
        const booklist = booklists.value.find(item => item.id === id)
        if (booklist) {
          booklist.isLiked = true
          booklist.likeCount++
        }
        return true
      }
    } catch (err) {
      console.error('收藏书单失败:', err)
      throw err
    }
  }

  /**
   * 取消收藏书单
   */
  async function unfavoriteBooklist(id: string) {
    try {
      const result = await booklistApi.unfavoriteBookList(id)
      if (result) {
        // 更新本地状态
        const booklist = booklists.value.find(item => item.id === id)
        if (booklist) {
          booklist.isLiked = false
          booklist.likeCount--
        }
        return true
      }
    } catch (err) {
      console.error('取消收藏书单失败:', err)
      throw err
    }
  }

  /**
   * 添加书籍到书单
   */
  async function addBookToList(listId: string, bookId: string, note?: string) {
    try {
      const result = await booklistApi.addBookToList(listId, { bookId, note })
      if (result) {
        return result
      }
    } catch (err) {
      console.error('添加书籍失败:', err)
      throw err
    }
  }

  /**
   * 从书单移除书籍
   */
  async function removeBookFromList(listId: string, bookId: string) {
    try {
      const result = await booklistApi.removeBookFromList(listId, bookId)
      if (result) {
        // 更新当前书单
        if (currentBooklist.value && currentBooklist.value.id === listId) {
          currentBooklist.value.books = currentBooklist.value.books.filter(
            item => item.bookId !== bookId
          )
          currentBooklist.value.bookCount--
        }
        return true
      }
    } catch (err) {
      console.error('移除书籍失败:', err)
      throw err
    }
  }

  return {
    // State
    booklists,
    currentBooklist,
    myBooklists,
    favoriteBooklists,
    myStats,
    loading,
    error,
    total,
    popularTags,
    // Getters
    hasBooklists,
    // Actions
    fetchBooklists,
    fetchBooklistDetail,
    fetchMyBooklists,
    fetchFavoriteBooklists,
    fetchMyStats,
    fetchPopularTags,
    createBooklist,
    updateBooklist,
    deleteBooklist,
    favoriteBooklist,
    unfavoriteBooklist,
    addBookToList,
    removeBookFromList
  }
})
