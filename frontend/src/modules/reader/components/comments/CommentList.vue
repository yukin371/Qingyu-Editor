<template>
  <div class="comment-list">
    <CommentItem
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      @like="$emit('like', $event)"
      @reply="$emit('reply', $event)"
    />

    <el-skeleton
      v-if="loading"
      :rows="3"
      animated
    />
  </div>
</template>

<script setup lang="ts">
import CommentItem from './CommentItem.vue'
import type { ParagraphComment } from '@/types/reader/index'

interface Props {
  comments: ParagraphComment[]
  loading: boolean
}

defineProps<Props>()

defineEmits<{
  like: [commentId: string]
  reply: [data: { commentId: string; username: string }]
}>()
</script>

<style scoped lang="scss">
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.comment-item) {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

:deep(.el-skeleton) {
  width: 100%;
  margin: 0;
}
</style>
