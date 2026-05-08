/**
 * useMessageBox Hook
 *
 * 提供全局消息框调用功能
 */

import { createApp, h, reactive, type App } from 'vue'
import MessageBoxComponent from './MessageBox.vue'
import type {
  MessageBoxOptions,
  MessageBoxAction,
  MessageBoxResult,
  MessageBoxType,
} from './types'

// 消息框实例
let currentInstance: {
  app: App
  container: HTMLElement
  resolve: (result: MessageBoxResult) => void
} | null = null

// 创建消息框
const createMessageBox = (
  options: MessageBoxOptions
): Promise<MessageBoxResult> => {
  return new Promise((resolve) => {
    // 如果已有实例，先关闭
    if (currentInstance) {
      currentInstance.app.unmount()
      currentInstance.container.remove()
    }

    // 创建容器
    const container = document.createElement('div')
    document.body.appendChild(container)

    // 响应式状态
    const state = reactive({
      ...options,
      type: (options.type || 'confirm') as MessageBoxType,
      showIcon: options.showIcon !== false,
      showClose: options.showClose !== false,
      center: options.center || false,
      closeOnClickModal: options.closeOnClickModal !== false,
      closeOnPressEscape: options.closeOnPressEscape !== false,
    }) as MessageBoxOptions & {
      type: MessageBoxType
      showIcon: boolean
      showClose: boolean
      center: boolean
      closeOnClickModal: boolean
      closeOnPressEscape: boolean
    }

    // 创建 Vue 应用实例
    let messageBoxRef: any = null
    const app = createApp({
      render() {
        return h(MessageBoxComponent, {
          ...state,
          ref: (el: any) => {
            if (el) messageBoxRef = el
          },
          onAction: (action: MessageBoxAction) => {
            // 清理实例
            if (currentInstance) {
              currentInstance.app.unmount()
              currentInstance.container.remove()
              currentInstance = null
            }

            // 返回结果
            const result: MessageBoxResult = {
              action,
              value: state.modelValue,
            }
            resolve(result)
          },
        })
      },
    })

    // 挂载组件
    app.mount(container)

    // 保存实例引用
    currentInstance = {
      app,
      container,
      resolve,
    }

    // 等待下一帧后打开对话框
    setTimeout(() => {
      if (messageBoxRef && messageBoxRef.open) {
        messageBoxRef.open()
      }
    }, 0)
  })
}

// MessageBox API
export interface MessageBoxAPI {
  (options: MessageBoxOptions): Promise<MessageBoxResult>
  alert: (message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>) => Promise<MessageBoxResult>
  confirm: (message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>) => Promise<MessageBoxResult>
  prompt: (message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>) => Promise<MessageBoxResult>
}

// 创建 MessageBox 函数
const messageBox: MessageBoxAPI = (options: MessageBoxOptions) => {
  return createMessageBox(options)
}

// alert 方法
messageBox.alert = (
  message: string,
  title?: string,
  options?: Omit<MessageBoxOptions, 'message' | 'title'>
): Promise<MessageBoxResult> => {
  return createMessageBox({
    ...options,
    message,
    title,
    type: 'alert',
  })
}

// confirm 方法
messageBox.confirm = (
  message: string,
  title?: string,
  options?: Omit<MessageBoxOptions, 'message' | 'title'>
): Promise<MessageBoxResult> => {
  return createMessageBox({
    ...options,
    message,
    title,
    type: 'confirm',
  }).then((result) => {
    if (result.action === 'confirm') {
      return result
    }
    return Promise.reject('cancel')
  })
}

// prompt 方法
messageBox.prompt = (
  message: string,
  title?: string,
  options?: Omit<MessageBoxOptions, 'message' | 'title'>
): Promise<MessageBoxResult> => {
  return createMessageBox({
    ...options,
    message,
    title,
    type: 'prompt',
  }).then((result) => {
    if (result.action === 'confirm') {
      return result
    }
    return Promise.reject('cancel')
  })
}

// 默认导出
export default messageBox

// useMessageBox Hook
export function useMessageBox() {
  return messageBox
}
