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
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col"
    >
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      </div>

      <!-- 内容区 -->
      <div class="px-6 py-4 flex-1 overflow-y-auto">
        <!-- 动态表单 -->
        <div class="space-y-4">
          <div
            v-for="variable in sortedVariables"
            :key="variable.name"
            class="space-y-2"
          >
            <!-- 字段标签 -->
            <label :for="`field-${variable.name}`" class="block text-sm font-medium text-gray-700">
              {{ variable.label }}
              <span v-if="variable.required" class="text-red-500 ml-1">*</span>
            </label>

            <!-- 文本输入框 -->
            <input
              v-if="variable.type === 'text'"
              :id="`field-${variable.name}`"
              v-model="formData[variable.name]"
              type="text"
              :placeholder="variable.placeholder || `请输入${variable.label}`"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors text-sm"
              :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors[variable.name] }"
            />

            <!-- 多行文本框 -->
            <textarea
              v-else-if="variable.type === 'textarea'"
              :id="`field-${variable.name}`"
              v-model="formData[variable.name]"
              :placeholder="variable.placeholder || `请输入${variable.label}`"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors text-sm resize-y"
              :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors[variable.name] }"
            />

            <!-- 下拉选择框 -->
            <select
              v-else-if="variable.type === 'select'"
              :id="`field-${variable.name}`"
              v-model="formData[variable.name]"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors text-sm bg-white"
              :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors[variable.name] }"
            >
              <option value="">{{ variable.placeholder || `请选择${variable.label}` }}</option>
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
              :id="`field-${variable.name}`"
              v-model.number="formData[variable.name]"
              type="number"
              :placeholder="variable.placeholder || `请输入${variable.label}`"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors text-sm"
              :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors[variable.name] }"
            />

            <!-- 错误提示 -->
            <p v-if="errors[variable.name]" class="text-sm text-red-600">
              {{ errors[variable.name] }}
            </p>
          </div>

          <!-- 空状态提示 -->
          <div v-if="!variables || variables.length === 0" class="text-center py-8 text-gray-500 text-sm">
            暂无需填写的变量
          </div>
        </div>
      </div>

      <!-- 底部按钮区 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium"
          @click="handleConfirm"
        >
          确定
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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
  variables: TemplateVariable[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '填写变量'
})

interface Emits {
  'update:modelValue': [value: boolean]
  'confirm': [values: Record<string, string>]
  'cancel': []
}

const emit = defineEmits<Emits>()

// 表单数据
const formData = ref<Record<string, string>>({})
const errors = ref<Record<string, string>>({})

/**
 * 排序后的变量列表（按 order 字段排序）
 */
const sortedVariables = computed(() => {
  return [...props.variables].sort((a, b) => a.order - b.order)
})

/**
 * 初始化表单数据
 */
function initFormData(): void {
  formData.value = {}
  errors.value = {}
  props.variables.forEach(v => {
    formData.value[v.name] = v.defaultValue || ''
  })
}

/**
 * 验证表单
 */
function validateForm(): boolean {
  errors.value = {}
  let valid = true

  props.variables.forEach(v => {
    if (v.required && !formData.value[v.name]) {
      errors.value[v.name] = `${v.label}不能为空`
      valid = false
    }
  })

  return valid
}

/**
 * 处理确认
 */
function handleConfirm(): void {
  if (validateForm()) {
    emit('confirm', { ...formData.value })
    handleClose()
  }
}

/**
 * 处理取消
 */
function handleCancel(): void {
  emit('cancel')
  handleClose()
}

/**
 * 处理关闭
 */
function handleClose(): void {
  emit('update:modelValue', false)
}

/**
 * 监听对话框显示状态，初始化表单数据
 */
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    initFormData()
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
