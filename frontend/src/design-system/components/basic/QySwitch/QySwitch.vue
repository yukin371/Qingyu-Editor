<template>
  <button
    :class="switchClasses"
    :disabled="isDisabled"
    role="switch"
    :aria-checked="isChecked"
    :aria-disabled="isDisabled"
    type="button"
    @click="handleClick"
  >
    <!-- 轨道 -->
    <span :class="trackClasses">
      <!-- 滑块 -->
      <span :class="thumbClasses">
        <!-- 加载动画 -->
        <svg
          v-if="loading"
          class="animate-spin switch-spinner"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>

        <!-- 图标插槽 -->
        <slot name="icon" :checked="isChecked">
          <!-- 默认开启图标 -->
          <svg
            v-if="isChecked && !loading && activeIcon"
            class="switch-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            v-html="activeIcon"
          />
          <!-- 默认关闭图标 -->
          <svg
            v-if="!isChecked && !loading && inactiveIcon"
            class="switch-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            v-html="inactiveIcon"
          />
        </slot>
      </span>

      <!-- 激活文本 -->
      <span
        v-if="activeText && (activeTextPosition === 'left' || activeTextPosition === 'inside')"
        :class="activeTextClasses"
      >
        {{ activeText }}
      </span>

      <!-- 非激活文本 -->
      <span
        v-if="inactiveText && (inactiveTextPosition === 'right' || inactiveTextPosition === 'inside')"
        :class="inactiveTextClasses"
      >
        {{ inactiveText }}
      </span>
    </span>

    <!-- 外部文本 - 激活 -->
    <span v-if="activeText && activeTextPosition === 'right'" class="ml-2 text-sm">
      {{ activeText }}
    </span>

    <!-- 外部文本 - 非激活 -->
    <span v-if="inactiveText && inactiveTextPosition === 'left'" class="mr-2 text-sm">
      {{ inactiveText }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/design-system/utils/cn'
import type { QySwitchProps, QySwitchEmits } from './types'
import {
  switchVariants,
  trackVariants,
  thumbVariants,
  activeTextVariants,
  inactiveTextVariants
} from './variants'

// Props
const props = withDefaults(defineProps<QySwitchProps>(), {
  modelValue: false,
  disabled: false,
  loading: false,
  size: 'md',
  color: 'primary',
  activeValue: true,
  inactiveValue: false,
  beforeChange: undefined,
  activeTextPosition: 'right',
  inactiveTextPosition: 'left'
})

// Emits
const emit = defineEmits<QySwitchEmits>()

// 内部加载状态
const isLoading = ref(false)

// 计算是否选中
const isChecked = computed(() => props.modelValue === props.activeValue)

// 计算是否禁用
const isDisabled = computed(() => props.disabled || props.loading || isLoading.value)

// 计算容器类名
const switchClasses = computed(() => {
  return cn(
    switchVariants({
      size: props.size,
      checked: isChecked.value
    }),
    props.class
  )
})

// 计算轨道类名
const trackClasses = computed(() => {
  return cn(
    trackVariants({
      size: props.size,
      color: props.color,
      checked: isChecked.value,
      disabled: isDisabled.value
    }),
    {
      'bg-slate-200': !isChecked.value,
      'dark:bg-slate-700': !isChecked.value
    }
  )
})

// 计算滑块类名
const thumbClasses = computed(() => {
  return cn(
    thumbVariants({
      size: props.size,
      checked: isChecked.value,
      loading: props.loading || isLoading.value
    }),
    'bg-white',
    {
      'translate-x-0': !isChecked.value
    }
  )
})

// 计算激活文本类名
const activeTextClasses = computed(() => {
  return cn(
    activeTextVariants({
      size: props.size,
      checked: isChecked.value
    })
  )
})

// 计算非激活文本类名
const inactiveTextClasses = computed(() => {
  return cn(
    inactiveTextVariants({
      size: props.size,
      checked: isChecked.value
    })
  )
})

// 处理点击事件
const handleClick = async () => {
  if (isDisabled.value) return

  const newValue = isChecked.value ? props.inactiveValue : props.activeValue

  // 如果有 beforeChange 钩子，先执行
  if (props.beforeChange) {
    isLoading.value = true
    try {
      const result = await props.beforeChange(newValue)
      if (result !== false) {
        emit('update:modelValue', newValue)
        emit('change', newValue)
      }
    } catch (error) {
      console.error('QySwitch beforeChange error:', error)
    } finally {
      isLoading.value = false
    }
  } else {
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }
}

// 暴露方法给父组件
defineExpose({
  focus: () => {
    // 可以在这里添加 focus 逻辑
  },
  blur: () => {
    // 可以在这里添加 blur 逻辑
  }
})
</script>

<style scoped>
.switch-spinner {
  width: 100%;
  height: 100%;
}

.switch-icon {
  width: 75%;
  height: 75%;
}

.switch-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
