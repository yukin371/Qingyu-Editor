<template>
  <!-- 固定定位遮罩 -->
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    />
  </Transition>

  <!-- 居中对话框 -->
  <Transition name="zoom">
    <div
      v-if="visible"
      class="batch-op-dialog fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[500px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg"
    >
      <!-- 标题栏 -->
      <div class="batch-op-dialog__header px-6 py-4">
        <h3 class="batch-op-dialog__title text-lg font-semibold">批量操作执行中</h3>
      </div>

      <!-- 内容区 -->
      <div class="px-6 py-4 flex-1 overflow-y-auto">
        <!-- 进度条 -->
        <div class="batch-op-dialog__progress-track h-2 w-full overflow-hidden rounded-full">
          <div
            class="batch-op-dialog__progress-fill h-full transition-all duration-300"
            :style="{ width: progressPercentage + '%' }"
          />
        </div>

        <!-- 进度信息 -->
        <div class="mt-4 space-y-2">
          <p class="batch-op-dialog__body text-sm">
            <span class="font-medium">状态：</span>{{ statusLabel }}
          </p>
          <p class="batch-op-dialog__body text-sm">
            <span class="font-medium">进度：</span>{{ progress?.completedItems || 0 }} / {{ progress?.totalItems || 0 }}
          </p>
          <p v-if="progress && progress.failedItems > 0" class="batch-op-dialog__danger text-sm">
            <span class="font-medium">失败：</span>{{ progress.failedItems }}
          </p>
        </div>

        <!-- 完成后的操作按钮 -->
        <div v-if="isCompleted" class="mt-6 flex justify-end gap-3">
          <button
            v-if="canUndo"
            type="button"
            class="batch-op-dialog__ghost-btn px-4 py-2 text-sm font-medium transition-colors"
            @click="handleUndo"
          >
            撤销操作
          </button>
          <button
            type="button"
            class="batch-op-dialog__primary-btn px-4 py-2 text-sm font-medium transition-colors"
            @click="handleClose"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue'
import { useBatchOperationStore } from '../stores/batchOperationStore'

interface Props {
  visible: boolean
  operationId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  complete: []
}>()

const batchOpStore = useBatchOperationStore()

// 轮询定时器
let pollTimer: ReturnType<typeof setInterval> | null = null

/**
 * 当前操作进度
 */
const progress = computed(() => batchOpStore.progress)

/**
 * 进度百分比
 */
const progressPercentage = computed(() => {
  return batchOpStore.progressPercentage
})

/**
 * 是否完成
 */
const isCompleted = computed(() => {
  return batchOpStore.isCompleted
})

/**
 * 是否可撤销
 */
const canUndo = computed(() => {
  const operation = batchOpStore.currentOperation
  return operation?.status === 'completed' && operation?.type === 'delete'
})

/**
 * 状态标签
 */
const statusLabel = computed(() => {
  const operation = batchOpStore.currentOperation
  if (!operation) return '未知'

  const labels: Record<string, string> = {
    pending: '等待中',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
    partially_failed: '部分失败'
  }
  return labels[operation.status] || operation.status
})

/**
 * 启动轮询
 */
function startPolling(): void {
  if (!props.operationId) return

  // 立即查询一次
  batchOpStore.fetchStatus(props.operationId)

  // 每秒轮询一次
  pollTimer = setInterval(() => {
    if (props.operationId) {
      batchOpStore.fetchStatus(props.operationId)
    }

    // 如果完成，停止轮询并触发complete事件
    if (isCompleted.value) {
      stopPolling()
      emit('complete')
    }
  }, 1000)
}

/**
 * 停止轮询
 */
function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

/**
 * 处理撤销
 */
async function handleUndo(): Promise<void> {
  try {
    await batchOpStore.undo()
    handleClose()
  } catch (error) {
    console.error('撤销操作失败:', error)
  }
}

/**
 * 处理关闭
 */
function handleClose(): void {
  emit('update:visible', false)
}

// 监听visible变化，控制轮询
watch(() => props.visible, (visible) => {
  if (visible) {
    startPolling()
  } else {
    stopPolling()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 缩放动画 */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.batch-op-dialog {
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  box-shadow: var(--editor-shadow-lg, 0 20px 30px rgba(15, 23, 42, 0.18));
}

.batch-op-dialog__header {
  border-bottom: 1px solid var(--editor-border, #e5e7eb);
}

.batch-op-dialog__title {
  color: var(--editor-text-primary, #111827);
}

.batch-op-dialog__progress-track {
  background: var(--editor-layer-strong, #e5e7eb);
}

.batch-op-dialog__progress-fill {
  background: var(--editor-accent, #6366f1);
}

.batch-op-dialog__body {
  color: var(--editor-text-secondary, #374151);
}

.batch-op-dialog__danger {
  color: var(--color-danger-600, #dc2626);
}

.batch-op-dialog__ghost-btn {
  border: 1px solid var(--editor-border, #d1d5db);
  border-radius: 8px;
  background: var(--editor-layer-panel, #ffffff);
  color: var(--editor-text-secondary, #374151);
}

.batch-op-dialog__ghost-btn:hover {
  background: var(--editor-layer-soft, #f8fafc);
}

.batch-op-dialog__primary-btn {
  border-radius: 8px;
  background: var(--editor-accent, #6366f1);
  color: var(--editor-text-inverse, #ffffff);
}

.batch-op-dialog__primary-btn:hover {
  background: var(--editor-accent-hover, #4f46e5);
}
</style>
