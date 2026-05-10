<template>
  <Transition name="fade">
    <div
      v-if="visible"
      :class="overlayClasses"
      :style="{ backgroundColor: background }"
      @click="handleClick"
    >
      <div class="flex flex-col items-center gap-4" @click.stop>
        <QyIcon
          name="Loading"
          :size="iconSize"
          class="animate-spin text-blue-500"
        />
        <p v-if="text" class="m-0 text-sm text-slate-500">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyIcon } from '@/design-system/components'

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
  closeOnClick: false,
})

const emit = defineEmits<{
  close: []
}>()

const overlayClasses = computed(() => [
  'inset-0 z-[1000] flex items-center justify-center',
  props.fullscreen ? 'fixed' : 'absolute',
])

const handleClick = () => {
  if (props.closeOnClick) {
    emit('close')
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
