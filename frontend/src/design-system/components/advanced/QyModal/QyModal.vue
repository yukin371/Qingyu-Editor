<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="qy-modal"
        @click="handleMaskClick"
      >
        <!-- Overlay -->
        <div class="qy-modal__overlay" />

        <!-- Modal Content -->
        <div
          class="qy-modal__content"
          :style="{ width }"
          @click.stop
        >
          <!-- Close Button -->
          <button
            v-if="closable"
            class="qy-modal__close"
            @click="handleClose"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Header Slot -->
          <div v-if="$slots.header || title" class="qy-modal__header">
            <slot name="header">
              <h2 class="qy-modal__title">{{ title }}</h2>
            </slot>
          </div>

          <!-- Default Content -->
          <div class="qy-modal__body">
            <slot />
          </div>

          <!-- Footer Slot -->
          <div v-if="$slots.footer" class="qy-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import type { QyModalProps, QyModalEmits } from './types'

// Props
const props = withDefaults(defineProps<QyModalProps>(), {
  visible: false,
  title: '',
  width: '500px',
  closable: true,
  maskClosable: true
})

// Emits
const emit = defineEmits<QyModalEmits>()

// Handle close
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

// Handle mask click
const handleMaskClick = () => {
  if (props.maskClosable) {
    handleClose()
  }
}

// Handle ESC key
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    handleClose()
  }
}

// Watch visibility changes
watch(() => props.visible, (newValue) => {
  if (newValue) {
    emit('open')
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Mount and unmount
onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.qy-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.qy-modal__overlay {
  position: absolute;
  inset: 0;
  background-color: rgb(15 23 42 / 0.5);
  backdrop-filter: blur(4px);
}

.qy-modal__content {
  position: relative;
  background-color: rgb(255 255 255);
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.qy-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: rgb(100 116 139);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.qy-modal__close:hover {
  background-color: rgb(241 245 249);
  color: rgb(51 65 85);
}

.qy-modal__close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.qy-modal__header {
  margin-bottom: 1rem;
  padding-right: 2rem;
}

.qy-modal__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(30 41 59);
  margin: 0;
}

.qy-modal__body {
  margin-bottom: 1rem;
  color: rgb(71 85 105);
}

.qy-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(226 232 240);
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-active .qy-modal__overlay,
.modal-leave-active .qy-modal__overlay {
  transition: opacity 0.3s ease;
}

.modal-enter-from .qy-modal__overlay {
  opacity: 0;
}

.modal-leave-to .qy-modal__overlay {
  opacity: 0;
}

.modal-enter-from .qy-modal__content {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .qy-modal__content {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-enter-to .qy-modal__content,
.modal-leave-from .qy-modal__content {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
