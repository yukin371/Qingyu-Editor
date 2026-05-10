<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div v-if="items.length > 0" class="space-y-4">
      <div
        v-for="(item, index) in items"
        :key="item.book.id"
        class="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        @click="handleBookClick(item.book.id)"
      >
        <!-- 排名 -->
        <div class="flex-shrink-0 w-8 text-center">
          <span
            v-if="index < 3"
            class="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white"
            :class="{
              'bg-yellow-500': index === 0,
              'bg-gray-400': index === 1,
              'bg-orange-600': index === 2,
            }"
          >
            {{ index + 1 }}
          </span>
          <span v-else class="text-lg font-semibold text-gray-600">
            {{ index + 1 }}
          </span>
        </div>

        <!-- 书籍封面 -->
        <div class="flex-shrink-0 w-12 h-16 overflow-hidden rounded">
          <img
            :src="item.book.coverUrl"
            :alt="item.book.title"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <!-- 书籍信息 -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-bold text-gray-900 truncate mb-1">
            {{ item.book.title }}
          </h3>
          <p class="text-xs text-gray-600 truncate">{{ item.book.author }}</p>
        </div>

        <!-- 统计信息 -->
        <div class="flex-shrink-0 text-right">
          <div class="text-sm font-semibold text-primary-600">
            {{ formatScore(item.score) }}
          </div>
          <div v-if="item.change !== undefined" class="text-xs mt-1">
            <span
              v-if="item.change > 0"
              class="text-green-600 flex items-center justify-end"
            >
              <QyIcon name="CaretTop" :size="16" />
              {{ item.change }}
            </span>
            <span
              v-else-if="item.change < 0"
              class="text-red-600 flex items-center justify-end"
            >
              <QyIcon name="CaretBottom" :size="16" />
              {{ Math.abs(item.change) }}
            </span>
            <span v-else class="text-gray-500">-</span>
          </div>
        </div>
      </div>
    </div>

    <QyEmpty v-else type="ranking" description="暂无排行数据" icon-size="large" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { QyIcon } from '@/design-system/components'
import QyEmpty from '@/design-system/components/advanced/QyEmpty/QyEmpty.vue'
import type { RankingItem } from '@/types/bookstore'

interface Props {
  items: RankingItem[]
}

defineProps<Props>()

const router = useRouter()

function handleBookClick(bookId: string) {
  router.push(`/book/${bookId}`)
}

function formatScore(score: number): string {
  if (score >= 10000) {
    return `${(score / 10000).toFixed(1)}万`
  }
  return score.toFixed(0)
}
</script>














