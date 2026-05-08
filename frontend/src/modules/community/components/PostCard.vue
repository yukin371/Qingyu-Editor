<template>
  <div class="post-card" @click="handleClick">
    <!-- 头部：用户信息 -->
    <div class="post-header">
      <Avatar :src="post.user?.avatar" :alt="post.user?.nickname" size="md" />
      <div class="user-info">
        <span class="nickname">{{ post.user?.nickname }}</span>
        <span class="post-time">{{ formatTime(post.createdAt) }}</span>
      </div>
    </div>

    <!-- 内容 -->
    <div class="post-content">
      <p class="content-text">{{ post.content }}</p>

      <!-- 图片 -->
      <div v-if="post.images?.length" class="content-images">
        <img
          v-for="(img, index) in post.images.slice(0, 9)"
          :key="index"
          :src="img"
          @click.stop="previewImage(img)"
        />
      </div>

      <!-- 书籍推荐 -->
      <div v-if="post.book" class="book-card" @click.stop="goToBook">
        <img :src="post.book.cover" :alt="post.book.title" />
        <div class="book-info">
          <span class="book-title">{{ post.book.title }}</span>
          <span class="book-author">{{ post.book.author }}</span>
        </div>
      </div>
    </div>

    <!-- 话题标签 -->
    <div v-if="post.topics?.length" class="post-topics">
      <Tag
        v-for="topic in post.topics"
        :key="topic"
        variant="default"
        effect="plain"
        size="sm"
        @click.stop="goToTopic(topic)"
      >
        #{{ topic }}
      </Tag>
    </div>

    <!-- 底部：操作按钮 -->
    <div class="post-actions">
      <button class="action-btn" :class="{ active: post.isLiked }" @click.stop="handleLike">
        <QyIcon :name="post.isLiked ? 'StarFilled' : 'Star'" :size="16" />
        <span>{{ post.likeCount || '点赞' }}</span>
      </button>

      <button class="action-btn" @click.stop="handleComment">
        <QyIcon name="ChatDotRound" :size="16" />
        <span>{{ post.commentCount || '评论' }}</span>
      </button>

      <button class="action-btn" @click.stop="handleShare">
        <QyIcon name="Share" :size="16" />
        <span>分享</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'
import { Avatar, Tag } from '@/design-system/base'
import type { Post } from '@/types/community'

interface Props {
  post: Post
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', post: Post): void
  (e: 'like', postId: string): void
  (e: 'comment', postId: string): void
  (e: 'share', postId: string): void
  (e: 'bookmark', postId: string): void
  (e: 'topic', topic: string): void
}>()

function formatTime(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`
  }

  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }

  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }

  return date.toLocaleDateString('zh-CN')
}

function handleClick() {
  emit('click', props.post)
}

function handleLike() {
  emit('like', props.post.id)
}

function handleComment() {
  emit('comment', props.post.id)
}

function handleShare() {
  emit('share', props.post.id)
}

function goToTopic(topic: string) {
  emit('topic', topic)
}

function goToBook() {
  // 跳转到书籍详情
}

function previewImage(_img: string) {
  // 预览图片
}
</script>

<style scoped lang="scss">
.post-card {
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .nickname {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
  }

  .post-time {
    font-size: 12px;
    color: #999;
  }
}

.post-content {
  margin-bottom: 12px;

  .content-text {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    margin: 0 0 12px 0;
    white-space: pre-wrap;
  }
}

.content-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 8px;
    cursor: zoom-in;
  }
}

.book-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fb;
  border-radius: 8px;
  cursor: pointer;

  img {
    width: 60px;
    height: 80px;
    border-radius: 4px;
    object-fit: cover;
  }

  .book-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .book-title {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }

    .book-author {
      font-size: 12px;
      color: #999;
    }
  }
}

.post-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.post-actions {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: none;
    background: transparent;
    color: #666;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
    }

    &.active {
      color: #f7ba2a;
    }

    i {
      font-size: 16px;
    }
  }
}
</style>
