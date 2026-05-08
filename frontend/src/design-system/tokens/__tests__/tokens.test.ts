/**
 * 设计令牌测试
 * 验证所有令牌的正确性和一致性
 */

import { describe, it, expect } from 'vitest'
import { colors, primary, secondary, gradient } from '../colors'
import { qingyuTheme } from '../theme'
import { spacing, base, component } from '../spacing'
import { typography, fontSize, fontFamily } from '../typography'

describe('设计令牌 - 颜色', () => {
  it('primary 应该使用 cyan 色系', () => {
    expect(primary[500]).toBe('#06b6d4')
    expect(primary[400]).toBe('#22d3ee')
    expect(primary[600]).toBe('#0891b2')
  })

  it('secondary 应该使用 blue 色系', () => {
    expect(secondary[500]).toBe('#3b82f6')
    expect(secondary[600]).toBe('#2563eb')
  })

  it('gradient 应该匹配 qingyuTheme', () => {
    expect(gradient.from).toBe(qingyuTheme.gradient.from)
    expect(gradient.to).toBe(qingyuTheme.gradient.to)
  })

  it('colors 应该包含所有必需的颜色类型', () => {
    expect(colors).toHaveProperty('primary')
    expect(colors).toHaveProperty('secondary')
    expect(colors).toHaveProperty('gradient')
    expect(colors).toHaveProperty('success')
    expect(colors).toHaveProperty('warning')
    expect(colors).toHaveProperty('danger')
    expect(colors).toHaveProperty('info')
    expect(colors).toHaveProperty('neutral')
  })
})

describe('设计令牌 - 间距', () => {
  it('spacing 应该包含基础间距单位', () => {
    expect(base).toHaveProperty('0')
    expect(base).toHaveProperty('4')
    expect(base).toHaveProperty('8')
  })

  it('spacing 值应该是 rem 单位', () => {
    expect(base[4]).toBe('1rem')
    expect(base[8]).toBe('2rem')
  })

  it('spacing 应该包含语义化间距预设', () => {
    expect(spacing).toHaveProperty('padding')
    expect(spacing).toHaveProperty('margin')
    expect(spacing).toHaveProperty('gap')
  })

  it('组件间距应该存在', () => {
    expect(component).toHaveProperty('button')
    expect(component).toHaveProperty('input')
    expect(component).toHaveProperty('card')
  })
})

describe('设计令牌 - 字体', () => {
  it('fontFamily 应该包含字体族定义', () => {
    expect(fontFamily).toHaveProperty('sans')
    expect(fontFamily).toHaveProperty('mono')
  })

  it('fontSize 应该包含标准尺寸', () => {
    expect(fontSize).toHaveProperty('xs')
    expect(fontSize).toHaveProperty('sm')
    expect(fontSize).toHaveProperty('base')
    expect(fontSize).toHaveProperty('lg')
    expect(fontSize).toHaveProperty('xl')
  })

  it('typography 应该包含语义化预设', () => {
    expect(typography).toHaveProperty('heading')
    expect(typography).toHaveProperty('body')
    expect(typography).toHaveProperty('label')
    expect(typography).toHaveProperty('code')
  })
})

describe('设计令牌 - 主题一致性', () => {
  it('colors.ts 和 theme.ts 应该使用相同的颜色值', () => {
    expect(primary[500]).toBe(qingyuTheme.primary[500])
    expect(secondary[500]).toBe(qingyuTheme.secondary[500])
  })

  it('gradient 应该在两个文件中保持一致', () => {
    expect(gradient.from).toBe(qingyuTheme.gradient.from)
    expect(gradient.to).toBe(qingyuTheme.gradient.to)
  })

  it('功能色应该在两个文件中保持一致', () => {
    // colors.ts 使用 DEFAULT 属性，theme.ts 使用完整的色阶
    // DEFAULT 对应 500 色阶
    expect(colors.success.DEFAULT).toBe(qingyuTheme.success[500])
    expect(colors.warning.DEFAULT).toBe(qingyuTheme.warning[500])
    expect(colors.danger.DEFAULT).toBe(qingyuTheme.danger[500])
    expect(colors.info.DEFAULT).toBe(qingyuTheme.info[500])
  })
})
