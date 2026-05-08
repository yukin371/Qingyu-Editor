/* global process */
import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

/**
 * Playwright测试配置
 * 用于E2E测试
 */
export default defineConfig({
  // 测试文件位置
  testDir: './tests/e2e',

  // 完全并行运行测试
  fullyParallel: true,

  // 在CI环境失败时禁止重试
  forbidOnly: !!process.env.CI,

  // 失败时重试次数
  retries: process.env.CI ? 2 : 0,

  // 并行worker数量
  workers: process.env.CI ? 1 : undefined,

  // 测试报告
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
    ['list']
  ],

  // 全局设置
  use: {
    // 基础URL
    baseURL: process.env.BASE_URL || `http://localhost:${process.env.PLAYWRIGHT_PORT || 5174}`,

    // 截图设置（失败时截图）
    screenshot: 'only-on-failure',

    // 视频设置（失败时录制）
    video: 'retain-on-failure',

    // 测试超时（针对慢速网络和高负载情况优化）
    actionTimeout: 20000, // 增加到20秒，避免操作超时
    navigationTimeout: 60000, // 增加到60秒，确保复杂页面加载完成

    // 浏览器视口
    viewport: { width: 1920, height: 1080 },

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 收集测试失败时的追踪
    trace: 'on-first-retry',

    // 测试数据
    testIdAttribute: 'data-testid'
  },

  // 测试项目配置（不同浏览器）
  // 注意：Firefox和WebKit已暂时搁置，只使用Chromium进行测试
  projects: process.env.E2E_CORE === 'true'
    ? [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ]
    : [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },

    // Firefox暂时搁置
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // WebKit暂时搁置
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

      /* 移动端测试 */
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
      },
    // Mobile Safari使用WebKit，暂时搁置
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // 测试运行前的全局设置
  globalSetup: fileURLToPath(new URL('./tests/e2e/global-setup.ts', import.meta.url)),

  // 测试运行后的全局清理
  globalTeardown: fileURLToPath(new URL('./tests/e2e/global-teardown.ts', import.meta.url)),

  // Web Server配置（测试时自动启动开发服务器）
  webServer: {
    command: `npm run dev -- --port ${process.env.PLAYWRIGHT_PORT || 5174}`,
    url: `http://localhost:${process.env.PLAYWRIGHT_PORT || 5174}`,
    reuseExistingServer: process.env.PLAYWRIGHT_FORCE_SERVER === 'true' ? false : !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe'
  },
})
