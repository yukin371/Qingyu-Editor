<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center space-x-3">
      <QyIcon v-if="icon" :name="icon" :size="24" class="text-primary-600" />
      <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
    </div>
    <slot name="action">
      <router-link
        v-if="moreLink"
        :to="moreLink"
        class="text-sm text-primary-600 hover:text-primary-700 flex items-center"
      >
        {{ moreText }}
        <QyIcon name="ArrowRight" :size="16" class="ml-1" />
      </router-link>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'

interface Props {
  title: string
  icon?: string
  moreLink?: string
  moreText?: string
}

const props = withDefaults(defineProps<Props>(), {
  moreText: '查看更多',
})
</script>














