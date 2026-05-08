import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthorCard from '../AuthorCard.vue'

describe('AuthorCard', () => {
  const mockAuthor = {
    id: 'author-1',
    name: '唐家三少',
    avatar: 'https://example.com/avatar.jpg',
    bio: '起点白金作家，代表作《斗罗大陆》系列',
    book_count: 15,
    total_words: 20000000,
    follower_count: 500000
  }

  it('should render author information', () => {
    const wrapper = mount(AuthorCard, {
      props: { author: mockAuthor }
    })

    expect(wrapper.text()).toContain('唐家三少')
    expect(wrapper.text()).toContain('15 作品')
  })

  it('should format large numbers', () => {
    const wrapper = mount(AuthorCard, {
      props: { author: mockAuthor }
    })

    expect(wrapper.text()).toContain('2000.0万')
    expect(wrapper.text()).toContain('50.0万')
  })

  it('should emit click event when clicked', async () => {
    const wrapper = mount(AuthorCard, {
      props: { author: mockAuthor }
    })

    await wrapper.find('.author-card').trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')![0]).toEqual([mockAuthor])
  })
})
