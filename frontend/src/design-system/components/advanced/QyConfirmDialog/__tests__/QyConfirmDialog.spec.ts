/**
 * QyConfirmDialog 组件单元测试
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import QyConfirmDialog from '../QyConfirmDialog.vue'
import QyModal from '../../QyModal/QyModal.vue'

vi.mock('../../QyModal/QyModal.vue', () => ({
  default: {
    name: 'QyModal',
    template:
      '<div v-if="visible" class="qy-modal"><slot name="header"></slot><slot></slot><slot name="footer"></slot></div>',
    props: ['visible', 'width', 'closable', 'maskClosable'],
  },
}))

const mountDialog = (props: Record<string, unknown> = {}) =>
  mount(QyConfirmDialog, {
    props,
    global: {
      stubs: {
        QyIcon: true,
        'el-button': {
          name: 'ElButton',
          props: ['type', 'size', 'loading'],
          template:
            '<button class="el-button-stub" :data-type="type" :data-size="size" :data-loading="String(loading)" :disabled="loading" @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  })

describe('QyConfirmDialog', () => {
  it('应该正确渲染基础确认对话框', () => {
    const wrapper = mountDialog({
      visible: true,
      title: '确认操作',
      message: '确定要执行此操作吗？',
    })

    expect(wrapper.find('.qy-confirm-dialog__title').text()).toBe('确认操作')
    expect(wrapper.find('.qy-confirm-dialog__message').text()).toBe('确定要执行此操作吗？')
  })

  it('应该根据类型显示不同的图标样式', () => {
    const types = ['warning', 'danger', 'info', 'success'] as const

    types.forEach((type) => {
      const wrapper = mountDialog({
        visible: true,
        type,
      })

      expect(wrapper.find(`.qy-confirm-dialog__icon--${type}`).exists()).toBe(true)
    })
  })

  it('应该显示详细信息列表', () => {
    const details = [
      { label: '金额', value: '¥100.00' },
      { label: '支付方式', value: '支付宝' },
    ]

    const wrapper = mountDialog({
      visible: true,
      details,
    })

    const detailItems = wrapper.findAll('.detail-item')
    expect(detailItems).toHaveLength(2)
    expect(detailItems[0].text()).toContain('金额')
    expect(detailItems[0].text()).toContain('¥100.00')
    expect(detailItems[1].text()).toContain('支付方式')
    expect(detailItems[1].text()).toContain('支付宝')
  })

  it('应该能够隐藏图标', () => {
    const wrapper = mountDialog({
      visible: true,
      showIcon: false,
    })

    expect(wrapper.find('.qy-confirm-dialog__icon').exists()).toBe(false)
  })

  it('应该能够自定义按钮文本', () => {
    const wrapper = mountDialog({
      visible: true,
      confirmText: '确定',
      cancelText: '返回',
    })

    const buttons = wrapper.findAll('.qy-confirm-dialog__footer button')
    expect(buttons[0].text()).toBe('返回')
    expect(buttons[1].text()).toBe('确定')
  })

  it('应该在加载状态时禁用确认按钮', async () => {
    const wrapper = mountDialog({
      visible: true,
      loading: true,
    })

    const confirmButton = wrapper.findAll('.qy-confirm-dialog__footer button')[1]
    expect(confirmButton.attributes('disabled')).toBeDefined()
    expect(confirmButton.attributes('data-loading')).toBe('true')
  })

  it('点击确认按钮应该触发confirm事件', async () => {
    const wrapper = mountDialog({
      visible: true,
    })

    const confirmButton = wrapper.findAll('.qy-confirm-dialog__footer button')[1]
    await confirmButton.trigger('click')

    expect((wrapper as any).emitted('confirm')).toBeTruthy()
  })

  it('点击取消按钮应该触发cancel事件并关闭对话框', async () => {
    const wrapper = mountDialog({
      visible: true,
    })

    const cancelButton = wrapper.findAll('.qy-confirm-dialog__footer button')[0]
    await cancelButton.trigger('click')

    expect((wrapper as any).emitted('cancel')).toBeTruthy()
    expect((wrapper as any).emitted('update:visible')).toBeTruthy()
    expect((wrapper as any).emitted('update:visible')?.[0]).toEqual([false])
  })

  it('危险类型应该使用危险样式按钮', () => {
    const wrapper = mountDialog({
      visible: true,
      type: 'danger',
    })

    // 验证confirmButtonType计算属性
    expect((wrapper.vm as any).confirmButtonType).toBe('danger')
  })

  it('警告类型应该使用主色调按钮', () => {
    const wrapper = mountDialog({
      visible: true,
      type: 'warning',
    })

    expect((wrapper.vm as any).confirmButtonType).toBe('primary')
  })

  it('应该支持不同的尺寸', () => {
    const sizes = ['large', 'default', 'small'] as const

    sizes.forEach((size) => {
      const wrapper = mountDialog({
        visible: true,
        size,
      })

      const buttons = wrapper.findAll('.qy-confirm-dialog__footer button')
      buttons.forEach((button) => {
        expect(button.attributes('data-size')).toBe(size)
      })
    })
  })

  it('应该在visible为false时不渲染对话框', () => {
    const wrapper = mountDialog({
      visible: false,
    })

    expect(wrapper.find('.qy-modal').exists()).toBe(false)
  })

  it('应该支持自定义宽度', () => {
    const wrapper = mountDialog({
      visible: true,
      width: '600px',
    })

    // 验证width属性传递给QyModal
    const modal = (wrapper as any).findComponent(QyModal)
    expect(modal.props('width')).toBe('600px')
  })
})
