<template>
  <!-- 固定定位遮罩 -->
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      @click="handleClose"
    />
  </Transition>

  <!-- 居中对话框 -->
  <Transition name="zoom">
    <div
      v-if="modelValue"
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">导出进度</h3>
      </div>

      <!-- 内容区 -->
      <div class="px-6 py-4 flex-1 overflow-y-auto">
        <!-- 加载状态 -->
        <div v-if="loading && !task" class="flex flex-col items-center justify-center py-8">
          <svg class="w-12 h-12 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p class="mt-4 text-sm text-gray-600">加载任务信息...</p>
        </div>

        <!-- 任务信息 -->
        <div v-else-if="task" class="space-y-4">
          <!-- 资源标题 -->
          <div>
            <p class="text-xs text-gray-500 mb-1">导出内容</p>
            <p class="text-sm font-medium text-gray-900 truncate">{{ task.resourceTitle }}</p>
          </div>

          <!-- 格式标签 -->
          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
            >
              {{ formatLabel }}
            </span>
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                statusClass
              ]"
            >
              {{ statusLabel }}
            </span>
          </div>

          <!-- 进度条 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">导出进度</span>
              <span class="text-sm font-medium text-gray-900">{{ displayProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                :class="[
                  'h-2.5 rounded-full transition-all duration-300',
                  progressColorClass
                ]"
                :style="{ width: `${displayProgress}%` }"
              />
            </div>
          </div>

          <!-- 状态文本 -->
          <div v-if="task.status === 'processing'" class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>正在处理中...</span>
          </div>

          <!-- 错误信息 -->
          <div
            v-if="task.status === 'failed' && task.errorMsg"
            class="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <p class="text-sm text-red-800">{{ task.errorMsg }}</p>
            </div>
          </div>

          <!-- 文件信息（已完成时显示） -->
          <div v-if="task.status === 'completed'" class="space-y-2">
            <div v-if="task.fileSize > 0" class="flex items-center justify-between text-sm">
              <span class="text-gray-600">文件大小</span>
              <span class="font-medium text-gray-900">{{ formatFileSize(task.fileSize) }}</span>
            </div>
            <div v-if="task.expiresAt" class="flex items-center justify-between text-sm">
              <span class="text-gray-600">过期时间</span>
              <span class="font-medium text-gray-900">{{ formatDate(task.expiresAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 无任务信息 -->
        <div v-else class="flex flex-col items-center justify-center py-8">
          <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p class="mt-4 text-sm text-gray-600">未找到任务信息</p>
        </div>
      </div>

      <!-- 底部按钮区 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <!-- 进行中：取消按钮 -->
        <template v-if="task?.status === 'pending' || task?.status === 'processing'">
          <button
            type="button"
            :disabled="loading"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleCancel"
          >
            取消任务
          </button>
        </template>

        <!-- 已完成：下载 + 关闭 -->
        <template v-else-if="task?.status === 'completed'">
          <button
            type="button"
            class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium flex items-center gap-2"
            @click="handleDownload"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            下载文件
          </button>
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            @click="handleClose"
          >
            关闭
          </button>
        </template>

        <!-- 失败/取消：关闭 -->
        <template v-else-if="task?.status === 'failed' || task?.status === 'cancelled'">
          <button
            type="button"
            class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium"
            @click="handleRetry"
          >
            重试
          </button>
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            @click="handleClose"
          >
            关闭
          </button>
        </template>

        <!-- 无任务：关闭 -->
        <template v-else>
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            @click="handleClose"
          >
            关闭
          </button>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { message } from '@/design-system/services'
import { exportApi } from '../api/export'
import type { ExportTask, ExportTaskStatus, ExportFormat } from '../types/export'

interface Props {
  modelValue: boolean
  taskId: string
  autoRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'download': [taskId: string]
  'close': []
  'retry': []
}>()

// 状态管理
const task = ref<ExportTask | null>(null)
const loading = ref(false)
const polling = ref(false)
const pollingTimer = ref<number | null>(null)

/**
 * 格式标签
 */
const formatLabel = computed(() => {
  if (!task.value) return ''
  const formatMap: Record<ExportFormat, string> = {
    txt: 'TXT 文本',
    md: 'Markdown',
    docx: 'Word 文档',
    zip: 'ZIP 压缩包'
  }
  return formatMap[task.value.format] || task.value.format
})

/**
 * 状态标签
 */
const statusLabel = computed(() => {
  if (!task.value) return ''
  const statusMap: Record<ExportTaskStatus, string> = {
    pending: '等待中',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return statusMap[task.value.status]
})

/**
 * 状态样式类
 */
const statusClass = computed(() => {
  if (!task.value) return ''
  const classMap: Record<ExportTaskStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-secondary-100 text-secondary-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return classMap[task.value.status]
})

/**
 * 显示的进度百分比
 */
const displayProgress = computed(() => {
  if (!task.value) return 0
  if (task.value.status === 'pending') return 0
  if (task.value.status === 'completed') return 100
  return task.value.progress || 0
})

/**
 * 进度条颜色类
 */
const progressColorClass = computed(() => {
  if (!task.value) return 'bg-gray-400'
  if (task.value.status === 'failed' || task.value.status === 'cancelled') {
    return 'bg-red-500'
  }
  if (task.value.status === 'completed') {
    return 'bg-green-500'
  }
  return 'bg-secondary-500'
})

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 格式化日期
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取任务状态
 */
async function fetchTask(): Promise<void> {
  if (!props.taskId) return

  loading.value = true
  try {
    const result = await exportApi.getTask(props.taskId)
    task.value = result

    // 完成或失败时停止轮询
    if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
      stopPolling()
    }
  } catch (error) {
    console.error('获取任务状态失败:', error)
    message.error('获取任务状态失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

/**
 * 开始轮询
 */
function startPolling(): void {
  if (!props.autoRefresh || polling.value) return

  polling.value = true
  pollingTimer.value = window.setInterval(() => {
    fetchTask()
  }, 2000)
}

/**
 * 停止轮询
 */
function stopPolling(): void {
  polling.value = false
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
}

/**
 * 取消任务
 */
async function handleCancel(): Promise<void> {
  try {
    await exportApi.cancelTask(props.taskId)
    stopPolling()
    await fetchTask()
    message.success('任务已取消')
  } catch (error) {
    console.error('取消任务失败:', error)
    message.error('取消任务失败，请稍后重试')
  }
}

/**
 * 下载文件
 */
async function handleDownload(): Promise<void> {
  if (!task.value?.fileUrl) {
    message.warning('文件尚未生成')
    return
  }

  try {
    // 使用exportApi下载
    const blob = await exportApi.downloadFile(props.taskId)

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = task.value.resourceTitle || 'export'
    a.click()
    URL.revokeObjectURL(url)

    message.success('下载已开始')
  } catch (error) {
    console.error('下载失败:', error)
    message.error('下载失败，请稍后重试')
  }
}

/**
 * 重试
 */
async function handleRetry(): Promise<void> {
  try {
    emit('retry')
    message.info('开始重新导出...')
  } catch (error) {
    console.error('重试失败:', error)
    message.error('重试失败，请稍后再试')
  }
}

/**
 * 关闭对话框
 */
function handleClose(): void {
  stopPolling()
  emit('close')
  emit('update:modelValue', false)
}

/**
 * 监听对话框显示状态
 */
watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.taskId) {
      // 对话框打开时，获取任务状态并开始轮询
      fetchTask()
      startPolling()
    } else {
      // 对话框关闭时，停止轮询
      stopPolling()
    }
  },
  { immediate: true }
)

/**
 * 监听 taskId 变化
 */
watch(
  () => props.taskId,
  (newTaskId) => {
    if (newTaskId && props.modelValue) {
      fetchTask()
      startPolling()
    }
  }
)

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  if (props.modelValue && props.taskId) {
    fetchTask()
    startPolling()
  }
})

/**
 * 组件销毁时清除定时器
 */
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
</style>
