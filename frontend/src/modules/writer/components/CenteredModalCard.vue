<template>
  <Teleport to="body">
    <div v-if="modelValue" class="centered-modal-overlay" @click="handleOverlayClick">
      <div class="centered-modal-card" :style="{ width }" @click.stop>
        <button
          v-if="showClose"
          type="button"
          class="close-btn"
          aria-label="关闭"
          @click="emit('update:modelValue', false)"
        >
          ×
        </button>
        <div class="modal-title">{{ title }}</div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  width?: string
  showClose?: boolean
  closeOnClickModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '420px',
  showClose: false,
  closeOnClickModal: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleOverlayClick = () => {
  if (props.closeOnClickModal) {
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.centered-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  background: rgba(15, 23, 42, 0.28);
}

.centered-modal-card {
  position: relative;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
  padding: 24px;
  max-width: calc(100vw - 24px);
}

.close-btn {
  position: absolute;
  right: 12px;
  top: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
  text-align: center;
}

.modal-body {
  color: #334155;
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
