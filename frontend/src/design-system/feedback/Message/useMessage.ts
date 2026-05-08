/**
 * useMessage Hook
 *
 * 全局调用 Message 的组合式函数
 */

import { createApp, h, reactive, type App, type VNode } from 'vue'
import Message from './Message.vue'
import type { MessageProps, MessageOptions, MessageHandler } from './types'

// 消息容器
let messageContainer: HTMLElement | null = null

// 消息实例列表
const instances: Array<{
  id: string
  app: App
  props: MessageProps
}> = []

// 初始化消息容器
const initContainer = () => {
  if (!messageContainer) {
    messageContainer = document.createElement('div')
    messageContainer.className = 'qy-message-container'
    messageContainer.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; z-index: 5000; pointer-events: none;'
    document.body.appendChild(messageContainer)
  }
  return messageContainer
}

// 计算消息偏移量
const calculateOffset = (index: number, baseOffset: number = 20): number => {
  let offset = baseOffset
  for (let i = 0; i < index; i++) {
    const instance = instances[i]
    if (instance) {
      // 每个消息高度约 60px，加上间距 16px
      offset += 60 + 16
    }
  }
  return offset
}

// 创建消息实例
const createMessage = (options: MessageOptions): MessageHandler => {
  const container = initContainer()

  // 创建包装元素
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'pointer-events: auto;'
  container.appendChild(wrapper)

  // 生成唯一 ID
  const id = `message-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  // 构建消息属性（使用 reactive 使其成为响应式对象）
  const props = reactive<MessageProps>({
    message: options.message || '',
    type: options.type || 'info',
    duration: options.duration ?? 3000,
    showClose: options.showClose ?? false,
    center: options.center ?? false,
    dangerouslyUseHTMLString: options.dangerouslyUseHTMLString ?? false,
    offset: options.offset ?? calculateOffset(instances.length, options.offset),
    onClose: options.onClose,
  })

  // 创建 Vue 应用实例
  const app = createApp({
    render() {
      return h(Message, {
        ...props,
        onClose: () => {
          // 从实例列表中移除
          const index = instances.findIndex((instance) => instance.id === id)
          if (index > -1) {
            instances.splice(index, 1)
          }
          // 调用用户回调
          if (props.onClose) {
            props.onClose()
          }
          // 更新剩余消息的位置
          updatePositions()
          // 卸载组件
          app.unmount()
          wrapper.remove()
        },
      })
    },
  })

  // 添加到实例列表
  instances.push({ id, app, props })

  // 挂载组件
  app.mount(wrapper)

  // 返回控制对象
  return {
    close: () => {
      // 触发组件的关闭逻辑
      // 由于组件是通过 render 方式创建的，我们需要通过 DOM 操作来触发关闭
      const messageComponent = app._instance?.proxy
      if (messageComponent && typeof (messageComponent as unknown as { close: () => void }).close === 'function') {
        (messageComponent as unknown as { close: () => void }).close()
      } else {
        // 如果无法访问 close 方法，直接卸载
        const index = instances.findIndex((instance) => instance.id === id)
        if (index > -1) {
          instances.splice(index, 1)
        }
        updatePositions()
        app.unmount()
        wrapper.remove()
      }
    },
  }
}

// 更新所有消息的位置
const updatePositions = () => {
  instances.forEach((instance, index) => {
    const newOffset = calculateOffset(index, instance.props.offset)
    instance.props.offset = newOffset
  })
}

// 消息调用方法
const message = {
  // 基础调用方法
  show: (options: MessageOptions): MessageHandler => createMessage(options),

  // 成功消息
  success: (message: string | VNode, options?: Omit<MessageOptions, 'message' | 'type'>): MessageHandler => {
    return createMessage({
      message,
      type: 'success',
      ...options,
    })
  },

  // 信息消息
  info: (message: string | VNode, options?: Omit<MessageOptions, 'message' | 'type'>): MessageHandler => {
    return createMessage({
      message,
      type: 'info',
      ...options,
    })
  },

  // 警告消息
  warning: (message: string | VNode, options?: Omit<MessageOptions, 'message' | 'type'>): MessageHandler => {
    return createMessage({
      message,
      type: 'warning',
      ...options,
    })
  },

  // 错误消息
  error: (message: string | VNode, options?: Omit<MessageOptions, 'message' | 'type'>): MessageHandler => {
    return createMessage({
      message,
      type: 'error',
      ...options,
    })
  },
}

// useMessage Hook
export function useMessage() {
  return message
}

// 默认导出
export default message
