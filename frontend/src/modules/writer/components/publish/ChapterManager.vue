<template>
  <div class="chapter-publish">
    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable>
        <el-option label="全部" value="" />
        <el-option label="草稿" value="draft" />
        <el-option label="审核中" value="pending_review" />
        <el-option label="已发布" value="published" />
        <el-option label="定时发布" value="scheduled" />
      </el-select>
      <el-button @click="$emit('refresh')">刷新</el-button>
    </div>

    <el-table :data="publishRecords" v-loading="loading" stripe :header-cell-style="{ textAlign: 'center' }" :cell-style="{ textAlign: 'center' }">
      <el-table-column prop="chapter_number" label="章节号" width="80" />
      <el-table-column prop="chapter_title" label="章节标题" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="180">
        <template #default="{ row }">
          {{ row.published_at ? formatDate(row.published_at) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'draft'"
            size="small"
            type="primary"
            @click="$emit('publish', row)"
          >
            发布
          </el-button>
          <el-button v-if="row.status === 'draft'" size="small" @click="$emit('schedule', row)">
            定时
          </el-button>
          <el-button
            v-if="row.status === 'published'"
            size="small"
            type="danger"
            @click="$emit('unpublish', row)"
          >
            下架
          </el-button>
          <el-button
            v-if="row.status === 'pending_review' || row.status === 'rejected'"
            size="small"
            type="warning"
            @click="$emit('view-review', row)"
          >
            查看审核
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @update:current-page="$emit('update:page', $event)"
      @update:page-size="$emit('update:pageSize', $event)"
      @current-change="$emit('page-change')"
      @size-change="$emit('page-change')"
      style="margin-top: 16px; justify-content: center"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PublishRecord } from '@/modules/writer/api'

const props = defineProps<{
  publishRecords: PublishRecord[]
  loading: boolean
  total: number
  page: number
  pageSize: number
  filterStatusValue: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'publish', record: PublishRecord): void
  (e: 'schedule', record: PublishRecord): void
  (e: 'unpublish', record: PublishRecord): void
  (e: 'view-review', record: PublishRecord): void
  (e: 'page-change'): void
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'update:filterStatusValue', status: string): void
}>()

// 双向绑定 - filterStatus
const filterStatus = computed({
  get: () => props.filterStatusValue,
  set: (val) => emit('update:filterStatusValue', val),
})

// 辅助函数
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    pending_review: '审核中',
    scheduled: '定时发布',
    published: '已发布',
    rejected: '已驳回',
    unpublished: '已下架',
  }
  return map[status] || status
}

const getStatusTagType = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    draft: 'info',
    pending_review: 'warning',
    scheduled: 'info',
    published: 'success',
    rejected: 'danger',
    unpublished: 'info',
  }
  return map[status] || 'info'
}
</script>

<style scoped lang="scss">
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.el-pagination) {
  display: flex;
}
</style>
