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
const plugins = [tailwindcss(), vue({
  // 启用 JSX 支持
  script: {
    defineModel: true,
    propsDestructure: true
  }
}), vueJsx()]
if (!isTest && !isStorybook) {
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
      '@bookstore': fileURLToPath(new URL('./src/modules/bookstore', import.meta.url)),
      '@reader': fileURLToPath(new URL('./src/modules/reader', import.meta.url)),
      '@user': fileURLToPath(new URL('./src/modules/user', import.meta.url)),
      '@writer': fileURLToPath(new URL('./src/modules/writer', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/modules/admin', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/modules/shared', import.meta.url)),
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
        manualChunks: {
          // Vue核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 图表库
          'echarts': ['echarts'],
          // 工具库
          'utils': ['axios', 'marked', 'nanoid', 'nprogress']
        }
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
