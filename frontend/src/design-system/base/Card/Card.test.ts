/**
 * Card 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 所有变体
 * - 阴影效果
 * - 插槽内容
 * - 自定义样式
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { BaseCard } from './index'

describe('BaseCard', () => {
  describe('基础渲染', () => {
    it('正确渲染卡片容器', () => {
      const { container } = render(BaseCard)
      const card = container.querySelector('.bg-white')

      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('p-6')
    })

    it('正确渲染默认插槽内容', () => {
      const { getByText } = render(BaseCard, {
        slots: { default: 'Card Content' },
      })

      expect(getByText('Card Content')).toBeInTheDocument()
    })
  })

  describe('变体测试', () => {
    it('支持 bordered 变体', () => {
      const { container } = render(BaseCard, {
        props: { variant: 'bordered' },
      })
      const card = container.firstChild as Element

      expect(card).toHaveClass('border')
    })

    it('支持 shadow 变体', () => {
      const { container } = render(BaseCard, {
        props: { variant: 'elevated' } as any,
      })
      const card = container.firstChild as Element

      expect(card).toHaveClass('shadow-md')
    })

    it('default 变体使用基础边框且不附带提升阴影', () => {
      const { container } = render(BaseCard, {
        props: { variant: 'default' } as any,
      })
      const card = container.firstChild as Element

      expect(card).toHaveClass('border')
      expect(card).not.toHaveClass('shadow-md')
    })
  })

  describe('可悬停效果', () => {
    it('hoverable 为 true 时添加悬停效果', () => {
      const { container } = render(BaseCard, {
        props: { hoverable: true },
      })
      const card = container.firstChild as Element

      expect(card).toHaveClass('hover:shadow-lg')
      expect(card).toHaveClass('transition-all')
    })
  })

  describe('插槽测试', () => {
    it('支持 header 插槽', () => {
      const { getByText } = render(BaseCard, {
        slots: {
          header: 'Card Header',
        },
      })

      expect(getByText('Card Header')).toBeInTheDocument()
    })

    it('支持 footer 插槽', () => {
      const { getByText } = render(BaseCard, {
        slots: {
          footer: 'Card Footer',
        },
      })

      expect(getByText('Card Footer')).toBeInTheDocument()
    })

    it('同时支持 header, default, footer 插槽', () => {
      const { getByText } = render(BaseCard, {
        slots: {
          header: 'Header',
          default: 'Content',
          footer: 'Footer',
        },
      })

      expect(getByText('Header')).toBeInTheDocument()
      expect(getByText('Content')).toBeInTheDocument()
      expect(getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseCard, {
        props: { class: 'custom-class' },
      })
      const card = container.querySelector('.custom-class')

      expect(card).toBeTruthy()
    })

    it('默认包含基础间距', () => {
      const { container } = render(BaseCard)
      const card = container.firstChild as Element

      expect(card).toHaveClass('p-6')
    })
  })
})
