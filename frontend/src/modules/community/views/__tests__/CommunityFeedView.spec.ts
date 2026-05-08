import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CommunityFeedView from '../CommunityFeedView.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock design system components
vi.mock('@/design-system/components', () => ({
  QyButton: { name: 'QyButton', template: '<button><slot /></button>' },
  QyIcon: { name: 'QyIcon', template: '<i />' },
  QyEmpty: { name: 'QyEmpty', template: '<div><slot /></div>' }
}))

describe('CommunityFeedView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(CommunityFeedView, {
      global: {
        stubs: {
          PostCard: true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays page title', () => {
    const wrapper = mount(CommunityFeedView, {
      global: {
        stubs: {
          PostCard: true
        }
      }
    })
    expect(wrapper.text()).toContain('社区动态')
  })

  it('displays create post button', () => {
    const wrapper = mount(CommunityFeedView, {
      global: {
        stubs: {
          PostCard: true
        }
      }
    })
    expect(wrapper.text()).toContain('发布动态')
  })
})
