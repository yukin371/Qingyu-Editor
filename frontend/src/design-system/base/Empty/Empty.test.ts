/**
 * Empty 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 图片模式
 * - 自定义描述
 * - 操作按钮
 * - 插槽内容
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { BaseEmpty } from './index'

describe('BaseEmpty', () => {
  describe('基础渲染', () => {
    it('正确渲染空状态容器', () => {
      const { container } = render(BaseEmpty)
      const empty = container.querySelector('.flex-col')

      expect(empty).toBeInTheDocument()
    })

    it('默认显示描述文字', () => {
      const { getByText } = render(BaseEmpty)

      expect(getByText('暂无数据')).toBeInTheDocument()
    })
  })

  describe('图片模式', () => {
    it('支持自定义图片', () => {
      const { container } = render(BaseEmpty, {
        props: { image: 'https://example.com/empty.png' }
      })

      const img = container.querySelector('img')
      expect(img).toBeTruthy()
      expect(img).toHaveAttribute('src', 'https://example.com/empty.png')
    })

    it('默认使用内置图片', () => {
      const { container } = render(BaseEmpty)

      // 检查是否有默认的空状态图标
      const icon = container.querySelector('svg')
      expect(icon).toBeTruthy()
    })
  })

  describe('描述文字', () => {
    it('支持自定义描述', () => {
      const { getByText } = render(BaseEmpty, {
        props: { description: 'No Data Found' }
      })

      expect(getByText('No Data Found')).toBeInTheDocument()
    })

    it('描述文字正确样式', () => {
      const { container } = render(BaseEmpty, {
        props: { description: 'Description' }
      })

      const desc = container.querySelector('.text-slate-500')
      expect(desc).toBeTruthy()
    })
  })

  describe('操作按钮', () => {
    it('支持操作按钮', () => {
      const onAction = vi.fn()
      const { getByText } = render(BaseEmpty, {
        props: {
          actionText: 'Create New',
          onAction
        }
      })

      const button = getByText('Create New')
      expect(button).toBeInTheDocument()
    })

    it('点击操作按钮触发事件', async () => {
      const onAction = vi.fn()
      const { getByText } = render(BaseEmpty, {
        props: {
          actionText: 'Create',
          onAction
        }
      })

      const button = getByText('Create')
      await fireEvent.click(button)

      expect(onAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('插槽测试', () => {
    it('支持 image 插槽', () => {
      const { container } = render(BaseEmpty, {
        slots: {
          image: '<div data-testid="custom-image">Custom Image</div>'
        }
      })

      const customImage = container.querySelector('[data-testid="custom-image"]')
      expect(customImage).toBeTruthy()
    })

    it('支持 description 插槽', () => {
      const { getByText } = render(BaseEmpty, {
        slots: {
          description: 'Custom Description'
        }
      })

      expect(getByText('Custom Description')).toBeInTheDocument()
    })

    it('支持 default 插槽（额外内容）', () => {
      const { getByText } = render(BaseEmpty, {
        slots: {
          default: 'Extra Content'
        }
      })

      expect(getByText('Extra Content')).toBeInTheDocument()
    })
  })

  describe('尺寸变体', () => {
    it('支持小尺寸', () => {
      const { container } = render(BaseEmpty, {
        props: { size: 'small' }
      })

      const empty = container.firstChild
      expect(empty).toBeTruthy()
    })

    it('支持大尺寸', () => {
      const { container } = render(BaseEmpty, {
        props: { size: 'large' }
      })

      const empty = container.firstChild
      expect(empty).toBeTruthy()
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseEmpty, {
        props: { class: 'custom-class' }
      })

      const empty = container.querySelector('.custom-class')
      expect(empty).toBeTruthy()
    })

    it('支持自定义背景色', () => {
      const { container } = render(BaseEmpty, {
        props: { bgColor: 'bg-slate-50' }
      })

      const empty = container.querySelector('.bg-slate-50')
      expect(empty).toBeTruthy()
    })
  })

  describe('可访问性', () => {
    it('有正确的 role 属性', () => {
      const { container } = render(BaseEmpty)
      const empty = container.querySelector('[role="status"]')

      expect(empty).toBeTruthy()
    })

    it('有正确的 aria-live 属性', () => {
      const { container } = render(BaseEmpty)
      const empty = container.querySelector('[aria-live="polite"]')

      expect(empty).toBeTruthy()
    })
  })
})
