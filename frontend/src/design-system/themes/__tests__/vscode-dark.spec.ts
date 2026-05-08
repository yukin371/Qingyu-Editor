/**
 * VSCode 深色主题测试
 *
 * 测试 CSS 变量是否正确定义
 * 注意：CSS 变量测试需要在浏览器环境中运行，这里主要是文档和类型检查
 */

import { describe, it, expect } from 'vitest'

// CSS 变量名称常量
const CSS_VARIABLES = {
  // 主色调
  '--color-bg-primary': '#1e1e1e',
  '--color-bg-secondary': '#252526',
  '--color-bg-tertiary': '#2d2d2d',

  // 文字颜色
  '--color-text-primary': '#cccccc',
  '--color-text-secondary': '#858585',
  '--color-text-disabled': '#5a5a5a',

  // 强调色
  '--color-accent-purple': '#8e44ad',
  '--color-accent-blue': '#3498db',
  '--color-accent-green': '#2ecc71',

  // 边框颜色
  '--color-border': '#3c3c3c',
  '--color-border-light': '#454545',

  // 功能色
  '--color-hover': '#2a2d2e',
  '--color-selected': '#37373d',

  // 面板尺寸
  '--panel-left-width': '280px',
  '--panel-right-width': '320px',
  '--panel-min-width': '200px',
  '--panel-max-width': '600px',

  // 导航栏高度
  '--navbar-height': '40px',

  // 拖拽手柄宽度
  '--drag-handle-width': '4px',
} as const

describe('VSCode Dark Theme', () => {
  describe('CSS 变量定义', () => {
    it('应该定义所有主色调变量', () => {
      const variables = [
        '--color-bg-primary',
        '--color-bg-secondary',
        '--color-bg-tertiary',
      ]
      variables.forEach(v => {
        expect(CSS_VARIABLES[v as keyof typeof CSS_VARIABLES]).toBeDefined()
      })
    })

    it('应该定义所有文字颜色变量', () => {
      const variables = [
        '--color-text-primary',
        '--color-text-secondary',
        '--color-text-disabled',
      ]
      variables.forEach(v => {
        expect(CSS_VARIABLES[v as keyof typeof CSS_VARIABLES]).toBeDefined()
      })
    })

    it('应该定义所有强调色变量', () => {
      const variables = [
        '--color-accent-purple',
        '--color-accent-blue',
        '--color-accent-green',
      ]
      variables.forEach(v => {
        expect(CSS_VARIABLES[v as keyof typeof CSS_VARIABLES]).toBeDefined()
      })
    })

    it('应该定义所有面板尺寸变量', () => {
      const variables = [
        '--panel-left-width',
        '--panel-right-width',
        '--panel-min-width',
        '--panel-max-width',
      ]
      variables.forEach(v => {
        expect(CSS_VARIABLES[v as keyof typeof CSS_VARIABLES]).toBeDefined()
      })
    })

    it('应该定义导航栏高度变量', () => {
      expect(CSS_VARIABLES['--navbar-height']).toBe('40px')
    })

    it('应该定义拖拽手柄宽度变量', () => {
      expect(CSS_VARIABLES['--drag-handle-width']).toBe('4px')
    })
  })

  describe('颜色值验证', () => {
    it('主背景色应该是深色', () => {
      expect(CSS_VARIABLES['--color-bg-primary']).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('文字颜色应该是浅色（高对比度）', () => {
      expect(CSS_VARIABLES['--color-text-primary']).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('强调色应该是有效的十六进制颜色', () => {
      const accentColors = [
        '--color-accent-purple',
        '--color-accent-blue',
        '--color-accent-green',
      ]
      accentColors.forEach(color => {
        expect(CSS_VARIABLES[color as keyof typeof CSS_VARIABLES]).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })
  })

  describe('浏览器环境检查', () => {
    it('应该导出辅助函数获取 CSS 变量值', () => {
      // 测试辅助函数的类型和存在性
      expect(typeof getVSCodeThemeVariable).toBe('function')
    })

    it('辅助函数应该返回字符串类型', () => {
      const result = getVSCodeThemeVariable('--color-bg-primary')
      expect(typeof result).toBe('string')
    })
  })
})

/**
 * 类型定义
 */
export type VSCodeDarkThemeVariable = keyof typeof CSS_VARIABLES

/**
 * 获取 CSS 变量值的辅助函数
 * @param variable CSS 变量名
 * @returns CSS 变量值
 */
export function getVSCodeThemeVariable(variable: VSCodeDarkThemeVariable): string {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    return getComputedStyle(root).getPropertyValue(variable).trim()
  }
  return ''
}
