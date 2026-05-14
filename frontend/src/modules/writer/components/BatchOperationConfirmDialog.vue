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
      class="batch-op-dialog fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[500px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg"
    >
      <!-- 标题栏 -->
      <div class="batch-op-dialog__header px-6 py-4">
        <h3 class="batch-op-dialog__title text-lg font-semibold">确认批量操作</h3>
      </div>

      <!-- 内容区 -->
      <div class="px-6 py-4 flex-1 overflow-y-auto">
        <!-- 警告提示 -->
        <div class="batch-op-dialog__warning flex items-start gap-3 rounded-lg p-4">
          <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm font-medium">{{ confirmMessage }}</p>
        </div>

        <!-- 操作详情 -->
        <div class="batch-op-dialog__detail mt-4 space-y-2 rounded-lg p-4">
          <p class="batch-op-dialog__body text-sm">
            <span class="font-medium">操作类型：</span>{{ operationTypeLabel }}
          </p>
          <p class="batch-op-dialog__body text-sm">
            <span class="font-medium">选中数量：</span>{{ selectedCount }} 个文档
          </p>
          <p v-if="includeDescendants" class="batch-op-dialog__body text-sm">
            <span class="font-medium">包含后代：</span>是
          </p>
        </div>
      </div>

      <!-- 底部按钮区 -->
      <div class="batch-op-dialog__footer flex justify-end gap-3 px-6 py-4">
        <button
          type="button"
          class="batch-op-dialog__ghost-btn px-4 py-2 text-sm font-medium transition-colors"
          @click="handleClose"
        >
          取消
        </button>
        <button
          type="button"
          class="batch-op-dialog__danger-btn px-4 py-2 text-sm font-medium transition-colors"
          @click="handleConfirm"
        >
          确认执行
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  operationType: 'delete' | 'move' | 'export'
  selectedCount: number
  includeDescendants?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  includeDescendants: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

/**
 * 操作类型标签
 */
const operationTypeLabel = computed(() => {
  const labels = {
    delete: '批量删除',
    move: '批量移动',
    export: '批量导出'
  }
  return labels[props.operationType]
})

/**
 * 确认消息
 */
const confirmMessage = computed(() => {
  return `确定要${operationTypeLabel.value}这 ${props.selectedCount} 个文档吗？`
})

/**
 * 处理确认
 */
function handleConfirm(): void {
  emit('confirm')
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
.batch-op-dialog__footer {
  border-color: var(--editor-border, #e5e7eb);
}

.batch-op-dialog__title {
  color: var(--editor-text-primary, #111827);
}

.batch-op-dialog__warning {
  border: 1px solid color-mix(in srgb, var(--color-warning-400, #fb923c) 36%, transparent);
  background: color-mix(in srgb, var(--color-warning-50, #fff7ed) 88%, transparent);
  color: var(--color-warning-800, #9a3412);
}

.batch-op-dialog__detail {
  background: var(--editor-layer-strong, #f8fafc);
}

.batch-op-dialog__body {
  color: var(--editor-text-secondary, #374151);
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
