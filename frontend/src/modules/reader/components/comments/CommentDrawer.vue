<template>
  <QyDrawer
    v-model="visible"
    direction="rtl"
    size="400px"
    :z-index="3200"
    :modal-z-index="3190"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <template #header>
      <CommentDrawerHeader
        :paragraph-index="paragraphIndex"
        :comment-count="commentCount"
      />
    </template>

    <div class="comment-drawer-content">
      <!-- 评论列表 -->
      <CommentList
        :comments="comments"
        :loading="loading"
        @like="handleLike"
        @reply="handleReply"
      />

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && comments.length === 0"
        description="还没有评论，快来抢沙发吧~"
      />
    </div>

    <template #footer>
      <CommentInput
        @submit="handleSubmit"
        @cancel-reply="clearReply"
        :disabled="loading"
        :reply-to-username="replyTo?.username || ''"
      />
    </template>
  </QyDrawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { QyDrawer } from '@/design-system/components'
import CommentDrawerHeader from './CommentDrawerHeader.vue'
import CommentList from './CommentList.vue'
import CommentInput from './CommentInput.vue'
import type { ParagraphComment } from '@/types/reader/index'

interface Props {
  modelValue: boolean
  paragraphIndex: number
  comments: ParagraphComment[]
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'like': [commentId: string]
  'submit': [data: { content: string; emoji?: string; replyToCommentId?: string; replyToUsername?: string }]
}>()
const replyTo = ref<{ commentId: string; username: string } | null>(null)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const commentCount = computed(() => props.comments.length)

const handleClose = () => {
  clearReply()
  visible.value = false
}

const handleLike = (commentId: string) => {
  emit('like', commentId)
}

const handleReply = (data: { commentId: string; username: string }) => {
  replyTo.value = data
}

const clearReply = () => {
  replyTo.value = null
}

const handleSubmit = (data: { content: string; emoji?: string }) => {
  emit('submit', {
    ...data,
    replyToCommentId: replyTo.value?.commentId,
    replyToUsername: replyTo.value?.username
  })
  clearReply()
}
</script>

<style scoped lang="scss">
.comment-drawer-content {
  height: 100%;
  overflow-y: auto;
  padding: 4px 20px 10px;
  background: #ffffff;
}
</style>
