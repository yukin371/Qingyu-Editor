import { expect, type Page, test } from '@playwright/test'

const projectNamePrefix = 'E2E 回归项目'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.name.includes('__qingyu_e2e_storage_cleared__')) {
      return
    }
    localStorage.clear()
    sessionStorage.clear()
    window.name = `${window.name}__qingyu_e2e_storage_cleared__`
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
  await expectStatusChip(page, '已打开：第一章（可直接改标题）')
  await openDirectory(page)
  await expect(page.getByRole('button', { name: /第一卷 1 章/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /1\. 第一章/ })).toBeVisible()
  await openEditor(page)
  await expect(page.getByRole('textbox', { name: '第一章' })).toBeVisible()

  await openHelpDocs(page)
  await expect(page.getByRole('dialog', { name: 'Qingyu-Editor 使用文档' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '把小说创作收进一条清晰链路' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '从灵感到第一章' })).toBeVisible()
  await expect(page.getByLabel('AI 辅助写作截图演示')).toBeVisible()
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

  const assetsPanel = getAssetsPanel(page)
  await expect(assetsPanel.getByRole('button', { name: '本章' })).toBeVisible()
  await expect(assetsPanel.getByRole('button', { name: '本卷' })).toBeVisible()
  await expect(assetsPanel.getByRole('button', { name: '全局' })).toBeVisible()

  await assetsPanel.getByRole('button', { name: '新建角色' }).first().click()
  await expect(page.getByRole('heading', { name: '新建角色' })).toBeVisible()
  await page.getByLabel('名称').fill('林舟')
  await page.getByPlaceholder('一句话定位：目标、立场、当前状态').fill('谨慎但不退缩的主角。')
  await page.getByRole('button', { name: '创建' }).click()

  await expect(getRightToolPanel(page).getByRole('heading', { name: '林舟' })).toBeVisible()
  await expect(getRightToolPanel(page).getByText('谨慎但不退缩的主角。')).toBeVisible()
})

test('新增章节按当前卷压栈追加，并且场景舞台不随切章自动推进', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 场景`)

  await openDirectory(page)
  await page.getByRole('button', { name: '新建章节' }).click()
  await expect(page).toHaveURL(/chapterId=/)
  await openEditor(page)
  await expect(page.getByRole('textbox', { name: '第二章' })).toBeFocused()
  await openDirectory(page)
  await expect(page.getByRole('button', { name: /1\. 第一章/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /2\. 第二章/ })).toBeVisible()
  await openEditor(page)

  await page.getByRole('button', { name: /场景舞台/ }).click()
  await expect(page.getByLabel('场景名称')).toBeVisible()
  await page.getByLabel('场景名称').fill('雨夜祠堂')
  await page.getByLabel('当前拍').fill('旧友现身')
  await page.getByPlaceholder('这一拍要推进什么').fill('让主角发现线索并决定追查。')
  await expect(page.getByLabel('场景名称')).toHaveValue('雨夜祠堂')
  await expect(page.getByLabel('当前拍')).toHaveValue('旧友现身')

  await openDirectory(page)
  await page.getByRole('button', { name: /1\. 第一章/ }).click()
  await openEditor(page)
  await expect(page.getByRole('textbox', { name: '第一章' })).toBeVisible()
  await expect(page.getByLabel('场景名称')).toHaveValue('雨夜祠堂')
  await expect(page.getByLabel('当前拍')).toHaveValue('旧友现身')

  await page.getByRole('button', { name: '进入下一拍' }).click()
  await expect(page.getByLabel('当前拍')).toHaveValue('')
})

test('工作台最近项目可继续创作并回到最近章节', async ({ page }) => {
  const projectName = `${projectNamePrefix} 继续创作`
  await createBlankProject(page, projectName)

  await page.getByRole('textbox', { name: '第一章' }).fill('工作台回流')
  await writeChapterBody(page, ['写一段可回流校验的正文。'])
  await expectSaveStatus(page, '已保存')

  await page.goto('/writer')
  await expect(page.getByRole('heading', { name: '开始今天的创作' })).toBeVisible()
  await expect(page.getByRole('button', { name: projectName })).toBeVisible()

  await page.getByRole('button', { name: new RegExp(`${projectName} 工作台回流`) }).click()
  await expect(page).toHaveURL(/\/writer\/project\/.+chapterId=/)
  await expectStatusChip(page, '继续创作：工作台回流')
  await expect(page.getByRole('textbox', { name: '工作台回流' })).toHaveValue('工作台回流')
})

test('左侧边栏支持隐藏后再显示，不影响章节目录访问', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 左栏`)

  if (await isMobile(page)) {
    await openDirectory(page)
    await expect(page.getByTestId('chapter-list')).toBeVisible()
    await openEditor(page)
    await expect(page.getByTestId('chapter-list')).not.toBeVisible()
    await openDirectory(page)
    await expect(page.getByRole('button', { name: /1\. 第一章/ })).toBeVisible()
    return
  }

  const chapterList = page.getByTestId('chapter-list')
  await expect(chapterList).toBeVisible()

  await page.locator('[title="隐藏左侧边栏"]').click()
  await expect(chapterList).not.toBeVisible()

  await page.locator('[title="显示左侧边栏"]').click()
  await expect(chapterList).toBeVisible()
  await expect(page.getByRole('button', { name: /1\. 第一章/ })).toBeVisible()
})

test('第二卷新增章节应继续压栈到第二卷末尾', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 第二卷`)

  await openDirectory(page)
  await page.getByRole('button', { name: '新建卷' }).click()
  await expect(page.getByRole('button', { name: /第二卷 0 章/ })).toBeVisible()
  await page.getByRole('button', { name: /第二卷 0 章/ }).click()

  await page.getByRole('button', { name: '新建章节' }).click()
  await expect(page).toHaveURL(/chapterId=/)
  await openEditor(page)
  await expect(page.getByRole('textbox', { name: '第一章' })).toBeFocused()

  await openDirectory(page)
  await expect(page.getByRole('button', { name: /第一卷 1 章/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /第二卷 1 章/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /2\. 第一章/ })).toBeVisible()
})

test('标题与正文会自动保存，并在刷新后恢复', async ({ page }) => {
  const projectName = `${projectNamePrefix} 保存恢复`
  await createBlankProject(page, projectName)

  await page.getByRole('textbox', { name: '第一章' }).fill('雨夜来信')
  await writeChapterBody(page, ['第一段写主角收到一封没有落款的信。', '第二段写他在雨里决定赴约。'])
  await expectSaveStatus(page, '已保存')

  await page.reload()
  await expect(page).toHaveURL(/\/writer\/project\/.+chapterId=/)
  await expect(page.getByRole('button', { name: projectName })).toBeVisible()

  await expect(page.getByRole('textbox', { name: '雨夜来信' })).toHaveValue('雨夜来信')
  await expect(getEditorSurface(page)).toContainText('第一段写主角收到一封没有落款的信。')
  await expect(getEditorSurface(page)).toContainText('第二段写他在雨里决定赴约。')
  await expectSaveStatus(page, '已保存')
})

test('正文内创建 @实体 后会进入本章设定投影', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 正文实体`)
  await openRightAssets(page)

  const assetsPanel = getAssetsPanel(page)
  await selectAssetScope(page, '本章')

  await openEditor(page)
  await appendTextToEditor(page, '@沈砚')
  await page.getByRole('button', { name: '创建新实体「沈砚」' }).click()
  await expect(page.getByRole('heading', { name: '创建新实体' })).toBeVisible()
  await page.locator('.entity-create-dialog textarea').fill('巡夜归来的旧友。')
  await page.locator('.entity-create-dialog').getByRole('button', { name: '创建' }).click()

  await expect(getEditorSurface(page)).toContainText('沈砚')
  await openRightAssets(page)
  await selectAssetScope(page, '本章')
  await expect(getAssetsPanel(page).getByText('沈砚')).toBeVisible()
})

test('删除正文里的 @实体 只解除本章引用，不删除全局资产', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 删除引用`)
  await openRightAssets(page)

  const assetsPanel = getAssetsPanel(page)
  await selectAssetScope(page, '本章')

  await openEditor(page)
  await appendTextToEditor(page, '@沈砚')
  await page.getByRole('button', { name: '创建新实体「沈砚」' }).click()
  await page.locator('.entity-create-dialog textarea').fill('巡夜归来的旧友。')
  await page.locator('.entity-create-dialog').getByRole('button', { name: '创建' }).click()

  await openRightAssets(page)
  await selectAssetScope(page, '本章')
  await expect(getAssetsPanel(page).getByText('沈砚')).toBeVisible()
  await selectAssetScope(page, '全局')
  await expect(getAssetsPanel(page).getByText('沈砚')).toBeVisible()

  await selectAssetScope(page, '本章')
  await openEditor(page)
  await clearEditorBody(page)
  await expectSaveStatus(page, '已保存')
  await openRightAssets(page)
  await selectAssetScope(page, '本章')
  await expect(getAssetsPanel(page).getByText('沈砚')).not.toBeVisible()

  await selectAssetScope(page, '全局')
  await expect(getAssetsPanel(page).getByText('沈砚')).toBeVisible()
})

test('Provider 健康检查在失败时会给出明确反馈', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 健康检查`)
  await openSettings(page)

  await page.getByRole('button', { name: 'AI Provider' }).click()
  await page
    .getByRole('button', { name: '用户 API 接入本地或自有 OpenAI 兼容 provider' })
    .click()

  const settingsDialog = page.getByRole('dialog', { name: '工作区设置' })
  await settingsDialog.getByLabel('Provider 地址').fill('http://127.0.0.1:9')
  await settingsDialog.getByLabel('接口路径').fill('/v1/chat/completions')
  await settingsDialog.getByRole('combobox', { name: '模型', exact: true }).fill('smoke-test-model')
  await settingsDialog.getByRole('button', { name: '检测连接' }).click()

  await expect(settingsDialog.locator('.workspace-settings-panel__health-card')).toContainText(
    /失败|连接|error|无法|不可用/i,
  )
})

test('切换到石墨主题后工作区会进入暗色主题态', async ({ page }) => {
  await createBlankProject(page, `${projectNamePrefix} 主题`)
  await openSettings(page)

  await page.getByRole('button', { name: '外观' }).click()
  await page.getByRole('button', { name: '石墨' }).click()

  await expect.poll(async () =>
    page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      alias: document.documentElement.getAttribute('data-editor-theme'),
      base: getComputedStyle(document.documentElement).getPropertyValue('--theme-surface-base').trim(),
    })),
  ).toEqual({
    theme: 'graphite',
    alias: 'graphite',
    base: '#0f172a',
  })
})

async function createBlankProject(page: Page, projectName: string) {
  await page.goto('/writer')
  await expect(page.getByRole('button', { name: '新建项目' }).first()).toBeVisible({ timeout: 10000 })

  await page.getByRole('button', { name: '新建项目' }).first().click()
  await expect(page.getByRole('heading', { name: '新建空白项目' })).toBeVisible()
  await page.getByLabel('项目名称').fill(projectName)
  await page.getByRole('button', { name: '开始创建' }).click()

  await expect(page.getByTestId('tiptap-editor-view')).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole('textbox').first()).toBeVisible()
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
  if (await isMobile(page)) {
    if (await getAssetsPanel(page).getByRole('button', { name: '快速新建', exact: true }).isVisible()) {
      return
    }
    await page.getByRole('button', { name: '设定', exact: true }).click()
    await expect(getAssetsPanel(page).getByRole('button', { name: '快速新建', exact: true })).toBeVisible()
    return
  }

  const rightPanel = page.getByTestId('resizable-panel-right')
  await rightPanel.getByRole('button', { name: '设定', exact: true }).click()
  await expect(rightPanel.getByRole('button', { name: '快速新建', exact: true })).toBeVisible()
}

function getAssetsPanel(page: Page) {
  return page.locator('.asset-list-panel').first()
}

function getRightToolPanel(page: Page) {
  return page.locator('.tool-right-panel').first()
}

async function selectAssetScope(page: Page, scope: '本章' | '本卷' | '全局') {
  const button = getAssetsPanel(page).getByRole('button', { name: scope })
  if ((await button.getAttribute('class'))?.includes('is-active')) {
    return
  }
  await button.click({ force: true })
}

async function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1920) < 900
}

async function openDirectory(page: Page) {
  if (!(await isMobile(page))) return
  const tab = page.getByRole('tab', { name: '目录' })
  if ((await tab.getAttribute('aria-selected')) !== 'true') {
    await tab.click()
  }
}

async function openEditor(page: Page) {
  if (!(await isMobile(page))) return
  const tab = page.getByRole('tab', { name: '编辑' })
  if ((await tab.getAttribute('aria-selected')) !== 'true') {
    await tab.click()
  }
}

function getEditorSurface(page: Page) {
  return page.locator('[data-testid="tiptap-editor-view"] .ProseMirror').first()
}

async function writeChapterBody(page: Page, paragraphs: string[]) {
  const editor = getEditorSurface(page)
  await editor.click()
  for (let index = 0; index < paragraphs.length; index += 1) {
    await page.keyboard.type(paragraphs[index] || '')
    if (index < paragraphs.length - 1) {
      await page.keyboard.press('Enter')
    }
  }
}

async function appendTextToEditor(page: Page, text: string) {
  const editor = getEditorSurface(page)
  await editor.click()
  await page.keyboard.type(text)
}

async function clearEditorBody(page: Page) {
  const editor = getEditorSurface(page)
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
}

async function expectSaveStatus(page: Page, label: string) {
  await expect(page.locator('.status-text')).toContainText(label, { timeout: 20000 })
}

async function expectStatusChip(page: Page, label: string) {
  await expect(page.locator('.workspace-statusbar .status-chip').filter({ hasText: label })).toBeVisible({
    timeout: 10000,
  })
}

declare global {
  interface Window {
    __QINGYU_E2E_CONSOLE_ERRORS__?: string[]
  }
}
