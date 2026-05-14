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
      class="batch-op-dialog fixed top-1/2 left-1/2 z-50 mx-4 flex max-h-[80vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg"
    >
      <!-- 标题栏 -->
      <div class="batch-op-dialog__header px-6 py-4">
        <h3 class="batch-op-dialog__title text-lg font-semibold">批量操作结果</h3>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto">
        <!-- 统计信息 -->
        <div class="batch-op-dialog__stats grid grid-cols-3 gap-4 border-b px-6 py-4">
          <!-- 成功统计 -->
          <div class="batch-op-dialog__stat batch-op-dialog__stat--success text-center p-3 rounded-lg border">
            <div class="text-2xl font-bold">{{ summary.successCount }}</div>
            <div class="mt-1 text-sm">成功</div>
          </div>

          <!-- 失败统计 -->
          <div class="batch-op-dialog__stat batch-op-dialog__stat--danger text-center p-3 rounded-lg border">
            <div class="text-2xl font-bold">{{ summary.failedCount }}</div>
            <div class="mt-1 text-sm">失败</div>
          </div>

          <!-- 跳过统计 -->
          <div class="batch-op-dialog__stat batch-op-dialog__stat--warning text-center p-3 rounded-lg border">
            <div class="text-2xl font-bold">{{ summary.skippedCount }}</div>
            <div class="mt-1 text-sm">跳过</div>
          </div>
        </div>

        <!-- 失败项列表 -->
        <div v-if="failedItems.length > 0" class="px-6 py-4">
          <h4 class="batch-op-dialog__title mb-3 text-sm font-medium">
            失败项 ({{ failedItems.length }})
          </h4>
          <div class="space-y-3 max-h-60 overflow-y-auto">
            <div
              v-for="item in failedItems"
              :key="item.id"
              class="batch-op-dialog__failure p-4 rounded-lg border"
            >
              <!-- 标题 -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <h5 class="batch-op-dialog__title truncate text-sm font-medium">{{ item.title }}</h5>
                  </div>

                  <!-- 错误信息 -->
                  <div v-if="item.errorMessage" class="batch-op-dialog__danger mt-1 text-sm">
                    {{ item.errorMessage }}
                  </div>
                  <div v-if="item.errorCode" class="batch-op-dialog__danger-soft mt-1 text-xs">
                    错误码: {{ item.errorCode }}
                  </div>
                </div>

                <!-- 重试按钮 -->
                <button
                  v-if="item.retryable"
                  type="button"
                  class="batch-op-dialog__danger-btn flex-shrink-0 px-3 py-1.5 text-sm font-medium transition-colors"
                  @click="handleRetry(item.id)"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 跳过项列表 -->
        <div v-if="skippedItems.length > 0" class="batch-op-dialog__section px-6 py-4 border-t">
          <h4 class="batch-op-dialog__title mb-3 text-sm font-medium">
            跳过项 ({{ skippedItems.length }})
          </h4>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div
              v-for="item in skippedItems"
              :key="item.id"
              class="batch-op-dialog__skipped flex items-center gap-2 rounded-lg border p-3"
            >
              <svg class="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="flex-1 truncate text-sm">{{ item.title }}</span>
              <span v-if="item.errorMessage" class="flex-shrink-0 text-xs">
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
            <h4 class="batch-op-dialog__title mb-2 text-lg font-medium">操作全部成功！</h4>
            <p class="batch-op-dialog__body text-sm">共成功处理 {{ succeededItems.length }} 个项目</p>
          </div>
        </div>
      </div>

      <!-- 底部按钮区 -->
      <div class="batch-op-dialog__footer flex justify-end gap-3 border-t px-6 py-4">
        <!-- 批量重试按钮 -->
        <button
          v-if="hasRetryableFailures"
          type="button"
          class="batch-op-dialog__danger-btn px-4 py-2 text-sm font-medium transition-colors"
          @click="handleRetryAll"
        >
          重试全部失败项
        </button>

        <!-- 关闭按钮 -->
        <button
          type="button"
          class="batch-op-dialog__ghost-btn px-4 py-2 text-sm font-medium transition-colors"
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

.batch-op-dialog {
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  box-shadow: var(--editor-shadow-lg, 0 20px 30px rgba(15, 23, 42, 0.18));
}

.batch-op-dialog__header,
.batch-op-dialog__stats,
.batch-op-dialog__section,
.batch-op-dialog__footer {
  border-color: var(--editor-border, #e5e7eb);
}

.batch-op-dialog__title {
  color: var(--editor-text-primary, #111827);
}

.batch-op-dialog__body {
  color: var(--editor-text-secondary, #4b5563);
}

.batch-op-dialog__stat--success {
  border-color: color-mix(in srgb, var(--color-success-400, #34d399) 40%, transparent);
  background: color-mix(in srgb, var(--color-success-50, #ecfdf5) 90%, transparent);
  color: var(--color-success-700, #047857);
}

.batch-op-dialog__stat--danger {
  border-color: color-mix(in srgb, var(--color-danger-400, #f87171) 42%, transparent);
  background: color-mix(in srgb, var(--color-danger-50, #fef2f2) 90%, transparent);
  color: var(--color-danger-700, #b91c1c);
}

.batch-op-dialog__stat--warning {
  border-color: color-mix(in srgb, var(--color-warning-400, #fbbf24) 42%, transparent);
  background: color-mix(in srgb, var(--color-warning-50, #fffbeb) 90%, transparent);
  color: var(--color-warning-700, #b45309);
}

.batch-op-dialog__failure {
  border-color: color-mix(in srgb, var(--color-danger-400, #f87171) 42%, transparent);
  background: color-mix(in srgb, var(--color-danger-50, #fef2f2) 90%, transparent);
}

.batch-op-dialog__skipped {
  border-color: color-mix(in srgb, var(--color-warning-400, #fbbf24) 42%, transparent);
  background: color-mix(in srgb, var(--color-warning-50, #fffbeb) 90%, transparent);
  color: var(--color-warning-800, #92400e);
}

.batch-op-dialog__danger {
  color: var(--color-danger-600, #dc2626);
}

.batch-op-dialog__danger-soft {
  color: var(--color-danger-500, #ef4444);
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

.batch-op-dialog__danger-btn {
  border-radius: 8px;
  background: var(--color-danger-500, #ef4444);
  color: #fff;
}

.batch-op-dialog__danger-btn:hover {
  background: var(--color-danger-600, #dc2626);
}
</style>
