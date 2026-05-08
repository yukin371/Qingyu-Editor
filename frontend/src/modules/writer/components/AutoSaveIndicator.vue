<template>
    <div class="autosave-indicator" :class="statusClass">
        <el-icon v-if="status === 'saving'" class="is-loading">
            <Loading />
        </el-icon>
        <el-icon v-else-if="status === 'saved'">
            <QyIcon name="Check"  />
        </el-icon>
        <el-icon v-else-if="status === 'error'">
            <QyIcon name="Close"  />
        </el-icon>
        <el-icon v-else-if="status === 'conflict'">
            <Warning />
        </el-icon>
        <span class="status-text">{{ statusText }}</span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyIcon } from '@/design-system/components'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict'

interface Props {
    status: SaveStatus
    lastSaveTime?: Date | null
    errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
    status: 'idle',
    lastSaveTime: null,
    errorMessage: ''
})

const statusClass = computed(() => {
    return `status-${props.status}`
})

const statusText = computed(() => {
    switch (props.status) {
        case 'idle':
            return '未保存'
        case 'saving':
            return '保存中...'
        case 'saved':
            return props.lastSaveTime
                ? `已保存于 ${formatTime(props.lastSaveTime)}`
                : '已保存'
        case 'error':
            return `保存失败: ${props.errorMessage || '未知错误'}`
        case 'conflict':
            return '版本冲突，请刷新'
        default:
            return ''
    }
})

function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
}
</script>

<style scoped lang="scss">
.autosave-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.3s;

    .el-icon {
        font-size: 16px;
    }

    &.status-idle {
        color: #909399;
        background: #f5f7fa;
    }

    &.status-saving {
        color: #409EFF;
        background: #ecf5ff;

        .el-icon {
            animation: rotating 2s linear infinite;
        }
    }

    &.status-saved {
        color: #67C23A;
        background: #f0f9ff;
    }

    &.status-error {
        color: #F56C6C;
        background: #fef0f0;
    }

    &.status-conflict {
        color: #E6A23C;
        background: #fdf6ec;
    }
}

@keyframes rotating {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
