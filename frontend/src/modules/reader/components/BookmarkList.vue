<template>
    <div class="bookmark-list">
        <div class="list-header">
            <h3>书签列表</h3>
            <el-button text @click="$emit('add')">
                <QyIcon name="Plus"  />
                添加书签
            </el-button>
        </div>

        <el-empty v-if="bookmarks.length === 0" description="暂无书签" />

        <div class="bookmark-items" v-else>
            <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark-item"
                @click="$emit('select', bookmark)">
                <div class="bookmark-content">
                    <div class="bookmark-title">{{ bookmark.chapterTitle }}</div>
                    <div class="bookmark-text">{{ bookmark.text }}</div>
                    <div class="bookmark-note" v-if="bookmark.note">{{ bookmark.note }}</div>
                </div>
                <div class="bookmark-actions">
                    <span class="bookmark-time">{{ formatTime(bookmark.createTime) }}</span>
                    <el-button text type="danger" size="small" @click.stop="$emit('delete', bookmark.id)">
                        <QyIcon name="Delete"  />
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'
import { formatDate } from '@/utils/format'

interface Bookmark {
    id: string
    chapterTitle: string
    text: string
    note?: string
    createTime: string
}

interface Props {
    bookmarks: Bookmark[]
}

defineProps<Props>()

const emit = defineEmits<{
    add: []
    select: [bookmark: Bookmark]
    delete: [id: string]
}>()

function formatTime(time: string): string {
    return formatDate(time, 'MM-DD HH:mm')
}
</script>

<style scoped lang="scss">
.bookmark-list {
    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            color: #303133;
        }
    }

    .bookmark-items {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .bookmark-item {
            padding: 12px;
            background: #f5f7fa;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
                background: #e8edf3;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .bookmark-content {
                .bookmark-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #303133;
                    margin-bottom: 6px;
                }

                .bookmark-text {
                    font-size: 13px;
                    color: #606266;
                    line-height: 1.6;
                    margin-bottom: 4px;
                }

                .bookmark-note {
                    font-size: 12px;
                    color: #909399;
                    font-style: italic;
                }
            }

            .bookmark-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 8px;

                .bookmark-time {
                    font-size: 12px;
                    color: #909399;
                }
            }
        }
    }
}
</style>
