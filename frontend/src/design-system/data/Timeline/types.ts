/**
 * Timeline 类型定义
 */

export interface TimelineItemProps {
  /** 时间戳 */
  timestamp?: string
  /** 标题 */
  title?: string
  /** 描述内容 */
  description?: string
  /** 节点颜色类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 是否为 hollow 空心节点 */
  hollow?: boolean
  /** 节点大小 */
  size?: 'default' | 'big'
  /** 是否隐藏连接线 */
  hideLine?: boolean
  /** 是否为 pending 状态（闪烁） */
  pending?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 额外样式类 */
  class?: string
}

export interface TimelineProps {
  /** 时间线方向 */
  orientation?: 'vertical' | 'horizontal'
  /** 时间线位置 */
  placement?: 'left' | 'right' | 'alternate'
  /** 额外样式类 */
  class?: string
}
