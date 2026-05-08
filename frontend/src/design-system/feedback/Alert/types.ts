/**
 * Alert 组件类型定义
 */

// Alert 类型
export type AlertType = 'success' | 'info' | 'warning' | 'error'

// Alert 主题
export type AlertEffect = 'light' | 'dark'

// Alert Props 接口
export interface AlertProps {
  /**
   * Alert 类型
   * @default 'info'
   */
  type?: AlertType

  /**
   * 标题
   */
  title?: string

  /**
   * 描述内容
   */
  description?: string

  /**
   * 是否可关闭
   * @default false
   */
  closable?: boolean

  /**
   * 是否显示图标
   * @default true
   */
  showIcon?: boolean

  /**
   * 文字是否居中
   * @default false
   */
  center?: boolean

  /**
   * 主题
   * @default 'light'
   */
  effect?: AlertEffect

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 关闭事件
   */
  onClose?: () => void

  /**
   * 关闭动画结束后事件
   */
  onAfterClose?: () => void
}

// Alert 组件默认属性
export const alertDefaults: Partial<AlertProps> = {
  type: 'info',
  closable: false,
  showIcon: true,
  center: false,
  effect: 'light',
}
