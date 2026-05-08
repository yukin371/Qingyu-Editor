/**
 * ConfigProvider 全局配置组件导出
 */

export { default as ConfigProvider } from './ConfigProvider.vue'
export type {
  ConfigProviderSize,
  ConfigProviderDirection,
  ConfigProviderButtonConfig,
  ConfigProviderZIndexConfig,
  ConfigProviderProps,
  ConfigProviderEmits,
  ConfigProviderSlots,
  ConfigProviderContext,
  Locale,
} from './types'
export { configProviderDefaults, CONFIG_PROVIDER_KEY } from './types'
