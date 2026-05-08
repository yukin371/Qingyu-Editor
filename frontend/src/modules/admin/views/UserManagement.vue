<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">用户管理</h2>
        <p class="page-subtitle">管理系统用户，查看和编辑用户信息</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
        <el-button type="success" @click="handleBatchAdd">
          <el-icon><UserFilled /></el-icon>
          批量添加
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <UserStatsCards :stats="stats" />

    <!-- 筛选器 -->
    <UserFilter
      :filters="filters"
      @update:keyword="filters.keyword = $event"
      @update:role="filters.role = $event"
      @update:status="filters.status = $event"
      @search="handleSearch"
      @reset="handleReset"
      @filter-change="handleFilterChange"
    />

    <!-- 批量操作栏 -->
    <UserBatchActions
      :selected-count="selectedUsers.length"
      @batch-activate="handleBatchActivate"
      @batch-ban="handleBatchBan"
      @batch-delete="handleBatchDelete"
      @clear-selection="clearSelection"
    />

    <!-- 用户列表 -->
    <UserTable
      ref="userTableRef"
      :users="users"
      :loading="loading"
      :total="total"
      :pagination="pagination"
      @view="handleView"
      @edit="handleEdit"
      @ban="handleBan"
      @unban="handleUnban"
      @delete="handleDelete"
      @selection-change="handleSelectionChange"
      @update:page="pagination.page = $event"
      @page-change="loadUsers"
    />

    <!-- 查看/编辑用户对话框 -->
    <UserFormDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :user="currentUser"
      :submitting="submitting"
      @submit="handleSubmit"
    />

    <!-- 批量添加对话框 -->
    <UserBatchAddDialog v-model:visible="batchAddDialogVisible" @confirm="handleBatchAddConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { Plus, UserFilled } from '@element-plus/icons-vue'
import {
  UserStatsCards,
  UserFilter,
  UserBatchActions,
  UserTable,
  UserFormDialog,
  UserBatchAddDialog,
} from '../components/user'
import type { User, UserFormData, BatchAddFormData } from '../components/user/types'
import {
  assignRole,
  batchCreateUsers,
  batchDeleteUsers,
  batchUpdateUserStatus,
  createUser,
  deleteUser as deleteUserAPI,
  getUserCountsByStatus,
  getUserList,
  updateUserStatus,
} from '../api'

/** 筛选条件 */
const filters = reactive({
  keyword: '',
  role: '',
  status: '',
})

/** 分页参数 */
const pagination = reactive({
  page: 1,
  pageSize: 20,
})

/** 统计信息 */
const stats = reactive({
  total: 0,
  active: 0,
  authors: 0,
  newToday: 0,
})

/** 加载状态 */
const loading = ref(false)

/** 用户列表 */
const users = ref<User[]>([])

/** 总数 */
const total = ref(0)

/** 表格引用 */
const userTableRef = ref<InstanceType<typeof UserTable> | null>(null)

/** 选中的用户 */
const selectedUsers = ref<User[]>([])

/** 批量添加对话框可见性 */
const batchAddDialogVisible = ref(false)

/** 用户表单对话框可见性 */
const dialogVisible = ref(false)

/** 对话框模式 */
const dialogMode = ref<'view' | 'edit' | 'add'>('view')

/** 当前用户 */
const currentUser = ref<UserFormData | undefined>(undefined)

/** 提交中状态 */
const submitting = ref(false)

/** 加载统计数据 */
const loadStats = async () => {
  try {
    const [statusCounts, authorResponse] = await Promise.all([
      getUserCountsByStatus(),
      getUserList({ page: 1, pageSize: 1, role: 'author' }),
    ])
    stats.active = Number(statusCounts.active || 0)
    stats.authors = Number(authorResponse.total || 0)
    stats.newToday = 0
  } catch (error) {
    console.error('加载用户统计失败:', error)
    stats.active = 0
    stats.authors = 0
    stats.newToday = 0
  }
}

/** 加载用户列表 */
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
    })

    users.value = response.users.map((item: any) => ({
      userId: item.id,
      username: item.username,
      email: item.email || '',
      nickname: item.nickname || item.username,
      role: item.roles && item.roles.length > 0 ? item.roles[0] : 'reader',
      status: item.status,
      emailVerified: item.emailVerified || false,
      avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`,
      bio: item.bio || '',
      createdAt: item.createdAt || new Date().toISOString(),
      lastLoginAt: item.lastLoginAt || '',
    }))
    total.value = response.total
    stats.total = response.total
    await loadStats()
  } catch (error) {
    console.error('加载用户列表失败:', error)
    users.value = []
    total.value = 0
    stats.total = 0
    stats.active = 0
    stats.authors = 0
    stats.newToday = 0
    message.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

/** 搜索 */
const handleSearch = () => {
  pagination.page = 1
  void loadUsers()
}

/** 筛选条件变更 */
const handleFilterChange = () => {
  pagination.page = 1
  void loadUsers()
}

/** 重置 */
const handleReset = () => {
  filters.keyword = ''
  filters.role = ''
  filters.status = ''
  pagination.page = 1
  void loadUsers()
}

/** 添加用户 */
const handleAdd = () => {
  dialogMode.value = 'add'
  currentUser.value = undefined
  dialogVisible.value = true
}

/** 批量添加 */
const handleBatchAdd = () => {
  batchAddDialogVisible.value = true
}

/** 批量添加确认 */
const handleBatchAddConfirm = async (data: BatchAddFormData) => {
  if (data.count < 1 || data.count > 100) {
    message.warning('批量添加数量应在1-100之间')
    return
  }

  try {
    await batchCreateUsers({
      count: data.count,
      prefix: data.prefix || undefined,
      role: data.role,
      status: data.status,
    })
    message.success(`成功批量添加 ${data.count} 个用户`)
    batchAddDialogVisible.value = false
    void loadUsers()
  } catch (error) {
    console.error('批量添加失败:', error)
    message.error('批量添加失败')
  }
}

/** 选择变更 */
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

/** 清除选择 */
const clearSelection = () => {
  userTableRef.value?.clearSelection()
}

/** 批量激活 */
const handleBatchActivate = async () => {
  try {
    await messageBox.confirm(
      `确定要激活选中的 ${selectedUsers.value.length} 个用户吗？`,
      '批量激活',
      { type: 'info' },
    )

    await batchUpdateUserStatus({
      userIds: selectedUsers.value.map((user) => user.userId),
      status: 'active',
    })

    message.success('批量激活成功')
    clearSelection()
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('操作失败')
    }
  }
}

/** 批量封禁 */
const handleBatchBan = async () => {
  try {
    await messageBox.confirm(
      `确定要封禁选中的 ${selectedUsers.value.length} 个用户吗？`,
      '批量封禁',
      { type: 'warning' },
    )

    await batchUpdateUserStatus({
      userIds: selectedUsers.value.map((user) => user.userId),
      status: 'banned',
    })

    message.success('批量封禁成功')
    clearSelection()
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('操作失败')
    }
  }
}

/** 批量删除 */
const handleBatchDelete = async () => {
  try {
    await messageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复！`,
      '批量删除',
      { type: 'error', confirmButtonText: '确认删除' },
    )

    await batchDeleteUsers({
      userIds: selectedUsers.value.map((user) => user.userId),
    })

    message.success('批量删除成功')
    clearSelection()
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('操作失败')
    }
  }
}

/** 查看用户 */
const handleView = (user: User) => {
  dialogMode.value = 'view'
  currentUser.value = { ...user }
  dialogVisible.value = true
}

/** 编辑用户 */
const handleEdit = (user: User) => {
  dialogMode.value = 'edit'
  currentUser.value = { ...user }
  dialogVisible.value = true
}

/** 封禁用户 */
const handleBan = async (user: User) => {
  try {
    await messageBox.confirm(
      `确定要封禁用户 "${user.nickname || user.username}" 吗？`,
      '确认封禁',
      { type: 'warning' },
    )

    await updateUserStatus(user.userId, { status: 'banned' })
    message.success('封禁成功')
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('封禁失败:', error)
      message.error('封禁失败')
    }
  }
}

/** 解封用户 */
const handleUnban = async (user: User) => {
  try {
    await messageBox.confirm(
      `确定要解封用户 "${user.nickname || user.username}" 吗？`,
      '确认解封',
      { type: 'info' },
    )

    await updateUserStatus(user.userId, { status: 'active' })
    message.success('解封成功')
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('解封失败:', error)
      message.error('解封失败')
    }
  }
}

/** 删除用户 */
const handleDelete = async (user: User) => {
  try {
    await messageBox.confirm(
      `确定要删除用户 "${user.nickname || user.username}" 吗？此操作不可恢复！`,
      '确认删除',
      { type: 'error', confirmButtonText: '确认删除' },
    )

    await deleteUserAPI(user.userId)
    message.success('删除成功')
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }
}

/** 提交表单 */
const handleSubmit = async (formData: UserFormData) => {
  submitting.value = true
  try {
    if (dialogMode.value === 'add') {
      await createUser({
        username: formData.username,
        email: formData.email,
        nickname: formData.nickname || undefined,
        role: formData.role,
        status: formData.status,
        bio: formData.bio || undefined,
      })
    } else if (dialogMode.value === 'edit') {
      await updateUserStatus(formData.userId, { status: formData.status })
      await assignRole(formData.userId, { role: formData.role })
    }

    message.success(dialogMode.value === 'add' ? '添加成功' : '更新成功')
    dialogVisible.value = false
    void loadUsers()
  } catch (error) {
    console.error('操作失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<style scoped lang="scss">
.user-management {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  .header-info {
    .page-title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .page-subtitle {
      margin: 8px 0 0;
      color: #6b7280;
      font-size: 14px;
    }
  }
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>
