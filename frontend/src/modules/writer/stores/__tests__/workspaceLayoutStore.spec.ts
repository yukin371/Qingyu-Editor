import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWorkspaceLayoutStore } from '../workspaceLayoutStore'

describe('workspaceLayoutStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses unified registry defaults for bottom and overlay areas', () => {
    const store = useWorkspaceLayoutStore()

    expect(store.areas.bottom.panelIds).toEqual(['scene'])
    expect(store.areas.bottom.activePanelId).toBe('scene')
    expect(store.bottomPanel.height).toBe(220)
    expect(store.areas.overlay.panelIds).toEqual([
      'structure',
      'assets',
      'relations',
      'timeline',
      'branches',
    ])
    expect(store.areas.overlay.activePanelId).toBe('structure')
  })

  it('rejects invalid area activation and only allows compatible panel moves', () => {
    const store = useWorkspaceLayoutStore()

    store.setAreaActivePanel('bottom', 'relations')
    expect(store.areas.bottom.activePanelId).toBe('scene')

    store.movePanelToArea('relations', 'bottom')
    expect(store.areas.bottom.panelIds).toEqual(['scene'])

    store.movePanelToArea('ai', 'bottom')
    expect(store.areas.bottom.panelIds).toContain('ai')
    expect(store.areas.bottom.activePanelId).toBe('ai')
  })

  it('clamps the bottom panel height updates', () => {
    const store = useWorkspaceLayoutStore()

    store.updateBottomPanelHeight(999)
    expect(store.bottomPanel.height).toBe(360)

    store.updateBottomPanelHeight(96)
    expect(store.bottomPanel.height).toBe(140)

    store.updateBottomPanelHeight(246.7)
    expect(store.bottomPanel.height).toBe(247)
  })

  it('persists the bottom panel height into localStorage', () => {
    const storage: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key]
      }),
      clear: vi.fn(() => {
        for (const key of Object.keys(storage)) {
          delete storage[key]
        }
      }),
    })
    setActivePinia(createPinia())
    const store = useWorkspaceLayoutStore()

    store.updateBottomPanelHeight(246.7)

    expect(storage.qingyu_editor_workspace_layout_v2).toContain(
      '"bottomPanel":{"height":247}',
    )
  })
})
