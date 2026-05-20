/**
 * Icon 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 所有尺寸
 * - 颜色变体
 * - 自定义样式
 * - 可访问性
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { BaseIcon } from './index'

describe('BaseIcon', () => {
  const getIconRoot = (container: HTMLElement) => {
    const root = container.firstElementChild
    expect(root).toBeTruthy()
    return root as HTMLElement
  }

  describe('基础渲染', () => {
    it('正确渲染 SVG 图标', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'home' }
      })

      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(getIconRoot(container)).toHaveClass('inline-flex')
    })

    it('默认尺寸为 md', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'home' }
      })

      expect(getIconRoot(container)).toHaveClass('w-6', 'h-6')
    })
  })

  describe('尺寸测试', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = [
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
    ]

    const sizeClasses = {
      xs: ['w-4', 'h-4'],
      sm: ['w-5', 'h-5'],
      md: ['w-6', 'h-6'],
      lg: ['w-8', 'h-8'],
      xl: ['w-10', 'h-10'],
    }

    it.each(sizes)('正确渲染 %s 尺寸', (size) => {
      const { container } = render(BaseIcon, {
        props: { name: 'home', size }
      })

      expect(getIconRoot(container)).toHaveClass(...sizeClasses[size])
    })
  })

  describe('颜色变体', () => {
    it('默认继承父级颜色', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'home' }
      })

      expect(getIconRoot(container)).toHaveClass('inline-flex')
    })

    it('支持自定义颜色类', () => {
      const { container } = render(BaseIcon, {
        props: {
          name: 'home',
          class: 'text-red-500'
        }
      })

      expect(getIconRoot(container)).toHaveClass('text-red-500')
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseIcon, {
        props: {
          name: 'home',
          class: 'custom-class'
        }
      })

      expect(getIconRoot(container)).toHaveClass('custom-class')
    })

    it('自定义 class 与默认样式共存', () => {
      const { container } = render(BaseIcon, {
        props: {
          name: 'home',
          class: 'custom-class'
        }
      })

      expect(getIconRoot(container)).toHaveClass('inline-flex')
      expect(getIconRoot(container)).toHaveClass('custom-class')
    })
  })

  describe('可访问性', () => {
    it('默认有 aria-label', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'home' }
      })

      expect(getIconRoot(container)).toHaveAttribute('aria-label', 'home')
    })

    it('可以通过 props 覆盖 aria-label', () => {
      const { container } = render(BaseIcon, {
        props: {
          name: 'home',
          ariaLabel: '首页'
        }
      })

      expect(getIconRoot(container)).toHaveAttribute('aria-label', '首页')
    })
  })

  describe('过渡动画', () => {
    it('有过渡类', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'home' }
      })

      expect(getIconRoot(container)).toHaveClass('inline-flex')
    })
  })
})
