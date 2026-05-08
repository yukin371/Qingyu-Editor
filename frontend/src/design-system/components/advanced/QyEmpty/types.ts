/**
 * QyEmpty component type definitions
 */

export type QyEmptyType =
  | 'default'   // 文件箱 - 通用无数据
  | 'ranking'   // 奖杯 - 榜单排名
  | 'list'      // 列表 - 目录纲要
  | 'search'    // 搜索 - 无搜索结果
  | 'book'      // 书籍 - 阅读相关
  | 'chart'    // 图表 - 统计分析
  | 'network'   // 网络 - 连接相关
  | 'favor'    // 收藏 - 书签喜欢

export interface QyEmptyProps {
  /**
   * 空状态插图类型
   */
  type?: QyEmptyType

  /**
   * Icon SVG string
   */
  icon?: string

  /**
   * Title text
   */
  title?: string

  /**
   * Description text
   */
  description?: string

  /**
   * Action button text
   */
  actionText?: string

  /**
   * Optional image URL (overrides icon)
   */
  image?: string

  /**
   * Icon size: 'small' | 'medium' | 'large'
   */
  iconSize?: 'small' | 'medium' | 'large'
}

export interface QyEmptyEmits {
  /**
   * Emitted when action button is clicked
   */
  (e: 'action'): void
}
