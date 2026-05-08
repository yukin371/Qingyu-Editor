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
        <h3 class="text-lg font-semibold text-gray-900">导出设置</h3>
      </div>

      <!-- 内容区 -->
      <div class="px-6 py-4 flex-1 overflow-y-auto">
        <!-- 格式选择 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">选择导出格式</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="formatOption in formatOptions"
              :key="formatOption.value"
              type="button"
              :class="[
                'p-4 rounded-lg border-2 transition-all text-left',
                format === formatOption.value
                  ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              ]"
              @click="handleFormatSelect(formatOption.value)"
            >
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    v-if="formatOption.value === 'txt'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                  <path
                    v-else-if="formatOption.value === 'md'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                  <path
                    v-else-if="formatOption.value === 'docx'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                />
              </div>
              <div class="mt-2 font-medium">{{ formatOption.label }}</div>
              <div class="text-xs opacity-75 mt-1">{{ formatOption.description }}</div>
            </button>
          </div>
        </div>

        <!-- 高级选项 -->
        <div class="mb-6">
          <button
            type="button"
            class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            @click="showAdvancedOptions = !showAdvancedOptions"
          >
            <svg
              :class="['w-4 h-4 transition-transform', showAdvancedOptions ? 'rotate-90' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            高级选项
          </button>

          <Transition name="slide">
            <div v-if="showAdvancedOptions" class="mt-3 space-y-3 pl-6">
              <!-- 包含目录 -->
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="options.toc"
                  type="checkbox"
                  class="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                />
                <span class="text-sm text-gray-700">生成目录</span>
              </label>

              <!-- 包含页码 -->
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="options.pageNumbers"
                  type="checkbox"
                  class="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                />
                <span class="text-sm text-gray-700">添加页码</span>
              </label>

              <!-- 包含注释 -->
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="options.includeNotes"
                  type="checkbox"
                  class="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                />
                <span class="text-sm text-gray-700">包含注释</span>
              </label>

              <!-- 包含标签 -->
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="options.includeTags"
                  type="checkbox"
                  class="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                />
                <span class="text-sm text-gray-700">包含标签</span>
              </label>
            </div>
          </Transition>
        </div>

        <!-- 导出提示 -->
        <div v-if="isProject && format === 'zip'" class="p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="text-sm text-secondary-800">ZIP 格式将包含整个项目的所有文档和资源。</p>
          </div>
        </div>
      </div>

      <!-- 底部按钮区 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          :disabled="exporting"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleClose"
        >
          取消
        </button>
        <button
          type="button"
          :disabled="exporting || !format"
          class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          @click="handleExport"
        >
          <svg
            v-if="exporting"
            class="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ exporting ? '导出中...' : '开始导出' }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from '@/design-system/services'
import { exportApi } from '../api/export'
import type { ExportFormat, ExportDocumentRequest, ExportProjectRequest, ExportOptions } from '../types/export'

interface Props {
  modelValue: boolean
  documentId?: string
  projectId: string
  isProject?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isProject: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [taskId: string]
  cancel: []
}>()

// 格式选项
const formatOptions = [
  {
    value: 'txt' as ExportFormat,
    label: 'TXT 文本',
    description: '纯文本格式，兼容性最强'
  },
  {
    value: 'md' as ExportFormat,
    label: 'Markdown',
    description: '支持富文本语法，便于编辑'
  },
  {
    value: 'docx' as ExportFormat,
    label: 'Word 文档',
    description: '标准办公文档格式'
  },
  {
    value: 'zip' as ExportFormat,
    label: 'ZIP 压缩包',
    description: '包含所有文件和资源'
  }
]

// 状态管理
const format = ref<ExportFormat>('md')
const exporting = ref(false)
const showAdvancedOptions = ref(false)
const options = ref<ExportOptions>({
  toc: true,
  pageNumbers: false,
  includeNotes: false,
  includeTags: false
})

/**
 * 处理格式选择
 */
function handleFormatSelect(selectedFormat: ExportFormat): void {
  format.value = selectedFormat
}

/**
 * 处理导出
 */
async function handleExport(): Promise<void> {
  if (!format.value) {
    return
  }

  exporting.value = true

  try {
    let taskId: string

    if (props.isProject) {
      // 项目导出
      const projectOptions: ExportProjectRequest = {
        includeDocuments: true,
        documentFormats: format.value,
        options: options.value
      }
      const result = await exportApi.exportProject(props.projectId, projectOptions)
      taskId = result.id
    } else {
      // 文档导出
      const docOptions: ExportDocumentRequest = {
        format: format.value,
        includeMeta: true,
        options: options.value
      }
      const result = await exportApi.exportDocument(props.documentId!, props.projectId, docOptions)
      taskId = result.id
    }

    emit('confirm', taskId)
    handleClose()
  } catch (error) {
    console.error('导出失败:', error)
    message.error('导出失败，请稍后重试', { duration: 3000 })
  } finally {
    exporting.value = false
  }
}

/**
 * 处理关闭
 */
function handleClose(): void {
  if (!exporting.value) {
    emit('cancel')
    emit('update:modelValue', false)
  }
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

/* 滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
