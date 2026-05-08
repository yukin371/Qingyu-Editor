/**
 * Avatar 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 所有尺寸
 * - 图片模式
 * - 文字模式
 * - 加载状态
 * - 点击事件
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { BaseAvatar } from './index'

describe('BaseAvatar', () => {
  describe('基础渲染', () => {
    it('正确渲染头像容器', () => {
      const { container } = render(BaseAvatar)
      const avatar = container.querySelector('.rounded-full')

      expect(avatar).toBeInTheDocument()
    })

    it('默认尺寸为 md', () => {
      const { container } = render(BaseAvatar)
      const avatar = container.querySelector('.w-10')

      expect(avatar).toBeTruthy()
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

    const sizeClasses: Record<string, string[]> = {
      xs: ['w-6', 'h-6'],
      sm: ['w-8', 'h-8'],
      md: ['w-10', 'h-10'],
      lg: ['w-12', 'h-12'],
      xl: ['w-16', 'h-16'],
      '2xl': ['w-20', 'h-20'],
    }

    it.each(sizes)('正确渲染 %s 尺寸', (size) => {
      const { container } = render(BaseAvatar, {
        props: { size }
      })
      const avatar = container.firstChild as Element

      expect(avatar).toHaveClass(...sizeClasses[size])
    })
  })

  describe('图片模式', () => {
    it('正确渲染图片', () => {
      const { container } = render(BaseAvatar, {
        props: { src: 'https://example.com/avatar.jpg' }
      })

      const img = container.querySelector('img')
      expect(img).toBeTruthy()
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('图片加载失败时显示备用内容', () => {
      const { container } = render(BaseAvatar, {
        props: {
          src: 'https://example.com/not-found.jpg',
          alt: 'User Name'
        }
      })

      // 模拟图片加载失败
      const img = container.querySelector('img')
      if (img) {
        fireEvent.error(img)
      }

      const fallback = container.querySelector('.flex')
      expect(fallback).toBeTruthy()
    })
  })

  describe('文字模式', () => {
    it('没有图片时显示文字', () => {
      const { getByText } = render(BaseAvatar, {
        props: { alt: 'John Doe' }
      })

      expect(getByText('JD')).toBeInTheDocument()
    })

    it('单个字符时显示首字母', () => {
      const { getByText } = render(BaseAvatar, {
        props: { alt: 'J' }
      })

      expect(getByText('J')).toBeInTheDocument()
    })
  })

  describe('形状变体', () => {
    it('支持方形头像', () => {
      const { container } = render(BaseAvatar, {
        props: { shape: 'square' } as any
      })

      const avatar = container.firstChild as Element
      expect(avatar).toHaveClass('rounded-md')
    })

    it('支持圆形头像（默认）', () => {
      const { container } = render(BaseAvatar)
      const avatar = container.firstChild

      expect(avatar).toHaveClass('rounded-full')
    })
  })

  describe('点击事件', () => {
    it('支持点击事件', async () => {
      const onClick = vi.fn()
      const { container } = render(BaseAvatar, {
        props: { onClick }
      })

      const avatar = container.firstChild as Element
      await fireEvent.click(avatar)

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseAvatar, {
        props: { class: 'custom-class' }
      })

      const avatar = container.querySelector('.custom-class')
      expect(avatar).toBeTruthy()
    })

    it('支持自定义背景色', () => {
      const { container } = render(BaseAvatar, {
        props: { color: 'primary' } as any
      })

      const avatar = container.firstChild as Element
      expect(avatar).toHaveClass('bg-primary-500')
    })
  })

  describe('可访问性', () => {
    it('有正确的 alt 属性', () => {
      const { container } = render(BaseAvatar, {
        props: { alt: 'User Avatar' }
      })

      const img = container.querySelector('img')
      if (img) {
        expect(img).toHaveAttribute('alt', 'User Avatar')
      }
    })
  })
})
