/**
 * BackTop 组件单元测试
 *
 * 测试 BackTop 返回顶部组件的 props 和逻辑
 */

import { mount } from '@vue/test-utils'
import BackTop from './BackTop.vue'

describe('BackTop 组件', () => {
  let wrapper: any

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Props 定义', () => {
    it('应该接受 visibilityHeight prop', () => {
      wrapper = mount(BackTop, {
        props: { visibilityHeight: 400 },
      })
      expect(wrapper.props().visibilityHeight).toBe(400)
    })

    it('应该接受 backPosition prop', () => {
      wrapper = mount(BackTop, {
        props: { backPosition: 100 },
      })
      expect(wrapper.props().backPosition).toBe(100)
    })

    it('应该接受 duration prop', () => {
      wrapper = mount(BackTop, {
        props: { duration: 500 },
      })
      expect(wrapper.props().duration).toBe(500)
    })

    it('应该接受 shape prop 默认值为 circle', () => {
      wrapper = mount(BackTop)
      expect(wrapper.props().shape).toBe('circle')
    })

    it('应该接受 size prop 默认值为 medium', () => {
      wrapper = mount(BackTop)
      expect(wrapper.props().size).toBe('medium')
    })

    it('应该接受 position prop 默认值为 bottom-right', () => {
      wrapper = mount(BackTop)
      expect(wrapper.props().position).toBe('bottom-right')
    })

    it('应该接受 class prop', () => {
      wrapper = mount(BackTop, {
        props: { class: 'custom-class' },
      })
      expect(wrapper.props().class).toBe('custom-class')
    })
  })

  describe('Props 变体', () => {
    it('shape 可以设置为 square', () => {
      wrapper = mount(BackTop, {
        props: { shape: 'square' },
      })
      expect(wrapper.props().shape).toBe('square')
    })

    it('size 可以设置为 small', () => {
      wrapper = mount(BackTop, {
        props: { size: 'small' },
      })
      expect(wrapper.props().size).toBe('small')
    })

    it('size 可以设置为 large', () => {
      wrapper = mount(BackTop, {
        props: { size: 'large' },
      })
      expect(wrapper.props().size).toBe('large')
    })

    it('position 可以设置为 top-right', () => {
      wrapper = mount(BackTop, {
        props: { position: 'top-right' },
      })
      expect(wrapper.props().position).toBe('top-right')
    })

    it('position 可以设置为 top-left', () => {
      wrapper = mount(BackTop, {
        props: { position: 'top-left' },
      })
      expect(wrapper.props().position).toBe('top-left')
    })

    it('position 可以设置为 bottom-left', () => {
      wrapper = mount(BackTop, {
        props: { position: 'bottom-left' },
      })
      expect(wrapper.props().position).toBe('bottom-left')
    })
  })

  describe('其他配置', () => {
    it('smooth 默认为 true', () => {
      wrapper = mount(BackTop)
      expect(wrapper.props().smooth).toBe(true)
    })

    it('autoHide 默认为 false', () => {
      wrapper = mount(BackTop)
      expect(wrapper.props().autoHide).toBe(false)
    })

    it('showProgress 默认为 false', () => {
      wrapper = mount(BackTop)
      expect(wrapper.props().showProgress).toBe(false)
    })
  })
})
