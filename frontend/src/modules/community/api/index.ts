/**
 * 社区/动态 API
 */
import { http } from '@/core/http'
import type { Post, PostComment, Topic, PostQuery } from '@/types/community'

/**
 * 获取动态列表
 */
export function getPosts(params?: PostQuery) {
  return http.get<{
    list: Post[]
    total: number
    page: number
    size: number
  }>('/api/v1/community/posts', { params })
}

/**
 * 获取动态详情
 */
export function getPostDetail(id: string) {
  return http.get<Post>(`/api/v1/community/posts/${id}`)
}

/**
 * 发布动态
 */
export function createPost(data: {
  type: string
  content: string
  images?: string[]
  bookId?: string
  topics?: string[]
}) {
  return http.post<Post>('/api/v1/community/posts', data)
}

/**
 * 更新动态
 */
export function updatePost(id: string, data: {
  content?: string
  topics?: string[]
}) {
  return http.put<Post>(`/api/v1/community/posts/${id}`, data)
}

/**
 * 删除动态
 */
export function deletePost(id: string) {
  return http.delete<{ success: boolean }>(`/api/v1/community/posts/${id}`)
}

/**
 * 点赞动态
 */
export function likePost(id: string) {
  return http.post<{ success: boolean; likeCount: number }>(`/api/v1/community/posts/${id}/like`)
}

/**
 * 取消点赞动态
 */
export function unlikePost(id: string) {
  return http.delete<{ success: boolean; likeCount: number }>(`/api/v1/community/posts/${id}/like`)
}

/**
 * 收藏动态
 */
export function bookmarkPost(id: string) {
  return http.post<{ success: boolean }>(`/api/v1/community/posts/${id}/bookmark`)
}

/**
 * 获取动态评论
 */
export function getPostComments(postId: string, params?: { page?: number; size?: number }) {
  return http.get<{
    list: PostComment[]
    total: number
  }>(`/api/v1/community/posts/${postId}/comments`, { params })
}

/**
 * 发表评论
 */
export function createPostComment(postId: string, data: {
  content: string
  replyTo?: string
}) {
  return http.post<PostComment>(`/api/v1/community/posts/${postId}/comments`, data)
}

/**
 * 获取话题列表
 */
export function getTopics(params?: { page?: number; size?: number }) {
  return http.get<{
    list: Topic[]
    total: number
  }>('/api/v1/community/topics', { params })
}

/**
 * 关注话题
 */
export function followTopic(topicId: string) {
  return http.post<{ success: boolean }>(`/api/v1/community/topics/${topicId}/follow`)
}


/**
 * 获取话题动态
 */
export function getTopicPosts(topicId: string, params?: { page?: number; size?: number }) {
  return http.get<{
    list: Post[]
    total: number
  }>(`/api/v1/community/topics/${topicId}/posts`, { params })
}

