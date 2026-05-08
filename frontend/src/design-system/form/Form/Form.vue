<script setup lang="ts">
/**
 * Form 组件
 *
 * 表单容器组件，提供表单数据管理和验证功能
 */

import { computed, provide, reactive, ref, watch } from 'vue'
import type { FormContext, FormEmits, FormInstance, FormItemInstance, FormProps, FormModel } from './types'
import { formDefaults } from './types'

// 组件 Props
const props = withDefaults(defineProps<FormProps>(), formDefaults)

// 组件 Emits
const emit = defineEmits<FormEmits>()

// 表单数据模型（响应式）
const formModel = computed(() => props.model || {})

// 存储所有注册的 FormItem 实例
const fields = ref<Map<string, FormItemInstance>>(new Map())

// 表单验证状态
const validating = ref(false)

// 表单上下文
const formContext: FormContext = reactive({
  model: formModel.value,
  rules: props.rules,
  labelWidth: props.labelWidth || 'auto',
  labelPosition: props.labelPosition || 'right',
  size: props.size || 'md',
  disabled: props.disabled || false,
  showColon: props.showColon !== false,
  requireAsterisk: props.requireAsterisk !== false,
  registerItem,
  unregisterItem,
  validateField,
  clearFieldValidation,
})

// 提供表单上下文给子组件
provide('FormContext', formContext)

// 注册表单项
function registerItem(prop: string, item: FormItemInstance) {
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
    console.warn(`[Form] Field "${prop}" not found`)
    return false
  }

  try {
    return await item.validate()
  } catch (error) {
    console.error(`[Form] Failed to validate field "${prop}":`, error)
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
      emit('validate')
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
      const _prop = fieldKeys[index]
      if (result.status === 'fulfilled') {
        if (!result.value.valid) {
          hasError = true
          if (result.value.error) {
            errors[_prop] = [result.value.error]
          }
        }
      } else {
        hasError = true
        errors[_prop] = [result.reason?.message || 'Validation failed']
      }
    })

    if (hasError) {
      emit('validate-failed', errors)
      return false
    }

    emit('validate')
    return true
  } finally {
    validating.value = false
  }
}

// 验证指定字段
async function validateFields(props: string | string[]): Promise<boolean> {
  const propArray = Array.isArray(props) ? props : [props]
  
  try {
    const results = await Promise.allSettled(
      propArray.map((prop) => validateField(prop))
    )

    return results.every((result) => 
      result.status === 'fulfilled' && result.value === true
    )
  } catch {
    return false
  }
}

// 重置表单
function resetFields(): void {
  fields.value.forEach((item, _prop) => {
    item.resetField()
  })
}

// 清除验证
function clearValidation(props?: string | string[]): void {
  if (!props) {
    // 清除所有验证
    fields.value.forEach((item) => {
      item.clearValidation()
    })
  } else {
    // 清除指定字段验证
    const propArray = Array.isArray(props) ? props : [props]
    propArray.forEach((prop) => {
      clearFieldValidation(prop)
    })
  }
}

// 获取表单数据
function getFormData(): FormModel {
  return { ...formModel.value }
}

// 设置表单数据
function setFormData(data: Partial<FormModel>): void {
  if (props.model) {
    Object.assign(props.model, data)
  }
}

// 监听 model 变化，更新上下文
watch(
  () => props.model,
  (newModel) => {
    formContext.model = newModel || {}
  },
  { deep: true }
)

// 监听 rules 变化
watch(
  () => props.rules,
  (newRules) => {
    formContext.rules = newRules
    
    // 规则变化时验证
    if (props.validateOnRuleChange !== false) {
      validate()
    }
  },
  { deep: true }
)

// 暴露方法
defineExpose<FormInstance>({
  validate,
  validateField: validateFields,
  resetFields,
  clearValidation,
  getFormData,
  setFormData,
})
</script>

<template>
  <form 
    :class="[
      'tw-form',
      props.class
    ]"
    @submit.prevent
  >
    <slot />
  </form>
</template>

<style scoped>
.tw-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
