<template>
  <div class="announcement-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">公告管理</h2>
        <p class="page-subtitle">管理系统公告通知，支持定向推送</p>
      </div>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建公告
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item total">
        <div class="stat-icon">
          <el-icon :size="20"><Bell /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总公告数</span>
        </div>
      </div>
      <div class="stat-item active">
        <div class="stat-icon">
          <el-icon :size="20"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">已发布</span>
        </div>
      </div>
      <div class="stat-item views">
        <div class="stat-icon">
          <el-icon :size="20"><View /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalViews.toLocaleString() }}</span>
          <span class="stat-label">总查看次数</span>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <div class="filter-group">
        <span class="filter-label">公告类型</span>
        <el-select
          popper-class="admin-select-popper"
          v-model="filters.type"
          placeholder="全部类型"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="信息" value="info" />
          <el-option label="警告" value="warning" />
          <el-option label="通知" value="notice" />
        </el-select>
      </div>

      <div class="filter-group">
        <span class="filter-label">目标用户</span>
        <el-select
          popper-class="admin-select-popper"
          v-model="filters.targetRole"
          placeholder="全部用户"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="所有用户" value="all" />
          <el-option label="读者" value="reader" />
          <el-option label="作者" value="author" />
          <el-option label="管理员" value="admin" />
        </el-select>
      </div>

      <div class="filter-group">
        <span class="filter-label">状态</span>
        <el-select
          popper-class="admin-select-popper"
          v-model="filters.status"
          placeholder="全部状态"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="已启用" value="active" />
          <el-option label="已禁用" value="inactive" />
        </el-select>
      </div>

      <div class="filter-actions">
        <el-button @click="loadAnnouncements">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 公告列表 -->
    <div class="announcement-card">
      <el-table
        v-loading="loading"
        :data="announcements"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="title">{{ row.title }}</span>
              <span class="content-preview">{{ row.content?.substring(0, 50) }}...</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <span class="type-tag" :class="row.type">
              <el-icon v-if="row.type === 'info'" :size="14"><InfoFilled /></el-icon>
              <el-icon v-else-if="row.type === 'warning'" :size="14"><WarningFilled /></el-icon>
              <el-icon v-else :size="14"><Bell /></el-icon>
              {{ getTypeLabel(row.type) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="目标用户" width="100">
          <template #default="{ row }">
            <span class="target-tag">{{ getTargetLabel(row.targetRole) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <span class="priority-badge" :class="getPriorityClass(row.priority)">
              {{ row.priority }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="handleStatusChange(row)"
              active-color="#10b981"
            />
          </template>
        </el-table-column>

        <el-table-column prop="viewCount" label="查看次数" width="100">
          <template #default="{ row }">
            <span class="view-count">{{ row.viewCount?.toLocaleString() || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="发布时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
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
          @update:current-page="pagination.page = $event"
          @current-change="loadAnnouncements"
        />
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingAnnouncement ? '编辑公告' : '新建公告'"
      width="700px"
      class="admin-modal-card"
      append-to-body
      align-center
    >
      <el-form :model="announcementForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>

        <el-form-item label="内容" required>
          <el-input
            v-model="announcementForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="类型" required>
          <el-select
            popper-class="admin-select-popper"
            v-model="announcementForm.type"
            style="width: 200px"
          >
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="通知" value="notice" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标用户" required>
          <el-select
            popper-class="admin-select-popper"
            v-model="announcementForm.targetRole"
            style="width: 200px"
          >
            <el-option label="所有用户" value="all" />
            <el-option label="读者" value="reader" />
            <el-option label="作者" value="author" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-input-number
            v-model="announcementForm.priority"
            :min="0"
            :max="100"
            style="width: 150px"
          />
          <span class="form-hint">数字越大优先级越高</span>
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="announcementForm.isActive" />
        </el-form-item>

        <el-form-item label="生效时间">
          <el-date-picker
            v-model="announcementForm.startTime"
            type="datetime"
            placeholder="开始时间"
            style="width: 200px"
          />
          <span class="form-hint">至</span>
          <el-date-picker
            v-model="announcementForm.endTime"
            type="datetime"
            placeholder="结束时间"
            style="width: 200px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  Plus,
  Bell,
  CircleCheck,
  View,
  Refresh,
  InfoFilled,
  WarningFilled,
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../api'

function getHttpStatus(error: unknown): number | undefined {
  const status = (error as { response?: { status?: unknown } })?.response?.status
  return typeof status === 'number' ? status : undefined
}

function resetForm() {
  editingAnnouncement.value = null
  Object.assign(announcementForm, {
    title: '',
    content: '',
    type: 'info',
    targetRole: 'all',
    priority: 0,
    isActive: true,
    startTime: undefined,
    endTime: undefined,
  })
}

async function handleAnnouncementNotFound(messageText: string) {
  dialogVisible.value = false
  resetForm()
  await loadAnnouncements()
  message.error(messageText)
}

// 筛选器
const filters = reactive({
  type: '',
  targetRole: '',
  status: '',
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
})

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  totalViews: 0,
})

// 数据
const loading = ref(false)
const announcements = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const editingAnnouncement = ref<any | null>(null)
const submitting = ref(false)

const announcementForm = reactive({
  title: '',
  content: '',
  type: 'info' as 'info' | 'warning' | 'notice',
  targetRole: 'all' as 'all' | 'reader' | 'writer' | 'admin',
  priority: 0,
  isActive: true,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
})

// 加载公告列表
const loadAnnouncements = async () => {
  loading.value = true
  try {
    const response = await getAnnouncements({
      page: pagination.page,
      pageSize: pagination.pageSize,
      type: filters.type || undefined,
      targetRole: filters.targetRole || undefined,
      status: filters.status || undefined,
    })
    announcements.value = response.items
    total.value = response.total || 0
    stats.total = total.value
    stats.active = response.items.filter((announcement) => announcement.isActive).length
    stats.totalViews = response.items.reduce(
      (sum, announcement) => sum + Number(announcement.viewCount || 0),
      0,
    )
  } catch (error) {
    console.error('加载公告列表失败:', error)
    announcements.value = []
    total.value = 0
    stats.total = 0
    stats.active = 0
    stats.totalViews = 0
    message.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadAnnouncements()
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    info: '信息',
    warning: '警告',
    notice: '通知',
  }
  return labels[type] || type
}

const getTargetLabel = (target: string): string => {
  const labels: Record<string, string> = {
    all: '所有用户',
    reader: '读者',
    writer: '作者',
    admin: '管理员',
  }
  return labels[target] || target
}

const getPriorityClass = (priority: number): string => {
  if (priority >= 80) return 'high'
  if (priority >= 50) return 'medium'
  return 'low'
}

const handleCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (announcement: any) => {
  editingAnnouncement.value = announcement
  Object.assign(announcementForm, {
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    targetRole: announcement.targetRole || 'all',
    priority: announcement.priority,
    isActive: Boolean(announcement.isActive),
    startTime: announcement.startTime || undefined,
    endTime: announcement.endTime || undefined,
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!announcementForm.title || !announcementForm.content) {
    message.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    const payload = {
      ...announcementForm,
      startTime: announcementForm.startTime || undefined,
      endTime: announcementForm.endTime || undefined,
    }
    if (editingAnnouncement.value) {
      await updateAnnouncement(editingAnnouncement.value.id, payload)
      message.success('更新成功')
    } else {
      await createAnnouncement(payload)
      message.success('创建成功')
    }
    dialogVisible.value = false
    void loadAnnouncements()
  } catch (error) {
    if (getHttpStatus(error) === 404) {
      await handleAnnouncementNotFound('公告不存在或已被删除，列表已自动刷新')
      return
    }
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (announcement: any) => {
  try {
    await updateAnnouncement(announcement.id, { isActive: announcement.isActive })
    message.success(announcement.isActive ? '已启用' : '已禁用')
    void loadAnnouncements()
  } catch (error) {
    if (getHttpStatus(error) === 404) {
      announcement.isActive = !announcement.isActive
      await handleAnnouncementNotFound('公告不存在或已被删除，列表已自动刷新')
      return
    }
    message.error('状态更新失败')
    announcement.isActive = !announcement.isActive
  }
}

const handleDelete = async (announcement: any) => {
  try {
    await messageBox.confirm('确定要删除此公告吗？', '确认', {
      type: 'warning',
    })

    await deleteAnnouncement(announcement.id)

    message.success('删除成功')
    void loadAnnouncements()
  } catch (error: any) {
    if (getHttpStatus(error) === 404) {
      await handleAnnouncementNotFound('公告不存在或已被删除，列表已自动刷新')
      return
    }
    if (error !== 'cancel') {
      message.error('删除失败')
    }
  }
}

onMounted(() => {
  void loadAnnouncements()
})
</script>

<style scoped lang="scss">
.announcement-management {
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

// 统计卡片
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  border: 1px solid #e5e7eb;

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .stat-label {
    font-size: 13px;
    color: #6b7280;
  }

  &.total {
    .stat-icon {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    .stat-value {
      color: #3b82f6;
    }
  }

  &.active {
    .stat-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .stat-value {
      color: #10b981;
    }
  }

  &.views {
    .stat-icon {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
    .stat-value {
      color: #8b5cf6;
    }
  }
}

// 筛选器
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
  margin-left: auto;
}

// 公告列表卡片
.announcement-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.title-cell {
  display: flex;
  flex-direction: column;

  .title {
    font-weight: 500;
    color: #374151;
  }

  .content-preview {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 300px;
  }
}

.type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.info {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }

  &.warning {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.notice {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
}

.target-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;

  &.high {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.medium {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.low {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }
}

.view-count {
  font-weight: 500;
  color: #374151;
}

.action-btns {
  display: flex;
  gap: 8px;
}

// 分页
.pagination-card {
  display: flex;
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
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px 10px;
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

.form-hint {
  margin: 0 12px;
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }

  .filters-card {
    flex-direction: column;
    align-items: stretch;

    .filter-group {
      flex-direction: column;
      align-items: stretch;

      > .el-select {
        width: 100%;
      }
    }

    .filter-actions {
      margin-left: 0;
    }
  }
}
</style>
