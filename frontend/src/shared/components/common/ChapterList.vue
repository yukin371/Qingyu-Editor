<template>
    <div class="chapter-list">
        <!-- 头部控制栏 -->
        <div class="chapter-header">
            <span class="chapter-count">共 {{ chapters.length }} 章</span>
            <div class="chapter-controls">
                <QyButton v-if="showSort" variant="ghost" size="sm" @click="toggleOrder">
                    {{ isReversed ? '正序' : '倒序' }}
                </QyButton>
                <slot name="header-actions" />
            </div>
        </div>

        <!-- 章节列表 -->
        <div class="chapter-scroll" :style="{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }">
            <div v-for="chapter in displayedChapters" :key="chapter.id" class="chapter-item" :class="{
                'is-active': activeChapterId === chapter.id,
                'is-read': chapter.isRead,
                'is-locked': !chapter.isFree
            }" @click="handleChapterClick(chapter)">
                <!-- 章节序号 -->
                <span v-if="showNumber" class="chapter-num">{{ chapter.chapterNum }}</span>

                <!-- 章节标题 -->
                <span class="chapter-title">{{ chapter.title }}</span>

                <!-- 章节信息 -->
                <div class="chapter-info">
                    <!-- 锁定图标 -->
                    <span v-if="!chapter.isFree" class="lock-icon" v-html="lockIcon"></span>

                    <!-- 字数 -->
                    <span v-if="showWordCount && chapter.wordCount" class="word-count">
                        {{ formatNumber(chapter.wordCount) }}字
                    </span>

                    <!-- 更新时间 -->
                    <span v-if="showTime && chapter.publishTime" class="publish-time">
                        {{ formatTime(chapter.publishTime) }}
                    </span>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="chapters.length === 0" class="empty-state">
                <div class="empty-icon" v-html="emptyIcon"></div>
                <p class="empty-text">暂无章节</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'
import type { ChapterListItem } from '@/types/models'

// SVG 图标
const lockIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>'

const emptyIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 80px; height: 80px; color: #c0c4cc;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>'

interface Props {
    chapters: ChapterListItem[]
    activeChapterId?: string
    maxHeight?: string | number
    showNumber?: boolean
    showWordCount?: boolean
    showTime?: boolean
    showSort?: boolean
    defaultReversed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    maxHeight: '600px',
    showNumber: true,
    showWordCount: true,
    showTime: false,
    showSort: true,
    defaultReversed: false
})

const emit = defineEmits<{
    select: [chapter: ChapterListItem]
    sortChange: [isReversed: boolean]
}>()

const isReversed = ref(props.defaultReversed)

const displayedChapters = computed(() => {
    return isReversed.value ? [...props.chapters].reverse() : props.chapters
})

const toggleOrder = () => {
    isReversed.value = !isReversed.value
    emit('sortChange', isReversed.value)
}

const handleChapterClick = (chapter: ChapterListItem) => {
    if (!chapter.isFree) {
        // 可以在这里显示解锁提示
        return
    }
    emit('select', chapter)
}

const formatNumber = (num: number): string => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
    }
    return num.toString()
}

const formatTime = (time: string): string => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`

    return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.chapter-list {
    .chapter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        border-bottom: 1px solid #ebeef5;
        background: #fafafa;

        .chapter-count {
            font-size: 14px;
            color: #606266;
        }

        .chapter-controls {
            display: flex;
            gap: 8px;
            align-items: center;
        }
    }

    .chapter-item {
        display: flex;
        align-items: center;
        padding: 14px 20px;
        border-bottom: 1px solid #f5f5f5;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
            background-color: #f5f7fa;
        }

        &.is-active {
            background-color: #ecf5ff;
            color: #409eff;

            .chapter-title {
                font-weight: 600;
            }
        }

        &.is-read {
            color: #909399;
        }

        &.is-locked {
            cursor: not-allowed;
            opacity: 0.6;

            &:hover {
                background-color: transparent;
            }
        }

        .chapter-num {
            width: 60px;
            flex-shrink: 0;
            font-size: 13px;
            color: #909399;
        }

        .chapter-title {
            flex: 1;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin: 0 12px;
        }

        .chapter-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
            font-size: 12px;
            color: #909399;

            .lock-icon {
                color: #f56c6c;
            }

            .word-count,
            .publish-time {
                white-space: nowrap;
            }
        }
    }
}

// 响应式
@media (max-width: 768px) {
    .chapter-list {
        .chapter-item {
            padding: 12px 16px;

            .chapter-num {
                width: 40px;
                font-size: 12px;
            }

            .chapter-title {
                font-size: 13px;
                margin: 0 8px;
            }

            .chapter-info {
                gap: 8px;
                font-size: 11px;

                .word-count {
                    display: none;
                }
            }
        }
    }
}
</style>
