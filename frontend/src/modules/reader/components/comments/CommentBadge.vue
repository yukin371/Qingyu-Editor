<template>
  <div
    v-if="commentCount > 0"
    class="comment-badge"
    @click.stop="handleClick"
  >
    <el-icon><ChatDotRound /></el-icon>
    <span class="count">{{ commentCount }}</span>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound } from '@element-plus/icons-vue'

interface Props {
  commentCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped lang="scss">
.comment-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  margin-left: 8px;
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color, #d1d5db);
  border-radius: 12px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    background: var(--el-color-primary-light-9, #e0ecff);
  }
}

.count {
  font-weight: 500;
}
</style>
