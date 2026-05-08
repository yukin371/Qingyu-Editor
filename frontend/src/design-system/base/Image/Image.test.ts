/**
 * Image 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 加载状态
 * - 错误处理
 * - 懒加载
 * - 适配模式
 * - 预览功能
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { BaseImage } from './index'

describe('BaseImage', () => {
  describe('基础渲染', () => {
    it('正确渲染图片', () => {
      const { container } = render(BaseImage, {
        props: { src: 'https://example.com/image.jpg' }
      })

      const img = container.querySelector('img')
      expect(img).toBeTruthy()
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('有正确的 alt 属性', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: 'Test Image'
        }
      })

      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', 'Test Image')
    })
  })

  describe('加载状态', () => {
    it('加载中显示骨架屏', () => {
      const { container } = render(BaseImage, {
        props: { src: 'https://example.com/image.jpg' }
      })

      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).toBeTruthy()
    })

    it('加载完成后隐藏骨架屏', async () => {
      const { container } = render(BaseImage, {
        props: { src: 'https://example.com/image.jpg' }
      })

      const img = container.querySelector('img')
      if (img) {
        await fireEvent.load(img)
      }

      await waitFor(() => {
        const skeleton = container.querySelector('.animate-pulse')
        expect(skeleton).toBeFalsy()
      })
    })
  })

  describe('错误处理', () => {
    it('图片加载失败显示错误状态', async () => {
      const onError = vi.fn()
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/not-found.jpg',
          onError
        }
      })

      const img = container.querySelector('img')
      if (img) {
        await fireEvent.error(img)
      }

      await waitFor(() => {
        const errorState = container.querySelector('.text-red-500')
        expect(errorState).toBeTruthy()
        expect(onError).toHaveBeenCalled()
      })
    })

    it('支持自定义错误提示', async () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/not-found.jpg',
          errorText: 'Image failed to load'
        }
      })

      const img = container.querySelector('img')
      if (img) {
        await fireEvent.error(img)
      }

      await waitFor(() => {
        const errorText = container.querySelector('.text-red-500')
        expect(errorText).toHaveTextContent('Image failed to load')
      })
    })
  })

  describe('懒加载', () => {
    it('支持懒加载模式', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          lazy: true
        }
      })

      const img = container.querySelector('img')
      expect(img).toHaveAttribute('loading', 'lazy')
    })
  })

  describe('适配模式', () => {
    it('支持 contain 模式', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          fit: 'contain'
        }
      })

      const img = container.querySelector('img')
      expect(img).toHaveClass('object-contain')
    })

    it('支持 cover 模式', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          fit: 'cover'
        }
      })

      const img = container.querySelector('img')
      expect(img).toHaveClass('object-cover')
    })

    it('支持 fill 模式', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          fit: 'fill'
        }
      })

      const img = container.querySelector('img')
      expect(img).toHaveClass('object-fill')
    })
  })

  describe('圆角样式', () => {
    it('支持圆角', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          rounded: true
        }
      })

      const wrapper = container.querySelector('.rounded-lg')
      expect(wrapper).toBeTruthy()
    })

    it('支持圆形', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          circle: true
        }
      })

      const wrapper = container.querySelector('.rounded-full')
      expect(wrapper).toBeTruthy()
    })
  })

  describe('预览功能', () => {
    it('支持点击预览', async () => {
      const onPreview = vi.fn()
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          preview: true,
          onPreview
        }
      })

      const wrapper = container.firstChild
      await fireEvent.click(wrapper!)

      // 预览功能应该在点击时触发
      expect(onPreview).toHaveBeenCalled()
    })
  })

  describe('占位符', () => {
    it('支持占位符颜色', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          placeholder: 'bg-slate-100'
        }
      })

      const placeholder = container.querySelector('.bg-slate-100')
      expect(placeholder).toBeTruthy()
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          class: 'custom-class'
        }
      })

      const img = container.querySelector('.custom-class')
      expect(img).toBeTruthy()
    })

    it('支持自定义宽高', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          width: '200px',
          height: '150px'
        }
      })

      const wrapper = container.firstChild
      expect(wrapper).toHaveStyle({ width: '200px', height: '150px' })
    })
  })

  describe('可访问性', () => {
    it('默认 alt 为空字符串', () => {
      const { container } = render(BaseImage, {
        props: { src: 'https://example.com/image.jpg' }
      })

      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', '')
    })

    it('支持自定义 alt 文本', () => {
      const { container } = render(BaseImage, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: 'Beautiful landscape'
        }
      })

      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', 'Beautiful landscape')
    })
  })
})
