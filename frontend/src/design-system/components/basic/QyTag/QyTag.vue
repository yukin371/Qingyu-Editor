<template>
  <span
    ref="tagRef"
    :class="['qy-tag', tagClasses]"
    :data-effect="effect"
    :data-type="type"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <slot />
    <button
      v-if="closable"
      type="button"
      class="qy-tag__close"
      :disabled="disabled"
      aria-label="close"
      @click.stop="handleClose"
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M6 6l8 8m0-8l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { tagVariants } from './variants'
import type { QyTagProps, QyTagEmits, QyTagInstance } from './types'

// Props
const props = withDefaults(defineProps<QyTagProps>(), {
  type: 'primary',
  size: 'md',
  effect: 'light',
  round: true,
  hit: false,
  closable: false,
  disabled: false,
})

// Emits
const emit = defineEmits<QyTagEmits>()

// 标签引用
const tagRef = ref<HTMLSpanElement>()

// 计算标签类名
const tagClasses = computed(() => {
  return cn(
    tagVariants({
      type: props.type,
      size: props.size,
      effect: props.effect,
      round: props.round,
      hit: props.hit,
    }),
    {
      'opacity-50 cursor-not-allowed pointer-events-none': props.disabled,
      'shadow-[0_8px_18px_-14px_rgba(15,23,42,0.35)]':
        props.effect === 'light' && props.type === 'primary',
      'hover:shadow-lg': !props.disabled,
    },
    props.class,
  )
})

// 处理关闭事件
const handleClose = () => {
  if (!props.disabled) {
    emit('close')
  }
}

// 暴露方法给父组件
defineExpose<QyTagInstance>({
  focus: () => tagRef.value?.focus(),
  blur: () => tagRef.value?.blur(),
})
</script>

<style scoped>
.qy-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.58)) 86%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--editor-bg-elevated, #fff) 68%, transparent);
  color: currentColor;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}

.qy-tag__close:hover {
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.8)) 92%, transparent);
  transform: scale(1.1);
}

.qy-tag__close:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.qy-tag__close svg {
  width: 0.7rem;
  height: 0.7rem;
}

.qy-tag[data-effect='dark'] .qy-tag__close {
  border-color: rgba(255, 255, 255, 0.18);
  background: color-mix(in srgb, var(--editor-text-inverse, rgba(255, 255, 255, 0.14)) 14%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--editor-text-inverse, rgba(255, 255, 255, 0.16)) 16%, transparent);
}

.qy-tag[data-effect='dark'] .qy-tag__close:hover {
  background: color-mix(in srgb, var(--editor-text-inverse, rgba(255, 255, 255, 0.24)) 24%, transparent);
}

.qy-tag[data-effect='plain'] .qy-tag__close {
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(248, 250, 252, 0.9)) 90%, transparent);
}
</style>
