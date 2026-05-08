/**
 * Carousel 组件类型定义
 */

// 轮播方向
export type CarouselDirection = 'horizontal' | 'vertical'

// 触发方式
export type CarouselTrigger = 'click' | 'hover'

// 指示器位置
export type CarouselIndicatorPosition = 'none' | 'inside' | 'outside'

// 箭头显示方式
export type CarouselArrow = 'always' | 'hover' | 'never'

// 轮播类型
export type CarouselType = 'default' | 'dots' | 'card'

// Carousel 组件 Props 接口
export interface CarouselProps {
  /**
   * 轮播容器高度
   * @default '400px'
   */
  height?: string

  /**
   * 初始激活的索引
   * @default 0
   */
  initialIndex?: number

  /**
   * 指示器的触发方式
   * @default 'click'
   */
  trigger?: CarouselTrigger

  /**
   * 是否自动切换
   * @default false
   */
  autoplay?: boolean

  /**
   * 自动切换的时间间隔（毫秒）
   * @default 3000
   */
  interval?: number

  /**
   * 是否循环切换
   * @default true
   */
  loop?: boolean

  /**
   * 播放方向
   * @default 'horizontal'
   */
  direction?: CarouselDirection

  /**
   * 指示器位置
   * @default 'inside'
   */
  indicatorPosition?: CarouselIndicatorPosition

  /**
   * 轮播类型
   * @default 'default'
   */
  type?: CarouselType

  /**
   * 箭头显示方式
   * @default 'hover'
   */
  arrow?: CarouselArrow

  /**
   * 是否暂停自动切换
   * @default false
   */
  pauseOnHover?: boolean
}

// CarouselItem 组件 Props 接口
export interface CarouselItemProps {
  /**
   * 该轮播项的名称
   */
  name?: string | number

  /**
   * 是否懒加载
   * @default false
   */
  lazy?: boolean
}

// Carousel 组件 Emits 接口
export interface CarouselEmits {
  /**
   * 当前活跃的索引发生变化时触发
   * @param current 当前活跃的索引
   * @param prev 前一个活跃的索引
   */
  (e: 'change', current: number, prev: number): void
}

// Carousel 组件默认属性
export const carouselDefaults: Partial<CarouselProps> = {
  height: '400px',
  initialIndex: 0,
  trigger: 'click',
  autoplay: false,
  interval: 3000,
  loop: true,
  direction: 'horizontal',
  indicatorPosition: 'inside',
  type: 'default',
  arrow: 'hover',
  pauseOnHover: true,
}

// CarouselItem 组件默认属性
export const carouselItemDefaults: Partial<CarouselItemProps> = {
  lazy: false,
}
