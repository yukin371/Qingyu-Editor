<script setup lang="ts">
import { computed } from 'vue'
import type { ManagedSuggestion } from '../../../types/agent'

const props = defineProps<{
  suggestion: ManagedSuggestion
}>()

const emit = defineEmits<{
  accept: [id: string]
  reject: [id: string]
  edit: [id: string]
}>()

const entityTitle = computed(() => {
  try {
    const data = JSON.parse(props.suggestion.content)
    return data.name || data.title || props.suggestion.targetEntity
  } catch {
    return props.suggestion.targetEntity
  }
})

const entityType = computed(() => {
  const entityMap: Record<string, string> = {
    character: '角色',
    outline: '大纲',
    location: '地点',
    timeline: '时间线',
  }
  return entityMap[props.suggestion.targetEntity] || props.suggestion.targetEntity
})

const actionLabel = computed(() => {
  const actionMap: Record<string, string> = {
    create: '新建',
    update: '更新',
    append: '追加',
  }
  return actionMap[props.suggestion.action] || props.suggestion.action
})

const parsedContent = computed(() => {
  try {
    return JSON.parse(props.suggestion.content)
  } catch {
    return { raw: props.suggestion.content }
  }
})
</script>

<template>
  <div class="entity-preview-card border rounded-lg bg-white shadow-sm overflow-hidden">
    <!-- 头部 -->
    <div class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
      <div class="flex items-center gap-2">
        <span class="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
          {{ actionLabel }}
        </span>
        <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
          {{ entityType }}
        </span>
        <span class="text-sm font-medium text-gray-800">{{ entityTitle }}</span>
      </div>
      <button
        class="text-gray-400 hover:text-gray-600 text-sm"
        @click="emit('reject', suggestion.id)"
      >
        ✕
      </button>
    </div>

    <!-- 内容区 -->
    <div class="p-3 text-sm text-gray-700 space-y-1">
      <template v-for="(value, key) in parsedContent" :key="key">
        <div v-if="typeof value === 'string' && value" class="flex gap-2">
          <span class="text-gray-400 min-w-[60px] text-right">{{ key }}:</span>
          <span>{{ value }}</span>
        </div>
        <div v-else-if="Array.isArray(value) && value.length" class="flex gap-2">
          <span class="text-gray-400 min-w-[60px] text-right">{{ key }}:</span>
          <span>{{ value.join(', ') }}</span>
        </div>
      </template>
    </div>

    <!-- 摘要 -->
    <div v-if="suggestion.summary" class="px-3 pb-2 text-xs text-gray-400">
      {{ suggestion.summary }}
    </div>

    <!-- 操作栏 -->
    <div class="flex gap-2 px-3 pb-3">
      <button
        class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
        @click="emit('edit', suggestion.id)"
      >
        编辑
      </button>
      <button
        class="px-3 py-1.5 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600"
        @click="emit('accept', suggestion.id)"
      >
        采纳
      </button>
      <button
        class="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
        @click="emit('reject', suggestion.id)"
      >
        拒绝
      </button>
    </div>
  </div>
</template>
