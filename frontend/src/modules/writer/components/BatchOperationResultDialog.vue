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
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] mx-4 overflow-hidden flex flex-col"
    >
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">批量操作结果</h3>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto">
        <!-- 统计信息 -->
        <div class="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-200">
          <!-- 成功统计 -->
          <div class="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div class="text-2xl font-bold text-green-600">{{ summary.successCount }}</div>
            <div class="text-sm text-green-700 mt-1">成功</div>
          </div>

          <!-- 失败统计 -->
          <div class="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div class="text-2xl font-bold text-red-600">{{ summary.failedCount }}</div>
            <div class="text-sm text-red-700 mt-1">失败</div>
          </div>

          <!-- 跳过统计 -->
          <div class="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div class="text-2xl font-bold text-yellow-600">{{ summary.skippedCount }}</div>
            <div class="text-sm text-yellow-700 mt-1">跳过</div>
          </div>
        </div>

        <!-- 失败项列表 -->
        <div v-if="failedItems.length > 0" class="px-6 py-4">
          <h4 class="text-sm font-medium text-gray-900 mb-3">
            失败项 ({{ failedItems.length }})
          </h4>
          <div class="space-y-3 max-h-60 overflow-y-auto">
            <div
              v-for="item in failedItems"
              :key="item.id"
              class="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <!-- 标题 -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <h5 class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</h5>
                  </div>

                  <!-- 错误信息 -->
                  <div v-if="item.errorMessage" class="text-sm text-red-600 mt-1">
                    {{ item.errorMessage }}
                  </div>
                  <div v-if="item.errorCode" class="text-xs text-red-500 mt-1">
                    错误码: {{ item.errorCode }}
                  </div>
                </div>

                <!-- 重试按钮 -->
                <button
                  v-if="item.retryable"
                  type="button"
                  class="flex-shrink-0 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                  @click="handleRetry(item.id)"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 跳过项列表 -->
        <div v-if="skippedItems.length > 0" class="px-6 py-4 border-t border-gray-200">
          <h4 class="text-sm font-medium text-gray-900 mb-3">
            跳过项 ({{ skippedItems.length }})
          </h4>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div
              v-for="item in skippedItems"
              :key="item.id"
              class="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <svg class="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm text-yellow-800 flex-1 truncate">{{ item.title }}</span>
              <span v-if="item.errorMessage" class="text-xs text-yellow-600 flex-shrink-0">
                {{ item.errorMessage }}
              </span>
            </div>
          </div>
        </div>

        <!-- 成功项提示 -->
        <div v-if="succeededItems.length > 0 && failedItems.length === 0 && skippedItems.length === 0" class="px-6 py-8">
          <div class="text-center">
            <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <h4 class="text-lg font-medium text-gray-900 mb-2">操作全部成功！</h4>
            <p class="text-sm text-gray-600">共成功处理 {{ succeededItems.length }} 个项目</p>
          </div>
        </div>
      </div>

      <!-- 底部按钮区 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <!-- 批量重试按钮 -->
        <button
          v-if="hasRetryableFailures"
          type="button"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          @click="handleRetryAll"
        >
          重试全部失败项
        </button>

        <!-- 关闭按钮 -->
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          @click="handleClose"
        >
          关闭
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BatchOperationResultItem, BatchOperationSummary } from '@/modules/writer/types/batch-operation'

/**
 * 组件Props
 */
interface Props {
  modelValue: boolean
  summary: BatchOperationSummary
  items: BatchOperationResultItem[]
}

/**
 * 组件Emits
 */
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'retry', payload: { itemId: string }): void
  (e: 'retryAll'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 成功项列表
 */
const succeededItems = computed(() => {
  return props.items.filter(item => item.status === 'succeeded')
})

/**
 * 失败项列表
 */
const failedItems = computed(() => {
  return props.items.filter(item => item.status === 'failed')
})

/**
 * 跳过项列表
 */
const skippedItems = computed(() => {
  return props.items.filter(item => item.status === 'skipped')
})

/**
 * 是否有可重试的失败项
 */
const hasRetryableFailures = computed(() => {
  return failedItems.value.some(item => item.retryable === true)
})

/**
 * 处理单个重试
 */
function handleRetry(itemId: string): void {
  emit('retry', { itemId })
}

/**
 * 处理批量重试
 */
function handleRetryAll(): void {
  emit('retryAll')
}

/**
 * 处理关闭
 */
function handleClose(): void {
  emit('update:modelValue', false)
}
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
