import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWorkspaceLayoutStore } from '../workspaceLayoutStore'

describe('workspaceLayoutStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('uses unified registry defaults for bottom and overlay areas', () => {
    const store = useWorkspaceLayoutStore()

    expect(store.areas.bottom.panelIds).toEqual(['status', 'context', 'harness'])
    expect(store.areas.bottom.activePanelId).toBe('status')
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
    expect(store.areas.bottom.activePanelId).toBe('status')

    store.movePanelToArea('relations', 'bottom')
    expect(store.areas.bottom.panelIds).toEqual(['status', 'context', 'harness'])

    store.movePanelToArea('ai', 'bottom')
    expect(store.areas.bottom.panelIds).toContain('ai')
    expect(store.areas.bottom.activePanelId).toBe('ai')
  })
})
