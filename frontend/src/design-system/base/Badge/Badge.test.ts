/**
 * Badge 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 所有变体
 * - 尺寸
 * - 点状模式
 * - 数字徽标
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { BaseBadge } from './index'

describe('BaseBadge', () => {
  describe('基础渲染', () => {
    it('正确渲染徽标内容', () => {
      const { getByText } = render(BaseBadge, {
        props: { content: 5 },
      })

      expect(getByText('5')).toBeInTheDocument()
    })

    it('默认渲染为默认变体', () => {
      const { container } = render(BaseBadge, {
        props: { content: 'Badge' },
      })

      const badge = container.querySelector('.inline-flex')
      expect(badge).toHaveClass('text-slate-600')
      expect(badge).toHaveClass('ring-slate-200/85')
    })
  })

  describe('变体测试', () => {
    const variants = ['default', 'primary', 'success', 'warning', 'danger']

    it.each(variants)('正确渲染 %s 变体', (variant) => {
      const { container } = render(BaseBadge, {
        props: { variant, content: 'Badge' } as any,
      })

      const badge = container.firstChild
      expect(badge).toBeTruthy()
    })
  })

  describe('尺寸测试', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg']

    it.each(sizes)('正确渲染 %s 尺寸', (size) => {
      const { container } = render(BaseBadge, {
        props: { size, content: 'Badge' } as any,
      })

      const badge = container.firstChild
      expect(badge).toBeTruthy()
    })
  })

  describe('点状模式', () => {
    it('dot 模式渲染圆点', () => {
      const { container } = render(BaseBadge, {
        props: { dot: true },
      })

      const badge = container.querySelector('.rounded-full')
      expect(badge).toBeTruthy()
    })

    it('dot 模式下不显示内容', () => {
      const { container } = render(BaseBadge, {
        props: { dot: true },
        slots: { default: '99' },
      })

      const badge = container.firstChild
      expect(badge).not.toHaveTextContent('99')
    })
  })

  describe('数字徽标', () => {
    it('支持大数字显示', () => {
      const { getByText } = render(BaseBadge, {
        props: { content: 999, max: 999 } as any,
      })

      expect(getByText('999')).toBeInTheDocument()
    })

    it('支持 max 属性限制显示', () => {
      const { getByText } = render(BaseBadge, {
        props: { content: 100, max: 99 } as any,
      })

      expect(getByText('99+')).toBeInTheDocument()
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseBadge, {
        props: { class: 'custom-class', content: 'Badge' } as any,
      })

      const badge = container.querySelector('.custom-class')
      expect(badge).toBeTruthy()
    })
  })

  describe('定位样式', () => {
    it('支持 absolute 定位和自定义位置类', () => {
      const { container } = render(BaseBadge, {
        props: {
          absolute: true,
          position: 'top-2 left-2',
          content: '1',
        } as any,
      })

      const badge = container.firstChild
      expect(badge).toHaveClass('top-2')
      expect(badge).toHaveClass('left-2')
    })
  })
})
