/**
 * BooklistCard组件测试
 */

import { mount } from '@vue/test-utils'
import type { BookList } from '@/types/booklist'

// Mock设计系统组件 - 必须在导入组件之前
vi.mock('@/design-system/components', () => {
  const { h, defineComponent } = require('vue')

  const MockQyButton = defineComponent({
    name: 'QyButton',
    props: {
      variant: { type: String, default: 'default' },
      size: { type: String, default: 'medium' },
      disabled: { type: Boolean, default: false },
      loading: { type: Boolean, default: false },
      type: { type: String, default: 'button' },
    },
    emits: ['click'],
    setup(
      props: { variant: string; size: string; disabled: boolean; loading: boolean; type: string },
      { emit }: { emit: (event: string, ...args: unknown[]) => void },
    ) {
      const classes = ['qy-button', `qy-button--${props.variant}`, `qy-button--${props.size}`]
      if (props.disabled) classes.push('is-disabled')
      if (props.loading) classes.push('is-loading')

      return () =>
        h(
          'button',
          {
            class: classes,
            disabled: props.disabled,
            type: props.type,
            onClick: (e: Event) => emit('click', e),
          },
          ['默认按钮'],
        )
    },
  })

  const MockQyBadge = defineComponent({
    name: 'QyBadge',
    props: {
      variant: { type: String, default: 'default' },
      size: { type: String, default: 'medium' },
      closable: { type: Boolean, default: false },
    },
    emits: ['click', 'close'],
    setup(
      props: { variant: string; size: string; closable: boolean },
      {
        emit,
        slots,
      }: {
        emit: (event: string, ...args: unknown[]) => void
        slots: Record<string, (() => unknown) | undefined>
      },
    ) {
      const children = [slots.default ? slots.default() : '']
      if (props.closable) {
        children.push(
          h(
            'span',
            {
              class: 'close-btn',
              onClick: (e: Event) => {
                e.stopPropagation()
                emit('close')
              },
            },
            '×',
          ),
        )
      }
      return () =>
        h(
          'span',
          {
            class: ['qy-badge', `qy-badge--${props.variant}`, `qy-badge--${props.size}`],
            onClick: () => emit('click'),
          },
          children,
        )
    },
  })

  const MockQyAvatar = defineComponent({
    name: 'QyAvatar',
    props: {
      src: { type: String },
      name: { type: String, default: '' },
      size: { type: String, default: 'md' },
    },
    setup(props: { src?: string; name: string; size: string }) {
      return () =>
        h('div', { class: ['qy-avatar', `qy-avatar--${props.size}`] }, props.name || '头像')
    },
  })

  const MockQyIcon = defineComponent({
    name: 'QyIcon',
    props: {
      name: { type: String, required: true },
      size: { type: Number, default: 16 },
    },
    setup(props: { name: string; size: number }) {
      return () =>
        h('i', { class: `qy-icon qy-icon--${props.name}`, style: { fontSize: `${props.size}px` } })
    },
  })

  return {
    QyBadge: MockQyBadge,
    QyAvatar: MockQyAvatar,
    QyButton: MockQyButton,
    QyIcon: MockQyIcon,
  }
})

import BooklistCard from '../BooklistCard.vue'

// Helper function to create booklist with correct type
const createTestBooklist = (overrides: Record<string, unknown> = {}): BookList => {
  return {
    id: 'test-id',
    title: '测试书单',
    description: '这是一个测试书单的描述',
    cover: 'https://example.com/cover.jpg',
    creatorId: 'user_123',
    creator: {
      id: 'user_123',
      username: 'testuser',
      nickname: '测试用户',
      avatar: 'https://example.com/avatar.jpg',
    },
    books: [],
    bookCount: 10,
    viewCount: 1000,
    likeCount: 50,
    isLiked: false,
    isPublic: true,
    tags: ['玄幻', '仙侠', '都市', '历史'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  } as BookList
}

describe('BooklistCard', () => {
  const defaultProps = {
    booklist: createTestBooklist({
      title: '测试书单',
      description: '这是一个测试书单的描述',
      bookCount: 10,
      viewCount: 1000,
      likeCount: 50,
      isLiked: false,
      tags: ['玄幻', '仙侠', '都市', '历史'],
      creator: {
        id: 'user_123',
        username: 'testuser',
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.jpg',
      },
    }),
  }

  describe('rendering', () => {
    it('should render booklist card correctly', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: defaultProps.booklist,
        },
      })

      // Assert
      expect(wrapper.find('.booklist-card').exists()).toBe(true)
      expect(wrapper.text()).toContain('测试书单')
      expect(wrapper.text()).toContain('这是一个测试书单的描述')
      expect(wrapper.text()).toContain('测试用户')
    })

    it('should render cover image when cover exists', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            cover: 'https://example.com/cover.jpg',
          }),
        },
      })

      // Assert
      expect(wrapper.find('.cover-image').exists()).toBe(true)
      expect(wrapper.find('.cover-image').attributes('src')).toBe('https://example.com/cover.jpg')
    })

    it('should render cover placeholder when cover does not exist', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            cover: undefined,
          }),
        },
      })

      // Assert
      expect(wrapper.find('.cover-placeholder').exists()).toBe(true)
    })

    it('should render book count badge', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({ bookCount: 10 }),
        },
      })

      // Assert
      expect(wrapper.find('.book-count-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('10本')
    })

    it('should render tags', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            tags: ['玄幻', '仙侠', '都市', '历史'],
          }),
        },
      })

      // Assert
      expect(wrapper.find('.booklist-tags').exists()).toBe(true)
      expect(wrapper.text()).toContain('玄幻')
      expect(wrapper.text()).toContain('仙侠')
      expect(wrapper.text()).toContain('都市')
      expect(wrapper.text()).toContain('+1') // 超过3个标签显示+1
    })

    it('should render stats', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            viewCount: 1000,
            likeCount: 50,
          }),
        },
      })

      // Assert
      expect(wrapper.find('.booklist-stats').exists()).toBe(true)
      expect(wrapper.text()).toContain('1.0k') // 1000 格式化为 1.0k
      expect(wrapper.text()).toContain('50')
    })

    it('should render actions when showActions is true', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: defaultProps.booklist,
          showActions: true,
        },
      })

      // Assert
      expect(wrapper.find('.booklist-actions').exists()).toBe(true)
    })

    it('should not render actions when showActions is false', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: defaultProps.booklist,
          showActions: false,
        },
      })

      // Assert
      expect(wrapper.find('.booklist-actions').exists()).toBe(false)
    })

    it('should format large numbers correctly', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            viewCount: 15000,
            likeCount: 2500,
          }),
        },
      })

      // Assert
      expect(wrapper.text()).toContain('1.5w') // 15000 格式化为 1.5w
      expect(wrapper.text()).toContain('2.5k') // 2500 格式化为 2.5k
    })
  })

  describe('interactions', () => {
    it('should emit click event when card is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: defaultProps.booklist,
        },
      })

      // Act
      await wrapper.find('.booklist-card').trigger('click')

      // Assert
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0]).toEqual([defaultProps.booklist])
    })

    it('should emit favorite event when favorite button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: defaultProps.booklist,
          showActions: true,
        },
      })

      // Act
      const favoriteButton = wrapper.find('.booklist-actions .qy-button')
      await favoriteButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.emitted('favorite')).toBeTruthy()
      expect(wrapper.emitted('favorite')?.[0]).toEqual([defaultProps.booklist])
    })

    it('should stop propagation when favorite button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: defaultProps.booklist,
          showActions: true,
        },
      })

      // Act
      const favoriteButton = wrapper.find('.booklist-actions .qy-button')
      await favoriteButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      // click事件应该只触发favorite，不触发card的click
      expect(wrapper.emitted('click')).toBeFalsy()
      expect(wrapper.emitted('favorite')).toBeTruthy()
    })
  })

  describe('props', () => {
    it('should accept booklist prop', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: defaultProps.booklist,
        },
      })

      // Assert
      expect((wrapper.props() as any).booklist).toEqual(defaultProps.booklist)
    })

    it('should accept hoverable prop', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: defaultProps.booklist,
          hoverable: true,
        },
      })

      // Assert
      expect((wrapper.props() as any).hoverable).toBe(true)
      expect(wrapper.find('.is-hoverable').exists()).toBe(true)
    })

    it('should accept showActions prop', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: defaultProps.booklist,
          showActions: false,
        },
      })

      // Assert
      expect((wrapper.props() as any).showActions).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('should truncate description when it is too long', () => {
      // Arrange
      const longDescription =
        '这是一个非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长非常长的描述，用来测试截断功能是否正常工作，这个描述已经超过了六十个字符的限制'
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            description: longDescription,
          }),
        },
      })

      // Act & Assert - 检查描述段落的内容是否包含省略号
      const descElement = wrapper.find('.booklist-description')
      expect(descElement.text()).toContain('...')
      expect(descElement.text().length).toBeLessThan(longDescription.length)
    })

    it('should not truncate description when it is short', () => {
      // Arrange
      const shortDescription = '短描述'
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            description: shortDescription,
          }),
        },
      })

      // Act & Assert
      expect(wrapper.text()).not.toContain('...')
    })

    it('should display only first 3 tags', () => {
      // Arrange
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
          }),
        },
      })

      // Act & Assert
      const badges = wrapper.findAll('.qy-badge')
      expect(badges).toHaveLength(3)
      expect(wrapper.text()).toContain('+2')
    })
  })

  describe('edge cases', () => {
    it('should handle empty description', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            description: '',
          }),
        },
      })

      // Assert
      expect(wrapper.find('.booklist-description').exists()).toBe(true)
    })

    it('should handle no tags', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            tags: [],
          }),
        },
      })

      // Assert
      expect(wrapper.find('.booklist-tags').exists()).toBe(false)
    })

    it('should handle missing creator', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            creator: undefined,
          }),
        },
      })

      // Assert
      expect(wrapper.find('.creator-info').exists()).toBe(true)
    })

    it('should handle zero stats', () => {
      // Act
      const wrapper = mount(BooklistCard, {
        props: {
          booklist: createTestBooklist({
            viewCount: 0,
            likeCount: 0,
          }),
        },
      })

      // Assert
      expect(wrapper.text()).toContain('0')
    })
  })
})
