<template>
  <div class="ai-chat-panel">
    <!-- 聊天消息列表 -->
    <div ref="messagesContainer" class="messages-container">
      <div v-if="chatHistory.length === 0" class="empty-state">
        <el-icon class="empty-icon"><QyIcon name="ChatLineSquare"  /></el-icon>
        <p>开始与AI对话</p>
        <p class="hint">你可以询问写作建议、情节构思、角色设定等</p>
      </div>

      <div
        v-for="message in chatHistory"
        :key="message.id"
        class="message-item"
        :class="[`message-${message.role}`]"
      >
        <div class="message-avatar">
          <el-icon v-if="message.role === 'user'"><QyIcon name="User"  /></el-icon>
          <el-icon v-else><MagicStick /></el-icon>
        </div>

        <div class="message-content">
          <div class="message-meta">
            <span class="message-role">{{ getRoleName(message.role) }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>

          <div class="message-text" v-safe-html="renderMarkdown(message.content)"></div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isProcessing" class="message-item message-assistant">
        <div class="message-avatar">
          <QyIcon name="MagicStick"  />
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <el-alert :title="error" type="error" :closable="false" show-icon />
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-actions">
        <el-button
          text
          :icon="Delete"
          @click="handleClearHistory"
          :disabled="chatHistory.length === 0"
          title="清空历史"
        />
      </div>

      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="输入你的问题..."
        :maxlength="1000"
        show-word-limit
        @keydown.enter.ctrl="handleSend"
        @keydown.enter.meta="handleSend"
      />

      <el-button
        type="primary"
        :icon="Promotion"
        :loading="isProcessing"
        :disabled="!inputMessage.trim()"
        @click="handleSend"
        class="send-button"
      >
        发送 (Ctrl+Enter)
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { marked } from 'marked'
import { Delete, Promotion } from '@element-plus/icons-vue'
import { QyIcon } from '@/design-system/components'
import type { ChatMessage } from '../../../../types/ai'
import { sanitizeMarkdownHtml } from '@/utils/sanitize'

interface Props {
  chatHistory: ChatMessage[]
  isProcessing: boolean
  error: string | null
}

interface Emits {
  (e: 'send-message', message: string): void
  (e: 'clear-history'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const messagesContainer = ref<HTMLElement>()
const inputMessage = ref('')

// 获取角色名称
const getRoleName = (role: string): string => {
  const roleNames: Record<string, string> = {
    user: '你',
    assistant: 'AI助手',
    system: '系统'
  }
  return roleNames[role] || role
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 渲染Markdown
const renderMarkdown = (content: string): string => {
  try {
    const html = marked(content, { breaks: true, gfm: true }) as string
    // 使用DOMPurify清理Markdown生成的HTML，防止XSS攻击
    return sanitizeMarkdownHtml(html)
  } catch (error) {
    return content
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 发送消息
const handleSend = (e?: KeyboardEvent) => {
  if (e) {
    e.preventDefault()
  }

  const message = inputMessage.value.trim()
  if (!message || props.isProcessing) return

  emit('send-message', message)
  inputMessage.value = ''
  scrollToBottom()
}

// 清空历史
const handleClearHistory = () => {
  emit('clear-history')
}

// 监听聊天历史变化，自动滚动到底部
watch(() => props.chatHistory.length, () => {
  scrollToBottom()
})

// 监听处理状态变化
watch(() => props.isProcessing, () => {
  scrollToBottom()
})
</script>

<style scoped lang="scss">
.ai-chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--editor-text-muted);
  text-align: center;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    color: var(--editor-text-ghost);
  }

  p {
    margin: 8px 0;
    font-size: 14px;
  }

  .hint {
    font-size: 12px;
    color: var(--editor-text-ghost);
  }
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease;

  &.message-user {
    .message-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }

  &.message-assistant {
    .message-avatar {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  .el-icon {
    font-size: 20px;
  }
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #6b7280;
}

.message-role {
  font-weight: 500;
}

.message-time {
  color: #9ca3af;
}

.message-text {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  word-wrap: break-word;
  line-height: 1.6;
  font-size: 14px;

  :deep(p) {
    margin: 0 0 8px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(code) {
    background: #e5e7eb;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }

  :deep(pre) {
    background: #1f2937;
    color: #f3f4f6;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;

    code {
      background: none;
      padding: 0;
      color: inherit;
    }
  }
}

.message-user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

.error-message {
  margin: 16px 0;
}

.input-area {
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  background: white;
}

.input-actions {
  margin-bottom: 8px;
  display: flex;
  justify-content: flex-end;
}

.send-button {
  margin-top: 8px;
  width: 100%;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .ai-chat-panel {
    background: #0d0d0d;
  }

  .messages-container,
  .input-area {
    background: #0d0d0d;
  }

  .message-text {
    background: #1a1a1a;
    color: #e5e7eb;
  }

  .message-user .message-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .input-area {
    border-top-color: #2d2d2d;
  }
}
</style>

