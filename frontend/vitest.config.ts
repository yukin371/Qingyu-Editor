import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // TDD Phase 0: 使用 happy-dom 作为测试环境（更轻量快速）
      environment: 'happy-dom',

      exclude: [...configDefaults.exclude, 'e2e/**', 'tests/e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),

      // 测试文件匹配模式
      include: [
        'tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/modules/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'
      ],

      // 覆盖率配置（TDD要求：≥90%）
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/**/*.{js,ts,vue}'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.d.ts',
          '**/*.config.{js,ts}',
          '**/mockData/**',
          'dist/',
          'build/',
          'src/main.ts',
          'src/**/*.spec.ts',
          'src/**/*.test.ts',
          'src/**/*.test.tsx',
          'src/**/__tests__/**'
        ],
        // TDD要求：≥90%覆盖率
        thresholds: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90
        }
      },

      // 全局配置
      globals: true,
      setupFiles: ['./tests/unit/setup.ts'],

      // 测试超时
      testTimeout: 10000,
      hookTimeout: 10000,

      // 并发配置（Vitest 4+使用扁平化配置）
      pool: 'threads',

      // 报告器配置
      reporter: ['verbose', 'html']
    },
  }),
)
