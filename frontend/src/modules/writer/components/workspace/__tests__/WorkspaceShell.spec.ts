import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceShell from '../WorkspaceShell.vue'

describe('WorkspaceShell', () => {
  it('renders the explicit editor shell and preserves top/body/status slots', () => {
    const wrapper = mount(WorkspaceShell, {
      props: {
        isImmersiveMode: false,
        editorTheme: 'light',
      },
      slots: {
        topbar: '<div data-testid="topbar-slot">topbar</div>',
        body: '<div data-testid="body-slot">body</div>',
        statusbar: '<div data-testid="statusbar-slot">statusbar</div>',
      },
    })

    expect(wrapper.find('[data-writer-shell="editor"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="topbar-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="body-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="statusbar-slot"]').exists()).toBe(true)
  })
})
