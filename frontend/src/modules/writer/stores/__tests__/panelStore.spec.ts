import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePanelStore } from '../panelStore'

describe('PanelStore', () => {
  // 创建真实的 localStorage mock
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = String(value) },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { store = {} }
    }
  })()

  beforeEach(() => {
    setActivePinia(createPinia())
    // 在每个测试前重置 localStorage
    localStorageMock.clear()
    // 覆盖全局 localStorage mock
    vi.stubGlobal('localStorage', localStorageMock)
  })

  it('should initialize with default widths', () => {
    const store = usePanelStore()
    expect(store.leftWidth).toBe(280)
    expect(store.rightWidth).toBe(320)
    expect(store.rightCollapsed).toBe(false)
  })

  it('should save to localStorage when widths change', () => {
    const store = usePanelStore()
    store.setLeftWidth(350)
    const saved = localStorage.getItem('qingyu_editor_panel_layout')
    expect(saved).toBeTruthy()
    const parsed = JSON.parse(saved!)
    expect(parsed.leftWidth).toBe(350)
  })

  it('should load from localStorage on initialization', () => {
    localStorage.setItem('qingyu_editor_panel_layout', JSON.stringify({
      leftWidth: 300,
      rightWidth: 350,
      rightCollapsed: true
    }))
    const store = usePanelStore()
    expect(store.leftWidth).toBe(300)
    expect(store.rightWidth).toBe(350)
    expect(store.rightCollapsed).toBe(true)
  })
})
