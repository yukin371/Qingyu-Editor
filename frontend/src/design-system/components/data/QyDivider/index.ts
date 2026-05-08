/**
 * QyDivider 分割线组件
 *
 * 用于分隔内容区域的分割线，支持水平和垂直方向。
 *
 * @example
 * ```vue
 * <!-- 水平分割线 -->
 * <QyDivider />
 *
 * <!-- 带文字的分割线 -->
 * <QyDivider content="分隔文字" />
 *
 * <!-- 虚线分割线 -->
 * <QyDivider :dashed="true" />
 *
 * <!-- 垂直分割线 -->
 * <QyDivider direction="vertical" />
 * ```
 */

import QyDivider from './QyDivider.vue'
export default QyDivider
export { QyDivider }

// 导出类型
export type * from './types'
