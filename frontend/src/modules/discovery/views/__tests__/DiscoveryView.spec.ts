import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DiscoveryView from '../DiscoveryView.vue'

const createWrapper = () =>
  mount(DiscoveryView, {
    global: {
      stubs: {
        ElTabs: {
          name: 'ElTabs',
          props: ['modelValue'],
          template: '<div class="el-tabs-stub" :data-active-tab="modelValue"><slot /></div>',
        },
        ElTabPane: {
          name: 'ElTabPane',
          props: ['label', 'name'],
          template:
            '<section class="el-tab-pane-stub" :data-name="name"><span class="tab-label">{{ label }}</span><slot /></section>',
        },
        DiscussionFeed: {
          name: 'DiscussionFeed',
          template: '<div class="discussion-feed-stub" />',
        },
        BooklistFeed: {
          name: 'BooklistFeed',
          template: '<div class="booklist-feed-stub" />',
        },
        DiscoveryFeed: {
          name: 'DiscoveryFeed',
          template: '<div class="discovery-feed-stub" />',
        },
      },
    },
  })

describe('DiscoveryView', () => {
  it('renders the current page shell', () => {
    const wrapper = createWrapper()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('discovery-view')
    expect(wrapper.find('.container').exists()).toBe(true)
    expect(wrapper.find('.tabs-section').exists()).toBe(true)
  })

  it('uses discussion as the default active tab', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.el-tabs-stub').attributes('data-active-tab')).toBe('discussion')
  })

  it('renders the three discovery tabs and their feeds', () => {
    const wrapper = createWrapper()

    const panes = wrapper.findAll('.el-tab-pane-stub')
    const labels = panes.map((pane) => pane.find('.tab-label').text())

    expect(labels).toEqual(['讨论', '书单', '发现'])
    expect(wrapper.find('.discussion-feed-stub').exists()).toBe(true)
    expect(wrapper.find('.booklist-feed-stub').exists()).toBe(true)
    expect(wrapper.find('.discovery-feed-stub').exists()).toBe(true)
  })
})
