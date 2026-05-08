<template>
  <div
    class="book-card bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    @click="handleClick"
  >
    <!-- 封面 -->
    <div class="relative aspect-[3/4] overflow-hidden bg-gray-100">
      <img
        :src="book.coverUrl"
        :alt="book.title"
        class="w-full h-full object-cover transition-transform hover:scale-105"
        loading="lazy"
      />

      <!-- 状态标签 -->
      <div v-if="book.status" class="absolute top-2 right-2">
        <el-tag
          :type="getStatusType(book.status)"
          size="small"
          effect="dark"
        >
          {{ getStatusText(book.status) }}
        </el-tag>
      </div>

      <!-- 付费标签 -->
      <div v-if="book.isPaid" class="absolute top-2 left-2">
        <el-tag type="warning" size="small" effect="dark">
          付费
        </el-tag>
      </div>
    </div>

    <!-- 信息 -->
    <div class="p-3">
      <!-- 书名 -->
      <h3 class="text-sm font-bold text-gray-900 mb-1 line-clamp-1" :title="book.title">
        {{ book.title }}
      </h3>

      <!-- 作者 -->
      <p class="text-xs text-gray-600 mb-2 line-clamp-1">
        {{ book.author }}
      </p>

      <!-- 统计信息 -->
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span class="flex items-center">
          <QyIcon name="View" class="mr-1" :size="16" />
          {{ formatCount(book.viewCount || 0) }}
        </span>
        <span v-if="book.rating">
          <el-rate
            v-model="book.rating"
            disabled
            size="small"
            show-score
            text-color="#ff9900"
            score-template="{value}"
            :max="5"
          />
        </span>
      </div>

      <!-- 分类标签 -->
      <div v-if="book.categoryName" class="mt-2">
        <el-tag size="small" effect="plain">
          {{ book.categoryName }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { QyIcon } from '@/design-system/components'
import type { Book } from '@/types/bookstore'

interface Props {
  book: Book
}

const props = defineProps<Props>()
const router = useRouter()

// 跳转到书籍详情
function handleClick() {
  router.push(`/book/${props.book.id}`)
}

// 获取状态类型
function getStatusType(status: string) {
  const typeMap: Record<string, any> = {
    draft: 'info',
    ongoing: 'success',
    completed: 'info',
    paused: 'warning',
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    draft: '草稿',
    ongoing: '连载中',
    completed: '已完结',
    paused: '已暂停',
  }
  return textMap[status] || status
}

// 格式化数字
function formatCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  return count.toString()
}
</script>

<style scoped>
.book-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

