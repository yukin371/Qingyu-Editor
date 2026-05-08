<template>
  <div ref="chartRef" :style="{ height }" class="w-full"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { echarts } from '@/utils/echarts'
import type { ECharts, EChartsOption } from '@/utils/echarts'
import type { QuotaTrendPoint } from '@/api/admin/quota'

const props = withDefaults(
  defineProps<{
    points: QuotaTrendPoint[]
    mode?: 'dashboard' | 'report'
    height?: string
  }>(),
  {
    mode: 'dashboard',
    height: '320px',
  },
)

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

const option = computed<EChartsOption>(() => {
  const points = props.points ?? []
  const categories = points.map((point) => point.date)
  const consumptions = points.map((point) => point.consumption)
  const users = points.map((point) => point.users)

  return {
    color: ['#0f766e', '#2563eb'],
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748b' },
    },
    grid: {
      left: 24,
      right: 24,
      top: 24,
      bottom: 42,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: { color: '#64748b' },
        splitLine: { lineStyle: { color: '#e2e8f0' } },
      },
      {
        type: 'value',
        axisLabel: { color: '#64748b' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Token 消耗',
        type: props.mode === 'report' ? 'bar' : 'line',
        smooth: true,
        data: consumptions,
        barMaxWidth: 28,
        areaStyle:
          props.mode === 'dashboard'
            ? {
                color: 'rgba(15,118,110,0.12)',
              }
            : undefined,
      },
      {
        name: '活跃用户',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: users,
        lineStyle: { width: 2 },
      },
    ],
  }
})

const renderChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.getInstanceByDom(chartRef.value) || echarts.init(chartRef.value)
  chartInstance.setOption(option.value)
}

const resize = () => chartInstance?.resize()

watch(
  option,
  () => {
    renderChart()
  },
  { deep: true },
)

onMounted(() => {
  renderChart()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>
