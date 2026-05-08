<template>
  <div class="comment-header">
    <h3 class="title">段落评论</h3>
    <div class="meta">
      <span class="paragraph-info">第 {{ paragraphIndex }} 段</span>
      <el-divider direction="vertical" />
      <span class="comment-count">{{ commentCount }} 条评论</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  paragraphIndex: number
  commentCount: number
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.comment-header {
  .title {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .meta {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: var(--el-text-color-secondary, #6b7280);
  }
}
</style>
