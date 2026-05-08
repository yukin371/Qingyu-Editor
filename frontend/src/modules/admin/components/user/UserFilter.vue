<template>
  <div class="filters-card">
    <div class="filter-group">
      <span class="filter-label">关键词</span>
      <el-input
        :model-value="filters.keyword"
        placeholder="用户名/邮箱/手机号"
        clearable
        class="keyword-input"
        @update:model-value="emit('update:keyword', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="filter-group">
      <span class="filter-label">角色</span>
      <el-select
        popper-class="admin-select-popper"
        :model-value="filters.role"
        placeholder="全部角色"
        clearable
        @update:model-value="handleRoleChange"
      >
        <el-option label="全部" value="" />
        <el-option label="管理员" value="admin" />
        <el-option label="作者" value="author" />
        <el-option label="读者" value="reader" />
      </el-select>
    </div>

    <div class="filter-group">
      <span class="filter-label">状态</span>
      <el-select
        popper-class="admin-select-popper"
        :model-value="filters.status"
        placeholder="全部状态"
        clearable
        @update:model-value="handleStatusChange"
      >
        <el-option label="全部" value="" />
        <el-option label="正常" value="active" />
        <el-option label="未激活" value="inactive" />
        <el-option label="已封禁" value="banned" />
      </el-select>
    </div>

    <div class="filter-actions">
      <el-button type="primary" @click="emit('search')">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="emit('reset')">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Refresh } from '@element-plus/icons-vue'
import type { UserFilters } from './types'

interface Props {
  /** 筛选条件 */
  filters: UserFilters
}

interface Emits {
  /** 更新关键词 */
  (e: 'update:keyword', value: string): void
  /** 更新角色 */
  (e: 'update:role', value: string): void
  /** 更新状态 */
  (e: 'update:status', value: string): void
  /** 搜索事件 */
  (e: 'search'): void
  /** 重置事件 */
  (e: 'reset'): void
  /** 筛选条件变更 */
  (e: 'filterChange'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/** 处理角色变更 */
const handleRoleChange = (value: string) => {
  emit('update:role', value)
  emit('filterChange')
}

/** 处理状态变更 */
const handleStatusChange = (value: string) => {
  emit('update:status', value)
  emit('filterChange')
}
</script>

<style scoped lang="scss">
.filters-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;

  > .keyword-input {
    width: 300px;
  }

  :deep(.keyword-input .el-input__wrapper) {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
  }

  :deep(.keyword-input .el-input__inner) {
    height: 100%;
    line-height: 36px;
  }

  :deep(.keyword-input .el-input__prefix),
  :deep(.keyword-input .el-input__prefix-inner) {
    height: 100%;
    display: inline-flex;
    align-items: center;
  }

  .filter-label {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
  }

  > .el-select {
    width: 130px;
  }

  :deep(.el-select__wrapper) {
    display: flex;
    align-items: center;
    height: 36px;
    min-height: 36px;
    position: relative;
    padding: 0 30px 0 12px;
    box-sizing: border-box;
  }

  :deep(.el-select__selection) {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    min-width: 0;
  }

  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(.el-select__placeholder) {
    flex: 0 0 auto;
    width: auto !important;
    max-width: none !important;
    overflow: visible;
    text-overflow: clip;
  }

  :deep(.el-select__suffix) {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.el-select__caret) {
    margin-left: 0;
  }
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

@media (max-width: 768px) {
  .filters-card {
    flex-direction: column;
    align-items: stretch;

    .filter-group {
      flex-direction: column;
      align-items: stretch;

      > .el-input,
      > .el-select,
      > .keyword-input {
        width: 100%;
      }
    }

    .filter-actions {
      margin-left: 0;
      justify-content: flex-end;
    }
  }
}
</style>
