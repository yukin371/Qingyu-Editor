/**
 * Progress 组件类型定义
 */

// Progress 类型
export type ProgressType = 'line' | 'circle' | 'dashboard'

// Progress 状态
export type ProgressStatus = 'success' | 'exception' | 'warning' | 'active'

// Progress Props 接口
export interface ProgressProps {
  /**
   * 百分比（0-100）
   * @default 0
   */
  percentage?: number

  /**
   * Progress 类型
   * @default 'line'
   */
  type?: ProgressType

  /**
   * 线条粗细（line: px, circle/dashboard: 相对单位）
   * @default 6 for line, 6 for circle/dashboard
   */
  strokeWidth?: number

  /**
   * 状态
   */
  status?: ProgressStatus

  /**
   * 进度条颜色（支持字符串、字符串数组、函数）
   */
  color?: string | string[] | ((percentage: number) => string)

  /**
   * 是否显示条纹动画（仅 line 类型）
   * @default false
   */
  striped?: boolean

  /**
   * 是否为流动动画（仅 line 类型且 striped 为 true）
   * @default false
   */
  flow?: boolean

  /**
   * 文字是否在进度条内部（仅 line 类型）
   * @default false
   */
  textInside?: boolean

  /**
   * 是否显示百分比文字
   * @default true
   */
  showText?: boolean

  /**
   * 自定义文字内容
   */
  format?: (percentage: number) => string

  /**
   * 容器宽度（circle/dashboard 类型，单位 px）
   * @default 126
   */
  width?: number

  /**
   * 仪表盘角度（dashboard 类型，0-360）
   * @default 240
   */
  gapDegree?: number

  /**
   * 仪表盘起始位置（dashboard 类型）
   * @default 'top'
   */
  gapPosition?: 'top' | 'bottom' | 'left' | 'right'

  /**
   * 是否显示描边动画
   * @default true
   */
  animated?: boolean

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 自定义样式
   */
  style?: any
}

// Progress 组件默认属性
export const progressDefaults: Partial<ProgressProps> = {
  percentage: 0,
  type: 'line',
  strokeWidth: 6,
  status: undefined,
  color: undefined,
  striped: false,
  flow: false,
  textInside: false,
  showText: true,
  format: undefined,
  width: 126,
  gapDegree: 240,
  gapPosition: 'top',
  animated: true,
}
