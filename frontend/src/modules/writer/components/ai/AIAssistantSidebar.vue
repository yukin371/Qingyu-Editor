<template>
  <div class="ai-assistant-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="header-title">
        <el-icon class="magic-icon"><MagicStick /></el-icon>
        <span>AI写作助手</span>
      </div>
      <div class="header-actions">
        <el-button
          text
          @click="toggleCollapse"
          title="收起/展开"
        >
          <el-icon>
            <svg v-if="isCollapsed" viewBox="0 0 1024 1024" width="1em" height="1em"><path fill="currentColor" d="M604.7 759.2l61.8-61.8L481.1 512l185.4-185.4-61.8-61.8-247.2 247.2z"></path></svg>
            <svg v-else viewBox="0 0 1024 1024" width="1em" height="1em"><path fill="currentColor" d="M419.3 264.8l-61.8 61.8L542.9 512 357.5 697.4l61.8 61.8 247.2-247.2z"></path></svg>
          </el-icon>
        </el-button>
        <el-button
          text
          @click="handleClose"
          title="关闭"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 模式切换 -->
    <div v-if="!isCollapsed" class="mode-switcher">
      <el-segmented
        v-model="currentMode"
        :options="modeOptions"
        size="small"
        @change="handleModeChange"
      />
    </div>

    <!-- 内容区域 -->
    <div v-if="!isCollapsed" class="sidebar-content">
      <!-- 对话模式 -->
      <AIChatPanel
        v-show="currentMode === 'chat'"
        :chat-history="writerStore.ai?.chatHistory || []"
        :is-processing="writerStore.ai?.isProcessing || false"
        :error="writerStore.ai?.error || null"
        @send-message="handleSendMessage"
        @clear-history="handleClearHistory"
      />

      <!-- 工具模式 -->
      <AIToolsPanel
        v-show="currentMode === 'tools'"
        :selected-text="writerStore.ai?.selectedText || ''"
        :last-result="writerStore.ai?.lastResult || ''"
        :is-processing="writerStore.ai?.isProcessing || false"
        :error="writerStore.ai?.error || null"
        @generate="handleGenerate"
        @insert="handleInsert"
      />

      <!-- Agent 模式 -->
      <AIAgentPanel
        v-show="currentMode === 'agent'"
        @insert="handleInsert"
      />
    </div>

    <!-- 底部操作栏 -->
    <div v-if="!isCollapsed && writerStore.ai?.lastResult" class="sidebar-footer">
      <el-button
        type="primary"
        @click="handleInsert"
        :disabled="!writerStore.ai?.lastResult"
      >
        <el-icon><DocumentCopy /></el-icon>
        插入到编辑器
      </el-button>
      <el-button
        @click="handleCopy"
        :disabled="!writerStore.ai?.lastResult"
      >
        <el-icon><CopyDocument /></el-icon>
        复制
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Close, DocumentCopy, CopyDocument, MagicStick } from '@element-plus/icons-vue'
import { useWriterStore } from '../../stores/writerStore'
import { message } from '@/design-system/services'
import * as AIChatPanel from './AIChatPanel.vue'
import * as AIToolsPanel from './AIToolsPanel.vue'
import * as AIAgentPanel from './AIAgentPanel.vue'

interface Props {
  projectId?: string
  editor?: any
}

interface Emits {
  close: []
  insert: [text: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const writerStore = useWriterStore()

const isCollapsed = ref(false)
const currentMode = ref<'chat' | 'tools' | 'agent'>('chat')

const modeOptions = [
  { label: '对话', value: 'chat' },
  { label: '工具', value: 'tools' },
  { label: 'Agent', value: 'agent' }
]

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 关闭侧边栏
const handleClose = () => {
  writerStore.toggleAISidebar(false)
  emit('close')
}

// 切换模式
const handleModeChange = (mode: 'chat' | 'tools' | 'agent') => {
  if (mode === 'chat') {
    writerStore.setAITool('chat')
  } else if (mode === 'agent') {
    // agent 模式使用 chat 工具类型（因为 AIToolType 不包含 'agent'）
    writerStore.setAITool('chat')
    // 加载 Agent 上下文
    writerStore.updateAgentContext()
  } else {
    writerStore.setAITool('continue')
  }
}

// 发送聊天消息
const handleSendMessage = async (msg: string) => {
  try {
    await writerStore.sendChatMessage(msg)
  } catch (error: any) {
    const errorMsg = error?.message || (typeof error === 'string' ? error : '发送消息失败')
    message.error(errorMsg)
  }
}

// 清空聊天历史
const handleClearHistory = () => {
  writerStore.clearChatHistory()
  message.success('聊天历史已清空')
}

// 生成内容
const handleGenerate = async (params: any) => {
  try {
    const { tool, text, options } = params

    switch (tool) {
      case 'continue':
        await writerStore.aiContinueWriting(text, options.length || 200)
        break
      case 'polish':
        await writerStore.aiPolishText(text, options.instructions)
        break
      case 'expand':
        await writerStore.aiExpandText(text, options.instructions, options.targetLength)
        break
      case 'rewrite':
        await writerStore.aiRewriteText(text, options.mode, options.instructions)
        break
    }

    message.success('生成成功')
  } catch (error: any) {
    message.error(error.message || '生成失败')
  }
}

// 插入到编辑器
const handleInsert = () => {
  const text = writerStore.ai?.lastResult
  if (!text) {
    message.warning('没有可插入的内容')
    return
  }

  emit('insert', text)
  message.success('已插入到编辑器')
}

// 复制到剪贴板
const handleCopy = async () => {
  const text = writerStore.ai?.lastResult
  if (!text) {
    message.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  } catch {
    message.error('复制失败')
  }
}

// 监听当前工具变化 - 添加防护性检查
watch(() => writerStore.ai?.currentTool, (newTool) => {
  if (!newTool) return
  if (newTool === 'chat') {
    currentMode.value = 'chat'
  } else if (newTool === 'continue' || newTool === 'polish' || newTool === 'expand' || newTool === 'rewrite') {
    // 所有的写作工具都归类到 tools 模式
    currentMode.value = 'tools'
  } else {
    currentMode.value = 'tools'
  }
})
</script>

<style scoped lang="scss">
.ai-assistant-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  border-left: 1px solid #e5e7eb;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, transform 0.3s ease;
  z-index: 1000;

  &.is-collapsed {
    width: 48px;
  }
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;

  .magic-icon {
    font-size: 20px;
  }
}

.header-actions {
  display: flex;
  gap: 4px;

  .el-button {
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.mode-switcher {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: white;

  :deep(.el-segmented) {
    width: 100%;
  }
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  display: flex;
  gap: 8px;

  .el-button {
    flex: 1;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .ai-assistant-sidebar {
    width: 350px;

    &.is-collapsed {
      width: 48px;
    }
  }
}

@media (max-width: 768px) {
  .ai-assistant-sidebar {
    width: 100%;

    &.is-collapsed {
      transform: translateX(100%);
    }
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .ai-assistant-sidebar {
    background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
    border-left-color: #2d2d2d;
  }

  .mode-switcher,
  .sidebar-footer {
    background: #1a1a1a;
    border-color: #2d2d2d;
  }
}
</style>

