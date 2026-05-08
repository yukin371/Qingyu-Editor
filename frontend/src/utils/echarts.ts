import * as echarts from 'echarts/core'
import {
  BarChart,
  HeatmapChart,
  LineChart,
  PieChart,
} from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import { LegacyGridContainLabel } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  HeatmapChart,
  LineChart,
  PieChart,
  GridComponent,
  LegacyGridContainLabel,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
])

export { echarts }
export { graphic } from 'echarts/core'
export type { ECharts } from 'echarts/core'
export type { EChartsOption } from 'echarts'
