<template>
  <span class="role-tag" :class="role">
    {{ roleText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserRole } from './types'

interface Props {
  /** 用户角色 */
  role: UserRole
}

const props = defineProps<Props>()

/** 角色文本映射 */
const roleTextMap: Record<UserRole, string> = {
  admin: '管理员',
  author: '作者',
  reader: '读者',
}

/** 获取角色显示文本 */
const roleText = computed(() => {
  return roleTextMap[props.role] || props.role
})
</script>

<style scoped lang="scss">
.role-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.admin {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.author {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.reader {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
}
</style>
