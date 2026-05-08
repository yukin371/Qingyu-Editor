declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明 @/ 路径别名下的所有模块
declare module '@/*'
declare module '@/api/*'
declare module '@/stores/*'
declare module '@/types/*'
declare module '@/composables/*'
declare module '@/components/*'
declare module '@/modules/*'
declare module '@/pages/*'
declare module '@/utils/*'
declare module '@/router/*'
