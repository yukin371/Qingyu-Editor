import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import WorkbenchShell from '../WorkbenchShell.vue'

const RouterLinkStub = defineComponent({
  name: 'RouterLink',
  props: {
    to: {
      type: [String, Object],
      default: '',
    },
  },
  template: '<a class="router-link-stub"><slot /></a>',
})

describe('WorkbenchShell', () => {
  it('renders the explicit top-level writer shell and marks the active nav item', () => {
    const wrapper = mount(WorkbenchShell, {
      props: {
        title: '项目列表',
        description: '完整浏览、筛选和排序都放在这里。',
        eyebrow: '项目页',
        activeNavId: 'projects',
        lastProjectId: 'project-1',
      },
      slots: {
        default: '<div data-testid="workbench-content">content</div>',
        actions: '<button data-testid="header-action">action</button>',
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          QyIcon: true,
        },
      },
    })

    expect(wrapper.find('[data-writer-shell="top-level"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="workbench-content"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="header-action"]').exists()).toBe(true)
    expect(wrapper.find('[data-writer-shell="top-level"]').classes()).toContain('lg:overflow-hidden')
    expect(wrapper.find('main').classes()).toContain('lg:overflow-y-auto')

    const navLinks = wrapper.findAll('a.router-link-stub')
    const activeLink = navLinks.find((link) => link.text().includes('项目'))
    const inactiveLink = navLinks.find((link) => link.text().includes('工作台'))

    expect(activeLink?.classes()).toContain('is-active')
    expect(inactiveLink?.classes()).not.toContain('is-active')
  })
})
