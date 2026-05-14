import { beforeEach, describe, expect, it } from 'vitest'
import { THEME_OPTIONS, clearTheme, initTheme, setTheme } from '../theme'

describe('统一主题系统', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('style')
    document.body.innerHTML = '<div class="workspace-studio"></div>'
    localStorage.clear()
  })

  it('应该提供 4 套可切换主题', () => {
    expect(THEME_OPTIONS.map((option) => option.value)).toEqual([
      'mist',
      'amber',
      'forest',
      'graphite',
    ])
  })

  it('初始化时应该把默认主题同步到根节点与 writer 宿主', async () => {
    initTheme('graphite')
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

    expect(document.documentElement.dataset.theme).toBe('graphite')
    expect(document.querySelector('.workspace-studio')?.getAttribute('data-editor-theme')).toBe(
      'graphite',
    )
  })

  it('切换主题时应该同步更新 editor 语义变量', async () => {
    setTheme('amber')
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

    const styles = getComputedStyle(document.documentElement)
    expect(document.documentElement.dataset.theme).toBe('amber')
    expect(styles.getPropertyValue('--theme-accent').trim()).toBe('#ea7b2c')
    expect(styles.getPropertyValue('--theme-surface-base').trim()).toBe('#faf6f0')
    expect(styles.getPropertyValue('--theme-text-primary').trim()).toBe('#3e2c1c')

    clearTheme()
    expect(localStorage.getItem('qingyu-theme') ?? null).toBeNull()
  })
})
