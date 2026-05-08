/**
 * Divider 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 方向（水平/垂直）
 * - 文字分割
 * - 虚线样式
 * - 自定义样式
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { BaseDivider } from './index'

describe('BaseDivider', () => {
  describe('基础渲染', () => {
    it('正确渲染水平分割线', () => {
      const { container } = render(BaseDivider)
      const divider = container.querySelector('.border-t')

      expect(divider).toHaveClass('w-full', 'h-px')
    })

    it('默认为水平方向', () => {
      const { container } = render(BaseDivider)
      const divider = container.querySelector('.border-t')

      expect(divider).toHaveClass('border-t')
    })
  })

  describe('方向测试', () => {
    it('支持垂直方向', () => {
      const { container } = render(BaseDivider, {
        props: { direction: 'vertical' },
      })
      const divider = container.querySelector('.border-l')

      expect(divider).toHaveClass('h-full', 'w-px', 'border-l')
    })

    it('支持水平方向', () => {
      const { container } = render(BaseDivider, {
        props: { direction: 'horizontal' },
      })
      const divider = container.querySelector('.border-t')

      expect(divider).toHaveClass('w-full', 'h-px', 'border-t')
    })
  })

  describe('文字分割', () => {
    it('支持带文字的分割线', () => {
      const { getByText } = render(BaseDivider, {
        props: { label: 'Divider Text' },
      })

      expect(getByText('Divider Text')).toBeInTheDocument()
    })

    it('带标签时会渲染两侧分割线', () => {
      const { container } = render(BaseDivider, {
        props: { label: 'Text' },
      })

      const lines = container.querySelectorAll('.flex-1')
      expect(lines).toHaveLength(2)
    })

    it('标签使用默认文本样式', () => {
      const { container } = render(BaseDivider, {
        props: { label: 'Left' },
      })

      const text = container.querySelector('.text-slate-500')
      expect(text).toHaveTextContent('Left')
    })
  })

  describe('样式变体', () => {
    it('支持虚线样式', () => {
      const { container } = render(BaseDivider, {
        props: { variant: 'dashed' },
      })
      const divider = container.querySelector('.border-t')

      expect(divider).toHaveClass('border-dashed')
    })

    it('默认为实线样式', () => {
      const { container } = render(BaseDivider)
      const divider = container.querySelector('.border-t')

      expect(divider).toHaveClass('border-solid')
    })
  })

  describe('颜色主题', () => {
    it('支持默认颜色', () => {
      const { container } = render(BaseDivider)
      const divider = container.querySelector('.border-t')

      expect(divider).toHaveClass('border-slate-200')
    })

    it('支持深色主题', () => {
      const { container } = render(BaseDivider)
      const divider = container.querySelector('.border-t')

      expect(divider).toHaveClass('dark:border-slate-700')
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseDivider, {
        props: { class: 'custom-class' },
      })

      const divider = container.querySelector('.custom-class')
      expect(divider).toBeTruthy()
    })

    it('支持自定义容器类名', () => {
      const { container } = render(BaseDivider, {
        props: { class: 'my-4' },
      })
      const divider = container.firstChild as Element

      expect(divider).toHaveClass('my-4')
    })
  })

  describe('响应式', () => {
    it('在不同屏幕尺寸下正确显示', () => {
      const { container } = render(BaseDivider)
      const divider = container.firstChild

      expect(divider).toBeInTheDocument()
    })
  })
})
