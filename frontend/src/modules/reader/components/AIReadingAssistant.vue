<template>
  <div class="ai-reading-assistant" :class="{ 'is-visible': visible }">
    <!-- 头部 -->
    <div class="assistant-header">
      <div class="header-title">
        <el-icon :size="20"><MagicStick /></el-icon>
        <span>AI阅读助手</span>
      </div>
      <el-button text :icon="Close" @click="handleClose" />
    </div>

    <!-- 对话区域 -->
    <div class="conversation-area" ref="conversationRef">
      <div v-if="messages.length === 0" class="welcome-message">
        <el-icon :size="48" color="#409eff"><QyIcon name="ChatDotRound"  /></el-icon>
        <p>您好！我是AI阅读助手</p>
        <p class="hint">选择下方的快捷问题，或输入您的问题</p>
      </div>

      <!-- 消息列表 -->
      <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="msg.role">
        <div class="message-avatar">
          <Avatar v-if="msg.role === 'user'" size="md" />
          <Avatar v-else size="md" alt="AI" />
        </div>
        <div class="message-content">
          <div class="message-text" v-safe-html="formatMarkdown(msg.content)"></div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- 流式输出中的消息 -->
      <div v-if="streaming" class="message-item assistant">
        <div class="message-avatar">
          <Avatar size="md" alt="AI" />
        </div>
        <div class="message-content">
          <div class="message-text" v-safe-html="formatMarkdown(streamingContent)"></div>
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预设问题 -->
    <div v-if="!streaming" class="preset-questions">
      <el-button
        v-for="question in presetQuestions"
        :key="question.id"
        size="small"
        @click="askPresetQuestion(question.text)"
      >
        {{ question.text }}
      </el-button>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input
        v-model="userInput"
        type="textarea"
        :rows="3"
        placeholder="输入您的问题..."
        :disabled="streaming"
        @keydown.enter.ctrl="handleSend"
        @keydown.enter.meta="handleSend"
      />
      <div class="input-actions">
        <span class="hint-text">Ctrl+Enter 发送</span>
        <div class="action-buttons">
          <el-button
            v-if="streaming"
            :icon="VideoPause"
            @click="handleCancel"
          >
            停止
          </el-button>
          <el-button
            v-else
            type="primary"
            :icon="Promotion"
            :disabled="!userInput.trim()"
            @click="handleSend"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="AIReadingAssistant">
import { ref, watch, nextTick } from 'vue'
import { MagicStick, Close, Promotion, VideoPause } from '@element-plus/icons-vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { Avatar } from '@/design-system/base'
import { useAIStream } from '../../../composables/useAIStream'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface PresetQuestion {
  id: string
  text: string
}

const props = defineProps<{
  visible: boolean
  chapterContent?: string
  bookTitle?: string
  chapterTitle?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:visible', value: boolean): void
}>()

// 状态
const messages = ref<Message[]>([])
const userInput = ref('')
const conversationRef = ref<HTMLElement | null>(null)

// 预设问题
const presetQuestions: PresetQuestion[] = [
  { id: '1', text: '总结本章内容' },
  { id: '2', text: '分析人物关系' },
  { id: '3', text: '解释难点' },
  { id: '4', text: '预测后续发展' }
]

// AI流式响应
const {
  content: streamingContent,
  streaming,
  send: sendToAI,
  cancel: cancelAI,
  clear: clearAI
} = useAIStream({
  endpoint: '/api/v1/ai/read-assistant',
  typewriterSpeed: 20,
  onComplete: (fullContent) => {
    // 完成后添加到消息列表
    messages.value.push({
      role: 'assistant',
      content: fullContent,
      timestamp: new Date()
    })
    clearAI()
    scrollToBottom()
  },
  onError: (error) => {
    message.error('AI响应失败: ' + error.message)
  }
})

/**
 * 格式化Markdown（简单实现）
 */
const formatMarkdown = (text: string): string => {
  if (!text) return ''
  
  // 简单的markdown格式化
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // 粗体
    .replace(/\*(.+?)\*/g, '<em>$1</em>') // 斜体
    .replace(/`(.+?)`/g, '<code>$1</code>') // 代码
    .replace(/\n/g, '<br>') // 换行
}

/**
 * 格式化时间
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (conversationRef.value) {
      conversationRef.value.scrollTop = conversationRef.value.scrollHeight
    }
  })
}

/**
 * 发送消息
 */
const handleSend = async () => {
  const question = userInput.value.trim()
  if (!question || streaming.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: question,
    timestamp: new Date()
  })

  // 清空输入
  userInput.value = ''
  scrollToBottom()

  // 准备上下文
  const context = {
    question,
    chapterContent: props.chapterContent || '',
    bookTitle: props.bookTitle || '',
    chapterTitle: props.chapterTitle || '',
    conversationHistory: messages.value.slice(-5) // 最近5条消息作为上下文
  }

  // 发送到AI
  try {
    await sendToAI(context)
  } catch (error) {
    console.error('发送失败:', error)
  }
}

/**
 * 取消AI响应
 */
const handleCancel = () => {
  cancelAI()
}

/**
 * 提问预设问题
 */
const askPresetQuestion = (question: string) => {
  userInput.value = question
  handleSend()
}

/**
 * 关闭助手
 */
const handleClose = () => {
  emit('close')
  emit('update:visible', false)
}

// 监听可见性变化，滚动到底部
watch(() => props.visible, (newVal) => {
  if (newVal) {
    scrollToBottom()
  }
})

// 监听消息变化，滚动到底部
watch(messages, () => {
  scrollToBottom()
}, { deep: true })
</script>

<style scoped lang="scss">
.ai-reading-assistant {
  position: fixed;
  right: -400px;
  top: 60px;
  bottom: 0;
  width: 400px;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
  z-index: 1000;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);

  &.is-visible {
    right: 0;
  }
}

.assistant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }

  .el-button {
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.conversation-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f9fafb;

  .welcome-message {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;

    p {
      margin: 16px 0 8px;
      font-size: 16px;

      &.hint {
        font-size: 14px;
        color: #9ca3af;
      }
    }
  }
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  &.user {
    flex-direction: row-reverse;

    .message-content {
      background: #667eea;
      color: #fff;
    }

    .message-time {
      text-align: right;
      color: #6b7280;
    }
  }

  &.assistant {
    .message-content {
      background: #fff;
      color: #1f2937;
    }
  }

  .message-avatar {
    flex-shrink: 0;
  }

  .message-content {
    flex: 1;
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .message-text {
      line-height: 1.6;
      word-break: break-word;

      :deep(p) {
        margin: 0 0 8px 0;

        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(code) {
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
      }

      :deep(pre) {
        background: rgba(0, 0, 0, 0.05);
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
      }
    }

    .message-time {
      margin-top: 8px;
      font-size: 12px;
      color: #9ca3af;
    }
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    margin-top: 8px;

    span {
      width: 6px;
      height: 6px;
      background: #9ca3af;
      border-radius: 50%;
      animation: typing 1.4s infinite;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-8px);
  }
}

.preset-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.input-area {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #fff;

  .el-textarea {
    margin-bottom: 12px;
  }

  .input-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .hint-text {
      font-size: 12px;
      color: #9ca3af;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .ai-reading-assistant {
    right: -100vw;
    width: 100vw;
    top: 0;

    &.is-visible {
      right: 0;
    }
  }
}

// 滚动条样式
.conversation-area::-webkit-scrollbar {
  width: 6px;
}

.conversation-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.conversation-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;

  &:hover {
    background: #a8a8a8;
  }
}
</style>
