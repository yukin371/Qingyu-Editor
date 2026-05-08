<template>
  <main
    class="reader-main"
    ref="contentRef"
    @click="$emit('toggle-fullscreen')"
    @scroll="handleScroll"
    data-testid="reader-main"
  >
    <Card
      class="reader-container"
      variant="glass"
      shadow="always"
      padding="lg"
      :style="containerStyle"
      data-testid="reader-content"
    >
      <!-- 章节标题 -->
      <h1 v-if="chapterTitle" class="chapter-title" data-testid="chapter-title">
        {{ chapterTitle }}
      </h1>

      <!-- 章节内容 -->
      <div v-if="paragraphs.length > 0" class="chapter-content" data-testid="chapter-content">
        <article
          v-for="(paragraph, index) in paragraphs"
          :key="paragraph.id || index"
          class="paragraph-wrapper"
          :class="{ 'is-highlighted': highlightedParagraphIndex === index }"
          :data-testid="`paragraph-${index}`"
          @click.stop="$emit('paragraph-click', index)"
        >
          <p class="paragraph-text">{{ paragraph.content }}</p>
          <CommentBadge
            v-if="getCommentCount(index) > 0"
            :comment-count="getCommentCount(index)"
            @click.stop="$emit('comment-badge-click', index)"
          />
        </article>
      </div>

      <!-- 空状态 -->
      <Empty v-else description="加载中..." data-testid="reader-loading-state" />

      <!-- 章节结束推荐区 -->
      <div
        v-if="showRecommendation"
        class="chapter-end-recommendation"
        data-testid="chapter-end-recommendation"
      >
        <Divider label="本章完" />

        <div class="recommendation-card">
          <h3>📚 阅读完成！</h3>
          <p class="read-time">本次阅读时长: {{ readingTimeText }}</p>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <QyButton
              variant="primary"
              size="lg"
              class="action-btn"
              @click.stop="$emit('add-to-bookshelf')"
              data-testid="collect-book-btn"
            >
              {{ isInBookshelf ? '已收藏本书' : '收藏本书' }}
            </QyButton>
          </div>

          <!-- 自动加入书架提示 -->
          <div v-if="!isInBookshelf" class="add-to-bookshelf-tip">
            <QyAlert title="已自动添加到书架" type="success" :closable="false" show-icon>
              <template #default>
                <p>本书已添加到您的书架，方便继续阅读</p>
              </template>
            </QyAlert>
          </div>

          <!-- 相关推荐 -->
          <div v-if="recommendedBooks.length > 0" class="recommended-books">
            <h4>你可能还喜欢</h4>
            <div class="book-list">
              <div
                v-for="book in recommendedBooks"
                :key="book.id"
                class="book-item"
                @click.stop="$emit('go-to-book', book.id)"
              >
                <el-image :src="book.cover" fit="cover" class="book-cover" />
                <div class="book-info">
                  <div class="book-title">{{ book.title }}</div>
                  <div class="book-author">{{ book.author }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="reason" class="book-reason">{{ reason }}</div>
      </div>
    </Card>
  </main>
</template>

<script setup lang="ts">
import { ref, type CSSProperties } from 'vue'
import { QyAlert, QyButton } from '@/design-system/components'
import { Empty, Card } from '@/design-system/base'
import { Divider } from '@/design-system/base'
import CommentBadge from '../comments/CommentBadge.vue'

export interface ReaderParagraph {
  id: string
  paragraphOrder: number
  content: string
  format?: string
  wordCount?: number
}

export interface RecommendedBook {
  id: string
  title: string
  author: string
  cover: string
}

defineProps<{
  chapterTitle?: string
  paragraphs: ReaderParagraph[]
  reason?: string
  containerStyle: CSSProperties
  highlightedParagraphIndex: number | null
  showRecommendation: boolean
  readingTimeText: string
  isInBookshelf: boolean
  recommendedBooks: RecommendedBook[]
  getCommentCount: (index: number) => number
}>()

const emit = defineEmits<{
  (e: 'toggle-fullscreen'): void
  (e: 'paragraph-click', index: number): void
  (e: 'comment-badge-click', index: number): void
  (e: 'add-to-bookshelf'): void
  (e: 'go-to-book', bookId: string): void
  (e: 'scroll'): void
}>()

const contentRef = ref<HTMLElement>()

const handleScroll = () => {
  emit('scroll')
}

defineExpose({
  contentRef,
})
</script>

<style scoped lang="scss">
.reader-main {
  padding: 22px 20px 30px;
  overflow-y: auto;
}

.reader-container {
  margin: 0 auto;
  padding: 0 20px;

  .chapter-title {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 40px;
  }

  .chapter-content {
    .paragraph-wrapper {
      position: relative;
      margin-bottom: 1em;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;
      padding: 4px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }

      &.is-highlighted {
        background-color: rgba(255, 235, 59, 0.3);
      }

      .paragraph-text {
        margin: 0;
        text-indent: 2em;
        text-align: justify;
        line-height: inherit;
        padding-right: 56px;
      }

      :deep(.comment-badge) {
        position: absolute;
        top: 6px;
        right: 6px;
        margin-left: 0;
        z-index: 1;
      }
    }
  }
}

// 章节结束推荐区
.chapter-end-recommendation {
  margin-top: 32px;
  padding: 22px 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #1f2937;

  .recommendation-card {
    h3 {
      font-size: 18px;
      margin: 0 0 8px 0;
      text-align: center;
      font-weight: 600;
    }

    .read-time {
      text-align: center;
      font-size: 13px;
      margin-bottom: 14px;
      color: #4b5563;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 14px;

      .action-btn {
        min-width: 140px;
        height: 36px;
        font-size: 14px;
      }
    }

    .add-to-bookshelf-tip {
      margin-bottom: 14px;

      :deep(.qy-alert) {
        background: #eef6ff;
        border: 1px solid #dbeafe;

        .qy-alert__title {
          color: #1f2937;
        }

        .qy-alert__description {
          color: #4b5563;
        }
      }
    }

    .recommended-books {
      h4 {
        font-size: 14px;
        margin: 0 0 10px 0;
        text-align: center;
        color: #6b7280;
      }

      .book-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;

        .book-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background: #f9fafb;
          }

          .book-cover {
            width: 60px;
            height: 80px;
            border-radius: 4px;
            flex-shrink: 0;
          }

          .book-info {
            flex: 1;
            min-width: 0;

            .book-title {
              font-size: 14px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .book-author {
              font-size: 12px;
              color: #6b7280;
            }
          }
        }
      }
    }
  }

            .book-reason {
              font-size: 11px;
              color: #10b981;
              margin-top: 4px;
              background: #d1fae5;
              padding: 2px 6px;
              border-radius: 4px;
              display: inline-block;
            }
}

@media (max-width: 768px) {
  .reader-container {
    .chapter-title {
      font-size: 22px;
    }
  }
}
</style>
