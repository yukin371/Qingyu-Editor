<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <slot name="extra"></slot>
    </div>
    <div class="chart-body">
      <div ref="chartRef" class="chart-container" :style="{ height: height }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { echarts } from '@/utils/echarts'
import type { ECharts, EChartsOption } from '@/utils/echarts'

interface Props {
  title: string
  option: EChartsOption
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px'
})

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(props.option)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 更新图表
const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption(props.option)
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听option变化
watch(
  () => props.option,
  () => {
    updateChart()
  },
  { deep: true }
)

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance) {
    window.removeEventListener('resize', handleResize)
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-body {
  position: relative;
}

.chart-container {
  width: 100%;
}
</style>
