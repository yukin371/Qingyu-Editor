<template>
  <div
    class="booklist-card"
    :class="{ 'is-hoverable': hoverable }"
    @click="handleClick"
  >
    <!-- 封面区域 -->
    <div class="booklist-cover">
      <img
        v-if="booklist.cover"
        :src="booklist.cover"
        :alt="booklist.title"
        class="cover-image"
      />
      <div v-else class="cover-placeholder">
        <QyIcon name="Collection" :size="48" />
      </div>
      <!-- 书籍数量徽章 -->
      <div class="book-count-badge">
        <QyIcon name="Document" :size="12" />
        <span>{{ booklist.bookCount }}本</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="booklist-content">
      <h3 class="booklist-title">{{ booklist.title }}</h3>
      <p class="booklist-description">{{ truncatedDescription }}</p>

      <!-- 创建者信息 -->
      <div class="creator-info">
        <Avatar
          :src="booklist.creator?.avatar"
          :alt="booklist.creator?.nickname"
          size="sm"
        />
        <span class="creator-name">{{ booklist.creator?.nickname }}</span>
      </div>

      <!-- 标签 -->
      <div v-if="booklist.tags?.length" class="booklist-tags">
        <Badge
          v-for="tag in displayedTags"
          :key="tag"
          variant="secondary"
          size="sm"
        >
          {{ tag }}
        </Badge>
        <span v-if="hasMoreTags" class="more-tags">+{{ booklist.tags.length - 3 }}</span>
      </div>

      <!-- 统计信息 -->
      <div class="booklist-stats">
        <div class="stat-item">
          <QyIcon name="View" :size="14" />
          <span>{{ formatNumber(booklist.viewCount) }}</span>
        </div>
        <div class="stat-item">
          <QyIcon name="Star" :size="14" />
          <span>{{ formatNumber(booklist.likeCount) }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showActions" class="booklist-actions">
      <QyButton
        variant="ghost"
        size="sm"
        :class="booklist.isLiked ? 'is-active' : ''"
        @click.stop="handleFavorite"
      >
        <QyIcon :name="booklist.isLiked ? 'StarFilled' : 'Star'" :size="16" />
      </QyButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyButton, QyIcon } from '@/design-system/components'
import { Avatar, Badge } from '@/design-system/base'
import type { BookList } from '@/types/booklist'

interface Props {
  booklist: BookList
  hoverable?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: true,
  showActions: true
})

const emit = defineEmits<{
  click: [booklist: BookList]
  favorite: [booklist: BookList]
}>()

// 截断的描述
const truncatedDescription = computed(() => {
  if (!props.booklist.description) return ''
  return props.booklist.description.length > 60
    ? props.booklist.description.slice(0, 60) + '...'
    : props.booklist.description
})

// 显示的标签（最多3个）
const displayedTags = computed(() => {
  return props.booklist.tags?.slice(0, 3) || []
})

const hasMoreTags = computed(() => {
  return (props.booklist.tags?.length || 0) > 3
})

// 格式化数字
function formatNumber(num: number): string {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 处理点击
function handleClick() {
  emit('click', props.booklist)
}

// 处理收藏
function handleFavorite() {
  emit('favorite', props.booklist)
}
</script>

<style scoped lang="scss">
.booklist-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  cursor: pointer;

  &.is-hoverable:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.booklist-cover {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: rgba(255, 255, 255, 0.8);
  }

  .book-count-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 12px;
    border-radius: 12px;
    backdrop-filter: blur(4px);
  }
}

.booklist-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.booklist-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booklist-description {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .creator-name {
    font-size: 13px;
    color: #999;
  }
}

.booklist-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .more-tags {
    font-size: 12px;
    color: #999;
  }
}

.booklist-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #999;

    i {
      color: #ccc;
    }
  }
}

.booklist-actions {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  .qy-button.is-active {
    color: #f7ba2a;
  }
}

@media (max-width: 640px) {
  .booklist-card {
    flex-direction: column;
    gap: 12px;
  }

  .booklist-cover {
    width: 100%;
    height: 200px;
  }

  .booklist-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
