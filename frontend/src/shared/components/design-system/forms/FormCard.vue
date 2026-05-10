<template>
  <QyCard
    :shadow="shadow"
    :class="cardClasses"
    variant="default"
    padding="md"
  >
    <template v-if="$slots.header || title" #header>
      <div class="flex flex-col gap-2">
        <slot name="header">
          <h3 class="m-0 text-lg font-semibold text-slate-800">{{ title }}</h3>
          <p v-if="description" class="m-0 text-sm text-slate-500">{{ description }}</p>
        </slot>
      </div>
    </template>

    <div class="py-2">
      <slot />
    </div>

    <template v-if="$slots.footer || showFooter" #footer>
      <div class="flex justify-end gap-3">
        <slot name="footer">
          <QyButton v-if="showCancel" variant="secondary" @click="handleCancel">
            {{ cancelText }}
          </QyButton>
          <QyButton variant="primary" :loading="loading" @click="handleSubmit">
            {{ submitText }}
          </QyButton>
        </slot>
      </div>
    </template>
  </QyCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyButton, QyCard } from '@/design-system/components'

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
  bordered: false,
})

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

const cardClasses = computed(() =>
  ['mb-6', props.bordered ? 'border border-slate-200' : ''].filter(Boolean).join(' '),
)

const handleSubmit = () => {
  emit('submit')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
