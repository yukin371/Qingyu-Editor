<template>
  <div class="stat-card" :class="{ clickable: !!onClick }" @click="handleClick">
    <div class="stat-icon" :style="{ background: iconBg }">
      <i :class="icon"></i>
    </div>
    <div class="stat-content">
      <div class="stat-value">{{ formattedValue }}</div>
      <div class="stat-title">{{ title }}</div>
      <div v-if="trend !== undefined" class="stat-trend" :class="trendClass">
        <i :class="trendIcon"></i>
        <span>{{ Math.abs(trend) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  icon: string
  iconBg?: string
  trend?: number
  format?: 'number' | 'currency' | 'percent'
  onClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  iconBg: '#409eff',
  format: 'number'
})

// 格式化数值
const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value

  switch (props.format) {
    case 'currency':
      return `¥${props.value.toLocaleString()}`
    case 'percent':
      return `${props.value}%`
    default:
      return props.value.toLocaleString()
  }
})

// 趋势样式
const trendClass = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'trend-up' : 'trend-down'
})

// 趋势图标
const trendIcon = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'el-icon-top' : 'el-icon-bottom'
})

const handleClick = () => {
  if (props.onClick) {
    props.onClick()
  }
}
</script>

<style scoped lang="scss">
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &.clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
  }
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 28px;
    color: #fff;
  }
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;

  &.trend-up {
    color: #67c23a;
    background: #f0f9ff;

    i {
      color: #67c23a;
    }
  }

  &.trend-down {
    color: #f56c6c;
    background: #fef0f0;

    i {
      color: #f56c6c;
    }
  }
}
</style>

