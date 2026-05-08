/**
 * BookListDetailView视图测试
 */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createMockBooklist } from '../../../../tests/fixtures'
import { useBooklistStore } from '../../stores/booklist.store'
import { useUserStore } from '@/stores/user'
import BookListDetailView from '../BookListDetailView.vue'

// Mock设计系统组件
vi.mock('@/design-system/components', () => ({
  QyAvatar: {
    template: '<div class="qy-avatar">{{ name }}</div>',
    props: ['src', 'name', 'size'],
  },
  QyButton: {
    template: '<button class="qy-button" @click="$emit(\'click\')"><slot /></button>',
    props: ['variant'],
    emits: ['click'],
  },
  QyIcon: {
    template: '<i class="qy-icon" />',
    props: ['name', 'size'],
  },
  QyBadge: {
    template: '<span class="qy-badge"><slot /></span>',
    props: ['variant'],
  },
  QyEmpty: {
    template: '<div class="qy-empty"><p>{{ description || "暂无数据" }}</p><slot /></div>',
    props: ['description', 'image'],
  },
}))

// Mock Element Plus组件
vi.mock('element-plus', () => ({
  ElSkeleton: {
    template: '<div class="el-skeleton"><slot name="template" /></div>',
  },
  ElSkeletonItem: {
    template: '<div class="el-skeleton-item" />',
    props: ['variant', 'style'],
  },
  ElDialog: {
    template: '<div class="el-dialog" v-if="modelValue"><slot /></div>',
    props: ['modelValue', 'title', 'width'],
    emits: ['update:modelValue'],
  },
  ElMessage: vi.fn(),
}))

// Mock API
vi.mock('../../api', () => ({
  getBookListDetail: vi.fn(),
  favoriteBookList: vi.fn(),
  unfavoriteBookList: vi.fn(),
  getPopularTags: vi.fn(),
}))

import * as booklistApi from '../../api'

const mockGetBookListDetail = booklistApi.getBookListDetail as any
const mockFavoriteBookList = booklistApi.favoriteBookList as any
const mockUnfavoriteBookList = booklistApi.unfavoriteBookList as any
const mockGetPopularTags = booklistApi.getPopularTags as any

// 辅助函数：等待所有Promise完成
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('BookListDetailView', () => {
  let router: any

  beforeEach(async () => {
    // 创建新的pinia实例
    const pinia = createPinia()
    setActivePinia(pinia)

    // 创建router
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/booklist/:id',
          name: 'booklist-detail',
          component: BookListDetailView,
        },
      ],
    })

    // 导航到测试路由
    await router.push('/booklist/booklist_123')

    vi.clearAllMocks()
    // 默认mock返回
    mockGetPopularTags.mockResolvedValue([])
  })

  describe('rendering', () => {
    it('should render loading state initially', async () => {
      // Arrange - 让API调用延迟返回，这样可以捕获loading状态
      let resolveApi: any
      mockGetBookListDetail.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveApi = resolve
          }),
      )

      // 先获取store实例，设置loading状态
      const store = useBooklistStore()

      // Act
      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待一个tick，让组件挂载和onMounted执行
      await flushPromises()

      // 检查loading状态
      expect(store.loading).toBe(true)
      expect(wrapper.find('.loading-state').exists()).toBe(true)

      // 清理：resolve API promise
      if (resolveApi) {
        resolveApi(createMockBooklist())
      }
    })

    it('should render booklist detail when data is loaded', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        id: 'booklist_123',
        title: '测试书单',
        description: '测试描述',
      })
      mockGetBookListDetail.mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待数据加载
      await flushPromises()
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('测试书单')
      expect(wrapper.text()).toContain('测试描述')
    })

    it('should render booklist tags', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        tags: ['玄幻', '仙侠', '都市'],
      })
      mockGetBookListDetail.mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待数据加载
      await flushPromises()
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('玄幻')
      expect(wrapper.text()).toContain('仙侠')
      expect(wrapper.text()).toContain('都市')
    })

    it('should render booklist stats', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        bookCount: 10,
        viewCount: 1000,
        likeCount: 50,
      } as any)
      mockGetBookListDetail.mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待数据加载
      await flushPromises()
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('1.0k')
      expect(wrapper.text()).toContain('50')
    })
  })

  describe('formatting functions', () => {
    it('should format numbers correctly', () => {
      // Arrange
      const mockBooklist = createMockBooklist()
      mockGetBookListDetail.mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // Act & Assert
      expect((wrapper.vm as any).formatNumber(1000)).toBe('1.0k')
      expect((wrapper.vm as any).formatNumber(10000)).toBe('1.0w')
      expect((wrapper.vm as any).formatNumber(100)).toBe('100')
    })

    it('should format dates correctly', () => {
      // Arrange
      const mockBooklist = createMockBooklist()
      mockGetBookListDetail.mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // Act & Assert
      const date = new Date('2024-01-01T00:00:00Z')
      const formatted = (wrapper.vm as any).formatDate(date)
      expect(formatted).toBeTruthy()
    })
  })

  describe('route params', () => {
    it('should fetch booklist detail based on route param id', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const mockBooklist = createMockBooklist({ id: booklistId })
      mockGetBookListDetail.mockResolvedValue(mockBooklist)

      mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待数据加载
      await flushPromises()

      // Assert
      expect(mockGetBookListDetail).toHaveBeenCalledWith(booklistId)
    })
  })

  describe('creator check', () => {
    it('should show edit button when user is creator', async () => {
      // Arrange
      const currentUserId = 'user_123'
      const mockBooklist = createMockBooklist({
        creatorId: currentUserId,
      })

      // 先设置user store
      const userStore = useUserStore()
      userStore.userInfo = { id: currentUserId } as any

      mockGetBookListDetail.mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待数据加载
      await flushPromises()
      await wrapper.vm.$nextTick()

      // Assert
      expect((wrapper.vm as any).isCreator).toBe(true)
    })

    it('should not show edit button when user is not creator', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        creatorId: 'user_456',
      })
      mockGetBookListDetail.mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 设置user store为一个不同的用户
      const userStore = useUserStore()
      userStore.userInfo = { id: 'user_789' } as any

      // 等待数据加载
      await flushPromises()
      await wrapper.vm.$nextTick()

      // Assert
      expect((wrapper.vm as any).isCreator).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle invalid booklist id', async () => {
      // Arrange - 需要创建新的路由
      const invalidId = 'invalid-id'
      await router.push(`/booklist/${invalidId}`)

      const error = new Error('Booklist not found')
      mockGetBookListDetail.mockRejectedValue(error)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待数据加载和错误处理
      await flushPromises()
      await wrapper.vm.$nextTick()

      // Assert
      const store = useBooklistStore()
      expect(store.error).toBeInstanceOf(Error)
      expect(store.error?.message).toContain('Booklist not found')
    })

    it('should handle fetch error gracefully', async () => {
      // Arrange
      const error = new Error('Network error')
      mockGetBookListDetail.mockRejectedValue(error)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待数据加载和错误处理
      await flushPromises()
      await wrapper.vm.$nextTick()

      // Assert
      const store = useBooklistStore()
      expect(store.error).toBeInstanceOf(Error)
      expect(store.error?.message).toContain('Network error')
      expect(store.loading).toBe(false)
    })
  })

  describe('interactions', () => {
    it('should handle favorite button click', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        id: 'booklist_123',
        isLiked: false,
      } as any)
      mockGetBookListDetail.mockResolvedValue(mockBooklist)
      mockFavoriteBookList.mockResolvedValue({ success: true })

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待数据加载
      await flushPromises()
      await wrapper.vm.$nextTick()

      // 获取store实例并spy方法
      const store = useBooklistStore()
      const favoriteSpy = vi.spyOn(store, 'favoriteBooklist')

      // Act - 模拟点击收藏按钮
      const favoriteButton = wrapper.findAll('.qy-button').find((btn) => btn.text() === '收藏')
      if (favoriteButton) {
        await favoriteButton.trigger('click')
        await wrapper.vm.$nextTick()
      }

      // Assert
      expect(favoriteSpy).toHaveBeenCalledWith('booklist_123')
    })

    it('should handle unfavorite button click', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        id: 'booklist_123',
        isLiked: true,
      } as any)
      mockGetBookListDetail.mockResolvedValue(mockBooklist)
      mockUnfavoriteBookList.mockResolvedValue({ success: true })

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [router],
        },
      })

      // 等待数据加载
      await flushPromises()
      await wrapper.vm.$nextTick()

      // 获取store实例并spy方法
      const store = useBooklistStore()
      const unfavoriteSpy = vi.spyOn(store, 'unfavoriteBooklist')

      // Act - 模拟点击取消收藏按钮
      const unfavoriteButton = wrapper.findAll('.qy-button').find((btn) => btn.text() === '已收藏')
      if (unfavoriteButton) {
        await unfavoriteButton.trigger('click')
        await wrapper.vm.$nextTick()
      }

      // Assert
      expect(unfavoriteSpy).toHaveBeenCalledWith('booklist_123')
    })
  })
})
