/**
 * 书单 API
 */
import request from '../request'

// 书单类型
export interface Booklist {
  id: string
  creator_id: string
  creator_name?: string
  creator_avatar?: string
  name: string
  description: string
  cover_url?: string
  book_count: number
  follower_count: number
  is_public: boolean
  is_official: boolean
  tags?: string[]
  created_at: string
  updated_at: string
}

// 书单项目
export interface BooklistItem {
  id: string
  booklist_id: string
  book_id: string
  book_title: string
  book_cover: string
  book_author: string
  note?: string
  order: number
  added_at: string
}

// 书单统计
export interface BooklistStats {
  total_booklists: number
  public_booklists: number
  my_booklists: number
}

/**
 * 获取书单列表
 */
export function getBooklists(params: {
  page?: number
  page_size?: number
  user_id?: string
  is_public?: boolean
  is_official?: boolean
  tag?: string
}) {
  return request<{
    items: Booklist[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/social/booklists',
    method: 'get',
    params
  })
}

/**
 * 获取书单详情
 */
export function getBooklistDetail(id: string) {
  return request<Booklist & { items: BooklistItem[] }>({
    url: `/api/v1/social/booklists/${id}`,
    method: 'get'
  })
}

/**
 * 创建书单
 */
export function createBooklist(data: {
  name: string
  description: string
  cover_url?: string
  is_public: boolean
  tags?: string[]
}) {
  return request<Booklist>({
    url: '/api/v1/social/booklists',
    method: 'post',
    data
  })
}

/**
 * 更新书单
 */
export function updateBooklist(id: string, data: {
  name?: string
  description?: string
  cover_url?: string
  is_public?: boolean
  tags?: string[]
}) {
  return request<Booklist>({
    url: `/api/v1/social/booklists/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除书单
 */
export function deleteBooklist(id: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/booklists/${id}`,
    method: 'delete'
  })
}

/**
 * 添加书籍到书单
 */
export function addBookToBooklist(booklistId: string, data: {
  book_id: string
  note?: string
}) {
  return request<BooklistItem>({
    url: `/api/v1/social/booklists/${booklistId}/items`,
    method: 'post',
    data
  })
}

/**
 * 移除书单中的书籍
 */
export function removeBookFromBooklist(booklistId: string, itemId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/booklists/${booklistId}/items/${itemId}`,
    method: 'delete'
  })
}

/**
 * 关注书单
 */
export function followBooklist(id: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/booklists/${id}/follow`,
    method: 'post'
  })
}

/**
 * 取消关注书单
 */
export function unfollowBooklist(id: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/booklists/${id}/follow`,
    method: 'delete'
  })
}

/**
 * 获取官方书单
 */
export function getOfficialBooklists() {
  return request<Booklist[]>({
    url: '/api/v1/social/booklists/official',
    method: 'get'
  })
}

/**
 * 获取热门书单
 */
export function getHotBooklists(limit = 10) {
  return request<Booklist[]>({
    url: '/api/v1/social/booklists/hot',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取我的书单统计
 */
export function getMyBooklistStats() {
  return request<BooklistStats>({
    url: '/api/v1/social/booklists/my/stats',
    method: 'get'
  })
}
