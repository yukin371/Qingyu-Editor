/**
 * 站内消息 API
 */
import request from '../request'

// 消息类型
export type MessageType = 'text' | 'image' | 'voice' | 'file' | 'system'

// 消息状态
export type MessageStatus = 'sending' | 'sent' | 'read' | 'failed'

// 会话
export interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_avatar: string
  last_message: string
  last_message_time: string
  last_message_type: MessageType
  unread_count: number
  updated_at: string
}

// 消息
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  type: MessageType
  content: string
  file_url?: string
  file_name?: string
  file_size?: number
  status: MessageStatus
  is_read: boolean
  created_at: string
}

// 对话统计
export interface ConversationStats {
  total_conversations: number
  total_unread: number
}

/**
 * 获取对话列表
 * @description 获取当前用户的对话列表，包括每个对话的最后消息和未读数量
 * @endpoint GET /api/v1/social/messages/conversations
 * @category messages
 * @tags 消息相关
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.page_size - 每页数量（默认20）
 * @response {ConversationListResponse} 200 - 成功返回对话列表
 * @security BearerAuth
 *
 * @todo 与后端团队确认API路径格式
 * - 当前使用: /api/v1/social/messages/conversations
 * - 是否应该改为: /api/v1/messages/conversations
 * - 确认后更新所有相关API路径
 */
export function getConversations(params?: {
  page?: number
  page_size?: number
}) {
  return request<{
    items: Conversation[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/social/messages/conversations',
    method: 'get',
    params
  })
}

/**
 * 获取对话消息
 * @description 获取指定对话的消息列表，支持分页加载
 * @endpoint GET /api/v1/social/messages/conversations/:conversationId/messages
 * @category messages
 * @tags 消息相关
 * @param {string} conversationId - 对话ID
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.page_size - 每页数量（默认20）
 * @response {MessageListResponse} 200 - 成功返回消息列表
 * @security BearerAuth
 */
export function getMessages(conversationId: string, params?: {
  page?: number
  page_size?: number
}) {
  return request<{
    items: Message[]
    total: number
    page: number
    page_size: number
  }>({
    url: `/api/v1/social/messages/conversations/${conversationId}/messages`,
    method: 'get',
    params
  })
}

/**
 * 发送文本消息
 * @description 向指定对话发送文本消息
 * @endpoint POST /api/v1/social/messages/conversations/:conversationId/messages
 * @category messages
 * @tags 消息相关
 * @param {string} conversationId - 对话ID
 * @param {string} data.content - 文本消息内容
 * @response {Message} 201 - 成功返回发送的消息
 * @security BearerAuth
 */
export function sendTextMessage(conversationId: string, data: {
  content: string
}) {
  return request<Message>({
    url: `/api/v1/social/messages/conversations/${conversationId}/messages`,
    method: 'post',
    data: { ...data, type: 'text' }
  })
}

/**
 * 发送图片消息
 * @description 向指定对话发送图片消息
 * @endpoint POST /api/v1/social/messages/conversations/:conversationId/messages
 * @category messages
 * @tags 消息相关
 * @param {string} conversationId - 对话ID
 * @param {string} data.file_url - 图片URL地址
 * @param {string} data.file_name - 图片文件名（可选）
 * @response {Message} 201 - 成功返回发送的消息
 * @security BearerAuth
 */
export function sendImageMessage(conversationId: string, data: {
  file_url: string
  file_name?: string
}) {
  return request<Message>({
    url: `/api/v1/social/messages/conversations/${conversationId}/messages`,
    method: 'post',
    data: { ...data, type: 'image' }
  })
}

/**
 * 发送文件消息
 * @description 向指定对话发送文件消息
 * @endpoint POST /api/v1/social/messages/conversations/:conversationId/messages
 * @category messages
 * @tags 消息相关
 * @param {string} conversationId - 对话ID
 * @param {string} data.file_url - 文件URL地址
 * @param {string} data.file_name - 文件名
 * @param {number} data.file_size - 文件大小（字节）
 * @response {Message} 201 - 成功返回发送的消息
 * @security BearerAuth
 */
export function sendFileMessage(conversationId: string, data: {
  file_url: string
  file_name: string
  file_size: number
}) {
  return request<Message>({
    url: `/api/v1/social/messages/conversations/${conversationId}/messages`,
    method: 'post',
    data: { ...data, type: 'file' }
  })
}

/**
 * 创建对话
 * @description 与指定用户创建新的对话
 * @endpoint POST /api/v1/social/messages/conversations
 * @category messages
 * @tags 消息相关
 * @param {string} userId - 对方用户ID
 * @response {Conversation} 201 - 成功返回创建的对话信息
 * @security BearerAuth
 */
export function createConversation(userId: string) {
  return request<Conversation>({
    url: '/api/v1/social/messages/conversations',
    method: 'post',
    data: { participant_id: userId }
  })
}

/**
 * 标记消息为已读
 * @description 将指定对话的所有未读消息标记为已读
 * @endpoint POST /api/v1/social/messages/conversations/:conversationId/read
 * @category messages
 * @tags 消息相关
 * @param {string} conversationId - 对话ID
 * @response {MarkReadResponse} 200 - 成功返回操作结果和已读消息数
 * @security BearerAuth
 */
export function markConversationAsRead(conversationId: string) {
  return request<{ success: boolean; read_count: number }>({
    url: `/api/v1/social/messages/conversations/${conversationId}/read`,
    method: 'post'
  })
}

/**
 * 删除对话
 * @description 删除指定的对话及其所有消息
 * @endpoint DELETE /api/v1/social/messages/conversations/:conversationId
 * @category messages
 * @tags 消息相关
 * @param {string} conversationId - 对话ID
 * @response {SuccessResponse} 200 - 成功返回操作结果
 * @security BearerAuth
 */
export function deleteConversation(conversationId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/messages/conversations/${conversationId}`,
    method: 'delete'
  })
}

/**
 * 删除消息
 * @description 删除指定的单条消息
 * @endpoint DELETE /api/v1/social/messages/:messageId
 * @category messages
 * @tags 消息相关
 * @param {string} messageId - 消息ID
 * @response {SuccessResponse} 200 - 成功返回操作结果
 * @security BearerAuth
 */
export function deleteMessage(messageId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/messages/${messageId}`,
    method: 'delete'
  })
}

/**
 * 撤回消息
 * @description 撤回指定的消息（仅限发送后短时间内）
 * @endpoint POST /api/v1/social/messages/:messageId/recall
 * @category messages
 * @tags 消息相关
 * @param {string} messageId - 消息ID
 * @response {SuccessResponse} 200 - 成功返回操作结果
 * @security BearerAuth
 */
export function recallMessage(messageId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/messages/${messageId}/recall`,
    method: 'post'
  })
}

/**
 * 获取对话统计
 * @description 获取当前用户的对话统计数据，包括对话总数和未读消息数
 * @endpoint GET /api/v1/social/messages/stats
 * @category messages
 * @tags 消息相关
 * @response {ConversationStats} 200 - 成功返回对话统计信息
 * @security BearerAuth
 */
export function getConversationStats() {
  return request<ConversationStats>({
    url: '/api/v1/social/messages/stats',
    method: 'get'
  })
}

/**
 * 搜索对话
 * @description 根据关键词搜索对话列表
 * @endpoint GET /api/v1/social/messages/conversations/search
 * @category messages
 * @tags 消息相关
 * @param {string} keyword - 搜索关键词
 * @response {Conversation[]} 200 - 成功返回匹配的对话列表
 * @security BearerAuth
 */
export function searchConversations(keyword: string) {
  return request<Conversation[]>({
    url: '/api/v1/social/messages/conversations/search',
    method: 'get',
    params: { keyword }
  })
}

/**
 * 上传消息文件
 * @description 上传文件用于消息发送，支持图片、文档等格式
 * @endpoint POST /api/v1/social/messages/upload
 * @category messages
 * @tags 消息相关
 * @param {File} file - 要上传的文件对象
 * @response {FileUploadResponse} 201 - 成功返回文件URL和元信息
 * @security BearerAuth
 */
export function uploadMessageFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request<{ file_url: string; file_name: string; file_size: number }>({
    url: '/api/v1/social/messages/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
