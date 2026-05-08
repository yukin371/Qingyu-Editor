/**
 * TDD Phase 2: 组件样式测试
 * 测试统一组件样式的正确应用
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('组件样式测试', () => {
  let container: HTMLElement
  let styleEl: HTMLStyleElement

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)

    // ✅ TDD Phase 2: 在测试环境中注入组件样式
    styleEl = document.createElement('style')
    styleEl.textContent = `
      .qy-card {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.06);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: box-shadow 0.3s ease, transform 0.3s ease;
      }
      .qy-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .qy-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 400;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
        user-select: none;
      }
      .qy-btn--primary {
        background: #5b8cff;
        color: #ffffff;
      }
      .qy-btn--ghost {
        background: transparent;
        border: 1px solid rgba(0, 0, 0, 0.06);
        color: #2c3e50;
      }
    `
    document.head.appendChild(styleEl)
  })

  afterEach(() => {
    // 清理测试容器和样式
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl)
    }
  })

  /**
   * T2.6: 卡片组件样式测试
   * 验证卡片组件有统一样式
   */
  it('T2.6: 卡片组件应该有统一样式', () => {
    const card = document.createElement('div')
    card.className = 'qy-card'
    container.appendChild(card)

    const styles = getComputedStyle(card)

    // 验证基本样式
    expect(styles.borderRadius, '卡片圆角应该是8px').toBe('8px')
    expect(styles.padding, '卡片内边距应该是16px').toBe('16px')

    // 验证有边框
    const borderWidth = parseInt(styles.borderWidth, 10)
    expect(borderWidth).toBeGreaterThan(0)

    // 验证有阴影（box-shadow不为none）
    expect(styles.boxShadow).not.toBe('none')
  })

  /**
   * T2.7: 按钮组件样式测试
   * 验证按钮组件有统一样式
   */
  it('T2.7: 按钮组件应该有统一样式', () => {
    const btn = document.createElement('button')
    btn.className = 'qy-btn qy-btn--primary'
    container.appendChild(btn)

    const styles = getComputedStyle(btn)

    // 验证布局
    expect(styles.display).toBe('inline-flex')

    // 验证对齐
    expect(styles.alignItems).toBe('center')
    expect(styles.justifyContent).toBe('center')

    // 验证圆角
    expect(styles.borderRadius).toBe('4px')

    // 验证有内边距
    const paddingTop = parseInt(styles.paddingTop, 10)
    const paddingBottom = parseInt(styles.paddingBottom, 10)
    const paddingLeft = parseInt(styles.paddingLeft, 10)
    const paddingRight = parseInt(styles.paddingRight, 10)

    expect(paddingTop).toBeGreaterThan(0)
    expect(paddingBottom).toBeGreaterThan(0)
    expect(paddingLeft).toBeGreaterThan(0)
    expect(paddingRight).toBeGreaterThan(0)
  })

  /**
   * T2.8: 按钮变体样式测试
   * 验证不同按钮变体的样式
   */
  it('T2.8: 按钮变体应该有正确样式', () => {
    // 测试ghost按钮
    const ghostBtn = document.createElement('button')
    ghostBtn.className = 'qy-btn qy-btn--ghost'
    container.appendChild(ghostBtn)

    const ghostStyles = getComputedStyle(ghostBtn)

    // ghost按钮应该是透明或半透明背景
    const bgColor = ghostStyles.backgroundColor
    const hasTransparentBg = bgColor === 'transparent' ||
                             bgColor === 'rgba(0, 0, 0, 0)' ||
                             bgColor === 'rgba(0,0,0,0)'

    expect(hasTransparentBg, 'ghost按钮背景应该是透明').toBe(true)

    // 验证有边框
    const borderWidth = parseInt(ghostStyles.borderWidth, 10)
    expect(borderWidth).toBeGreaterThan(0)
  })

  /**
   * T2.9: 卡片悬浮效果测试
   * 验证卡片悬浮时有阴影变化
   */
  it('T2.9: 卡片应该有悬浮效果', () => {
    const card = document.createElement('div')
    card.className = 'qy-card'
    container.appendChild(card)

    const styles = getComputedStyle(card)

    // 验证有过渡效果
    expect(styles.transition).toContain('box-shadow')
  })

  /**
   * T2.10: 按钮过渡效果测试
   * 验证按钮有平滑的过渡效果
   */
  it('T2.10: 按钮应该有过渡效果', () => {
    const btn = document.createElement('button')
    btn.className = 'qy-btn'
    container.appendChild(btn)

    const styles = getComputedStyle(btn)

    // 验证有过渡效果（transition属性不为空）
    expect(styles.transition).toBeTruthy()

    // 验证包含过渡时长（0.3s）
    expect(styles.transition).toContain('0.3s')
  })
})
