<template>
  <div class="ranking-container">
    <!-- 骨架屏加载状态 -->
    <div v-if="loading" class="skeleton-wrapper">
      <div v-for="n in 6" :key="n" class="skeleton-item">
        <el-skeleton animated>
          <template #template>
            <div style="display: flex; gap: 16px; align-items: center">
              <el-skeleton-item variant="circle" style="width: 24px; height: 24px" />
              <el-skeleton-item
                variant="image"
                style="width: 48px; height: 64px; border-radius: 6px"
              />
              <div style="flex: 1">
                <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 8px" />
                <el-skeleton-item variant="text" style="width: 40%" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 真实数据列表 -->
    <ul v-else-if="displayItems.length > 0" class="ranking-list">
      <li
        v-for="(item, index) in displayItems"
        :key="item.id || index"
        class="ranking-item"
        @click="handleItemClick(item)"
      >
        <!-- 排名序号 (前三名特殊样式) -->
        <div class="rank-index" :class="getRankClass(index + 1)">
          <span v-if="index < 3" class="crown-icon">
            <QyIcon name="Trophy" />
          </span>
          <span class="rank-num">{{ index + 1 }}</span>
        </div>

        <!-- 书籍封面 -->
        <div class="book-cover-wrapper">
          <el-image :src="getCoverSrc(item)" fit="cover" class="book-cover" loading="lazy">
            <template #error>
              <img
                :src="getFallbackCoverSrc(item)"
                :alt="item.book?.title || item.title || '书籍封面'"
                class="fallback-book-cover"
              />
            </template>
          </el-image>
        </div>

        <!-- 书籍信息 -->
        <div class="book-info">
          <div class="info-header">
            <h4 class="book-title" :title="item.book?.title || item.title">
              {{ item.book?.title || item.title || '未知书籍' }}
            </h4>
            <el-tag
              v-if="index === 0"
              size="small"
              effect="dark"
              round
              color="#c0a062"
              class="top-tag"
              >TOP 1</el-tag
            >
          </div>

          <div class="book-meta">
            <span class="author">{{ item.book?.author || item.author || '未知作者' }}</span>
            <el-divider direction="vertical" />
            <span class="category">{{ item.book?.category || '文学' }}</span>
          </div>

          <!-- 底部数据 (热度/评分) -->
          <div class="book-stats">
            <div class="stat-pill">
              <span class="score-val">{{ getDisplayRating(item).toFixed(1) }}</span>
              <span class="score-label">分</span>
            </div>
            <span class="view-count">
              <QyIcon name="View" /> {{ formatNumber(item.viewCount) }}
            </span>
          </div>
        </div>

        <!-- 悬浮时的右箭头 -->
        <div class="action-arrow">
          <QyIcon name="ArrowRight" />
        </div>
      </li>
    </ul>

    <!-- 空状态（加载成功但无数据） -->
    <div v-else-if="error" class="error-state">
      <Empty title="加载失败" description="服务器连接异常，请检查网络后重试">
        <template #action>
          <button class="retry-btn" @click="emit('retry')">重新加载</button>
        </template>
      </Empty>
    </div>

    <!-- 错误状态（加载失败） -->
    <div v-else class="empty-state">
      <Empty description="暂无榜单数据" iconSize="medium" />
    </div>

    <!-- 查看更多 (如果父组件没有提供 Header 里的 View More，这里可以作为底部补充) -->
    <div v-if="displayItems.length > 0" class="list-footer" @click="$emit('view-more')">
      <span>查看完整榜单</span>
      <QyIcon name="ArrowRight" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyIcon } from '@/design-system/components'
import { Empty } from '@/design-system/base'
import { getFallbackBookCover, resolveBookCover } from '../utils/cover-resolver'

// Props 定义
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (val: string) => ['realtime', 'weekly', 'monthly', 'newbie'].includes(val),
  },
  items: {
    type: Array as () => any[],
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  maxItems: {
    type: Number,
    default: 10,
  },
})

// Emits
const emit = defineEmits(['view-more', 'item-click', 'retry'])

const displayItems = computed(() => {
  const source = Array.isArray(props.items) ? props.items : []
  return source.slice(0, props.maxItems)
})

const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return 'rank-common'
}

const formatNumber = (num: number) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 榜单的 score 是热度综合分，不是书籍评分；展示层统一只使用真实评分并限制在 0~5。
const getDisplayRating = (item: any): number => {
  const rawRating = item?.book?.rating ?? item?.rating
  const numericRating =
    typeof rawRating === 'number' ? rawRating : Number.parseFloat(String(rawRating ?? ''))

  if (!Number.isFinite(numericRating) || numericRating <= 0) {
    return 0
  }

  return Math.max(0, Math.min(5, Math.round(numericRating * 10) / 10))
}

const handleItemClick = async (item: any) => {
  // 优先使用 book.id，其次使用 bookId（榜单数据中的书籍ID字段）
  // 注意：不要使用 item.id，那是榜单条目ID，不是书籍ID
  const bookId = item.book?.id || item.bookId
  if (bookId) {
    // 可以在这里调用 store 增加浏览量，或者交给详情页处理
    // await bookstoreStore.incrementBookView(bookId)
    emit('item-click', { ...item, resolvedBookId: bookId })
  }
}

const getCoverSrc = (item: any) => resolveBookCover(item)

const getFallbackCoverSrc = (item: any) => getFallbackBookCover(item)
</script>

<style scoped lang="scss">
/* 变量定义：金银铜 */
$gold: #ffb433;
$silver: #aeb5c0;
$bronze: #cd7f32;

.ranking-container {
  background: #fff;
  border-radius: 16px;
  /* 阴影更柔和，提升高级感 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 8px 0;
  overflow: hidden;
}

.skeleton-wrapper {
  padding: 20px;

  .skeleton-item {
    margin-bottom: 20px;
  }
}

.ranking-list {
  list-style: none;
  margin: 0;
  padding: 0 12px 8px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
  /* 占位防止抖动 */
  position: relative;

  &:hover {
    background-color: #f8f9fb;
    transform: translateY(-1px);

    .action-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .book-cover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  /* 最后一项去掉可能的分割线 */
  &:last-child {
    margin-bottom: 0;
  }
}

/* 排名数字样式 */
.rank-index {
  width: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;

  .crown-icon {
    font-size: 18px;
    margin-bottom: -4px;
    z-index: 1;
  }

  .rank-num {
    font-size: 18px;
    font-weight: 800;
    font-family: 'Oswald', 'Impact', sans-serif;
    /* 选用有冲击力的字体 */
    line-height: 1;
  }

  &.rank-1 {
    color: $gold;

    .rank-num {
      font-size: 24px;
    }
  }

  &.rank-2 {
    color: $silver;
  }

  &.rank-3 {
    color: $bronze;
  }

  &.rank-common {
    color: #c0c4cc;

    .rank-num {
      font-size: 16px;
      font-weight: 600;
    }
  }
}

/* 封面样式 */
.book-cover-wrapper {
  width: 40px;
  height: 54px;
  margin-right: 10px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  background: #f5f7fa;

  .book-cover {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
  }

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
  }

  .fallback-book-cover {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

/* 书籍信息区域 */
.book-info {
  flex: 1;
  min-width: 0;
  /* 防止文字溢出 */
  display: flex;
  flex-direction: column;
  gap: 4px;

  .info-header {
    display: flex;
    align-items: center;
    gap: 8px;

    .book-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .top-tag {
      height: 18px;
      padding: 0 6px;
      font-size: 10px;
      border: none;
    }
  }

  .book-meta {
    display: flex;
    align-items: center;
    font-size: 11px;
    color: #8590a6;

    .author {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-divider {
      margin: 0 8px;
      background-color: #e0e0e0;
    }
  }

  .book-stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2px;

    .stat-pill {
      display: flex;
      align-items: baseline;
      gap: 2px;

      .score-val {
        font-weight: 700;
        color: #e6a23c;
        font-size: 13px;
      }

      .score-label {
        font-size: 10px;
        color: #e6a23c;
        opacity: 0.8;
      }
    }

    .view-count {
      font-size: 11px;
      color: #999;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

/* 悬浮箭头 */
.action-arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  color: #c0c4cc;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .ranking-list {
    grid-template-columns: 1fr;
    padding: 0;
  }
}

/* 底部查看更多 */
.list-footer {
  padding: 12px 0;
  text-align: center;
  font-size: 13px;
  color: #8590a6;
  cursor: pointer;
  border-top: 1px solid #f5f7fa;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:hover {
    color: #409eff;
  }
}

.empty-state {
  padding: 20px 0;
}

.error-state {
  padding: 20px 0;
}

.retry-btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fee2e2;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
