<template>
  <div ref="chartRef" :style="{ height }" class="w-full"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { echarts } from '@/utils/echarts'
import type { ECharts, EChartsOption } from '@/utils/echarts'

type Datum = {
  name: string
  value: number
}

const props = withDefaults(
  defineProps<{
    data: Record<string, number> | Datum[]
    height?: string
    type?: 'pie' | 'bar'
  }>(),
  {
    height: '300px',
    type: 'pie',
  },
)

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

const normalized = computed<Datum[]>(() => {
  if (Array.isArray(props.data)) {
    return props.data.filter((item) => item.value > 0)
  }
  return Object.entries(props.data ?? {})
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0)
})

const option = computed<EChartsOption>(() => {
  if (props.type === 'bar') {
    return {
      color: ['#0f766e'],
      grid: { left: 16, right: 12, top: 18, bottom: 18, containLabel: true },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b' },
      },
      yAxis: {
        type: 'category',
        data: normalized.value.map((item) => item.name),
        axisLabel: { color: '#475569' },
        axisLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: normalized.value.map((item) => item.value),
          barMaxWidth: 24,
          itemStyle: {
            borderRadius: [0, 12, 12, 0],
          },
        },
      ],
    }
  }

  return {
    color: ['#2563eb', '#0f766e', '#d97706', '#e11d48', '#7c3aed', '#0891b2'],
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748b' },
    },
    series: [
      {
        type: 'pie',
        radius: ['38%', '70%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        label: {
          color: '#475569',
          formatter: '{b}',
        },
        data:
          normalized.value.length > 0
            ? normalized.value
            : [{ name: '暂无数据', value: 1, itemStyle: { color: '#cbd5e1' } }],
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
