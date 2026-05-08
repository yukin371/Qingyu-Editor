import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/storybook-static/**',
    '**/node_modules/**',
  ]),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  // 宽松模式：关闭严格规则，保留关键错误检查
  {
    name: 'relaxed-rules',
    rules: {
      // 关闭 any 类型检查（快速开发阶段）
      '@typescript-eslint/no-explicit-any': 'off',
      // 未使用变量降为警告
      '@typescript-eslint/no-unused-vars': 'warn',
      // ts-comment 降为警告
      '@typescript-eslint/ban-ts-comment': 'warn',
      // 组件命名规则降为警告
      'vue/multi-word-component-names': 'warn',
      // 允许 require
      '@typescript-eslint/no-require-imports': 'off',
      // 允许空对象类型
      '@typescript-eslint/no-empty-object-type': 'off',
      // 允许函数类型
      '@typescript-eslint/no-unsafe-function-type': 'off',
      // 允许 this 别名
      '@typescript-eslint/no-this-alias': 'off',
      // props 修改降为警告
      'vue/no-mutating-props': 'warn',
      // 允许 block lang 配置
      'vue/block-lang': 'off',
    },
  },

  // 测试文件配置（放宽 vitest 规则）
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
    rules: {
      ...pluginVitest.configs.recommended.rules,
      'vitest/no-conditional-expect': 'warn',
      'vitest/expect-expect': 'warn',
    },
  },
  skipFormatting,
)
