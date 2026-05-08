<template>
  <span class="status-tag" :class="status">
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserStatus } from './types'

interface Props {
  /** 用户状态 */
  status: UserStatus
}

const props = defineProps<Props>()

/** 状态文本映射 */
const statusTextMap: Record<UserStatus, string> = {
  active: '正常',
  inactive: '未激活',
  banned: '已封禁',
}

/** 获取状态显示文本 */
const statusText = computed(() => {
  return statusTextMap[props.status] || props.status
})
</script>

<style scoped lang="scss">
.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.active {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  &.inactive {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }

  &.banned {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}
</style>
