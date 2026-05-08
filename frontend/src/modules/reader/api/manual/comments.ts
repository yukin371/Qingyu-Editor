/**
 * 评论 API 模块
 * 对接后端 /api/v1/social/comments 路由
 * 后端路由文档: Qingyu_backend/router/social/social_router.go
 */

import { httpService } from '@/core/services/http.service'

/**
 * 评论信息
 */
export interface Comment {
  id: string
  bookId: string
  chapterId?: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  rating?: number
  likesCount: number
  repliesCount: number
  isLiked: boolean
  parentId?: string
  createdAt: string
  updatedAt: string
}

/**
 * 评论列表响应
 */
export interface CommentListResponse {
  comments: Comment[]
  total: number
  page: number
  pageSize: number
}

/**
 * 获取评论列表参数
 */
export interface GetCommentListParams {
  book_id?: string
  chapter_id?: string
  page?: number
  page_size?: number
  sortBy?: 'time' | 'likes'
}

/**
 * 创建评论参数
 */
export interface CreateCommentParams {
  book_id: string
  chapter_id?: string
  content: string
  rating?: number
}

/**
 * 更新评论参数
 */
export interface UpdateCommentParams {
  content?: string
  rating?: number
}

/**
 * 回复评论参数
 */
export interface ReplyCommentParams {
  content: string
}

/**
 * 评论 API 接口 (v2.0)
 * 对接后端: /api/v1/social/comments
 */
/**
 * 评论相关 API
 * @description 对接后端 /api/v1/social/comments 路由
 * @endpoint /api/v1/social/comments
 * @category social
 * @tags 评论相关
 */
export const commentsAPI = {
  /**
   * 发表评论
   * @description 创建新的书评或章节评论
   * @endpoint POST /api/v1/social/comments
   * @category social
   * @tags 评论相关
   * @param {CreateCommentParams} params - 评论参数（包含书籍ID、章节ID、内容、评分等）
   * @response {APIResponse<Comment>} 201 - 成功创建评论
   * @security BearerAuth
   */
  async createComment(params: CreateCommentParams): Promise<Comment> {
    return httpService.post<Comment>('/social/comments', params)
  },

  /**
   * 获取评论列表
   * @description 获取指定书籍或章节的评论列表，支持分页和排序
   * @endpoint GET /api/v1/social/comments
   * @category social
   * @tags 评论相关
   * @param {GetCommentListParams} params - 查询参数（书籍ID、章节ID、页码、排序方式等）
   * @response {CommentListResponse} 200 - 成功返回评论列表
   */
  async getCommentList(params: GetCommentListParams): Promise<CommentListResponse> {
    return httpService.get<CommentListResponse>('/social/comments', { params })
  },

  /**
   * 获取评论详情
   * @description 根据评论ID获取评论的详细信息
   * @endpoint GET /api/v1/social/comments/:id
   * @category social
   * @tags 评论相关
   * @param {string} commentId - 评论ID
   * @response {APIResponse<Comment>} 200 - 成功返回评论详情
   */
  async getCommentById(commentId: string): Promise<Comment> {
    return httpService.get<Comment>(`/social/comments/${commentId}`)
  },

  /**
   * 更新评论
   * @description 更新已有评论的内容或评分
   * @endpoint PUT /api/v1/social/comments/:id
   * @category social
   * @tags 评论相关
   * @param {string} commentId - 评论ID
   * @param {UpdateCommentParams} params - 更新参数（内容和评分）
   * @response {APIResponse<Comment>} 200 - 成功更新评论
   * @security BearerAuth
   */
  async updateComment(
    commentId: string,
    params: UpdateCommentParams
  ): Promise<Comment> {
    return httpService.put<Comment>(`/social/comments/${commentId}`, params)
  },

  /**
   * 删除评论
   * @description 删除指定评论
   * @endpoint DELETE /api/v1/social/comments/:id
   * @category social
   * @tags 评论相关
   * @param {string} commentId - 评论ID
   * @response {APIResponse<void>} 204 - 成功删除评论
   * @security BearerAuth
   */
  async deleteComment(commentId: string): Promise<void> {
    return httpService.delete<void>(`/social/comments/${commentId}`)
  },

  /**
   * 回复评论
   * @description 对指定评论进行回复
   * @endpoint POST /api/v1/social/comments/:id/reply
   * @category social
   * @tags 评论相关
   * @param {string} commentId - 父评论ID
   * @param {ReplyCommentParams} params - 回复参数（回复内容）
   * @response {APIResponse<Comment>} 201 - 成功创建回复
   * @security BearerAuth
   */
  async replyComment(
    commentId: string,
    params: ReplyCommentParams
  ): Promise<Comment> {
    return httpService.post<Comment>(
      `/social/comments/${commentId}/reply`,
      params
    )
  },

  /**
   * 点赞评论
   * @description 对指定评论进行点赞
   * @endpoint POST /api/v1/social/comments/:id/like
   * @category social
   * @tags 评论相关
   * @param {string} commentId - 评论ID
   * @response {APIResponse<void>} 200 - 成功点赞
   * @security BearerAuth
   */
  async likeComment(commentId: string): Promise<void> {
    return httpService.post<void>(`/social/comments/${commentId}/like`)
  },

  /**
   * 取消点赞评论
   * @description 取消对指定评论的点赞
   * @endpoint DELETE /api/v1/social/comments/:id/like
   * @category social
   * @tags 评论相关
   * @param {string} commentId - 评论ID
   * @response {APIResponse<void>} 204 - 成功取消点赞
   * @security BearerAuth
   */
  async unlikeComment(commentId: string): Promise<void> {
    return httpService.delete<void>(`/social/comments/${commentId}/like`)
  }
}

// 向后兼容：导出旧的函数名
export const getBookComments = (bookId: string, params?: {
  page?: number
  size?: number
  sortBy?: 'time' | 'likes'
}) => {
  return commentsAPI.getCommentList({
    book_id: bookId,
    page: params?.page,
    page_size: params?.size,
    sortBy: params?.sortBy
  })
}

export const createComment = (bookId: string, content: string, rating?: number) => {
  return commentsAPI.createComment({ book_id: bookId, content, rating })
}

export const replyComment = (commentId: string, content: string) => {
  return commentsAPI.replyComment(commentId, { content })
}

export const deleteComment = (commentId: string) => {
  return commentsAPI.deleteComment(commentId)
}

export const likeComment = (commentId: string) => {
  return commentsAPI.likeComment(commentId)
}

export const unlikeComment = (commentId: string) => {
  return commentsAPI.unlikeComment(commentId)
}

export const getChapterComments = (chapterId: string, params?: {
  page?: number
  size?: number
}) => {
  return commentsAPI.getCommentList({
    book_id: '', // 需要传入bookId
    chapter_id: chapterId,
    page: params?.page,
    page_size: params?.size
  })
}

export default commentsAPI
