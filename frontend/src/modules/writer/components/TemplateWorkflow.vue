<template>
  <!-- 可选：显示"应用模板"按钮 -->
  <button
    v-if="showButton"
    type="button"
    class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium flex items-center gap-2"
    @click="handleOpenTemplateManager"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
    </svg>
    {{ buttonText }}
  </button>

  <!-- 模板管理面板 -->
  <TemplateManagerPanel
    v-model="showTemplateManager"
    :project-id="projectId"
    :workspace-id="workspaceId"
    :document-id="documentId"
    @applied="handleTemplateApplied"
  />

  <!-- 模板变量填写对话框 -->
  <TemplateVariablesDialog
    v-model="showVariablesDialog"
    :variables="templateVariables"
    :title="`填写变量 - ${selectedTemplate?.name || ''}`"
    @confirm="handleVariablesConfirm"
  />

  <!-- 可选：模板预览对话框 -->
  <TemplatePreview
    v-if="selectedTemplate"
    v-model="showPreviewDialog"
    :template="{
      content: selectedTemplate.content || '',
      variables: selectedTemplate.variables || []
    }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from '@/design-system/services'
import { templateApi, type Template, type TemplateVariable } from '../api/template'
import TemplateManagerPanel from './TemplateManagerPanel.vue'
import TemplateVariablesDialog from './TemplateVariablesDialog.vue'
import TemplatePreview from './TemplatePreview.vue'

/**
 * Props定义
 */
interface Props {
  projectId: string
  workspaceId: string
  documentId: string
  showButton?: boolean // 是否显示"应用模板"按钮
  buttonText?: string // 按钮文字，默认"应用模板"
}

const props = withDefaults(defineProps<Props>(), {
  showButton: true,
  buttonText: '应用模板'
})

/**
 * Emits定义
 */
interface Emits {
  applied: [content: string] // 模板应用成功后，返回渲染后的内容
}

const emit = defineEmits<Emits>()

/**
 * 状态管理
 */
const showTemplateManager = ref(false)
const showVariablesDialog = ref(false)
const showPreviewDialog = ref(false)
const selectedTemplate = ref<Template | null>(null)
const templateVariables = ref<TemplateVariable[]>([])

/**
 * 1. 用户点击"应用模板"按钮
 */
function handleOpenTemplateManager(): void {
  showTemplateManager.value = true
}

/**
 * 2. 在TemplateManagerPanel中应用模板
 * 注意：TemplateManagerPanel已经处理了变量填写和应用逻辑
 * 这里只需要监听applied事件并转发
 */
function handleTemplateApplied(content: string): void {
  // 直接转发应用成功的事件
  emit('applied', content)
}

/**
 * 3. 用户填写变量（如果需要独立处理变量填写流程）
 * 注意：当前TemplateManagerPanel已经集成了变量填写逻辑
 * 这个函数保留用于未来可能的独立使用场景
 */
async function handleVariablesConfirm(variables: Record<string, string>): Promise<void> {
  if (!selectedTemplate.value) return

  await applyTemplate(selectedTemplate.value.id, variables)
  showVariablesDialog.value = false
}

/**
 * 4. 应用模板（如果需要独立处理应用逻辑）
 * 注意：当前TemplateManagerPanel已经集成了应用逻辑
 * 这个函数保留用于未来可能的独立使用场景
 */
async function applyTemplate(templateId: string, variables: Record<string, string>): Promise<void> {
  try {
    const result = await templateApi.applyTemplate(templateId, {
      documentId: props.documentId,
      variables
    })

    emit('applied', (result as unknown as { renderedContent: string }).renderedContent)
    message.success('模板应用成功')

    // 关闭所有对话框
    showTemplateManager.value = false
    showVariablesDialog.value = false
    showPreviewDialog.value = false
  } catch (error) {
    console.error('应用模板失败:', error)
    message.error('应用模板失败')
  }
}

</script>

