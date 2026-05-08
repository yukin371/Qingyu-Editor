import type { EChartsOption } from 'echarts'
// 如果项目中已有 lodash，建议直接 import { merge } from 'lodash-es'
// 这里手写一个简单的 deepMerge 避免外部依赖
/**
 * 判断是否为纯对象
 */
function isPlainObject(obj: unknown): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * 深度合并函数
 * 
 * @template T 目标对象类型
 * @param target 目标对象 (会被修改，建议传入副本或空对象)
 * @param source 源对象
 * @returns 合并后的对象
 */
export function deepMerge<T extends object = Record<string, any>>(target: T, source: any): T {
  // 1. 基础防御
  if (!isPlainObject(source)) {
    return target
  }

  // 2. 确保 target 是对象
  const output = (isPlainObject(target) ? target : {}) as Record<string, any>

  // 3. 遍历 source 的 key
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key]
    const targetValue = output[key]

    // 4. 核心逻辑：
    // 如果双方都是纯对象，则递归合并
    // 注意：ECharts 中，数组通常应当被【替换】而不是【合并】（例如 series data, xAxis data）
    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      output[key] = deepMerge(targetValue, sourceValue)
    } else {
      // 其他情况（包括数组、基本类型、null），直接覆盖
      output[key] = sourceValue
    }
  })

  return output as T
}

/**
 * 默认主题颜色
 */
export const THEME_COLORS = {
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
  info: '#909399',
  text: '#303133',
  textLight: '#E5EAF3' // 暗色模式文字
}

/**
 * 图表色盘 (更现代的配色)
 */
export const CHART_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
]

// 基础配置生成器
const getBaseOption = (isDark = false): EChartsOption => ({
  backgroundColor: 'transparent', // 透明背景，适应容器
  color: CHART_COLORS,
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%', // 留出 Legend 空间
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
    borderColor: isDark ? '#333' : '#eee',
    borderWidth: 1,
    textStyle: {
      color: isDark ? '#fff' : '#333'
    },
    confine: true // 防止 Tooltip 超出图表范围
  },
  legend: {
    top: 0,
    itemWidth: 14,
    itemHeight: 14,
    textStyle: {
      color: isDark ? THEME_COLORS.textLight : THEME_COLORS.text
    }
  },
  // 统一坐标轴样式
  xAxis: {
    axisLine: { lineStyle: { color: isDark ? '#555' : '#ccc' } },
    axisLabel: { color: isDark ? '#aaa' : '#666' }
  },
  yAxis: {
    splitLine: { lineStyle: { type: 'dashed', color: isDark ? '#333' : '#eee' } },
    axisLabel: { color: isDark ? '#aaa' : '#666' }
  }
})

/**
 * 折线图配置
 */
export function createLineChartOption(
  xData: string[],
  series: { name: string; data: number[] }[],
  options?: EChartsOption,
  isDark = false
): EChartsOption {
  const base = getBaseOption(isDark)
  
  const config: EChartsOption = {
    ...base,
    // 修复：添加 || {}
    xAxis: deepMerge(base.xAxis || {}, {
      type: 'category',
      data: xData,
      boundaryGap: false
    }),
    // 修复：添加 || {}
    yAxis: deepMerge(base.yAxis || {}, {
      type: 'value'
    }),
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: s.data,
      areaStyle: { opacity: 0.2 }
    })),
    // 修复：添加 || {}
    legend: deepMerge(base.legend || {}, {
      data: series.map((s) => s.name)
    })
  }

  return deepMerge(config, options)
}

/**
 * 柱状图配置
 */
export function createBarChartOption(
  xData: string[],
  series: { name: string; data: number[] }[],
  options?: EChartsOption,
  isDark = false
): EChartsOption {
  const base = getBaseOption(isDark)

  const config: EChartsOption = {
    ...base,
    // 修复：添加 || {}
    xAxis: deepMerge(base.xAxis || {}, {
      type: 'category',
      data: xData
    }),
    yAxis: deepMerge(base.yAxis || {}, {
      type: 'value'
    }),
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      barMaxWidth: 40,
      itemStyle: { borderRadius: [4, 4, 0, 0] },
      data: s.data
    })),
    legend: deepMerge(base.legend || {}, {
      data: series.map((s) => s.name)
    })
  }

  return deepMerge(config, options)
}

/**
 * 饼图配置 (增强版)
 */
export function createPieChartOption(
  data: { name: string; value: number }[],
  options?: EChartsOption,
  isDark = false
): EChartsOption {
  const base = getBaseOption(isDark)

  const config: EChartsOption = {
    ...base,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)' // 简化 tooltip
    },
    legend: deepMerge(base.legend || {}, {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: data.map((d) => d.name)
    }),
    // 移除坐标轴配置，因为饼图不需要
    xAxis: undefined,
    yAxis: undefined,
    grid: undefined,
    
    series: [
      {
        name: 'Access Source',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true, // 开启防重叠
        itemStyle: {
          borderRadius: 6,
          borderColor: isDark ? '#1a1a1a' : '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#333'
          },
          scale: true,
          scaleSize: 10
        },
        labelLine: { show: false },
        data
      }
    ]
  }

  return deepMerge(config, options)
}

/**
 * 仪表盘配置 (精简版)
 */
export function createGaugeChartOption(
  value: number,
  name: string,
  options?: EChartsOption,
  isDark = false
): EChartsOption {
  // 仪表盘通常不需要 legend/grid/xAxis
  return deepMerge({
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: '90%',
        center: ['50%', '70%'], // 调整位置到底部
        itemStyle: {
          color: THEME_COLORS.primary
        },
        progress: {
          show: true,
          width: 18,
          roundCap: true
        },
        pointer: { show: false },
        axisLine: {
          roundCap: true,
          lineStyle: { 
            width: 18,
            color: [[1, isDark ? '#333' : '#E6EBF8']] // 背景槽颜色
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: {
          show: true,
          offsetCenter: [0, '30%'], // 标题位置
          fontSize: 14,
          color: isDark ? '#aaa' : '#999'
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-20%'], // 数值位置
          fontSize: 30,
          fontWeight: 'bold',
          formatter: '{value}%',
          color: isDark ? '#fff' : '#333'
        },
        data: [{ value, name }]
      }
    ]
  }, options)
}

/**
 * 多维雷达图
 */
export function createRadarChartOption(
  indicators: { name: string; max: number }[],
  data: { value: number[]; name: string }[],
  options?: EChartsOption,
  isDark = false
): EChartsOption {
  const base = getBaseOption(isDark)
  
  const config: EChartsOption = {
    ...base,
    // 雷达图没有 grid/xy轴
    grid: undefined, 
    xAxis: undefined, 
    yAxis: undefined,
    
    radar: {
      indicator: indicators,
      splitNumber: 4,
      axisName: {
        color: isDark ? '#ccc' : '#666'
      },
      splitLine: {
        lineStyle: {
          color: isDark ? ['#333'] : ['#ddd']
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: isDark 
            ? ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'] 
            : ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.1)']
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: data,
        symbol: 'none', // 去掉拐点，更简洁
        areaStyle: {
          opacity: 0.2
        }
      }
    ]
  }

  return deepMerge(config, options)
}