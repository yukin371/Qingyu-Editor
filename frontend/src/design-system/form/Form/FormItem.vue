<script setup lang="ts">
/**
 * FormItem 组件
 *
 * 表单项组件，负责显示标签、管理验证状态和错误信息
 */

import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import type { FormContext, FormItemEmits, FormItemInstance, FormItemProps, FormRule } from './types'
import { formItemDefaults } from './types'

// 组件 Props
const props = withDefaults(defineProps<FormItemProps>(), formItemDefaults)

// 组件 Emits
const emit = defineEmits<FormItemEmits>()

// 注入表单上下文
const formContext = inject<FormContext>('FormContext', null as any)

// 验证状态
const validateState = ref<'success' | 'error' | 'validating' | ''>('')
const validateMessage = ref('')

// 是否正在进行验证
const isValidating = computed(() => validateState.value === 'validating')

// 是否有错误
const hasError = computed(() => validateState.value === 'error')

// 表单项实例
const formItemInstance: FormItemInstance = {
  validate,
  clearValidation,
  resetField,
  setError,
  getValue,
  setValue,
}

// 计算标签宽度
const computedLabelWidth = computed(() => {
  return props.labelWidth || formContext?.labelWidth || 'auto'
})

// 计算标签位置
const labelPosition = computed(() => {
  return formContext?.labelPosition || 'right'
})

// 计算是否禁用
const isDisabled = computed(() => {
  return props.disabled || formContext?.disabled || false
})

// 计算是否显示必填星号
const showRequireAsterisk = computed(() => {
  if (props.required !== undefined) {
    return props.required
  }
  return hasRequiredRule.value && formContext?.requireAsterisk !== false
})

// 计算是否显示冒号
const showColon = computed(() => {
  return formContext?.showColon !== false
})

// 计算当前字段的值
const fieldValue = computed(() => {
  if (!props.prop || !formContext?.model) {
    return undefined
  }
  return formContext.model[props.prop]
})

// 计算验证规则
const itemRules = computed(() => {
  if (props.rules) {
    return props.rules
  }
  if (props.prop && formContext?.rules && formContext.rules[props.prop]) {
    return formContext.rules[props.prop]
  }
  return []
})

// 计算是否有必填规则
const hasRequiredRule = computed(() => {
  return itemRules.value.some((rule) => rule.required === true)
})

// 计算标签类名
const labelClasses = computed(() => {
  const classes: string[] = ['tw-form-item-label']

  if (labelPosition.value === 'top') {
    classes.push('tw-form-item-label-top')
  } else {
    classes.push('tw-form-item-label-left')
    
    if (labelPosition.value === 'right') {
      classes.push('tw-form-item-label-right')
    }
  }

  if (showRequireAsterisk.value) {
    classes.push('tw-form-item-label-required')
  }

  return classes
})

// 计算内容类名
const contentClasses = computed(() => {
  const classes: string[] = ['tw-form-item-content']

  if (labelPosition.value === 'top') {
    classes.push('tw-form-item-content-top')
  } else {
    classes.push('tw-form-item-content-left')
  }

  if (hasError.value) {
    classes.push('tw-form-item-content-error')
  }

  return classes
})

// 计算错误信息类名
const errorClasses = computed(() => {
  return ['tw-form-item-error']
})

// 获取插槽
const slots = defineSlots<{
  label?: () => any
  default?: () => any
  error?: () => any
}>()

// 验证单个规则
async function validateRule(rule: FormRule, value: any): Promise<string | null> {
  // 必填验证
  if (rule.required && (value === undefined || value === null || value === '')) {
    return rule.message || '该字段为必填项'
  }

  // 如果值为空且非必填，跳过其他验证
  if (value === undefined || value === null || value === '') {
    return null
  }

  // 长度验证
  if (rule.min !== undefined || rule.max !== undefined) {
    const length = Array.isArray(value) ? value.length : String(value).length
    
    if (rule.min !== undefined && length < rule.min) {
      return rule.message || `长度不能小于 ${rule.min}`
    }
    
    if (rule.max !== undefined && length > rule.max) {
      return rule.message || `长度不能大于 ${rule.max}`
    }
  }

  // 精确长度验证
  if (rule.len !== undefined) {
    const length = Array.isArray(value) ? value.length : String(value).length
    
    if (length !== rule.len) {
      return rule.message || `长度必须为 ${rule.len}`
    }
  }

  // 正则验证
  if (rule.pattern) {
    if (!rule.pattern.test(String(value))) {
      return rule.message || '格式不正确'
    }
  }

  // 自定义验证器
  if (rule.validator) {
    try {
      const result = await rule.validator(rule, value)
      
      if (result === false || (typeof result === 'string' && result)) {
        return typeof result === 'string' ? result : rule.message || '验证失败'
      }
    } catch (error: any) {
      return error.message || rule.message || '验证失败'
    }
  }

  return null
}

// 验证表单项
async function validate(): Promise<boolean> {
  if (!props.prop) {
    return true
  }

  validateState.value = 'validating'
  validateMessage.value = ''

  const rules = itemRules.value
  if (rules.length === 0) {
    validateState.value = 'success'
    emit('validate')
    return true
  }

  try {
    const value = fieldValue.value

    // 依次验证所有规则
    for (const rule of rules) {
      const error = await validateRule(rule, value)
      
      if (error) {
        validateState.value = 'error'
        validateMessage.value = error
        emit('validate-failed', error)
        return false
      }
    }

    validateState.value = 'success'
    validateMessage.value = ''
    emit('validate')
    return true
  } catch (error: any) {
    validateState.value = 'error'
    validateMessage.value = error.message || '验证失败'
    emit('validate-failed', error.message)
    return false
  }
}

// 清除验证
function clearValidation(): void {
  validateState.value = ''
  validateMessage.value = ''
}

// 设置错误信息
function setError(error: string): void {
  validateState.value = 'error'
  validateMessage.value = error
}

// 获取当前值
function getValue(): any {
  return fieldValue.value
}

// 设置值
function setValue(value: any): void {
  if (props.prop && formContext?.model) {
    formContext.model[props.prop] = value
  }
}

// 重置表单项
function resetField(): void {
  if (props.prop && formContext?.model) {
    formContext.model[props.prop] = undefined
  }
  clearValidation()
}

// 监听外部错误变化
watch(
  () => props.error,
  (newError) => {
    if (newError !== undefined) {
      setError(newError)
    } else {
      clearValidation()
    }
  },
  { immediate: true }
)

// 监听字段值变化，触发验证
watch(
  fieldValue,
  () => {
    if (itemRules.value.length > 0) {
      const shouldValidate = itemRules.value.some((rule) => {
        const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger || 'change']
        return triggers.includes('change')
      })

      if (shouldValidate) {
        validate()
      }
    }
    emit('change', fieldValue.value)
  },
  { deep: true }
)

// 创建 FormItem 上下文，提供给子组件
const formItemContext = {
  fieldValue,
  updateValue: (value: any) => {
    setValue(value)
  },
}

// 向子组件提供 FormItem 上下文
provide('FormItemContext', formItemContext)

// 组件挂载时注册到表单
onMounted(() => {
  if (props.prop && formContext) {
    formContext.registerItem(props.prop, formItemInstance)
  }
})

// 组件卸载时从表单注销
onBeforeUnmount(() => {
  if (props.prop && formContext) {
    formContext.unregisterItem(props.prop)
  }
})

// 暴露方法
defineExpose<FormItemInstance>({
  validate,
  clearValidation,
  resetField,
  setError,
  getValue,
  setValue,
})
</script>

<template>
  <div 
    :class="[
      'tw-form-item',
      {
        'tw-form-item-error': hasError,
        'tw-form-item-validating': isValidating,
        'tw-form-item-disabled': isDisabled,
        'tw-form-item-inline': props.inline,
      },
      props.class
    ]"
  >
    <!-- 标签 -->
    <div
      v-if="props.label || slots.label"
      :class="labelClasses"
      :style="{
        width: labelPosition === 'top' ? '100%' : computedLabelWidth,
      }"
    >
      <slot name="label">
        <span class="tw-form-item-label-text">
          {{ props.label }}
          <span v-if="showRequireAsterisk" class="tw-form-item-asterisk">*</span>
          <span v-if="showColon" class="tw-form-item-colon">:</span>
        </span>
      </slot>
    </div>

    <!-- 内容 -->
    <div :class="contentClasses">
      <slot />

      <!-- 错误信息 -->
      <template v-if="props.showMessage && (validateMessage || props.error || slots.error)">
        <div v-if="slots.error" :class="errorClasses">
          <slot name="error" />
        </div>
        <div v-else-if="validateMessage || props.error" :class="errorClasses">
          <span class="tw-form-item-error-text">{{ validateMessage || props.error }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tw-form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.tw-form-item-inline {
  display: inline-flex;
  margin-right: 1rem;
  margin-bottom: 0;
}

.tw-form-item-label {
  flex-shrink: 0;
  padding-top: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.tw-form-item-label-left {
  display: flex;
}

.tw-form-item-label-left.tw-form-item-label-right {
  justify-content: flex-end;
  text-align: right;
}

.tw-form-item-label-top {
  width: 100%;
  margin-bottom: 0.25rem;
}

.tw-form-item-label-text {
  display: inline-block;
}

.tw-form-item-asterisk {
  color: #ef4444;
  margin-right: 0.25rem;
}

.tw-form-item-colon {
  margin-left: 0.25rem;
}

.tw-form-item-content {
  flex: 1;
  min-width: 0;
}

.tw-form-item-content-left {
  padding-left: 0.75rem;
}

.tw-form-item-content-top {
  padding-left: 0;
  width: 100%;
}

.tw-form-item-content-error :deep(input),
.tw-form-item-content-error :deep(textarea),
.tw-form-item-content-error :deep(select) {
  border-color: #ef4444;
}

.tw-form-item-error {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
  line-height: 1.25rem;
}

.tw-form-item-error-text {
  display: block;
}

/* 验证中状态 */
.tw-form-item-validating :deep(.tw-form-item-error-text)::before {
  content: '验证中...';
  opacity: 0.7;
}

/* 禁用状态 */
.tw-form-item-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
