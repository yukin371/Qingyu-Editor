<template>
  <div class="publish-stats">
    <!-- 指标卡片 -->
    <div class="stats-cards">
      <div v-for="card in indicatorCards" :key="card.key" class="indicator-card">
        <span class="indicator-label">{{ card.label }}</span>
        <span class="indicator-value" :class="card.colorClass">{{ card.value }}</span>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="charts-row">
      <!-- 发布趋势（CSS 柱状图） -->
      <div class="chart-card">
        <h4 class="chart-title">发布趋势（近7天）</h4>
        <div class="bar-chart">
          <div v-for="(bar, i) in trendBars" :key="i" class="bar-col">
            <span class="bar-value">{{ bar.value }}</span>
            <div class="bar-fill" :style="{ height: bar.heightPercent + '%' }" />
            <span class="bar-label">{{ bar.label }}</span>
          </div>
        </div>
      </div>

      <!-- 状态分布（CSS 进度条） -->
      <div class="chart-card">
        <h4 class="chart-title">状态分布</h4>
        <div class="distribution">
          <div v-for="item in distribution" :key="item.key" class="dist-row">
            <span class="dist-label">{{ item.label }}</span>
            <div class="dist-bar-track">
              <div
                class="dist-bar-fill"
                :class="item.barClass"
                :style="{ width: item.percent + '%' }"
              />
            </div>
            <span class="dist-percent">{{ item.percent }}%</span>
            <span class="dist-count">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { PublishStats } from '@/modules/writer/api'

const props = defineProps<{
  chapters: SidebarChapterSummary[]
  stats: PublishStats
}>()

// 指标卡片
const indicatorCards = computed(() => {
  const s = props.stats
  return [
    { key: 'total', label: '总章节', value: s.total_chapters, colorClass: '' },
    { key: 'published', label: '已发布', value: s.published_chapters, colorClass: 'color-success' },
    { key: 'draft', label: '草稿', value: s.draft_chapters, colorClass: 'color-info' },
    { key: 'planned', label: '计划中', value: s.scheduled_chapters, colorClass: 'color-warning' },
  ]
})

const createEmptyTrend = () => {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return {
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      count: 0,
    }
  })
}

// 趋势数据（真实记录，空数据兜底）
const trendBars = computed(() => {
  const trend = props.stats.recent_trend?.length ? props.stats.recent_trend : createEmptyTrend()
  const maxVal = Math.max(...trend.map((item) => Number(item.count || 0)), 1)

  return trend.map((item) => {
    const value = Number(item.count || 0)
    return {
      value,
      heightPercent: Math.max((value / maxVal) * 100, value > 0 ? 6 : 4),
      label: item.label,
    }
  })
})

// 状态分布
const distribution = computed(() => {
  const s = props.stats
  const total = Math.max(s.total_chapters, 1)
  return [
    {
      key: 'published',
      label: '已发布',
      count: s.published_chapters,
      percent: Math.round((s.published_chapters / total) * 100),
      barClass: 'bar-success',
    },
    {
      key: 'draft',
      label: '草稿',
      count: s.draft_chapters,
      percent: Math.round((s.draft_chapters / total) * 100),
      barClass: 'bar-info',
    },
    {
      key: 'pending_review',
      label: '审核中',
      count: s.pending_review_chapters,
      percent: Math.round((s.pending_review_chapters / total) * 100),
      barClass: 'bar-pending',
    },
    {
      key: 'scheduled',
      label: '计划中',
      count: s.scheduled_chapters,
      percent: Math.round((s.scheduled_chapters / total) * 100),
      barClass: 'bar-warning',
    },
  ]
})
</script>

<style scoped lang="scss">
.publish-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 指标卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.indicator-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--editor-border, #dbe6f6);
  background: var(--editor-bg-base, #fff);

  .indicator-label {
    font-size: 12px;
    color: var(--editor-text-muted, #64748b);
    font-weight: 600;
  }

  .indicator-value {
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    color: var(--editor-text-primary, #0f172a);

    &.color-success {
      color: #10b981;
    }
    &.color-info {
      color: #64748b;
    }
    &.color-warning {
      color: #f59e0b;
    }
  }

  .indicator-trend {
    font-size: 11px;
    font-weight: 600;

    &.trend-up {
      color: #10b981;
    }
    &.trend-down {
      color: #ef4444;
    }
  }
}

/* 图表行 */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.chart-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--editor-border, #dbe6f6);
  background: var(--editor-bg-base, #fff);
}

.chart-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--editor-text-primary, #1e293b);
}

/* CSS 柱状图 */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 140px;
  padding-top: 20px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}

.bar-value {
  font-size: 11px;
  font-weight: 700;
  color: var(--editor-text-muted, #64748b);
}

.bar-fill {
  width: 100%;
  max-width: 36px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
  min-height: 4px;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 10px;
  color: var(--editor-text-muted, #94a3b8);
  white-space: nowrap;
}

/* 状态分布 */
.distribution {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dist-row {
  display: grid;
  grid-template-columns: 56px 1fr 40px 36px;
  gap: 8px;
  align-items: center;
}

.dist-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--editor-text-muted, #64748b);
}

.dist-bar-track {
  height: 8px;
  border-radius: 4px;
  background: var(--editor-bg-elevated, #f1f5f9);
  overflow: hidden;
}

.dist-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;

  &.bar-success {
    background: #10b981;
  }
  &.bar-info {
    background: #94a3b8;
  }
  &.bar-pending {
    background: #f59e0b;
  }
  &.bar-warning {
    background: #f59e0b;
  }
}

.dist-percent {
  font-size: 12px;
  font-weight: 700;
  text-align: right;
  color: var(--editor-text-primary, #334155);
}

.dist-count {
  font-size: 11px;
  color: var(--editor-text-muted, #94a3b8);
  text-align: right;
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>
