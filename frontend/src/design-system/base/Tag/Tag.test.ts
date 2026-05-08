/**
 * Tag 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 所有变体
 * - 尺寸
 * - 可关闭功能
 * - 交互行为
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { BaseTag } from './index'

describe('BaseTag', () => {
  describe('基础渲染', () => {
    it('正确渲染标签内容', () => {
      const { getByText } = render(BaseTag, {
        slots: { default: 'Tag Label' }
      })

      expect(getByText('Tag Label')).toBeInTheDocument()
    })

    it('默认渲染为默认变体', () => {
      const { container } = render(BaseTag, {
        slots: { default: 'Tag' }
      })

      const tag = container.querySelector('.inline-flex')
      expect(tag).toHaveClass('bg-slate-100', 'text-slate-700')
    })
  })

  describe('变体测试', () => {
    const variants: Array<'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = [
      'default',
      'primary',
      'success',
      'warning',
      'danger',
      'info',
    ]

    it.each(variants)('正确渲染 %s 变体', (variant) => {
      const { container } = render(BaseTag, {
        props: { variant },
        slots: { default: 'Tag' }
      })

      const tag = container.querySelector('.inline-flex')
      expect(tag).toBeTruthy()
    })
  })

  describe('尺寸测试', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg']

    it.each(sizes)('正确渲染 %s 尺寸', (size) => {
      const { container } = render(BaseTag, {
        props: { size },
        slots: { default: 'Tag' }
      })

      const tag = container.querySelector('.inline-flex')
      expect(tag).toBeTruthy()
    })
  })

  describe('可关闭功能', () => {
    it('closable 为 true 时显示关闭按钮', () => {
      const { container } = render(BaseTag, {
        props: { closable: true },
        slots: { default: 'Tag' }
      })

      const closeBtn = container.querySelector('.close-button')
      expect(closeBtn).toBeTruthy()
    })

    it('closable 为 false 时不显示关闭按钮', () => {
      const { container } = render(BaseTag, {
        props: { closable: false },
        slots: { default: 'Tag' }
      })

      const closeBtn = container.querySelector('.close-button')
      expect(closeBtn).toBeFalsy()
    })

    it('点击关闭按钮触发 close 事件', async () => {
      const onClose = vi.fn()
      const { container } = render(BaseTag, {
        props: { closable: true, onClose }
      })

      const closeBtn = container.querySelector('.close-button')
      await fireEvent.click(closeBtn!)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('交互行为', () => {
    it('支持点击事件', async () => {
      const onClick = vi.fn()
      const { getByText } = render(BaseTag, {
        props: { onClick },
        slots: { default: 'Clickable Tag' }
      })

      await fireEvent.click(getByText('Clickable Tag'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseTag, {
        props: { class: 'custom-class' },
        slots: { default: 'Tag' }
      })

      const tag = container.querySelector('.custom-class')
      expect(tag).toBeTruthy()
    })
  })
})
