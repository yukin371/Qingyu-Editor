/**
 * QyPagination 分页器组件
 *
 * 数据分页时展示分页信息，支持页码跳转和每页数量选择。
 *
 * @example
 * ```vue
 * <!-- 基础用法 -->
 * <QyPagination
 *   v-model="currentPage"
 *   :total="100"
 *   :page-size="10"
 * />
 *
 * <!-- 带背景色 -->
 * <QyPagination
 *   v-model="currentPage"
 *   :total="100"
 *   background
 * />
 *
 * <!-- 显示总数和快速跳转 -->
 * <QyPagination
 *   v-model="currentPage"
 *   :total="1000"
 *   :page-size="[10, 20, 50, 100]"
 *   show-total
 *   show-quick-jumper
 * />
 * ```
 */

import QyPagination from './QyPagination.vue'
export default QyPagination
export { QyPagination }

// 导出类型
export type * from './types'
