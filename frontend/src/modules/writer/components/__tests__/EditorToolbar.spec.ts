import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import EditorToolbar from '../EditorToolbar.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

const createWrapper = (props: Record<string, unknown> = {}) =>
  mount(EditorToolbar, {
    attachTo: document.body,
    props: {
      ...props,
    },
    global: {
      stubs: {
        QyIcon: true,
      },
    },
  })

const getButton = (wrapper: VueWrapper<any>, testId: string) => wrapper.get(`[data-testid="${testId}"]`)

describe('EditorToolbar', () => {
  it('点击格式按钮时发出 command 事件', async () => {
    const wrapper = createWrapper()

    await getButton(wrapper, 'toolbar-bold').trigger('click')

    expect(wrapper.emitted('command')).toEqual([['bold']])
  })

  it('选择标题菜单项时发出对应的 command', async () => {
    const wrapper = createWrapper()

    await getButton(wrapper, 'toolbar-heading-trigger').trigger('click')

    const dropdownItems = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
    const headingTwo = dropdownItems.find((node) => node.textContent?.includes('H2 二级标题')) as HTMLElement

    expect(headingTwo).toBeTruthy()
    headingTwo.click()

    expect(wrapper.emitted('command')).toEqual([['heading2']])
  })

  it('点击预览按钮时发出 togglePreview 事件', async () => {
    const wrapper = createWrapper({ showPreview: false })

    await getButton(wrapper, 'toolbar-preview').trigger('click')

    expect(wrapper.emitted('togglePreview')).toEqual([[]])
  })

  it('简化模式下隐藏历史与插入对象按钮', () => {
    const wrapper = createWrapper({ isSimpleMode: true })

    expect(wrapper.find('[data-testid="toolbar-undo"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="toolbar-code"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="toolbar-strikethrough"]').exists()).toBe(false)
  })
})
