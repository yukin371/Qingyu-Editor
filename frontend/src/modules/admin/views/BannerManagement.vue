<template>
  <div class="banner-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">Banner管理</h2>
        <p class="page-subtitle">管理首页轮播图Banner，控制展示顺序和状态</p>
      </div>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建Banner
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item total">
        <div class="stat-icon">
          <el-icon :size="20"><Picture /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总Banner数</span>
        </div>
      </div>
      <div class="stat-item active">
        <div class="stat-icon">
          <el-icon :size="20"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">已启用</span>
        </div>
      </div>
      <div class="stat-item views">
        <div class="stat-icon">
          <el-icon :size="20"><View /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalClicks.toLocaleString() }}</span>
          <span class="stat-label">总点击量</span>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <div class="filter-group">
        <span class="filter-label">目标类型</span>
        <el-select
          popper-class="admin-select-popper"
          v-model="filters.targetType"
          placeholder="全部类型"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="书籍" value="book" />
          <el-option label="分类" value="category" />
          <el-option label="外链" value="url" />
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
        <el-button @click="loadBanners">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- Banner列表 -->
    <div class="banner-card">
      <el-table
        v-loading="loading"
        :data="banners"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column label="预览" width="160">
          <template #default="{ row }">
            <div class="banner-preview">
              <el-image
                :src="row.image"
                fit="cover"
                style="width: 140px; height: 70px; border-radius: 8px"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon :size="24"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="150">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="title">{{ row.title }}</span>
              <span v-if="row.description" class="desc">{{ row.description }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="目标类型" width="100">
          <template #default="{ row }">
            <span class="type-tag" :class="row.targetType">
              <el-icon v-if="row.targetType === 'book'" :size="14"><Reading /></el-icon>
              <el-icon v-else-if="row.targetType === 'category'" :size="14"
                ><FolderOpened
              /></el-icon>
              <el-icon v-else :size="14"><Link /></el-icon>
              {{ getTypeLabel(row.targetType) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序" width="80">
          <template #default="{ row }">
            <span class="sort-badge">{{ row.sortOrder }}</span>
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

        <el-table-column prop="clickCount" label="点击量" width="100">
          <template #default="{ row }">
            <span class="click-count">{{ row.clickCount?.toLocaleString() || 0 }}</span>
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
          @current-change="loadBanners"
        />
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingBanner ? '编辑Banner' : '新建Banner'"
      width="600px"
      class="admin-modal-card"
      append-to-body
      align-center
    >
      <el-form :model="bannerForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="bannerForm.title" placeholder="请输入Banner标题" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="bannerForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入描述（可选）"
          />
        </el-form-item>

        <el-form-item label="图片URL" required>
          <el-input v-model="bannerForm.image" placeholder="请输入图片URL" />
        </el-form-item>

        <el-form-item label="预览" v-if="bannerForm.image">
          <el-image
            :src="bannerForm.image"
            fit="cover"
            style="width: 200px; height: 100px; border-radius: 8px"
          >
            <template #error>
              <div class="image-placeholder">图片加载失败</div>
            </template>
          </el-image>
        </el-form-item>

        <el-form-item label="目标类型" required>
          <el-select
            popper-class="admin-select-popper"
            v-model="bannerForm.targetType"
            style="width: 100%"
          >
            <el-option label="书籍" value="book" />
            <el-option label="分类" value="category" />
            <el-option label="外链" value="url" />
          </el-select>
        </el-form-item>

        <el-form-item label="跳转目标" required>
          <el-input v-model="bannerForm.target" placeholder="请输入跳转目标ID或URL" />
        </el-form-item>

        <el-form-item label="排序权重">
          <el-input-number
            v-model="bannerForm.sortOrder"
            :min="0"
            :max="999"
            style="width: 150px"
          />
          <span class="form-hint">数字越大越靠前</span>
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="bannerForm.isActive" />
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
  Picture,
  CircleCheck,
  View,
  Refresh,
  Reading,
  FolderOpened,
  Link,
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import { getBanners, createBanner, updateBanner, deleteBanner } from '../api'

// 筛选器
const filters = reactive({
  targetType: '',
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
  totalClicks: 0,
})

// 数据
const loading = ref(false)
const banners = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const editingBanner = ref<any | null>(null)
const submitting = ref(false)

const bannerForm = reactive({
  title: '',
  description: '',
  image: '',
  target: '',
  targetType: 'book',
  sortOrder: 0,
  isActive: true,
})

// 加载Banner列表
const loadBanners = async () => {
  loading.value = true
  try {
    const response = await getBanners({
      page: pagination.page,
      pageSize: pagination.pageSize,
      targetType: filters.targetType || undefined,
      status: filters.status || undefined,
    })
    banners.value = response.items
    total.value = response.total || 0
    stats.total = total.value
    stats.active = response.items.filter((banner) => banner.isActive).length
    stats.totalClicks = response.items.reduce(
      (sum, banner) => sum + Number(banner.clickCount || 0),
      0,
    )
  } catch (error) {
    console.error('加载Banner列表失败:', error)
    banners.value = []
    total.value = 0
    stats.total = 0
    stats.active = 0
    stats.totalClicks = 0
    message.error('加载Banner列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadBanners()
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    book: '书籍',
    category: '分类',
    url: '外链',
  }
  return labels[type] || type
}

const handleCreate = () => {
  editingBanner.value = null
  Object.assign(bannerForm, {
    title: '',
    description: '',
    image: '',
    target: '',
    targetType: 'book',
    sortOrder: 0,
    isActive: true,
  })
  dialogVisible.value = true
}

const handleEdit = (banner: any) => {
  editingBanner.value = banner
  Object.assign(bannerForm, {
    title: banner.title,
    description: banner.description,
    image: banner.image,
    target: banner.target,
    targetType: banner.targetType,
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!bannerForm.title || !bannerForm.image || !bannerForm.target) {
    message.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    if (editingBanner.value) {
      await updateBanner(editingBanner.value.id, bannerForm)
      message.success('更新成功')
    } else {
      await createBanner(bannerForm)
      message.success('创建成功')
    }
    dialogVisible.value = false
    void loadBanners()
  } catch (error) {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (banner: any) => {
  try {
    await updateBanner(banner.id, { isActive: banner.isActive })
    message.success(banner.isActive ? '已启用' : '已禁用')
    void loadBanners()
  } catch (error) {
    message.error('状态更新失败')
    banner.isActive = !banner.isActive
  }
}

const handleDelete = async (banner: any) => {
  try {
    await messageBox.confirm('确定要删除此Banner吗？', '确认', {
      type: 'warning',
    })

    await deleteBanner(banner.id)

    message.success('删除成功')
    void loadBanners()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('删除失败')
    }
  }
}

onMounted(() => {
  void loadBanners()
})
</script>

<style scoped lang="scss">
.banner-management {
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

// Banner列表卡片
.banner-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;

  // 表格行分隔线样式
  :deep(.el-table__body-wrapper) {
    .el-table__row {
      td {
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;
      }
    }

    .el-table__row:last-child {
      td {
        border-bottom: none;
      }
    }
  }

  :deep(.el-table__header-wrapper) {
    th {
      border-bottom: 1px solid #e5e7eb;
    }
  }
}

.banner-preview {
  .image-placeholder {
    width: 140px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 8px;
    color: #9ca3af;
  }
}

.title-cell {
  display: flex;
  flex-direction: column;

  .title {
    font-weight: 500;
    color: #374151;
  }

  .desc {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
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

  &.book {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }

  &.category {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  &.url {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }
}

.sort-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.click-count {
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
  margin-left: 12px;
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
