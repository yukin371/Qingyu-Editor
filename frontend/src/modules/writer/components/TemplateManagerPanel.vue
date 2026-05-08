<template>
  <!-- 固定定位遮罩 -->
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      @click="handleClose"
    />
  </Transition>

  <!-- 右侧抽屉面板 -->
  <Transition name="slide-right">
    <div
      v-if="modelValue"
      class="fixed top-0 right-0 h-full w-[600px] max-w-[90vw] z-50 bg-white shadow-2xl flex flex-col"
    >
      <!-- 头部区域 -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">模板库</h2>
        <button
          type="button"
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          @click="handleClose"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 搜索和过滤区域 -->
      <div class="px-6 py-4 border-b border-gray-200 space-y-4">
        <!-- 搜索栏 -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索模板名称或描述..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-sm"
          />
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <!-- 类型过滤按钮组 -->
        <div class="flex gap-2">
          <button
            v-for="type in templateTypes"
            :key="type.value"
            type="button"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              selectedType === type.value
                ? 'bg-secondary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectedType = type.value"
          >
            {{ type.label }}
          </button>
        </div>

        <!-- 新建模板按钮 -->
        <button
          type="button"
          class="w-full px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          @click="handleCreate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建模板
        </button>
      </div>

      <!-- 模板列表区域 -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-gray-500">加载中...</p>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredTemplates.length === 0" class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p class="text-gray-500 text-sm">暂无模板</p>
          <p class="text-gray-400 text-xs mt-1">点击上方按钮创建新模板</p>
        </div>

        <!-- 模板网格 -->
        <div v-else class="grid grid-cols-1 gap-4">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="p-4 border border-gray-200 rounded-lg hover:border-secondary-300 hover:shadow-md transition-all bg-white"
          >
            <!-- 模板头部 -->
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <h3 class="text-base font-semibold text-gray-900 mb-1">{{ template.name }}</h3>
                <p class="text-sm text-gray-500 line-clamp-2">{{ template.description }}</p>
              </div>
              <!-- 系统模板标识 -->
              <span
                v-if="template.isSystem"
                class="ml-2 px-2 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded flex-shrink-0"
              >
                系统
              </span>
            </div>

            <!-- 模板元信息 -->
            <div class="flex items-center gap-2 mb-3">
              <!-- 类型标签 -->
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded',
                  getTypeLabelClass(template.type)
                ]"
              >
                {{ getTypeLabel(template.type) }}
              </span>

              <!-- 分类标签 -->
              <span
                v-if="template.category"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded"
              >
                {{ template.category }}
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <button
                type="button"
                :disabled="!props.documentId"
                :class="[
                  'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  props.documentId
                    ? 'bg-secondary-500 text-white hover:bg-secondary-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                ]"
                :title="props.documentId ? '' : '请先选择文档'"
                @click="handleApply(template)"
              >
                应用模板
              </button>
              <button
                type="button"
                class="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                @click="handleEdit(template)"
              >
                编辑
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部关闭按钮 -->
      <div class="px-6 py-4 border-t border-gray-200">
        <button
          type="button"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          @click="handleClose"
        >
          关闭
        </button>
      </div>
    </div>
  </Transition>

  <!-- 模板变量填写对话框 -->
  <TemplateVariablesDialog
    v-model="showVariablesDialog"
    :variables="templateVariables"
    :title="`填写变量 - ${selectedTemplate?.name || ''}`"
    @confirm="handleVariablesConfirm"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { message } from '@/design-system/services'
import { templateApi, type Template, type TemplateVariable, type TemplateType } from '../api/template'
import TemplateVariablesDialog from './TemplateVariablesDialog.vue'

/**
 * Props定义
 */
interface Props {
  modelValue: boolean // 控制显示/隐藏
  projectId: string
  workspaceId: string
  documentId?: string // 当前文档ID（用于应用模板）
}

const props = withDefaults(defineProps<Props>(), {
  documentId: undefined
})

/**
 * Emits定义
 */
interface Emits {
  'update:modelValue': [value: boolean]
  applied: [content: string] // 模板应用成功后触发，传递渲染后的内容
  create: []
  edit: [templateId: string]
}

const emit = defineEmits<Emits>()

/**
 * 模板类型选项
 */
const templateTypes = [
  { label: '全部', value: 'all' },
  { label: '章节', value: 'chapter' },
  { label: '大纲', value: 'outline' },
  { label: '设定', value: 'setting' }
] as const

/**
 * 搜索关键词
 */
const searchQuery = ref('')

/**
 * 选中的类型
 */
const selectedType = ref<string>('all')

/**
 * 模板列表
 */
const templates = ref<Template[]>([])

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 变量对话框显示状态
 */
const showVariablesDialog = ref(false)

/**
 * 当前选中的模板
 */
const selectedTemplate = ref<Template | null>(null)

/**
 * 模板变量列表
 */
const templateVariables = ref<TemplateVariable[]>([])

/**
 * 过滤后的模板
 */
const filteredTemplates = computed(() => {
  return templates.value.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchType = selectedType.value === 'all' || t.type === selectedType.value
    return matchSearch && matchType
  })
})

/**
 * 获取类型标签
 */
function getTypeLabel(type: TemplateType): string {
  const labels = {
    chapter: '章节',
    outline: '大纲',
    setting: '设定'
  }
  return labels[type]
}

/**
 * 获取类型标签样式类
 */
function getTypeLabelClass(type: TemplateType): string {
  const classes = {
    chapter: 'bg-green-100 text-green-700',
    outline: 'bg-purple-100 text-purple-700',
    setting: 'bg-orange-100 text-orange-700'
  }
  return classes[type]
}

/**
 * 应用模板
 */
async function handleApply(template: Template): Promise<void> {
  if (!props.documentId) {
    message.warning('请先选择文档')
    return
  }

  selectedTemplate.value = template

  if (template.variables && template.variables.length > 0) {
    // 有变量，打开填写对话框
    templateVariables.value = template.variables
    showVariablesDialog.value = true
  } else {
    // 无变量，直接应用
    await applyTemplateToDocument(template.id, {})
  }
}

/**
 * 处理变量对话框确认
 */
async function handleVariablesConfirm(variables: Record<string, string>): Promise<void> {
  if (!selectedTemplate.value || !props.documentId) return

  await applyTemplateToDocument(selectedTemplate.value.id, variables)
  showVariablesDialog.value = false
}

/**
 * 应用模板到文档
 */
async function applyTemplateToDocument(
  templateId: string,
  variables: Record<string, string>
): Promise<void> {
  try {
    const result = await templateApi.applyTemplate(templateId, {
      documentId: props.documentId!,
      variables
    })

    // 触发applied事件，传递渲染后的内容
    emit('applied', (result as unknown as { renderedContent: string }).renderedContent)
    message.success('模板应用成功')

    // 关闭面板
    emit('update:modelValue', false)
  } catch (error) {
    console.error('应用模板失败:', error)
    message.error('应用模板失败，请稍后重试')
  }
}

/**
 * 创建模板
 */
function handleCreate(): void {
  emit('create')
}

/**
 * 编辑模板
 */
function handleEdit(template: Template): void {
  emit('edit', template.id)
}

/**
 * 处理关闭
 */
function handleClose(): void {
  emit('update:modelValue', false)
}

/**
 * 加载模板列表
 */
async function loadTemplates(): Promise<void> {
  loading.value = true
  try {
    const response = await templateApi.list({
      projectId: props.projectId
    })
    templates.value = (response as unknown as { templates: Template[] }).templates
  } catch (error) {
    console.error('加载模板列表失败:', error)
    message.error('加载模板列表失败，请稍后重试')
    templates.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 监听面板打开，加载模板列表
 */
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      loadTemplates()
    }
  }
)

/**
 * 组件挂载时加载模板列表（如果面板初始是打开的）
 */
onMounted(() => {
  if (props.modelValue) {
    loadTemplates()
  }
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

/* 右侧滑入动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
