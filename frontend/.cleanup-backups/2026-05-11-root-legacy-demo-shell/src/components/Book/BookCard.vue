<template>
  <div
    class="book-card cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
    @click="handleClick"
  >
    <div class="relative aspect-[3/4] overflow-hidden bg-gray-100">
      <img
        :src="book.coverUrl"
        :alt="book.title"
        class="h-full w-full object-cover transition-transform hover:scale-105"
        loading="lazy"
      />

      <div v-if="book.status" class="absolute right-2 top-2">
        <QyTag :type="getStatusType(book.status)" size="sm" effect="dark">
          {{ getStatusText(book.status) }}
        </QyTag>
      </div>

      <div v-if="book.isPaid" class="absolute left-2 top-2">
        <QyTag type="warning" size="sm" effect="dark">
          付费
        </QyTag>
      </div>
    </div>

    <div class="p-3">
      <h3 class="mb-1 line-clamp-1 text-sm font-bold text-gray-900" :title="book.title">
        {{ book.title }}
      </h3>

      <p class="mb-2 line-clamp-1 text-xs text-gray-600">
        {{ book.author }}
      </p>

      <div class="flex items-center justify-between gap-2 text-xs text-gray-500">
        <span class="flex items-center">
          <QyIcon name="View" class="mr-1" :size="16" />
          {{ formatCount(book.viewCount || 0) }}
        </span>
        <span v-if="book.rating" class="inline-flex items-center gap-1">
          <QyRate
            :model-value="book.rating"
            disabled
            size="sm"
            :max="5"
          />
          <span class="font-medium text-amber-500">{{ book.rating.toFixed(1) }}</span>
        </span>
      </div>

      <div v-if="book.categoryName" class="mt-2">
        <QyTag size="sm" effect="plain" type="info">
          {{ book.categoryName }}
        </QyTag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { QyIcon, QyRate, QyTag } from '@/design-system/components'
import type { Book } from '@/types/bookstore'

interface Props {
  book: Book
}

const props = defineProps<Props>()
const router = useRouter()

function handleClick() {
  router.push(`/book/${props.book.id}`)
}

function getStatusType(status: string) {
  const typeMap: Record<string, 'info' | 'success' | 'warning'> = {
    draft: 'info',
    ongoing: 'success',
    completed: 'info',
    paused: 'warning',
  }
  return typeMap[status] || 'info'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    draft: '草稿',
    ongoing: '连载中',
    completed: '已完结',
    paused: '已暂停',
  }
  return textMap[status] || status
}

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
