<template>
  <div class="author-list">
    <!-- 作者列表 -->
    <div v-if="authors.length > 0" class="author-grid">
      <AuthorCard
        v-for="author in authors"
        :key="author.id"
        :author="author"
        @click="handleAuthorClick"
      />
    </div>

    <!-- 空状态 -->
    <Empty
      v-else-if="!isLoading"
      description="暂无搜索结果"
      iconSize="large"
    />

    <!-- Loading -->
    <div v-if="isLoading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && authors.length > 0" class="load-more">
      <el-button @click="$emit('load-more')" :loading="isLoading">
        加载更多
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import AuthorCard from './AuthorCard.vue'
import { Empty } from '@/design-system/base'
import type { AuthorCard as AuthorCardType } from '../types/search.types'

interface Props {
  authors: AuthorCardType[]
  isLoading: boolean
  hasMore: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'load-more': []
  'authorClick': [author: AuthorCardType]
}>()

const handleAuthorClick = (author: AuthorCardType) => {
  emit('authorClick', author)
}
</script>

<style scoped lang="scss">
.author-list {
  width: 100%;
  min-height: 400px;
}

.author-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

.load-more {
  text-align: center;
  padding: 20px 0;
}
</style>
