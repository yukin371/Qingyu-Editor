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
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl w-full max-w-6xl max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">模板预览</h3>
        <button
          type="button"
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          @click="handleClose"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- 内容区 - 分屏布局 -->
      <div class="flex-1 overflow-hidden">
        <div class="h-full flex flex-col lg:flex-row">
          <!-- 左侧区域：变量输入 + 模板编辑 -->
          <div
            class="w-full lg:w-1/2 xl:w-[45%] border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col h-full overflow-hidden"
          >
            <!-- 变量输入区 -->
            <div class="p-4 border-b border-gray-200 bg-gray-50">
              <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                变量输入
              </h4>

              <!-- 变量表单 -->
              <div
                v-if="sortedVariables.length > 0"
                class="space-y-3 max-h-[200px] overflow-y-auto pr-2"
              >
                <div v-for="variable in sortedVariables" :key="variable.name" class="space-y-1">
                  <label
                    :for="`preview-field-${variable.name}`"
                    class="block text-xs font-medium text-gray-600"
                  >
                    {{ variable.label }}
                  </label>

                  <!-- 文本输入框 -->
                  <input
                    v-if="variable.type === 'text'"
                    :id="`preview-field-${variable.name}`"
                    v-model="formData[variable.name]"
                    type="text"
                    :placeholder="variable.placeholder || `请输入${variable.label}`"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1.5 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                  />

                  <!-- 多行文本框 -->
                  <textarea
                    v-else-if="variable.type === 'textarea'"
                    :id="`preview-field-${variable.name}`"
                    v-model="formData[variable.name]"
                    :placeholder="variable.placeholder || `请输入${variable.label}`"
                    rows="2"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1.5 focus:ring-secondary-500 focus:border-secondary-500 transition-colors resize-y"
                  />

                  <!-- 下拉选择框 -->
                  <select
                    v-else-if="variable.type === 'select'"
                    :id="`preview-field-${variable.name}`"
                    v-model="formData[variable.name]"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1.5 focus:ring-secondary-500 focus:border-secondary-500 transition-colors bg-white"
                  >
                    <option value="">
                      {{ variable.placeholder || `请选择${variable.label}` }}
                    </option>
                    <option
                      v-for="option in variable.options"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>

                  <!-- 数字输入框 -->
                  <input
                    v-else-if="variable.type === 'number'"
                    :id="`preview-field-${variable.name}`"
                    v-model.number="formData[variable.name]"
                    type="number"
                    :placeholder="variable.placeholder || `请输入${variable.label}`"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1.5 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                  />
                </div>
              </div>

              <!-- 无变量提示 -->
              <div v-else class="text-center py-4 text-gray-400 text-xs">此模板无需填写变量</div>
            </div>

            <!-- 模板编辑区 -->
            <div class="flex-1 flex flex-col overflow-hidden">
              <div
                class="px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between"
              >
                <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  模板内容
                </h4>
                <span class="text-xs text-gray-500">支持 &#123;&#123;var:xxx&#125;&#125; 语法</span>
              </div>
              <div class="flex-1 p-4 overflow-hidden">
                <textarea
                  v-model="editableContent"
                  class="w-full h-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors resize-none bg-white"
                  placeholder="在此编辑模板内容..."
                />
              </div>
            </div>
          </div>

          <!-- 右侧区域：预览 -->
          <div class="w-full lg:w-1/2 xl:w-[55%] flex flex-col h-full overflow-hidden">
            <div
              class="px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between"
            >
              <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                实时预览
              </h4>
              <button
                type="button"
                class="text-xs px-2 py-1 text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50 rounded transition-colors flex items-center gap-1"
                @click="showRawContent = !showRawContent"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {{ showRawContent ? '显示渲染' : '显示原文' }}
              </button>
            </div>
            <div class="flex-1 p-4 overflow-y-auto bg-white">
              <!-- 空状态 -->
              <div
                v-if="!renderedContent"
                class="flex flex-col items-center justify-center h-full text-gray-400"
              >
                <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p class="text-sm">在左侧编辑模板内容以查看预览</p>
              </div>

              <!-- 渲染内容 -->
              <div
                v-else-if="!showRawContent"
                class="prose prose-sm max-w-none"
                v-safe-html="renderedHtml"
              />

              <!-- 原始内容 -->
              <pre
                v-else
                class="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border border-gray-200"
                >{{ renderedContent }}</pre
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮区 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
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
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'

/**
 * 模板变量定义
 */
export interface TemplateVariable {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number'
  placeholder?: string
  defaultValue?: string
  required: boolean
  order: number
  options?: Array<{ label: string; value: string }>
}

interface Props {
  modelValue: boolean
  template: {
    content: string
    variables: TemplateVariable[]
  }
}

const props = defineProps<Props>()

interface Emits {
  'update:modelValue': [value: boolean]
}

const emit = defineEmits<Emits>()

// 表单数据
const formData = ref<Record<string, string>>({})

// 可编辑的模板内容
const editableContent = ref('')

// 是否显示原始内容
const showRawContent = ref(false)

/**
 * 排序后的变量列表（按 order 字段排序）
 */
const sortedVariables = computed(() => {
  return [...props.template.variables].sort((a, b) => a.order - b.order)
})

/**
 * 模板渲染器（模拟后端逻辑）
 */
function renderTemplate(content: string, vars: Record<string, string>): string {
  // 使用正则表达式替换 {{var:xxx}}
  const re = /\{\{var:([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g

  return content.replace(re, (match, varName) => {
    return vars[varName] || match
  })
}

/**
 * 渲染后的内容
 */
const renderedContent = computed(() => {
  if (!editableContent.value) return ''

  // 收集变量值
  const vars: Record<string, string> = {}
  props.template.variables?.forEach((v) => {
    vars[v.name] = formData.value[v.name] || v.defaultValue || ''
  })

  return renderTemplate(editableContent.value, vars)
})

/**
 * 渲染后的HTML（Markdown）
 */
const renderedHtml = computed(() => {
  if (!renderedContent.value) return ''

  try {
    return marked(renderedContent.value, { breaks: true, gfm: true }) as string
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return renderedContent.value
  }
})

/**
 * 初始化表单数据和模板内容
 */
function initData(): void {
  formData.value = {}
  editableContent.value = props.template.content || ''

  props.template.variables?.forEach((v) => {
    formData.value[v.name] = v.defaultValue || ''
  })
}

/**
 * 处理关闭
 */
function handleClose(): void {
  emit('update:modelValue', false)
}

/**
 * 监听对话框显示状态，初始化数据
 */
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      initData()
    }
  },
)

/**
 * 监听模板内容变化
 */
watch(
  () => props.template.content,
  (newContent) => {
    if (newContent && newContent !== editableContent.value) {
      editableContent.value = newContent
    }
  },
)
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

/* Markdown内容样式 */
.prose {
  color: #374151;
  line-height: 1.75;
}

.prose :deep(h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.75rem;
  color: #111827;
}

.prose :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0.875rem;
  margin-bottom: 0.625rem;
  color: #111827;
}

.prose :deep(h3) {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.prose :deep(p) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.prose :deep(strong) {
  font-weight: 600;
  color: #111827;
}

.prose :deep(code) {
  background-color: #f3f4f6;
  color: #eb5757;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 0.75rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.prose :deep(pre code) {
  background-color: transparent;
  color: inherit;
  padding: 0;
}

.prose :deep(ul),
.prose :deep(ol) {
  padding-left: 1.25rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.prose :deep(li) {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.prose :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  color: #6b7280;
  font-style: italic;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.prose :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.prose :deep(a:hover) {
  color: #1d4ed8;
}

.prose :deep(hr) {
  border-color: #e5e7eb;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.prose :deep(th),
.prose :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

.prose :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}

.prose :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}
</style>
