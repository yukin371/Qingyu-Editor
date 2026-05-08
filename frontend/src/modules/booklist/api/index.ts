/**
 * 书单系统 API
 */
import { http } from '@/core/http'
import type { BookList, BookListItem, BookListQuery, MyBookListStats } from '@/types/booklist'

/**
 * 获取书单列表
 */
export function getBookLists(params?: BookListQuery) {
  return http.get<{
    list: BookList[]
    total: number
    page: number
    size: number
  }>('/api/v1/booklists', { params })
}

/**
 * 获取书单详情
 */
export function getBookListDetail(id: string) {
  return http.get<BookList>(`/api/v1/booklists/${id}`)
}

/**
 * 创建书单
 */
export function createBookList(data: {
  title: string
  description: string
  cover?: string
  isPublic: boolean
  tags?: string[]
}) {
  return http.post<BookList>('/api/v1/booklists', data)
}

/**
 * 更新书单
 */
export function updateBookList(id: string, data: {
  title?: string
  description?: string
  cover?: string
  isPublic?: boolean
  tags?: string[]
}) {
  return http.put<BookList>(`/api/v1/booklists/${id}`, data)
}

/**
 * 删除书单
 */
export function deleteBookList(id: string) {
  return http.delete<{ success: boolean }>(`/api/v1/booklists/${id}`)
}

/**
 * 收藏书单
 */
export function favoriteBookList(id: string) {
  return http.post<{ success: boolean }>(`/api/v1/booklists/${id}/favorite`)
}

/**
 * 取消收藏书单
 */
export function unfavoriteBookList(id: string) {
  return http.delete<{ success: boolean }>(`/api/v1/booklists/${id}/favorite`)
}

/**
 * 向书单添加书籍
 */
export function addBookToList(listId: string, data: {
  bookId: string
  note?: string
}) {
  return http.post<BookListItem>(`/api/v1/booklists/${listId}/books`, data)
}

/**
 * 从书单移除书籍
 */
export function removeBookFromList(listId: string, bookId: string) {
  return http.delete<{ success: boolean }>(`/api/v1/booklists/${listId}/books/${bookId}`)
}

/**
 * 获取我的书单统计
 */
export function getMyBookListStats() {
  return http.get<MyBookListStats>('/api/v1/booklists/my/stats')
}

/**
 * 获取热门标签
 */
export function getPopularTags(limit = 20) {
  return http.get<{ tag: string; count: number }[]>('/api/v1/booklists/tags/popular', {
    params: { limit }
  })
}
