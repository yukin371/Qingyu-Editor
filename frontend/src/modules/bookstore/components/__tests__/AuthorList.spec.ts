import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthorList from '../AuthorList.vue'
import AuthorCard from '../AuthorCard.vue'

// Mock AuthorCard组件
vi.mock('../AuthorCard.vue', () => ({
  default: {
    name: 'AuthorCard',
    props: ['author'],
    emits: ['click'],
    template: '<div class="mock-author-card" @click="$emit(\'click\', author)">{{ author.name }}</div>'
  }
}))

describe('AuthorList', () => {
  const mockAuthors = [
    {
      id: 'author-1',
      name: '唐家三少',
      avatar: 'https://example.com/avatar1.jpg',
      bio: '起点白金作家',
      book_count: 15,
      total_words: 20000000,
      follower_count: 500000
    },
    {
      id: 'author-2',
      name: '我吃西红柿',
      avatar: 'https://example.com/avatar2.jpg',
      bio: '起点白金作家',
      book_count: 12,
      total_words: 18000000,
      follower_count: 450000
    }
  ]

  it('should render author cards when authors exist', () => {
    const wrapper = mount(AuthorList, {
      props: {
        authors: mockAuthors,
        isLoading: false,
        hasMore: false
      },
      global: {
        components: {
          AuthorCard
        }
      }
    })

    expect(wrapper.findAll('.mock-author-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('唐家三少')
    expect(wrapper.text()).toContain('我吃西红柿')
  })

  it('should show empty state when no authors and not loading', () => {
    const wrapper = mount(AuthorList, {
      props: {
        authors: [],
        isLoading: false,
        hasMore: false
      },
      global: {
        components: {
          AuthorCard
        }
      }
    })

    expect(wrapper.text()).toContain('暂无搜索结果')
  })

  it('should show loading state when loading', () => {
    const wrapper = mount(AuthorList, {
      props: {
        authors: [],
        isLoading: true,
        hasMore: false
      },
      global: {
        components: {
          AuthorCard
        }
      }
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('加载中...')
  })

  it('should show load more button when hasMore is true', () => {
    const wrapper = mount(AuthorList, {
      props: {
        authors: mockAuthors,
        isLoading: false,
        hasMore: true
      },
      global: {
        components: {
          AuthorCard
        }
      }
    })

    expect(wrapper.find('.load-more').exists()).toBe(true)
    expect(wrapper.text()).toContain('加载更多')
  })

  it('should emit load-more event when load more button clicked', async () => {
    const wrapper = mount(AuthorList, {
      props: {
        authors: mockAuthors,
        isLoading: false,
        hasMore: true
      },
      global: {
        components: {
          AuthorCard
        }
      }
    })

    await wrapper.find('.load-more button').trigger('click')
    expect(wrapper.emitted('load-more')).toBeTruthy()
  })

  it('should emit authorClick event when author card clicked', async () => {
    const wrapper = mount(AuthorList, {
      props: {
        authors: mockAuthors,
        isLoading: false,
        hasMore: false
      },
      global: {
        components: {
          AuthorCard
        }
      }
    })

    const authorCards = wrapper.findAll('.mock-author-card')
    await authorCards[0].trigger('click')

    expect(wrapper.emitted('authorClick')).toBeTruthy()
    expect(wrapper.emitted('authorClick')![0]).toEqual([mockAuthors[0]])
  })

  it('should apply grid layout correctly', () => {
    const wrapper = mount(AuthorList, {
      props: {
        authors: mockAuthors,
        isLoading: false,
        hasMore: false
      },
      global: {
        components: {
          AuthorCard
        }
      }
    })

    const grid = wrapper.find('.author-grid')
    expect(grid.exists()).toBe(true)
  })
})
