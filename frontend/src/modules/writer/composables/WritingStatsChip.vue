<template>
  <div class="writing-stats-chip" :class="{ 'is-clickable': clickable }" @click="handleClick">
    <span class="stat-label">{{ label }}</span>
    <span class="stat-value">{{ formattedValue }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: number
  clickable?: boolean
  onClick?: () => void
}

const emit = defineEmits<{
  click: []
}>()

const props = withDefaults(defineProps<Props>(), {
  label: '字数',
  value: 0,
  clickable: false,
})

/**
 * 格式化数值显示
 */
const formattedValue = computed(() => {
  const val = props.value
  if (val >= 100000000) {
    return `${(val / 100000000).toFixed(1)}亿`
  } else if (val >= 10000) {
    return `${(val / 10000).toFixed(1)}万`
  } else if (val >= 1000) {
    return `${(val / 1000).toFixed(1)}k`
  }
  return val.toString()
})

function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}
</script>
<style scoped lang="scss">
.writing-stats-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--editor-bg-elevated, #f1f5f9);
  border: 1px solid var(--editor-border, #e2e8f0);
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  user-select: none;
  &.is-clickable {
    cursor: pointer;
    transition: background-color 0.2s;
    &:hover {
      background: var(--editor-bg-surface, #e2e8f0);
    }
  }
  .stat-label {
    color: var(--editor-text-ghost, #94a3b8);
    font-weight: 600;
    font-family: var(--el-font-family-monospace);
  }
  .stat-value {
    color: var(--editor-text-primary, #334155);
    font-weight: 600;
    font-family: var(--el-font-family-monospace);
  }
}
</style>
