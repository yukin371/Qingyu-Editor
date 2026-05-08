// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia' // 用于测试setup
import { ElDialog, ElSkeleton, ElSkeletonItem } from 'element-plus'
import BookListsView from '../BookListsView.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useRoute: () => ({
    params: {},
    query: {}
  }),
  createRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    resolve: vi.fn(() => ({ href: '/' })),
    addRoute: vi.fn(),
    removeRoute: vi.fn(),
    hasRoute: vi.fn(),
    getRoutes: vi.fn(() => []),
    currentRoute: { value: { path: '/' } },
    options: {}
  })),
  createWebHistory: vi.fn(() => '/'),
  onBeforeRouteUpdate: vi.fn(),
  onBeforeRouteLeave: vi.fn()
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElDialog: { name: 'ElDialog', template: '<div><slot /></div>' },
  ElSkeleton: { name: 'ElSkeleton', template: '<div><slot /></div>' },
  ElSkeletonItem: { name: 'ElSkeletonItem', template: '<div />' }
}))

// Mock design system components
vi.mock('@/design-system/components', () => ({
  QyButton: { name: 'QyButton', template: '<button><slot /></button>' },
  QyIcon: { name: 'QyIcon', template: '<i />' },
  QyBadge: { name: 'QyBadge', template: '<span><slot /></span>' },
  QyEmpty: { name: 'QyEmpty', template: '<div><slot /></div>' }
}))

// Mock message service
vi.mock('@/design-system/services', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// Mock API
vi.mock('@/modules/booklist/api', () => ({
  getBookLists: vi.fn(() => Promise.resolve({ list: [], total: 0, page: 1, size: 12 })),
  getPopularTags: vi.fn(() => Promise.resolve([]))
}))

describe('BookListsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(BookListsView, {
      global: {
        stubs: {
          BooklistCard: true,
          BooklistForm: true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays page title', () => {
    const wrapper = mount(BookListsView, {
      global: {
        stubs: {
          BooklistCard: true,
          BooklistForm: true
        }
      }
    })
    expect(wrapper.text()).toContain('书单广场')
    expect(wrapper.text()).toContain('发现精彩书单，分享阅读乐趣')
  })

  it('displays create button', () => {
    const wrapper = mount(BookListsView, {
      global: {
        stubs: {
          BooklistCard: true,
          BooklistForm: true
        }
      }
    })
    expect(wrapper.text()).toContain('创建书单')
  })

  it('displays sort options', () => {
    const wrapper = mount(BookListsView, {
      global: {
        stubs: {
          BooklistCard: true,
          BooklistForm: true
        }
      }
    })
    expect(wrapper.text()).toContain('最新')
    expect(wrapper.text()).toContain('最热')
    expect(wrapper.text()).toContain('最多书籍')
  })
})
