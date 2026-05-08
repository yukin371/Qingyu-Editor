<template>
  <div class="chapter-list">
    <!-- 头部操作栏 -->
    <div class="list-header">
      <div class="header-left">
        <span class="chapter-count">共 {{ chapters.length }} 章</span>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button :type="sortOrder === 'asc' ? 'primary' : ''" size="small" @click="setSortOrder('asc')">
            正序
          </el-button>
          <el-button :type="sortOrder === 'desc' ? 'primary' : ''" size="small" @click="setSortOrder('desc')">
            倒序
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 章节列表 -->
    <div v-loading="loading" class="chapters-container">
      <!-- 分组模式 -->
      <template v-if="groupBy">
        <el-collapse v-model="activeGroups">
          <el-collapse-item v-for="group in groupedChapters" :key="group.name" :name="group.name">
            <template #title>
              <div class="group-title">
                <span>{{ group.name }}</span>
                <span class="group-count">{{ group.chapters.length }}章</span>
              </div>
            </template>
            <div class="chapter-group">
              <div v-for="chapter in group.chapters" :key="chapter.id" class="chapter-item" :class="{
                'is-active': chapter.id === currentChapterId,
                'is-locked': chapter.locked,
                'is-read': isChapterRead(chapter.id)
              }" @click="handleChapterClick(chapter)">
                <div class="chapter-info">
                  <span class="chapter-title">{{ chapter.title }}</span>
                  <div class="chapter-meta">
                    <span v-if="chapter.locked" class="meta-tag locked">
                      <QyIcon name="Lock"  />
                      付费
                    </span>
                    <span v-if="chapter.isFree" class="meta-tag free">免费</span>
                    <span v-if="chapter.wordCount" class="word-count">
                      {{ formatWordCount(chapter.wordCount) }}字
                    </span>
                    <span v-if="chapter.updateTime" class="update-time">
                      {{ formatDate(chapter.updateTime) }}
                    </span>
                  </div>
                </div>
                <div class="chapter-action">
                  <el-icon v-if="isChapterRead(chapter.id)" class="read-icon">
                    <QyIcon name="CircleCheck"  />
                  </el-icon>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </template>

      <!-- 列表模式 -->
      <template v-else>
        <div class="chapter-grid">
          <div v-for="chapter in sortedChapters" :key="chapter.id" class="chapter-item" :class="{
            'is-active': chapter.id === currentChapterId,
            'is-locked': chapter.locked,
            'is-read': isChapterRead(chapter.id)
          }" @click="handleChapterClick(chapter)">
            <div class="chapter-info">
              <span class="chapter-title">{{ chapter.title }}</span>
              <div class="chapter-meta">
                <span v-if="chapter.locked" class="meta-tag locked">
                  <QyIcon name="Lock"  />
                  付费
                </span>
                <span v-if="chapter.isFree" class="meta-tag free">免费</span>
                <span v-if="chapter.wordCount" class="word-count">
                  {{ formatWordCount(chapter.wordCount) }}字
                </span>
              </div>
            </div>
            <div class="chapter-action">
              <el-icon v-if="isChapterRead(chapter.id)" class="read-icon">
                <QyIcon name="CircleCheck"  />
              </el-icon>
            </div>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <el-empty v-if="!loading && chapters.length === 0" description="暂无章节" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { QyIcon } from '@/design-system/components'
import type { Chapter } from '@/types/models'

interface Props {
  chapters: Chapter[]
  currentChapterId?: string
  readChapterIds?: string[]
  loading?: boolean
  groupBy?: 'volume' | null // 是否按卷分组
}

const props = withDefaults(defineProps<Props>(), {
  chapters: () => [],
  currentChapterId: '',
  readChapterIds: () => [],
  loading: false,
  groupBy: null
})

const emit = defineEmits<{
  'chapter-click': [chapter: Chapter]
}>()

// 状态
const sortOrder = ref<'asc' | 'desc'>('asc')
const activeGroups = ref<string[]>(['正文']) // 默认展开正文组

// 排序后的章节
const sortedChapters = computed(() => {
  const sorted = [...props.chapters]
  if (sortOrder.value === 'desc') {
    return sorted.reverse()
  }
  return sorted
})

// 分组后的章节
const groupedChapters = computed(() => {
  if (!props.groupBy) return []

  const groups: { name: string; chapters: Chapter[] }[] = []
  const groupMap = new Map<string, Chapter[]>()

  props.chapters.forEach(chapter => {
    const groupName = (chapter as any).volumeName || '正文'
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, [])
    }
    groupMap.get(groupName)!.push(chapter)
  })

  groupMap.forEach((chapters, name) => {
    groups.push({ name, chapters })
  })

  // 排序
  groups.forEach(group => {
    if (sortOrder.value === 'desc') {
      group.chapters.reverse()
    }
  })

  return groups
})

// 设置排序
const setSortOrder = (order: 'asc' | 'desc') => {
  sortOrder.value = order
}

// 判断章节是否已读
const isChapterRead = (chapterId: string) => {
  return props.readChapterIds.includes(chapterId)
}

// 处理章节点击
const handleChapterClick = (chapter: Chapter) => {
  if (chapter.locked) {
    // 如果章节被锁定，可以显示购买提示
    // 这里先发出事件，由父组件处理
  }
  emit('chapter-click', chapter)
}

// 格式化字数
const formatWordCount = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

// 格式化日期
const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }

  // 超过7天显示具体日期
  return d.toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.chapter-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    background-color: #f5f7fa;

    .chapter-count {
      font-size: 14px;
      color: #606266;
    }
  }

  .chapters-container {
    min-height: 300px;
  }

  // 分组标题
  .group-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 15px;
    font-weight: 600;

    .group-count {
      font-size: 13px;
      font-weight: normal;
      color: #909399;
    }
  }

  .chapter-group {
    padding: 8px 0;
  }

  // 章节网格
  .chapter-grid {
    padding: 8px;
  }

  // 章节项
  .chapter-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    background-color: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #f5f7fa;
      border-color: #409eff;
    }

    &.is-active {
      background-color: #ecf5ff;
      border-color: #409eff;

      .chapter-title {
        color: #409eff;
        font-weight: 600;
      }
    }

    &.is-locked {
      .chapter-title {
        position: relative;
        padding-left: 20px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="%23909399" d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240z"/></svg>');
        }
      }
    }

    &.is-read {
      opacity: 0.6;
    }

    .chapter-info {
      flex: 1;
      min-width: 0;

      .chapter-title {
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chapter-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 12px;
        color: #909399;

        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 2px 6px;
          border-radius: 2px;
          background-color: #f0f2f5;

          &.locked {
            color: #f56c6c;
            background-color: #fef0f0;
          }

          &.free {
            color: #67c23a;
            background-color: #f0f9ff;
          }
        }
      }
    }

    .chapter-action {
      margin-left: 12px;

      .read-icon {
        font-size: 18px;
        color: #67c23a;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .chapter-list {
    .list-header {
      padding: 12px;
    }

    .chapter-item {
      padding: 10px 12px;

      .chapter-info .chapter-title {
        font-size: 13px;
      }
    }
  }
}
</style>
