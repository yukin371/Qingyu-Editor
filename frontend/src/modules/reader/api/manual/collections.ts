/**
 * 收藏相关 API
 * 对接后端 /api/v1/social/collections 路由
 * 后端路由文档: Qingyu_backend/router/social/social_router.go
 */

import { httpService } from '@/core/services/http.service'

/**
 * 收藏项
 */
export interface Collection {
  id: string
  bookId: string
  title: string
  author: string
  cover?: string
  description?: string
  tags?: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 收藏夹
 */
export interface CollectionFolder {
  id: string
  name: string
  description?: string
  bookCount: number
  createdAt: string
  updatedAt: string
}

/**
 * 收藏统计
 */
export interface CollectionStats {
  totalCollections: number
  publicCollections: number
  folderCount: number
}

/**
 * 收藏 API 接口 (v2.0)
 * @description 对接后端 /api/v1/social/collections
 * @endpoint /api/v1/social/collections
 * @category reader
 * @tags 收藏管理
 */
export const collectionsAPI = {
  /**
   * 添加收藏
   * @description 将指定书籍添加到收藏列表
   * @endpoint POST /api/v1/social/collections
   * @category reader
   * @tags 收藏管理
   * @param {string} bookId - 书籍ID
   * @param {Object} [data] - 收藏附加信息（可选）
   * @param {string} [data.title] - 自定义标题（可选）
   * @param {string} [data.description] - 自定义描述（可选）
   * @param {string[]} [data.tags] - 自定义标签（可选）
   * @response {APIResponse<Collection>} 201 - 成功添加收藏
   * @security BearerAuth
   */
  async addCollection(
    bookId: string,
    data?: { title?: string; description?: string; tags?: string[] }
  ): Promise<Collection> {
    return httpService.post<Collection>('/social/collections', {
      book_id: bookId,
      ...data
    })
  },

  /**
   * 获取收藏列表
   * @description 获取当前用户的收藏列表，支持分页
   * @endpoint GET /api/v1/social/collections
   * @category reader
   * @tags 收藏管理
   * @param {Object} [params] - 查询参数（可选）
   * @param {number} [params.page] - 页码（默认1）
   * @param {number} [params.pageSize] - 每页数量（默认20）
   * @response {PaginatedResponse<Collection>} 200 - 成功返回收藏列表
   * @security BearerAuth
   */
  async getCollections(params?: {
    page?: number
    pageSize?: number
  }): Promise<Collection[]> {
    return httpService.get<Collection[]>('/social/collections', { params })
  },

  /**
   * 更新收藏
   * @description 更新指定收藏的信息
   * @endpoint PUT /api/v1/social/collections/:id
   * @category reader
   * @tags 收藏管理
   * @param {string} id - 收藏ID
   * @param {Partial<Collection>} data - 更新数据
   * @response {APIResponse<Collection>} 200 - 成功更新收藏
   * @security BearerAuth
   */
  async updateCollection(
    id: string,
    data: Partial<Collection>
  ): Promise<Collection> {
    return httpService.put<Collection>(`/social/collections/${id}`, data)
  },

  /**
   * 删除收藏
   * @description 删除指定的收藏
   * @endpoint DELETE /api/v1/social/collections/:id
   * @category reader
   * @tags 收藏管理
   * @param {string} id - 收藏ID
   * @response {APIResponse<void>} 204 - 成功删除收藏
   * @security BearerAuth
   */
  async deleteCollection(id: string): Promise<void> {
    return httpService.delete<void>(`/social/collections/${id}`)
  },

  /**
   * 检查是否已收藏
   * @description 检查指定书籍是否已被收藏
   * @endpoint GET /api/v1/social/collections/check?book_id=xxx
   * @category reader
   * @tags 收藏管理
   * @param {string} bookId - 书籍ID
   * @response {APIResponse<{is_collected: boolean}>} 200 - 成功返回收藏状态
   * @security BearerAuth
   */
  async checkCollected(bookId: string): Promise<{ is_collected: boolean }> {
    return httpService.get<{ is_collected: boolean }>(
      `/social/collections/check`,
      { params: { book_id: bookId } }
    )
  },

  /**
   * 根据标签获取收藏
   * @description 获取带有指定标签的所有收藏
   * @endpoint GET /api/v1/social/collections/tags/:tag
   * @category reader
   * @tags 收藏管理
   * @param {string} tag - 标签名称
   * @response {APIResponse<Collection[]>} 200 - 成功返回带有该标签的收藏列表
   * @security BearerAuth
   */
  async getCollectionsByTag(tag: string): Promise<Collection[]> {
    return httpService.get<Collection[]>(`/social/collections/tags/${tag}`)
  },

  /**
   * 获取收藏统计
   * @description 获取用户的收藏统计信息
   * @endpoint GET /api/v1/social/collections/stats
   * @category reader
   * @tags 收藏管理
   * @response {APIResponse<CollectionStats>} 200 - 成功返回收藏统计数据
   * @security BearerAuth
   */
  async getCollectionStats(): Promise<CollectionStats> {
    return httpService.get<CollectionStats>('/social/collections/stats')
  },

  /**
   * 分享收藏
   * @description 生成指定收藏的分享链接
   * @endpoint POST /api/v1/social/collections/:id/share
   * @category reader
   * @tags 收藏管理
   * @param {string} id - 收藏ID
   * @response {APIResponse<{shareUrl: string}>} 201 - 成功生成分享链接
   * @security BearerAuth
   */
  async shareCollection(id: string): Promise<{ shareUrl: string }> {
    return httpService.post<{ shareUrl: string }>(
      `/social/collections/${id}/share`
    )
  },

  /**
   * 取消分享收藏
   * @description 取消指定收藏的分享链接
   * @endpoint DELETE /api/v1/social/collections/:id/share
   * @category reader
   * @tags 收藏管理
   * @param {string} id - 收藏ID
   * @response {APIResponse<void>} 204 - 成功取消分享
   * @security BearerAuth
   */
  async unshareCollection(id: string): Promise<void> {
    return httpService.delete<void>(`/social/collections/${id}/share`)
  },

  /**
   * 创建收藏夹
   * @description 创建一个新的收藏夹
   * @endpoint POST /api/v1/social/collections/folders
   * @category reader
   * @tags 收藏管理
   * @param {string} name - 收藏夹名称
   * @param {string} [description] - 收藏夹描述（可选）
   * @response {APIResponse<CollectionFolder>} 201 - 成功创建收藏夹
   * @security BearerAuth
   */
  async createFolder(
    name: string,
    description?: string
  ): Promise<CollectionFolder> {
    return httpService.post<CollectionFolder>('/social/collections/folders', {
      name,
      description
    })
  },

  /**
   * 获取收藏夹列表
   * @description 获取用户的所有收藏夹
   * @endpoint GET /api/v1/social/collections/folders
   * @category reader
   * @tags 收藏管理
   * @response {APIResponse<CollectionFolder[]>} 200 - 成功返回收藏夹列表
   * @security BearerAuth
   */
  async getFolders(): Promise<CollectionFolder[]> {
    return httpService.get<CollectionFolder[]>('/social/collections/folders')
  },

  /**
   * 更新收藏夹
   * @description 更新指定收藏夹的信息
   * @endpoint PUT /api/v1/social/collections/folders/:id
   * @category reader
   * @tags 收藏管理
   * @param {string} id - 收藏夹ID
   * @param {Partial<CollectionFolder>} data - 更新数据
   * @response {APIResponse<CollectionFolder>} 200 - 成功更新收藏夹
   * @security BearerAuth
   */
  async updateFolder(
    id: string,
    data: Partial<CollectionFolder>
  ): Promise<CollectionFolder> {
    return httpService.put<CollectionFolder>(
      `/social/collections/folders/${id}`,
      data
    )
  },

  /**
   * 删除收藏夹
   * @description 删除指定的收藏夹
   * @endpoint DELETE /api/v1/social/collections/folders/:id
   * @category reader
   * @tags 收藏管理
   * @param {string} id - 收藏夹ID
   * @response {APIResponse<void>} 204 - 成功删除收藏夹
   * @security BearerAuth
   */
  async deleteFolder(id: string): Promise<void> {
    return httpService.delete<void>(`/social/collections/folders/${id}`)
  }
}

// 向后兼容：导出旧的函数名
export const addCollection = (bookId: string, data?: { title?: string; description?: string; tags?: string[] }) =>
  collectionsAPI.addCollection(bookId, data)
export const getCollections = (params?: { page?: number; pageSize?: number }) => collectionsAPI.getCollections(params)
export const updateCollection = (id: string, data: Partial<Collection>) =>
  collectionsAPI.updateCollection(id, data)
export const deleteCollection = (id: string) => collectionsAPI.deleteCollection(id)
export const checkCollected = (bookId: string) => collectionsAPI.checkCollected(bookId)
export const getCollectionsByTag = (tag: string) => collectionsAPI.getCollectionsByTag(tag)
export const getCollectionStats = () => collectionsAPI.getCollectionStats()
export const shareCollection = (id: string) => collectionsAPI.shareCollection(id)
export const unshareCollection = (id: string) => collectionsAPI.unshareCollection(id)
export const createFolder = (name: string, description?: string) =>
  collectionsAPI.createFolder(name, description)
export const getFolders = () => collectionsAPI.getFolders()
export const updateFolder = (id: string, data: Partial<CollectionFolder>) => collectionsAPI.updateFolder(id, data)
export const deleteFolder = (id: string) => collectionsAPI.deleteFolder(id)

export default collectionsAPI
