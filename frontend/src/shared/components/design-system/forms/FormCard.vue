<template>
  <el-card :class="cardClasses" :shadow="shadow">
    <template #header v-if="$slots.header || title">
      <div class="qy-form-card__header">
        <slot name="header">
          <h3 class="qy-form-card__title">{{ title }}</h3>
          <p v-if="description" class="qy-form-card__description">{{ description }}</p>
        </slot>
      </div>
    </template>

    <div class="qy-form-card__content">
      <slot />
    </div>

    <template #footer v-if="$slots.footer || showFooter">
      <div class="qy-form-card__footer">
        <slot name="footer">
          <el-button @click="handleCancel" v-if="showCancel">{{ cancelText }}</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">{{ submitText }}</el-button>
        </slot>
      </div>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  description?: string
  shadow?: 'always' | 'hover' | 'never'
  showFooter?: boolean
  showCancel?: boolean
  submitText?: string
  cancelText?: string
  loading?: boolean
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'hover',
  showFooter: true,
  showCancel: true,
  submitText: '提交',
  cancelText: '取消',
  loading: false,
  bordered: false
})

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

const cardClasses = computed(() => {
  return [
    'qy-form-card',
    {
      'qy-form-card--bordered': props.bordered
    }
  ]
})

const handleSubmit = () => {
  emit('submit')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped lang="scss">
.qy-form-card {
  margin-bottom: 1.5rem;
}

.qy-form-card--bordered {
  border: 1px solid #E0E0E0;
}

.qy-form-card__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qy-form-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #212121;
  margin: 0;
}

.qy-form-card__description {
  font-size: 0.875rem;
  color: #757575;
  margin: 0;
}

.qy-form-card__content {
  padding: 0.5rem 0;
}

.qy-form-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

:deep(.el-card__header) {
  padding: 1.25rem 1.5rem;
  background-color: #FAFAFA;
  border-bottom: 1px solid #E0E0E0;
}

:deep(.el-card__body) {
  padding: 1.5rem;
}

:deep(.el-card__footer) {
  padding: 1rem 1.5rem;
  background-color: #FAFAFA;
  border-top: 1px solid #E0E0E0;
}
</style>

