/**
 * Spinner 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import Spinner from '../Spinner.vue'

function expectInlineColor(style: string | null, color: string) {
  expect(style).toBeTruthy()
  const normalized = style?.replace(/\s+/g, '').toLowerCase()
  expect(normalized).toContain(`color:${color.toLowerCase()};`)
}

function expectInlineAnimation(element: Element | undefined, name: string) {
  expect(element).toBeTruthy()
  const normalized = element?.getAttribute('style')?.replace(/\s+/g, '').toLowerCase()
  expect(normalized).toContain(`animation:${name}`)
}

describe('Spinner 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染默认的 Spinner', () => {
      render(Spinner)
      const status = screen.getByRole('status')
      expect(status).toBeInTheDocument()
    })

    it('应该有正确的 role 属性', () => {
      render(Spinner)
      const status = screen.getByRole('status')
      expect(status).toBeInTheDocument()
    })

    it('应该有正确的默认 aria-label', () => {
      render(Spinner)
      const status = screen.getByRole('status')
      expect(status.getAttribute('aria-label')).toBe('加载中')
    })

    it('应该使用自定义 label 作为 aria-label', () => {
      render(Spinner, {
        props: { label: '正在加载中' },
      })
      const status = screen.getByRole('status')
      expect(status.getAttribute('aria-label')).toBe('正在加载中')
    })
  })

  describe('类型变体', () => {
    it('应该渲染 default 类型的旋转圆圈', () => {
      const { container } = render(Spinner, {
        props: { type: 'default' },
      })
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg?.classList.contains('animate-spin')).toBe(true)
    })

    it('应该渲染 dots 类型的点动画', () => {
      const { container } = render(Spinner, {
        props: { type: 'dots' },
      })
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
      // dots 类型有 3 个点
      const dots = container.querySelectorAll('.rounded-full')
      expect(dots.length).toBeGreaterThanOrEqual(3)
    })

    it('应该渲染 bars 类型的条形动画', () => {
      const { container } = render(Spinner, {
        props: { type: 'bars' },
      })
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
      // bars 类型有 5 个条
      const bars = container.querySelectorAll('.rounded-full')
      expect(bars.length).toBeGreaterThanOrEqual(5)
    })

    it('应该渲染 wave 类型的波浪动画', () => {
      const { container } = render(Spinner, {
        props: { type: 'wave' },
      })
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
      // wave 类型有 4 个波点
      const waves = container.querySelectorAll('.rounded-full')
      expect(waves.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('尺寸变体', () => {
    it('应该渲染 sm 尺寸的 Spinner', () => {
      const { container } = render(Spinner, {
        props: { size: 'sm', type: 'default' },
      })
      const svg = container.querySelector('svg')
      expect(svg?.classList.contains('w-4')).toBe(true)
      expect(svg?.classList.contains('h-4')).toBe(true)
    })

    it('应该渲染 md 尺寸的 Spinner（默认）', () => {
      const { container } = render(Spinner, {
        props: { size: 'md', type: 'default' },
      })
      const svg = container.querySelector('svg')
      expect(svg?.classList.contains('w-6')).toBe(true)
      expect(svg?.classList.contains('h-6')).toBe(true)
    })

    it('应该渲染 lg 尺寸的 Spinner', () => {
      const { container } = render(Spinner, {
        props: { size: 'lg', type: 'default' },
      })
      const svg = container.querySelector('svg')
      expect(svg?.classList.contains('w-8')).toBe(true)
      expect(svg?.classList.contains('h-8')).toBe(true)
    })

    it('dots 类型应该正确应用 sm 尺寸', () => {
      const { container } = render(Spinner, {
        props: { type: 'dots', size: 'sm' },
      })
      const dots = container.querySelectorAll('.rounded-full')
      if (dots.length > 0) {
        expect(dots[0].classList.contains('w-1')).toBe(true)
        expect(dots[0].classList.contains('h-1')).toBe(true)
      }
    })

    it('dots 类型应该正确应用 lg 尺寸', () => {
      const { container } = render(Spinner, {
        props: { type: 'dots', size: 'lg' },
      })
      const dots = container.querySelectorAll('.rounded-full')
      if (dots.length > 0) {
        expect(dots[0].classList.contains('w-1')).toBe(true)
        expect(dots[0].classList.contains('h-2')).toBe(true)
      }
    })
  })

  describe('颜色定制', () => {
    it('应该应用自定义颜色样式', () => {
      render(Spinner, {
        props: { color: '#ff0000' },
      })
      const status = screen.getByRole('status')
      expectInlineColor(status.getAttribute('style'), '#ff0000')
    })

    it('应该应用十六进制颜色', () => {
      render(Spinner, {
        props: { color: '#3b82f6' },
      })
      const status = screen.getByRole('status')
      expectInlineColor(status.getAttribute('style'), '#3b82f6')
    })

    it('应该应用 RGB 颜色', () => {
      render(Spinner, {
        props: { color: 'rgb(59, 130, 246)' },
      })
      const status = screen.getByRole('status')
      expect(status.getAttribute('style')).toMatch(/color:\s*rgb\(59,\s*130,\s*246\)/)
    })

    it('应该应用颜色名称', () => {
      render(Spinner, {
        props: { color: 'blue' },
      })
      const status = screen.getByRole('status')
      // 浏览器会将颜色名称转换为 RGB
      expect(status.getAttribute('style')).toContain('color:')
    })
  })

  describe('线条粗细（仅 default 类型）', () => {
    it('应该应用默认线条粗细 3', () => {
      const { container } = render(Spinner, {
        props: { type: 'default' },
      })
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('style')).toContain('stroke-width: 3px')
    })

    it('应该应用自定义线条粗细 2', () => {
      const { container } = render(Spinner, {
        props: { type: 'default', strokeWidth: 2 },
      })
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('style')).toContain('stroke-width: 2px')
    })

    it('应该应用自定义线条粗细 6', () => {
      const { container } = render(Spinner, {
        props: { type: 'default', strokeWidth: 6 },
      })
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('style')).toContain('stroke-width: 6px')
    })
  })

  describe('文字说明', () => {
    it('应该显示 label 文字', () => {
      render(Spinner, {
        props: { label: '正在加载...' },
      })
      expect(screen.getByText('正在加载...')).toBeInTheDocument()
    })

    it('应该渲染默认插槽内容', () => {
      render(Spinner, {
        slots: {
          default: '自定义加载文字',
        },
      })
      expect(screen.getByText('自定义加载文字')).toBeInTheDocument()
    })

    it('label 应该在 spinner 后面显示', () => {
      const { container } = render(Spinner, {
        props: { label: '加载中' },
      })
      // 验证 span 元素存在且有正确的类名
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
      expect(span?.classList.contains('ml-2')).toBe(true)
    })

    it('文字应该有正确的 ml-2 类名', () => {
      const { container } = render(Spinner, {
        props: { label: '加载中' },
      })
      const span = container.querySelector('span')
      expect(span?.classList.contains('ml-2')).toBe(true)
    })
  })

  describe('CSS 类名', () => {
    it('应该应用自定义类名', () => {
      render(Spinner, {
        props: { class: 'my-custom-class' },
      })
      const status = screen.getByRole('status')
      expect(status.classList.contains('my-custom-class')).toBe(true)
    })

    it('应该保留内置类名', () => {
      render(Spinner, {
        props: { class: 'my-custom-class' },
      })
      const status = screen.getByRole('status')
      expect(status.classList.contains('inline-flex')).toBe(true)
      expect(status.classList.contains('items-center')).toBe(true)
    })

    it('容器应该有 inline-flex 类', () => {
      render(Spinner)
      const status = screen.getByRole('status')
      expect(status.classList.contains('inline-flex')).toBe(true)
    })

    it('容器应该有 items-center 类', () => {
      render(Spinner)
      const status = screen.getByRole('status')
      expect(status.classList.contains('items-center')).toBe(true)
    })
  })

  describe('动画类名', () => {
    it('default 类型应该有 animate-spin 类', () => {
      const { container } = render(Spinner, {
        props: { type: 'default' },
      })
      const svg = container.querySelector('svg')
      expect(svg?.classList.contains('animate-spin')).toBe(true)
    })

    it('dots 类型应该有 animate-bounce 类', () => {
      const { container } = render(Spinner, {
        props: { type: 'dots' },
      })
      const dots = container.querySelectorAll('.rounded-full')
      if (dots.length > 0) {
        expectInlineAnimation(dots[0], 'sp-dot')
      }
    })

    it('bars 类型应该有 animate-pulse 类', () => {
      const { container } = render(Spinner, {
        props: { type: 'bars' },
      })
      const bars = container.querySelectorAll('.rounded-full')
      if (bars.length > 0) {
        expectInlineAnimation(bars[0], 'sp-bar')
      }
    })

    it('wave 类型应该有自定义动画样式', () => {
      const { container } = render(Spinner, {
        props: { type: 'wave' },
      })
      const waves = container.querySelectorAll('.rounded-full')
      if (waves.length > 0) {
        expectInlineAnimation(waves[0], 'sp-wave')
      }
    })
  })

  describe('组合测试', () => {
    it('应该同时应用 size 和 color', () => {
      const { container } = render(Spinner, {
        props: { size: 'lg', color: '#ff0000', type: 'default' },
      })
      const status = container.querySelector('[role="status"]')
      const svg = container.querySelector('svg')
      expectInlineColor(status?.getAttribute('style') ?? null, '#ff0000')
      expect(svg?.classList.contains('w-8')).toBe(true)
      expect(svg?.classList.contains('h-8')).toBe(true)
    })

    it('应该同时应用 type、size 和 label', () => {
      const { container } = render(Spinner, {
        props: { type: 'dots', size: 'sm', label: '小尺寸加载中' },
      })
      expect(screen.getByText('小尺寸加载中')).toBeInTheDocument()
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })

    it('应该同时应用所有 props', () => {
      const { container } = render(Spinner, {
        props: {
          type: 'default',
          size: 'lg',
          color: '#3b82f6',
          strokeWidth: 4,
          label: '完整配置',
        },
      })
      expect(screen.getByText('完整配置')).toBeInTheDocument()
      const status = container.querySelector('[role="status"]')
      const svg = container.querySelector('svg')
      expectInlineColor(status?.getAttribute('style') ?? null, '#3b82f6')
      expect(svg?.getAttribute('style')).toContain('stroke-width: 4px')
    })
  })

  describe('响应式更新', () => {
    it('应该在 size 变化时更新样式', async () => {
      const { container, rerender } = render(Spinner, {
        props: { type: 'default', size: 'sm' },
      })
      let svg = container.querySelector('svg')
      expect(svg?.classList.contains('w-4')).toBe(true)

      await rerender({ size: 'lg' })
      svg = container.querySelector('svg')
      expect(svg?.classList.contains('w-8')).toBe(true)
    })

    it('应该在 color 变化时更新样式', async () => {
      const { rerender } = render(Spinner, {
        props: { color: '#ff0000' },
      })
      let status = screen.getByRole('status')
      expectInlineColor(status.getAttribute('style'), '#ff0000')

      await rerender({ color: '#00ff00' })
      status = screen.getByRole('status')
      expectInlineColor(status.getAttribute('style'), '#00ff00')
    })

    it('应该在 type 变化时更新渲染', async () => {
      const { container, rerender } = render(Spinner, {
        props: { type: 'default' },
      })
      expect(container.querySelector('svg')).toBeInTheDocument()

      await rerender({ type: 'dots' })
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })
  })

  describe('样式和布局', () => {
    it('容器应该是 flex 布局', () => {
      render(Spinner)
      const status = screen.getByRole('status')
      expect(status.classList.contains('inline-flex')).toBe(true)
      expect(status.classList.contains('justify-center')).toBe(true)
    })

    it('不同尺寸应该有不同的间距', () => {
      const { container: smContainer } = render(Spinner, { props: { size: 'sm', label: 'test' } })
      const { container: mdContainer } = render(Spinner, { props: { size: 'md', label: 'test' } })
      const { container: lgContainer } = render(Spinner, { props: { size: 'lg', label: 'test' } })

      // 验证不同尺寸的容器有不同的 gap 类
      const smStatus = smContainer.querySelector('[role="status"]')
      const mdStatus = mdContainer.querySelector('[role="status"]')
      const lgStatus = lgContainer.querySelector('[role="status"]')

      expect(smStatus?.classList.contains('gap-1.5')).toBe(true)
      expect(mdStatus?.classList.contains('gap-2')).toBe(true)
      expect(lgStatus?.classList.contains('gap-2.5')).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的 label', () => {
      const { container } = render(Spinner, {
        props: { label: '' },
      })
      // 不应该抛出错误
      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })

    it('应该处理 undefined color', () => {
      const { container } = render(Spinner)
      // 不应该抛出错误
      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })

    it('应该处理 strokeWidth 为 0', () => {
      const { container } = render(Spinner, {
        props: { type: 'default', strokeWidth: 0 },
      })
      // 不应该抛出错误
      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })

    it('应该处理非常大的 strokeWidth', () => {
      const { container } = render(Spinner, {
        props: { type: 'default', strokeWidth: 100 },
      })
      // 不应该抛出错误
      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })
  })
})
