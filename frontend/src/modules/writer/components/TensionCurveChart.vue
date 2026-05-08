<template>
  <div class="tension-curve-chart">
    <svg
      v-if="data.length > 0"
      class="tension-curve-canvas"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
    >
      <!-- 网格线 -->
      <g class="grid-lines">
        <line
          v-for="i in 5"
          :key="`grid-${i}`"
          :x1="padding"
          :y1="padding + (height - 2 * padding) * (i - 1) / 4"
          :x2="width - padding"
          :y2="padding + (height - 2 * padding) * (i - 1) / 4"
          stroke="#e5e7eb"
          stroke-dasharray="4"
        />
      </g>

      <!-- 张力曲线路径 -->
      <path
        class="tension-curve-path"
        :d="curvePath"
        fill="none"
        stroke="var(--el-color-primary)"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- 填充区域 -->
      <path
        class="tension-curve-area"
        :d="areaPath"
        fill="var(--el-color-primary-light-9)"
        opacity="0.3"
      />

      <!-- 数据点 -->
      <g class="tension-points">
        <circle
          v-for="(point, index) in points"
          :key="`point-${index}`"
          class="tension-point"
          :cx="point.x"
          :cy="point.y"
          r="6"
          fill="var(--el-color-primary)"
          stroke="#fff"
          stroke-width="2"
          @click="handlePointClick(point, index)"
          style="cursor: pointer"
        />
      </g>

      <!-- 章节标签 -->
      <g class="chapter-labels">
        <text
          v-for="(point, index) in points"
          :key="`label-${index}`"
          class="chapter-label"
          :x="point.x"
          :y="height - 5"
          text-anchor="middle"
          font-size="12"
          fill="#666"
        >
          {{ data[index].label || `第${data[index].chapter}章` }}
        </text>
      </g>
    </svg>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <QyIcon name="DataAnalysis" :size="48" />
      <p>暂无张力数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'

interface TensionPoint {
  chapter: number
  tension: number
  label?: string
}

interface Props {
  data: TensionPoint[]
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 500,
  height: 300
})

const emit = defineEmits<{
  pointClick: [point: TensionPoint, index: number]
}>()

const padding = 40

// 计算数据点坐标
const points = computed(() => {
  const { data, width, height } = props
  if (data.length === 0) return []

  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // 找出最大张力值用于Y轴缩放
  const maxTension = Math.max(...data.map(d => d.tension), 100)

  return data.map((d, i) => ({
    x: padding + (chartWidth / (data.length - 1 || 1)) * i,
    y: height - padding - (d.tension / maxTension) * chartHeight,
    data: d
  }))
})

// monotone三次样条插值生成曲线路径
const curvePath = computed(() => {
  if (points.value.length < 2) return ''

  const pts = points.value

  // monotone插值算法
  let path = `M ${pts[0].x} ${pts[0].y}`

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[Math.min(pts.length - 1, i + 1)]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]

    // 计算控制点（monotone插值简化版）
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return path
})

// 填充区域路径
const areaPath = computed(() => {
  if (points.value.length < 2) return ''

  const { height } = props
  const curve = curvePath.value
  const first = points.value[0]
  const last = points.value[points.value.length - 1]

  return `${curve} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`
})

const handlePointClick = (point: { x: number; y: number; data: TensionPoint }, index: number) => {
  emit('pointClick', point.data, index)
}
</script>

<style scoped lang="scss">
.tension-curve-chart {
  width: 100%;
  height: 100%;

  svg {
    display: block;
    margin: 0 auto;
  }
}

.tension-point {
  transition: r 0.2s ease;

  &:hover {
    r: 8;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: var(--el-text-color-placeholder);
  gap: 12px;
}
</style>
