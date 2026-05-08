/**
 * Button 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 所有变体（variant）
 * - 所有尺寸（size）
 * - 状态（disabled, loading）
 * - 交互行为
 * - 可访问性
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { BaseButton } from './index'

describe('BaseButton', () => {
  describe('基础渲染', () => {
    it('默认渲染为 primary variant 和 md size', () => {
      const { getByRole } = render(BaseButton)
      const button = getByRole('button')

      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-primary-500')
      expect(button).toHaveClass('h-10') // md size
    })

    it('正确渲染插槽内容', () => {
      const { getByRole } = render(BaseButton, {
        slots: { default: 'Click Me' },
      })
      const button = getByRole('button')

      expect(button).toHaveTextContent('Click Me')
    })

    it('默认 type 为 button', () => {
      const { getByRole } = render(BaseButton)
      const button = getByRole('button')

      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('变体测试', () => {
    const variants: Array<'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'> = [
      'primary',
      'secondary',
      'ghost',
      'danger',
      'success',
      'warning',
    ]
    const variantClasses = {
      primary: 'bg-primary-500',
      secondary: 'bg-slate-200',
      ghost: 'text-slate-700',
      danger: 'bg-danger-DEFAULT',
      success: 'bg-success-DEFAULT',
      warning: 'bg-warning-DEFAULT',
    }

    it.each(variants)('正确渲染 %s 变体', (variant) => {
      const { getByRole } = render(BaseButton, {
        props: { variant },
      })
      const button = getByRole('button')

      expect(button).toHaveClass(variantClasses[variant])
    })
  })

  describe('尺寸测试', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl']

    const sizeClasses = {
      xs: 'h-7',
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-11',
      xl: 'h-12',
    }

    it.each(sizes)('正确渲染 %s 尺寸', (size) => {
      const { getByRole } = render(BaseButton, {
        props: { size },
      })
      const button = getByRole('button')

      expect(button).toHaveClass(sizeClasses[size])
    })
  })

  describe('状态测试', () => {
    it('disabled 状态禁用按钮', () => {
      const { getByRole } = render(BaseButton, {
        props: { disabled: true },
      })
      const button = getByRole('button')

      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50')
    })

    it('loading 状态禁用按钮并显示加载动画', () => {
      const { getByRole } = render(BaseButton, {
        props: { loading: true },
      })
      const button = getByRole('button')

      expect(button).toBeDisabled()
      expect(button.querySelector('.animate-spin')).toBeTruthy()
    })

    it('disabled 和 loading 状态都禁用按钮', () => {
      const { getByRole } = render(BaseButton, {
        props: { disabled: true, loading: true },
      })
      const button = getByRole('button')

      expect(button).toBeDisabled()
    })

    it('block 状态占满容器宽度', () => {
      const { getByRole } = render(BaseButton, {
        props: { block: true },
      })
      const button = getByRole('button')

      expect(button).toHaveClass('w-full')
    })
  })

  describe('交互行为', () => {
    it('点击时触发 click 事件', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(BaseButton, {
        props: { onClick },
      })

      const button = getByRole('button')
      await fireEvent.click(button)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('disabled 状态不触发点击', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(BaseButton, {
        props: { disabled: true, onClick },
      })

      const button = getByRole('button')
      await fireEvent.click(button)

      expect(onClick).not.toHaveBeenCalled()
    })

    it('loading 状态不触发点击', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(BaseButton, {
        props: { loading: true, onClick },
      })

      const button = getByRole('button')
      await fireEvent.click(button)

      expect(onClick).not.toHaveBeenCalled()
    })

    it('正确传递事件对象', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(BaseButton, {
        props: { onClick },
      })

      const button = getByRole('button')
      await fireEvent.click(button)

      expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent))
    })
  })

  describe('可访问性', () => {
    it('支持键盘焦点访问', async () => {
      const { getByRole } = render(BaseButton)
      const button = getByRole('button')

      button.focus()
      expect(button).toHaveFocus()
      expect(button).toHaveAttribute('type', 'button')
    })

    it('保留原生 button 语义', () => {
      const { getByRole } = render(BaseButton)
      const button = getByRole('button')

      expect(button.tagName).toBe('BUTTON')
      expect(button).not.toHaveAttribute('role')
    })

    it('disabled 时不响应键盘', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(BaseButton, {
        props: { disabled: true, onClick },
      })
      const button = getByRole('button')

      await fireEvent.keyDown(button, { key: 'Enter' })
      expect(onClick).not.toHaveBeenCalled()
    })

    it('有正确的 focus-visible 样式', () => {
      const { getByRole } = render(BaseButton)
      const button = getByRole('button')

      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
      expect(button).toHaveClass('focus-visible:ring-offset-2')
    })
  })

  describe('type 属性', () => {
    it('支持 submit 类型', () => {
      const { getByRole } = render(BaseButton, {
        props: { type: 'submit' },
      })
      const button = getByRole('button')

      expect(button).toHaveAttribute('type', 'submit')
    })

    it('支持 reset 类型', () => {
      const { getByRole } = render(BaseButton, {
        props: { type: 'reset' },
      })
      const button = getByRole('button')

      expect(button).toHaveAttribute('type', 'reset')
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { getByRole } = render(BaseButton, {
        props: { class: 'custom-class' },
      })
      const button = getByRole('button')

      expect(button).toHaveClass('custom-class')
    })

    it('自定义 class 与默认样式共存', () => {
      const { getByRole } = render(BaseButton, {
        props: { class: 'custom-class' },
      })
      const button = getByRole('button')

      expect(button).toHaveClass('bg-primary-500')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('加载动画', () => {
    it('loading 状态显示 SVG 旋转动画', () => {
      const { getByRole } = render(BaseButton, {
        props: { loading: true },
      })
      const button = getByRole('button')

      const svg = button.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg).toHaveClass('h-4', 'w-4')
      expect(svg).toHaveClass('animate-spin')
    })

    it('loading 状态下插槽内容仍显示', () => {
      const { getByRole } = render(BaseButton, {
        props: { loading: true },
        slots: { default: 'Loading...' },
      })
      const button = getByRole('button')

      expect(button).toHaveTextContent('Loading...')
    })
  })

  describe('过渡动画', () => {
    it('有正确的过渡类', () => {
      const { getByRole } = render(BaseButton)
      const button = getByRole('button')

      expect(button).toHaveClass('transition-all')
      expect(button).toHaveClass('duration-200')
    })
  })
})
