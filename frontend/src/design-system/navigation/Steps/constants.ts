/**
 * Steps 组件常量和类型导出
 *
 * 用于在子组件中注入 Steps 上下文
 */

import { type InjectionKey, type Ref } from 'vue'
import type { StepsDirection, StepStatus } from './types'

/**
 * Steps 上下文类型
 */
export interface StepsContext {
  currentStep: Ref<number>
  direction: Ref<StepsDirection>
  simple: Ref<boolean>
  finishStatus: Ref<StepStatus>
  processStatus: Ref<StepStatus>
  stepCount: Ref<number>
  handleClick: (index: number) => void
}

/**
 * Steps 上下文注入键
 */
export const STEPS_KEY: InjectionKey<StepsContext> = Symbol('Steps')
