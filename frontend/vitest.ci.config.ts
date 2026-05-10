import { fileURLToPath } from 'node:url'
import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      exclude: [...configDefaults.exclude, 'e2e/**', 'tests/e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      include: [
        'tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/modules/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
      ],
      globals: true,
      setupFiles: ['./tests/unit/setup.ts'],
      testTimeout: 10000,
      hookTimeout: 10000,
      pool: 'threads',
      reporter: ['verbose'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'lcov'],
        include: [
          'src/modules/writer/stores/editorStore.ts',
          'src/modules/writer/api/outline.ts',
          'src/modules/writer/api/timeline.ts',
          'src/modules/writer/api/wrapper.ts',
          'src/modules/ai/api/ai.ts',
          'src/modules/ai/api/workbench.ts',
          'src/utils/api-health.ts',
        ],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.d.ts',
          '**/*.config.{js,ts}',
          'dist/',
          'build/',
        ],
        thresholds: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
      },
    },
  }),
)
