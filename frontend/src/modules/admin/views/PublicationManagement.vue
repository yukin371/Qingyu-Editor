<template>
  <div class="publication-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">发布管理</h2>
        <p class="page-subtitle">审核作者发布到书城的书籍与章节</p>
      </div>
      <div class="header-actions">
        <el-button @click="loadPublications"> 刷新</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item pending">
        <div class="stat-icon">
          <el-icon :size="20"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">待审核</span>
        </div>
      </div>
      <div class="stat-item published">
        <div class="stat-icon">
          <el-icon :size="20"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.published }}</span>
          <span class="stat-label">已通过</span>
        </div>
      </div>
      <div class="stat-item rejected">
        <div class="stat-icon">
          <el-icon :size="20"><CircleClose /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.rejected }}</span>
          <span class="stat-label">已拒绝</span>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <div class="filters-main">
        <div class="filter-group filter-block">
          <span class="filter-label">类型</span>
          <el-select
            v-model="filters.type"
            placeholder="全部类型"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="全部" value="" />
            <el-option label="项目发布" value="project" />
            <el-option label="章节发布" value="document" />
          </el-select>
        </div>

        <div class="filter-group filter-block">
          <span class="filter-label">关键词</span>
          <el-input
            v-model="filters.keyword"
            placeholder="搜索标题"
            clearable
            @keyup.enter="handleFilterChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <div class="filters-actions">
        <el-button type="primary" @click="handleFilterChange">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 待审核列表 -->
    <div
      v-loading="loading"
      class="publication-list"
      :class="{ 'is-empty': publications.length === 0 && !loading }"
    >
      <el-empty v-if="publications.length === 0 && !loading" description="暂无待审核发布">
        <template #image>
          <el-icon :size="64" color="#d1d5db"><DocumentChecked /></el-icon>
        </template>
      </el-empty>

      <div v-for="item in publications" :key="item.id" class="publication-card">
        <div class="card-header">
          <div class="card-type" :class="item.type">
            {{ getTypeName(item.type) }}
          </div>
          <div class="card-title">{{ item.resourceTitle || '未命名' }}</div>
          <div class="card-time">{{ formatDate(item.createdAt) }}</div>
        </div>

        <div class="card-body">
          <div class="card-info">
            <div class="info-item">
              <span class="info-label">发布ID</span>
              <span class="info-value code">{{ item.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">提交者ID</span>
              <span class="info-value">{{ item.createdBy }}</span>
            </div>
          </div>

          <div v-if="item.metadata" class="card-meta">
            <span v-if="item.metadata.chapterTitle"> 章节: {{ item.metadata.chapterTitle }} </span>
            <span v-if="item.metadata.category"> 分类: {{ item.metadata.category }} </span>
          </div>
        </div>

        <div class="card-actions">
          <el-button type="success" size="small" @click="handleApprove(item)">
            <el-icon><Select /></el-icon>
            通过
          </el-button>
          <el-button type="danger" size="small" @click="handleReject(item)">
            <el-icon><CloseBold /></el-icon>
            拒绝
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-card">
      <div class="pagination-total">共 {{ total }} 条</div>
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="total"
        layout="prev, pager, next"
        @update:current-page="pagination.page = $event"
        @current-change="loadPublications"
      />
    </div>

    <!-- 审核详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="审核详情"
      width="700px"
      class="admin-modal-card"
      :append-to-body="true"
      :align-center="true"
    >
      <div v-if="currentItem" class="review-detail">
        <div class="detail-header">
          <div class="detail-type" :class="currentItem.type">
            {{ getTypeName(currentItem.type) }}
          </div>
          <div class="detail-time">{{ formatDate(currentItem.createdAt) }}</div>
        </div>
        <div class="detail-info">
          <div class="info-item">
            <span class="info-label">发布ID</span>
            <span class="info-value code">{{ currentItem.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">资源ID</span>
            <span class="info-value code">{{ currentItem.resourceId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">提交者</span>
            <span class="info-value">{{ currentItem.createdBy }}</span>
          </div>
        </div>
        <div v-if="currentItem.metadata" class="content-preview">
          <h4>元数据</h4>
          <div class="content-text">
            <div
              v-for="(value, key) in Object.entries(currentItem.metadata)"
              :key="key"
              class="meta-item"
            >
              <span class="meta-label">{{ key }}:</span>
              <span class="meta-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="danger" @click="handleReject(currentItem!)">拒绝</el-button>
        <el-button type="success" @click="handleApprove(currentItem!)">通过</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝原因"
      width="500px"
      class="admin-modal-card"
      :append-to-body="true"
      :align-center="true"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  Clock,
  CircleCheck,
  CircleClose,
  Search,
  DocumentChecked,
  CloseBold,
  Select,
} from '@element-plus/icons-vue'
import { getPendingPublications, reviewPublication } from '@admin/api/publication.api'

import * as adminAPI from '@admin/api'

interface PendingPublication {
  id: string
  type?: string
  resourceId?: string
  resourceTitle?: string
  createdAt?: string
  createdBy?: string
  metadata?: Record<string, string | number | boolean | null | undefined>
}

const stats = reactive({
  pending: 0,
  published: 0,
  rejected: 0,
})

const filters = reactive({
  type: '',
  keyword: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
})

const loading = ref(false)
const publications = ref<PendingPublication[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentItem = ref<PendingPublication | null>(null)
const submitting = ref(false)
const rejectForm = reactive({
  reason: '',
})

const getTypeName = (type?: string): string => {
  const typeMap: Record<string, string> = {
    project: '项目发布',
    document: '章节发布',
  }
  return typeMap[type ?? ''] || type || '未知类型'
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const loadPublications = async () => {
  loading.value = true
  try {
    const response = await getPendingPublications({
      page: pagination.page,
      pageSize: pagination.pageSize,
      type: filters.type || undefined,
      keyword: filters.keyword || undefined,
    })
    const data = (response as any)?.data ?? response ?? {}
    const items = Array.isArray(data?.items) ? data.items : []
    const totalCount = Number(data?.total ?? data?.pagination?.total ?? 0)
    publications.value = items
    total.value = totalCount
  } catch (error) {
    console.error('加载发布列表失败:', error)
    publications.value = []
    total.value = 0
    message.error('加载发布列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const statsResponse = await adminAPI.getAuditStatistics()
    const data = (statsResponse as any)?.data ?? statsResponse ?? {}
    // 从仪表板API获取pendingAudits（包含发布记录）

    const dashboardResponse = await adminAPI.getStats()
    const dashData = (dashboardResponse as any)?.data ?? dashboardResponse ?? {}

    stats.pending = Number(dashData?.pendingAudits ?? data?.pending ?? 0)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleFilterChange = () => {
  pagination.page = 1
  loadPublications()
}

const handleApprove = async (item: PendingPublication) => {
  try {
    await messageBox.confirm('确认通过该发布吗？通过后书籍将上架到书城。', '确认通过', {
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
      type: 'confirm',
      center: true,
    })
    await reviewPublication(item.id, { action: 'approve' })
    message.success('通过成功，书籍已上架到书城')
    dialogVisible.value = false
    await Promise.all([loadStats(), loadPublications()])
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('审核失败:', error)
      message.error('审核失败')
    }
  }
}

const handleReject = (item: PendingPublication) => {
  currentItem.value = item
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    message.warning('请输入拒绝原因')
    return
  }
  if (!currentItem.value) return
  submitting.value = true
  try {
    await reviewPublication(currentItem.value.id, {
      action: 'reject',
      note: rejectForm.reason,
    })
    message.success('已拒绝该发布')
    rejectDialogVisible.value = false
    dialogVisible.value = false
    await Promise.all([loadStats(), loadPublications()])
  } catch (error) {
    console.error('拒绝失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  Promise.all([loadStats(), loadPublications()])
})
</script>

<style scoped lang="scss">
.publication-management {
  max-width: 1200px;
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
      font-size: 27px;
      font-weight: 700;
      color: #1a1a2a;
    }
    .page-subtitle {
      margin: 8px 0 0;
      color: #6b7280;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

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
    color: #1a1a2a;
  }

  .stat-label {
    font-size: 13px;
    color: #6b7280;
  }
  &.pending {
    .stat-icon {
      background: rgba(245, 87, 108, 0.1);
      color: #f5576c;
    }
    .stat-value {
      color: #f5576c;
    }
  }
  &.published {
    .stat-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .stat-value {
      color: #10b981;
    }
  }
  &.rejected {
    .stat-icon {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    .stat-value {
      color: #ef4444;
    }
  }
}

.filters-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.filters-main {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  .filter-label {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
  }
  > .el-select {
    width: 200px;
  }
  > .el-input {
    width: 240px;
  }
}

.filter-block {
  flex: 1;
  padding: 10px 12px;
  background: #f8fafc;
}

.filter-block + .filter-block {
  border-left: 1px solid #e2e8f0;
}

.filters-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.publication-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.publication-list.is-empty {
  min-height: 220px;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.publication-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  transition: all 0.2s ease;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-type {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  &.project {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
  &.document {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2a;
  flex: 1;
}

.card-time {
  font-size: 13px;
  color: #9ca3af;
}

.card-body {
  margin-bottom: 12px;
}

.card-info {
  display: flex;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  .info-label {
    font-size: 12px;
    color: #9ca3af;
  }
  .info-value {
    font-size: 14px;
    color: #374151;
    &.code {
      font-family: monospace;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
    }
  }
}

.card-meta {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  span {
    font-size: 13px;
    color: #6b7280;
  }
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.pagination-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  .pagination-total {
    font-size: 14px;
    color: #64748b;
  }
}

.review-detail {
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f3f4f6;
  }
  .detail-type {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    &.project {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    &.document {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
  }
  .detail-time {
    font-size: 13px;
    color: #9ca3af;
  }
  .detail-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .info-label {
      font-size: 12px;
      color: #9ca3af;
    }
    .info-value {
      font-size: 14px;
      color: #374151;
      &.code {
        font-family: monospace;
        background: #f3f4f6;
        padding: 4px 8px;
        border-radius: 4px;
      }
    }
  }
  .content-preview {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
  }
  .content-text {
    padding: 16px;
    background: #f9fafb;
    border-radius: 12px;
  }
  .meta-item {
    display: flex;
    gap: 8px;
    .meta-label {
      font-size: 13px;
      color: #6b7280;
    }
    .meta-value {
      font-size: 13px;
      color: #374151;
    }
  }
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }
  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }
  .filters-main {
    flex-direction: column;
  }
  .filter-group {
    flex-direction: column;
    align-items: stretch;
    > .el-select,
    > .el-input {
      width: 100%;
    }
  }
  .filter-block + .filter-block {
    border-left: none;
    border-top: 1px solid #e2e8f0;
  }
  .pagination-card {
    padding: 18px 4px;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-start;
    .pagination-total {
      width: 100%;
      margin-bottom: 2px;
    }
  }
}
</style>
