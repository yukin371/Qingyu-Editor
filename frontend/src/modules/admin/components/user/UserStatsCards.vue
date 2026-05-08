<template>
  <div class="stats-row">
    <div class="stat-item total">
      <div class="stat-icon">
        <el-icon :size="20"><User /></el-icon>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">总用户数</span>
      </div>
    </div>
    <div class="stat-item active">
      <div class="stat-icon">
        <el-icon :size="20"><CircleCheck /></el-icon>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ stats.active }}</span>
        <span class="stat-label">活跃用户</span>
      </div>
    </div>
    <div class="stat-item author">
      <div class="stat-icon">
        <el-icon :size="20"><EditPen /></el-icon>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ stats.authors }}</span>
        <span class="stat-label">作者</span>
      </div>
    </div>
    <div class="stat-item new">
      <div class="stat-icon">
        <el-icon :size="20"><TrendCharts /></el-icon>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ stats.newToday }}</span>
        <span class="stat-label">今日新增</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, CircleCheck, EditPen, TrendCharts } from '@element-plus/icons-vue'
import type { UserStats } from './types'

interface Props {
  /** 用户统计信息 */
  stats: UserStats
}

defineProps<Props>()
</script>

<style scoped lang="scss">
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

  &.author {
    .stat-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    .stat-value {
      color: #f59e0b;
    }
  }

  &.new {
    .stat-icon {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
    .stat-value {
      color: #8b5cf6;
    }
  }
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }
}
</style>
