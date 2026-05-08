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
  describe('基础渲染', () => {
    it('正确渲染 SVG 图标', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'heroicons:home' }
      })

      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg).toHaveClass('inline-block')
    })

    it('默认尺寸为 md', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'heroicons:home' }
      })

      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('w-5', 'h-5')
    })
  })

  describe('尺寸测试', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = [
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      '2xl',
    ]

    const sizeClasses = {
      xs: ['w-3', 'h-3'],
      sm: ['w-4', 'h-4'],
      md: ['w-5', 'h-5'],
      lg: ['w-6', 'h-6'],
      xl: ['w-8', 'h-8'],
      '2xl': ['w-10', 'h-10'],
    }

    it.each(sizes)('正确渲染 %s 尺寸', (size) => {
      const { container } = render(BaseIcon, {
        props: { name: 'heroicons:home', size }
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass(...sizeClasses[size])
    })
  })

  describe('颜色变体', () => {
    it('支持默认颜色', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'heroicons:home' }
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass('text-current')
    })

    it('支持自定义颜色类', () => {
      const { container } = render(BaseIcon, {
        props: {
          name: 'heroicons:home',
          class: 'text-red-500'
        }
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass('text-red-500')
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseIcon, {
        props: {
          name: 'heroicons:home',
          class: 'custom-class'
        }
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass('custom-class')
    })

    it('自定义 class 与默认样式共存', () => {
      const { container } = render(BaseIcon, {
        props: {
          name: 'heroicons:home',
          class: 'custom-class'
        }
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass('inline-block')
      expect(svg).toHaveClass('custom-class')
    })
  })

  describe('可访问性', () => {
    it('默认有 aria-hidden="true"', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'heroicons:home' }
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('可以通过 props 覆盖 aria-hidden', () => {
      const { container } = render(BaseIcon, {
        props: {
          name: 'heroicons:home',
          ariaHidden: 'false'
        }
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('aria-hidden', 'false')
    })
  })

  describe('过渡动画', () => {
    it('有过渡类', () => {
      const { container } = render(BaseIcon, {
        props: { name: 'heroicons:home' }
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass('transition-colors')
      expect(svg).toHaveClass('duration-200')
    })
  })
})
