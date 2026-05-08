/**
 * useNotification Hook
 *
 * 提供全局通知调用功能
 */

import { h, render, type VNode } from 'vue'
import NotificationComponent from './Notification.vue'
import type {
  NotificationOptions,
  NotificationPosition,
  NotificationHandler,
  NotificationConfig,
  NotificationProps,
} from './types'

// 通知实例管理
interface NotificationInstanceData {
  id: string
  vnode: VNode
  handler: NotificationHandler
  container: HTMLElement
  position: NotificationPosition
}

let seed = 1
const instances: Map<string, NotificationInstanceData> = new Map()

// 全局配置
let globalConfig: NotificationConfig = {
  position: 'top-right',
  duration: 4500,
  maxCount: 0,
  offset: 16,
}

// 获取位置对应的容器类名
function getPositionContainerClass(position: NotificationPosition): string {
  const classMap: Record<NotificationPosition, string> = {
    'top-right': 'fixed top-0 right-0 flex flex-col p-4 gap-2 z-[5000] pointer-events-none',
    'top-left': 'fixed top-0 left-0 flex flex-col p-4 gap-2 z-[5000] pointer-events-none',
    'bottom-right': 'fixed bottom-0 right-0 flex flex-col-reverse p-4 gap-2 z-[5000] pointer-events-none',
    'bottom-left': 'fixed bottom-0 left-0 flex flex-col-reverse p-4 gap-2 z-[5000] pointer-events-none',
  }
  return classMap[position]
}

// 获取或创建位置容器
function getPositionContainer(position: NotificationPosition): HTMLElement {
  const containerId = `notification-container-${position}`
  let container = document.getElementById(containerId)

  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    container.className = getPositionContainerClass(position)
    document.body.appendChild(container)
  }

  return container
}

// 移除通知实例
function removeNotification(id: string): void {
  const instance = instances.get(id)
  if (!instance) return

  const { container, vnode: _vnode } = instance

  // 等待动画完成后移除
  setTimeout(() => {
    render(null, container)
    instances.delete(id)

    // 如果容器中没有子元素了，移除容器
    if (container.children.length === 0) {
      const position = instance.position
      const containerId = `notification-container-${position}`
      const allContainers = document.querySelectorAll(`[id^="${containerId}"]`)
      if (allContainers.length === 0) {
        container.remove()
      }
    }
  }, 300)
}

// 创建通知函数
function createNotification(options: NotificationOptions = {}): NotificationHandler {
  const id = `notification-${seed++}`
  const {
    position = globalConfig.position,
    duration = globalConfig.duration,
  } = options

  const props = options

  // 检查最大数量限制
  if (globalConfig.maxCount! > 0) {
    const positionInstances = Array.from(instances.values()).filter(
      (inst) => inst.position === position
    )
    if (positionInstances.length >= globalConfig.maxCount!) {
      const firstInstance = positionInstances[0]
      if (firstInstance) {
        removeNotification(firstInstance.id)
      }
    }
  }

  // 创建容器
  const container = getPositionContainer(position!)
  const wrapper = document.createElement('div')
  wrapper.className = 'notification-wrapper'
  container.appendChild(wrapper)

  // 创建 VNode
  const vnode = h(
    NotificationComponent,
    {
      ...props,
      duration: duration!,
      position: position!,
      onClose: () => {
        removeNotification(id)
        if (props.onClose) {
          props.onClose()
        }
      },
    } as NotificationProps
  )

  // 渲染组件
  render(vnode, wrapper)

  // 创建 handler
  const handler: NotificationHandler = {
    close: () => removeNotification(id),
  }

  // 保存实例
  instances.set(id, {
    id,
    vnode,
    handler,
    container: wrapper,
    position: position!,
  })

  return handler
}

// Notification API
export interface NotificationAPI {
  (options: NotificationOptions): NotificationHandler
  success: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => NotificationHandler
  info: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => NotificationHandler
  warning: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => NotificationHandler
  error: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => NotificationHandler
  closeAll: () => void
  config: (config: NotificationConfig) => void
}

// 创建 Notification 函数
const notification: NotificationAPI = (options: NotificationOptions) => {
  return createNotification(options)
}

// 添加快捷方法
notification.success = (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => {
  return createNotification({ ...options, message, type: 'success' })
}

notification.info = (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => {
  return createNotification({ ...options, message, type: 'info' })
}

notification.warning = (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => {
  return createNotification({ ...options, message, type: 'warning' })
}

notification.error = (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => {
  return createNotification({ ...options, message, type: 'error' })
}

// 关闭所有通知
notification.closeAll = () => {
  const ids = Array.from(instances.keys())
  ids.forEach((id) => removeNotification(id))
}

// 配置全局选项
notification.config = (config: NotificationConfig) => {
  globalConfig = { ...globalConfig, ...config }
}

export default notification

// useNotification Hook
export function useNotification() {
  return notification
}
