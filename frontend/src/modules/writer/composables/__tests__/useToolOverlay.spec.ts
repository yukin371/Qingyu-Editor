import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useToolOverlay } from '../useToolOverlay'
import { useWorkspaceLayoutStore } from '../../stores/workspaceLayoutStore'

describe('useToolOverlay', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    const overlay = useToolOverlay()
    overlay.close()
    overlay.switchTool('structure')
    overlay.close()
  })

  it('open(tool) 应打开指定工具并记住最近选择', () => {
    const overlay = useToolOverlay()
    overlay.open('timeline')

    expect(overlay.visible.value).toBe(true)
    expect(overlay.activeTool.value).toBe('timeline')
  })

  it('switchTool 应在未打开时切换并显示 overlay', () => {
    const overlay = useToolOverlay()
    const layoutStore = useWorkspaceLayoutStore()
    overlay.switchTool('assets')

    expect(overlay.visible.value).toBe(true)
    expect(overlay.activeTool.value).toBe('assets')
    expect(layoutStore.areas.overlay.visible).toBe(true)
    expect(layoutStore.areas.overlay.activePanelId).toBe('assets')
  })

  it('close 应仅关闭 overlay 而保留当前工具', () => {
    const overlay = useToolOverlay()
    const layoutStore = useWorkspaceLayoutStore()
    overlay.open('structure')
    overlay.close()

    expect(overlay.visible.value).toBe(false)
    expect(overlay.activeTool.value).toBe('structure')
    expect(layoutStore.areas.overlay.visible).toBe(false)
  })

  it('未指定工具打开时应默认落到结构舞台', () => {
    localStorage.clear()

    const overlay = useToolOverlay()
    overlay.close()
    overlay.open()

    expect(overlay.visible.value).toBe(true)
    expect(overlay.activeTool.value).toBe('structure')
  })

  it('openFromRightPanel 应携带右栏上下文进入 overlay', () => {
    const overlay = useToolOverlay()

    overlay.openFromRightPanel('assets', {
      assetsCategory: 'organizations',
      assetId: 'org-1',
    })

    expect(overlay.visible.value).toBe(true)
    expect(overlay.activeTool.value).toBe('assets')
    expect(overlay.context.value).toMatchObject({
      assetsCategory: 'organizations',
      assetId: 'org-1',
    })
  })
})
