<template>
  <div class="user-card">
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="users"
      style="width: 100%"
      :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />

      <el-table-column prop="userId" label="用户ID" width="140">
        <template #default="{ row }">
          <span class="id-text">{{ row.userId }}</span>
        </template>
      </el-table-column>

      <el-table-column label="用户信息" min-width="200">
        <template #default="{ row }">
          <div class="user-info">
            <Avatar size="lg" :src="row.avatar" :alt="row.username || row.nickname" />
            <div class="user-meta">
              <span class="username">{{ row.username }}</span>
              <span class="email">{{ row.email }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="角色" width="100">
        <template #default="{ row }">
          <UserRoleTag :role="row.role" />
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <UserStatusTag :status="row.status" />
        </template>
      </el-table-column>

      <el-table-column label="邮箱验证" width="90">
        <template #default="{ row }">
          <el-icon v-if="row.emailVerified" color="#10b981" :size="18">
            <CircleCheckFilled />
          </el-icon>
          <el-icon v-else color="#9ca3af" :size="18">
            <WarningFilled />
          </el-icon>
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="注册时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <div class="action-btns">
            <el-button size="small" @click="emit('view', row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="warning" size="small" @click="emit('edit', row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              v-if="row.status !== 'banned'"
              type="info"
              size="small"
              @click="emit('ban', row)"
            >
              <el-icon><Lock /></el-icon>
              封禁
            </el-button>
            <el-button v-else type="success" size="small" @click="emit('unban', row)">
              <el-icon><Unlock /></el-icon>
              解封
            </el-button>
            <el-button type="danger" size="small" @click="emit('delete', row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-card">
      <div class="pagination-total">共 {{ total }} 条</div>
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="total"
        layout="prev, pager, next"
        @update:current-page="handlePageChange"
        @current-change="emit('pageChange')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  View,
  Edit,
  Lock,
  Unlock,
  CircleCheckFilled,
  WarningFilled,
  Delete,
} from '@element-plus/icons-vue'
import { ElTable } from 'element-plus'
import { formatDate } from '@/utils/format'
import { Avatar } from '@/design-system/base'
import UserRoleTag from './UserRoleTag.vue'
import UserStatusTag from './UserStatusTag.vue'
import type { User, UserPagination } from './types'

interface Props {
  /** 用户列表 */
  users: User[]
  /** 加载状态 */
  loading: boolean
  /** 总数 */
  total: number
  /** 分页参数 */
  pagination: UserPagination
}

interface Emits {
  /** 查看用户 */
  (e: 'view', user: User): void
  /** 编辑用户 */
  (e: 'edit', user: User): void
  /** 封禁用户 */
  (e: 'ban', user: User): void
  /** 解封用户 */
  (e: 'unban', user: User): void
  /** 删除用户 */
  (e: 'delete', user: User): void
  /** 选择变更 */
  (e: 'selectionChange', users: User[]): void
  /** 页码变更 */
  (e: 'update:page', page: number): void
  /** 页码变更后重新加载 */
  (e: 'pageChange'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/** 表格引用 */
const tableRef = ref<InstanceType<typeof ElTable> | null>(null)

/** 处理选择变更 */
const handleSelectionChange = (selection: User[]) => {
  emit('selectionChange', selection)
}

/** 处理页码变更 */
const handlePageChange = (page: number) => {
  emit('update:page', page)
}

/** 清除选择 */
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

/** 暴露方法给父组件 */
defineExpose({
  clearSelection,
})
</script>

<style scoped lang="scss">
.user-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.id-text {
  font-family: monospace;
  font-size: 13px;
  color: #6b7280;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-meta {
    display: flex;
    flex-direction: column;

    .username {
      font-weight: 500;
      color: #374151;
    }

    .email {
      font-size: 12px;
      color: #9ca3af;
    }
  }
}

.action-btns {
  display: flex;
  gap: 8px;
}

// 分页
.pagination-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;

  .pagination-total {
    font-size: 14px;
    color: #64748b;
    white-space: nowrap;
  }

  :deep(.el-pagination) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    gap: 8px;
    font-size: 14px;
    color: #475569;
  }

  :deep(.el-pagination__total),
  :deep(.el-pagination__sizes),
  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.el-pager),
  :deep(.el-pagination__jump) {
    margin: 0 !important;
    display: inline-flex;
    align-items: center;
  }

  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.el-pager li) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }

  :deep(.el-pager li.is-active) {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: transparent;
    color: #fff;
    font-weight: 500;
  }

  :deep(.el-pagination__sizes .el-select) {
    width: 100px;
  }
}
</style>
