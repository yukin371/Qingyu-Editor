<template>
  <transition name="fade">
    <div v-if="visible" :class="overlayClasses" @click="handleClick">
      <div class="qy-loading-overlay__content" @click.stop>
        <el-icon class="qy-loading-overlay__icon" :size="iconSize">
          <Loading />
        </el-icon>
        <p v-if="text" class="qy-loading-overlay__text">{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'

interface Props {
  visible?: boolean
  text?: string
  iconSize?: number
  fullscreen?: boolean
  background?: string
  closeOnClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  iconSize: 48,
  fullscreen: false,
  background: 'rgba(255, 255, 255, 0.9)',
  closeOnClick: false
})

const emit = defineEmits<{
  close: []
}>()

const overlayClasses = computed(() => {
  return [
    'qy-loading-overlay',
    {
      'qy-loading-overlay--fullscreen': props.fullscreen
    }
  ]
})

const handleClick = () => {
  if (props.closeOnClick) {
    emit('close')
  }
}
</script>

<style scoped lang="scss">
.qy-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: v-bind(background);
  z-index: 1000;
}

.qy-loading-overlay--fullscreen {
  position: fixed;
}

.qy-loading-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.qy-loading-overlay__icon {
  color: #2196F3;
  animation: rotate 1s linear infinite;
}

.qy-loading-overlay__text {
  font-size: 0.875rem;
  color: #757575;
  margin: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

