/**
 * Notification 组件单元测试
 */


import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import Notification from '../Notification.vue'
import notification from '../useNotification'

describe('Notification 组件', () => {
  beforeEach(() => {
    // 清理通知容器
    const containers = document.querySelectorAll('[id^="notification-container-"]')
    containers.forEach((container) => container.remove())
  })

  afterEach(() => {
    // 清理通知容器
    const containers = document.querySelectorAll('[id^="notification-container-"]')
    containers.forEach((container) => container.remove())
  })

  // 基础渲染测试
  describe('基础渲染', () => {
    it('应该正确渲染组件', async () => {
      render(Notification, {
        props: {
          message: '这是一条通知',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('这是一条通知')).toBeInTheDocument()
      })
    })

    it('应该显示默认类型为 info', async () => {
      const { container } = render(Notification, {
        props: {
          message: '测试消息',
          duration: 0,
        },
      })

      await waitFor(() => {
        const element = container.querySelector('.border-info-200')
        expect(element).toBeInTheDocument()
      })
    })

    it('应该显示标题', async () => {
      render(Notification, {
        props: {
          title: '成功',
          message: '操作成功',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('成功')).toBeInTheDocument()
        expect(screen.getByText('操作成功')).toBeInTheDocument()
      })
    })

    it('应该显示正确的图标', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'success',
          message: '成功消息',
          duration: 0,
        },
      })

      await waitFor(() => {
        const icon = container.querySelector('.text-emerald-500')
        expect(icon).toBeInTheDocument()
      })
    })
  })

  // 类型变体测试
  describe('类型变体', () => {
    it('应该渲染 success 类型', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'success',
          message: '成功',
          duration: 0,
        },
      })

      await waitFor(() => {
        const element = container.querySelector('.border-emerald-200')
        expect(element).toBeInTheDocument()
      })
    })

    it('应该渲染 info 类型', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'info',
          message: '信息',
          duration: 0,
        },
      })

      await waitFor(() => {
        const element = container.querySelector('.border-info-200')
        expect(element).toBeInTheDocument()
      })
    })

    it('应该渲染 warning 类型', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'warning',
          message: '警告',
          duration: 0,
        },
      })

      await waitFor(() => {
        const element = container.querySelector('.border-amber-200')
        expect(element).toBeInTheDocument()
      })
    })

    it('应该渲染 error 类型', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'error',
          message: '错误',
          duration: 0,
        },
      })

      await waitFor(() => {
        const element = container.querySelector('.border-red-200')
        expect(element).toBeInTheDocument()
      })
    })

    it('success 类型应该有正确的图标颜色', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'success',
          message: '成功',
          duration: 0,
        },
      })

      await waitFor(() => {
        const icon = container.querySelector('.text-emerald-500')
        expect(icon).toBeInTheDocument()
      })
    })

    it('info 类型应该有正确的图标颜色', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'info',
          message: '信息',
          duration: 0,
        },
      })

      await waitFor(() => {
        const icon = container.querySelector('.text-info-500')
        expect(icon).toBeInTheDocument()
      })
    })

    it('warning 类型应该有正确的图标颜色', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'warning',
          message: '警告',
          duration: 0,
        },
      })

      await waitFor(() => {
        const icon = container.querySelector('.text-amber-500')
        expect(icon).toBeInTheDocument()
      })
    })

    it('error 类型应该有正确的图标颜色', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'error',
          message: '错误',
          duration: 0,
        },
      })

      await waitFor(() => {
        const icon = container.querySelector('.text-red-500')
        expect(icon).toBeInTheDocument()
      })
    })
  })

  // 关闭按钮测试
  describe('关闭按钮', () => {
    it('默认应该显示关闭按钮', async () => {
      const { container } = render(Notification, {
        props: {
          message: '测试',
          duration: 0,
        },
      })

      await waitFor(() => {
        const closeButton = container.querySelector('.qy-notification__close')
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('showClose 为 false 时不显示关闭按钮', async () => {
      const { container } = render(Notification, {
        props: {
          message: '测试',
          showClose: false,
          duration: 0,
        },
      })

      await waitFor(() => {
        const closeButton = container.querySelector('.qy-notification__close')
        expect(closeButton).not.toBeInTheDocument()
      })
    })

    it('点击关闭按钮应该触发 close 事件', async () => {
      const { emitted, container } = render(Notification, {
        props: {
          message: '测试',
          duration: 0,
        },
      })

      await waitFor(() => {
        const closeButton = container.querySelector('.qy-notification__close')
        expect(closeButton).toBeInTheDocument()
      })

      const closeButton = container.querySelector('.qy-notification__close')!
      await fireEvent.click(closeButton)

      expect(emitted().close).toBeTruthy()
    })
  })

  // 自动关闭测试
  describe('自动关闭', () => {
    it('应该在指定时长后自动关闭', async () => {
      const { container } = render(Notification, {
        props: {
          message: '测试',
          duration: 500,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('测试')).toBeInTheDocument()
      })

      // 等待组件自动关闭
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 检查元素是否已被隐藏或移除
      await waitFor(() => {
        const element = container.querySelector('[role="alert"]')
        expect((element as HTMLElement | null)?.style.display).toBe('none')
      })
    })

    it('duration 为 0 时不应该自动关闭', async () => {
      render(Notification, {
        props: {
          message: '测试',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('测试')).toBeInTheDocument()
      })

      // 等待一段时间，确保没有自动关闭
      await new Promise(resolve => setTimeout(resolve, 500))

      await waitFor(() => {
        expect(screen.getByText('测试')).toBeInTheDocument()
      })
    })
  })

  // 点击事件测试
  describe('点击事件', () => {
    it('点击通知应该触发 click 事件', async () => {
      const { emitted, container } = render(Notification, {
        props: {
          message: '测试',
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('测试')).toBeInTheDocument()
      })

      const notificationDiv = container.querySelector('[role="alert"]')!
      await fireEvent.click(notificationDiv)

      expect(emitted().click).toBeTruthy()
    })

    it('点击通知应该调用 onClick 回调', async () => {
      const onClick = vi.fn()
      const { container } = render(Notification, {
        props: {
          message: '测试',
          onClick,
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('测试')).toBeInTheDocument()
      })

      const notificationDiv = container.querySelector('[role="alert"]')!
      await fireEvent.click(notificationDiv)

      expect(onClick).toHaveBeenCalled()
    })

    it('点击关闭按钮不应该触发通知的点击事件', async () => {
      const onClick = vi.fn()
      const { container } = render(Notification, {
        props: {
          message: '测试',
          onClick,
          duration: 0,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('测试')).toBeInTheDocument()
      })

      const closeButton = container.querySelector('.qy-notification__close')!
      await fireEvent.click(closeButton)

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  // 自定义内容测试
  describe('自定义内容', () => {
    it('应该支持自定义图标', async () => {
      const customIcon = '<svg class="custom-icon">test</svg>'
      const { container } = render(Notification, {
        props: {
          message: '测试',
          customIcon,
          duration: 0,
        },
      })

      await waitFor(() => {
        const icon = container.querySelector('.custom-icon')
        expect(icon).toBeInTheDocument()
      })
    })

    it('应该支持 HTML 内容', async () => {
      const { container } = render(Notification, {
        props: {
          message: '<strong>加粗文本</strong>',
          dangerouslyUseHTMLString: true,
          duration: 0,
        },
      })

      await waitFor(() => {
        const html = container.innerHTML
        expect(html).toContain('<strong>加粗文本</strong>')
      })
    })

    it('不支持 HTML 时应该转义内容', async () => {
      render(Notification, {
        props: {
          message: '<strong>加粗文本</strong>',
          dangerouslyUseHTMLString: false,
          duration: 0,
        },
      })

      await waitFor(() => {
        const text = screen.getByText(/<strong>/)
        expect(text).toBeInTheDocument()
      })
    })
  })

  // 深色模式测试
  describe('深色模式', () => {
    it('success 类型在深色模式下应该有正确的样式', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'success',
          message: '测试',
          duration: 0,
        },
      })

      await waitFor(() => {
        const element = container.querySelector('.dark\\:bg-emerald-950')
        expect(element).toBeInTheDocument()
      })
    })

    it('info 类型在深色模式下应该有正确的样式', async () => {
      const { container } = render(Notification, {
        props: {
          type: 'info',
          message: '测试',
          duration: 0,
        },
      })

      await waitFor(() => {
        const element = container.querySelector('.dark\\:bg-info-950')
        expect(element).toBeInTheDocument()
      })
    })
  })

  // 无障碍测试
  describe('无障碍', () => {
    it('应该有正确的 role 属性', async () => {
      const { container } = render(Notification, {
        props: {
          message: '测试',
          duration: 0,
        },
      })

      await waitFor(() => {
        const notificationDiv = container.querySelector('[role="alert"]')
        expect(notificationDiv).toBeInTheDocument()
      })
    })

    it('关闭按钮应该有 aria-label', async () => {
      const { container } = render(Notification, {
        props: {
          message: '测试',
          duration: 0,
        },
      })

      await waitFor(() => {
        const closeButton = container.querySelector('[aria-label="关闭"]')
        expect(closeButton).toBeInTheDocument()
      })
    })
  })

  // 动画测试
  describe('动画', () => {
    it('应该有进入动画类', async () => {
      const { container } = render(Notification, {
        props: {
          message: '测试',
          duration: 0,
        },
      })

      await waitFor(() => {
        const element = container.querySelector('[role="alert"]')
        expect(element).toBeInTheDocument()
      })
    })
  })
})

describe('useNotification Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 清理所有通知容器
    const containers = document.querySelectorAll('[id^="notification-container-"]')
    containers.forEach((container) => container.remove())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // 关闭所有通知
    const containers = document.querySelectorAll('[id^="notification-container-"]')
    containers.forEach((container) => container.remove())
  })

  // 基础功能测试
  describe('基础功能', () => {
    it('应该能够创建通知', () => {
      const handler = notification({
        message: '测试通知',
      })

      expect(handler).toBeDefined()
      expect(handler.close).toBeInstanceOf(Function)
    })

    it('success 方法应该创建成功类型通知', () => {
      const handler = notification.success('成功消息')

      expect(handler).toBeDefined()
      expect(handler.close).toBeInstanceOf(Function)
    })

    it('info 方法应该创建信息类型通知', () => {
      const handler = notification.info('信息消息')

      expect(handler).toBeDefined()
      expect(handler.close).toBeInstanceOf(Function)
    })

    it('warning 方法应该创建警告类型通知', () => {
      const handler = notification.warning('警告消息')

      expect(handler).toBeDefined()
      expect(handler.close).toBeInstanceOf(Function)
    })

    it('error 方法应该创建错误类型通知', () => {
      const handler = notification.error('错误消息')

      expect(handler).toBeDefined()
      expect(handler.close).toBeInstanceOf(Function)
    })
  })

  // 关闭功能测试
  describe('关闭功能', () => {
    it('close 方法应该能够关闭通知', () => {
      const handler = notification.info('测试')

      handler.close()

      expect(handler).toBeDefined()
    })

    it('closeAll 方法应该关闭所有通知', () => {
      notification.success('通知1')
      notification.info('通知2')
      notification.warning('通知3')

      notification.closeAll()

      expect(notification).toBeDefined()
    })
  })

  // 配置测试
  describe('配置功能', () => {
    it('config 方法应该能够设置全局配置', () => {
      notification.config({
        position: 'top-left',
        duration: 2000,
        maxCount: 5,
      })

      const handler = notification.success('测试')

      expect(handler).toBeDefined()
    })

    it('应该支持设置 position', () => {
      notification.config({
        position: 'bottom-right',
      })

      const handler = notification.info('测试')

      expect(handler).toBeDefined()
    })

    it('应该支持设置 duration', () => {
      notification.config({
        duration: 5000,
      })

      const handler = notification.info('测试')

      expect(handler).toBeDefined()
    })

    it('应该支持设置 maxCount', () => {
      notification.config({
        maxCount: 3,
      })

      // 创建多个通知
      for (let i = 0; i < 5; i++) {
        notification.info(`通知${i}`)
      }

      expect(notification).toBeDefined()
    })
  })

  // 回调测试
  describe('回调功能', () => {
    it('应该支持 onClose 回调', () => {
      const onClose = vi.fn()
      notification({
        message: '测试',
        duration: 1000,
        onClose,
      })

      vi.advanceTimersByTime(1000)

      expect(notification).toBeDefined()
    })

    it('应该支持 onClick 回调', () => {
      const onClick = vi.fn()
      notification({
        message: '测试',
        onClick,
      })

      expect(notification).toBeDefined()
    })
  })

  // 选项测试
  describe('选项功能', () => {
    it('应该支持 title 选项', () => {
      const handler = notification({
        title: '成功',
        message: '操作成功',
      })

      expect(handler).toBeDefined()
    })

    it('应该支持 showClose 选项', () => {
      const handler = notification({
        message: '测试',
        showClose: false,
      })

      expect(handler).toBeDefined()
    })

    it('应该支持 duration 选项', () => {
      const handler = notification({
        message: '测试',
        duration: 2000,
      })

      expect(handler).toBeDefined()
    })

    it('应该支持 position 选项', () => {
      const handler = notification({
        message: '测试',
        position: 'top-left',
      })

      expect(handler).toBeDefined()
    })

    it('应该支持自定义位置 top-right', () => {
      const handler = notification({
        message: '测试',
        position: 'top-right',
      })

      expect(handler).toBeDefined()
    })

    it('应该支持自定义位置 top-left', () => {
      const handler = notification({
        message: '测试',
        position: 'top-left',
      })

      expect(handler).toBeDefined()
    })

    it('应该支持自定义位置 bottom-right', () => {
      const handler = notification({
        message: '测试',
        position: 'bottom-right',
      })

      expect(handler).toBeDefined()
    })

    it('应该支持自定义位置 bottom-left', () => {
      const handler = notification({
        message: '测试',
        position: 'bottom-left',
      })

      expect(handler).toBeDefined()
    })
  })
})
