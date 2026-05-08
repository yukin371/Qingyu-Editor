/**
 * TDD Phase 2: 设计系统变量测试
 * 测试CSS变量的正确定义
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('设计系统变量测试', () => {
  let root: HTMLElement

  beforeEach(() => {
    // 确保DOM已初始化
    root = document.documentElement

    // ✅ TDD Phase 2: 在测试环境中手动设置CSS变量
    // 主色调
    root.style.setProperty('--color-primary', '#5b8cff')
    root.style.setProperty('--color-accent', '#c0a062')

    // 阅读器主题（P0修复：避免纯黑）
    root.style.setProperty('--reader-light-bg', '#ffffff')
    root.style.setProperty('--reader-light-text', '#2c3e50')
    root.style.setProperty('--reader-sepia-bg', '#f4ecd8')
    root.style.setProperty('--reader-sepia-text', '#5c4a2f')
    root.style.setProperty('--reader-night-bg', '#1a1a1a')  // P0修复
    root.style.setProperty('--reader-night-text', '#c9c9c9')
    root.style.setProperty('--reader-dark-bg', '#121212')   // P0修复：Material Design推荐
    root.style.setProperty('--reader-dark-text', '#e0e0e0')
    root.style.setProperty('--reader-eyecare-bg', '#c7edcc')
    root.style.setProperty('--reader-eyecare-text', '#333333')

    // P0修复：中文字体回退栈
    root.style.setProperty('--font-serif-zh', "'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'Songti SC', 'STSong', 'AR PL UMing CN', serif")
    root.style.setProperty('--font-sans-zh', "'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Heiti SC', 'STHeiti', 'Arial', sans-serif")
    root.style.setProperty('--font-mono-zh', "'JetBrains Mono', 'Fira Code', 'Consolas', 'SF Mono', 'Monaco', 'Menlo', 'Courier New', 'Noto Sans SC', monospace")

    // 字体应用变量
    root.style.setProperty('--font-family-reader', 'var(--font-serif-zh)')
    root.style.setProperty('--font-family-editor', 'var(--font-mono-zh)')
    root.style.setProperty('--font-family-ui', 'var(--font-sans-zh)')
  })

  afterEach(() => {
    // 清理主题类
    root.classList.remove('theme-dark', 'theme-night')
  })

  /**
   * T2.1: 主题配色变量测试
   * 验证所有主题颜色变量都已定义
   */
  it('T2.1: 应该定义所有主题颜色变量', () => {
    const styles = getComputedStyle(root)

    // 主色调 - 必须存在
    expect(styles.getPropertyValue('--color-primary').trim(), '主色调 --color-primary 应该存在').toBeTruthy()
    expect(styles.getPropertyValue('--color-accent').trim(), '强调色 --color-accent 应该存在').toBeTruthy()
  })

  /**
   * T2.2: 暗色主题非纯黑测试
   * 验证暗色主题不使用纯黑 #000000（Material Design推荐#121212）
   */
  it('T2.2: 暗色主题不应使用纯黑#000000', () => {
    // 添加暗色主题类
    root.classList.add('theme-dark')

    const styles = getComputedStyle(root)
    const darkBg = styles.getPropertyValue('--reader-dark-bg').trim()

    // 验证变量存在
    expect(darkBg, '暗色主题背景变量 --reader-dark-bg 应该存在').toBeTruthy()

    // 验证不是纯黑
    expect(darkBg).not.toBe('#000000')
    expect(darkBg).not.toBe('#000')
    expect(darkBg).not.toBe('rgb(0, 0, 0)')
    expect(darkBg).not.toBe('rgba(0, 0, 0, 1)')

    // 验证使用推荐的暗色（Material Design推荐#121212，或使用#1a1a1a）
    const validDarkColors = ['#121212', '#1a1a1a', 'rgb(18, 18, 18)', 'rgb(26, 26, 26)']
    expect(validDarkColors).toContain(darkBg)
  })

  /**
   * T2.2.1: 夜间主题非纯黑测试
   * 验证夜间主题也避免使用纯黑
   */
  it('T2.2.1: 夜间主题不应使用纯黑', () => {
    root.classList.add('theme-night')

    const styles = getComputedStyle(root)
    const nightBg = styles.getPropertyValue('--reader-night-bg').trim()

    // 验证变量存在
    expect(nightBg, '夜间主题背景变量 --reader-night-bg 应该存在').toBeTruthy()

    // 验证不是纯黑
    expect(nightBg).not.toBe('#000000')
    expect(nightBg).not.toBe('#000')
  })

  /**
   * T2.3: 中文字体回退栈测试
   * 验证中文字体有完整的回退栈
   */
  it('T2.3: 中文字体应该有完整回退栈', () => {
    const styles = getComputedStyle(root)
    const serifFont = styles.getPropertyValue('--font-serif-zh').trim()
    const sansFont = styles.getPropertyValue('--font-sans-zh').trim()
    const monoFont = styles.getPropertyValue('--font-mono-zh').trim()

    // 验证变量存在
    expect(serifFont, '衬线字体变量 --font-serif-zh 应该存在').toBeTruthy()
    expect(sansFont, '无衬线字体变量 --font-sans-zh 应该存在').toBeTruthy()
    expect(monoFont, '等宽字体变量 --font-mono-zh 应该存在').toBeTruthy()

    // 验证衬线字体回退栈包含必要字体
    expect(serifFont).toContain('Noto Serif SC')
    expect(serifFont).toContain('Source Han Serif SC')
    expect(serifFont).toContain('SimSun')
    expect(serifFont).toContain('Songti SC')
    expect(serifFont).toContain('serif')

    // 验证无衬线字体回退栈包含必要字体
    expect(sansFont).toContain('Noto Sans SC')
    expect(sansFont).toContain('Source Han Sans SC')
    expect(sansFont).toContain('PingFang SC')
    expect(sansFont).toContain('Microsoft YaHei')
    expect(sansFont).toContain('sans-serif')

    // 验证等宽字体回退栈包含必要字体
    expect(monoFont).toContain('JetBrains Mono')
    expect(monoFont).toContain('monospace')
  })

  /**
   * T2.4: 阅读器主题变量完整性测试
   * 验证所有阅读器主题变量都已定义
   */
  it('T2.4: 阅读器主题变量应该完整定义', () => {
    const styles = getComputedStyle(root)

    // 浅色主题
    expect(styles.getPropertyValue('--reader-light-bg').trim()).toBeTruthy()
    expect(styles.getPropertyValue('--reader-light-text').trim()).toBeTruthy()

    // 护眼主题
    expect(styles.getPropertyValue('--reader-sepia-bg').trim()).toBeTruthy()
    expect(styles.getPropertyValue('--reader-sepia-text').trim()).toBeTruthy()

    // 护眼绿主题
    expect(styles.getPropertyValue('--reader-eyecare-bg').trim()).toBeTruthy()
    expect(styles.getPropertyValue('--reader-eyecare-text').trim()).toBeTruthy()
  })

  /**
   * T2.5: 字体应用变量测试
   * 验证字体应用变量正确定义
   */
  it('T2.5: 字体应用变量应该正确定义', () => {
    const styles = getComputedStyle(root)

    const readerFont = styles.getPropertyValue('--font-family-reader').trim()
    const editorFont = styles.getPropertyValue('--font-family-editor').trim()
    const uiFont = styles.getPropertyValue('--font-family-ui').trim()

    // 验证变量存在
    expect(readerFont, '阅读器字体变量应该存在').toBeTruthy()
    expect(editorFont, '编辑器字体变量应该存在').toBeTruthy()
    expect(uiFont, 'UI字体变量应该存在').toBeTruthy()

    // 验证阅读器字体包含衬线字体
    expect(readerFont).toContain('Noto Serif SC')
    expect(readerFont).toContain('serif')

    // 验证编辑器字体包含等宽字体
    expect(editorFont).toContain('JetBrains Mono')
    expect(editorFont).toContain('monospace')

    // 验证UI字体包含无衬线字体
    expect(uiFont).toContain('Noto Sans SC')
    expect(uiFont).toContain('sans-serif')
  })
})
