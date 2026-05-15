import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import WorkspaceSettingsPanel from '../WorkspaceSettingsPanel.vue'

describe('WorkspaceSettingsPanel', () => {
  beforeEach(() => {
    const localStorageData = new Map<string, string>()
    const sessionStorageData = new Map<string, string>()
    vi.mocked(localStorage.getItem).mockImplementation(
      (key: string) => localStorageData.get(key) ?? null,
    )
    vi.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => {
      localStorageData.set(key, value)
    })
    vi.mocked(localStorage.removeItem).mockImplementation((key: string) => {
      localStorageData.delete(key)
    })
    vi.mocked(localStorage.clear).mockImplementation(() => {
      localStorageData.clear()
    })
    vi.mocked(sessionStorage.getItem).mockImplementation(
      (key: string) => sessionStorageData.get(key) ?? null,
    )
    vi.mocked(sessionStorage.setItem).mockImplementation((key: string, value: string) => {
      sessionStorageData.set(key, value)
    })
    vi.mocked(sessionStorage.removeItem).mockImplementation((key: string) => {
      sessionStorageData.delete(key)
    })
    vi.mocked(sessionStorage.clear).mockImplementation(() => {
      sessionStorageData.clear()
    })
    localStorage.clear()
    sessionStorage.clear()
  })

  it('switches to ai settings and marks user provider ready after minimal config', async () => {
    const wrapper = mount(WorkspaceSettingsPanel, {
      global: {
        plugins: [createPinia()],
        stubs: {
          ShortcutSettingsPanel: {
            template: '<div data-testid="shortcut-settings-stub" />',
          },
        },
      },
    })

    await wrapper.findAll('.workspace-settings-panel__tab')[2]!.trigger('click')
    const modeButtons = wrapper.findAll('.workspace-settings-panel__mode-card')
    await modeButtons[1]!.trigger('click')

    const inputs = wrapper.findAll('input[type="text"]')
    await inputs[0]!.setValue('http://127.0.0.1:11434')
    await inputs[1]!.setValue('/v1/chat/completions')
    await inputs[2]!.setValue('qwen3')
    await wrapper.find('input[type="password"]').setValue('sk-1234567890abcdefghijkl')
    await wrapper.find('input[type="password"]').trigger('blur')

    expect(wrapper.text()).toContain('Provider 配置')
    expect(wrapper.text()).toContain('配置就绪')
    expect(wrapper.text()).toContain('API Key 已载入本次会话')
  })

  it('clears user provider config from ai settings', async () => {
    const wrapper = mount(WorkspaceSettingsPanel, {
      global: {
        plugins: [createPinia()],
        stubs: {
          ShortcutSettingsPanel: {
            template: '<div data-testid="shortcut-settings-stub" />',
          },
        },
      },
    })

    await wrapper.findAll('.workspace-settings-panel__tab')[2]!.trigger('click')
    const modeButtons = wrapper.findAll('.workspace-settings-panel__mode-card')
    await modeButtons[1]!.trigger('click')

    const inputs = wrapper.findAll('input[type="text"]')
    await inputs[0]!.setValue('http://127.0.0.1:11434')
    await inputs[1]!.setValue('/v1/chat/completions')
    await inputs[2]!.setValue('qwen3')
    await wrapper.get('.workspace-settings-panel__link').trigger('click')

    const resetInputs = wrapper.findAll('input[type="text"]')
    expect((resetInputs[0]!.element as HTMLInputElement).value).toBe('')
    expect((resetInputs[1]!.element as HTMLInputElement).value).toBe('/v1/chat/completions')
    expect((resetInputs[2]!.element as HTMLInputElement).value).toBe('')
    expect(wrapper.text()).toContain('待补全')
  })
})
