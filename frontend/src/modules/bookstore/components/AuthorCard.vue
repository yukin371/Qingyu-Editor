<template>
  <div class="author-card" @click="handleClick">
    <div class="author-avatar">
      <img :src="author.avatar" :alt="author.name" />
    </div>
    <div class="author-info">
      <h3 class="author-name">{{ author.name }}</h3>
      <p class="author-bio">{{ author.bio }}</p>
      <div class="author-stats">
        <span class="stat-item">
          <el-icon><Document /></el-icon>
          {{ author.book_count }} 作品
        </span>
        <span class="stat-item">
          <el-icon><ChatLineSquare /></el-icon>
          {{ formatNumber(author.total_words) }} 字
        </span>
        <span class="stat-item">
          <el-icon><User /></el-icon>
          {{ formatNumber(author.follower_count) }} 粉丝
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, ChatLineSquare, User } from '@element-plus/icons-vue'
import type { AuthorCard as AuthorCardType } from '../types/search.types'

interface Props {
  author: AuthorCardType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [author: AuthorCardType]
}>()

const handleClick = () => {
  emit('click', props.author)
}

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toString()
}
</script>

<style scoped lang="scss">
.author-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.author-avatar {
  flex-shrink: 0;
  width: 80px;
  height: 80px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.author-info {
  flex: 1;
  min-width: 0;
}

.author-name {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.author-bio {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);

  .el-icon {
    font-size: 14px;
  }
}
</style>
