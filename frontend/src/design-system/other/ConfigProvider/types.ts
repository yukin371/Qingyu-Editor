/**
 * ConfigProvider 全局配置组件类型定义
 */

import type { InjectionKey } from 'vue'

// 全局尺寸类型
export type ConfigProviderSize = 'small' | 'medium' | 'large'

// 文本方向类型
export type ConfigProviderDirection = 'ltr' | 'rtl'

// 按钮配置接口
export interface ConfigProviderButtonConfig {
  /**
   * 按钮默认尺寸
   * @default 'medium'
   */
  size?: ConfigProviderSize

  /**
   * 按钮默认变体
   * @default 'solid'
   */
  variant?: 'solid' | 'outline' | 'ghost' | 'text'
}

// Z-Index 配置接口
export interface ConfigProviderZIndexConfig {
  /**
   * 全局 z-index 起始值
   * @default 1000
   */
  base?: number

  /**
   * 下拉菜单 z-index
   * @default 1050
   */
  dropdown?: number

  /**
   * 弹出层 z-index
   * @default 1060
   */
  popover?: number

  /**
   * 对话框 z-index
   * @default 1070
   */
  dialog?: number

  /**
   * 通知 z-index
   * @default 1080
   */
  notification?: number

  /**
   * 消息提示 z-index
   * @default 1090
   */
  message?: number
}

// 语言包类型（简单的 key-value 对象）
export type Locale = Record<string, string>

// ConfigProvider Props 接口
export interface ConfigProviderProps {
  /**
   * 全局尺寸
   * @default 'medium'
   */
  size?: ConfigProviderSize

  /**
   * 组件类名前缀
   * @default 'qy'
   */
  namespace?: string

  /**
   * 语言包对象
   */
  locale?: Locale

  /**
   * 文本方向
   * @default 'ltr'
   */
  direction?: ConfigProviderDirection

  /**
   * 按钮默认配置
   */
  button?: ConfigProviderButtonConfig

  /**
   * 全局 z-index 配置
   */
  zIndex?: ConfigProviderZIndexConfig

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 自定义样式
   */
  style?: any
}

// ConfigProvider 组件默认属性
export const configProviderDefaults: Partial<ConfigProviderProps> = {
  size: 'medium',
  namespace: 'qy',
  direction: 'ltr',
  button: {
    size: 'medium',
    variant: 'solid',
  },
  zIndex: {
    base: 1000,
    dropdown: 1050,
    popover: 1060,
    dialog: 1070,
    notification: 1080,
    message: 1090,
  },
}

// ConfigProvider 事件定义
export interface ConfigProviderEmits {
  // ConfigProvider 组件不触发任何事件
}

// ConfigProvider 插槽定义
export interface ConfigProviderSlots {
  default?: () => any
}

// 提供给子组件的配置上下文类型
export interface ConfigProviderContext {
  size?: ConfigProviderSize
  namespace?: string
  locale?: Locale
  direction?: ConfigProviderDirection
  button?: ConfigProviderButtonConfig
  zIndex?: ConfigProviderZIndexConfig
}

// provide/inject 的键
export const CONFIG_PROVIDER_KEY = Symbol('configProvider') as InjectionKey<ConfigProviderContext>
