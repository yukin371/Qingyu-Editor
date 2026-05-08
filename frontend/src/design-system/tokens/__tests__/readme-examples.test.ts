/**
 * README 文档代码示例验证测试
 *
 * 此测试验证 README.md 中的所有代码示例可以正常运行
 */

import { describe, it, expect } from 'vitest'

// 示例 1: TypeScript 组件 - 第一个代码示例
import { colors, spacing, fontSize } from '../index'

// 示例 2: 语义化颜色和组件间距
import { semantic, component, borderRadius } from '../index'

describe('README 代码示例验证', () => {
  describe('示例 1: TypeScript 组件', () => {
    it('应该正确访问 colors.primary[500]', () => {
      const buttonStyle = {
        backgroundColor: colors.primary[500],
      }
      expect(buttonStyle.backgroundColor).toBe('#06b6d4')
    })

    it('应该正确访问 spacing.padding.sm 和 spacing.padding.xl', () => {
      const buttonStyle = {
        padding: `${spacing.padding.sm} ${spacing.padding.xl}`,
      }
      expect(buttonStyle.padding).toBe('0.5rem 2rem')
    })

    it('应该正确访问 fontSize.base[0]', () => {
      const buttonStyle = {
        fontSize: fontSize.base[0],
      }
      expect(buttonStyle.fontSize).toBe('1rem')
    })

    it('完整的第一个代码示例应该可以正常运行', () => {
      const buttonStyle = {
        backgroundColor: colors.primary[500],      // '#06b6d4'
        padding: `${spacing.padding.sm} ${spacing.padding.xl}`,  // '0.5rem 2rem' = 8px 32px
        fontSize: fontSize.base[0],                // '1rem'
      }

      expect(buttonStyle.backgroundColor).toBe('#06b6d4')
      expect(buttonStyle.padding).toBe('0.5rem 2rem')
      expect(buttonStyle.fontSize).toBe('1rem')
    })
  })

  describe('示例 2: 语义化颜色和组件间距', () => {
    it('应该正确访问 semantic.background.DEFAULT', () => {
      const cardStyle = {
        backgroundColor: semantic.background.DEFAULT,
      }
      expect(cardStyle.backgroundColor).toBe('#f8fafc')
    })

    it('应该正确访问 component.card.md', () => {
      const cardStyle = {
        padding: component.card.md,
      }
      expect(cardStyle.padding).toBe('1.5rem')
    })

    it('应该正确访问 borderRadius.lg', () => {
      const cardStyle = {
        borderRadius: borderRadius.lg,
      }
      expect(cardStyle.borderRadius).toBe('0.5rem')
    })

    it('应该正确访问 semantic.text.primary', () => {
      const cardStyle = {
        color: semantic.text.primary,
      }
      expect(cardStyle.color).toBe('#0f172a')
    })

    it('应该正确访问 semantic.border.DEFAULT', () => {
      const cardStyle = {
        borderColor: semantic.border.DEFAULT,
      }
      expect(cardStyle.borderColor).toBe('#e2e8f0')
    })

    it('完整的第二个代码示例应该可以正常运行', () => {
      const cardStyle = {
        backgroundColor: semantic.background.DEFAULT,  // 使用中性色背景
        padding: component.card.md,                    // 24px 卡片内边距
        borderRadius: borderRadius.lg,                 // 8px 圆角
        color: semantic.text.primary,                  // 主要文本颜色
        borderColor: semantic.border.DEFAULT,          // 默认边框颜色
      }

      expect(cardStyle.backgroundColor).toBe('#f8fafc')
      expect(cardStyle.padding).toBe('1.5rem')
      expect(cardStyle.borderRadius).toBe('0.5rem')
      expect(cardStyle.color).toBe('#0f172a')
      expect(cardStyle.borderColor).toBe('#e2e8f0')
    })

    it('玻璃拟态卡片示例应该可以正常运行', () => {
      const glassCardStyle = {
        backgroundColor: semantic.background.paper,
        boxShadow: `0 ${semantic.shadow.light}`,
        padding: component.card.lg,
      }

      expect(glassCardStyle.backgroundColor).toBe('#ffffff')
      expect(glassCardStyle.boxShadow).toBe('0 rgba(0, 0, 0, 0.05)')
      expect(glassCardStyle.padding).toBe('2rem')
    })
  })

  describe('导入验证', () => {
    it('所有导入应该存在且可导出', () => {
      // 验证所有导入的模块都是对象
      expect(typeof colors).toBe('object')
      expect(typeof spacing).toBe('object')
      expect(typeof fontSize).toBe('object')
      expect(typeof semantic).toBe('object')
      expect(typeof component).toBe('object')
      expect(typeof borderRadius).toBe('object')

      // 验证关键属性存在
      expect(colors.primary).toBeDefined()
      expect(spacing.padding).toBeDefined()
      expect(fontSize.base).toBeDefined()
      expect(semantic.background).toBeDefined()
      expect(component.card).toBeDefined()
      expect(borderRadius.lg).toBeDefined()
    })

    it('所有属性路径应该存在', () => {
      // 第一个示例的属性路径
      expect(colors.primary[500]).toBe('#06b6d4')
      expect(spacing.padding.sm).toBe('0.5rem')
      expect(spacing.padding.xl).toBe('2rem')
      expect(fontSize.base[0]).toBe('1rem')

      // 第二个示例的属性路径
      expect(semantic.background.DEFAULT).toBe('#f8fafc')
      expect(component.card.md).toBe('1.5rem')
      expect(borderRadius.lg).toBe('0.5rem')
      expect(semantic.text.primary).toBe('#0f172a')
      expect(semantic.border.DEFAULT).toBe('#e2e8f0')
      expect(semantic.background.paper).toBe('#ffffff')
      expect(semantic.shadow.light).toBe('rgba(0, 0, 0, 0.05)')
      expect(component.card.lg).toBe('2rem')
    })
  })
})
