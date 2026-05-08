import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserRoleTag from '../UserRoleTag.vue'

describe('UserRoleTag', () => {
  it('renders correctly with admin role', () => {
    const wrapper = mount(UserRoleTag, {
      props: { role: 'admin' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('管理员')
    expect(wrapper.find('.role-tag.admin').exists()).toBe(true)
  })

  it('renders correctly with author role', () => {
    const wrapper = mount(UserRoleTag, {
      props: { role: 'author' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('作者')
    expect(wrapper.find('.role-tag.author').exists()).toBe(true)
  })

  it('renders correctly with reader role', () => {
    const wrapper = mount(UserRoleTag, {
      props: { role: 'reader' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('读者')
    expect(wrapper.find('.role-tag.reader').exists()).toBe(true)
  })
})
