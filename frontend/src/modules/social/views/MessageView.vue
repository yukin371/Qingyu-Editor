<template>
  <div class="message-view">
    <!-- WebSocket连接状态 -->
    <div class="connection-status" :class="{ connected: wsConnected }">
      {{ wsConnected ? '已连接' : '未连接' }}
    </div>

    <div class="message-layout">
      <!-- 对话列表 -->
      <div class="conversation-panel">
        <div class="panel-header">
          <h3>消息</h3>
          <el-badge :value="totalUnread" :hidden="totalUnread === 0" class="badge">
            <QyIcon name="ChatDotRound" />
          </el-badge>
        </div>

        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索对话..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <QyIcon name="Search" />
            </template>
          </el-input>
        </div>

        <div v-loading="loadingConversations" class="conversation-list">
          <el-empty
            v-if="!loadingConversations && conversations.length === 0"
            description="暂无对话"
          />

          <div
            v-for="conv in conversations"
            :key="conv.id"
            :class="['conversation-item', { active: selectedConversation?.id === conv.id }]"
            @click="selectConversation(conv)"
          >
            <div class="conv-avatar">
              <img :src="conv.participant_avatar || '/default-avatar.png'" />
              <div v-if="conv.unread_count > 0" class="unread-badge">
                {{ conv.unread_count > 99 ? '99+' : conv.unread_count }}
              </div>
            </div>
            <div class="conv-info">
              <div class="conv-header">
                <span class="conv-name">{{ conv.participant_name }}</span>
                <span class="conv-time">{{ formatTime(conv.last_message_time) }}</span>
              </div>
              <div class="conv-preview">
                <span v-if="conv.last_message_type === 'image'" class="message-type-icon">
                  <QyIcon name="Picture" />
                </span>
                <span v-else-if="conv.last_message_type === 'file'" class="message-type-icon">
                  <QyIcon name="Document" />
                </span>
                <span class="message-text">{{ conv.last_message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 聊天区域 -->
      <div class="chat-panel">
        <div v-if="!selectedConversation" class="empty-state">
          <el-icon size="80"><QyIcon name="ChatDotRound" /></el-icon>
          <p>选择一个对话开始聊天</p>
          <el-button type="primary" @click="showNewChatDialog = true">
            <QyIcon name="Plus" />
            新建对话
          </el-button>
        </div>

        <div v-else class="chat-container">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="chat-user">
              <img :src="selectedConversation.participant_avatar || '/default-avatar.png'" />
              <span>{{ selectedConversation.participant_name }}</span>
            </div>
            <div class="chat-actions">
              <el-button text @click="markAsRead">
                <QyIcon name="Check" />
                标为已读
              </el-button>
              <el-button text type="danger" @click="confirmDeleteConversation">
                <QyIcon name="Delete" />
                删除对话
              </el-button>
            </div>
          </div>

          <!-- 消息列表 -->
          <div ref="messagesContainer" class="messages-container" @scroll="handleScroll">
            <div v-loading="loadingMessages" class="messages-list">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="['message-item', msg.sender_id === currentUserId ? 'sent' : 'received']"
              >
                <img
                  :src="
                    msg.sender_id === currentUserId
                      ? currentUserAvatar
                      : selectedConversation.participant_avatar
                  "
                  class="message-avatar"
                />
                <div class="message-content">
                  <!-- 文本消息 -->
                  <div v-if="msg.type === 'text'" class="message-bubble">
                    {{ msg.content }}
                  </div>
                  <!-- 图片消息 -->
                  <div v-else-if="msg.type === 'image'" class="message-image">
                    <el-image
                      :src="msg.file_url"
                      fit="cover"
                      :preview-src-list="[msg.file_url || '']"
                      preview-teleported
                    />
                  </div>
                  <!-- 文件消息 -->
                  <div v-else-if="msg.type === 'file'" class="message-file">
                    <QyIcon name="Document" />
                    <div class="file-info">
                      <div class="file-name">{{ msg.file_name }}</div>
                      <div class="file-size">{{ formatFileSize(msg.file_size) }}</div>
                    </div>
                    <el-button size="small" link>下载</el-button>
                  </div>
                  <div class="message-time">
                    {{ formatMessageTime(msg.created_at) }}
                    <span v-if="msg.status === 'failed'" class="error-icon">
                      <QyIcon name="Warning" />
                    </span>
                  </div>
                </div>
                <el-dropdown
                  trigger="click"
                  @command="(cmd: string) => handleMessageAction(cmd, msg)"
                >
                  <el-icon class="more-btn"><QyIcon name="MoreFilled" /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="copy">复制</el-dropdown-item>
                      <el-dropdown-item command="recall" v-if="canRecall(msg)"
                        >撤回</el-dropdown-item
                      >
                      <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>

          <!-- 输入框 -->
          <div class="input-area">
            <div class="input-toolbar">
              <el-upload
                :show-file-list="false"
                :before-upload="handleImageUpload"
                accept="image/*"
              >
                <el-button text>
                  <QyIcon name="Picture" />
                </el-button>
              </el-upload>
              <el-upload :show-file-list="false" :before-upload="handleFileUpload">
                <el-button text>
                  <QyIcon name="Folder" />
                </el-button>
              </el-upload>
            </div>
            <div class="input-box">
              <el-input
                v-model="messageInput"
                type="textarea"
                :rows="2"
                placeholder="输入消息..."
                @keydown.enter.exact="sendMessage"
                @keydown.enter.shift.prevent
                :disabled="sending"
              />
              <el-button
                type="primary"
                @click="sendMessage"
                :loading="sending"
                :disabled="!messageInput.trim()"
              >
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建对话对话框 -->
    <el-dialog v-model="showNewChatDialog" title="新建对话" width="400px">
      <el-input v-model="newChatUserId" placeholder="输入用户ID" clearable />
      <template #footer>
        <el-button @click="showNewChatDialog = false">取消</el-button>
        <el-button type="primary" @click="createNewConversation" :loading="creating">
          开始聊天
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch as vueWatch } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import {
  getConversations,
  getConversationMessages,
  sendMessage as sendMessageAPI,
  createConversation,
  markConversationAsRead,
  deleteMessage,
  getConversationStats,
  deleteConversation,
  uploadMessageFile,
  recallMessage,
  sendImageMessage,
  sendFileMessage,
  type Conversation,
  type Message,
} from '@/modules/social/api'
import { useWebSocketStore } from '@/stores/websocket.store'
import { pollingService } from '@/services/polling'
// 简单的消息验证函数
const validateMessage = (content: string) => {
  if (!content || !content.trim()) {
    return { valid: false, error: '消息内容不能为空', sanitized: '' }
  }
  return { valid: true, error: null, sanitized: content.trim() }
}

const currentUserId = ref('') // 从用户状态获取
const currentUserAvatar = ref('')

// 对话列表
const loadingConversations = ref(false)
const conversations = ref<Conversation[]>([])
const selectedConversation = ref<Conversation | null>(null)
const searchKeyword = ref('')
const totalUnread = ref(0)

// 消息列表
const loadingMessages = ref(false)
const messages = ref<Message[]>([])
const messagesContainer = ref<HTMLElement>()
const messageInput = ref('')
const sending = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(50)
const hasMore = ref(true)

// 新建对话
const showNewChatDialog = ref(false)
const newChatUserId = ref('')
const creating = ref(false)

// 加载对话列表
const loadConversations = async () => {
  loadingConversations.value = true
  try {
    const res = (await getConversations({
      page: 1,
      size: 50,
    })) as any
    conversations.value = res.items || []
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loadingConversations.value = false
  }
}

// 加载未读统计
const loadStats = async () => {
  try {
    const stats = await getConversationStats()
    totalUnread.value = stats.total_unread
  } catch (error: any) {
    message.error(error.message || '加载统计失败')
  }
}

// 选择对话
const selectConversation = async (conv: Conversation) => {
  selectedConversation.value = conv
  loadMessages()
}

// 加载消息列表
const loadMessages = async (loadMore = false) => {
  if (!selectedConversation.value) return

  loadingMessages.value = true
  try {
    const res = (await getConversationMessages(selectedConversation.value.id, {
      page: loadMore ? currentPage.value + 1 : 1,
      size: pageSize.value,
    })) as any

    if (loadMore) {
      messages.value = [...(res.items || []), ...messages.value]
      currentPage.value++
    } else {
      messages.value = res.items || []
      currentPage.value = 1
    }

    hasMore.value = (res.items || []).length === pageSize.value

    // 滚动到底部
    await nextTick()
    if (!loadMore) {
      scrollToBottom()
    }
  } catch (error: any) {
    message.error(error.message || '加载消息失败')
  } finally {
    loadingMessages.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  if (!selectedConversation.value) return

  // 使用验证工具验证消息
  const result = validateMessage(messageInput.value)
  if (!result.valid) {
    message.warning(result.error || '消息内容无效')
    return
  }

  sending.value = true
  try {
    const msg = (await sendMessageAPI({
      receiver_id: selectedConversation.value.participant_id,
      content: result.sanitized!,
      message_type: 'text',
    })) as any
    messages.value.push(msg)
    messageInput.value = ''
    scrollToBottom()

    // 更新对话列表中的最后一条消息
    const conv = conversations.value.find((c) => c.id === selectedConversation.value?.id)
    if (conv) {
      conv.last_message = msg.content
      conv.last_message_time = msg.created_at
      conv.last_message_type = msg.type
    }
  } catch (error: any) {
    message.error(error.message || '发送失败')
  } finally {
    sending.value = false
  }
}

// 上传图片
const handleImageUpload = async (file: File) => {
  if (!selectedConversation.value) return false

  try {
    // 先上传文件
    const uploadRes = await uploadMessageFile(file)
    // 再发送图片消息
    await sendImageMessage(selectedConversation.value.id, {
      file_url: uploadRes.file_url,
      file_name: uploadRes.file_name,
    })
    loadMessages() // 刷新消息列表
    message.success('图片发送成功')
  } catch (error: any) {
    message.error(error.message || '上传失败')
  }
  return false
}

// 上传文件
const handleFileUpload = async (file: File) => {
  if (!selectedConversation.value) return false

  try {
    // 先上传文件
    const uploadRes = await uploadMessageFile(file)
    // 再发送文件消息
    await sendFileMessage(selectedConversation.value.id, {
      file_url: uploadRes.file_url,
      file_name: uploadRes.file_name,
      file_size: uploadRes.file_size,
    })
    loadMessages() // 刷新消息列表
    message.success('文件发送成功')
  } catch (error: any) {
    message.error(error.message || '上传失败')
  }
  return false
}

// 标记已读
const markAsRead = async () => {
  if (!selectedConversation.value) return

  try {
    await markConversationAsRead(selectedConversation.value.id, {})
    const conv = conversations.value.find((c) => c.id === selectedConversation.value?.id)
    if (conv) {
      conv.unread_count = 0
    }
    loadStats()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 删除对话
const confirmDeleteConversation = () => {
  messageBox
    .confirm('确定要删除此对话吗？', '确认删除', {
      type: 'warning',
    })
    .then(async () => {
      if (!selectedConversation.value) return

      try {
        await deleteConversation(selectedConversation.value.id)
        conversations.value = conversations.value.filter(
          (c) => c.id !== selectedConversation.value?.id,
        )
        selectedConversation.value = null
        messages.value = []
        loadStats() // 更新未读统计
        message.success('删除成功')
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    })
}

// 消息操作
const handleMessageAction = async (command: string, msg: Message) => {
  switch (command) {
    case 'copy':
      navigator.clipboard.writeText(msg.content)
      message.success('已复制')
      break
    case 'recall':
      if (canRecall(msg)) {
        try {
          await recallMessage(msg.id)
          messages.value = messages.value.filter((m) => m.id !== msg.id)
          message.success('已撤回')
        } catch (error: any) {
          message.error(error.message || '撤回失败')
        }
      } else {
        message.warning('超过2分钟，无法撤回')
      }
      break
    case 'delete':
      try {
        await deleteMessage(msg.id)
        messages.value = messages.value.filter((m) => m.id !== msg.id)
        message.success('删除成功')
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
      break
  }
}

// 判断是否可以撤回
const canRecall = (msg: Message) => {
  const timeDiff = Date.now() - new Date(msg.created_at).getTime()
  return timeDiff < 2 * 60 * 1000 // 2分钟内
}

// 新建对话
const createNewConversation = async () => {
  if (!newChatUserId.value) {
    message.warning('请输入用户ID')
    return
  }

  creating.value = true
  try {
    const conv = await createConversation({ participantId: newChatUserId.value })
    conversations.value.unshift(conv as any)
    selectedConversation.value = conv as any
    showNewChatDialog.value = false
    newChatUserId.value = ''
    loadMessages()
  } catch (error: any) {
    message.error(error.message || '创建失败')
  } finally {
    creating.value = false
  }
}

// 搜索对话
const handleSearch = async () => {
  if (!searchKeyword.value) {
    loadConversations()
    return
  }

  try {
    // TODO: 实现搜索对话功能
    message.info('搜索功能暂未实现')
  } catch (error: any) {
    message.error(error.message || '搜索失败')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 滚动加载更多
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.scrollTop === 0 && hasMore.value && !loadingMessages.value) {
    loadMessages(true)
  }
}

// 时间格式化
const formatTime = (time: string | undefined) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const oneDay = 24 * 60 * 60 * 1000

  if (diff < oneDay && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < oneDay * 2) {
    return '昨天'
  } else if (diff < oneDay * 7) {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return `周${days[date.getDay()]}`
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}

const formatMessageTime = (time: string) => {
  return new Date(time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

// WebSocket Store
const websocketStore = useWebSocketStore()

// WebSocket连接状态
const wsConnected = computed(() => websocketStore.isConnected)

// 处理WebSocket接收的新消息
const handleNewMessage = (msg: any) => {
  console.log('[MessageView] 收到新消息:', msg)

  // 检查消息是否属于当前对话
  if (msg.conversationId === selectedConversation.value?.id) {
    // 添加到消息列表
    messages.value.push(msg)
    scrollToBottom()
  } else {
    // 更新对话列表的最后消息
    const conversation = conversations.value.find((c) => c.id === msg.conversationId)
    if (conversation) {
      conversation.last_message = msg.content
      conversation.unread_count = (conversation.unread_count || 0) + 1
      totalUnread.value++
    }
  }
}

onMounted(() => {
  loadConversations()
  loadStats()

  // 连接WebSocket
  const token = localStorage.getItem('token') || ''
  if (token) {
    websocketStore.connect(token)
  }

  // 监听新消息
  websocketStore.onMessage(handleNewMessage)

  // 监听WebSocket降级状态变化，启动轮询降级
  vueWatch(
    () => websocketStore.fallbackActive,
    (isActive) => {
      if (isActive) {
        console.log('[MessageView] WebSocket连接失败，启动轮询降级')
        pollingService.start(() => {
          // 重新加载当前对话的消息
          if (selectedConversation.value) {
            loadMessages()
          }
          // 重新加载对话列表
          loadConversations()
          // 重新加载未读统计
          loadStats()
        }, 5000)
      } else {
        console.log('[MessageView] WebSocket连接恢复，停止轮询降级')
        pollingService.stop()
      }
    },
  )
})

onUnmounted(() => {
  // 断开WebSocket
  websocketStore.disconnect()

  // 停止轮询
  pollingService.stop()

  // 移除消息监听
  websocketStore.offMessage(handleNewMessage)
})
</script>

<style scoped lang="scss">
.message-view {
  height: calc(100vh - 100px);
  padding: 20px;
  position: relative;
}

.connection-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  font-size: 12px;
  background: #f56c6c;
  color: white;
  border-radius: 4px;
  z-index: 100;
  transition: background 0.3s;

  &.connected {
    background: #67c23a;
  }
}

.message-layout {
  display: flex;
  height: 100%;
  gap: 16px;
}

.conversation-panel {
  width: 320px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);

  h3 {
    margin: 0;
    font-size: 18px;
  }
}

.search-box {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.active {
    background: var(--el-color-primary-light-9);
  }
}

.conv-avatar {
  position: relative;
  flex-shrink: 0;

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }

  .unread-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    background: var(--el-color-danger);
    color: white;
    font-size: 12px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.conv-name {
  font-weight: 500;
  font-size: 14px;
}

.conv-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.conv-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.message-type-icon {
  color: var(--el-color-primary);
}

.message-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-panel {
  flex: 1;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--el-text-color-secondary);
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.chat-user {
  display: flex;
  align-items: center;
  gap: 8px;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  gap: 8px;
  max-width: 70%;
  position: relative;

  &.sent {
    align-self: flex-end;
    flex-direction: row-reverse;

    .message-content {
      background: var(--el-color-primary);
      color: white;

      .message-time {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  &.received {
    align-self: flex-start;
  }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-content {
  background: var(--el-fill-color-light);
  padding: 8px 12px;
  border-radius: 8px;
  position: relative;
}

.message-bubble {
  word-break: break-word;
}

.message-image {
  :deep(.el-image) {
    max-width: 200px;
    max-height: 200px;
    border-radius: 4px;
  }
}

.message-file {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--el-fill-color);
  padding: 8px;
  border-radius: 4px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
}

.file-size {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.message-time {
  margin-top: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-icon {
  color: var(--el-color-danger);
}

.more-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.message-item:hover .more-btn {
  opacity: 1;
}

.input-area {
  border-top: 1px solid var(--el-border-color);
  padding: 12px;
}

.input-toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.input-box {
  display: flex;
  gap: 12px;

  :deep(.el-textarea) {
    flex: 1;
  }
}
</style>
