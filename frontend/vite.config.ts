/* eslint-disable @typescript-eslint/no-undef */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import tailwindcss from '@tailwindcss/vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

// 根据环境决定是否加载 VueDevTools
// Vitest 和 Storybook 环境下禁用，避免兼容性问题
const isTest = process.env.VITEST || process.env.NODE_ENV === 'test'
const isStorybook = process.env.STORYBOOK === 'true' || process.env.npm_lifecycle_event === 'storybook'
const enableVueDevTools = process.env.VITE_ENABLE_VUE_DEVTOOLS === 'true'
const createManualChunk = (id: string) => {
  if (!id.includes('node_modules')) {
    return undefined
  }

  if (
    id.includes('/node_modules/vue/') ||
    id.includes('/node_modules/vue-router/') ||
    id.includes('/node_modules/pinia/')
  ) {
    return 'vue-vendor'
  }

  if (
    id.includes('/node_modules/@tiptap/') ||
    id.includes('/node_modules/prosemirror-') ||
    id.includes('/node_modules/orderedmap/') ||
    id.includes('/node_modules/rope-sequence/')
  ) {
    return 'tiptap-vendor'
  }

  if (id.includes('/node_modules/@floating-ui/')) {
    return 'floating-ui-vendor'
  }

  if (id.includes('/node_modules/echarts/')) {
    return 'echarts-vendor'
  }

  if (id.includes('/node_modules/d3/')) {
    return 'graph-vendor'
  }

  if (
    id.includes('/node_modules/axios/') ||
    id.includes('/node_modules/dayjs/') ||
    id.includes('/node_modules/dompurify/') ||
    id.includes('/node_modules/marked/') ||
    id.includes('/node_modules/nanoid/') ||
    id.includes('/node_modules/nprogress/')
  ) {
    return 'utils-vendor'
  }

  return undefined
}
const plugins = [tailwindcss(), vue({
  // 启用 JSX 支持
  script: {
    defineModel: true,
    propsDestructure: true
  }
}), vueJsx()]
if (!isTest && !isStorybook && enableVueDevTools) {
  plugins.push(VueDevTools())
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/design-system': fileURLToPath(new URL('./src/design-system', import.meta.url)),
      '@/tests': fileURLToPath(new URL('./tests', import.meta.url)),
      '@writer': fileURLToPath(new URL('./src/modules/writer', import.meta.url)),
      '@ai': fileURLToPath(new URL('./src/modules/ai', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      // API代理到后端
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      // WebSocket代理（实时通知、评论等）
      '/ws': {
        target: 'ws://localhost:9090',
        ws: true,
        changeOrigin: true
      }
    }
  },
  build: {
    // 提高chunk大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 手动分包优化
    rollupOptions: {
      output: {
        manualChunks: createManualChunk,
      }
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 构建目标
    target: 'es2015',
    // 使用 esbuild 压缩（Vite 默认）
    minify: 'esbuild',
    // 生产环境移除 console
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
    }
  },
  // 定义全局变量
  define: {
    'process.env.VITEST': JSON.stringify(process.env.VITEST),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.STORYBOOK': JSON.stringify(process.env.STORYBOOK),
    'process.env.npm_lifecycle_event': JSON.stringify(process.env.npm_lifecycle_event)
  }
})
