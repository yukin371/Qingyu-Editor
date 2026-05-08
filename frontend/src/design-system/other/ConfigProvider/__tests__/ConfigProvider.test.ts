/**
 * ConfigProvider 组件单元测试
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { inject } from 'vue'
import ConfigProvider from '../ConfigProvider.vue'
import { CONFIG_PROVIDER_KEY } from '../types'

// 创建测试子组件，用于验证 provide/inject
const TestChild = {
  template: '<div class="test-child">Test Child</div>',
  setup() {
    const config = inject(CONFIG_PROVIDER_KEY)
    return { config }
  },
}

describe('ConfigProvider 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(ConfigProvider)
      expect(wrapper.exists()).toBe(true)
    })

    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(ConfigProvider, {
        slots: {
          default: '<div class="test-content">Test Content</div>',
        },
      })
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Content')
    })

    it('应该渲染子组件', () => {
      const wrapper = mount(ConfigProvider, {
        global: {
          components: { TestChild },
        },
        slots: {
          default: '<TestChild />',
        },
      })
      expect(wrapper.find('.test-child').exists()).toBe(true)
    })
  })

  describe('Props - size', () => {
    it('应该正确设置 size 为 small', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          size: 'small',
        },
      })
      expect(wrapper.props('size')).toBe('small')
    })

    it('应该正确设置 size 为 medium', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          size: 'medium',
        },
      })
      expect(wrapper.props('size')).toBe('medium')
    })

    it('应该正确设置 size 为 large', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          size: 'large',
        },
      })
      expect(wrapper.props('size')).toBe('large')
    })

    it('应该使用默认 size 值 medium', () => {
      const wrapper = mount(ConfigProvider)
      expect(wrapper.props('size')).toBe('medium')
    })
  })

  describe('Props - namespace', () => {
    it('应该正确设置 namespace', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          namespace: 'custom',
        },
      })
      expect(wrapper.props('namespace')).toBe('custom')
    })

    it('应该使用默认 namespace 值 qy', () => {
      const wrapper = mount(ConfigProvider)
      expect(wrapper.props('namespace')).toBe('qy')
    })
  })

  describe('Props - locale', () => {
    it('应该正确设置 locale', () => {
      const testLocale = {
        confirm: '确认',
        cancel: '取消',
      }
      const wrapper = mount(ConfigProvider, {
        props: {
          locale: testLocale,
        },
      })
      expect(wrapper.props('locale')).toEqual(testLocale)
    })

    it('locale 默认值应该为 undefined', () => {
      const wrapper = mount(ConfigProvider)
      expect(wrapper.props('locale')).toBeUndefined()
    })
  })

  describe('Props - direction', () => {
    it('应该正确设置 direction 为 ltr', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          direction: 'ltr',
        },
      })
      expect(wrapper.props('direction')).toBe('ltr')
    })

    it('应该正确设置 direction 为 rtl', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          direction: 'rtl',
        },
      })
      expect(wrapper.props('direction')).toBe('rtl')
    })

    it('应该使用默认 direction 值 ltr', () => {
      const wrapper = mount(ConfigProvider)
      expect(wrapper.props('direction')).toBe('ltr')
    })
  })

  describe('Props - button', () => {
    it('应该正确设置 button 配置', () => {
      const buttonConfig = {
        size: 'large' as const,
        variant: 'outline' as const,
      }
      const wrapper = mount(ConfigProvider, {
        props: {
          button: buttonConfig,
        },
      })
      expect(wrapper.props('button')).toEqual(buttonConfig)
    })

    it('应该使用默认 button 配置', () => {
      const wrapper = mount(ConfigProvider)
      expect(wrapper.props('button')).toEqual({
        size: 'medium',
        variant: 'solid',
      })
    })
  })

  describe('Props - zIndex', () => {
    it('应该正确设置 zIndex 配置', () => {
      const zIndexConfig = {
        base: 2000,
        dropdown: 2050,
        popover: 2060,
        dialog: 2070,
        notification: 2080,
        message: 2090,
      }
      const wrapper = mount(ConfigProvider, {
        props: {
          zIndex: zIndexConfig,
        },
      })
      expect(wrapper.props('zIndex')).toEqual(zIndexConfig)
    })

    it('应该使用默认 zIndex 配置', () => {
      const wrapper = mount(ConfigProvider)
      expect(wrapper.props('zIndex')).toEqual({
        base: 1000,
        dropdown: 1050,
        popover: 1060,
        dialog: 1070,
        notification: 1080,
        message: 1090,
      })
    })
  })

  describe('Provide/Inject', () => {
    it('应该向子组件提供配置上下文', () => {
      let injectedConfig: any = null

      const TestReceiver = {
        template: '<div class="receiver">Receiver</div>',
        setup() {
          injectedConfig = inject(CONFIG_PROVIDER_KEY)
          return {}
        },
      }

      mount(ConfigProvider, {
        props: {
          size: 'large',
          namespace: 'test',
        },
        slots: {
          default: TestReceiver,
        },
      })

      expect(injectedConfig).toBeDefined()
      expect(injectedConfig!.size).toBe('large')
      expect(injectedConfig!.namespace).toBe('test')
    })

    it('子组件应该能够注入配置', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          size: 'small',
          direction: 'rtl',
        },
        global: {
          components: { TestChild },
        },
        slots: {
          default: TestChild,
        },
      })

      const childWrapper = wrapper.findComponent(TestChild)
      expect(childWrapper.vm.config).toBeDefined()
      expect(childWrapper.vm.config.size).toBe('small')
      expect(childWrapper.vm.config.direction).toBe('rtl')
    })

    it('应该提供完整的配置上下文', () => {
      let injectedConfig: any = null

      const TestReceiver = {
        template: '<div>Receiver</div>',
        setup() {
          injectedConfig = inject(CONFIG_PROVIDER_KEY)
          return {}
        },
      }

      mount(ConfigProvider, {
        props: {
          size: 'large',
          namespace: 'myapp',
          direction: 'rtl',
        },
        slots: {
          default: TestReceiver,
        },
      })

      const config = injectedConfig
      expect(config).toHaveProperty('size', 'large')
      expect(config).toHaveProperty('namespace', 'myapp')
      expect(config).toHaveProperty('direction', 'rtl')
      expect(config).toHaveProperty('button')
      expect(config).toHaveProperty('zIndex')
    })

    it('配置上下文应该包含所有 props', () => {
      const testLocale = { confirm: '确认' }
      const zIndexConfig = { base: 2000 }

      let injectedConfig: any = null

      const TestReceiver = {
        template: '<div>Receiver</div>',
        setup() {
          injectedConfig = inject(CONFIG_PROVIDER_KEY)
          return {}
        },
      }

      mount(ConfigProvider, {
        props: {
          size: 'small',
          namespace: 'test',
          locale: testLocale,
          direction: 'rtl',
          zIndex: zIndexConfig,
        },
        slots: {
          default: TestReceiver,
        },
      })

      expect(injectedConfig).toBeDefined()
      expect(injectedConfig!.size).toBe('small')
      expect(injectedConfig!.namespace).toBe('test')
      expect(injectedConfig!.locale).toEqual(testLocale)
      expect(injectedConfig!.direction).toBe('rtl')
      expect(injectedConfig!.zIndex).toEqual(zIndexConfig)
    })
  })

  describe('嵌套配置', () => {
    it('应该支持嵌套使用', () => {
      const wrapper = mount(
        {
          template: `
            <ConfigProvider size="small">
              <ConfigProvider size="large">
                <div class="inner">Inner Content</div>
              </ConfigProvider>
            </ConfigProvider>
          `,
          components: { ConfigProvider },
        },
        { global: { components: { ConfigProvider } } }
      )

      expect(wrapper.find('.inner').exists()).toBe(true)
    })

    it('嵌套配置应该正确工作', () => {
      const wrapper = mount(
        {
          template: `
            <ConfigProvider size="small">
              <div class="sibling1">Sibling 1</div>
              <ConfigProvider size="large">
                <div class="child">Child</div>
              </ConfigProvider>
              <div class="sibling2">Sibling 2</div>
            </ConfigProvider>
          `,
          components: { ConfigProvider },
        },
        { global: { components: { ConfigProvider } } }
      )

      expect(wrapper.find('.sibling1').exists()).toBe(true)
      expect(wrapper.find('.child').exists()).toBe(true)
      expect(wrapper.find('.sibling2').exists()).toBe(true)
    })

    it('多层嵌套应该正确渲染', () => {
      const wrapper = mount(
        {
          template: `
            <ConfigProvider namespace="outer">
              <ConfigProvider namespace="middle">
                <ConfigProvider namespace="inner">
                  <div class="deep">Deep Content</div>
                </ConfigProvider>
              </ConfigProvider>
            </ConfigProvider>
          `,
          components: { ConfigProvider },
        },
        { global: { components: { ConfigProvider } } }
      )

      expect(wrapper.find('.deep').exists()).toBe(true)
    })
  })

  describe('插槽', () => {
    it('应该正确渲染默认插槽', () => {
      const wrapper = mount(ConfigProvider, {
        slots: {
          default: '<div class="slot-content">Slot Content</div>',
        },
      })
      expect(wrapper.find('.slot-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Slot Content')
    })

    it('应该支持多个子组件', () => {
      const wrapper = mount(ConfigProvider, {
        slots: {
          default: `
            <div class="child1">Child 1</div>
            <div class="child2">Child 2</div>
            <div class="child3">Child 3</div>
          `,
        },
      })
      expect(wrapper.find('.child1').exists()).toBe(true)
      expect(wrapper.find('.child2').exists()).toBe(true)
      expect(wrapper.find('.child3').exists()).toBe(true)
    })

    it('应该支持嵌套组件', () => {
      const wrapper = mount(ConfigProvider, {
        slots: {
          default: `
            <div class="parent">
              <div class="child">Child Content</div>
            </div>
          `,
        },
      })
      expect(wrapper.find('.parent').exists()).toBe(true)
      expect(wrapper.find('.child').exists()).toBe(true)
    })
  })

  describe('Props 响应式更新', () => {
    it('更新 size prop 应该成功', async () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          size: 'small',
        },
      })

      expect(wrapper.props('size')).toBe('small')

      await wrapper.setProps({ size: 'large' })
      expect(wrapper.props('size')).toBe('large')
    })

    it('更新 namespace prop 应该成功', async () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          namespace: 'old',
        },
      })

      expect(wrapper.props('namespace')).toBe('old')

      await wrapper.setProps({ namespace: 'new' })
      expect(wrapper.props('namespace')).toBe('new')
    })

    it('更新 direction prop 应该成功', async () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          direction: 'ltr',
        },
      })

      expect(wrapper.props('direction')).toBe('ltr')

      await wrapper.setProps({ direction: 'rtl' })
      expect(wrapper.props('direction')).toBe('rtl')
    })

    it('更新 locale prop 应该成功', async () => {
      const oldLocale = { confirm: '确认' }
      const newLocale = { confirm: 'Confirm' }

      const wrapper = mount(ConfigProvider, {
        props: {
          locale: oldLocale,
        },
      })

      expect(wrapper.props('locale')).toEqual(oldLocale)

      await wrapper.setProps({ locale: newLocale })
      expect(wrapper.props('locale')).toEqual(newLocale)
    })

    it('更新 button prop 应该成功', async () => {
      const oldButton = { size: 'small' as const, variant: 'solid' as const }
      const newButton = { size: 'large' as const, variant: 'ghost' as const }

      const wrapper = mount(ConfigProvider, {
        props: {
          button: oldButton,
        },
      })

      expect(wrapper.props('button')).toEqual(oldButton)

      await wrapper.setProps({ button: newButton })
      expect(wrapper.props('button')).toEqual(newButton)
    })

    it('更新 zIndex prop 应该成功', async () => {
      const oldZIndex = { base: 1000 }
      const newZIndex = { base: 2000 }

      const wrapper = mount(ConfigProvider, {
        props: {
          zIndex: oldZIndex,
        },
      })

      expect(wrapper.props('zIndex').base).toBe(1000)

      await wrapper.setProps({ zIndex: newZIndex })
      expect(wrapper.props('zIndex').base).toBe(2000)
    })
  })

  describe('边缘情况', () => {
    it('空 locale 对象应该正常工作', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          locale: {},
        },
      })
      expect(wrapper.props('locale')).toEqual({})
    })

    it('undefined props 应该使用默认值', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          size: undefined,
          namespace: undefined,
        },
      })
      expect(wrapper.props('size')).toBe('medium')
      expect(wrapper.props('namespace')).toBe('qy')
    })

    it('没有插槽内容应该正常渲染', () => {
      const wrapper = mount(ConfigProvider)
      expect(wrapper.exists()).toBe(true)
    })

    it('空插槽应该正常工作', () => {
      const wrapper = mount(ConfigProvider, {
        slots: {
          default: '',
        },
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Props 类型验证', () => {
    it('size 应该只接受有效值', () => {
      const validSizes = ['small', 'medium', 'large']
      validSizes.forEach(size => {
        const wrapper = mount(ConfigProvider, {
          props: { size },
        })
        expect(wrapper.props('size')).toBe(size)
      })
    })

    it('direction 应该只接受有效值', () => {
      const validDirections = ['ltr', 'rtl']
      validDirections.forEach(direction => {
        const wrapper = mount(ConfigProvider, {
          props: { direction },
        })
        expect(wrapper.props('direction')).toBe(direction)
      })
    })

    it('namespace 应该接受字符串值', () => {
      const wrapper = mount(ConfigProvider, {
        props: {
          namespace: 'custom-namespace',
        },
      })
      expect(wrapper.props('namespace')).toBe('custom-namespace')
    })
  })
})
