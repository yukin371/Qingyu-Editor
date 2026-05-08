<template>
  <div class="export-history">
    <el-table :data="exportHistory" v-loading="loading" stripe>
      <el-table-column label="格式" width="100">
        <template #default="{ row }">
          <el-tag>{{ row.format.toUpperCase() }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="范围" width="100">
        <template #default="{ row }">
          {{ getScopeLabel(row.scope) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getExportStatusType(row.status)">
            {{ getExportStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="进度" width="150">
        <template #default="{ row }">
          <el-progress
            :percentage="row.progress"
            :status="row.status === 'completed' ? 'success' : undefined"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'completed'"
            size="small"
            type="primary"
            @click="$emit('download', row)"
          >
            下载
          </el-button>
          <el-button
            v-if="row.status === 'pending' || row.status === 'processing'"
            size="small"
            @click="$emit('cancel', row)"
          >
            取消
          </el-button>
          <el-button size="small" type="danger" @click="$emit('delete', row)">
            删除
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
import type { ExportTask } from '@/modules/writer/api'
import { exportScopeOptions } from '@/modules/writer/api'

defineProps<{
  exportHistory: ExportTask[]
  loading: boolean
  total: number
  page: number
  pageSize: number
}>()

defineEmits<{
  (e: 'download', task: ExportTask): void
  (e: 'cancel', task: ExportTask): void
  (e: 'delete', task: ExportTask): void
  (e: 'page-change'): void
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', size: number): void
}>()

// 辅助函数
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getScopeLabel = (scope: string) => {
  return exportScopeOptions.find((o) => o.value === scope)?.label || scope
}

const getExportStatusType = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger',
  }
  return map[status] || 'info'
}

const getExportStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '等待中',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
  }
  return map[status] || status
}
</script>

<style scoped lang="scss">
:deep(.el-pagination) {
  display: flex;
}
</style>
