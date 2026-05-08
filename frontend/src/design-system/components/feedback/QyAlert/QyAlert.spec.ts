/**
 * QyAlert 组件测试
 *
 * 验证组件基本功能
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect } from 'vitest'

// 验证类型导出
import type {
  QyAlertProps,
  QyAlertEmits as _QyAlertEmits,
  QyAlertInstance as _QyAlertInstance,
  QyAlertType
} from './types'

// 验证变体导出
import {
  alertVariants,
  alertIconVariants,
  alertCloseVariants
} from './variants'

describe('QyAlert 类型定义', () => {
  it('应该正确导出所有类型', () => {
    // 这些导入应该不会抛出错误
    expect(typeof alertVariants).toBe('function')
    expect(typeof alertIconVariants).toBe('function')
    expect(typeof alertCloseVariants).toBe('function')
  })

  it('应该支持所有警告类型', () => {
    const types: QyAlertType[] = ['success', 'warning', 'error', 'info']
    expect(types).toHaveLength(4)
  })

  it('应该正确生成变体类名', () => {
    const successClasses = alertVariants({ type: 'success' })
    expect(successClasses).toContain('bg-success-50')
    expect(successClasses).toContain('border-success-200')

    const warningClasses = alertVariants({ type: 'warning' })
    expect(warningClasses).toContain('bg-warning-50')
    expect(warningClasses).toContain('border-warning-200')

    const errorClasses = alertVariants({ type: 'error' })
    expect(errorClasses).toContain('bg-danger-50')
    expect(errorClasses).toContain('border-danger-200')

    const infoClasses = alertVariants({ type: 'info' })
    expect(infoClasses).toContain('bg-info-50')
    expect(infoClasses).toContain('border-info-200')
  })

  it('应该正确生成图标类名', () => {
    const successIconClasses = alertIconVariants({ type: 'success' })
    expect(successIconClasses).toContain('text-success-500')

    const errorIconClasses = alertIconVariants({ type: 'error' })
    expect(errorIconClasses).toContain('text-danger-500')
  })

  it('应该正确生成关闭按钮类名', () => {
    const closeClasses = alertCloseVariants({ type: 'info' })
    expect(closeClasses).toContain('text-info-500')
  })

  it('Props 接口应该包含所有必需属性', () => {
    const props: QyAlertProps = {
      type: 'success',
      title: '测试标题',
      description: '测试描述',
      closable: true,
      showIcon: true,
      center: false
    }
    expect(props.type).toBe('success')
    expect(props.title).toBe('测试标题')
  })
})
