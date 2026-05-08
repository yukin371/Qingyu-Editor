<template>
    <div class="reading-progress">
        <div class="progress-info">
            <span class="progress-text">{{ progressText }}</span>
            <span class="chapter-info">{{ chapterInfo }}</span>
        </div>
        <el-progress :percentage="percentage" :stroke-width="8" :show-text="false" :color="progressColor" />
        <div class="progress-stats" v-if="showStats">
            <div class="stat-item">
                <QyIcon name="Clock"  />
                <span>已读 {{ readingTime }}</span>
            </div>
            <div class="stat-item">
                <QyIcon name="Document"  />
                <span>{{ currentChapter }}/{{ totalChapters }} 章</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyIcon } from '@/design-system/components'
import { formatReadingTime } from '@/utils/reader'

interface Props {
    currentChapter: number
    totalChapters: number
    chapterProgress?: number
    readingTimeMinutes?: number
    showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    chapterProgress: 0,
    readingTimeMinutes: 0,
    showStats: true
})

const percentage = computed(() => {
    if (props.totalChapters === 0) return 0
    const baseProgress = ((props.currentChapter - 1) / props.totalChapters) * 100
    const currentProgress = (props.chapterProgress / 100) * (1 / props.totalChapters) * 100
    return Math.min(100, Math.round(baseProgress + currentProgress))
})

const progressText = computed(() => {
    return `阅读进度 ${percentage.value}%`
})

const chapterInfo = computed(() => {
    return `第 ${props.currentChapter} 章 / 共 ${props.totalChapters} 章`
})

const readingTime = computed(() => {
    return formatReadingTime(props.readingTimeMinutes)
})

const progressColor = computed(() => {
    if (percentage.value < 30) return '#409EFF'
    if (percentage.value < 70) return '#67C23A'
    return '#F56C6C'
})
</script>

<style scoped lang="scss">
.reading-progress {
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .progress-text {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
        }

        .chapter-info {
            font-size: 12px;
            color: #909399;
        }
    }

    .progress-stats {
        display: flex;
        gap: 24px;
        margin-top: 12px;

        .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #606266;

            .el-icon {
                font-size: 14px;
            }
        }
    }
}
</style>
