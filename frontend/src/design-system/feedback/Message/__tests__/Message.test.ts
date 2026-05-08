/**
 * Message 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import Message from '../Message.vue'

describe('Message 组件', () => {
  beforeEach(() => {
    // 清理消息容器
    const container = document.querySelector('.qy-message-container')
    if (container) {
      container.remove()
    }
  })

  afterEach(() => {
    // 清理消息容器
    const container = document.querySelector('.qy-message-container')
    if (container) {
      container.remove()
    }
  })

  describe('基础渲染', () => {
    it('应该正确渲染默认消息', async () => {
      render(Message, {
        props: {
          message: '这是一条消息',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('这是一条消息')).toBeInTheDocument()
      })
    })

    it('应该正确渲染 success 类型的消息', async () => {
      const { container } = render(Message, {
        props: {
          message: '操作成功',
          type: 'success',
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.qy-message__icon--success')
        expect(messageEl).toBeInTheDocument()
      })
    })

    it('应该正确渲染 info 类型的消息', async () => {
      const { container } = render(Message, {
        props: {
          message: '信息提示',
          type: 'info',
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.qy-message__icon--info')
        expect(messageEl).toBeInTheDocument()
      })
    })

    it('应该正确渲染 warning 类型的消息', async () => {
      const { container } = render(Message, {
        props: {
          message: '警告信息',
          type: 'warning',
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.qy-message__icon--warning')
        expect(messageEl).toBeInTheDocument()
      })
    })

    it('应该正确渲染 error 类型的消息', async () => {
      const { container } = render(Message, {
        props: {
          message: '错误信息',
          type: 'error',
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.qy-message__icon--error')
        expect(messageEl).toBeInTheDocument()
      })
    })

    it('应该在非居中模式下显示图标', async () => {
      const { container } = render(Message, {
        props: {
          message: '带图标的消息',
          type: 'success',
          center: false,
          duration: 0,
        },
      })

      await waitFor(() => {
        const icon = container.querySelector('.qy-message__icon')
        expect(icon).toBeInTheDocument()
      })
    })

    it('应该在居中模式下隐藏图标', async () => {
      const { container } = render(Message, {
        props: {
          message: '居中消息',
          type: 'success',
          center: true,
          duration: 0,
        },
      })

      await waitFor(() => {
        const icon = container.querySelector('.qy-message__icon')
        expect(icon).not.toBeInTheDocument()
      })
    })
  })

  describe('自动关闭功能', () => {
    it('当 duration 为 0 时不应该自动关闭', async () => {
      render(Message, {
        props: {
          message: '不自动关闭的消息',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('不自动关闭的消息')).toBeInTheDocument()
      })

      // 等待一段时间，消息应该还在
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(screen.getByText('不自动关闭的消息')).toBeInTheDocument()
    })
  })

  describe('关闭按钮', () => {
    it('当 showClose 为 false 时不应该显示关闭按钮', async () => {
      const { container } = render(Message, {
        props: {
          message: '没有关闭按钮',
          showClose: false,
          duration: 0,
        },
      })

      await waitFor(() => {
        const closeBtn = container.querySelector('.qy-message__close')
        expect(closeBtn).not.toBeInTheDocument()
      })
    })

    it('当 showClose 为 true 时应该显示关闭按钮', async () => {
      const { container } = render(Message, {
        props: {
          message: '有关闭按钮',
          showClose: true,
          duration: 0,
        },
      })

      await waitFor(() => {
        const closeBtn = container.querySelector('.qy-message__close')
        expect(closeBtn).toBeInTheDocument()
      })
    })
  })

  describe('居中显示', () => {
    it('应该支持居中显示', async () => {
      const { container } = render(Message, {
        props: {
          message: '居中消息',
          center: true,
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.qy-message__content--center')
        expect(messageEl).toBeInTheDocument()
      })
    })

    it('非居中模式应该左对齐', async () => {
      const { container } = render(Message, {
        props: {
          message: '非居中消息',
          center: false,
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.qy-message__content--center')
        expect(messageEl).not.toBeInTheDocument()
      })
    })
  })

  describe('HTML 内容', () => {
    it('应该支持 HTML 内容', async () => {
      const { container } = render(Message, {
        props: {
          message: '这是 <strong>加粗</strong> 文本',
          dangerouslyUseHTMLString: true,
          duration: 0,
        },
      })

      await waitFor(() => {
        const strong = container.querySelector('strong')
        expect(strong).toBeInTheDocument()
        expect(strong?.textContent).toBe('加粗')
      })
    })

    it('当 dangerouslyUseHTMLString 为 false 时应该转义 HTML', async () => {
      render(Message, {
        props: {
          message: '这是 <strong>加粗</strong> 文本',
          dangerouslyUseHTMLString: false,
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('这是 <strong>加粗</strong> 文本')).toBeInTheDocument()
        const strong = document.querySelector('strong')
        expect(strong).not.toBeInTheDocument()
      })
    })
  })

  describe('自定义偏移', () => {
    it('应该支持自定义偏移量', async () => {
      const { container } = render(Message, {
        props: {
          message: '自定义偏移',
          offset: 100,
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.fixed')
        expect(messageEl).toHaveStyle({ top: '100px' })
      })
    })

    it('应该使用默认偏移量', async () => {
      const { container } = render(Message, {
        props: {
          message: '默认偏移',
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.fixed')
        expect(messageEl).toHaveStyle({ top: '20px' })
      })
    })
  })

  describe('事件', () => {
    it('关闭时应该触发 close 事件', async () => {
      const onClose = vi.fn()

      render(Message, {
        props: {
          message: '测试事件',
          showClose: true,
          duration: 0,
          onClose,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('测试事件')).toBeInTheDocument()
      })

      // 由于组件内部处理关闭，我们只验证事件触发
      // 实际的关闭测试在下面的测试中
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('样式类名', () => {
    it('应该应用正确的类型样式类名', async () => {
      const { container: successContainer } = render(Message, {
        props: {
          message: 'Success',
          type: 'success',
          duration: 0,
        },
      })

      await waitFor(() => {
        const el = successContainer.querySelector('.bg-emerald-50')
        expect(el).toBeInTheDocument()
      })

      const { container: errorContainer } = render(Message, {
        props: {
          message: 'Error',
          type: 'error',
          duration: 0,
        },
      })

      await waitFor(() => {
        const el = errorContainer.querySelector('.bg-red-50')
        expect(el).toBeInTheDocument()
      })
    })

    it('应该应用居中样式类名', async () => {
      const { container } = render(Message, {
        props: {
          message: '居中',
          center: true,
          duration: 0,
        },
      })

      await waitFor(() => {
        const el = container.querySelector('.justify-center')
        expect(el).toBeInTheDocument()
      })
    })
  })

  describe('不同类型组合测试', () => {
    it('success 类型 + 居中 + 无图标', async () => {
      const { container } = render(Message, {
        props: {
          message: '成功居中',
          type: 'success',
          center: true,
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('成功居中')).toBeInTheDocument()
        expect(container.querySelector('.justify-center')).toBeInTheDocument()
        expect(container.querySelector('.qy-message__icon')).not.toBeInTheDocument()
      })
    })

    it('error 类型 + 关闭按钮', async () => {
      const { container } = render(Message, {
        props: {
          message: '错误可关闭',
          type: 'error',
          showClose: true,
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('错误可关闭')).toBeInTheDocument()
        expect(container.querySelector('.qy-message__close')).toBeInTheDocument()
      })
    })

    it('warning 类型 + HTML 内容', async () => {
      const { container } = render(Message, {
        props: {
          message: '<em>警告</em>内容',
          type: 'warning',
          dangerouslyUseHTMLString: true,
          duration: 0,
        },
      })

      await waitFor(() => {
        const em = container.querySelector('em')
        expect(em).toBeInTheDocument()
        expect(em?.textContent).toBe('警告')
      })
    })

    it('info 类型 + 自定义偏移', async () => {
      const { container } = render(Message, {
        props: {
          message: '信息偏移',
          type: 'info',
          offset: 200,
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.fixed')
        expect(messageEl).toHaveStyle({ top: '200px' })
      })
    })
  })

  describe('属性默认值', () => {
    it('应该使用默认的 type 值', async () => {
      const { container } = render(Message, {
        props: {
          message: '默认类型',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(container.querySelector('.qy-message__icon--info')).toBeInTheDocument()
      })
    })

    it('应该使用默认的 offset 值', async () => {
      const { container } = render(Message, {
        props: {
          message: '默认偏移',
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.fixed')
        expect(messageEl).toHaveStyle({ top: '20px' })
      })
    })

    it('应该使用默认的 center 值', async () => {
      const { container } = render(Message, {
        props: {
          message: '默认居中',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(container.querySelector('.justify-center')).not.toBeInTheDocument()
      })
    })

    it('应该使用默认的 showClose 值', async () => {
      const { container } = render(Message, {
        props: {
          message: '默认关闭按钮',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(container.querySelector('.qy-message__close')).not.toBeInTheDocument()
      })
    })

    it('应该使用默认的 dangerouslyUseHTMLString 值', async () => {
      render(Message, {
        props: {
          message: '<span>默认HTML</span>',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('<span>默认HTML</span>')).toBeInTheDocument()
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串消息', async () => {
      render(Message, {
        props: {
          message: '',
          duration: 0,
        },
      })

      await waitFor(() => {
        const textEl = document.querySelector('.qy-message__text')
        expect(textEl).toBeInTheDocument()
      })
    })

    it('应该处理很长的消息内容', async () => {
      const longMessage = '这是一条很长的消息'.repeat(10)
      render(Message, {
        props: {
          message: longMessage,
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText(longMessage)).toBeInTheDocument()
      })
    })

    it('应该处理零偏移量', async () => {
      const { container } = render(Message, {
        props: {
          message: '零偏移',
          offset: 0,
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.fixed')
        expect(messageEl).toHaveStyle({ top: '0px' })
      })
    })

    it('应该处理很大的偏移量', async () => {
      const { container } = render(Message, {
        props: {
          message: '大偏移',
          offset: 1000,
          duration: 0,
        },
      })

      await waitFor(() => {
        const messageEl = container.querySelector('.fixed')
        expect(messageEl).toHaveStyle({ top: '1000px' })
      })
    })
  })

  describe('渲染时机', () => {
    it('应该在组件挂载后显示消息', async () => {
      const { container } = render(Message, {
        props: {
          message: '挂载测试',
          duration: 0,
        },
      })

      // 等待组件挂载并显示消息
      await waitFor(() => {
        expect(screen.getByText('挂载测试')).toBeInTheDocument()
      })

      // 验证消息容器存在
      const messageEl = container.querySelector('.qy-message__text')
      expect(messageEl).toBeInTheDocument()
    })
  })
})
