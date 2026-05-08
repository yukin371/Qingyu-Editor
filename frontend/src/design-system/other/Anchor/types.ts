/**
 * Anchor 锚点组件类型定义
 */

// Anchor 方向类型
export type AnchorDirection = 'vertical' | 'horizontal'

// Anchor 项目类型
export interface AnchorItem {
  /**
   * 锚点的唯一标识
   */
  key: string
  
  /**
   * 锚点的标题
   */
  title: string
  
  /**
   * 锚点的链接 href
   */
  href: string
  
  /**
   * 目标
   */
  target?: string
  
  /**
   * 子锚点
   */
  children?: AnchorItem[]
}

// Anchor Props 接口
export interface AnchorProps {
  /**
   * 锚点列表
   */
  items?: AnchorItem[]
  
  /**
   * 滚动容器选择器
   * @default 'body'
   */
  container?: string | (() => HTMLElement)
  
  /**
   * 滚触发的偏移量
   * @default 0
   */
  offset?: number
  
  /**
   * 锚点区域边界
   * @default 5
   */
  bounds?: number
  
  /**
   * 锚点方向
   * @default 'vertical'
   */
  direction?: AnchorDirection
  
  /**
   * 自定义获取当前激活锚点的方法
   */
  getCurrentAnchor?: (activeLink: string) => string
  
  /**
   * 是否显示小圆点标记
   * @default true
   */
  marker?: boolean
  
  /**
   * 是否显示线条连接
   * @default true
   */
  showLine?: boolean
  
  /**
   * 固定定位
   * @default false
   */
  affix?: boolean
  
  /**
   * 固定定位的偏移距离
   * @default 0
   */
  offsetTop?: number
  
  /**
   * 点击锚点是否平滑滚动
   * @default true
   */
  smooth?: boolean
  
  /**
   * 自定义类名
   */
  class?: any
  
  /**
   * 自定义样式
   */
  style?: any
  
  /**
   * 当前激活的锚点（受控模式）
   */
  activeLink?: string
}

// Anchor 事件定义
export interface AnchorEmits {
  /**
   * 点击锚点时触发
   */
  click: [e: MouseEvent, link: { href: string; title: string; key: string }]
  
  /**
   * 当前激活锚点变化时触发
   */
  change: [currentActiveLink: string]
}

// Anchor 插槽定义
export interface AnchorSlots {
  /**
   * 自定义锚点内容渲染
   */
  default?: (props: { item: AnchorItem }) => any
  
  /**
   * 自定义标记渲染
   */
  marker?: (props: { item: AnchorItem; isActive: boolean }) => any
}

// AnchorLink Props 接口
export interface AnchorLinkProps {
  /**
   * 锚点链接
   */
  href: string
  
  /**
   * 锚点标题
   */
  title: string
  
  /**
   * 锚点唯一标识
   */
  key?: string
  
  /**
   * 目标
   */
  target?: string
}

// Anchor 组件默认属性
export const anchorDefaults = {
  container: 'body',
  offset: 0,
  bounds: 5,
  direction: 'vertical' as const,
  marker: true,
  showLine: true,
  affix: false,
  offsetTop: 0,
  smooth: true,
}

// AnchorLink 组件默认属性
export const anchorLinkDefaults: Partial<AnchorLinkProps> = {
  target: '_self',
}
