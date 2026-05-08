/**
 * Steps 组件类型定义
 */

/**
 * 步骤条方向
 */
export type StepsDirection = 'horizontal' | 'vertical'

/**
 * 步骤状态
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error' | 'success'

/**
 * Steps 组件 Props
 */
export interface StepsProps {
  /**
   * 当前激活步骤（从 0 开始）
   * @default 0
   */
  current?: number
  /**
   * 步骤条方向
   * @default 'horizontal'
   */
  direction?: StepsDirection
  /**
   * 标题居中（仅水平方向）
   * @default false
   */
  alignCenter?: boolean
  /**
   * 简洁模式
   * @default false
   */
  simple?: boolean
  /**
   * 完成步骤的状态
   * @default 'finish'
   */
  finishStatus?: StepStatus
  /**
   * 当前步骤的状态
   * @default 'process'
   */
  processStatus?: StepStatus
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * Step 组件 Props
 */
export interface StepProps {
  /**
   * 步骤标题
   */
  title?: string
  /**
   * 步骤描述
   */
  description?: string
  /**
   * 步骤图标
   */
  icon?: string
  /**
   * 步骤状态
   */
  status?: StepStatus
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * Steps 事件
 */
export interface StepsEmits {
  /**
   * 步骤变化时触发
   */
  change: [current: number, prevCurrent: number]
}

/**
 * Step 事件
 */
export interface StepEmits {
  /**
   * 点击步骤时触发
   */
  click: [index: number]
}
