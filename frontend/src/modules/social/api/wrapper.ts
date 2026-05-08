/**
 * Social API Wrapper
 * 将orval生成的工厂模式API转换为更易使用的格式
 *
 * 使用方式：
 * import * as socialAPI from '@/modules/social/api'
 * const booklists = await socialAPI.getBookLists({ page: 1, size: 20 })
 */

import { getApi } from './generated/social'
import type { APIResponse } from '@/types/api'

// 获取生成的API对象
const api = getApi()

// ==================== 类型定义 ====================

/**
 * 书单类型
 */
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

/**
 * 书单项目
 */
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

/**
 * 书单统计
 */
export interface BooklistStats {
  total_booklists: number
  public_booklists: number
  my_booklists: number
}

/**
 * 书评类型
 */
export type ReviewType = 'book' | 'chapter' | 'list'

/**
 * 书评状态
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'deleted'

/**
 * 书评
 */
export interface Review {
  id: string
  reviewer_id: string
  reviewer_name: string
  reviewer_avatar: string
  target_id: string
  target_type: ReviewType
  book_id?: string
  book_title?: string
  book_cover?: string
  chapter_id?: string
  chapter_title?: string
  title: string
  content: string
  rating: number
  like_count: number
  comment_count: number
  is_spoiler: boolean
  status: ReviewStatus
  created_at: string
  updated_at: string
}

/**
 * 书评评论
 */
export interface ReviewComment {
  id: string
  review_id: string
  commenter_id: string
  commenter_name: string
  commenter_avatar: string
  content: string
  like_count: number
  created_at: string
}

/**
 * 书评统计
 */
export interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    rating: number
    count: number
  }[]
}

/**
 * 用户关注信息
 */
export interface UserFollowInfo {
  user_id: string
  username: string
  avatar_url?: string
  bio?: string
  follower_count: number
  following_count: number
  is_following?: boolean
  is_followed_by?: boolean
  created_at?: string
}

/**
 * 关注统计
 */
export interface FollowStats {
  follower_count: number
  following_count: number
  mutual_count: number
}

/**
 * 提及
 */
export interface Mention {
  id: string
  from_user_id: string
  from_user_name: string
  from_user_avatar?: string
  to_user_id: string
  content: string
  is_read: boolean
  created_at: string
}

/**
 * 消息
 */
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  content: string
  is_read: boolean
  created_at: string
}

/**
 * 消息类型
 */
export type MessageType = 'text' | 'image' | 'voice' | 'file' | 'system'

/**
 * 消息状态
 */
export type MessageStatus = 'sending' | 'sent' | 'read' | 'failed'

/**
 * 评分统计
 */
export interface RatingStats {
  average_rating: number
  total_ratings: number
  rating_distribution: {
    rating: number
    count: number
  }[]
}

/**
 * 会话
 */
export interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_avatar?: string
  last_message?: string
  last_message_time?: string
  last_message_type?: MessageType
  unread_count: number
  created_at: string
  updated_at: string
}

/**
 * 消息
 */
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  type: MessageType
  content: string
  file_url?: string
  file_name?: string
  file_size?: number
  status?: MessageStatus
  is_read: boolean
  created_at: string
}

// ==================== 书单相关 API ====================

/**
 * 获取书单列表
 * 兼容旧API: getBooklists(params)
 */
export const getBookLists = api.getApiV1SocialBooklists

/**
 * 获取书单列表（别名，兼容旧API）
 */
export const getBooklists = getBookLists

/**
 * 创建书单
 * 兼容旧API: createBooklist(data)
 */
export const createBookList = api.postApiV1SocialBooklists

/**
 * 创建书单（别名，兼容旧API）
 */
export const createBooklist = createBookList

/**
 * 删除书单
 * 兼容旧API: deleteBooklist(id)
 */
export const deleteBookList = api.deleteApiV1SocialBooklistsId

/**
 * 删除书单（别名，兼容旧API）
 */
export const deleteBooklist = deleteBookList

/**
 * 获取书单详情
 * 兼容旧API: getBooklistDetail(id)
 */
export const getBookListDetail = api.getApiV1SocialBooklistsId

/**
 * 获取书单详情（别名，兼容旧API）
 */
export const getBooklistDetail = getBookListDetail

/**
 * 更新书单
 * 兼容旧API: updateBooklist(id, data)
 */
export const updateBookList = api.putApiV1SocialBooklistsId

/**
 * 更新书单（别名，兼容旧API）
 */
export const updateBooklist = updateBookList

/**
 * 获取书单中的书籍列表
 * 兼容旧API: getBooklistBooks(id)
 */
export const getBookListBooks = api.getApiV1SocialBooklistsIdBooks

/**
 * 复制书单
 */
export const forkBookList = api.postApiV1SocialBooklistsIdFork

/**
 * 点赞书单
 */
export const likeBookList = api.postApiV1SocialBooklistsIdLike

// ==================== 书评相关 API ====================

/**
 * 获取书评列表
 * 兼容旧API: getReviews(params)
 */
export const getReviews = api.getApiV1SocialReviews

/**
 * 创建书评
 * 兼容旧API: createReview(data)
 */
export const createReview = api.postApiV1SocialReviews

/**
 * 删除书评
 * 兼容旧API: deleteReview(id)
 */
export const deleteReview = api.deleteApiV1SocialReviewsId

/**
 * 获取书评详情
 * 兼容旧API: getReviewDetail(id)
 */
export const getReviewDetail = api.getApiV1SocialReviewsId

/**
 * 更新书评
 * 兼容旧API: updateReview(id, data)
 */
export const updateReview = api.putApiV1SocialReviewsId

/**
 * 点赞书评
 */
export const likeReview = api.postApiV1SocialReviewsIdLike

// ==================== 关注相关 API ====================

/**
 * 获取关注列表
 * 兼容旧API: getFollowingList(params)
 */
export const getFollowingAuthors = api.getApiV1SocialFollowingAuthors

/**
 * 获取用户关注列表（别名，兼容旧API）
 */
export const getFollowingList = getFollowingAuthors

/**
 * 关注用户
 * 兼容旧API: followUser(userId)
 */
export async function followUser(userId: string): Promise<APIResponse<{ success: boolean }>> {
  return api.postApiV1SocialFollowUserId(userId) as any
}

/**
 * 取消关注用户
 * 兼容旧API: unfollowUser(userId)
 */
export async function unfollowUser(userId: string): Promise<APIResponse<{ success: boolean }>> {
  return api.deleteApiV1SocialFollowUserId(userId) as any
}

/**
 * 检查关注状态
 * 兼容旧API: checkFollowStatus(userId)
 */
export const getFollowStatus = api.getApiV1SocialFollowUserIdStatus

/**
 * 检查关注状态（别名，兼容旧API）
 */
export const checkFollowStatus = getFollowStatus

/**
 * 获取用户粉丝列表
 * 兼容旧API: getFollowersList(params)
 */
export const getFollowers = api.getApiV1SocialUsersUserIdFollowers

/**
 * 获取用户粉丝列表（别名，兼容旧API）
 */
export const getFollowersList = (userId: string, params?: any) => getFollowers(userId, params)

/**
 * 获取用户关注列表
 * 兼容旧API: getFollowingList(params)
 */
export const getFollowing = api.getApiV1SocialUsersUserIdFollowing

/**
 * 获取用户关注列表（别名，兼容旧API）
 */
export const getUserFollowing = (userId: string, params?: any) => getFollowing(userId, params)

/**
 * 获取用户关注统计
 */
export const getUserFollowStats = api.getApiV1SocialUsersUserIdFollowStats

/**
 * 获取用户关注状态
 */
export const getUserFollowStatus = api.getApiV1SocialUsersUserIdFollowStatus

/**
 * 取消关注用户
 */
export const userUnfollow = api.deleteApiV1SocialUsersUserIdUnfollow

/**
 * 关注作者
 */
export const followAuthor = api.postApiV1SocialAuthorsAuthorIdFollow

/**
 * 取消关注作者
 */
export const unfollowAuthor = api.deleteApiV1SocialAuthorsAuthorIdUnfollow

// ==================== 评论相关 API ====================

/**
 * 发表评论
 */
export const createComment = api.postApiV1ReaderComments

/**
 * 获取评论列表
 */
export const getComments = api.getApiV1ReaderComments

/**
 * 获取评论详情
 */
export const getCommentDetail = api.getApiV1ReaderCommentsId

/**
 * 更新评论
 */
export const updateComment = api.putApiV1ReaderCommentsId

/**
 * 删除评论
 */
export const deleteComment = api.deleteApiV1ReaderCommentsId

/**
 * 回复评论
 */
export const replyComment = api.postApiV1ReaderCommentsIdReply

/**
 * 获取评论线程
 */
export const getCommentThread = api.getApiV1ReaderCommentsIdThread

/**
 * 获取热门评论
 */
export const getTopComments = api.getApiV1ReaderCommentsTop

/**
 * 获取评论回复
 */
export const getCommentReplies = api.getApiV1ReaderCommentsIdReplies

/**
 * 点赞评论
 */
export const likeComment = api.postApiV1ReaderCommentsIdLike

/**
 * 取消点赞评论
 */
export const unlikeComment = api.deleteApiV1ReaderCommentsIdLike

// ==================== 点赞相关 API ====================

/**
 * 点赞书籍
 */
export const likeBook = api.postApiV1ReaderBooksBookIdLike

/**
 * 取消点赞书籍
 */
export const unlikeBook = api.deleteApiV1ReaderBooksBookIdLike

/**
 * 获取书籍点赞信息
 */
export const getBookLikeInfo = api.getApiV1ReaderBooksBookIdLikeInfo

/**
 * 获取用户点赞的书籍列表
 */
export const getUserLikedBooks = api.getApiV1ReaderLikesBooks

/**
 * 获取用户点赞统计
 */
export const getUserLikeStats = api.getApiV1ReaderLikesStats

// ==================== 收藏相关 API ====================

/**
 * 添加收藏
 */
export const addCollection = api.postApiV1ReaderCollections

/**
 * 获取收藏列表
 */
export const getCollections = api.getApiV1ReaderCollections

/**
 * 更新收藏
 */
export const updateCollection = api.putApiV1ReaderCollectionsId

/**
 * 删除收藏
 */
export const deleteCollection = api.deleteApiV1ReaderCollectionsId

/**
 * 检查是否已收藏
 */
export const checkCollected = api.getApiV1ReaderCollectionsCheckBookId

/**
 * 根据标签获取收藏
 */
export const getCollectionsByTag = api.getApiV1ReaderCollectionsTagsTag

/**
 * 获取收藏统计
 */
export const getCollectionStats = api.getApiV1ReaderCollectionsStats

/**
 * 分享收藏
 */
export const shareCollection = api.postApiV1ReaderCollectionsIdShare

/**
 * 取消分享收藏
 */
export const unshareCollection = api.deleteApiV1ReaderCollectionsIdShare

/**
 * 获取公开收藏
 */
export const getPublicCollections = api.getApiV1ReaderCollectionsPublic

/**
 * 创建收藏夹
 */
export const createFolder = api.postApiV1ReaderCollectionsFolders

/**
 * 获取收藏夹列表
 */
export const getFolders = api.getApiV1ReaderCollectionsFolders

/**
 * 更新收藏夹
 */
export const updateFolder = api.putApiV1ReaderCollectionsFoldersId

/**
 * 删除收藏夹
 */
export const deleteFolder = api.deleteApiV1ReaderCollectionsFoldersId

// ==================== 评分相关 API ====================

/**
 * 获取评分统计
 */
export const getRatingStats = api.getApiV1BookstoreBooksIdAverageRating

/**
 * 获取书籍评分
 */
export const getBookRating = api.getApiV1BookstoreBooksIdRating

/**
 * 创建书籍评分
 */
export const createBookRating = api.postApiV1BookstoreBooksIdRating

/**
 * 更新书籍评分
 */
export const updateBookRating = api.putApiV1BookstoreBooksIdRating

/**
 * 删除书籍评分
 */
export const deleteBookRating = api.deleteApiV1BookstoreBooksIdRating

/**
 * 获取评分分布
 */
export const getRatingDistribution = api.getApiV1BookstoreBooksIdRatingDistribution

/**
 * 获取书籍评分列表
 */
export const getBookRatings = api.getApiV1BookstoreBooksIdRatings

// ==================== 提及相关 API ====================

/**
 * 获取提及列表
 */
export const getMentions = api.getApiV1SocialMentions

/**
 * 创建提及
 */
export const createMention = api.postApiV1SocialMentions

/**
 * 标记提及为已读
 */
export const markMentionAsRead = api.putApiV1SocialMentionsIdRead

// ==================== 消息相关 API ====================

/**
 * 发送消息
 */
export const sendMessage = api.postApiV1SocialMessages

/**
 * 获取会话消息
 */
export const getConversationMessages = api.getApiV1SocialMessagesConversationId

/**
 * 删除消息
 */
export const deleteMessage = api.deleteApiV1SocialMessagesId

/**
 * 标记消息为已读
 */
export const markMessageAsRead = api.putApiV1SocialMessagesIdRead

/**
 * 获取会话列表
 */
export const getConversations = api.getApiV1SocialMessagesConversations

/**
 * 创建会话
 */
export const createConversation = api.postApiV1SocialMessagesConversations

/**
 * 删除会话
 * @description 使用 message.ts 中的手动实现
 */

/**
 * 获取会话消息
 */
export const getConversationMessagesList =
  api.getApiV1SocialMessagesConversationsConversationIdMessages

/**
 * 发送会话消息
 */
export const sendConversationMessage =
  api.postApiV1SocialMessagesConversationsConversationIdMessages

/**
 * 标记会话为已读
 */
export const markConversationAsRead = api.postApiV1SocialMessagesConversationsConversationIdRead

// 从 message.ts 导入手动实现的API（generated API中不存在）
import {
  searchConversations,
  uploadMessageFile,
  recallMessage,
  sendImageMessage,
  sendFileMessage,
  getConversationStats,
  deleteConversation,
} from './message'

// 从 review.ts 导入手动实现的API（generated API中不存在）
import {
  getReviewComments,
  addReviewComment,
  deleteReviewComment,
  getReviewStats,
  getMyReviews,
  getHotReviews,
  reportReview,
} from './review'

// 从 follow.ts 导入手动实现的API（generated API中不存在）
import { getMutualFollows, getRecommendedFollows } from './follow'

// 重新导出这些API
export {
  searchConversations,
  uploadMessageFile,
  recallMessage,
  sendImageMessage,
  sendFileMessage,
  getConversationStats,
  deleteConversation,
  getReviewComments,
  addReviewComment,
  deleteReviewComment,
  getReviewStats,
  getMyReviews,
  getHotReviews,
  reportReview,
  getMutualFollows,
  getRecommendedFollows,
}

// ==================== 其他便捷方法 ====================

/**
 * 导出原始getApi函数（高级用法）
 * 可以传入自定义axios实例
 */
export { getApi }

/**
 * 默认导出
 */
export default {
  // 书单相关
  getBookLists,
  getBooklists,
  createBookList,
  createBooklist,
  deleteBookList,
  deleteBooklist,
  getBookListDetail,
  getBooklistDetail,
  updateBookList,
  updateBooklist,
  getBookListBooks,
  forkBookList,
  likeBookList,
  // 书评相关
  getReviews,
  createReview,
  deleteReview,
  getReviewDetail,
  updateReview,
  likeReview,
  // 关注相关
  getFollowingAuthors,
  getFollowingList,
  followUser,
  unfollowUser,
  getFollowStatus,
  checkFollowStatus,
  getFollowers,
  getFollowersList,
  getFollowing,
  getUserFollowing,
  getUserFollowStats,
  getUserFollowStatus,
  userUnfollow,
  followAuthor,
  unfollowAuthor,
  // 提及相关
  getMentions,
  createMention,
  markMentionAsRead,
  // 消息相关
  sendMessage,
  getConversationMessages,
  deleteMessage,
  markMessageAsRead,
  getConversations,
  createConversation,
  getConversationMessagesList,
  sendConversationMessage,
  markConversationAsRead,
  getConversationStats,
  deleteConversation,
  searchConversations,
  uploadMessageFile,
  recallMessage,
  sendImageMessage,
  sendFileMessage,
  // 评论相关
  createComment,
  getComments,
  getCommentDetail,
  updateComment,
  deleteComment,
  replyComment,
  getCommentThread,
  getTopComments,
  getCommentReplies,
  likeComment,
  unlikeComment,
  // 点赞相关
  likeBook,
  unlikeBook,
  getBookLikeInfo,
  getUserLikedBooks,
  getUserLikeStats,
  // 收藏相关
  addCollection,
  getCollections,
  updateCollection,
  deleteCollection,
  checkCollected,
  getCollectionsByTag,
  getCollectionStats,
  shareCollection,
  unshareCollection,
  getPublicCollections,
  createFolder,
  getFolders,
  updateFolder,
  deleteFolder,
  // 评分相关
  getRatingStats,
  getBookRating,
  createBookRating,
  updateBookRating,
  deleteBookRating,
  getRatingDistribution,
  getBookRatings,
  // 书评扩展
  getReviewComments,
  addReviewComment,
  deleteReviewComment,
  getReviewStats,
  getMyReviews,
  getHotReviews,
  reportReview,
  // 关注扩展
  getMutualFollows,
  getRecommendedFollows,
  // 工具函数
  getApi,
}
