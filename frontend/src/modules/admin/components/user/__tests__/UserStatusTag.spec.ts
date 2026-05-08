import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserStatusTag from '../UserStatusTag.vue'

describe('UserStatusTag', () => {
  it('renders correctly with active status', () => {
    const wrapper = mount(UserStatusTag, {
      props: { status: 'active' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('正常')
    expect(wrapper.find('.status-tag.active').exists()).toBe(true)
  })

  it('renders correctly with inactive status', () => {
    const wrapper = mount(UserStatusTag, {
      props: { status: 'inactive' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('未激活')
    expect(wrapper.find('.status-tag.inactive').exists()).toBe(true)
  })

  it('renders correctly with banned status', () => {
    const wrapper = mount(UserStatusTag, {
      props: { status: 'banned' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('已封禁')
    expect(wrapper.find('.status-tag.banned').exists()).toBe(true)
  })
})
