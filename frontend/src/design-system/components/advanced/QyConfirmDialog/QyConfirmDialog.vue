<template>
  <QyModal
    :visible="visible"
    :width="width"
    :closable="false"
    :mask-closable="false"
    @update:visible="handleClose"
  >
    <!-- Header -->
    <template #header>
      <div class="qy-confirm-dialog__header">
        <QyIcon
          v-if="showIcon"
          :name="iconName"
          :class="`qy-confirm-dialog__icon qy-confirm-dialog__icon--${type}`"
        />
        <h3 class="qy-confirm-dialog__title">{{ title }}</h3>
      </div>
    </template>

    <!-- Content -->
    <div class="qy-confirm-dialog__content">
      <p class="qy-confirm-dialog__message">{{ message }}</p>
      <div v-if="details" class="qy-confirm-dialog__details">
        <div v-for="(detail, index) in details" :key="index" class="detail-item">
          <span class="detail-label">{{ detail.label }}:</span>
          <span class="detail-value">{{ detail.value }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="qy-confirm-dialog__footer">
        <el-button
          :type="cancelButtonType"
          :size="size"
          @click="handleCancel"
        >
          {{ cancelText }}
        </el-button>
        <el-button
          :type="confirmButtonType"
          :size="size"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </QyModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import QyModal from '../QyModal/QyModal.vue'
import QyIcon from '../../basic/QyIcon/QyIcon.vue'
import type { QyConfirmDialogProps, QyConfirmDialogEmits } from './types'

// Props
const props = withDefaults(defineProps<QyConfirmDialogProps>(), {
  visible: false,
  title: '确认',
  message: '',
  type: 'warning',
  showIcon: true,
  confirmText: '确认',
  cancelText: '取消',
  width: '450px',
  size: 'default',
  loading: false,
  details: () => []
})

// Emits
const emit = defineEmits<QyConfirmDialogEmits>()

// Icon name based on type
const iconName = computed(() => {
  const iconMap: Record<string, string> = {
    warning: 'Warning',
    danger: 'Warning',
    info: 'Info',
    success: 'Check'
  }
  return iconMap[props.type] || 'Warning'
})

// Confirm button type based on dialog type
const confirmButtonType = computed(() => {
  const typeMap: Record<string, any> = {
    warning: 'primary',
    danger: 'danger',
    info: 'primary',
    success: 'success'
  }
  return typeMap[props.type] || 'primary'
})

// Cancel button type
const cancelButtonType = computed(() => {
  return props.type === 'danger' ? 'default' : 'info'
})

// Handle confirm
const handleConfirm = () => {
  emit('confirm')
}

// Handle cancel
const handleCancel = () => {
  emit('cancel')
  handleClose()
}

// Handle close
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.qy-confirm-dialog__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qy-confirm-dialog__icon {
  font-size: 24px;
  flex-shrink: 0;
}

.qy-confirm-dialog__icon--warning {
  color: #e6a23c;
}

.qy-confirm-dialog__icon--danger {
  color: #f56c6c;
}

.qy-confirm-dialog__icon--info {
  color: #409eff;
}

.qy-confirm-dialog__icon--success {
  color: #67c23a;
}

.qy-confirm-dialog__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.qy-confirm-dialog__content {
  padding: 12px 0;
}

.qy-confirm-dialog__message {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.qy-confirm-dialog__details {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 12px;
}

.qy-confirm-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;

  &:not(:last-child) {
    border-bottom: 1px solid #ebeef5;
  }

  .detail-label {
    color: #909399;
    font-weight: 500;
  }

  .detail-value {
    color: #303133;
    font-weight: 600;
  }
}
</style>
