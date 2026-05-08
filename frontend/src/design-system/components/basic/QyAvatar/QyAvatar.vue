<template>
  <!-- Image Avatar -->
  <div
    v-if="type === 'image'"
    ref="avatarRef"
    :class="avatarWrapperClasses"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleKeyboardTrigger"
    @keydown.space.prevent="handleKeyboardTrigger"
  >
    <div :class="avatarInnerClasses">
      <!-- Normal image -->
      <img
        v-if="src && !imgError"
        :src="src"
        :alt="alt"
        :class="avatarImageClasses"
        @error="imgError = true"
      />
      <!-- Fallback: colored background + initials -->
      <div v-else :class="[avatarPlaceholderClasses, avatarTextBgClasses]">
        <span v-if="text" :class="avatarTextClasses">{{ getAvatarText(text) }}</span>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-1/2 w-1/2 text-white/80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </div>
    <span :class="avatarSheenClasses" aria-hidden="true"></span>
  </div>

  <!-- Text Avatar -->
  <div
    v-else-if="type === 'text'"
    ref="avatarRef"
    :class="[avatarWrapperClasses, avatarTextBgClasses]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleKeyboardTrigger"
    @keydown.space.prevent="handleKeyboardTrigger"
  >
    <div :class="avatarInnerClasses">
      <span :class="avatarTextClasses">
        {{ displayText }}
      </span>
    </div>
    <span :class="avatarSheenClasses" aria-hidden="true"></span>
  </div>

  <!-- Group Avatar -->
  <div v-else-if="type === 'group'" :class="groupClasses">
    <div
      v-for="(avatarItem, index) in displayedAvatars"
      :key="index"
      :class="[groupAvatarItemClasses, index > 0 ? groupOverlapClass : '']"
      :style="{ zIndex: avatars!.length - index }"
    >
      <div :class="avatarInnerClasses">
        <img
          v-if="avatarItem.src"
          :src="avatarItem.src"
          :alt="avatarItem.alt || 'Avatar'"
          :class="avatarImageClasses"
        />
        <div v-else :class="[avatarPlaceholderClasses, avatarTextBgClasses]">
          <span :class="avatarTextClasses">
            {{ getAvatarText(avatarItem.text) }}
          </span>
        </div>
      </div>
      <span :class="avatarSheenClasses" aria-hidden="true"></span>
    </div>
    <div
      v-if="avatars && avatars.length > actualMaxVisible"
      :class="[groupAvatarItemClasses, groupOverflowClasses, groupOverlapClass]"
      :style="{ zIndex: 0 }"
    >
      <div :class="avatarInnerClasses">
        <div :class="groupOverflowInnerClasses">
          <span :class="avatarTextClasses"> +{{ avatars.length - actualMaxVisible }} </span>
        </div>
      </div>
      <span :class="avatarSheenClasses" aria-hidden="true"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cn } from '@/design-system/utils/cn'
import {
  avatarVariants,
  avatarImageVariants,
  avatarPlaceholderVariants,
  avatarTextBgVariants,
  avatarTextVariants,
  avatarGroupVariants,
  avatarGroupItemVariants,
} from './variants'
import type { QyAvatarProps, QyAvatarEmits } from './types'

// Props
const props = withDefaults(defineProps<QyAvatarProps>(), {
  type: 'image',
  src: '',
  text: '',
  size: 'md',
  alt: 'Avatar',
  shape: 'circle',
  fit: 'cover',
  color: 'cyan',
  avatars: () => [],
  maxVisible: 3,
  icon: '',
  clickable: false,
})

// Emits
const emit = defineEmits<QyAvatarEmits>()

// Image error state
const imgError = ref(false)
const avatarRef = ref<HTMLDivElement>()

// Reset imgError when src changes
watch(
  () => props.src,
  () => {
    imgError.value = false
  },
)

// 计算实际的最大显示数量
const actualMaxVisible = computed(() => props.maxVisible || 3)

// 计算容器类名
const avatarWrapperClasses = computed(() => {
  return cn(
    avatarVariants({
      size: props.size,
      shape: props.shape,
    }),
    {
      'cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200/60 hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-24px_rgba(37,99,235,0.45)]':
        props.clickable,
    },
    props.class,
  )
})

const avatarInnerClasses = computed(() => {
  return 'relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]'
})

// 计算图片类名
const avatarImageClasses = computed(() => {
  return cn(
    avatarImageVariants({
      fit: props.fit,
    }),
    {
      'group-hover:scale-[1.03]': props.type === 'group',
      'group-hover:scale-[1.04]': props.clickable && props.type !== 'group',
    },
  )
})

// 计算占位符类名
const avatarPlaceholderClasses = computed(() => {
  return cn(
    avatarPlaceholderVariants({
      size: props.size,
    }),
  )
})

// 计算文本背景类名
const avatarTextBgClasses = computed(() => {
  return cn(
    avatarTextBgVariants({
      color: props.color,
    }),
  )
})

// 计算文本类名
const avatarTextClasses = computed(() => {
  return cn(
    avatarTextVariants({
      size: props.size,
    }),
  )
})

const avatarSheenClasses = computed(() => {
  return 'pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.52),transparent_58%)]'
})

// 计算显示的文本
const displayText = computed(() => {
  return getAvatarText(props.text)
})

// 获取头像文本（前2个字符，大写）
const getAvatarText = (text?: string) => {
  if (!text) return ''
  return text.substring(0, 2).toUpperCase()
}

// 计算组容器类名
const groupClasses = computed(() => {
  return cn(avatarGroupVariants())
})

// 计算组头像项类名
const groupAvatarItemClasses = computed(() => {
  return cn(
    avatarGroupItemVariants({
      size: props.size,
      shape: props.shape,
    }),
  )
})

const groupOverlapClass = computed(() => {
  const overlapMap = {
    xs: 'ml-[-4px]',
    sm: 'ml-[-6px]',
    md: 'ml-[-10px]',
    lg: 'ml-[-12px]',
    xl: 'ml-[-14px]',
  }
  return overlapMap[props.size ?? 'md']
})

const groupOverflowClasses = computed(() => {
  return 'bg-white/92'
})

const groupOverflowInnerClasses = computed(() => {
  return 'relative flex h-full w-full items-center justify-center rounded-[inherit] border border-white/45 bg-[linear-gradient(145deg,rgba(15,23,42,0.88),rgba(51,65,85,0.92))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
})

// 计算显示的头像列表
const displayedAvatars = computed(() => {
  if (!props.avatars) return []
  return props.avatars.slice(0, actualMaxVisible.value)
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const handleKeyboardTrigger = (event: KeyboardEvent) => {
  if (!props.clickable) {
    return
  }
  emit('click', event as unknown as MouseEvent)
}

// 暴露方法给父组件
defineExpose({
  focus: () => {
    avatarRef.value?.focus()
  },
  blur: () => {
    avatarRef.value?.blur()
  },
})
</script>
