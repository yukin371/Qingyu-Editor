/**
 * 全局环境类型声明
 * Vue 单文件组件声明统一收口到 src/shims-vue.d.ts。
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_PORT: string
  readonly VITE_OPEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
