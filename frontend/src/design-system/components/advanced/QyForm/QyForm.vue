<template>
  <form :class="formClasses" @submit.prevent="handleSubmit">
    <slot />
  </form>
</template>

<script setup lang="ts">
/**
 * QyForm 表单容器组件
 *
 * Qingyu 风格的表单容器组件，提供完整的表单数据管理和验证功能
 * 与 Element Plus Form API 兼容
 */

import { computed, provide, reactive, ref, watch } from 'vue'
import type { QyFormProps, QyFormEmits, QyFormInstance, QyFormItemInstance } from './types'

// 组件 Props
const props = withDefaults(defineProps<QyFormProps>(), {
  modelValue: () => ({}),
  rules: () => ({}),
  labelWidth: '100px',
  labelPosition: 'top',
})

// 组件 Emits
const emit = defineEmits<QyFormEmits>()

// 表单数据模型（响应式）
const formModel = computed(() => props.modelValue)

// 存储所有注册的 FormItem 实例
const fields = ref<Map<string, QyFormItemInstance>>(new Map())

// 表单验证状态
const validating = ref(false)

// 表单上下文
const formContext = reactive({
  model: formModel.value,
  rules: props.rules,
  labelWidth: props.labelWidth,
  labelPosition: props.labelPosition,
  registerItem,
  unregisterItem,
  validateField,
  clearFieldValidation,
})

// 提供表单上下文给子组件
provide('qyFormContext', formContext)

// 计算表单样式类名
const formClasses = computed(() => {
  return [
    'qy-form',
    `qy-form--${props.labelPosition}`,
  ].filter(Boolean).join(' ')
})

// 注册表单项
function registerItem(prop: string, item: QyFormItemInstance) {
  if (prop) {
    fields.value.set(prop, item)
  }
}

// 注销表单项
function unregisterItem(prop: string) {
  if (prop) {
    fields.value.delete(prop)
  }
}

// 验证单个字段
async function validateField(prop: string): Promise<boolean> {
  const item = fields.value.get(prop)
  if (!item) {
    console.warn(`[QyForm] Field "${prop}" not found`)
    return false
  }

  try {
    return await item.validate()
  } catch (error) {
    console.error(`[QyForm] Failed to validate field "${prop}":`, error)
    return false
  }
}

// 清除字段验证
function clearFieldValidation(prop: string): void {
  const item = fields.value.get(prop)
  if (item) {
    item.clearValidation()
  }
}

// 验证整个表单
async function validate(): Promise<boolean> {
  if (validating.value) {
    return false
  }

  validating.value = true

  try {
    const errors: Record<string, string[]> = {}
    const fieldKeys = Array.from(fields.value.keys())

    if (fieldKeys.length === 0) {
      emit('validate', true)
      return true
    }

    // 并行验证所有字段
    const results = await Promise.allSettled(
      fieldKeys.map(async (prop) => {
        const item = fields.value.get(prop)
        if (!item) {
          return { prop, valid: true }
        }

        try {
          const valid = await item.validate()
          return { prop, valid }
        } catch (error: any) {
          return { prop, valid: false, error: error.message || 'Validation failed' }
        }
      })
    )

    // 收集验证结果
    let hasError = false
    results.forEach((result, index) => {
      const prop = fieldKeys[index]
      if (result.status === 'fulfilled') {
        if (!result.value.valid) {
          hasError = true
          if (result.value.error) {
            errors[prop] = [result.value.error]
          }
        }
      } else {
        hasError = true
        errors[prop] = [result.reason?.message || 'Validation failed']
      }
    })

    if (hasError) {
      emit('validate', false)
      return false
    }

    emit('validate', true)
    return true
  } finally {
    validating.value = false
  }
}

// 验证指定字段
async function validateFields(props: string | string[]): Promise<boolean> {
  const propArray = Array.isArray(props) ? props : [props]

  try {
    const results = await Promise.all(
      propArray.map(prop => validateField(prop))
    )

    return results.every(valid => valid)
  } catch (error) {
    console.error('[QyForm] Failed to validate fields:', error)
    return false
  }
}

// 重置表单
function resetFields(): void {
  fields.value.forEach((item) => {
    item.resetField()
  })
}

// 清除验证
function clearValidation(props?: string | string[]): void {
  if (props) {
    const propArray = Array.isArray(props) ? props : [props]
    propArray.forEach(prop => clearFieldValidation(prop))
  } else {
    fields.value.forEach((item) => {
      item.clearValidation()
    })
  }
}

// 提交表单
function handleSubmit(event: Event) {
  emit('submit', event)
}

// 暴露的方法
const formInstance: QyFormInstance = {
  validate,
  validateFields,
  resetFields,
  clearValidation,
}

// 暴露给父组件
defineExpose(formInstance)

// 监听 modelValue 变化，同步到 formContext
watch(
  () => props.modelValue,
  (newModel) => {
    formContext.model = newModel || {}
  },
  { deep: true }
)

// 监听 rules 变化
watch(
  () => props.rules,
  (newRules) => {
    formContext.rules = newRules || {}
  },
  { deep: true }
)
</script>

<style scoped>
.qy-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qy-form--left {
  gap: 0.75rem;
}

.qy-form--top {
  gap: 1rem;
}

.qy-form--right {
  gap: 0.75rem;
}
</style>
