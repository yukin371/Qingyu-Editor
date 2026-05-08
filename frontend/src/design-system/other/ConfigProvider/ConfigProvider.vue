<script setup lang="ts">
/**
 * ConfigProvider 全局配置组件
 *
 * 为所有子组件提供全局配置上下文
 * 使用 Vue 的 provide/inject 机制实现配置共享
 * 组件自身 props 优先级高于 ConfigProvider 提供的配置
 */

import { provide, reactive, watchEffect } from 'vue'
import type { ConfigProviderProps, ConfigProviderContext } from './types'
import { CONFIG_PROVIDER_KEY } from './types'

// 组件 Props
const props = withDefaults(defineProps<ConfigProviderProps>(), {
  size: 'medium',
  namespace: 'qy',
  direction: 'ltr',
  button: () => ({
    size: 'medium',
    variant: 'solid',
  }),
  zIndex: () => ({
    base: 1000,
    dropdown: 1050,
    popover: 1060,
    dialog: 1070,
    notification: 1080,
    message: 1090,
  }),
})

// 组件 Emits
const emit = defineEmits<{}>()

// 创建响应式配置对象
const configContext = reactive<ConfigProviderContext>({
  size: props.size,
  namespace: props.namespace,
  locale: props.locale,
  direction: props.direction,
  button: props.button,
  zIndex: props.zIndex,
})

// 监听 props 变化并更新响应式配置
watchEffect(() => {
  configContext.size = props.size
  configContext.namespace = props.namespace
  configContext.locale = props.locale
  configContext.direction = props.direction
  configContext.button = props.button
  configContext.zIndex = props.zIndex
})

// 提供配置上下文给所有子组件
provide(CONFIG_PROVIDER_KEY, configContext)

// 定义暴露给父组件的属性和方法
defineExpose({
  config: configContext,
})
</script>

<template>
  <!-- ConfigProvider 不渲染任何 DOM 结构，只作为配置提供者 -->
  <slot />
</template>
