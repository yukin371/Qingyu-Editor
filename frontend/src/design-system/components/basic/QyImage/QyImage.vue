<template>
  <div
    :class="containerClasses"
    :style="containerStyle"
    class="qy-image"
  >
    <!-- 加载中占位符 -->
    <div :class="placeholderClasses" aria-hidden="true">
      <slot name="loading">
        <div class="flex flex-col items-center gap-2 text-slate-400">
          <svg
            class="animate-spin w-6 h-6"
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
          <span class="text-xs">加载中...</span>
        </div>
      </slot>
    </div>

    <!-- 加载失败占位符 -->
    <div
      v-if="hasError"
      :class="errorPlaceholderClasses"
      aria-hidden="true"
    >
      <slot name="error">
        <div class="flex flex-col items-center gap-2 text-slate-400">
          <svg
            class="w-10 h-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span class="text-xs">加载失败</span>
        </div>
      </slot>
    </div>

    <!-- 图片元素 -->
    <img
      v-if="!hasError"
      ref="imageRef"
      :src="actualSrc"
      :alt="alt"
      :class="imageClasses"
      :style="imageStyle"
      :loading="lazy ? 'lazy' : 'eager'"
      @load="handleLoad"
      @error="handleError"
      @click="handleClick"
    />

    <!-- 预览遮罩层 -->
    <div
      v-if="preview && isLoaded"
      class="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100"
      @click="handlePreview"
    >
      <svg
        class="w-8 h-8 text-white drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
        />
      </svg>
    </div>

    <!-- 图片预览弹窗 -->
    <Teleport to="body">
      <div
        v-if="isPreviewOpen"
        class="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center"
        @click.self="closePreview"
        @wheel.prevent="handleWheel"
      >
        <!-- 关闭按钮 -->
        <button
          class="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-[2001]"
          @click="closePreview"
        >
          <svg
            class="w-8 h-8"
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

        <!-- 上一张按钮 -->
        <button
          v-if="previewList.length > 1"
          class="absolute left-6 text-white/80 hover:text-white transition-colors z-[2001]"
          @click.stop="showPrev"
        >
          <svg
            class="w-10 h-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- 下一张按钮 -->
        <button
          v-if="previewList.length > 1"
          class="absolute right-6 text-white/80 hover:text-white transition-colors z-[2001]"
          @click.stop="showNext"
        >
          <svg
            class="w-10 h-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <!-- 预览图片 -->
        <img
          :src="currentPreviewSrc"
          :alt="alt"
          class="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-300"
          :style="{ transform: `scale(${scale})` }"
        />

        <!-- 缩放控制 -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[2001]">
          <button
            class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors"
            @click.stop="zoomOut"
          >
            <svg
              class="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 12H4"
              />
            </svg>
          </button>
          <span class="text-white/80 text-sm min-w-[60px] text-center">
            {{ Math.round(scale * 100) }}%
          </span>
          <button
            class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors"
            @click.stop="zoomIn"
          >
            <svg
              class="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <button
            class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors"
            @click.stop="resetZoom"
          >
            重置
          </button>
        </div>

        <!-- 图片计数 -->
        <div
          v-if="previewList.length > 1"
          class="absolute top-6 left-1/2 -translate-x-1/2 text-white/80 text-sm z-[2001]"
        >
          {{ currentPreviewIndex + 1 }} / {{ previewList.length }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { imageVariants, imageContainerVariants, placeholderVariants } from './variants'
import type { QyImageProps, QyImageEmits } from './types'

// Props
const props = withDefaults(defineProps<QyImageProps>(), {
  fit: 'cover',
  rounded: 'md',
  shadow: 'none',
  lazy: false,
  preview: false,
  initialIndex: 0,
  zIndex: 2000,
  alt: ''
})

// Emits
const emit = defineEmits<QyImageEmits>()

// 状态
const isLoaded = ref(false)
const hasError = ref(false)
const isPreviewOpen = ref(false)
const currentPreviewIndex = ref(props.initialIndex)
const scale = ref(1)

// 图片引用（用于后续扩展）
const imageRef = ref<HTMLImageElement>()

// 实际显示的图片源
const actualSrc = computed(() => {
  return hasError.value && props.errorSrc ? props.errorSrc : props.src
})

// 预览图片列表
const previewList = computed(() => {
  return props.previewSrcList && props.previewSrcList.length > 0
    ? props.previewSrcList
    : [props.src]
})

// 当前预览图片源
const currentPreviewSrc = computed(() => {
  return previewList.value[currentPreviewIndex.value] || props.src
})

// 容器样式
const containerStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return style
})

// 图片样式
const imageStyle = computed(() => {
  const style: Record<string, string> = {}
  // 继承容器的宽高
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return { ...style, ...props.style }
})

// 容器类名
const containerClasses = computed(() => {
  return cn(
    imageContainerVariants({
      rounded: props.rounded,
      shadow: props.shadow
    }),
    props.class
  )
})

// 图片类名
const imageClasses = computed(() => {
  return cn(
    imageVariants({
      fit: props.fit,
      loadingState: isLoaded.value ? 'loaded' : 'loading'
    })
  )
})

// 占位符类名
const placeholderClasses = computed(() => {
  return cn(
    placeholderVariants({
      state: isLoaded.value ? 'loaded' : 'loading'
    })
  )
})

// 错误占位符类名
const errorPlaceholderClasses = computed(() => {
  return placeholderVariants({
    state: 'error'
  })
})

// 处理加载完成
const handleLoad = (event: Event) => {
  isLoaded.value = true
  hasError.value = false
  emit('load', event)
}

// 处理加载失败
const handleError = (event: Event) => {
  hasError.value = true
  isLoaded.value = false
  emit('error', event)
}

// 处理点击
const handleClick = (event: MouseEvent) => {
  if (props.preview && isLoaded.value) {
    // 预览模式由遮罩层处理
    return
  }
  emit('click', event)
}

// 打开预览
const handlePreview = () => {
  if (!props.preview || !isLoaded.value) return

  // 找到当前图片在预览列表中的索引
  const index = previewList.value.indexOf(props.src)
  currentPreviewIndex.value = index >= 0 ? index : 0
  isPreviewOpen.value = true
  resetZoom()
}

// 关闭预览
const closePreview = () => {
  isPreviewOpen.value = false
  resetZoom()
}

// 上一张
const showPrev = () => {
  if (currentPreviewIndex.value > 0) {
    currentPreviewIndex.value--
  } else {
    currentPreviewIndex.value = previewList.value.length - 1
  }
  resetZoom()
}

// 下一张
const showNext = () => {
  if (currentPreviewIndex.value < previewList.value.length - 1) {
    currentPreviewIndex.value++
  } else {
    currentPreviewIndex.value = 0
  }
  resetZoom()
}

// 鼠标滚轮缩放
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 放大
const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.1, 3)
}

// 缩小
const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.1, 0.5)
}

// 重置缩放
const resetZoom = () => {
  scale.value = 1
}

// 监听 src 变化重置状态
watch(() => props.src, () => {
  isLoaded.value = false
  hasError.value = false
})

// 暴露方法给父组件
defineExpose({
  imageRef,
  openPreview: handlePreview,
  closePreview,
  togglePreview: () => {
    if (isPreviewOpen.value) {
      closePreview()
    } else {
      handlePreview()
    }
  }
})
</script>

<style scoped>
.qy-image img {
  display: block;
}
</style>
