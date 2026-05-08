<template>
  <div class="comment-input">
    <!-- 表情选择器 -->
    <EmojiPicker
      v-if="showEmojiPicker"
      @select="handleSelectEmoji"
      @close="showEmojiPicker = false"
    />

    <div class="input-wrapper">
      <div v-if="props.replyToUsername" class="reply-banner">
        <span>回复 @{{ props.replyToUsername }}</span>
        <el-button text size="small" @click="$emit('cancelReply')">取消</el-button>
      </div>

      <el-input
        v-model="content"
        type="textarea"
        :rows="3"
        :disabled="props.disabled"
        placeholder="写下你的想法..."
        :maxlength="500"
        show-word-limit
        @keydown="handleKeydown"
      />

      <div class="input-actions">
        <el-button
          text
          :icon="ChatDotRound"
          :disabled="props.disabled"
          @click="showEmojiPicker = true"
        >
          表情
        </el-button>

        <el-button
          type="primary"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import EmojiPicker from './EmojiPicker.vue'

defineOptions({ inheritAttrs: false })

interface Props {
  disabled?: boolean
  replyToUsername?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  replyToUsername: ''
})

const content = ref('')
const showEmojiPicker = ref(false)

const canSubmit = computed(() => {
  return !props.disabled && content.value.trim().length > 0
})

const emit = defineEmits<{
  submit: [data: { content: string; emoji?: string }]
  cancelReply: []
}>()

watch(
  () => props.replyToUsername,
  (username) => {
    if (!username) return
    const prefix = `@${username} `
    if (!content.value.startsWith(prefix)) {
      content.value = `${prefix}${content.value.trimStart()}`
    }
  }
)

const handleSelectEmoji = (emoji: string) => {
  if (props.disabled) return
  content.value = emoji
  showEmojiPicker.value = false
  emit('submit', { content: '', emoji })
  content.value = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return
  if (e.ctrlKey && e.key === 'Enter') {
    handleSubmit()
  }
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', { content: content.value })
  content.value = ''
}
</script>

<style scoped lang="scss">
.comment-input {
  position: relative;
  width: 100%;
  min-width: 0;
  padding: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-top: 1px solid var(--el-border-color, #e5e7eb);
  box-sizing: border-box;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
  margin: 0;
}

.reply-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  border-radius: 8px;
  font-size: 12px;
  color: #1d4ed8;
}

:deep(.el-textarea__inner) {
  width: 100% !important;
  border-radius: 10px;
  border-color: #cbd5e1;
  min-height: 86px;
  box-sizing: border-box;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
}

:deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
}

:deep(.el-input),
:deep(.el-textarea),
:deep(.el-textarea .el-textarea__inner) {
  width: 100% !important;
  max-width: 100% !important;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
