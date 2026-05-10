<template>
  <QyDialog
    v-model:visible="dialogVisible"
    :title="title"
    size="md"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    @closed="handleClose"
  >
    <div class="flex gap-4 py-2">
      <div
        v-if="showIcon"
        class="shrink-0"
      >
        <QyIcon :name="iconName" :size="40" :class="iconClass" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="m-0 mb-2 text-base font-medium text-slate-800">{{ message }}</p>
        <p v-if="description" class="m-0 text-sm leading-6 text-slate-500">{{ description }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <QyButton v-if="showCancel" variant="secondary" @click="handleCancel">
          {{ cancelText }}
        </QyButton>
        <QyButton :variant="confirmVariant" :loading="loading" @click="handleConfirm">
          {{ confirmText }}
        </QyButton>
      </div>
    </template>
  </QyDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QyButton, QyDialog, QyIcon } from '@/design-system/components'

interface Props {
  visible?: boolean
  title?: string
  message: string
  description?: string
  type?: 'warning' | 'info' | 'success' | 'danger'
  showIcon?: boolean
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  confirmType?: 'primary' | 'success' | 'warning' | 'danger'
  loading?: boolean
  width?: string
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '确认',
  type: 'warning',
  showIcon: true,
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  confirmType: 'primary',
  loading: false,
  width: '420px',
  closeOnClickModal: false,
  closeOnPressEscape: true,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
  cancel: []
  close: []
}>()

const dialogVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    dialogVisible.value = value
  },
)

watch(dialogVisible, (value) => {
  emit('update:visible', value)
})

const iconName = computed(() => {
  const iconMap: Record<NonNullable<Props['type']>, string> = {
    warning: 'Warning',
    info: 'InfoFilled',
    success: 'CircleCheckFilled',
    danger: 'WarningFilled',
  }

  return iconMap[props.type]
})

const iconClass = computed(() => {
  const colorMap: Record<NonNullable<Props['type']>, string> = {
    warning: 'text-amber-500',
    info: 'text-sky-500',
    success: 'text-emerald-500',
    danger: 'text-rose-500',
  }

  return colorMap[props.type]
})

const confirmVariant = computed(() => {
  const variantMap: Record<NonNullable<Props['confirmType']>, 'primary' | 'danger'> = {
    primary: 'primary',
    success: 'primary',
    warning: 'primary',
    danger: 'danger',
  }

  return variantMap[props.confirmType]
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

const handleClose = () => {
  emit('close')
}
</script>
