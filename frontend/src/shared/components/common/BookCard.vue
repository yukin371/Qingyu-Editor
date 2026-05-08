<template>
    <div class="book-card" :class="{ 'is-horizontal': layout === 'horizontal' }" @click="handleClick">
        <!-- 封面 -->
        <div class="book-cover">
            <img
                :src="book.cover"
                :alt="book.title"
                class="cover-image"
                @error="handleImageError"
            />

            <!-- 状态标签 -->
            <span v-if="showStatus && book.status === 'completed'" class="status-tag status-tag-success">
                完结
            </span>

            <!-- 阅读进度 -->
            <div v-if="showProgress && progress !== undefined" class="progress-overlay">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
                </div>
            </div>
        </div>

        <!-- 书籍信息 -->
        <div class="book-info">
            <h4 class="book-title" :title="book.title">{{ book.title }}</h4>
            <p class="book-author">{{ book.author }}</p>

            <!-- 元数据 -->
            <div v-if="showMeta" class="book-meta">
                <span v-if="book.rating" class="rating">
                    <span class="star-icon" v-html="starIcon"></span>
                    {{ book.rating.toFixed(1) }}
                </span>
                <span v-if="book.wordCount" class="word-count">
                    {{ formatNumber(book.wordCount) }}字
                </span>
                <span v-if="book.categoryName" class="category">
                    {{ book.categoryName }}
                </span>
            </div>

            <!-- 最新章节 -->
            <p v-if="showLatest && book.latestChapter" class="latest-chapter">
                最新: {{ book.latestChapter }}
            </p>

            <!-- 操作按钮 -->
            <div v-if="showActions" class="book-actions" @click.stop>
                <slot name="actions">
                    <QyButton variant="primary" size="sm" @click.stop="handleRead">阅读</QyButton>
                    <QyButton variant="ghost" size="sm" :icon="starIcon" @click.stop="handleFavorite" />
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'
import type { BookBrief } from '@/types/models'

// SVG 图标
const starIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'

interface Props {
    book: BookBrief
    layout?: 'vertical' | 'horizontal'
    showStatus?: boolean
    showMeta?: boolean
    showLatest?: boolean
    showActions?: boolean
    showProgress?: boolean
    progress?: number
}

const props = withDefaults(defineProps<Props>(), {
    layout: 'vertical',
    showStatus: true,
    showMeta: true,
    showLatest: false,
    showActions: false,
    showProgress: false
})

const emit = defineEmits<{
    click: [book: BookBrief]
    read: [book: BookBrief]
    favorite: [book: BookBrief]
}>()

const imageError = ref(false)

const handleImageError = () => {
    imageError.value = true
}

const formatNumber = (num: number): string => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
    }
    return num.toString()
}

const handleClick = () => {
    emit('click', props.book)
}

const handleRead = () => {
    emit('read', props.book)
}

const handleFavorite = () => {
    emit('favorite', props.book)
}
</script>

<style scoped lang="scss">
.book-card {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: all 0.3s;
    background: white;
    border-radius: 8px;
    overflow: hidden;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &.is-horizontal {
        flex-direction: row;

        .book-cover {
            width: 120px;
            height: 160px;
            flex-shrink: 0;
        }

        .book-info {
            flex: 1;
            padding: 16px;
        }
    }

    .book-cover {
        position: relative;
        width: 100%;
        aspect-ratio: 3/4;
        overflow: hidden;
        background-color: #f5f7fa;

        .cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .status-tag {
            position: absolute;
            top: 8px;
            right: 8px;
            z-index: 1;
            padding: 2px 8px;
            font-size: 12px;
            border-radius: 4px;

            &.status-tag-success {
                background-color: #f0f9ff;
                color: #67c23a;
                border: 1px solid #c2e7b0;
            }
        }

        .progress-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 8px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);

            .progress-bar {
                height: 3px;
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                overflow: hidden;

                .progress-fill {
                    height: 100%;
                    background-color: #67c23a;
                    transition: width 0.3s ease;
                }
            }
        }
    }

    .book-info {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .book-title {
            font-size: 14px;
            font-weight: 500;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #303133;
        }

        .book-author {
            font-size: 12px;
            color: #909399;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .book-meta {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #606266;
            margin-top: 4px;

            .rating {
                display: flex;
                align-items: center;
                gap: 2px;
                color: #f56c6c;

                .star-icon {
                    width: 14px;
                    height: 14px;
                }
            }
        }

        .latest-chapter {
            font-size: 12px;
            color: #909399;
            margin: 4px 0 0 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .book-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }
    }
}

// 响应式
@media (max-width: 768px) {
    .book-card.is-horizontal {
        .book-cover {
            width: 100px;
            height: 133px;
        }

        .book-info {
            padding: 12px;
        }
    }
}
</style>
