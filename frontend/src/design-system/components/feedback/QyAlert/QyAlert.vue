<template>
  <div
    v-show="visible"
    :class="alertClasses"
    :data-type="type"
    role="alert"
    aria-live="polite"
  >
    <!-- 图标 -->
    <div
      v-if="showIcon"
      :class="iconClasses"
      aria-hidden="true"
    >
      <component :is="iconComponent" />
    </div>

    <!-- 内容区域 -->
    <div
      :class="[
        'flex-1',
        center ? 'text-center' : 'text-left'
      ]"
    >
      <!-- 标题 -->
      <div
        v-if="title || $slots.title"
        :class="[
          'font-semibold mb-1',
          description ? 'text-base' : 'text-sm'
        ]"
      >
        <slot name="title">{{ title }}</slot>
      </div>

      <!-- 描述内容 -->
      <div
        v-if="description || $slots.default"
        :class="[
          'text-sm leading-relaxed',
          !title && 'font-medium'
        ]"
      >
        <slot>{{ description }}</slot>
      </div>
    </div>

    <!-- 关闭按钮 -->
    <button
      v-if="closable"
      type="button"
      :class="closeClasses"
      :aria-label="closeText || '关闭'"
      @click="handleClose"
    >
      <span v-if="closeText">{{ closeText }}</span>
      <svg
        v-else
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 6l8 8m0-8l-8 8"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { alertVariants, alertIconVariants, alertCloseVariants } from './variants'
import type { QyAlertProps, QyAlertEmits, QyAlertInstance } from './types'

// Props
const props = withDefaults(defineProps<QyAlertProps>(), {
  type: 'info',
  closable: true,
  showIcon: true,
  center: false
})

// Emits
const emit = defineEmits<QyAlertEmits>()

// 内部状态
const visible = ref(true)

// 图标组件映射
const iconComponents = {
  success: () =>
    h('svg', {
      viewBox: '0 0 20 20',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', {
        fill: 'currentColor',
        d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
      })
    ]),
  warning: () =>
    h('svg', {
      viewBox: '0 0 20 20',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', {
        fill: 'currentColor',
        d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zm0 7.5a.75.75 0 00-1.5 0v.001a.75.75 0 001.5 0V14.25z'
      })
    ]),
  error: () =>
    h('svg', {
      viewBox: '0 0 20 20',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', {
        fill: 'currentColor',
        d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-10.625a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zm-1.5 6.875a.75.75 0 001.5 0v.001a.75.75 0 00-1.5 0V14.25z'
      })
    ]),
  info: () =>
    h('svg', {
      viewBox: '0 0 20 20',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', {
        fill: 'currentColor',
        d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-10.25a.75.75 0 10-1.5 0v5.5a.75.75 0 001.5 0v-5.5zm0-4.25a.75.75 0 00-1.5 0v.001a.75.75 0 001.5 0V3.5z'
      })
    ])
}

// 当前图标组件
const iconComponent = computed(() => {
  return iconComponents[props.type ?? 'info'] || iconComponents.info
})

// 计算警告容器类名
const alertClasses = computed(() => {
  return cn(
    alertVariants({
      type: props.type
    }),
    {
      'flex items-start gap-3': !props.center,
      'flex flex-col items-center gap-2': props.center
    },
    props.class
  )
})

// 计算图标类名
const iconClasses = computed(() => {
  return cn(
    alertIconVariants({
      type: props.type
    }),
    {
      'mt-0.5': !props.center && props.description
    }
  )
})

// 计算关闭按钮类名
const closeClasses = computed(() => {
  return cn(
    alertCloseVariants({
      type: props.type
    })
  )
})

// 处理关闭事件
const handleClose = () => {
  visible.value = false
  emit('close')
  props.onClose?.()
}

// 暴露方法给父组件
defineExpose<QyAlertInstance>({
  close: handleClose
})
</script>

<style scoped>
/* 确保图标颜色正确继承 */
svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* 关闭按钮文本样式 */
button span {
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
