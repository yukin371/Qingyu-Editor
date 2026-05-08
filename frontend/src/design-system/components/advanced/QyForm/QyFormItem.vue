<template>
  <div :class="itemClasses">
    <!-- Label -->
    <label
      v-if="label"
      :class="labelClasses"
      :style="{ width: computedLabelWidth }"
    >
      <span v-if="required" class="qy-form-item__required">*</span>
      {{ label }}
    </label>

    <!-- Content -->
    <div class="qy-form-item__content">
      <slot />

      <!-- Error Message -->
      <p v-if="errorMessage" class="qy-form-item__error">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, watch } from 'vue'
import type { QyFormItemProps } from './types'

// Props
const props = withDefaults(defineProps<QyFormItemProps>(), {
  prop: '',
  label: '',
  labelWidth: '',
  required: false,
  error: ''
})

// Inject form context
const formContext = inject<any>('qyForm', {
  model: {},
  rules: {},
  labelWidth: '100px',
  labelPosition: 'top',
  updateModel: () => {}
})

// Local error state
const localError = ref('')

// Compute label width
const computedLabelWidth = computed(() => {
  return props.labelWidth || formContext.labelWidth
})

// Compute label position
const labelPosition = computed(() => {
  return formContext.labelPosition || 'top'
})

// Compute item classes
const itemClasses = computed(() => {
  const classes = [
    'qy-form-item',
    `qy-form-item--${labelPosition.value}`
  ]
  return classes.join(' ')
})

// Compute label classes
const labelClasses = computed(() => {
  const classes = [
    'qy-form-item__label',
    labelPosition.value !== 'top' && 'qy-form-item__label--inline'
  ]
  return classes.filter(Boolean).join(' ')
})

// Compute error message
const errorMessage = computed(() => {
  return props.error || localError.value
})

// Validate field
const validateField = () => {
  if (!props.prop || !formContext.rules) {
    return true
  }

  const rules = formContext.rules[props.prop]
  if (!rules || !Array.isArray(rules)) {
    return true
  }

  const value = formContext.model[props.prop]

  // Check each rule
  for (const rule of rules) {
    // Required validation
    if (rule.required && (!value || value === '')) {
      localError.value = rule.message || `${props.label} is required`
      return false
    }

    // Min length
    if (rule.min && value && value.length < rule.min) {
      localError.value = rule.message || `${props.label} must be at least ${rule.min} characters`
      return false
    }

    // Max length
    if (rule.max && value && value.length > rule.max) {
      localError.value = rule.message || `${props.label} must be no more than ${rule.max} characters`
      return false
    }

    // Pattern validation
    if (rule.pattern && value && !rule.pattern.test(value)) {
      localError.value = rule.message || `${props.label} format is invalid`
      return false
    }

    // Custom validator
    if (rule.validator && value) {
      const result = rule.validator(value)
      if (result === false) {
        localError.value = rule.message || `${props.label} validation failed`
        return false
      } else if (typeof result === 'string') {
        localError.value = result
        return false
      }
    }
  }

  // Clear error if validation passed
  localError.value = ''
  return true
}

// Watch for external error changes
watch(() => props.error, (newError) => {
  if (!newError) {
    localError.value = ''
  }
})

// Expose validation method
defineExpose({
  validate: validateField
})
</script>

<style scoped>
.qy-form-item {
  display: flex;
  flex-direction: column;
}

.qy-form-item--left,
.qy-form-item--right {
  flex-direction: row;
  align-items: flex-start;
}

.qy-form-item--right {
  flex-direction: row-reverse;
}

.qy-form-item__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(51 65 85);
  margin-bottom: 0.25rem;
}

.qy-form-item__label--inline {
  flex-shrink: 0;
  margin-bottom: 0;
  padding-top: 0.5rem;
}

.qy-form-item--right .qy-form-item__label--inline {
  text-align: right;
  padding-left: 1rem;
}

.qy-form-item__required {
  color: rgb(239 68 68);
  margin-right: 0.25rem;
}

.qy-form-item__content {
  flex: 1;
  width: 100%;
}

.qy-form-item__error {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: rgb(239 68 68);
}
</style>
