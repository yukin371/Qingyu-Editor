/**
 * QyProgress 进度条组件
 *
 * 展示操作的当前进度，用于跟踪任务完成情况。
 *
 * @example
 * ```vue
 * <!-- 线性进度条 -->
 * <QyProgress :percentage="50" />
 *
 * <!-- 环形进度条 -->
 * <QyProgress type="circle" :percentage="75" />
 *
 * <!-- 仪表盘进度条 -->
 * <QyProgress type="dashboard" :percentage="80" />
 *
 * <!-- 自定义颜色 -->
 * <QyProgress :percentage="60" color="#10b981" />
 * ```
 */

import QyProgress from './QyProgress.vue'
export default QyProgress
export { QyProgress }

// 导出类型
export type * from './types'
