<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    @close="handleClose"
  >
    <div class="qy-confirm-dialog__content">
      <el-icon v-if="showIcon" :class="iconClass" :size="48">
        <component :is="iconComponent" />
      </el-icon>
      <div class="qy-confirm-dialog__message">
        <p class="qy-confirm-dialog__text">{{ message }}</p>
        <p v-if="description" class="qy-confirm-dialog__description">{{ description }}</p>
      </div>
    </div>

    <template #footer>
      <div class="qy-confirm-dialog__footer">
        <el-button @click="handleCancel" v-if="showCancel">{{ cancelText }}</el-button>
        <el-button :type="confirmType" @click="handleConfirm" :loading="loading">
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { WarningFilled, InfoFilled, SuccessFilled } from '@element-plus/icons-vue'

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
  closeOnPressEscape: true
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
  cancel: []
  close: []
}>()

const dialogVisible = ref(props.visible)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const iconComponent = computed(() => {
  const icons = {
    warning: WarningFilled,
    info: InfoFilled,
    success: SuccessFilled,
    danger: WarningFilled
  }
  return icons[props.type]
})

const iconClass = computed(() => {
  return [
    'qy-confirm-dialog__icon',
    `qy-confirm-dialog__icon--${props.type}`
  ]
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

<style scoped lang="scss">
.qy-confirm-dialog__content {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
}

.qy-confirm-dialog__icon {
  flex-shrink: 0;
}

.qy-confirm-dialog__icon--warning {
  color: #FF9800;
}

.qy-confirm-dialog__icon--info {
  color: #03A9F4;
}

.qy-confirm-dialog__icon--success {
  color: #4CAF50;
}

.qy-confirm-dialog__icon--danger {
  color: #F44336;
}

.qy-confirm-dialog__message {
  flex: 1;
}

.qy-confirm-dialog__text {
  font-size: 1rem;
  font-weight: 500;
  color: #212121;
  margin: 0 0 0.5rem 0;
}

.qy-confirm-dialog__description {
  font-size: 0.875rem;
  color: #757575;
  margin: 0;
}

.qy-confirm-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>

