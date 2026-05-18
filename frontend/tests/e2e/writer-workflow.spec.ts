import { expect, type Page, test } from '@playwright/test'

const projectNamePrefix = 'E2E 回归项目'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
})

test.afterEach(async ({ page }, testInfo) => {
  const errors = await page.evaluate(() => {
    const entries = window.__QINGYU_E2E_CONSOLE_ERRORS__ || []
    window.__QINGYU_E2E_CONSOLE_ERRORS__ = []
    return entries
  })

  expect(errors, `console errors in ${testInfo.title}`).toEqual([])
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__QINGYU_E2E_CONSOLE_ERRORS__ = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      window.__QINGYU_E2E_CONSOLE_ERRORS__?.push(args.map(String).join(' '))
      originalError(...args)
    }
  })
})

test('新建项目后进入第一卷第一章，并能打开内置使用文档', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 文档`)

  await expect(page).toHaveURL(/\/writer\/project\/.+chapterId=/)
  await expect(page.getByRole('button', { name: /第一卷 1 个章节/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /1\. 第一章/ })).toBeVisible()
  await expect(page.getByRole('textbox', { name: '第一章' })).toBeVisible()

  await openHelpDocs(page)
  await expect(page.getByRole('dialog', { name: 'Qingyu-Editor 使用文档' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '推荐创作流程' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'AI Provider 与正文 diff' })).toBeVisible()
})

test('AI Provider 设置支持用户 API、多 provider 配置和密钥脱敏导出', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} Provider`)
  await openSettings(page)

  await page.getByRole('button', { name: 'AI Provider' }).click()
  await page
    .getByRole('button', { name: '用户 API 接入本地或自有 OpenAI 兼容 provider' })
    .click()

  const settingsDialog = page.getByRole('dialog', { name: '工作区设置' })
  await expect(settingsDialog.getByText('用户 API Provider')).toBeVisible()

  await settingsDialog.getByLabel('提供商模板').selectOption({ label: 'DeepSeek' })
  await expect(settingsDialog.getByLabel('Provider 地址')).toHaveValue(/deepseek/i)

  await settingsDialog.getByRole('button', { name: '新增配置' }).click()
  await expect(settingsDialog.getByRole('button', { name: '删除' })).toBeEnabled()
  await settingsDialog.getByRole('button', { name: '删除' }).click()
  await expect(settingsDialog.getByRole('button', { name: '删除' })).toBeDisabled()

  const configTextarea = settingsDialog.locator('.workspace-settings-panel__config-file textarea')
  await configTextarea.fill(
    JSON.stringify({
      mode: 'user_api',
      userProvider: {
        baseURL: 'https://api.deepseek.com/v1',
        endpointPath: '/chat/completions',
        model: 'deepseek-chat',
        apiKey: 'sk-e2e-secret-value',
      },
    }),
  )
  await settingsDialog.getByRole('button', { name: '应用' }).click()
  await expect(settingsDialog.getByText('已应用配置文件。')).toBeVisible()
  await settingsDialog.getByRole('button', { name: '导出' }).click()
  const configText = await configTextarea.inputValue()
  expect(configText).toContain('"mode": "user_api"')
  expect(configText).not.toContain('sk-e2e-secret-value')
})

test('右侧设定支持全局角色快建，并保持本章本卷全局视图入口', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 资产`)
  await openRightAssets(page)

  const rightPanel = page.getByTestId('resizable-panel-right')
  await expect(rightPanel.getByRole('button', { name: '本章' })).toBeVisible()
  await expect(rightPanel.getByRole('button', { name: '本卷' })).toBeVisible()
  await expect(rightPanel.getByRole('button', { name: '全局' })).toBeVisible()

  await rightPanel.getByRole('button', { name: '新建角色' }).first().click()
  await expect(page.getByRole('heading', { name: '新建角色' })).toBeVisible()
  await page.getByLabel('名称').fill('林舟')
  await page.getByPlaceholder('一句话定位：目标、立场、当前状态').fill('谨慎但不退缩的主角。')
  await page.getByRole('button', { name: '创建' }).click()

  await expect(rightPanel.getByRole('heading', { name: '林舟' })).toBeVisible()
  await expect(rightPanel.getByText('谨慎但不退缩的主角。')).toBeVisible()
})

test('新增章节按当前卷压栈追加，并且场景舞台不随切章自动推进', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 场景`)

  await page.getByRole('button', { name: '新建章节' }).click()
  await expect(page).toHaveURL(/chapterId=/)
  await expect(page.getByRole('textbox', { name: '第二章' })).toBeFocused()
  await expect(page.getByRole('button', { name: /1\. 第一章/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /2\. 第二章/ })).toBeVisible()

  await page.getByRole('button', { name: /场景舞台/ }).click()
  await expect(page.getByLabel('场景名称')).toBeVisible()
  await page.getByLabel('场景名称').fill('雨夜祠堂')
  await page.getByLabel('当前拍').fill('旧友现身')
  await page.getByPlaceholder('这一拍要推进什么').fill('让主角发现线索并决定追查。')
  await expect(page.getByLabel('场景名称')).toHaveValue('雨夜祠堂')
  await expect(page.getByLabel('当前拍')).toHaveValue('旧友现身')

  await page.getByRole('button', { name: /1\. 第一章/ }).click()
  await expect(page.getByRole('textbox', { name: '第一章' })).toBeVisible()
  await expect(page.getByLabel('场景名称')).toHaveValue('雨夜祠堂')
  await expect(page.getByLabel('当前拍')).toHaveValue('旧友现身')

  await page.getByRole('button', { name: '进入下一拍' }).click()
  await expect(page.getByLabel('当前拍')).toHaveValue('')
})

async function createBlankProject(page: Page, projectName: string) {
  await page.goto('/writer')
  await expect(page.getByRole('heading', { name: '开始今天的创作' })).toBeVisible()

  await page.getByRole('button', { name: '新建项目' }).first().click()
  await expect(page.getByRole('heading', { name: '新建空白项目' })).toBeVisible()
  await page.getByLabel('项目名称').fill(projectName)
  await page.getByRole('button', { name: '开始创建' }).click()

  await expect(page.getByText(projectName)).toBeVisible()
  await expect(page.getByRole('application', { name: /编辑器/ })).toBeVisible()
}

async function openHelpDocs(page: Page) {
  await page.getByRole('button', { name: '更多操作' }).click()
  await page.getByRole('button', { name: '使用文档' }).click()
}

async function openSettings(page: Page) {
  await page.getByRole('button', { name: '设置' }).click()
  await expect(page.getByRole('dialog', { name: '工作区设置' })).toBeVisible()
}

async function openRightAssets(page: Page) {
  const rightPanel = page.getByTestId('resizable-panel-right')
  await rightPanel.getByRole('button', { name: '设定', exact: true }).click()
  await expect(rightPanel.getByRole('button', { name: '新建', exact: true })).toBeVisible()
}

declare global {
  interface Window {
    __QINGYU_E2E_CONSOLE_ERRORS__?: string[]
  }
}
