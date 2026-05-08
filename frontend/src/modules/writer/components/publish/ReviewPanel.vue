<template>
  <div class="review-history">
    <!-- 审核统计 -->
    <el-row :gutter="20" class="review-stats">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总审核数" :value="reviewStats.total" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="通过" :value="reviewStats.approved">
            <template #suffix>
              <span style="color: #67c23a">({{ reviewStats.approvedRate }}%)</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="拒绝" :value="reviewStats.rejected">
            <template #suffix>
              <span style="color: #f56c6c">({{ reviewStats.rejectedRate }}%)</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="审核中" :value="reviewStats.pending" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 审核趋势图表 -->
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <h3>审核趋势</h3>
          <el-radio-group v-model="trendPeriod" size="small">
            <el-radio-button value="7d">近7天</el-radio-button>
            <el-radio-button value="30d">近30天</el-radio-button>
            <el-radio-button value="90d">近90天</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="chartRef" style="height: 300px"></div>
    </el-card>

    <!-- 审核历史列表 -->
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <h3>审核记录</h3>
          <div class="header-actions">
            <el-select v-model="filterStatus" placeholder="状态筛选" clearable size="small">
              <el-option label="全部" value="" />
              <el-option label="审核中" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
            <el-button size="small" @click="$emit('refresh')">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="reviewHistory" v-loading="loading" stripe>
        <el-table-column prop="chapter_title" label="章节标题" min-width="200" />
        <el-table-column prop="chapter_number" label="章节号" width="100" />
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getReviewStatusType(row.status)">
              {{ getReviewStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.submitted_at) }}
          </template>
        </el-table-column>
        <el-table-column label="审核时间" width="180">
          <template #default="{ row }">
            {{ row.reviewed_at ? formatDate(row.reviewed_at) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="审核人" width="120">
          <template #default="{ row }">
            {{ row.reviewer_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="$emit('view-detail', row)">
              查看详情
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { echarts } from '@/utils/echarts'
import type { ECharts } from '@/utils/echarts'
import type { ReviewRecord, ReviewStats } from '@/modules/writer/api/dashboard'

const props = defineProps<{
  reviewHistory: ReviewRecord[]
  reviewStats: ReviewStats
  loading: boolean
  total: number
  page: number
  pageSize: number
  filterStatusValue: string
  trendPeriodValue: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'view-detail', row: ReviewRecord): void
  (e: 'page-change'): void
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'update:filterStatusValue', status: string): void
  (e: 'update:trendPeriodValue', period: string): void
}>()

// 双向绑定
const filterStatus = computed({
  get: () => props.filterStatusValue,
  set: (val) => emit('update:filterStatusValue', val),
})

const trendPeriod = computed({
  get: () => props.trendPeriodValue,
  set: (val) => emit('update:trendPeriodValue', val),
})

// 图表引用
const chartRef = ref<HTMLElement | null>(null)
let chart: ECharts | null = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['提交审核', '审核通过', '审核拒绝'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '提交审核',
        type: 'line',
        data: [5, 8, 6, 9, 7, 4, 6],
        smooth: true,
        itemStyle: { color: '#409eff' },
      },
      {
        name: '审核通过',
        type: 'line',
        data: [4, 7, 5, 8, 6, 4, 5],
        smooth: true,
        itemStyle: { color: '#67c23a' },
      },
      {
        name: '审核拒绝',
        type: 'line',
        data: [1, 1, 1, 1, 1, 0, 1],
        smooth: true,
        itemStyle: { color: '#f56c6c' },
      },
    ],
  }

  chart.setOption(option)
}

// 监听周期变化
watch(trendPeriod, () => {
  // TODO: 根据周期重新加载图表数据
  initChart()
})

// 辅助函数
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getReviewStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return map[status] || status
}

const getReviewStatusType = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status] || 'info'
}

// 暴露初始化图表方法
defineExpose({
  initChart: () => {
    nextTick(() => {
      initChart()
    })
  },
})

onMounted(() => {
  // 图表初始化由父组件控制
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<style scoped lang="scss">
.review-stats {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

:deep(.el-pagination) {
  display: flex;
}
</style>
