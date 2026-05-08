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
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">确认批量操作</h3>
      </div>

      <!-- 内容区 -->
      <div class="px-6 py-4 flex-1 overflow-y-auto">
        <!-- 警告提示 -->
        <div class="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800">
          <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm font-medium">{{ confirmMessage }}</p>
        </div>

        <!-- 操作详情 -->
        <div class="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
          <p class="text-sm text-gray-700">
            <span class="font-medium">操作类型：</span>{{ operationTypeLabel }}
          </p>
          <p class="text-sm text-gray-700">
            <span class="font-medium">选中数量：</span>{{ selectedCount }} 个文档
          </p>
          <p v-if="includeDescendants" class="text-sm text-gray-700">
            <span class="font-medium">包含后代：</span>是
          </p>
        </div>
      </div>

      <!-- 底部按钮区 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          @click="handleClose"
        >
          取消
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
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
</style>
